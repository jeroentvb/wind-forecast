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

function index(req, res) {
  url = 'https://www.windfinder.com/weatherforecast/tarifa'

  function spliceToFirstDay(array) {
    array.splice(0, 7)
    array.splice(15, 100)
  }

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

        var windfinder = {
          spot: '',
          date: new Array,
          time: new Array,
          windspeed: new Array,
          windgust: new Array,
          winddirection: new Array
        }

        // Get the spots name
        $('#spotheader-spotname').filter(function() {
          spot = $(this).text()
        })
        windfinder.spot = spot

        // Get the dates
        $('.weathertable__header').find($('h4')).filter(function(i) {
          windfinder.date[i] = $(this).text()
        })

        // Get the average wind speed
        $('.data--major').find($('.units-ws')).filter(function(i) {
          windfinder.windspeed[i] = $(this).text()
        })
        spliceToFirstDay(windfinder.windspeed)

        // Get the wind gusts
        $('.data-gusts').find($('.units-ws')).filter(function(i) {
          windfinder.windgust[i] = $(this).text()
        })
        spliceToFirstDay(windfinder.windgust)

        // Get the wind direction; do some converting
        $('.data-direction-arrow').find($('.directionarrow')).filter(function(i) {
          var data = new Number($(this).attr('title').replace('°', ' ')) - 180

          // This can be used to calculate the wind direction in wind direction instead of angles
          // var val = Math.floor((data / 22.5) + 0.5)
          // var windDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
          // windDirection[i] = windDirections[(val % 16)]

          windfinder.winddirection[i] = data
        })
        spliceToFirstDay(windfinder.winddirection)

        for (let i=0; i < windfinder.winddirection.length; i++) {
          windfinder.time[i] = i + 7 + 'h'
        }

        // Render the page with all the data
        res.render('index', {
          page: 'Wind forecasts',
          windfinder: {
            spot: windfinder.spot,
            date: windfinder.date,
            time: windfinder.time,
            windspeed: windfinder.windspeed,
            windgust: windfinder.windgust,
            winddirection: windfinder.winddirection
          }
        })
        exportData(windfinder)
      }
    })
  }
}

function exportData(jsonObject) {
  fs.writeFile('offline-data.json', JSON.stringify(jsonObject, null, 4), function(err) {
    if (err) {
      throw err
    } else {
      console.log(chalk.yellow('File written'))
    }
  })
}

function offlineData(res) {
  console.log(chalk.yellow('Offline data is being used..'))
  var windfinder = require('./offline-data.json')

  res.render('index', {
    page: 'Wind forecasts',
    windfinder: {
      spot: windfinder.spot,
      date: windfinder.date,
      time: windfinder.time,
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
