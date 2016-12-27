const React = require('react')
const Page = require('./Page')

module.exports = (entries) => (
  <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/tachyons/css/tachyons.min.css"/>
    </head>
    <body>
      <h1>A Site</h1>
      {entries.map((entry) => (<a href={entry.href}>{entry.title}</a>)}
    </body>
  </html>
)
