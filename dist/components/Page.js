
const React = require('react');
const Markdown = require('react.md');

const Tag = ({ tag }) => React.createElement(
  'div',
  null,
  tag
);

const EntryNav = ({ last, next }) => React.createElement(
  'div',
  { id: 'entry-nav' },
  last ? React.createElement(
    'a',
    { id: 'last', href: last.href },
    'Last: ',
    last.title
  ) : undefined,
  next ? React.createElement(
    'a',
    { id: 'next', href: next.href },
    'Next: ',
    next.title
  ) : undefined
);

const Page = entry => React.createElement(
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
      'header',
      { id: 'title' },
      React.createElement(
        'h1',
        null,
        entry.title
      ),
      React.createElement(
        'p',
        null,
        entry.tsPublished
      ),
      React.createElement(
        'p',
        null,
        entry.tsLastModified !== entry.tsPublished ? `Last Modified: ${ entry.tsLastModified }` : undefined
      )
    ),
    React.createElement(
      'section',
      { id: 'entry' },
      React.createElement(Markdown, { src: entry.markdown }),
      React.createElement(
        'div',
        { id: 'tags' },
        entry.tags.map(tag => React.createElement(Tag, { tag: tag }))
      )
    ),
    React.createElement(
      'footer',
      null,
      entry.last || entry.next ? React.createElement(EntryNav, { last: entry.last, next: entry.next }) : undefined
    )
  )
);

module.exports = Page;