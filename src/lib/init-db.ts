import { prisma } from './prisma'
import { AppError } from '@/types/error'

// 初始化系统配置
export async function initSystemConfig() {
  try {
    // 获取环境变量中的API Key和系统提示词
    const envApiKey = process.env.OPENAI_API_KEY || '';
    const envSystemPrompt = process.env.DEFAULT_SYSTEM_PROMPT || '';
    
    console.log("环境变量中API Key是否存在:", !!envApiKey);
    console.log("环境变量中系统提示词是否存在:", !!envSystemPrompt);
    
    if (envApiKey) {
      console.log("环境变量中API Key前10位:", envApiKey.substring(0, 10) + "...");
    }
    
    if (envSystemPrompt) {
      console.log("环境变量中系统提示词:", envSystemPrompt.substring(0, 30) + "...");
    }
    
    // 默认提示词（仅在环境变量中没有设置时使用）
    const defaultPrompt = '你是一位编程学习助手，请用简明易懂的方式帮助用户学习编程。';
    
    // 检查是否已有系统配置
    const configCount = await prisma.systemConfig.count();
    
    if (configCount === 0) {
      // 如果没有，则创建一个默认的系统配置
      const newConfig = await prisma.systemConfig.create({
        data: {
          openaiKey: envApiKey,
          systemPrompt: envSystemPrompt || defaultPrompt
        }
      });
      console.log('已创建默认系统配置:');
      console.log('- API Key状态:', !!newConfig.openaiKey);
      console.log('- 系统提示词:', newConfig.systemPrompt.substring(0, 30) + "...");
    } else {
      // 如果已有配置，确保配置是最新的环境变量值
      const configs = await prisma.systemConfig.findMany();
      const currentConfig = configs[0];
      
      // 要更新的数据
      const updateData: { openaiKey?: string; systemPrompt?: string } = {};
      
      // 只有在环境变量中的API Key不为空时才更新
      if (envApiKey && envApiKey.trim() !== '') {
        updateData.openaiKey = envApiKey;
      }
      
      // 只有在环境变量中的系统提示词不为空时才更新
      if (envSystemPrompt && envSystemPrompt.trim() !== '') {
        updateData.systemPrompt = envSystemPrompt;
      }
      
      // 只有在有数据需要更新时才执行更新
      if (Object.keys(updateData).length > 0) {
        const updatedConfig = await prisma.systemConfig.update({
          where: { id: currentConfig.id },
          data: updateData
        });
        
        console.log('已更新系统配置:');
        console.log('- API Key状态:', !!updatedConfig.openaiKey);
        console.log('- 系统提示词:', updatedConfig.systemPrompt.substring(0, 30) + "...");
      } else {
        console.log('无需更新系统配置');
      }
    }
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('初始化系统配置失败:', appError);
  }
}

// 初始化用户配置
export async function initUserConfig() {
  try {
    // 检查是否已有用户配置
    const configCount = await prisma.userConfig.count()
    
    if (configCount === 0) {
      // 如果没有，则创建一个默认的用户配置
      await prisma.userConfig.create({
        data: {
          openaiKey: '' // 默认为空，用户可以在设置页面填写
        }
      })
      console.log('已创建默认用户配置')
    }
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('初始化用户配置失败:', appError);
  }
}

// 执行所有初始化操作
export async function initDatabase() {
  try {
    await initSystemConfig()
    await initUserConfig()
    console.log('数据库初始化完成')
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('数据库初始化失败:', appError)
    throw appError;
  }
} 