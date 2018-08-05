# Wind forecast
An app that scrapes wind forecasts from a few websites for personal use.
I decided to start building it because I don't want to check 4 different apps/websites to see the wind forecast.
It is currently work in progress.
It currently only works with windfinder superforecast urls.

## How to use
I'm assuming you already have `nodejs` and `npm` installed.
After downloading/cloning the app, run `npm install` and `npm build`.
Open `index.js` in your favorite text editor and replace the string in 
```js
var windfinderUrl
```
with the link to the superforecast of your local spot.
To launch the app use `node index.js`.
Open `localhost:3000` in your browser to view the forecast for today.
