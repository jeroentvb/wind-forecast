## Disclaimer
This app scrapes data from other websites.
Scraping websites is a grey area and may not be allowed by all websites.
To put it in other words: __Use this app at your own risk__ and for personal use only.  

*This application is still W.I.P. and I wouldn't use it in its current state.*

# Wind forecast
An app that scrapes wind forecasts from a few websites for personal use.
It currently only works with windfinder superforecast urls and regular windguru spot urls, and for one spot only.

## Table of contents
* [Installation](#installation)

### Installation
Download or clone this repository using:
```
git clone https://github.com/jeroentvb/wind-forecast.git
```

`cd wind-forecast` into the folder. Install the required node.js packages using
```
npm install
```

Add the windfinder & windguru links for your local spot in [app-config.json](app-config.json). You also need to fill the `windguruModels` array with the numbers of the windmodels you want to scrape and display. You can find these numbers on the windguru page for your spot. Use the dev tools of your browser to inspect the source and look for `id="tabid_1_0_WINDSPD"`. In this example *1* would be the number you are looking for.

Start the server using `npm start` or `node index.js`. It will run on the port specified in [app-config.json](app-config.json).

## Things for the future
- [ ] Improve the way forecasts are shown
- [ ] Add windy.com data
- [ ] Add average forecasted windspeed
- [ ] Add support for different spots/user input spots
