import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取用户配置
export async function GET() {
  try {
    // 获取用户配置
    const userConfig = await prisma.userConfig.findFirst();
    
    if (!userConfig) {
      return NextResponse.json(
        { error: '未找到用户配置' },
        { status: 404 }
      );
    }
    
    // 不返回完整的API Key，只返回是否已设置
    return NextResponse.json({
      hasApiKey: !!userConfig.openaiKey && userConfig.openaiKey.trim() !== '',
    });
  } catch (error: any) {
    console.error('获取用户配置失败:', error);
    return NextResponse.json(
      { error: error.message || '获取用户配置时出错' },
      { status: 500 }
    );
  }
}

// 更新用户配置
export async function POST(request: NextRequest) {
  try {
    const { openaiKey } = await request.json();
    
    // 获取现有用户配置
    const existingConfig = await prisma.userConfig.findFirst();
    
    // 如果存在配置则更新，否则创建新配置
    if (existingConfig) {
      const updatedConfig = await prisma.userConfig.update({
        where: { id: existingConfig.id },
        data: { openaiKey },
      });
      
      return NextResponse.json({
        hasApiKey: !!updatedConfig.openaiKey && updatedConfig.openaiKey.trim() !== '',
      });
    } else {
      const newConfig = await prisma.userConfig.create({
        data: { openaiKey },
      });
      
      return NextResponse.json({
        hasApiKey: !!newConfig.openaiKey && newConfig.openaiKey.trim() !== '',
      });
    }
  } catch (error: any) {
    console.error('更新用户配置失败:', error);
    return NextResponse.json(
      { error: error.message || '更新用户配置时出错' },
      { status: 500 }
    );
  }
} 