function spliceToDayHours (array) {
  // Remove the first 7 hours
  array.splice(0, 7)
  // Remove the night between day 1 and 2
  array.splice(16, 8)
  // Remove the night between day 2 and 3
  array.splice(32, 8)
  // Remove last hour of day 3 (23h)
  array.splice(48, 10)
}

function exportData (jsonObject, name) {
  const fs = require('fs')
  const chalk = require('chalk')
  fs.writeFile(name + '-offline-data.json', JSON.stringify(jsonObject, null, 4), err => {
    if (err) throw err
    console.log(chalk.yellow('File written'))
  })
}

module.exports = {
  spliceToDayHours,
  exportData
}
