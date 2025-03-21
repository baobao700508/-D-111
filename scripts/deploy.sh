#!/bin/bash

# 部署Cal AI应用的脚本
# 解决服务器上获取会话失败的问题

# 输出错误信息并退出
error_exit() {
  echo "❌ 错误：$1" >&2
  exit 1
}

# 显示执行步骤
log_step() {
  echo "➡️ $1"
}

# 检查必要的环境变量
check_env_vars() {
  if [ ! -f .env ]; then
    error_exit ".env文件不存在，请先创建配置文件"
  fi
  
  # 检查OpenAI API密钥
  if grep -q "OPENAI_API_KEY=\"\"" .env || ! grep -q "OPENAI_API_KEY=" .env; then
    error_exit "OpenAI API Key未设置，请在.env文件中配置"
  fi

  log_step "环境变量检查通过"
}

# 构建和启动Docker容器
build_and_run() {
  log_step "开始构建和启动Docker容器"
  
  # 停止并移除旧容器
  docker-compose down || log_step "没有找到正在运行的容器，继续执行"
  
  # 构建新容器
  docker-compose build --no-cache || error_exit "Docker构建失败"
  
  # 启动容器
  docker-compose up -d || error_exit "Docker启动失败"
  
  log_step "容器成功启动"
}

# 检查应用是否正常运行
check_application() {
  log_step "等待应用启动..."
  sleep 10
  
  # 检查应用是否启动
  response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
  
  if [ "$response" -eq 200 ]; then
    log_step "✅ 应用已成功启动"
  else
    log_step "⚠️ 应用返回状态码: $response，查看日志以排查问题"
    docker-compose logs app
  fi
}

# 显示日志
show_logs() {
  log_step "查看应用日志"
  docker-compose logs -f app
}

# 主函数
main() {
  log_step "开始部署Cal AI应用"
  
  # 检查环境变量
  check_env_vars
  
  # 构建和启动容器
  build_and_run
  
  # 检查应用状态
  check_application
  
  log_step "部署完成！应用现在已经可以通过 http://localhost:3000 访问"
  log_step "如需查看日志，请运行: ./scripts/deploy.sh logs"
}

# 根据参数执行不同操作
if [ "$1" = "logs" ]; then
  show_logs
else
  main
fi 