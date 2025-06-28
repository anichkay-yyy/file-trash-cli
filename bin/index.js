#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Table = require('cli-table3');

function formatTime(ms) {
    if (ms < 0) return 'истёк';

    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const s = Math.floor((ms / 1000) % 60);
    const msLeft = ms % 1000;

    return `${d}д ${h}ч ${m}м ${s}с ${msLeft}мс`;
}

function formatSize(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' МБ';
}

function listFileLifetimes(dirPath) {
    const now = Date.now();
    let totalSize = 0;

    const table = new Table({
        head: ['Осталось жизни', 'Имя файла', 'Размер'],
        colWidths: [25, 50, 15],
        wordWrap: true
    });

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (!stat.isFile()) continue;

        const [expiresStr] = file.split('_');
        const expiresAt = parseInt(expiresStr);

        if (isNaN(expiresAt)) {
            table.push(['⚠️ Неверное имя', file, '—']);
            continue;
        }

        const timeLeft = expiresAt - now;
        const sizeMb = formatSize(stat.size);
        totalSize += stat.size;

        table.push([
            formatTime(timeLeft),
            file,
            sizeMb
        ]);
    }

    console.log(table.toString());

    console.log(`\n🧮 Общий размер всех файлов: ${formatSize(totalSize)}\n`);
}

listFileLifetimes("/home/anichkay/file-trash/store");
