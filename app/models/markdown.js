import MarkdownX from 'markdown-x'
import MarkdownXNode from 'markdown-x/dist/node'
import hljs from 'highlight.js'

;(function() {
  var blockcode = MarkdownX.getRule('md_blockcode')
  if (!blockcode.oldPrepare) {
    blockcode.oldPrepare = blockcode.prepare
  }
  blockcode.prepare = function(...args) {
    var node = blockcode.oldPrepare.apply(this, args)
    if (!node) {
      return node
    }
    var matches = node.attributes.class.match(/highlight-source\-(\w+)$/)
    if (!matches) {
      return node
    }
    var lang = matches[1]
    var nodeValue = node.children[0].children[0].nodeValue
    if (hljs.getLanguage(lang)) {
      nodeValue = hljs.highlight(lang, nodeValue).value
    } else {
      nodeValue = hljs.highlightAuto(nodeValue).value
    }
    node.attributes.class = 'hljs'
    node.children[0].children[0] = {
      nodeName: '#html',
      nodeValue: nodeValue,
    }
    return node
  }
})();


MarkdownX.prototype.toHtml = function() {
  var document = new MarkdownXNode
  this.toNode(document)
  return document.toHtml()
}

MarkdownX.prototype.getExcerpt = function(url) {
  function hrefAttribute(node) {
    var href = node.getAttribute('href')
    if (node.nodeName == 'a' && href && typeof href == 'string' && href.charAt(0) == '#') {
      node.setAttribute('href', url + href)
    }
    for (var i = 0; i < node.childNodes.length; i++) {
      hrefAttribute(node.childNodes[i])
    }
  }


  var document = new MarkdownXNode
  this.toNode(document)

  var child
  var childNodes = []
  var more = false
  for (var i = 0; i < document.childNodes.length; i++) {
    child = document.childNodes[i]
    if (child.nodeType == MarkdownXNode.COMMENT_NODE && ['more', 'nextpage', 'next'].indexOf(child.nodeValue.trim().toLocaleLowerCase()) != -1) {
      more = true
      break
    }
    if (child.getAttribute('class') == 'toc' || child.getAttribute('class') == 'footnotes') {
      continue
    }
    childNodes.push(child)
  }


  var results = []
  var result
  var length = 0
  for (var i = 0; i < childNodes.length; i++) {
    child = childNodes[i]
    hrefAttribute(child)
    result = child.toHtml()
    length += result.length
    if (!more && results.length >= 3) {
      break
    }
    if ((results.length && length > 1024) || length > 2048) {
      break
    }
    results.push(result)
  }

  return results.join('')
}


MarkdownX.prototype.getDescription = function() {
  var child
  var text
  var texts = []
  for (var i = 0; i < this.document.children.length; i++) {
    child = this.document.children[i]
    if (child.nodeName != 'pre' && child.nodeName.charAt(0) != '#' && !child.attributes.class != 'toc' && child.attributes.class != 'footnotes') {
      text = this.toText('', child).trim()
      if (text) {
        texts.push(text)
      }
    }
    if (child.nodeName == '#comment' && ['more', 'nextpage', 'next'].indexOf(child.nodeValue.trim().toLocaleLowerCase()) != -1) {
      texts = [texts.join(' ')]
      break
    }
  }
  text = texts[0] || ''
  if (text.length > 255) {
    text = text.substr(0, 252) + '...'
  }
  return text
}

MarkdownX.prototype.getImages = function(node) {
  if (!node) {
    node = this.parentNode
  }
  var images = []
  var image
  var childImages = []
  var child
  for (var i = 0; i < node.children.length; i++) {
    child = node.children[i]
    if (child.nodeName == 'img') {
      if (child.attributes.src && images.indexOf(child.attributes.src) == -1) {
        images.push(child.attributes.src)
      }
    } else if (child.nodeName == '#document' || child.nodeName.charAt(0) != '#') {
      childImages = this.getImages(child)
      for (let i = 0; i < childImages.length; i++) {
        image = childImages[i]
        if (images.indexOf(image) == -1) {
          images.push(image)
        }
      }
    }
  }
  return images
}






class MarkdownXPost extends MarkdownX {

  constructor(...args) {
    super(...args);
  }

  // 关闭属性过滤器
  filterAttributes() {
    return
  }
}


// 激活所有标签
MarkdownXPost.rules = Object.assign({}, MarkdownXPost.rules)
for (let name in MarkdownXPost.rules) {
  let rule = Object.assign({}, MarkdownXPost.rules[name])
  if (rule.black) {
    rule.black = false
  }
  MarkdownXPost.rules[name] = rule
}



// 组建
export default function (value, options) {
  options = options || {}
  if (options.modelName && options.modelName.toLocaleLowerCase() == 'post') {
    return new MarkdownXPost(value, options)
  }
  return new MarkdownX(value, options)
}
