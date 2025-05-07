#!/usr/bin/env node

const path = require('path');
const { create } = require('create-create-app');

const templateRoot = path.resolve(__dirname, '../');

create('astro-starter-template-znu', {
    templateRoot,
});