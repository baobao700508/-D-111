FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app

# 复制package.json和lock文件
COPY package.json package-lock.json* ./

# 安装依赖包，确保包含prisma
RUN npm ci

# 设置构建环境
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# 生成Prisma客户端并构建应用
RUN npx prisma generate
RUN npm run build

# 生产环境
FROM base AS runner
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# 复制构建好的应用和必要文件
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.env ./.env

# 确保Prisma可以正常工作
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 暴露端口
EXPOSE 3000

# 设置命令
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动前先迁移数据库
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"] 