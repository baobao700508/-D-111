import OpenAI from 'openai';
import { prisma } from './prisma';
import { AppError } from '@/types/error';

// OpenAI接口类型
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 获取API Key
async function getApiKey(): Promise<string> {
  // 首先尝试获取用户配置的API Key
  const userConfig = await prisma.userConfig.findFirst();
  console.log("用户配置API Key是否存在:", !!userConfig?.openaiKey);
  
  // 如果用户配置了API Key，则使用用户的Key
  if (userConfig && userConfig.openaiKey && userConfig.openaiKey.trim() !== '') {
    console.log("使用用户配置的API Key");
    return userConfig.openaiKey;
  }
  
  // 否则使用系统配置的API Key
  const systemConfig = await prisma.systemConfig.findFirst();
  console.log("系统配置API Key是否存在:", !!systemConfig?.openaiKey);
  if (systemConfig && systemConfig.openaiKey && systemConfig.openaiKey.trim() !== '') {
    console.log("使用系统配置的API Key");
    return systemConfig.openaiKey;
  }
  
  // 如果都没有，则使用环境变量
  const envApiKey = process.env.OPENAI_API_KEY || '';
  console.log("环境变量API Key是否存在:", !!envApiKey);
  if (envApiKey && envApiKey.trim() !== '') {
    console.log("使用环境变量API Key（前10位）:", envApiKey.substring(0, 10) + "...");
    return envApiKey;
  }
  
  throw new Error('未找到有效的OpenAI API Key');
}

// 获取用户语言设置
async function getUserLanguage(): Promise<string> {
  try {
    // 获取用户配置
    const userConfig = await prisma.userConfig.findFirst();
    
    // 如果用户配置了语言，则返回用户设置的语言
    if (userConfig && 'language' in userConfig && typeof userConfig.language === 'string') {
      return userConfig.language;
    }
    
    // 默认返回中文
    return 'zh';
  } catch (error) {
    console.error('获取用户语言设置失败:', error);
    return 'zh';
  }
}

// 获取系统提示词
async function getSystemPrompt(): Promise<string> {
  // 获取用户语言设置
  const userLanguage = await getUserLanguage();
  
  // 从系统配置获取基础提示词
  const systemConfig = await prisma.systemConfig.findFirst();
  let basePrompt = '';
  
  if (systemConfig && systemConfig.systemPrompt && systemConfig.systemPrompt.trim() !== '') {
    console.log("使用数据库中的系统提示词:", systemConfig.systemPrompt.substring(0, 30) + "...");
    basePrompt = systemConfig.systemPrompt;
  } else {
    // 如果数据库中没有，则使用环境变量
    const envPrompt = process.env.DEFAULT_SYSTEM_PROMPT || '';
    
    if (envPrompt && envPrompt.trim() !== '') {
      console.log("使用环境变量中的系统提示词:", envPrompt.substring(0, 30) + "...");
      basePrompt = envPrompt;
    } else {
      // 如果都没有，使用默认值
      basePrompt = '你是一位编程学习助手，请用简明易懂的方式帮助用户学习编程。';
    }
  }
  
  // 添加语言指令
  let languageInstruction = '';
  if (userLanguage === 'zh') {
    languageInstruction = '请用中文回答用户的问题。';
  } else if (userLanguage === 'en') {
    languageInstruction = 'Please answer the user\'s questions in English.';
  }
  
  // 组合提示词和语言指令
  const finalPrompt = `${basePrompt} ${languageInstruction}`;
  console.log("最终系统提示词:", finalPrompt.substring(0, 30) + "...");
  
  return finalPrompt;
}

// 创建OpenAI客户端
async function createOpenAIClient() {
  try {
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      throw new Error('缺少OpenAI API Key，请在设置中配置或设置环境变量');
    }
    
    return new OpenAI({
      apiKey,
    });
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('创建OpenAI客户端失败:', appError);
    throw appError;
  }
}

// 与OpenAI聊天API通信
export async function chatWithOpenAI(messages: { content: string; sender: 'user' | 'ai' }[], chatSessionId: string) {
  try {
    // 获取系统提示词
    const systemPrompt = await getSystemPrompt();
    console.log("系统提示词:", systemPrompt.substring(0, 20) + "...");
    
    // 创建OpenAI客户端
    const openai = await createOpenAIClient();
    
    // 转换消息格式为OpenAI API所需格式
    const formattedMessages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    // 添加历史消息
    for (const message of messages) {
      if (message.sender === 'user') {
        formattedMessages.push({ role: 'user', content: message.content });
      } else {
        formattedMessages.push({ role: 'assistant', content: message.content });
      }
    }
    
    console.log("准备调用OpenAI API，消息数量:", formattedMessages.length);
    
    // 调用OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    // 获取回复内容
    const responseContent = completion.choices[0].message.content || '';
    
    // 保存回复到数据库
    await prisma.message.create({
      data: {
        content: responseContent,
        sender: 'ai',
        chatSessionId,
      }
    });
    
    return responseContent;
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('OpenAI API调用失败:', appError);
    console.error('详细错误信息:', JSON.stringify(appError, null, 2));
    throw appError;
  }
}

// 与OpenAI聊天API通信（流式）
export async function chatWithOpenAIStream(messages: { content: string; sender: 'user' | 'ai' }[], chatSessionId: string) {
  try {
    // 获取系统提示词
    const systemPrompt = await getSystemPrompt();
    console.log("系统提示词:", systemPrompt.substring(0, 20) + "...");
    
    // 创建OpenAI客户端
    const openai = await createOpenAIClient();
    
    // 转换消息格式为OpenAI API所需格式
    const formattedMessages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    // 添加历史消息
    for (const message of messages) {
      if (message.sender === 'user') {
        formattedMessages.push({ role: 'user', content: message.content });
      } else {
        formattedMessages.push({ role: 'assistant', content: message.content });
      }
    }
    
    console.log("准备调用OpenAI流式API，消息数量:", formattedMessages.length);
    
    // 调用OpenAI API并启用流式响应
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      temperature: 0.7,
      stream: true, // 启用流式响应
    });
    
    // 返回流和会话ID
    return { stream, chatSessionId };
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('OpenAI 流式API调用失败:', appError);
    console.error('详细错误信息:', JSON.stringify(appError, null, 2));
    throw appError;
  }
}

// 根据对话内容生成主题名称
export async function generateTopicTitle(messages: { content: string; sender: 'user' | 'ai' }[]) {
  try {
    // 创建OpenAI客户端
    const openai = await createOpenAIClient();
    
    // 提取对话内容
    const conversationContent = messages
      .map(msg => `${msg.sender === 'user' ? '用户' : 'AI'}: ${msg.content}`)
      .join('\n');
    
    // 创建系统提示词，要求生成简短的主题
    const systemPrompt = "你是一个专业的对话主题生成助手。根据以下对话内容，生成一个简短、准确的主题名称（不超过15个字符）。只需要返回主题名称，不要包含任何其他文字、解释或标点符号。";
    
    // 准备请求消息
    const formattedMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `根据以下对话生成一个简短的主题名称：\n${conversationContent}` }
    ];
    
    console.log("准备调用OpenAI API生成主题名称");
    
    // 调用OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 50,
    });
    
    // 获取生成的主题名称并清理
    let title = completion.choices[0].message.content || '';
    // 移除引号和多余空格
    title = title.replace(/[""'']/g, '').trim();
    
    // 如果标题太长，截断它
    if (title.length > 15) {
      title = title.substring(0, 15);
    }
    
    return title;
  } catch (error: unknown) {
    const appError = error as AppError;
    console.error('生成主题名称失败:', appError);
    // 出错时返回默认标题
    return '新对话';
  }
} 