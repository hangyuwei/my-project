import { config } from '../config/index';

// 资源方小程序 AppID（拥有云环境的那个小程序）
// TODO: 请在微信公众平台的多应用管理中查找拥有云环境的应用 AppID
// 然后替换下面这个值
const RESOURCE_APPID = 'wx6d0ae758597cc08e';

let cloudInstance = null;

export function getCloud() {
  if (cloudInstance) {
    return cloudInstance;
  }

  // 使用资源方模式访问云环境
  cloudInstance = new wx.cloud.Cloud({
    resourceAppid: RESOURCE_APPID,
    resourceEnv: config.cloudEnvId,
    traceUser: true,
  });

  cloudInstance.init();
  return cloudInstance;
}
