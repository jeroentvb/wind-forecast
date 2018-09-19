## Disclaimer
This app scrapes data from other websites.
Scraping websites is a grey area and may not be allowed by all websites.
To put it in other words: __Use this app at your own risk__ and for personal use only.  

The app has only been tested on node v9.5.0.

# Wind forecast
An app that scrapes wind forecasts from a few websites for personal use.
I decided to start building it because I don't want to check 4 different apps/websites to see the wind forecast.
It is currently work in progress and works best (if not only) for spots in the Netherlands.
It currently only works with windfinder superforecast urls and regular windguru spot urls.

## How to use
I'm assuming you already have `nodejs` and `npm` installed.
After downloading/cloning the app, run `npm install` and `npm build`.
Open [index.js](/index.js) in your favorite text editor and replace the strings in
```js
var options = {
  windfinderUrl: 'yourWindfinderUrlHere',
  windguruUrl: 'yourWindguruUrlHere'
```
with the link to the superforecast of your local spot.
To launch the app use `node index.js`.
Open `localhost:3000` in your browser to view the forecast for today.

### Options
Various options are located in the options object, located on line 12 of [index.js](/index.js)

## Things for the future
1. Improve the way forecasts are shown
2. Add windy.com data
3. Add average forecasted windspeed
4. Add support for different spots/user input spots
