'use client'

// 消息类型定义
export interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
}

// 时间戳组件
const Timestamp = ({ time }: { time: string }) => {
  return (
    <div className="flex justify-center my-2">
      <span className="text-xs text-zinc-500">{time}</span>
    </div>
  )
}

// 消息气泡组件
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg p-3 ${
        isUser 
          ? 'bg-[#0066FF] text-white' 
          : 'bg-[#2D2D2D] text-white'
      }`}>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  )
}

interface MessageListProps {
  messages: Message[]
}

const MessageList = ({ messages }: MessageListProps) => {
  // 按时间戳分组显示消息
  const messagesByTime: Record<string, Message[]> = {}
  
  messages.forEach(message => {
    if (!messagesByTime[message.timestamp]) {
      messagesByTime[message.timestamp] = []
    }
    messagesByTime[message.timestamp].push(message)
  })
  
  return (
    <div className="flex flex-col">
      {Object.entries(messagesByTime).map(([timestamp, msgs]) => (
        <div key={timestamp}>
          <Timestamp time={timestamp} />
          {msgs.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default MessageList 