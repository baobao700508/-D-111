import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取所有聊天会话
export async function GET() {
  try {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1, // 只获取最新消息用于预览
        },
      },
    });
    
    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('获取会话失败:', error);
    return NextResponse.json(
      { error: error.message || '获取会话时出错' },
      { status: 500 }
    );
  }
}

// 创建新的聊天会话
export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      );
    }
    
    // 创建新会话
    const session = await prisma.chatSession.create({
      data: { title },
    });
    
    return NextResponse.json(session);
  } catch (error: any) {
    console.error('创建会话失败:', error);
    return NextResponse.json(
      { error: error.message || '创建会话时出错' },
      { status: 500 }
    );
  }
} 