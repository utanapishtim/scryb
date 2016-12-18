
const React = require('react')
const Markdown = require('react.md')

const Tag = ({ tag }) => (<div>{tag}</div>)

const EntryNav = ({ last, next }) => (
  <div id="entry-nav">
    {(last) ? <a id="last" href={last.href}>Last: {last.title}</a> : undefined}
    {(next) ? <a id="next" href={next.href}>Next: {next.title}</a> : undefined}
  </div>
)

const Page = ({ entry, next, last, time}) => (
  <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/tachyons/css/tachyons.min.css"/>
    </head>
    <body>
      <header id="title">
        <h1>{entry.title}</h1>
        <p>{time.created.toString()}</p>
        <p>{(time.lastModified.valueOf() !== time.created.valueOf()) ? `Last Modified: ${time.lastModified.toString()}` : undefined}</p>
      </header>
      <section id="entry">
        <Markdown src={entry.markdown}/>
        <div id="tags">
          {entry.tags.map((tag) => <Tag tag={tag}/>)}
        </div>
      </section>
      <footer>
        {(last || next) ? <EntryNav last={last} next={next}/> : undefined}
      </footer>
    </body>
  </html>
)

module.exports = Page
