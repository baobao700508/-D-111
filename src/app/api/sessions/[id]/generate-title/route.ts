import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTopicTitle } from '@/lib/openai-service';
import { AppError } from '@/types/error';

// 生成会话标题
export async function POST(request: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '消息不能为空' },
        { status: 400 }
      );
    }
    
    // 检查会话是否存在
    const chatSession = await prisma.chatSession.findUnique({
      where: { id },
    });
    
    if (!chatSession) {
      return NextResponse.json(
        { error: '聊天会话不存在' },
        { status: 404 }
      );
    }
    
    // 使用OpenAI生成标题
    const title = await generateTopicTitle(messages);
    
    // 更新会话标题
    const updatedSession = await prisma.chatSession.update({
      where: { id },
      data: { title },
    });
    
    return NextResponse.json({
      success: true,
      title: updatedSession.title,
    });
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('生成并更新标题失败:', appError);
    return NextResponse.json(
      { error: appError.message || '处理请求时出错' },
      { status: 500 }
    );
  }
} 