
import fs from 'fs';
import http from 'http';
import path from 'path';
import { lookup as lookupMimeType } from 'mime-types';
const hostname = '127.0.0.1';
const port = 8045;
const password = process.env['FILEHOST_PASSWORD'] || process.exit(1)

const server = http.createServer((req, res) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const equivalentLocalFile = `files/${url.pathname}`
    if (req.method === 'GET') {
        if (fs.existsSync(equivalentLocalFile)) {
            res.statusCode = 200;
            const mimeType = lookupMimeType(path.extname(equivalentLocalFile));
            res.setHeader('Content-Type', (typeof mimeType === 'string') ? mimeType : 'application/octet-stream');
            fs.createReadStream(equivalentLocalFile).pipe(res)
        } else {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: "Unknown file" }))
        }
        return
    }
    res.setHeader('Content-Type', 'application/json');
    const authorization = req.headers['authorization'];
    if (authorization !== password) {
        res.statusCode = 403;
        res.end(JSON.stringify({ success: false, error: "Invalid authorization" }))
        return;
    }
    if (req.method === 'PUT') {
        const writeStream = fs.createWriteStream(equivalentLocalFile);
        req.pipe(writeStream);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, url: url.toString() }))
    } else if (req.method === 'DELETE') {
        if (fs.existsSync(equivalentLocalFile)) {
            fs.unlinkSync(equivalentLocalFile)
            res.statusCode = 200
            res.end(JSON.stringify({ success: true }))
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ success: false, error: "Unknown file" }))
        }
    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ success: false, error: "Invalid method" }))
        return;
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

