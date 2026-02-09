/**
 * UI 自动化主入口
 * 统一导出所有自动化模块
 */

const recorder = require('./recorder');
const player = require('./player');
const storage = require('./storage');
const injector = require('./injector');

/**
 * 自动化管理器
 */
class AutomationManager {
  constructor() {
    this.recorder = recorder;
    this.player = player;
    this.storage = storage;
    this.injector = injector;
    this.isInitialized = false;
  }

  /**
   * 初始化自动化系统
   * @param {Object} options - 配置选项
   */
  init(options = {}) {
    if (this.isInitialized) {
      console.warn('[Automation] 已经初始化过了');
      return;
    }

    console.log('[Automation] 初始化自动化系统');

    // 设置全局配置
    if (options.maxRecords) {
      this.storage.maxRecords = options.maxRecords;
    }

    this.isInitialized = true;
  }

  /**
   * 开始录制
   * @param {string} sessionName - 会话名称
   */
  startRecord(sessionName) {
    return this.recorder.start(sessionName);
  }

  /**
   * 停止录制
   * @returns {Object} 录制数据
   */
  stopRecord() {
    return this.recorder.stop();
  }

  /**
   * 开始回放
   * @param {string} sessionId - 会话ID
   * @param {Object} options - 回放选项
   */
  async startPlay(sessionId, options = {}) {
    const record = await this.storage.getRecord(sessionId);
    if (!record) {
      throw new Error('录制记录不存在');
    }
    return await this.player.play(record, options);
  }

  /**
   * 停止回放
   */
  stopPlay() {
    return this.player.stop();
  }

  /**
   * 获取所有录制记录
   */
  async getRecords() {
    return await this.storage.getAllRecords();
  }

  /**
   * 删除录制记录
   * @param {string} sessionId - 会话ID
   */
  async deleteRecord(sessionId) {
    return await this.storage.deleteRecord(sessionId);
  }

  /**
   * 导出录制记录
   * @param {string} sessionId - 会话ID
   */
  async exportRecord(sessionId) {
    return await this.storage.exportRecord(sessionId);
  }

  /**
   * 导入录制记录
   * @param {string} jsonString - JSON 字符串
   */
  async importRecord(jsonString) {
    return await this.storage.importRecord(jsonString);
  }

  /**
   * 获取录制状态
   */
  getRecordStatus() {
    return this.recorder.getStatus();
  }

  /**
   * 获取回放状态
   */
  getPlayStatus() {
    return this.player.getStatus();
  }

  /**
   * 清空所有数据
   */
  async clearAll() {
    this.recorder.clear();
    this.player.clear();
    await this.storage.clearAllRecords();
  }
}

// 导出单例
const automation = new AutomationManager();

module.exports = automation;
