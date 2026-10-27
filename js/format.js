// 83456 -> "1:23.45", 3723456 -> "1:02:03.45" (minutes, seconds, hundredths).
export function formatTime(ms) {
  const cs = Math.floor(ms / 10);
  const s = Math.floor(cs / 100);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = `${String(s % 60).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`;
  return h ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`;
}
