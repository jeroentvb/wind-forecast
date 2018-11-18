const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const Nightmare = require('nightmare')
const nightmare = Nightmare({
  show: false
})
const chalk = require('chalk')
const fs = require('fs')
const helper = require('./modules/helper')
const config = require('./app-config.json')

var lastScrape = 6 // Set default at 6 in the morning

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'templates')
  .use(express.static('static'))
  .get('/', index)
  .use(notFound)
  .listen(config.port, () => console.log(chalk.green(`Server listening on port ${config.port}...`)))

function getHtml (url) {
  return new Promise((resolve, reject) => {
    request(url, (err, res, html) => {
      if (err) reject(err)
      resolve(html)
    })
  })
}

function extractWindfinderData (html) {
  let $ = cheerio.load(html)
  let windfinder = {
    name: 'Windfinder',
    spot: '',
    date: [],
    time: [],
    windspeed: [],
    windgust: [],
    winddirection: []
  }

  // Get the spots name
  $('#spotheader-spotname').filter(function () {
    windfinder.spot = $(this).text()
  })

  // Get the dates
  $('.weathertable__header').find($('h4')).filter(function (i) {
    windfinder.date[i] = $(this).text()
  })

  // Get the time
  $('.data-time').find($('.value')).filter(function (i) {
    // console.log($(this).text())
    windfinder.time[i] = $(this).text()
  })
  helper.spliceToDayHours(windfinder.time)

  // Get the average wind speed
  $('.data--major').find($('.units-ws')).filter(function (i) {
    windfinder.windspeed[i] = $(this).text()
  })
  helper.spliceToDayHours(windfinder.windspeed)

  // Get the wind gusts
  $('.data-gusts').find($('.units-ws')).filter(function (i) {
    windfinder.windgust[i] = $(this).text()
  })
  helper.spliceToDayHours(windfinder.windgust)

  // Get the wind direction; do some converting
  $('.data-direction-arrow').find($('.directionarrow')).filter(function (i) {
    var data = parseInt($(this).attr('title').replace('°', ' ')) - 180
    // This can be used to calculate the wind direction in wind direction instead of angles
    // var val = Math.floor((data / 22.5) + 0.5)
    // var windDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    // windDirection[i] = windDirections[(val % 16)]
    windfinder.winddirection[i] = data
  })
  helper.spliceToDayHours(windfinder.winddirection)

  return windfinder
}

function index (req, res) {
  getHtml(config.windfinderUrl)
    .then(html => extractWindfinderData(html))
    .then(windfinder => res.render('index', {
      page: 'index',
      windfinder: windfinder
    })) // Windfinder data object
    .catch(err => console.log(err))
}

function indexOld (req, res) {
  // Throw error if the links aren't specified
  if (config.windfinderUrl.length < 22 || config.windguruUrl.length < 19) {
    res.render('error', {
      page: 'Error',
      error: 'The urls to get the data from aren\'t specified..'
    })
    throw chalk.red('The urls to get the data from aren\'t specified..')
  }

  // Save incoming connection ip's
  if (config.saveIncoming === true) {
    fs.appendFile('acceslog.txt', new Date() + ' ' + req.ip + '\n', err => console.log(err))
  }

  var currentHour = new Date().getHours()

  if (config.useOfflineData === true || (currentHour - lastScrape) < 1) {
    offlineData(res)
  } else {
    console.log(chalk.yellow('Live data is being used..'))

    var windfinder = {
      name: 'Windfinder',
      spot: '',
      date: [],
      time: [],
      windspeed: [],
      windgust: [],
      winddirection: []
    }

    request(config.windfinderUrl, function (error, response, html) {
      if (error) {
        res.render('error', {
          page: 'error',
          error: error
        })
        throw error
      } else {
        var $ = cheerio.load(html)

        // Get the spots name
        $('#spotheader-spotname').filter(function () {
          windfinder.spot = $(this).text()
        })

        // Get the dates
        $('.weathertable__header').find($('h4')).filter(function (i) {
          windfinder.date[i] = $(this).text()
        })

        // Get the time
        $('.data-time').find($('.value')).filter(function (i) {
          // console.log($(this).text())
          windfinder.time[i] = $(this).text()
        })
        helper.spliceToDayHours(windfinder.time)

        // Get the average wind speed
        $('.data--major').find($('.units-ws')).filter(function (i) {
          windfinder.windspeed[i] = $(this).text()
        })
        helper.spliceToDayHours(windfinder.windspeed)

        // Get the wind gusts
        $('.data-gusts').find($('.units-ws')).filter(function (i) {
          windfinder.windgust[i] = $(this).text()
        })
        helper.spliceToDayHours(windfinder.windgust)

        // Get the wind direction; do some converting
        $('.data-direction-arrow').find($('.directionarrow')).filter(function (i) {
          var data = parseInt($(this).attr('title').replace('°', ' ')) - 180
          // This can be used to calculate the wind direction in wind direction instead of angles
          // var val = Math.floor((data / 22.5) + 0.5)
          // var windDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
          // windDirection[i] = windDirections[(val % 16)]
          windfinder.winddirection[i] = data
        })
        helper.spliceToDayHours(windfinder.winddirection)

        // Export the windfinder data to a file
        if (config.exportWindfinderData === true) {
          helper.exportData(windfinder, 'windfinder')
        }
      }

      windfinder.done = true
    })

    var windguru = {
      name: 'WindGuru',
      spot: '',
      date: [],
      harmonie: {
        time: [],
        windspeed: [],
        windgust: [],
        winddirection: []
      },
      icon7: {
        time: [],
        windspeed: [],
        windgust: [],
        winddirection: []
      },
      cosmo: {
        time: [],
        windspeed: [],
        windgust: [],
        winddirection: []
      },
      icon13: {
        time: [],
        windspeed: [],
        windgust: [],
        winddirection: []
      },
      gfs: {
        time: [],
        windspeed: [],
        windgust: [],
        winddirection: []
      },
      wrf: {
        time: [],
        windspeed: [],
        windgust: [],
        winddirection: []
      }
    }

    nightmare
      .goto(config.windguruUrl)
      .wait('.spot-name')
      .wait('#tabid_2_0_dates')
      .wait('#tabid_2_0_WINDSPD')
      .wait('#tabid_2_0_GUST')
      .wait('#tabid_2_0_SMER')
      .evaluate(() => document.querySelector('body').outerHTML)
      .end()
      .then(html => {
        var $ = cheerio.load(html)
        // Get spotname
        $('.spot-name').filter(function () {
          // console.log($(this).text())
          windguru.spot = $(this).text()
        })

        windguruModel('harmonie', '2', $, windguru)
        windguruModel('icon7', '4', $, windguru)
        windguruModel('cosmo', '1', $, windguru)
        windguruModel('icon13', '6', $, windguru)
        windguruModel('gfs', '0', $, windguru)
        windguruModel('wrf', '3', $, windguru)
        // console.log(windguru)

        if (config.exportWindguruData === true) {
          // Export the windguru data
          helper.exportData(windguru, 'windguru')
        }

        windguru.done = true

        render(res, windfinder, windguru, currentHour)
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
function windguruModel (model, number, $, windguru, spliceStart, spliceEnd) {
  // Get time
  $(`#tabid_${number}_0_dates`).find('td').filter(function (i) {
    windguru[model].time[i] = $(this).text().split('.')[1]
  })
  // windguru[model].time.splice(0, 7)
  // Get windspeed
  $(`#tabid_${number}_0_WINDSPD`).find('td').filter(function (i) {
    windguru[model].windspeed[i] = $(this).text()
  })
  // windguru[model].windspeed.splice(spliceStart, spliceEnd)
  // Get windgust
  $(`#tabid_${number}_0_GUST`).find('td').filter(function (i) {
    windguru[model].windgust[i] = $(this).text()
  })
  // windguru[model].windgust.splice(spliceStart, spliceEnd)
  // Get winddirection
  $(`#tabid_${number}_0_SMER`).find('td span').filter(function (i) {
    windguru[model].winddirection[i] = parseInt($(this).attr('title').match(/\d+/)[0]) - 180
  })
  // windguru[model].winddirection.splice(spliceStart, spliceEnd)
}

function render (res, windfinder, windguru, scrapeTime) {
  lastScrape = scrapeTime
  res.render('index', {
    page: 'home',
    windfinder: windfinder,
    windguru: windguru
  })
}

function offlineData (res) {
  console.log(chalk.yellow('Offline data is being used..'))
  var windfinder = require('./windfinderoffline-data.json')
  var windguru = require('./windguruoffline-data.json')

  res.render('index', {
    page: 'Wind forecasts',
    windfinder: windfinder,
    windguru: windguru
  })
}

function notFound (req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
