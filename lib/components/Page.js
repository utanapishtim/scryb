
const React = require('react')
const Markdown = require('react.md')

const Tag = ({ tag }) => (<div>{tag}</div>)

const EntryNav = ({ last, next }) => (
  <div id="entry-nav">
    {(last) ? <a id="last" href={last.href}>Last: {last.title}</a> : undefined}
    {(next) ? <a id="next" href={next.href}>Next: {next.title}</a> : undefined}
  </div>
)

const Page = (entry) => (
  <html>
    <head>
      <link rel="stylesheet" href="https://unpkg.com/tachyons/css/tachyons.min.css"/>
    </head>
    <body>
      <header id="title">
        <h1>{entry.title}</h1>
        <p>{entry.tsPublished.toString()}</p>
        <p>{(entry.tsLastModified.valueOf() !== entry.tsPublished.valueOf()) ? `Last Modified: ${entry.tsLastModified.toString()}` : undefined}</p>
      </header>
      <section id="entry">
        <Markdown src={entry.markdown}/>
        <div id="tags">
          {entry.tags.map((tag) => <Tag tag={tag}/>)}
        </div>
      </section>
      <footer>
        {(entry.last || entry.next) ? <EntryNav last={entry.last} next={entry.next}/> : undefined}
      </footer>
    </body>
  </html>
)

module.exports = Page
