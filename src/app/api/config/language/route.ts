import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/types/error';

// 获取用户语言设置
export async function GET() {
  try {
    // 获取用户配置
    const userConfig = await prisma.userConfig.findFirst();
    
    if (!userConfig) {
      // 如果没有配置，返回默认语言
      return NextResponse.json({ language: 'zh' });
    }
    
    return NextResponse.json({
      language: userConfig.language || 'zh',
    });
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('获取用户语言设置失败:', appError);
    return NextResponse.json(
      { error: appError.message || '获取用户语言设置时出错' },
      { status: 500 }
    );
  }
}

// 更新用户语言设置
export async function POST(request: NextRequest) {
  try {
    const { language } = await request.json();
    
    if (!language || (language !== 'zh' && language !== 'en')) {
      return NextResponse.json(
        { error: '无效的语言设置' },
        { status: 400 }
      );
    }
    
    // 获取现有用户配置
    const existingConfig = await prisma.userConfig.findFirst();
    
    // 如果存在配置则更新，否则创建新配置
    if (existingConfig) {
      const updatedConfig = await prisma.userConfig.update({
        where: { id: existingConfig.id },
        data: { language },
      });
      
      return NextResponse.json({
        language: updatedConfig.language,
      });
    } else {
      const newConfig = await prisma.userConfig.create({
        data: { language },
      });
      
      return NextResponse.json({
        language: newConfig.language,
      });
    }
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('更新用户语言设置失败:', appError);
    return NextResponse.json(
      { error: appError.message || '更新用户语言设置时出错' },
      { status: 500 }
    );
  }
} 