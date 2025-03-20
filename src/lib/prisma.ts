import { PrismaClient } from '@prisma/client'

// 为不同环境创建适当的Prisma客户端
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

// 确保在开发环境中不会创建多个Prisma客户端实例
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 启动时处理连接
if (process.env.NODE_ENV === 'production') {
  console.log('Connecting to production database...')
} else {
  console.log('Connecting to development database...')
} 