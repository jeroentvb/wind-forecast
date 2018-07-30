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
      var windspeed = new Array
      var windgust = new Array
      var windfinder = new Object

      $('#spotheader-spotname').filter(function() {
        // var data = $(this)
        spot = $(this).text()
      })
      windfinder.spot = spot

      $('.data--major').find($('.units-ws')).filter(function(i) {
        // var data = $(this)
        windspeed[i] = $(this).text()
      })

      $('.data-gusts').find($('.units-ws')).filter(function(i) {
        windgust[i] = $(this).text()
      })

      windfinder.windgust = new Array
      windfinder.windspeed = new Array
      for (let i=7; i < 22; i++) {
        windfinder.windspeed[i - 7] = windspeed[i]
        windfinder.windgust[i - 7] = windgust[i]
      }

      res.render('index', {
        page: 'Wind forecasts',
        windfinder: {
          spot: windfinder.spot,
          windspeed: windfinder.windspeed,
          windgust: windfinder.windgust
        }
      })
    }
  })
}

function notFound(req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
