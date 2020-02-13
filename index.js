const express = require('express')
const chalk = require('chalk')
const scrape = require('wind-scrape')
const helper = require('./modules/helper')
const helper2 = require('jeroentvb-helper')
const config = require('./app-config.json')
const bodyParser = require('body-parser')
const mongo = require('./modules/db')

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates/pages')
  .use(express.static('static'))
  .use(bodyParser.urlencoded({ extended: true }))
  .get('/', index)
  .get('/add-spot', (req, res) => res.render('addspot', { page: 'Add spot' }))
  .post('/submit-spot', submitSpot)
  .use(notFound)
  .listen(config.port, () => console.log(chalk.green(`[server] listening on port ${config.port}...`)))

function index (req, res) {
  const currentHour = new Date().getHours()
  if (config.lastScrape !== currentHour && config.useOfflineData === false) {
    config.lastScrape = currentHour
    useLiveData(res)
  } else {
    useOfflineData(res)
  }
}

async function submitSpot (req, res) {
  try {
    await mongo.collection('spots').insertOne({
      ...req.body,
      forecasts: []
    })

    const spot = db.collection('spots').find({ spotname: 'test' })
    console.log(spot)
  } catch (err) {
    renderInternalError(res)
    console.error(err)
  }
}

function useLiveData (res) {
  if (config.verbose) console.log('[server] Using live data')

  const spot = config.spots[0]

  const spotFns = []

  Promise.all(config.spots.map(async (spot) => {
    if (spot.windfinderSpotName) {

    }

    if (spot.windguruSpotNumber && spot.windguruModels) {

    }

    if (spot.windy) {

    }
  }))
    .then(data => console.log(data))
    .catch(err => console.error(err))

  if (spot.windfinderSpotName) {
    spotFns.push(scrape.windfinder(spot.windfinderSpotName))
  }

  console.log(spotFns)

  Promise.all([
    scrape.windfinder(spot.windfinderSpotName),
    scrape.windguru(spot.windguruSpotNumber, spot.windguruModels),
    scrape.windy(spot.windy.lang, spot.windy.long)
  ])
    .then(data => {
      if (config.verbose) console.log('[server] received data')

      data = helper.trim(data)
      helper2.exportToFile('offline-data', data)

      res.render('index', {
        page: 'Wind forecast',
        windfinder: data[0],
        windguru: data[1],
        windy: data[2]
      })
    })
    .catch(err => {
      res.render('error', {
        page: 'error',
        error: 'Something went wrong..'
      })
      console.error(err)
    })
}

function useOfflineData (res) {
  if (config.verbose) console.log('[server] Using offline data')
  const offlineData = require('./offline-data-export.json')
  res.render('index', {
    page: 'Wind forecast',
    windfinder: offlineData[0],
    windguru: offlineData[1],
    windy: offlineData[2]
  })
}

function renderInternalError (res) {
  res.status(500).render('error', {
    page: 'Error',
    error: 'Error 500. Something went wrong..'
  })
}

function notFound (req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
