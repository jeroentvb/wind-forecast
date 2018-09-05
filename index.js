const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const Nightmare = require('nightmare')
const nightmare = Nightmare({
  show: false
})
const chalk = require('chalk')
const fs = require('fs')

// port to listen on
const port = 3000

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(express.static('static'))
  .get('/', index)
  .use(notFound)
  .listen(port, () => console.log(`Server listening on port ${port}...`))

var useOfflineData = true

function index(req, res) {
  windfinderUrl = 'https://www.windfinder.com/weatherforecast/markermeer_schellinkhout'
  windguruUrl = 'https://www.windguru.cz/46940'

  // Throw error if the links aren't specified
  if(windfinderUrl.length < 22 || windguruUrl.length < 19) {
    res.render('error', {
      page: 'Error',
      error: 'The urls to get the data from aren\'t specified..'
    })
    throw chalk.red('The urls to get the data from aren\'t specified..')
  }

  if (useOfflineData == true) {
    offlineData(res)
  } else {
    console.log(chalk.yellow('Live data is being used..'))

    var windfinder = {
      name: 'Windfinder',
      done: false,
      spot: '',
      date: new Array,
      time: new Array,
      windspeed: new Array,
      windgust: new Array,
      winddirection: new Array
    }

    request(windfinderUrl, function(error, response, html) {
      if(error) {
        res.render('error', {
          page: 'error',
          error: error
        })
        throw error
      } else {
        var $ = cheerio.load(html)

        // Get the spots name
        $('#spotheader-spotname').filter(function() {
          windfinder.spot = $(this).text()
        })

        // Get the dates
        $('.weathertable__header').find($('h4')).filter(function(i) {
          windfinder.date[i] = $(this).text()
        })

        // Get the time
        $('.data-time').find($('.value')).filter(function(i) {
          // console.log($(this).text())
          windfinder.time[i] = $(this).text()
        })
        spliceToDayHours(windfinder.time)

        // Get the average wind speed
        $('.data--major').find($('.units-ws')).filter(function(i) {
          windfinder.windspeed[i] = $(this).text()
        })
        spliceToDayHours(windfinder.windspeed)

        // Get the wind gusts
        $('.data-gusts').find($('.units-ws')).filter(function(i) {
          windfinder.windgust[i] = $(this).text()
        })
        spliceToDayHours(windfinder.windgust)

        // Get the wind direction; do some converting
        $('.data-direction-arrow').find($('.directionarrow')).filter(function(i) {
          var data = parseInt($(this).attr('title').replace('°', ' ')) - 180

          // This can be used to calculate the wind direction in wind direction instead of angles
          // var val = Math.floor((data / 22.5) + 0.5)
          // var windDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
          // windDirection[i] = windDirections[(val % 16)]

          windfinder.winddirection[i] = data
        })
        spliceToDayHours(windfinder.winddirection)

        // Export the windfinder data to a file
        exportData(windfinder, 'windfinder')
      }

      windfinder.done = true

    })

    var windguru = {
      name: 'WindGuru',
      done: false,
      spot: '',
      date: new Array,
      harmonie: {
        time: new Array,
        windspeed: new Array,
        windgust: new Array,
        winddirection: new Array
      },
      icon7: {
        time: new Array,
        windspeed: new Array,
        windgust: new Array,
        winddirection: new Array
      },
      cosmo: {
        time: new Array,
        windspeed: new Array,
        windgust: new Array,
        winddirection: new Array
      },
      icon13: {
        time: new Array,
        windspeed: new Array,
        windgust: new Array,
        winddirection: new Array
      },
      gfs: {
        time: new Array,
        windspeed: new Array,
        windgust: new Array,
        winddirection: new Array
      },
      wrf: {
        time: new Array,
        windspeed: new Array,
        windgust: new Array,
        winddirection: new Array
      }
    }

    nightmare
      .goto(windguruUrl)
      .wait('.spot-name')
      .wait('#tabid_2_0_dates')
      .wait('#tabid_2_0_WINDSPD')
      .wait('#tabid_2_0_GUST')
      .wait('#tabid_2_0_SMER')
      .evaluate(() => document.querySelector('body').outerHTML)
      .end()
      .then(function(html) {
        var $ = cheerio.load(html)
        // Get spotname
        $('.spot-name').filter(function() {
          // console.log($(this).text())
          windguru.spot = $(this).text()
        })
        // Harmonie weather model
        // windguruModel('harmonie', '2', $, windguru, 15, 60)
        // windguruModel('icon7', '4', $, windguru, 12, 60)
        // windguruModel('cosmo', '1', $, windguru, 9, 60)
        // windguruModel('icon13', '6', $, windguru, 5, 60)
        // windguruModel('gfs', '0', $, windguru, 5, 60)
        // windguruModel('wrf', '3', $, windguru, 15, 60)

        windguruModel('harmonie', '2', $, windguru)
        windguruModel('icon7', '4', $, windguru)
        windguruModel('cosmo', '1', $, windguru)
        windguruModel('icon13', '6', $, windguru)
        windguruModel('gfs', '0', $, windguru)
        windguruModel('wrf', '3', $, windguru)
        // console.log(windguru)
        // Export the windguru data
        // exportData(windguru, 'windguru')

        windguru.done = true

        render(res, windfinder, windguru)
      })
      .catch(error => console.log(error))

  }
}

// Explaination of function var needed to pass on
// Model = wind model. Used to store in windguru object (windguru.model)
// number = Number of graph on the windguru website
// $ = $. Pass the $ for cheerio to use
// windguru = the object to store info in. I've given it a fixed name: WindGuru
// spliceStart = start removing items from the array to be left with 1 day of data
// sliceEnd = stop removing items from the array
function windguruModel(model, number, $, windguru, spliceStart, spliceEnd) {
  // Get time
  $(`#tabid_${number}_0_dates`).find('td').filter(function(i) {
    windguru[model].time[i] = $(this).text().split('.')[1]
  })
  // windguru[model].time.splice(0, 7)
  // Get windspeed
  $(`#tabid_${number}_0_WINDSPD`).find('td').filter(function(i) {
      windguru[model].windspeed[i] = $(this).text()
  })
  // windguru[model].windspeed.splice(spliceStart, spliceEnd)
  // Get windgust
  $(`#tabid_${number}_0_GUST`).find('td').filter(function(i) {
    windguru[model].windgust[i] = $(this).text()
  })
  // windguru[model].windgust.splice(spliceStart, spliceEnd)
  // Get winddirection
  $(`#tabid_${number}_0_SMER`).find('td span').filter(function(i) {
    windguru[model].winddirection[i] = parseInt($(this).attr('title').match(/\d+/)[0]) - 180
  })
  // windguru[model].winddirection.splice(spliceStart, spliceEnd)
}

function index2(req, res) {
  var spot = ''
  var dates = new Array

}

function render(res, windfinder, windguru) {
  res.render('index', {
    page: 'home',
    windfinder: windfinder,
    windguru: windguru
  })
}

function spliceToDayHours(array) {
  // Remove the first 7 hours
  array.splice(0, 7)
  // Remove the night between day 1 and 2
  array.splice(16, 8)
  // Remove the night between day 2 and 3
  array.splice(32, 8)
  // Remove last hour of day 3 (23h)
  array.splice(48, 10)
}

function exportData(jsonObject, name) {
  fs.writeFile(name + 'offline-data.json', JSON.stringify(jsonObject, null, 4), function(err) {
    if (err) {
      throw err
    } else {
      console.log(chalk.yellow('File written'))
    }
  })
}

function offlineData(res) {
  console.log(chalk.yellow('Offline data is being used..'))
  var windfinder = require('./windfinderoffline-data.json')
  var windguru = require('./windguruoffline-data.json')

  res.render('index', {
    page: 'Wind forecasts',
    windfinder: windfinder,
    windguru: windguru
  })
}

function notFound(req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
