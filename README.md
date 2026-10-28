# SET

The card game SET for the browser, built to work as an iPhone home-screen app.
It's plain HTML, CSS and JavaScript modules, with no build step and no dependencies.

## Run it

```sh
npm start          # http://localhost:5173
npm run start:lan  # also reachable from a phone on the same Wi-Fi
npm test           # game-logic tests
npm run icons      # regenerate icons/ from js/shapes.js
```

Any static file server works too. The site uses relative paths and hash URLs,
so it can be hosted from a sub-path such as GitHub Pages.

## Add to an iPhone home screen

Open the site in Safari, tap **Share → Add to Home Screen**. It launches
full-screen with its own icon. Offline play needs the site to be served over
HTTPS, because that's when the service worker is allowed to run.

## Saved data

Settings (theme, card design, card texture) and statistics are kept in the browser's
`localStorage`, so each browser remembers its own. On iPhone, the home-screen
app has its own storage, separate from Safari.

## Layout

| Path | What |
| --- | --- |
| `js/set.js` | Card encoding and rules (`isSet`, `findSet`, deck) |
| `js/set-game.js` | Game state shared by the modes: dealing (never more than 12 cards), claims, game over |
| `js/cards.js`, `js/shapes.js` | Card designs (Classic, Fruits, Cooldown) and card SVG drawing |
| `js/game-view.js` | Game screen: board layout, input, timer, end panel |
| `js/home-view.js`, `js/modes.js` | Home screen and the game-mode list (Classic, Fast Five, …) |
| `js/settings-panel.js`, `js/settings.js` | Slide-out settings drawer, theme list and stored preferences |
| `js/stats.js` | Lifetime statistics and finished-game history |
| `css/styles.css` | All styles. Themes (`[data-theme=…]`) and card textures (`[data-card-texture=…]`) are blocks of tokens near the top |
| `fonts/` | Title fonts, SIL OFL 1.1: Notable (Eli Block, Hana Tanimura, Noémie Le Coz) and Pacifico (Beach theme) |
| `js/beach.js` | Beach theme home-screen art: shoreline, waves and beach things |
| `sw.js` | Offline cache. Add new files to `PRECACHE` and bump `VERSION` |
