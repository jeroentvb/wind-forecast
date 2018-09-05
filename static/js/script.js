var switchLightDark = document.getElementById('switch-light-dark')
var body = document.querySelector('body')

function switchDaylight() {
  if(body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode')
  } else {
    body.classList.add('dark-mode')
  }
}

switchLightDark.addEventListener('click', switchDaylight)
