// Minimal hash router. Hash URLs keep the site working from any static host
// (including a GitHub Pages sub-path) and inside the iOS home-screen app.
//
// A view is `mount(root, params) => unmount`.

let routes = [];
let unmount = null;
let navigatedInApp = false;

export function startRouter(table, root) {
  routes = table;
  window.addEventListener('hashchange', () => render(root));
  render(root);
}

export function go(path) {
  navigatedInApp = true;
  location.hash = path;
}

// Return to the previous screen, or home if the app was opened deep-linked.
export function back() {
  if (navigatedInApp && history.length > 1) history.back();
  else location.replace('#/');
}

function render(root) {
  const path = location.hash.replace(/^#/, '') || '/';
  for (const [pattern, resolve] of routes) {
    const match = path.match(pattern);
    if (!match) continue;
    const mount = resolve(...match.slice(1));
    if (!mount) break;
    unmount?.();
    root.replaceChildren();
    window.scrollTo(0, 0);
    unmount = mount(root) ?? null;
    return;
  }
  location.replace('#/');
}
