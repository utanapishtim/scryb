const React = require('react')
const Page = require('./Page')
const { objMap } = require('../utils')

module.exports = ({ entries }) => (
  <html>
    <head>
      <link rel='stylesheet' href='https://unpkg.com/tachyons/css/tachyons.min.css' />
    </head>
    <body>
      <h1>A Site</h1>
      {entries.map((entry) => (<div><a href={entry.href}>{entry.title}</a></div>))}
    </body>
  </html>
)
