import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取特定聊天会话及其消息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    
    // 查找会话
    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });
    
    if (!session) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(session);
  } catch (error: any) {
    console.error('获取会话详情失败:', error);
    return NextResponse.json(
      { error: error.message || '获取会话详情时出错' },
      { status: 500 }
    );
  }
}

// 更新会话标题
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const { title } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      );
    }
    
    // 更新会话标题
    const updatedSession = await prisma.chatSession.update({
      where: { id },
      data: { title },
    });
    
    return NextResponse.json(updatedSession);
  } catch (error: any) {
    console.error('更新会话失败:', error);
    return NextResponse.json(
      { error: error.message || '更新会话时出错' },
      { status: 500 }
    );
  }
}

// 删除会话
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    
    // 删除会话（关联的消息会通过级联删除一起删除）
    await prisma.chatSession.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('删除会话失败:', error);
    return NextResponse.json(
      { error: error.message || '删除会话时出错' },
      { status: 500 }
    );
  }
} 