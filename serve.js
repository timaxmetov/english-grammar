// Локальный статический сервер для предпросмотра.
// Без зависимостей: node serve.js [порт]
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';

  // не выпускаем запрос за пределы папки проекта
  const file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('403 Forbidden');
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p>Не найдено: ' + rel + '</p><p><a href="/">На главную</a></p>');
      console.log('404', rel);
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store', // чтобы правки были видны сразу, без ручного сброса кэша
    });
    res.end(data);
    console.log('200', rel, data.length + ' Б');
  });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error('Порт ' + PORT + ' уже занят. Запустите: node serve.js 8081');
    process.exit(1);
  }
  throw e;
});

server.listen(PORT, () => {
  console.log('Сервер поднят: http://localhost:' + PORT + '/');
  console.log('Папка: ' + ROOT);
});
