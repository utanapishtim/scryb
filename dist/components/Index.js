const React = require('react');
const Page = require('./Page');

module.exports = ({ entries }) => React.createElement(
  'html',
  null,
  React.createElement(
    'head',
    null,
    React.createElement('link', { rel: 'stylesheet', href: 'https://unpkg.com/tachyons/css/tachyons.min.css' })
  ),
  React.createElement(
    'body',
    null,
    React.createElement(
      'h1',
      null,
      'A Site'
    ),
    entries.map(entry => React.createElement(
      'div',
      null,
      React.createElement(
        'a',
        { href: entry.href },
        entry.title
      )
    ))
  )
);