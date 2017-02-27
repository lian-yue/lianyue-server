require('./style/sass/ie.sass');
require('html5shiv');
window.onload = function() {
  var el = document.createElement('div');
  var button = document.createElement('button');
  el.id = 'ie-upgrade';
  el.innerHTML = '<span>你的浏览器过旧 导致大部分功能不可用 如需使用请升级您的浏览器</span>';
  button.className= "close";
  button.setAttribute('type', 'button');
  button.innerHTML = '<span>×</span>'

  button.onclick = function(e) {
    if (e && e.preventDefault) {
      e.preventDefault();
    } else {
      window.event.cancelBubble = true;
    }
    el.parentNode.removeChild(el);
  }
  el.appendChild(button);
  document.body.appendChild(el);
}
