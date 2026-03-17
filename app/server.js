'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const { answerQuestion } = require('./chatbot');
const { fetchStoreDiagnosis, initDb } = require('./db');

const STATIC_DIR = path.join(__dirname, 'static');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function sendJson(res, statusCode, payload) {
  const body = Buffer.from(JSON.stringify(payload), 'utf-8');
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
  });
  res.end(body);
}

function serveStatic(req, res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (req.method === 'GET') {
    if (pathname === '/api/diagnosis') {
      sendJson(res, 200, { stores: fetchStoreDiagnosis() });
      return;
    }
    const file = pathname === '/' || pathname === '/index.html' ? 'index.html' : pathname.slice(1);
    serveStatic(req, res, path.join(STATIC_DIR, file));
    return;
  }

  if (req.method === 'POST') {
    if (pathname !== '/api/chat') {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      let message = '';
      try {
        const data = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
        message = data.message || '';
      } catch {
        sendJson(res, 400, { error: 'Invalid JSON payload' });
        return;
      }
      sendJson(res, 200, { answer: answerQuestion(message) });
    });
    return;
  }

  res.writeHead(405);
  res.end('Method Not Allowed');
}

function run(host = '0.0.0.0', port = 8000) {
  initDb();
  const server = http.createServer(handleRequest);
  server.listen(port, host, () => {
    console.log(`Store dashboard started: http://${host}:${port}`);
  });
}

if (require.main === module) {
  run();
}

module.exports = { run };
