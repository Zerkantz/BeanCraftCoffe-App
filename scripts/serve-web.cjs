const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./prepare-web.cjs');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
require('./prepare-design.cjs').prepareDesign();
const port = Number(process.env.PORT || 8000);
http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  let file;
  try { file = path.resolve(ROOT, `.${decodeURIComponent(pathname === '/' ? '/index.html' : pathname)}`); }
  catch { res.writeHead(400).end(); return; }
  const relative = path.relative(ROOT, file);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some((part) => part.startsWith('.')) || !types[path.extname(file)] || /^(node_modules|tests|scripts|mobile)(?:[\\/]|$)/.test(relative)) {
    res.writeHead(403).end(); return;
  }
  fs.readFile(file, (error, content) => {
    if (error) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] });
    res.end(content);
  });
}).listen(port, '127.0.0.1', () => console.log(`BeanCraft web: http://localhost:${port}`));
