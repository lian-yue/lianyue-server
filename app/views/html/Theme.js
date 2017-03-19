import React from 'react'
import serialize from 'serialize-javascript'
import { renderToString } from 'react-dom/server'


const site = __CONFIG__.site

export default function({store, children}) {
  const app = renderToString(children);
  const state = store.getState()
  const headers = state.get('headers')
  const reduxState = 'window.__REDUX_STATE__ = ' + serialize(state) + ';'

  const html = headers.get('html') ? headers.get('html').toJS()  : {}
  const title = headers.get('title') || []
  const meta = headers.get('meta') || []
  const link = headers.get('link') || []
  const ie = `<!--[if lt IE 9]><script type="text/javascript" src="${site.assets}/html/ie.js?v=${__CONFIG__.version}"></script><![endif]-->`;
  const css = process.env.NODE_ENV == 'development' ? null : <link rel="stylesheet" type="text/css"  media="all" href={site.assets + '/html/bundle.css?v=' + __CONFIG__.version} />
  return <html lang="zh-CN" {...html}>
    <head>
      <meta charSet="utf-8" />
      <title>{title.join(' - ')}</title>
      <meta httpEquiv="Cache-Control" content="no-siteapp" />
      <meta httpEquiv="Cache-Control" content="no-transform" />
      <meta httpEquiv="X-UA-Compatible" content="IE=Edge, chrome=1" />
      <meta name="distribution" content="web" />
      <meta name="renderer" content="webkit" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="applicable-device" content="pc, mobile" />
      <meta property="og:locale" content="zh_CN" />
      <meta property="og:site_name" content={site.title} />
      <meta property="twitter:site" content={site.title} />
      {meta.map(function(value, key) {
        return <meta key={key} {...value.toJS()} data-header/>
      })}
      {link.map(function(value, key) {
        return <link key={key} {...value.toJS()} data-header/>
      })}

      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="icon" sizes="196x196" href="/icon-196.png" />
      <link rel="profile" href="http://gmpg.org/xfn/11" />
      {css}
    </head>
    <body>
      <div id="ie" dangerouslySetInnerHTML={{__html: ie}}></div>
      <div id="app" dangerouslySetInnerHTML={{__html: app}}></div>
      <script type="text/javascript" dangerouslySetInnerHTML={{__html:  reduxState}}></script>
      <script type="text/javascript" src={site.assets + '/html/bundle.js?v=' + __CONFIG__.version} async></script>
    </body>
  </html>
}
