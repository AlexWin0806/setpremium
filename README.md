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

## Layout

| Path | What |
| --- | --- |
| `js/set.js` | Card encoding and rules (`isSet`, `findSet`, deck) |
| `js/classic-game.js` | Classic mode state: deal, claim, add cards, game over |
| `js/cards.js`, `js/shapes.js` | Card SVG drawing |
| `js/game-view.js` | Game screen: board layout, input, timer, end panel |
| `js/home-view.js`, `js/modes.js` | Home screen and the game-mode list |
| `js/settings-view.js`, `js/settings.js` | Settings screen and stored preferences |
| `js/stats.js` | Finished-game history (in `localStorage`) |
| `css/styles.css` | All styles; theme colours are tokens at the top |
| `sw.js` | Offline cache. Add new files to `PRECACHE` and bump `VERSION` |
