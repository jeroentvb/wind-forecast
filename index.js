var express = require('express')
var request = require('request')
var cheerio = require('cheerio')
var chalk = require('chalk')
var fs = require('fs')

// port to listen on
const port = 3000

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(express.static('static'))
  .get('/', index)
  .use(notFound)
  .listen(port, () => console.log(`Server listening on port ${port}...`))

function test(req, res) {
  res.render('index', {
    page: 'Home'
  })
}

function index(req, res) {
  url = 'https://www.windfinder.com/weatherforecast/tarifa'

  var useOfflineData = true

  if (useOfflineData == true) {
    offlineData(res)
  } else {
    console.log(chalk.yellow('Live data is being used..'))
    request(url, function(error, response, html) {
      if(error) {
        res.render('error', {
          page: 'error',
          error: error
        })
        throw error
      } else {
        var $ = cheerio.load(html)

        var spot
        var windSpeed = new Array
        var windGust = new Array
        var windDirection = new Array
        var windfinder = new Object

        // Get the spots name
        $('#spotheader-spotname').filter(function() {
          // var data = $(this)
          spot = $(this).text()
        })
        windfinder.spot = spot

        // Get the average wind speed
        $('.data--major').find($('.units-ws')).filter(function(i) {
          // var data = $(this)
          windSpeed[i] = $(this).text()
        })

        // Get the wind gusts
        $('.data-gusts').find($('.units-ws')).filter(function(i) {
          windGust[i] = $(this).text()
        })

        // Get the wind direction
        $('.data-direction-arrow').find($('.directionarrow')).filter(function(i) {
          windDirection[i] = $(this).attr('title')

        })

        windfinder.windgust = new Array
        windfinder.windspeed = new Array
        windfinder.winddirection = new Array
        for (let i=7; i < 22; i++) {
          windfinder.windspeed[i - 7] = windSpeed[i]
          windfinder.windgust[i - 7] = windGust[i]
          windfinder.winddirection[i - 7] = windDirection[i]
        }

        // Render the page with all the data
        res.render('index', {
          page: 'Wind forecasts',
          windfinder: {
            spot: windfinder.spot,
            windspeed: windfinder.windspeed,
            windgust: windfinder.windgust,
            winddirection: windfinder.winddirection
          }
        })
      }
    })
  }
}

function exportData(jsonObject) {
  fs.writeFile('offline-data.json', JSON.stringify(jsonObject, null, 4), function(err) {
    console.log(chalk.yellow('File written'))
  })
}

function offlineData(res) {
  console.log(chalk.yellow('Offline data is being used..'))
  var windfinder = require('./offline-data.json')
  res.render('index', {
    page: 'Wind forecasts',
    windfinder: {
      spot: windfinder.spot,
      windspeed: windfinder.windspeed,
      windgust: windfinder.windgust,
      winddirection: windfinder.winddirection
    }
  })
}

function notFound(req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
