import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/types/error';

// 获取用户流式生成设置
export async function GET() {
  try {
    // 获取用户配置
    const userConfig = await prisma.userConfig.findFirst();
    
    if (!userConfig) {
      // 如果没有配置，返回默认设置（开启）
      return NextResponse.json({ useStreaming: true });
    }
    
    return NextResponse.json({
      useStreaming: userConfig.useStreaming !== undefined ? userConfig.useStreaming : true,
    });
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('获取用户流式生成设置失败:', appError);
    return NextResponse.json(
      { error: appError.message || '获取用户流式生成设置时出错' },
      { status: 500 }
    );
  }
}

// 更新用户流式生成设置
export async function POST(request: NextRequest) {
  try {
    const { useStreaming } = await request.json();
    
    if (useStreaming === undefined) {
      return NextResponse.json(
        { error: '无效的流式生成设置' },
        { status: 400 }
      );
    }
    
    // 获取现有用户配置
    const existingConfig = await prisma.userConfig.findFirst();
    
    // 如果存在配置则更新，否则创建新配置
    if (existingConfig) {
      const updatedConfig = await prisma.userConfig.update({
        where: { id: existingConfig.id },
        data: { useStreaming },
      });
      
      return NextResponse.json({
        useStreaming: updatedConfig.useStreaming,
      });
    } else {
      const newConfig = await prisma.userConfig.create({
        data: { useStreaming },
      });
      
      return NextResponse.json({
        useStreaming: newConfig.useStreaming,
      });
    }
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('更新用户流式生成设置失败:', appError);
    return NextResponse.json(
      { error: appError.message || '更新用户流式生成设置时出错' },
      { status: 500 }
    );
  }
} 