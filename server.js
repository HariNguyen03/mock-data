const jsonServer = require("json-server");
const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const fs = require("fs");
const path = require("path");

// Đường dẫn đến thư mục chứa các file JSON
const dataDir = path.join(__dirname, "data");

// Route trả về danh sách các endpoint có thể truy cập
server.get("/", (req, res) => {
  function getAllJsonPaths(dir, prefix = "") {
    let results = {};
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat && stat.isDirectory()) {
        const subResults = getAllJsonPaths(filePath, prefix + file + "/");
        results[file] = subResults;
      } else if (file.endsWith(".json")) {
        const route = prefix + file.replace(/\.json$/, "");
        if (!results["files"]) {
          results["files"] = [];
        }
        results["files"].push(route);
      }
    });
    return results;
  }

  const endpoints = getAllJsonPaths(dataDir);

  function generateHTML(endpoints) {
    let html = "";
    for (const [key, value] of Object.entries(endpoints)) {
      if (key === "files") continue;
      html += `<div class="card">
        <div class="card-title">${key}</div>
        <ul class="endpoint-list">
          ${(value.files || [])
            .map(
              (route) => `
            <li class="endpoint-item">
              <span class="method-label">GET</span>
              <a class="endpoint-path" href="/api/${route}" target="_blank">/api/${route}</a>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>`;
    }
    return html;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API JSON Server</title>
      <style>
        body {
          background: #181f2a;
          color: #e3e6ed;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        h1 {
          color: #6ee7b7;
          text-align: center;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: #a0aec0;
          text-align: center;
          margin-bottom: 2rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 2rem;
        }
        .card {
          background: #232b3b;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          padding: 1.5rem 1.2rem 1.2rem 1.2rem;
          display: flex;
          flex-direction: column;
        }
        .card-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #e3e6ed;
          margin-bottom: 1rem;
          letter-spacing: 1px;
        }
        .endpoint-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .endpoint-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.7rem;
          background: #1a2232;
          border-radius: 6px;
          padding: 0.5rem 0.8rem;
        }
        .method-label {
          display: inline-block;
          font-size: 0.85rem;
          font-weight: bold;
          color: #10b981;
          background: #16202e;
          border-radius: 4px;
          padding: 0.2rem 0.7rem;
          margin-right: 1rem;
          letter-spacing: 1px;
        }
        .endpoint-path {
          font-family: 'Fira Mono', 'Consolas', monospace;
          color: #60a5fa;
          font-size: 1rem;
          word-break: break-all;
          text-decoration: none;
          transition: color 0.2s;
        }
        .endpoint-path:hover {
          color: #38bdf8;
          text-decoration: underline;
        }
        @media (max-width: 700px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>API EXO JSON SERVER</h1>
        <div class="subtitle">Current server API: <span style="color:#6ee7b7">https://mock-data-snyc.onrender.com</span></div>
        <div class="grid">
          ${generateHTML(endpoints)}
        </div>
      </div>
    </body>
    </html>
  `;

  res.send(html);
});

server.use(middlewares);

// Thêm CORS
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Route động trả về file JSON theo đường dẫn
server.get("/api/*", (req, res) => {
  // Lấy đường dẫn sau /api, loại bỏ dấu / đầu
  const urlPath = req.path.replace(/^\/api\//, "");
  // Đường dẫn tới file JSON tương ứng
  const jsonFile = path.join(dataDir, urlPath + ".json");
  if (fs.existsSync(jsonFile)) {
    try {
      const data = fs.readFileSync(jsonFile, "utf8");
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({error: "Lỗi đọc file JSON."});
    }
  } else {
    res.status(404).json({error: "Không tìm thấy file JSON."});
  }
});

console.log("JSON Server is running");

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

module.exports = server;
