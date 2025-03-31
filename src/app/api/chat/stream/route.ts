import { NextRequest } from 'next/server';
import { chatWithOpenAIStream } from '@/lib/openai-service';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/types/error';
import { v4 as uuidv4 } from 'uuid';

// 使用Server-Sent Events处理流式响应
export async function POST(request: NextRequest) {
  try {
    const { content, chatSessionId } = await request.json();
    
    if (!content || !chatSessionId) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 检查会话是否存在
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: chatSessionId },
    });
    
    if (!chatSession) {
      return new Response(
        JSON.stringify({ error: '聊天会话不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 保存用户消息
    await prisma.message.create({
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
    
    // 设置响应头，使用Server-Sent Events
    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    };
    
    const encoder = new TextEncoder();
    
    // 获取流式响应
    const { stream, chatSessionId: sessionId } = await chatWithOpenAIStream(
      formattedMessages, 
      chatSessionId
    );
    
    // 创建响应流
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullResponse = ''; // 累积完整响应
        
        try {
          // 处理流式响应片段
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // 将片段发送给客户端
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              // 累积完整响应
              fullResponse += content;
            }
          }
          
          // 保存完整响应到数据库
          await prisma.message.create({
            data: {
              content: fullResponse,
              sender: 'ai',
              chatSessionId: sessionId,
            }
          });
          
          // 发送完成信号
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, id: uuidv4() })}\n\n`));
        } catch (error: unknown) {
          const appError = error as AppError;
          console.error('流式处理失败:', appError);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                error: appError.message || '处理请求时出错',
                id: uuidv4() 
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      }
    });
    
    return new Response(readableStream, { headers });
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('聊天流式处理错误:', appError);
    return new Response(
      JSON.stringify({ error: appError.message || '处理请求时出错' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 