[x] pass in custom components to render for each markdown type, page, tags
[x] render page correctly
[x] register custom components -> start with just a soft link, could copy everything over but that would prevent editing
[ ] write cli
    [x] publish
    [x] init
    [x] config
    [ ] watch

# WORKFLOW
1. create an .md file in some dir
2. make changes to that file, ideally we have a scryb watch <filename> to live reload file in browser
3. when you are ready to publish run scryb publish <filename> --target=<target> to publish the file

basically, all .md files are untracked
when you publish a file it gets tracked in a target .scryb-config.json
when you publish n files at the same time the ordering is arbitrary
when you republish a file with the same name as an existing file in the target dir, it gets a 'last modified' and markdown update.
