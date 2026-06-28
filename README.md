# 资料 H5 前端

面向微信内访问的资料库 H5，复用后端 `t_material` 数据和 `/h5/material/**` 接口。

## 本地开发

```bash
npm install
npm run dev
```

默认通过 Vite 代理把 `/h5` 转发到 `http://localhost`。如果后端不是 80 端口，请修改 `vite.config.js`。

也可以复制 `.env.example` 为 `.env.development`，按你的后端端口修改：

```bash
VITE_PROXY_TARGET=http://localhost:8080
```

如果后端没有启动，页面仍会打开，但列表会显示“资料接口暂时不可用”。

## 生产构建

```bash
npm run build
```

构建产物在 `dist/`。

## 部署方式

推荐把 `dist/` 部署到独立 H5 域名或现有域名的静态目录：

- 同域：`https://api.monkeysxu.top/material/`
- 独立域名：`https://h5.monkeysxu.top/material/`

如果独立域名访问后端接口，请复制 `.env.example` 为 `.env.production`，设置：

```bash
VITE_API_BASE=https://api.monkeysxu.top
```

## 页面配置

可在 `.env.production` 中调整公众号名称和资料领取模块开关：

```bash
VITE_OFFICIAL_ACCOUNT_NAME=猴哥考研
VITE_MATERIAL_ENABLED=true
```

当 `VITE_MATERIAL_ENABLED=false` 时，H5 会隐藏整个“资料领取”模块，只展示学习笔记模块。

## Nginx 示例

```nginx
location /material/ {
    alias /data/www/material-h5/;
    try_files $uri $uri/ /material/index.html;
}

location /h5/ {
    proxy_pass http://127.0.0.1:80/h5/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## 微信内验证

1. 用微信打开 H5 首页，检查列表、分类、搜索和下拉加载。
2. 打开资料详情，检查百度网盘、夸克网盘按钮。
3. 点击网盘按钮，确认提取码可复制，链接能打开。
4. 如果微信拦截跳转，使用页面弹窗里的复制链接兜底。
