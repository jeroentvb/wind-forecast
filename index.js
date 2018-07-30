var express = require('express')
var request = require('request')
var cheerio = require('cheerio')

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
  res.render('index', {
    page: 'Home'
  })
}

function notFound(req, res) {
  res.status(404).render('error', {
    page: 'Error 404',
    error: 'The page was not found'
  })
}
