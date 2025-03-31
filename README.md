# Cal AI 智能助手

基于Next.js和OpenAI构建的智能聊天助手，提供智能对话和实时反馈。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbaobao700508%2F-D-111&env=OPENAI_API_KEY,DEFAULT_SYSTEM_PROMPT&envDescription=API密钥和系统提示词配置&envLink=https://github.com/baobao700508/-D-111#环境变量)

## 功能特点

- 💬 与AI助手实时聊天交流
- 🤖 自动生成会话主题，轻松整理对话
- 📚 获取编程学习路径和建议
- 🔄 保存聊天记录和会话历史
- 🎨 现代化黑暗主题UI设计
- 🔑 支持自定义OpenAI API Key

## 技术栈

### 前端
- **Next.js**: 15.2.3 - React应用框架，支持SSR和API路由
- **React**: 19.0.0 - 用户界面库
- **TypeScript**: 5.x - 类型安全的JavaScript超集
- **TailwindCSS**: 4.x - 实用优先的CSS框架

### 后端
- **Next.js API Routes** - 无服务器API端点
- **Prisma ORM**: 6.5.0 - 数据库访问和模型定义
- **OpenAI SDK**: 4.89.0 - OpenAI API的官方JavaScript客户端

### 数据库
- **PostgreSQL**: 16 (生产) - 强大的关系型数据库
- **SQLite**: 3 (开发) - 轻量级文件数据库

### DevOps
- **Docker**: 使用多阶段构建的容器化
- **docker-compose**: 容器编排
- **Node.js**: 20 LTS - JavaScript运行时
- **Vercel**: 部署平台，支持Edge函数

### 工具和依赖
- **uuid**: 11.1.0 - 生成唯一标识符
- **lucide-react**: 0.483.0 - 精美的图标集
- **ESLint**: 9.x - 代码质量和风格检查
- **Turbopack** - 用于开发环境的高速打包工具

## 开发环境设置

1. 克隆仓库:
```bash
git clone https://github.com/baobao700508/-D-111.git
cd -D-111
```

2. 安装依赖:
```bash
npm install
```

3. 创建环境变量文件:
```bash
cp .env.example .env
```

4. 修改`.env`文件，填入你的OpenAI API Key

5. 初始化开发数据库:
```bash
npx prisma generate
npx prisma db push
```

6. 启动开发服务器:
```bash
npm run dev
```

7. 打开 [http://localhost:3000](http://localhost:3000) 查看应用

## 部署到Vercel

1. Fork此仓库到你的GitHub账户
2. 在Vercel控制台中导入项目
3. 配置环境变量:
   - `OPENAI_API_KEY`: 你的OpenAI API密钥
   - `DEFAULT_SYSTEM_PROMPT`: 系统提示词
   - `DATABASE_URL`: PostgreSQL数据库URL (Vercel可自动提供)
4. 点击部署

## 许可证

MIT

---

Created by Liangjian Jin with ❤️ 使用Next.js和OpenAI API

## Docker部署指南

本项目提供了完整的Docker配置，支持一键部署应用和数据库。使用Docker可以避免环境差异导致的问题，特别是解决了在服务器环境中常见的"获取会话失败"等问题。

### 系统要求

- Docker 20.10+ 和 docker-compose 2.0+
- 至少 1GB 内存和 1GB 磁盘空间
- 开放端口: 3000 (应用) 和 5432 (PostgreSQL，可选)

### 环境配置

1. 复制示例环境文件并配置必要变量：

```bash
cp .env.example .env
```

2. 在`.env`文件中设置以下关键变量：

```
# 必须设置
OPENAI_API_KEY="你的OpenAI API密钥" 

# 可选自定义
DEFAULT_SYSTEM_PROMPT="自定义系统提示词"
```

### 快速部署

提供了自动部署脚本，一键完成构建和启动：

```bash
# 给脚本添加执行权限
chmod +x scripts/deploy.sh

# 运行部署脚本
./scripts/deploy.sh
```

脚本将自动执行以下操作：
- 检查环境变量配置
- 停止并移除旧容器
- 构建新容器并启动服务
- 验证应用是否正常运行

### 手动部署步骤

如果需要更灵活的部署方式，可以手动执行以下命令：

```bash
# 构建服务
docker-compose build --no-cache

# 启动服务
docker-compose up -d

# 查看启动日志
docker-compose logs -f app
```

### 容器组件说明

本项目包含两个主要容器：

1. **app** - Next.js应用服务
   - 基于Node.js 20 Alpine
   - 包含完整的应用代码和依赖
   - 自动生成Prisma客户端
   - 在启动前自动应用数据库迁移

2. **postgres** - PostgreSQL数据库服务
   - 基于PostgreSQL 16 Alpine
   - 持久化数据存储于命名卷中
   - 默认用户名/密码: postgres/postgres
   - 默认数据库名: calai

### 常见问题排查

#### 1. 应用无法启动

```bash
# 查看应用日志
docker-compose logs app

# 检查容器状态
docker-compose ps
```

#### 2. 会话获取失败问题

如果遇到"获取会话失败"的错误：

1. 检查数据库连接：
   ```bash
   docker-compose logs postgres
   ```

2. 检查数据库初始化状态：
   ```bash
   # 进入应用容器
   docker-compose exec app sh
   
   # 检查Prisma连接
   npx prisma migrate status
   ```

3. 验证API响应：
   ```bash
   curl http://localhost:3000/api/sessions
   ```

#### 3. OpenAI API错误

如果遇到AI相关功能不可用：

```bash
# 检查环境变量是否正确传递到容器
docker-compose exec app sh -c 'echo $OPENAI_API_KEY'

# 查看API请求日志
docker-compose logs app | grep 'OpenAI API'
```

#### 4. 数据持久化问题

数据存储在命名卷中，可以通过以下方式管理：

```bash
# 列出所有卷
docker volume ls | grep cal-ai

# 备份数据库
docker-compose exec postgres pg_dump -U postgres calai > backup.sql

# 恢复数据库
cat backup.sql | docker exec -i $(docker-compose ps -q postgres) psql -U postgres -d calai
```

### 生产环境优化

对于生产环境，建议进行以下优化：

1. 使用环境变量设置强密码：
   ```
   POSTGRES_PASSWORD=强密码
   ```

2. 配置反向代理（Nginx/Caddy）并启用HTTPS

3. 设置资源限制：
   ```
   # 在docker-compose.yml中为每个服务添加
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

4. 配置数据备份策略，定期备份数据库卷

### 更新应用

要更新到最新版本：

```bash
# 拉取最新代码
git pull

# 重新部署
./scripts/deploy.sh
```

更多技术栈信息参见下方[技术栈](#技术栈)部分。

## 本地开发

如需在本地开发环境运行：

```bash
# 安装依赖
npm install

# 生成Prisma客户端
npx prisma generate

# 启动开发服务器
npm run dev
```

## 技术栈

- **前端框架**：Next.js 15
- **数据库**：PostgreSQL (通过Prisma ORM访问)
- **AI接口**：OpenAI API
- **容器化**：Docker & docker-compose
