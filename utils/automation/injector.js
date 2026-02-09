/**
 * UI 自动化事件注入器
 * 负责模拟和触发各种用户交互事件
 */

class EventInjector {
  constructor() {
    this.isInjecting = false;
  }

  /**
   * 注入点击事件
   * @param {Object} eventData - 事件数据
   * @returns {Promise<boolean>} 是否注入成功
   */
  async injectTap(eventData) {
    try {
      const { target, detail } = eventData.data;

      if (!target || !target.id) {
        console.warn('[Injector] 无效的点击目标');
        return false;
      }

      // 通过选择器查找元素并触发点击
      const query = wx.createSelectorQuery();
      query.select(`#${target.id}`).boundingClientRect();

      return new Promise((resolve) => {
        query.exec((res) => {
          if (res && res[0]) {
            console.log('[Injector] 注入点击事件:', target.id);
            // 触发自定义事件通知页面
            this._triggerCustomEvent('automation-tap', {
              targetId: target.id,
              dataset: target.dataset,
              detail: detail
            });
            resolve(true);
          } else {
            console.warn('[Injector] 未找到目标元素:', target.id);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('[Injector] 注入点击事件失败:', error);
      return false;
    }
  }

  /**
   * 注入输入事件
   * @param {Object} eventData - 事件数据
   * @returns {Promise<boolean>} 是否注入成功
   */
  async injectInput(eventData) {
    try {
      const { target, detail } = eventData.data;

      if (!target || !target.id) {
        console.warn('[Injector] 无效的输入目标');
        return false;
      }

      console.log('[Injector] 注入输入事件:', target.id, detail.value);

      // 触发自定义事件通知页面
      this._triggerCustomEvent('automation-input', {
        targetId: target.id,
        dataset: target.dataset,
        value: detail.value
      });

      return true;
    } catch (error) {
      console.error('[Injector] 注入输入事件失败:', error);
      return false;
    }
  }

  /**
   * 注入滚动事件
   * @param {Object} eventData - 事件数据
   * @returns {Promise<boolean>} 是否注入成功
   */
  async injectScroll(eventData) {
    try {
      const { detail } = eventData.data;

      console.log('[Injector] 注入滚动事件:', detail);

      // 触发自定义事件通知页面
      this._triggerCustomEvent('automation-scroll', {
        scrollTop: detail.scrollTop,
        scrollLeft: detail.scrollLeft
      });

      return true;
    } catch (error) {
      console.error('[Injector] 注入滚动事件失败:', error);
      return false;
    }
  }

  /**
   * 注入长按事件
   * @param {Object} eventData - 事件数据
   * @returns {Promise<boolean>} 是否注入成功
   */
  async injectLongpress(eventData) {
    try {
      const { target } = eventData.data;

      if (!target || !target.id) {
        console.warn('[Injector] 无效的长按目标');
        return false;
      }

      console.log('[Injector] 注入长按事件:', target.id);

      // 触发自定义事件通知页面
      this._triggerCustomEvent('automation-longpress', {
        targetId: target.id,
        dataset: target.dataset
      });

      return true;
    } catch (error) {
      console.error('[Injector] 注入长按事件失败:', error);
      return false;
    }
  }

  /**
   * 注入触摸事件
   * @param {string} touchType - 触摸类型 (touchstart/touchmove/touchend)
   * @param {Object} eventData - 事件数据
   * @returns {Promise<boolean>} 是否注入成功
   */
  async injectTouch(touchType, eventData) {
    try {
      const { touches, changedTouches } = eventData.data;

      console.log('[Injector] 注入触摸事件:', touchType);

      // 触发自定义事件通知页面
      this._triggerCustomEvent(`automation-${touchType}`, {
        touches: touches,
        changedTouches: changedTouches
      });

      return true;
    } catch (error) {
      console.error('[Injector] 注入触摸事件失败:', error);
      return false;
    }
  }

  /**
   * 注入页面跳转
   * @param {string} route - 页面路径
   * @param {Object} options - 页面参数
   * @returns {Promise<boolean>} 是否注入成功
   */
  async injectNavigation(route, options = {}) {
    try {
      console.log('[Injector] 注入页面跳转:', route);

      // 构建完整的 URL
      let url = `/${route}`;
      const params = Object.keys(options);
      if (params.length > 0) {
        const queryString = params.map(key => `${key}=${options[key]}`).join('&');
        url += `?${queryString}`;
      }

      // 执行页面跳转
      await new Promise((resolve, reject) => {
        wx.navigateTo({
          url: url,
          success: () => {
            console.log('[Injector] 页面跳转成功:', url);
            resolve(true);
          },
          fail: (error) => {
            console.error('[Injector] 页面跳转失败:', error);
            reject(error);
          }
        });
      });

      return true;
    } catch (error) {
      console.error('[Injector] 注入页面跳转失败:', error);
      return false;
    }
  }

  /**
   * 等待指定时间
   * @param {number} ms - 毫秒数
   * @returns {Promise<void>}
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 触发自定义事件
   * @param {string} eventName - 事件名称
   * @param {Object} detail - 事件详情
   */
  _triggerCustomEvent(eventName, detail) {
    // 获取当前页面实例
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];

    if (currentPage && typeof currentPage.handleAutomationEvent === 'function') {
      currentPage.handleAutomationEvent(eventName, detail);
    }
  }

  /**
   * 设置注入状态
   * @param {boolean} status - 是否正在注入
   */
  setInjecting(status) {
    this.isInjecting = status;
  }

  /**
   * 获取注入状态
   * @returns {boolean} 是否正在注入
   */
  getInjecting() {
    return this.isInjecting;
  }
}

// 导出单例
const injector = new EventInjector();

module.exports = injector;
