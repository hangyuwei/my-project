import updateManager from './common/updateManager';
import { config } from './config/index';

App({
  onLaunch: function () {
    if (typeof wx !== 'undefined' && wx.cloud) {
      const initConfig = { traceUser: true };
      if (config.cloudEnvId) {
        initConfig.env = config.cloudEnvId;
      }
      wx.cloud.init(initConfig);
    }
  },
  onShow: function () {
    updateManager();
  },
});
