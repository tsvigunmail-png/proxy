// server.js
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use("/", createProxyMiddleware({
  target: "https://example.com",
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
