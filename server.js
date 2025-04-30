const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Thêm CORS
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

server.use(router);

// In log để kiểm tra server khởi động
console.log('JSON Server is running');

// Khởi động server trên cổng 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

module.exports = server;