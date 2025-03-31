import { prisma } from './prisma';

/**
 * 初始化数据库基本配置
 */
async function initDatabase() {
  console.log('正在初始化数据库...');
  
  try {
    // 检查是否有系统配置
    const systemConfigCount = await prisma.systemConfig.count();
    
    if (systemConfigCount === 0) {
      console.log('正在创建默认系统配置...');
      await prisma.systemConfig.create({
        data: {
          systemPrompt: '你是一位编程学习助手，请用简明易懂的方式帮助用户学习编程。',
          openaiKey: process.env.OPENAI_API_KEY || '',
        }
      });
      console.log('默认系统配置创建成功');
    } else {
      console.log('系统配置已存在，跳过创建');
    }
    
    // 检查是否有用户配置
    const userConfigCount = await prisma.userConfig.count();
    
    if (userConfigCount === 0) {
      console.log('正在创建默认用户配置...');
      // 由于prisma的类型问题，我们使用prisma.$executeRaw来执行原始SQL
      await prisma.$executeRaw`INSERT INTO "UserConfig" (id, "openaiKey", language, "createdAt", "updatedAt") VALUES (gen_random_uuid(), NULL, 'zh', NOW(), NOW())`;
      console.log('默认用户配置创建成功');
    } else {
      console.log('用户配置已存在，跳过创建');
    }
    
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 直接调用初始化函数
initDatabase(); 