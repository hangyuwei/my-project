/**
 * UI 自动化事件录制器
 * 负责捕获和记录用户的所有交互事件
 */

class EventRecorder {
  constructor() {
    this.isRecording = false;
    this.events = [];
    this.startTime = 0;
    this.sessionId = '';
    this.listeners = new Map();

    // 支持的事件类型
    this.eventTypes = [
      'tap',
      'longpress',
      'touchstart',
      'touchmove',
      'touchend',
      'input',
      'confirm',
      'scroll',
      'change'
    ];
  }

  /**
   * 开始录制
   * @param {string} sessionName - 录制会话名称
   */
  start(sessionName = '') {
    if (this.isRecording) {
      console.warn('[Recorder] 已经在录制中');
      return;
    }

    this.isRecording = true;
    this.events = [];
    this.startTime = Date.now();
    this.sessionId = sessionName || `session_${this.startTime}`;

    console.log('[Recorder] 开始录制:', this.sessionId);

    // 记录初始页面信息
    this._recordPageInfo();

    // 触发录制开始事件
    this._triggerEvent('recordStart', {
      sessionId: this.sessionId,
      startTime: this.startTime
    });
  }

  /**
   * 停止录制
   * @returns {Object} 录制的事件数据
   */
  stop() {
    if (!this.isRecording) {
      console.warn('[Recorder] 当前没有在录制');
      return null;
    }

    this.isRecording = false;
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    const recordData = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: endTime,
      duration: duration,
      events: this.events,
      eventCount: this.events.length
    };

    console.log('[Recorder] 停止录制:', {
      sessionId: this.sessionId,
      eventCount: this.events.length,
      duration: `${(duration / 1000).toFixed(2)}s`
    });

    // 触发录制停止事件
    this._triggerEvent('recordStop', recordData);

    return recordData;
  }

  /**
   * 暂停录制
   */
  pause() {
    if (!this.isRecording) {
      console.warn('[Recorder] 当前没有在录制');
      return;
    }
    this.isRecording = false;
    console.log('[Recorder] 暂停录制');
    this._triggerEvent('recordPause');
  }

  /**
   * 恢复录制
   */
  resume() {
    if (this.isRecording) {
      console.warn('[Recorder] 已经在录制中');
      return;
    }
    this.isRecording = true;
    console.log('[Recorder] 恢复录制');
    this._triggerEvent('recordResume');
  }

  /**
   * 记录事件
   * @param {string} eventType - 事件类型
   * @param {Object} eventData - 事件数据
   */
  recordEvent(eventType, eventData) {
    if (!this.isRecording) {
      return;
    }

    const timestamp = Date.now();
    const relativeTime = timestamp - this.startTime;

    // 获取当前页面信息
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const route = currentPage ? currentPage.route : '';

    const event = {
      id: `event_${this.events.length + 1}`,
      type: eventType,
      timestamp: timestamp,
      relativeTime: relativeTime,
      route: route,
      data: this._sanitizeEventData(eventData)
    };

    this.events.push(event);

    console.log('[Recorder] 记录事件:', {
      type: eventType,
      route: route,
      time: `${(relativeTime / 1000).toFixed(2)}s`
    });

    // 触发事件记录通知
    this._triggerEvent('eventRecorded', event);
  }

  /**
   * 记录页面信息
   */
  _recordPageInfo() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];

    if (currentPage) {
      this.recordEvent('pageInfo', {
        route: currentPage.route,
        options: currentPage.options || {}
      });
    }
  }

  /**
   * 清理事件数据，移除不必要的信息
   */
  _sanitizeEventData(data) {
    if (!data) return {};

    const sanitized = {};

    // 保留关键信息
    const keysToKeep = [
      'target',
      'currentTarget',
      'detail',
      'touches',
      'changedTouches',
      'timeStamp',
      'type'
    ];

    keysToKeep.forEach(key => {
      if (data[key] !== undefined) {
        if (key === 'target' || key === 'currentTarget') {
          // 只保留元素的关键属性
          sanitized[key] = {
            id: data[key].id,
            dataset: data[key].dataset,
            offsetLeft: data[key].offsetLeft,
            offsetTop: data[key].offsetTop
          };
        } else if (key === 'touches' || key === 'changedTouches') {
          // 保留触摸点信息
          sanitized[key] = Array.from(data[key] || []).map(touch => ({
            identifier: touch.identifier,
            pageX: touch.pageX,
            pageY: touch.pageY,
            clientX: touch.clientX,
            clientY: touch.clientY
          }));
        } else {
          sanitized[key] = data[key];
        }
      }
    });

    return sanitized;
  }

  /**
   * 获取当前录制状态
   */
  getStatus() {
    return {
      isRecording: this.isRecording,
      sessionId: this.sessionId,
      eventCount: this.events.length,
      duration: this.isRecording ? Date.now() - this.startTime : 0
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
        console.error('[Recorder] 事件回调错误:', error);
      }
    });
  }

  /**
   * 清空录制数据
   */
  clear() {
    this.events = [];
    this.startTime = 0;
    this.sessionId = '';
    console.log('[Recorder] 清空录制数据');
  }
}

// 导出单例
const recorder = new EventRecorder();

module.exports = recorder;
