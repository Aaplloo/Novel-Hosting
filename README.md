# Novel-Hosting Platform

一个专注于提供优质阅读体验的小说托管平台，支持 Markdown 和 PDF 格式小说，并具备特色的段落评论功能。

## ✨ 核心功能

### 📚 阅读体验
- **多格式支持**：原生支持 Markdown 渲染和 PDF 在线阅读。
- **沉浸式阅读**：优化的宽屏阅读界面 (`max-w-7xl`)，提供舒适的阅读体验。
- **安全阅读**：PDF 文件通过 Blob URL 渲染，防止自动下载，保护资源。

### 💬 互动社区
- **段落评论 (独家)**：支持对 Markdown 小说的具体段落进行评论。
    - **悬浮交互**：鼠标悬停段落显示评论图标。
    - **侧边栏互动**：点击段落唤出侧边栏，实时查看和发表评论。
    - **评论徽章**：热门段落自动显示评论计数徽章。

### 🎨 现代 UI 设计
- **卡片式布局**：精美的 `NovelCard` 设计，App Store 风格的悬浮动画和阴影效果。
- **主题风格**：统一的清空蓝 (Sky Blue) 主题色调，视觉清新舒适。
- **响应式设计**：完美适配桌面端和移动端设备。

### 🛠 后台管理
- **封面管理**：支持上传和修改小说封面。
- **权限控制**：内容仅限登录用户查看，保护版权。
- **邀请注册**：通过邀请码控制用户注册。

## 🏗 技术栈

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Network**: Axios
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (JSON Web Tokens)
- **File Handling**: Multer

## 🚀 本地开发

### 环境要求
- Node.js
- MongoDB

### 1. 克隆项目
```bash
git clone https://github.com/Aaplloo/Novel-Hosting.git
cd novel-platform
```

### 2. 后端设置
```bash
cd backend
npm install

# 配置 .env 文件
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

npm start
```

### 3. 前端设置
```bash
cd frontend
npm install
npm run dev
```

## 📝 API 文档
项目包含 `backend/test_comments.http` 文件，可用于快速测试评论相关 API。

## 🤝 贡献
欢迎提交 Issue 或 Pull Request 来改进这个项目！
