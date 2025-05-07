#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { create } from 'create-create-app';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

create('astro-starter-template-znu', {
    templateRoot: path.resolve(__dirname, '../'),
});