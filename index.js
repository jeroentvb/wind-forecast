const express = require('express')
const chalk = require('chalk')
const scrape = require('wind-scrape')
const Helper = require('jeroentvb-helper')
const config = require('./app-config.json')

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(express.static('static'))
  .get('/', index)
  .use(notFound)
  .listen(config.port, () => console.log(chalk.green(`[server] listening on port ${config.port}...`)))

function index (req, res) {
  let currentHour = new Date().getHours()
  if (config.lastScrape !== currentHour && config.useOfflineData === false) {
    config.lastScrape = currentHour
    useLiveData(res)
  } else {
    useOfflineData(res)
  }
}

function useLiveData (res) {
  if (config.verbose) console.log('[server] Using live data')
  Promise.all([
    scrape.windfinder(config.windfinderSpotName),
    scrape.windguru(config.windguruSpotNumber, config.windguruModels),
    scrape.windy(config.windy.lang, config.windy.long)
  ])
    .then(data => {
      if (config.verbose) console.log(`[server] received data`)
      Helper.exportToFile('offline-data', data)
      res.render('index', {
        page: 'Wind forecast',
        windfinder: data[0],
        windguru: data[1],
        windy: data[2]
      })
    })
    .catch(err => console.error(err))
}

function useOfflineData (res) {
  if (config.verbose) console.log('[server] Using offline data')
  let offlineData = require('./offline-data-export.json')
  res.render('index', {
    page: 'Wind forecast',
    windfinder: offlineData[0],
    windguru: offlineData[1],
    windy: offlineData[2]
  })
}

function notFound (req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
