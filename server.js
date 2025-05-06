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

// Middleware để điều hướng các request không có tiền tố /api
server.use((req, res, next) => {
    if (!req.url.startsWith('/api') && req.url !== '/') {
        // Chuyển hướng từ /<resource> sang /api/<resource>
        req.url = `/api${req.url}`;
    }
    next();
});

// Thêm tiền tố /api cho tất cả các route
server.use('/api', router);

// Thay đổi trang mặc định để hiển thị các đường dẫn với tiền tố /api
const originalRender = jsonServer.defaults.homepage;
if (originalRender) {
    const customRender = (req, res) => {
        const originalHtml = fs.readFileSync(path.join(__dirname, 'node_modules', 'json-server', 'dist', 'public', 'index.html'), 'utf8');

        // Sửa đổi HTML để thêm tiền tố /api vào các đường dẫn
        const modifiedHtml = originalHtml.replace(/(href=")\/([^"]+)/g, '$1/api/$2');

        res.send(modifiedHtml);
    };


    server.get('/', customRender);
}

// In log để kiểm tra server khởi động
console.log('JSON Server is running');

// Khởi động server trên cổng 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('API endpoints available at http://localhost:3000/api/<têndata>');
});

module.exports = server;