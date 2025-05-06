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

server.use(middlewares);

// Thêm CORS
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Thêm tiền tố /api cho tất cả các route
server.use('/api', router);

// In log để kiểm tra server khởi động
console.log('JSON Server is running');

// Khởi động server trên cổng 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('API endpoints available at http://localhost:3000/api/<têndata>');
});

module.exports = server;