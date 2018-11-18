var switchLightDark = document.getElementById('switch-light-dark')
var body = document.querySelector('body')
var windDirectionArrow = document.querySelectorAll('.wind-direction-arrow')

function switchDaylight () {
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode')
    switchLightDark.classList.remove('dark-button')
    for (var i = 0; i < windDirectionArrow.length; i++) {
      windDirectionArrow[i].setAttribute('src', 'img/arrow-white.svg')
    }
  } else {
    body.classList.add('light-mode')
    switchLightDark.classList.add('dark-button')
    for (var x = 0; x < windDirectionArrow.length; x++) {
      windDirectionArrow[i].setAttribute('src', 'img/arrow.svg')
    }
  }
}

switchLightDark.addEventListener('click', switchDaylight)
