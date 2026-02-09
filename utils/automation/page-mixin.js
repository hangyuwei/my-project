/**
 * 页面混入 - 自动化事件捕获
 * 在页面中混入此对象，可以自动捕获用户交互事件
 */

const recorder = require('./recorder');

const AutomationPageMixin = {
  data: {
    _automationEnabled: true
  },

  onLoad(options) {
    // 保存原始 onLoad
    if (this._originalOnLoad) {
      this._originalOnLoad.call(this, options);
    }
  },

  onShow() {
    // 注册自动化事件监听
    this._registerAutomationListeners();

    // 保存原始 onShow
    if (this._originalOnShow) {
      this._originalOnShow.call(this);
    }
  },

  onHide() {
    // 保存原始 onHide
    if (this._originalOnHide) {
      this._originalOnHide.call(this);
    }
  },

  onUnload() {
    // 保存原始 onUnload
    if (this._originalOnUnload) {
      this._originalOnUnload.call(this);
    }
  },

  /**
   * 注册自动化事件监听
   */
  _registerAutomationListeners() {
    // 这个方法会在页面显示时调用
    // 用于设置事件监听
  },

  /**
   * 处理自动化事件（由注入器触发）
   */
  handleAutomationEvent(eventName, detail) {
    console.log('[Page] 收到自动化事件:', eventName, detail);

    switch (eventName) {
      case 'automation-tap':
        this._handleAutomationTap(detail);
        break;
      case 'automation-input':
        this._handleAutomationInput(detail);
        break;
      case 'automation-scroll':
        this._handleAutomationScroll(detail);
        break;
      case 'automation-longpress':
        this._handleAutomationLongpress(detail);
        break;
      default:
        console.warn('[Page] 未知的自动化事件:', eventName);
    }
  },

  /**
   * 处理自动化点击事件
   */
  _handleAutomationTap(detail) {
    const { targetId, dataset } = detail;

    // 查找对应的事件处理函数
    const handlerName = dataset && dataset.handler;
    if (handlerName && typeof this[handlerName] === 'function') {
      // 构造模拟事件对象
      const mockEvent = {
        type: 'tap',
        currentTarget: {
          id: targetId,
          dataset: dataset
        },
        detail: detail.detail || {}
      };

      // 调用事件处理函数
      this[handlerName](mockEvent);
    }
  },

  /**
   * 处理自动化输入事件
   */
  _handleAutomationInput(detail) {
    const { targetId, dataset, value } = detail;

    // 查找对应的事件处理函数
    const handlerName = dataset && dataset.handler;
    if (handlerName && typeof this[handlerName] === 'function') {
      // 构造模拟事件对象
      const mockEvent = {
        type: 'input',
        currentTarget: {
          id: targetId,
          dataset: dataset
        },
        detail: { value: value }
      };

      // 调用事件处理函数
      this[handlerName](mockEvent);
    }
  },

  /**
   * 处理自动化滚动事件
   */
  _handleAutomationScroll(detail) {
    // 滚动事件通常不需要特殊处理
    console.log('[Page] 滚动到:', detail);
  },

  /**
   * 处理自动化长按事件
   */
  _handleAutomationLongpress(detail) {
    const { targetId, dataset } = detail;

    // 查找对应的事件处理函数
    const handlerName = dataset && dataset.handler;
    if (handlerName && typeof this[handlerName] === 'function') {
      // 构造模拟事件对象
      const mockEvent = {
        type: 'longpress',
        currentTarget: {
          id: targetId,
          dataset: dataset
        },
        detail: {}
      };

      // 调用事件处理函数
      this[handlerName](mockEvent);
    }
  },

  /**
   * 捕获并记录事件
   */
  _captureEvent(eventType, event) {
    if (!this.data._automationEnabled) {
      return;
    }

    // 记录事件
    recorder.recordEvent(eventType, event);
  }
};

/**
 * 包装页面，自动注入自动化功能
 * @param {Object} pageConfig - 页面配置对象
 * @returns {Object} 包装后的页面配置
 */
function wrapPage(pageConfig) {
  // 保存原始生命周期函数
  const originalOnLoad = pageConfig.onLoad;
  const originalOnShow = pageConfig.onShow;
  const originalOnHide = pageConfig.onHide;
  const originalOnUnload = pageConfig.onUnload;

  // 创建新的页面配置
  const wrappedConfig = {
    ...pageConfig,
    ...AutomationPageMixin,
    _originalOnLoad: originalOnLoad,
    _originalOnShow: originalOnShow,
    _originalOnHide: originalOnHide,
    _originalOnUnload: originalOnUnload
  };

  // 包装所有事件处理函数
  Object.keys(pageConfig).forEach(key => {
    const value = pageConfig[key];
    if (typeof value === 'function' && key.startsWith('on')) {
      // 包装事件处理函数，自动捕获事件
      wrappedConfig[key] = function(...args) {
        // 如果是用户交互事件，记录它
        const event = args[0];
        if (event && event.type) {
          wrappedConfig._captureEvent.call(this, event.type, event);
        }

        // 调用原始函数
        return value.apply(this, args);
      };
    }
  });

  return wrappedConfig;
}

module.exports = {
  AutomationPageMixin,
  wrapPage
};
