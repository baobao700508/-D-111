import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/types/error';

// 获取用户流式生成设置
export async function GET() {
  try {
    // 使用SQL直接查询确保字段存在
    const result = await prisma.$queryRaw`
      SELECT "useStreaming" FROM "UserConfig" LIMIT 1
    `;
    
    const userConfig = Array.isArray(result) && result.length > 0 ? result[0] : null;
    
    if (!userConfig) {
      // 如果没有配置，返回默认设置（开启）
      return NextResponse.json({ useStreaming: true });
    }
    
    return NextResponse.json({
      useStreaming: userConfig.useStreaming === true,
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
    
    if (typeof useStreaming !== 'boolean') {
      return NextResponse.json(
        { error: '无效的流式生成设置' },
        { status: 400 }
      );
    }
    
    // 获取现有用户配置
    const configs = await prisma.userConfig.findMany({
      take: 1
    });
    
    const existingConfig = configs.length > 0 ? configs[0] : null;
    
    let result;
    
    // 如果存在配置则更新，否则创建新配置
    if (existingConfig) {
      // 使用SQL更新避免类型错误
      await prisma.$executeRaw`
        UPDATE "UserConfig" 
        SET "useStreaming" = ${useStreaming}, "updatedAt" = NOW()
        WHERE id = ${existingConfig.id}
      `;
      
      result = { useStreaming };
    } else {
      // 使用SQL创建避免类型错误
      await prisma.$executeRaw`
        INSERT INTO "UserConfig" (id, "openaiKey", language, "useStreaming", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), '', 'zh', ${useStreaming}, NOW(), NOW())
      `;
      
      result = { useStreaming };
    }
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('更新用户流式生成设置失败:', appError);
    return NextResponse.json(
      { error: appError.message || '更新用户流式生成设置时出错' },
      { status: 500 }
    );
  }
} 