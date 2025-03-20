import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 获取环境变量
    const apiKey = process.env.OPENAI_API_KEY || '未设置';
    const systemPrompt = process.env.DEFAULT_SYSTEM_PROMPT || '未设置';
    
    // 处理API Key，只显示前10位和后4位，中间用星号替代
    let maskedApiKey = '未设置';
    if (apiKey && apiKey !== '未设置' && apiKey.length > 14) {
      maskedApiKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
    }
    
    // 返回环境变量信息
    return NextResponse.json({
      apiKey: {
        exists: apiKey !== '未设置',
        value: maskedApiKey,
        length: apiKey !== '未设置' ? apiKey.length : 0
      },
      systemPrompt: {
        exists: systemPrompt !== '未设置',
        value: systemPrompt,
        length: systemPrompt !== '未设置' ? systemPrompt.length : 0
      },
      nodeEnv: process.env.NODE_ENV || '未设置'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || '获取环境变量失败' },
      { status: 500 }
    );
  }
} 