# AI学习平台

基于Next.js和OpenAI构建的AI编程学习助手，提供智能聊天和编程学习支持。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fai-learning-platform&env=OPENAI_API_KEY,DEFAULT_SYSTEM_PROMPT&envDescription=API密钥和系统提示词配置&envLink=https://github.com/yourusername/ai-learning-platform#环境变量)

## 功能特点

- 💬 与AI助手实时聊天交流
- 📚 获取编程学习路径和建议
- 🔄 保存聊天记录和会话历史
- 🎨 现代化黑暗主题UI设计
- 🔑 支持自定义OpenAI API Key

## 技术栈

- **前端**: Next.js, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Prisma ORM, PostgreSQL (生产环境), SQLite (开发环境)
- **AI**: OpenAI API
- **部署**: Vercel

## 开发环境设置

1. 克隆仓库:
```bash
git clone https://github.com/yourusername/ai-learning-platform.git
cd ai-learning-platform
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

Created with ❤️ 使用Next.js和OpenAI API

## Docker部署指南

本项目已配置Docker支持，解决了在服务器上"获取会话失败"的问题。主要原因包括：

1. 数据库连接问题 - Docker配置中已添加PostgreSQL数据库服务
2. 环境变量配置问题 - 通过Docker环境变量传递配置
3. API路由500错误问题 - 通过合适的容器设置和启动顺序解决

### 快速部署

1. 确保安装了Docker和docker-compose
2. 检查`.env`文件中的配置（特别是OpenAI API Key）
3. 执行部署脚本：

```bash
# 给脚本添加执行权限
chmod +x scripts/deploy.sh

# 运行部署脚本
./scripts/deploy.sh
```

### 手动部署步骤

如果不使用脚本，您也可以手动执行以下命令：

```bash
# 构建并启动容器
docker-compose up -d

# 查看应用日志
docker-compose logs -f app
```

### 常见问题排查

#### 会话获取失败问题

如果遇到"获取会话失败"的错误：

1. 检查数据库连接：
   ```bash
   docker-compose logs postgres
   ```

2. 检查应用日志：
   ```bash
   docker-compose logs app
   ```

3. 确认API响应：
   ```bash
   curl http://localhost:3000/api/sessions
   ```

#### 500内部服务器错误

如果API返回500错误：

1. 检查Prisma连接：
   ```bash
   # 进入应用容器
   docker-compose exec app sh
   
   # 检查数据库连接
   npx prisma db pull
   ```

2. 重启应用容器：
   ```bash
   docker-compose restart app
   ```

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
