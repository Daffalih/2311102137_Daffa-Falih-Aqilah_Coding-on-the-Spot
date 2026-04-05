const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

let murid = [
    { id: 1, nisn: "0050792469", nama: "Daffa", gender: "Laki-laki" },
    { id: 2, nisn: "0050790123", nama: "Aqilah", gender: "Perempuan" }
];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    // Halaman Tabel
    if (path === '/' && req.method === 'GET') {
        fs.readFile('./views/index.html', (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
    // JSON untuk Jquery Datatable
    else if (path === '/api/murid' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(murid));
    }
    // Halaman Tambah
    else if (path === '/tambah' && req.method === 'GET') {
        fs.readFile('./views/add.html', (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
    // Tambah Data
    else if (path === '/tambah' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const postData = querystring.parse(body);
            const newId = murid.length > 0 ? murid[murid.length - 1].id + 1 : 1;
            murid.push({ id: newId, nisn: postData.nisn, nama: postData.nama, gender: postData.gender });
            res.writeHead(302, { 'Location': '/' });
            res.end();
        });
    }
    // Halaman Edit
    else if (path.startsWith('/edit/') && req.method === 'GET') {
        const id = parseInt(path.split('/')[2]);
        const dataMrd = murid.find(m => m.id === id);
        if (dataMrd) {
            fs.readFile('./views/edit.html', 'utf8', (err, data) => {
                let html = data
                    .replace('{{id}}', dataMrd.id).replace('{{nisn}}', dataMrd.nisn).replace('{{nama}}', dataMrd.nama)
                    .replace('{{sel_l}}', dataMrd.gender === 'Laki-laki' ? 'selected' : '')
                    .replace('{{sel_p}}', dataMrd.gender === 'Perempuan' ? 'selected' : '');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(html);
            });
        } else {
            res.writeHead(302, { 'Location': '/' }); res.end();
        }
    }
    // Edit Data
    else if (path.startsWith('/edit/') && req.method === 'POST') {
        const id = parseInt(path.split('/')[2]);
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const postData = querystring.parse(body);
            const index = murid.findIndex(m => m.id === id);
            if (index !== -1) {
                murid[index].nisn = postData.nisn; murid[index].nama = postData.nama; murid[index].gender = postData.gender;
            }
            res.writeHead(302, { 'Location': '/' });
            res.end();
        });
    }
    // Hapus Data
    else if (path.startsWith('/hapus/') && req.method === 'GET') {
        const id = parseInt(path.split('/')[2]);
        murid = murid.filter(m => m.id !== id);
        res.writeHead(302, { 'Location': '/' });
        res.end();
    }
    // 404 Not Found
    else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Halaman Tidak Ditemukan</h1>');
    }
});

server.listen(3000, () => { console.log('Server berjalan di http://localhost:3000'); });