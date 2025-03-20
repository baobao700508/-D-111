import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/init-db';
import { AppError } from '@/types/error';

// 初始化数据库API
export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({ success: true, message: '数据库初始化成功' });
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('初始化数据库失败:', appError);
    return NextResponse.json(
      { error: appError.message || '初始化数据库时出错' },
      { status: 500 }
    );
  }
} 