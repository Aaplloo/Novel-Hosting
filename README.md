# Novel Platform

Novel Platform 是一个前后端分离的小说托管与阅读系统。它面向私域阅读场景，提供邀请码注册、登录鉴权、小说上传、Markdown/PDF 阅读、段落评论、封面管理、用户上传权限管理和邀请码管理。

## 项目概览

- 前端：React 19 + Vite + Tailwind CSS，包含首页、登录、注册、后台管理和小说阅读页。
- 后端：Node.js + Express + MongoDB/Mongoose，提供认证、小说、评论和后台管理 API。
- 存储：默认使用后端本地 `backend/uploads`；配置 DigitalOcean Spaces 后可将小说、封面和 ZIP 解包资源上传到对象存储。
- 鉴权：JWT token 存储在浏览器 `localStorage`，前端通过 `x-auth-token` 调用受保护接口。

## 核心功能

### 账户与权限

- 用户必须通过邀请码注册。
- 登录后可访问受保护的小说详情和正文内容。
- 用户模型包含 `isAdmin` 和 `canUpload` 两类权限字段。
- 管理员可管理邀请码、查看用户列表，并为普通用户开启或关闭上传权限。

### 小说托管

- 支持上传 `.md`、`.pdf` 和 `.zip` 文件。
- `.zip` 包会被解包，并自动寻找其中的 Markdown 文件作为正文入口。
- Markdown 包内图片可按相对路径展示。
- 支持上传和更换封面图。
- 删除小说时会清理本地文件或对象存储中的相关资源。

### 阅读体验

- 首页展示小说列表与封面。
- Markdown 小说使用 `react-markdown` 渲染，并按段落拆分，支持逐段互动。
- PDF 小说通过 iframe 在线阅读。
- 未登录用户无法打开小说正文。

### 段落评论

- 评论以 `novelId + chapterIndex + paragraphIndex` 定位到具体段落。
- 登录用户可发表评论。
- 阅读页会显示段落评论数量，并通过侧边栏查看和提交评论。
- 当前章节索引为 MVP 形态，前端默认使用 `chapterIndex=1`。

## 目录结构

```text
.
├── backend/
│   ├── config/              # MongoDB 连接
│   ├── controllers/         # 业务控制器
│   ├── middleware/          # JWT、管理员、上传权限、Multer
│   ├── models/              # User、Novel、Comment、InvitationCode
│   ├── routes/              # auth、novels、comments、admin API
│   ├── services/            # DigitalOcean Spaces 存储适配
│   ├── uploads/             # 本地上传文件
│   ├── server.js            # Express 入口
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar、NovelCard、CommentSidebar 等
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Home/Login/Register/Admin/Novel 页面
│   │   └── utils/           # Axios token 设置
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 技术栈

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- React Markdown

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT
- bcryptjs
- Multer
- adm-zip
- AWS SDK S3 Client，用于 DigitalOcean Spaces 兼容接口

## 本地开发

### 环境要求

- Node.js
- npm
- MongoDB 实例

### 后端

```bash
cd backend
npm install
```

创建 `backend/.env`：

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/novel-platform
JWT_SECRET=replace-with-a-long-random-secret
```

如需启用 DigitalOcean Spaces，再添加：

```env
DO_SPACES_KEY=your-access-key
DO_SPACES_SECRET=your-secret-key
DO_SPACES_BUCKET=your-bucket
DO_SPACES_REGION=your-region
DO_SPACES_ENDPOINT=https://your-region.digitaloceanspaces.com
DO_SPACES_PUBLIC_BASE_URL=https://your-bucket.your-region.digitaloceanspaces.com
```

启动后端：

```bash
npm start
```

后端默认监听 `http://localhost:5000`。

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端默认由 Vite 提供本地开发服务。注意：当前前端代码中的 API 地址硬编码为 `https://novel-hosting.onrender.com`，本地联调时需要改为本地后端地址，或抽出为环境变量后再运行。

## API 概览

### Auth

- `POST /api/auth/register`：使用邀请码注册。
- `POST /api/auth/login`：登录并返回 JWT。
- `GET /api/auth/me`：获取当前用户信息，需要 token。

### Novels

- `GET /api/novels`：获取小说列表。
- `POST /api/novels`：上传小说文件和可选封面，需要登录且拥有管理员或上传权限。
- `GET /api/novels/:id`：获取单本小说信息，需要登录。
- `GET /api/novels/:id/content`：获取 Markdown 正文，需要登录。
- `PUT /api/novels/:id/cover`：更新封面，需要管理员权限。
- `DELETE /api/novels/:id`：删除小说，需要管理员权限。

### Comments

- `GET /api/comments?novelId=<id>&chapterIndex=1`：获取指定小说章节评论。
- `POST /api/comments`：发表评论，需要登录。

### Admin

- `GET /api/admin/users`：获取用户列表，需要管理员权限。
- `PATCH /api/admin/users/:id/permissions`：更新用户上传权限，需要管理员权限。
- `GET /api/admin/invitation-codes`：获取邀请码列表，需要管理员权限。
- `POST /api/admin/invitation-codes`：创建邀请码，需要管理员权限。
- `DELETE /api/admin/invitation-codes/:id`：删除邀请码，需要管理员权限。

评论接口示例可参考 `backend/test_comments.http`。

## 数据模型摘要

- `User`：姓名、邮箱、密码哈希、是否管理员、是否可上传、创建时间。
- `InvitationCode`：邀请码、是否已使用、创建时间。
- `Novel`：标题、作者、文件路径、文件类型、封面、创建时间。
- `Comment`：小说 ID、章节索引、段落索引、用户、内容、创建时间。

## 注意事项

- 后端 `npm test` 目前仍是占位脚本，没有自动化测试。
- 前端 `npm run build` 可用于验证生产构建。
- 本地上传文件会写入 `backend/uploads`；生产环境建议使用对象存储，避免部署平台重启或重新发布时丢失文件。
- 首个管理员账号需要通过数据库或运维脚本设置 `isAdmin=true`。
