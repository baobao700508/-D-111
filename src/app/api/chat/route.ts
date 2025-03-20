import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chatWithOpenAI } from '@/lib/openai-service';
import { AppError } from '@/types/error';

// 处理发送消息
export async function POST(request: NextRequest) {
  try {
    const { content, chatSessionId } = await request.json();
    
    if (!content || !chatSessionId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 检查会话是否存在
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: chatSessionId },
    });
    
    if (!chatSession) {
      return NextResponse.json(
        { error: '聊天会话不存在' },
        { status: 404 }
      );
    }
    
    // 保存用户消息
    const userMessage = await prisma.message.create({
      data: {
        content,
        sender: 'user',
        chatSessionId,
      },
    });
    
    // 获取当前会话的历史消息
    const messages = await prisma.message.findMany({
      where: { chatSessionId },
      orderBy: { timestamp: 'asc' },
    });
    
    // 格式化消息，准备发送给OpenAI
    const formattedMessages = messages.map(msg => ({
      content: msg.content,
      sender: msg.sender as 'user' | 'ai',
    }));
    
    // 调用OpenAI API
    const aiResponse = await chatWithOpenAI(formattedMessages, chatSessionId);
    
    // 返回结果
    return NextResponse.json({
      userMessage,
      aiResponse,
    });
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('聊天处理错误:', appError);
    return NextResponse.json(
      { error: appError.message || '处理请求时出错' },
      { status: 500 }
    );
  }
} 