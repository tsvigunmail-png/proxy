// server.js
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import net from "net";
import url from "url";

const app = express();

// HTTP-запросы (обычные сайты)
app.use("/", createProxyMiddleware({
  changeOrigin: true,
  target: "http://example.com",
  router: req => {
    const target = req.headers['x-target-url'] || req.query.url;
    return target || "http://example.com";
  },
  onProxyReq: proxyReq => {
    proxyReq.setHeader("User-Agent", "Mozilla/5.0 (ProxyBot)");
  }
}));

// HTTP сервер
const server = http.createServer(app);

// HTTPS-туннели (CONNECT)
server.on("connect", (req, clientSocket, head) => {
  const { port, hostname } = url.parse(`http://${req.url}`);
  const serverSocket = net.connect(port || 443, hostname, () => {
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on("error", () => clientSocket.end("HTTP/1.1 500 Connection Error\r\n"));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🌐 Full proxy (HTTP + HTTPS) running on port ${PORT}`));
