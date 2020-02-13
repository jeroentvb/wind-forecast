function trim (data) {
  data.forEach(model => {
    if (model.name === 'Windfinder') {
      model = trimWindfinder(model)
    } else {
      model = trimWinddata(model)
    }
  })

  return data
}

function trimWindfinder (windfinder) {
  windfinder.days.forEach(day => {
    day.hours = day.hours.filter(hour => {
      if (hour.hour < 8 || hour.hour > 22) return false
      return true
    })
  })

  return windfinder
}

function trimWinddata (models) {
  models.models.forEach(model => {
    model.days.forEach(day => {
      day.hours = day.hours.filter(hour => {
        if (hour.hour < 8 || hour.hour > 22) return false
        return true
      })
    })
  })

  return models
}

module.exports = {
  trim
}
