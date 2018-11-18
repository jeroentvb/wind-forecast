## Disclaimer
This app scrapes data from other websites.
Scraping websites is a grey area and may not be allowed by all websites.
To put it in other words: __Use this app at your own risk__ and for personal use only.  

# Wind forecast
An app that scrapes wind forecasts from a few websites for personal use.
I decided to start building it because I don't want to check 4 different apps/websites to see the wind forecast.
It is currently work in progress and works best (if not only) for spots in the Netherlands.
It currently only works with windfinder superforecast urls and regular windguru spot urls, and for one spot only.

## Table of contents
* [Usage](#usage)
* [Prerequisites](#prerequisites)
* [Installation](#installation)

## Usage

### Prerequisites
* [node.js & npm](https://nodejs.org/en/)

Optional
* [Sass](https://sass-lang.com/) (if you want to customize the css)

### Installation
Download or clone this repository using:
```
git clone https://github.com/jeroentvb/wind-forecast.git
```

`cd wind-forecast` into the folder. Install the required node.js packages using
```
npm install
```

Add the windfinder & windguru links for your local spot in [app-config.json](app-config.json).

Start the server using `npm start` or `node index.js`. It will run on the port specified in [app-config.json](app-config.json).

## Things for the future
- [ ] Improve the way forecasts are shown
- [ ] Add windy.com data
- [ ] Add average forecasted windspeed
- [ ] Add support for different spots/user input spots
- [ ] Add localization support
