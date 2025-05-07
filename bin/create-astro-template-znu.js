#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = process.argv[2] || 'my-astro-app';
const templateDir = path.join(__dirname, '../template');

fs.mkdirSync(targetDir, { recursive: true });

function copyRecursive(src, dest) {
    for (const file of fs.readdirSync(src)) {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        if (fs.lstatSync(srcPath).isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log(`📁 Створення проєкту в "${targetDir}"...`);
copyRecursive(templateDir, targetDir);

console.log(`📦 Встановлення залежностей...`);
execSync('npm install', { cwd: targetDir, stdio: 'inherit' });

console.log(`🚀 Готово!`);
console.log(`👉 cd ${targetDir} && npm run dev`);
