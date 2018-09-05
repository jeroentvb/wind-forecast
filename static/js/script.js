var switchLightDark = document.getElementById('switch-light-dark')
var body = document.querySelector('body')
var windDirectionArrow = document.querySelectorAll('.wind-direction-arrow')

var date = new Date()
if(date.getHours() < 8 || date.getHours() > 21) {
  switchDaylight()
}

function switchDaylight() {
  if(body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode')
    switchLightDark.classList.remove('dark-button')
    for(var i=0; i < windDirectionArrow.length; i++) {
      windDirectionArrow[i].setAttribute('src', 'img/arrow.svg')
    }
  } else {
    body.classList.add('dark-mode')
    switchLightDark.classList.add('dark-button')
    for(var i=0; i < windDirectionArrow.length; i++) {
      windDirectionArrow[i].setAttribute('src', 'img/arrow-white.svg')
    }
  }
}

switchLightDark.addEventListener('click', switchDaylight)
