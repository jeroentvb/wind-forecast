const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const Nightmare = require('nightmare')
const nightmare = Nightmare({
  show: true
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
  windfinderUrl = 'https://www.windfinder.com/weatherforecast/tarifa'
  windguruUrl = 'https://www.windguru.cz/43'

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

    var windfinder = require('./windfinderoffline-data.json')

    // request(windfinderUrl, function(error, response, html) {
    //   if(error) {
    //     res.render('error', {
    //       page: 'error',
    //       error: error
    //     })
    //     throw error
    //   } else {
    //     var $ = cheerio.load(html)
    //
    //     // Get the spots name
    //     $('#spotheader-spotname').filter(function() {
    //       windfinder.spot = $(this).text()
    //     })
    //
    //     // Get the dates
    //     $('.weathertable__header').find($('h4')).filter(function(i) {
    //       windfinder.date[i] = $(this).text()
    //     })
    //
    //     // Get the average wind speed
    //     $('.data--major').find($('.units-ws')).filter(function(i) {
    //       windfinder.windspeed[i] = $(this).text()
    //     })
    //     spliceToFirstDay(windfinder.windspeed)
    //
    //     // Get the wind gusts
    //     $('.data-gusts').find($('.units-ws')).filter(function(i) {
    //       windfinder.windgust[i] = $(this).text()
    //     })
    //     spliceToFirstDay(windfinder.windgust)
    //
    //     // Get the wind direction; do some converting
    //     $('.data-direction-arrow').find($('.directionarrow')).filter(function(i) {
    //       var data = new Number($(this).attr('title').replace('°', ' ')) - 180
    //
    //       // This can be used to calculate the wind direction in wind direction instead of angles
    //       // var val = Math.floor((data / 22.5) + 0.5)
    //       // var windDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    //       // windDirection[i] = windDirections[(val % 16)]
    //
    //       windfinder.winddirection[i] = data
    //     })
    //     spliceToFirstDay(windfinder.winddirection)
    //
    //     for (let i=0; i < windfinder.winddirection.length; i++) {
    //       windfinder.time[i] = i + 7 + 'h'
    //     }
    //
    //     exportData(windfinder, 'windfinder')
    //   }
    //
    //   windfinder.done = true
    //   // render()
    //
    // })

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
      gsf: {
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
        windguruModel('harmonie', '2', $, windguru, 15, 60)
        windguruModel('icon7', '4', $, windguru, 12, 60)
        windguruModel('cosmo', '4', $, windguru)

        exportData(windguru, 'windguru')
        render(res, windfinder, windguru)
      })
      .catch(error => console.log(error))

  }
}

function windguruModel(model, number, $, windguru, spliceStart, spliceEnd) {
  // Get time
  $(`#tabid_${number}_0_dates`).find('.day1').filter(function(i) {
    windguru[model].time[i] = $(this).text().slice(5, 7) + 'h'
  })
  windguru[model].time.splice(spliceStart, spliceEnd)
  // Get windspeed
  $(`#tabid_${number}_0_WINDSPD`).find('.wgfcst-clickable').filter(function(i) {
    windguru[model].windspeed[i] = $(this).text()
  })
  windguru[model].windspeed.splice(spliceStart, spliceEnd)
  console.log(windguru[model].windspeed)
  // Get windgust
  $(`#tabid_${number}_0_GUST`).find('td').filter(function(i) {
    windguru[model].windgust[i] = $(this).text()
  })
  windguru[model].windgust.splice(spliceStart, spliceEnd)
  // Get winddirection
  $(`#tabid_${number}_0_SMER`).find('td span').filter(function(i) {
    windguru[model].winddirection[i] = new Number($(this).attr('title').match(/\d+/)[0]) - 180
  })
  windguru[model].winddirection.splice(spliceStart, spliceEnd)
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

function spliceToFirstDay(array) {
  // Start at 7h
  array.splice(0, 7)
  // end at 21h
  array.splice(15, 60)
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
