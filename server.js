const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const fs = require('fs');
const path = require('path');

// Đường dẫn đến thư mục chứa các file JSON
const dataDir = path.join(__dirname, 'data');

// Đọc tất cả file JSON trong thư mục data/
const db = {};
fs.readdirSync(dataDir).forEach(file => {
    if (file.endsWith('.json')) {
        const filePath = path.join(dataDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const key = path.basename(file, '.json');
        db[key] = JSON.parse(fileContent);
    }
});

// Tạo router từ dữ liệu hợp nhất
const router = jsonServer.router(db);

// Tạo router mới cho các endpoint không có tiền tố
const routerNoPrefix = jsonServer.router(db);

// Sử dụng middlewares
server.use(middlewares);

// Thêm CORS
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Trang chủ tùy chỉnh để hiển thị các đường dẫn với tiền tố /api
server.get('/', (req, res) => {
    let resources = '';
    for (const key in db) {
        const type = Array.isArray(db[key]) ? `${db[key].length}x` : 'object';
        resources += `<div><a href="/api/${key}">/api/${key}</a> <span>${type}</span></div>\n`;
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>JSON Server</title>
        <style>
            body { font-family: sans-serif; padding: 30px; }
            h1 { margin-bottom: 20px; }
            div { margin-bottom: 10px; }
            a { color: #0077cc; text-decoration: none; }
            span { color: #666; margin-left: 10px; }
        </style>
    </head>
    <body>
        <h1>JSON Server with API Prefix</h1>
        <p>Congrats! You're successfully running JSON Server with /api prefix</p>
        <h2>Available Resources:</h2>
        ${resources}
    </body>
    </html>
    `;

    res.send(html);
});

// In log để kiểm tra server khởi động
console.log('JSON Server is running');

// Khởi động server trên cổng 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

module.exports = server;