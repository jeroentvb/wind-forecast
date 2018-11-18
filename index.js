const express = require('express')
const chalk = require('chalk')
const scrape = require('./modules/scrape')
const helper = require('./modules/helper')
const config = require('./app-config.json')

var lastScrape = 5 // Set default at 5 in the morning

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(express.static('static'))
  .get('/', index)
  .use(notFound)
  .listen(config.port, () => console.log(chalk.green(`Server listening on port ${config.port}...`)))

function index (req, res) {
  let currentHour = new Date().getHours()
  if (lastScrape !== currentHour && config.useOfflineData === false) {
    lastScrape = currentHour
    useLiveData(res)
  } else {
    useOfflineData(res)
  }
}

function useLiveData (res) {
  console.log('Using live data')
  Promise.all([
    scrape.windfinder(),
    scrape.windguru()
  ])
    .then(data => {
      helper.exportArr('offline-data', data)
      res.render('index', {
        page: 'Wind forecast',
        windfinder: data[0],
        windguru: data[1]
      })
    })
    .catch(err => console.error(err))
}

function useOfflineData (res) {
  console.log('Using offline data')
  let offlineData = require('./offline-data-export.json')
  res.render('index', {
    page: 'Wind forecast',
    windfinder: offlineData[0],
    windguru: offlineData[1]
  })
}

function notFound (req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
