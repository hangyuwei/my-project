const chokidar = require('chokidar');
const simpleGit = require('simple-git');
const path = require('path');

const git = simpleGit();
let isProcessing = false;
let pendingChanges = false;

// 忽略的文件和目录
const ignored = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/.vscode/**',
  '**/.idea/**'
];

console.log('🚀 Auto Git Push 已启动，监听文件变化...');

// 监听文件变化
const watcher = chokidar.watch('.', {
  ignored: ignored,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

// 延迟提交函数
let commitTimeout;
const delayedCommit = () => {
  clearTimeout(commitTimeout);
  commitTimeout = setTimeout(async () => {
    if (isProcessing) {
      pendingChanges = true;
      return;
    }

    await commitAndPush();
  }, 3000); // 3秒后提交
};

// 提交并推送
async function commitAndPush() {
  if (isProcessing) return;

  isProcessing = true;
  pendingChanges = false;

  try {
    // 检查是否有变化
    const status = await git.status();

    if (status.files.length === 0) {
      console.log('✅ 没有文件变化');
      isProcessing = false;
      return;
    }

    console.log(`📝 检测到 ${status.files.length} 个文件变化`);

    // 添加所有变化
    await git.add('.');

    // 提交
    const timestamp = new Date().toLocaleString('zh-CN');
    const commitMessage = `Auto commit: ${timestamp}`;
    await git.commit(commitMessage);
    console.log(`✅ 已提交: ${commitMessage}`);

    // 推送
    await git.push('origin', 'main');
    console.log('🚀 已推送到远程仓库');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    isProcessing = false;

    // 如果有待处理的变化，再次执行
    if (pendingChanges) {
      setTimeout(commitAndPush, 1000);
    }
  }
}

// 监听文件变化事件
watcher
  .on('add', path => {
    console.log(`➕ 新增文件: ${path}`);
    delayedCommit();
  })
  .on('change', path => {
    console.log(`📝 修改文件: ${path}`);
    delayedCommit();
  })
  .on('unlink', path => {
    console.log(`🗑️  删除文件: ${path}`);
    delayedCommit();
  })
  .on('error', error => {
    console.error(`❌ 监听错误: ${error}`);
  });

// 优雅退出
process.on('SIGINT', async () => {
  console.log('\n⏹️  正在停止监听...');
  await watcher.close();
  process.exit(0);
});
