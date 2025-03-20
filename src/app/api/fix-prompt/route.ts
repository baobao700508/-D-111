import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/types/error';

export async function GET() {
  try {
    // 获取环境变量中的系统提示词
    const envSystemPrompt = process.env.DEFAULT_SYSTEM_PROMPT || '';
    console.log("环境变量中系统提示词是否存在:", !!envSystemPrompt);
    
    // 如果环境变量中没有设置系统提示词，使用默认值
    const systemPromptToUse = envSystemPrompt && envSystemPrompt.trim() !== '' 
      ? envSystemPrompt 
      : '你是一位编程学习助手，擅长提供简明易懂的编程知识和学习建议。尽量用简单的语言解释复杂的概念，并给出实用的学习路径和示例代码。';
    
    console.log("将使用的系统提示词:", systemPromptToUse.substring(0, 30) + "...");
    
    // 查找现有的系统配置
    const configs = await prisma.systemConfig.findMany();
    
    if (configs.length > 0) {
      // 更新现有配置中的系统提示词
      const updatedConfig = await prisma.systemConfig.update({
        where: { id: configs[0].id },
        data: {
          systemPrompt: systemPromptToUse
        }
      });
      
      console.log("系统提示词已更新:", updatedConfig.systemPrompt.substring(0, 30) + "...");
      
      return NextResponse.json({
        success: true,
        message: '系统提示词已更新',
        previous_prompt: configs[0].systemPrompt.substring(0, 30) + "...",
        new_prompt: updatedConfig.systemPrompt.substring(0, 30) + "..."
      });
    } else {
      // 如果没有现有配置，创建一个新的
      const newConfig = await prisma.systemConfig.create({
        data: {
          openaiKey: process.env.OPENAI_API_KEY || '',
          systemPrompt: systemPromptToUse
        }
      });
      
      console.log("已创建新的系统配置，系统提示词:", newConfig.systemPrompt.substring(0, 30) + "...");
      
      return NextResponse.json({
        success: true,
        message: '已创建新的系统配置',
        new_prompt: newConfig.systemPrompt.substring(0, 30) + "..."
      });
    }
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('修复系统提示词失败:', appError);
    return NextResponse.json(
      { error: appError.message || '修复系统提示词失败' },
      { status: 500 }
    );
  }
} 