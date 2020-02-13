# Discontinued
Since windguru released their 'windguru model mix' feature, this project's purpose has been defeated. Windguru model mix is basically what I was trying to achieve with this project, and it does it even better, by taking model resolution and last updated time into account.  

## Disclaimer
This app scrapes data from other websites.
Scraping websites is a grey area and may not be allowed by all websites.
To put it in other words: __Use this app at your own risk__ and for personal use only.  


<details>
  <summary>Disclaimer for the wind-scrape package used in this project</summary>
  
  [Wind-scrape disclaimer](https://github.com/jeroentvb/wind-scrape/blob/master/README.md#disclaimer)

  As per windfinder's [Terms & Conditions](https://www.windfinder.com/contact/terms/)
  > 1.4.2 The data are protected in our favor by copyright or related rights.

  > 1.5.2 The data may be used without our consent only for the intended use within the scope of the services offered by us; in particular the data may not be used for own software, apps, web pages, etc., unless we have expressly agreed to this use.

  As per windguru's [Terms and Conditions](https://www.windguru.cz/help.php?sec=terms)
  > 3.2. It is forbidden to download website content by automated scripts.

  This basically means that you can't scrape windfinder & windguru which this application does.  
  I wasn't able to find the terms and conditions for Windy.
  </details>

# Wind forecast
An app that scrapes wind forecasts from a few websites for personal use.
It currently only works with windfinder superforecast urls and regular windguru spot urls, and for one spot only.

## Table of contents
* [Installation](#installation)
* [Setup](#setup)

## Installation
Download or clone this repository using:
```
git clone https://github.com/jeroentvb/wind-forecast.git
```

`cd wind-forecast` into the folder. Install the required node.js packages using
```
npm install
```

## Setup
Add the windfinder & windguru links for your local spot in [app-config.json](app-config.json). You also need to fill the `windguruModels` array with the numbers of the windmodels you want to scrape and display. You can find these numbers on the windguru page for your spot. Use the dev tools of your browser to inspect the source and look for `id="tabid_1_0_WINDSPD"`. In this example *1* would be the number you are looking for.

Start the server using `npm start` or `node index.js`. It will run on the port specified in [app-config.json](app-config.json).
