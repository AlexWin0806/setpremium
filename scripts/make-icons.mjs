// Generates the app icons (PNG + SVG) from the card shapes in js/shapes.js.
//   node scripts/make-icons.mjs
// No dependencies: a tiny scanline rasteriser and PNG encoder live below.
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { SHAPES } from '../js/shapes.js';

const OUT = new URL('../icons/', import.meta.url);
const BG = '#1f1f23';
const CARD = '#ffffff';
const COLORS = ['#f5424b', '#1fc46a', '#b05ce6'];

// A landscape card holding one solid diamond, squiggle and oval, in the same
// units as js/cards.js (300 × 200 card, shapes 76 apart).
function design(scale) {
  const cardW = 0.74 * scale;
  const k = cardW / 300; // card units -> icon units (icon is 1 × 1)
  const x0 = 0.5 - cardW / 2;
  const y0 = 0.5 - (200 * k) / 2;
  const toIcon = ([x, y]) => [x0 + x * k, y0 + y * k];

  const layers = [{ color: CARD, polys: roundedRect(300, 200, 22).map((p) => p.map(toIcon)) }];
  SHAPES.forEach((d, i) => {
    const cx = 150 + (i - 1) * 76;
    // Rotate the horizontal shape a quarter turn and centre it on the card.
    const place = ([x, y]) => toIcon([cx - y, 100 + x]);
    layers.push({ color: COLORS[i], polys: flatten(d).map((p) => p.map(place)) });
  });
  return layers;
}

function roundedRect(w, h, r) {
  const c = r * 0.5523;
  return flatten(
    `M ${r} 0 L ${w - r} 0 C ${w - r + c} 0 ${w} ${r - c} ${w} ${r} L ${w} ${h - r} ` +
      `C ${w} ${h - r + c} ${w - r + c} ${h} ${w - r} ${h} L ${r} ${h} C ${r - c} ${h} 0 ${h - r + c} 0 ${h - r} ` +
      `L 0 ${r} C 0 ${r - c} ${r - c} 0 ${r} 0 Z`,
  );
}

// Path data (M/L/C/Z, absolute) -> list of polygons.
function flatten(d) {
  const tokens = d.match(/[MLCZ]|-?\d*\.?\d+/g);
  const polys = [];
  let poly = null;
  let cmd = null;
  for (let i = 0; i < tokens.length; ) {
    if (/[MLCZ]/.test(tokens[i])) cmd = tokens[i++];
    const num = () => Number(tokens[i++]);
    if (cmd === 'M') {
      poly = [[num(), num()]];
      polys.push(poly);
    } else if (cmd === 'L') {
      poly.push([num(), num()]);
    } else if (cmd === 'C') {
      const p0 = poly[poly.length - 1];
      const [p1, p2, p3] = [[num(), num()], [num(), num()], [num(), num()]];
      for (let s = 1; s <= 24; s++) {
        const t = s / 24;
        const u = 1 - t;
        const f = (a) => u * u * u * p0[a] + 3 * u * u * t * p1[a] + 3 * u * t * t * p2[a] + t * t * t * p3[a];
        poly.push([f(0), f(1)]);
      }
    } else if (cmd === 'Z') {
      cmd = null;
    }
  }
  return polys;
}

function rasterize(layers, size, ss = 4) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = hex(BG);
  for (let i = 0; i < size * size; i++) rgba.set([...bg, 255], i * 4);

  for (const { color, polys } of layers) {
    const cov = new Float32Array(size * size);
    const edges = polys.flatMap((p) => p.map((a, i) => [a, p[(i + 1) % p.length]]));
    for (let sy = 0; sy < size * ss; sy++) {
      const y = (sy + 0.5) / ss / size;
      const xs = [];
      for (const [[x0, y0], [x1, y1]] of edges) {
        if (y0 <= y !== y1 <= y) xs.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0));
      }
      xs.sort((a, b) => a - b);
      const py = Math.floor(sy / ss);
      for (let j = 0; j + 1 < xs.length; j += 2) {
        const from = Math.max(0, Math.ceil(xs[j] * size * ss - 0.5));
        const to = Math.min(size * ss, Math.ceil(xs[j + 1] * size * ss - 0.5));
        for (let sx = from; sx < to; sx++) cov[py * size + Math.floor(sx / ss)] += 1 / (ss * ss);
      }
    }
    const rgb = hex(color);
    for (let i = 0; i < size * size; i++) {
      const a = Math.min(1, cov[i]);
      for (let ch = 0; ch < 3; ch++) rgba[i * 4 + ch] = Math.round(rgba[i * 4 + ch] * (1 - a) + rgb[ch] * a);
    }
  }
  return encodePNG(size, size, rgba);
}

function toSVG(layers) {
  const paths = layers
    .map(({ color, polys }) => {
      const d = polys
        .map((p) => 'M' + p.map(([x, y]) => `${(x * 100).toFixed(2)} ${(y * 100).toFixed(2)}`).join('L') + 'Z')
        .join('');
      return `<path fill="${color}" d="${d}"/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="${BG}"/>${paths}</svg>\n`;
}

function hex(color) {
  const n = parseInt(color.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

// ---- PNG encoding ----------------------------------------------------------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- Output ----------------------------------------------------------------

mkdirSync(OUT, { recursive: true });
const full = design(1);
const maskable = design(0.8); // keeps everything inside the maskable safe zone

const outputs = {
  'apple-touch-icon.png': rasterize(full, 180),
  'icon-192.png': rasterize(full, 192),
  'icon-512.png': rasterize(full, 512),
  'icon-maskable-512.png': rasterize(maskable, 512),
  'icon.svg': toSVG(full),
};
for (const [name, data] of Object.entries(outputs)) {
  writeFileSync(new URL(name, OUT), data);
  console.log(`icons/${name}`);
}
