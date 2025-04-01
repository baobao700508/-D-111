// 这个文件是为了解决import错误
// 重新导出init-db.ts中的函数

import { initDatabase, initSystemConfig, initUserConfig } from './init-db';

export { initDatabase, initSystemConfig, initUserConfig }; 