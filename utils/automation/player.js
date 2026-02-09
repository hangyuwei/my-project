/**
 * UI 自动化事件回放器
 * 负责按照录制的事件序列进行回放
 */

const injector = require('./injector');

class EventPlayer {
  constructor() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentRecord = null;
    this.currentEventIndex = 0;
    this.playbackSpeed = 1.0; // 回放速度倍率
    this.listeners = new Map();
    this.playbackTimer = null;
  }

  /**
   * 开始回放
   * @param {Object} recordData - 录制数据
   * @param {Object} options - 回放选项
   * @returns {Promise<boolean>} 是否回放成功
   */
  async play(recordData, options = {}) {
    if (this.isPlaying) {
      console.warn('[Player] 已经在回放中');
      return false;
    }

    if (!recordData || !recordData.events || recordData.events.length === 0) {
      console.warn('[Player] 无效的录制数据');
      return false;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.currentRecord = recordData;
    this.currentEventIndex = 0;
    this.playbackSpeed = options.speed || 1.0;

    console.log('[Player] 开始回放:', {
      sessionId: recordData.sessionId,
      eventCount: recordData.events.length,
      speed: this.playbackSpeed
    });

    // 触发回放开始事件
    this._triggerEvent('playStart', {
      sessionId: recordData.sessionId,
      eventCount: recordData.events.length
    });

    // 设置注入器状态
    injector.setInjecting(true);

    try {
      await this._playEvents();
      console.log('[Player] 回放完成');
      this._triggerEvent('playComplete');
      return true;
    } catch (error) {
      console.error('[Player] 回放失败:', error);
      this._triggerEvent('playError', { error: error.message });
      return false;
    } finally {
      this.isPlaying = false;
      injector.setInjecting(false);
    }
  }

  /**
   * 暂停回放
   */
  pause() {
    if (!this.isPlaying || this.isPaused) {
      console.warn('[Player] 当前无法暂停');
      return;
    }

    this.isPaused = true;
    console.log('[Player] 暂停回放');
    this._triggerEvent('playPause', {
      currentIndex: this.currentEventIndex
    });
  }

  /**
   * 恢复回放
   */
  resume() {
    if (!this.isPlaying || !this.isPaused) {
      console.warn('[Player] 当前无法恢复');
      return;
    }

    this.isPaused = false;
    console.log('[Player] 恢复回放');
    this._triggerEvent('playResume', {
      currentIndex: this.currentEventIndex
    });
  }

  /**
   * 停止回放
   */
  stop() {
    if (!this.isPlaying) {
      console.warn('[Player] 当前没有在回放');
      return;
    }

    this.isPlaying = false;
    this.isPaused = false;
    injector.setInjecting(false);

    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }

    console.log('[Player] 停止回放');
    this._triggerEvent('playStop', {
      currentIndex: this.currentEventIndex
    });
  }

  /**
   * 设置回放速度
   * @param {number} speed - 速度倍率 (0.5 - 5.0)
   */
  setSpeed(speed) {
    if (speed < 0.5 || speed > 5.0) {
      console.warn('[Player] 无效的速度值，应在 0.5 - 5.0 之间');
      return;
    }

    this.playbackSpeed = speed;
    console.log('[Player] 设置回放速度:', speed);
    this._triggerEvent('speedChange', { speed: speed });
  }

  /**
   * 跳转到指定事件
   * @param {number} index - 事件索引
   */
  seekTo(index) {
    if (!this.currentRecord || index < 0 || index >= this.currentRecord.events.length) {
      console.warn('[Player] 无效的事件索引');
      return;
    }

    this.currentEventIndex = index;
    console.log('[Player] 跳转到事件:', index);
    this._triggerEvent('seek', { index: index });
  }

  /**
   * 执行事件回放
   */
  async _playEvents() {
    const events = this.currentRecord.events;
    let lastEventTime = 0;

    for (let i = this.currentEventIndex; i < events.length; i++) {
      // 检查是否停止
      if (!this.isPlaying) {
        break;
      }

      // 检查是否暂停
      while (this.isPaused && this.isPlaying) {
        await injector.wait(100);
      }

      const event = events[i];
      this.currentEventIndex = i;

      // 计算等待时间
      const waitTime = i === 0 ? 0 : (event.relativeTime - lastEventTime) / this.playbackSpeed;
      lastEventTime = event.relativeTime;

      // 等待到下一个事件的时间点
      if (waitTime > 0) {
        await injector.wait(waitTime);
      }

      // 执行事件
      await this._executeEvent(event);

      // 触发进度更新事件
      this._triggerEvent('progress', {
        currentIndex: i,
        totalCount: events.length,
        progress: ((i + 1) / events.length * 100).toFixed(2)
      });
    }
  }

  /**
   * 执行单个事件
   * @param {Object} event - 事件对象
   */
  async _executeEvent(event) {
    try {
      console.log('[Player] 执行事件:', {
        type: event.type,
        route: event.route,
        time: `${(event.relativeTime / 1000).toFixed(2)}s`
      });

      switch (event.type) {
        case 'tap':
          await injector.injectTap(event);
          break;

        case 'input':
          await injector.injectInput(event);
          break;

        case 'scroll':
          await injector.injectScroll(event);
          break;

        case 'longpress':
          await injector.injectLongpress(event);
          break;

        case 'touchstart':
        case 'touchmove':
        case 'touchend':
          await injector.injectTouch(event.type, event);
          break;

        case 'pageInfo':
          // 处理页面跳转
          const pages = getCurrentPages();
          const currentPage = pages[pages.length - 1];
          if (currentPage && currentPage.route !== event.data.route) {
            await injector.injectNavigation(event.data.route, event.data.options);
            // 等待页面加载
            await injector.wait(500);
          }
          break;

        default:
          console.warn('[Player] 未知的事件类型:', event.type);
      }

      // 触发事件执行通知
      this._triggerEvent('eventExecuted', event);
    } catch (error) {
      console.error('[Player] 执行事件失败:', error);
      this._triggerEvent('eventError', {
        event: event,
        error: error.message
      });
    }
  }

  /**
   * 获取当前回放状态
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentEventIndex: this.currentEventIndex,
      totalEvents: this.currentRecord ? this.currentRecord.events.length : 0,
      playbackSpeed: this.playbackSpeed,
      progress: this.currentRecord
        ? ((this.currentEventIndex / this.currentRecord.events.length) * 100).toFixed(2)
        : 0
    };
  }

  /**
   * 添加事件监听器
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  /**
   * 移除事件监听器
   */
  off(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      return;
    }
    const callbacks = this.listeners.get(eventName);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * 触发事件
   */
  _triggerEvent(eventName, data) {
    if (!this.listeners.has(eventName)) {
      return;
    }
    const callbacks = this.listeners.get(eventName);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[Player] 事件回调错误:', error);
      }
    });
  }

  /**
   * 清空当前回放
   */
  clear() {
    this.stop();
    this.currentRecord = null;
    this.currentEventIndex = 0;
    console.log('[Player] 清空回放数据');
  }
}

// 导出单例
const player = new EventPlayer();

module.exports = player;
