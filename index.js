#!/usr/bin/env node

require('./dist')(require('minimist')(process.argv.slice(2)))
