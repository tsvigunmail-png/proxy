// server.js
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// Позволяем проксировать любой URL, передаваемый как query
app.use("/", createProxyMiddleware({
  target: "https://example.com", // базовый URL
  changeOrigin: true,
  router: req => req.query.url || "https://example.com",
  pathRewrite: (path, req) => {
    const url = new URL(req.url, "http://localhost");
    return url.pathname + url.search;
  },
  onProxyReq: proxyReq => {
    proxyReq.setHeader("User-Agent", "Mozilla/5.0 (ProxyBot)");
  }
}));

app.listen(10000, () => console.log("Proxy running on port 10000"));
