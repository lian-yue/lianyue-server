window.onload = function() {
  var el = document.createElement('div');
  var button = document.createElement('button');
  el.id = 'ie-upgrade';
  el.setAttribute('style', 'z-index: 999999;position: absolute;position: fixed;left: 0;right: 0;top: 0;color: #f00;font-weight: bold;font-size: 24px;background-color: #fff;border-bottom: 1px solid #ccc;text-align: center;padding: 1em;')
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
  document.body.insertBefore(el, document.body.childNodes[0]);
}
