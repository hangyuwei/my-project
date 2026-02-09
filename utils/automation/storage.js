/**
 * UI 自动化存储管理器
 * 负责录制数据的保存、加载和管理
 */

class StorageManager {
  constructor() {
    this.storageKey = 'ui_automation_records';
    this.maxRecords = 50; // 最多保存50条录制记录
  }

  /**
   * 保存录制数据
   * @param {Object} recordData - 录制数据
   * @returns {Promise<boolean>} 是否保存成功
   */
  async saveRecord(recordData) {
    try {
      const records = await this.getAllRecords();

      // 添加新记录
      records.unshift({
        ...recordData,
        savedAt: Date.now()
      });

      // 限制记录数量
      if (records.length > this.maxRecords) {
        records.splice(this.maxRecords);
      }

      await this._setStorage(this.storageKey, records);

      console.log('[Storage] 保存录制数据成功:', recordData.sessionId);
      return true;
    } catch (error) {
      console.error('[Storage] 保存录制数据失败:', error);
      return false;
    }
  }

  /**
   * 获取所有录制记录
   * @returns {Promise<Array>} 录制记录列表
   */
  async getAllRecords() {
    try {
      const records = await this._getStorage(this.storageKey);
      return records || [];
    } catch (error) {
      console.error('[Storage] 获取录制记录失败:', error);
      return [];
    }
  }

  /**
   * 根据 sessionId 获取录制记录
   * @param {string} sessionId - 会话ID
   * @returns {Promise<Object|null>} 录制记录
   */
  async getRecord(sessionId) {
    try {
      const records = await this.getAllRecords();
      return records.find(record => record.sessionId === sessionId) || null;
    } catch (error) {
      console.error('[Storage] 获取录制记录失败:', error);
      return null;
    }
  }

  /**
   * 删除录制记录
   * @param {string} sessionId - 会话ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteRecord(sessionId) {
    try {
      const records = await this.getAllRecords();
      const filteredRecords = records.filter(record => record.sessionId !== sessionId);

      await this._setStorage(this.storageKey, filteredRecords);

      console.log('[Storage] 删除录制记录成功:', sessionId);
      return true;
    } catch (error) {
      console.error('[Storage] 删除录制记录失败:', error);
      return false;
    }
  }

  /**
   * 清空所有录制记录
   * @returns {Promise<boolean>} 是否清空成功
   */
  async clearAllRecords() {
    try {
      await this._removeStorage(this.storageKey);
      console.log('[Storage] 清空所有录制记录成功');
      return true;
    } catch (error) {
      console.error('[Storage] 清空录制记录失败:', error);
      return false;
    }
  }

  /**
   * 导出录制数据为 JSON
   * @param {string} sessionId - 会话ID
   * @returns {Promise<string|null>} JSON 字符串
   */
  async exportRecord(sessionId) {
    try {
      const record = await this.getRecord(sessionId);
      if (!record) {
        console.warn('[Storage] 未找到录制记录:', sessionId);
        return null;
      }

      return JSON.stringify(record, null, 2);
    } catch (error) {
      console.error('[Storage] 导出录制数据失败:', error);
      return null;
    }
  }

  /**
   * 从 JSON 导入录制数据
   * @param {string} jsonString - JSON 字符串
   * @returns {Promise<boolean>} 是否导入成功
   */
  async importRecord(jsonString) {
    try {
      const recordData = JSON.parse(jsonString);

      // 验证数据格式
      if (!recordData.sessionId || !recordData.events) {
        throw new Error('无效的录制数据格式');
      }

      await this.saveRecord(recordData);
      console.log('[Storage] 导入录制数据成功:', recordData.sessionId);
      return true;
    } catch (error) {
      console.error('[Storage] 导入录制数据失败:', error);
      return false;
    }
  }

  /**
   * 获取存储统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getStorageInfo() {
    try {
      const records = await this.getAllRecords();
      const totalEvents = records.reduce((sum, record) => sum + record.eventCount, 0);
      const totalDuration = records.reduce((sum, record) => sum + record.duration, 0);

      return {
        recordCount: records.length,
        totalEvents: totalEvents,
        totalDuration: totalDuration,
        averageEvents: records.length > 0 ? Math.round(totalEvents / records.length) : 0,
        averageDuration: records.length > 0 ? Math.round(totalDuration / records.length) : 0
      };
    } catch (error) {
      console.error('[Storage] 获取存储信息失败:', error);
      return null;
    }
  }

  /**
   * 更新录制记录的元数据
   * @param {string} sessionId - 会话ID
   * @param {Object} metadata - 元数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  async updateRecordMetadata(sessionId, metadata) {
    try {
      const records = await this.getAllRecords();
      const recordIndex = records.findIndex(record => record.sessionId === sessionId);

      if (recordIndex === -1) {
        console.warn('[Storage] 未找到录制记录:', sessionId);
        return false;
      }

      records[recordIndex] = {
        ...records[recordIndex],
        ...metadata,
        updatedAt: Date.now()
      };

      await this._setStorage(this.storageKey, records);
      console.log('[Storage] 更新录制记录成功:', sessionId);
      return true;
    } catch (error) {
      console.error('[Storage] 更新录制记录失败:', error);
      return false;
    }
  }

  /**
   * 封装 wx.setStorageSync
   */
  _setStorage(key, data) {
    return new Promise((resolve, reject) => {
      try {
        wx.setStorageSync(key, data);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 封装 wx.getStorageSync
   */
  _getStorage(key) {
    return new Promise((resolve, reject) => {
      try {
        const data = wx.getStorageSync(key);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 封装 wx.removeStorageSync
   */
  _removeStorage(key) {
    return new Promise((resolve, reject) => {
      try {
        wx.removeStorageSync(key);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

// 导出单例
const storage = new StorageManager();

module.exports = storage;
