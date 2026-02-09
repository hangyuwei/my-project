/* eslint-disable prefer-template */
/**
 * 工程代码pre-commit 检查工具
 * @date 2019.9.4
 * 修复: 2024 - Windows 兼容性 + 正确的退出码
 */
const { execSync } = require('child_process');
const chalk = require('chalk');
const { CLIEngine } = require('eslint');
const cli = new CLIEngine({});
const { log } = console;

function getErrorLevel(number) {
  switch (number) {
    case 2:
      return 'error';
    case 1:
      return 'warn';
    default:
  }
  return 'undefined';
}

// 跨平台获取 git staged 文件
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
    });
    return output
      .split('\n')
      .filter((file) => file && /\.(js|ts)$/i.test(file));
  } catch (error) {
    log(chalk.yellow('警告: 无法获取 git staged 文件列表'));
    return [];
  }
}

const files = getStagedFiles();

if (files.length === 0) {
  log(chalk.green.bold('~~ 没有需要检查的 JS/TS 文件 ~~'));
  process.exit(0);
}

let pass = 0;
const { results } = cli.executeOnFiles(files);
let errorCount = 0;
let warningCount = 0;

results.forEach((result) => {
  errorCount += result.errorCount;
  warningCount += result.warningCount;
  if (result.messages.length > 0) {
    log('\n');
    log(result.filePath);
    result.messages.forEach((obj) => {
      const level = getErrorLevel(obj.severity);
      if (level === 'warn')
        log(
          ' ' +
            obj.line +
            ':' +
            obj.column +
            '\t ' +
            chalk.yellow(level) +
            ' \0  ' +
            obj.message +
            '\t\t' +
            chalk.grey(obj.ruleId) +
            '',
        );
      if (level === 'error')
        log(
          ' ' +
            obj.line +
            ':' +
            obj.column +
            '\t ' +
            chalk.red.bold(level) +
            ' \0  ' +
            obj.message +
            '\t\t ' +
            chalk.grey(obj.ruleId) +
            '',
        );
      if (level === 'error') pass = 1;
    });
  }
});

if (warningCount > 0 || errorCount > 0) {
  log(
    '\n' +
      chalk.bgRed.bold(errorCount + warningCount + ' problems') +
      ' (' +
      chalk.red.bold(errorCount) +
      ' errors, ' +
      chalk.yellow(warningCount) +
      ' warnings) \0',
  );
}

if (pass === 0) {
  log(chalk.green.bold('~~ Done: 代码检验通过，提交成功 ~~'));
}

process.exit(pass);
