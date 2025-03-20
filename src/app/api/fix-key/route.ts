import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取环境变量中的API Key
    const envApiKey = process.env.OPENAI_API_KEY || '';
    console.log("环境变量中API Key是否存在:", !!envApiKey);
    
    if (!envApiKey || envApiKey.trim() === '') {
      return NextResponse.json(
        { error: '环境变量中未找到有效的API Key' },
        { status: 500 }
      );
    }
    
    // 强制更新系统配置中的API Key
    const configs = await prisma.systemConfig.findMany();
    if (configs.length > 0) {
      await prisma.systemConfig.update({
        where: { id: configs[0].id },
        data: {
          openaiKey: envApiKey
        }
      });
      
      // 检查更新后的值
      const updated = await prisma.systemConfig.findUnique({
        where: { id: configs[0].id }
      });
      
      console.log("API Key已更新，长度:", updated?.openaiKey?.length || 0);
      console.log("更新后的API Key前10位:", updated?.openaiKey?.substring(0, 10) + "...");
      
      return NextResponse.json({ 
        success: true, 
        message: 'API Key已更新',
        key_length: updated?.openaiKey?.length || 0
      });
    } else {
      await prisma.systemConfig.create({
        data: {
          openaiKey: envApiKey,
          systemPrompt: process.env.DEFAULT_SYSTEM_PROMPT || "你是一位编程学习助手，请用简明易懂的方式帮助用户学习编程。"
        }
      });
      
      console.log("已创建新的系统配置");
      
      return NextResponse.json({ 
        success: true, 
        message: 'API Key已创建',
        key_length: envApiKey.length
      });
    }
  } catch (error: any) {
    console.error('修复API Key失败:', error);
    return NextResponse.json(
      { error: error.message || '修复API Key失败' },
      { status: 500 }
    );
  }
} 