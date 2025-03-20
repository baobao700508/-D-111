import OpenAI from 'openai';
import { prisma } from './prisma';

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

// 获取系统提示词
async function getSystemPrompt(): Promise<string> {
  // 从系统配置获取
  const systemConfig = await prisma.systemConfig.findFirst();
  console.log("系统配置是否存在:", !!systemConfig);
  
  if (systemConfig && systemConfig.systemPrompt && systemConfig.systemPrompt.trim() !== '') {
    console.log("使用数据库中的系统提示词:", systemConfig.systemPrompt.substring(0, 30) + "...");
    return systemConfig.systemPrompt;
  }
  
  // 如果数据库中没有，则使用环境变量
  const envPrompt = process.env.DEFAULT_SYSTEM_PROMPT || '';
  console.log("环境变量中的系统提示词是否存在:", !!envPrompt);
  
  if (envPrompt && envPrompt.trim() !== '') {
    console.log("使用环境变量中的系统提示词:", envPrompt.substring(0, 30) + "...");
    return envPrompt;
  }
  
  // 如果都没有，使用默认值
  const defaultPrompt = '你是一位编程学习助手，请用简明易懂的方式帮助用户学习编程。';
  console.log("使用默认系统提示词:", defaultPrompt);
  return defaultPrompt;
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
  } catch (error) {
    console.error('创建OpenAI客户端失败:', error);
    throw error;
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
  } catch (error) {
    console.error('OpenAI API调用失败:', error);
    console.error('详细错误信息:', JSON.stringify(error, null, 2));
    throw error;
  }
} 