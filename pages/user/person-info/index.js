import { fetchPerson } from '../../../services/usercenter/fetchPerson';
import { phoneEncryption } from '../../../utils/util';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    personInfo: {
      avatarUrl: '',
      nickName: '',
      gender: 0,
      phoneNumber: '',
    },
    showUnbindConfirm: false,
    pickerOptions: [
      {
        name: '男',
        code: '1',
      },
      {
        name: '女',
        code: '2',
      },
    ],
    typeVisible: false,
    genderMap: ['', '男', '女'],
  },
  onLoad() {
    this.init();
  },
  init() {
    this.loadUserInfo();
  },
  loadUserInfo() {
    const app = getApp();
    const globalUserInfo = app.globalData.userInfo;

    if (globalUserInfo) {
      this.setData({
        personInfo: {
          avatarUrl: globalUserInfo.avatarUrl || 'https://tdesign.gtimg.com/miniprogram/template/retail/usercenter/icon-user-center-avatar@2x.png',
          nickName: globalUserInfo.nickName || '微信用户',
          gender: globalUserInfo.gender || 0,
          phoneNumber: globalUserInfo.phoneNumber || '',
        },
      });
    }
  },
  onClickCell({ currentTarget }) {
    const { dataset } = currentTarget;
    const { nickName } = this.data.personInfo;

    switch (dataset.type) {
      case 'gender':
        this.setData({
          typeVisible: true,
        });
        break;
      case 'name':
        wx.navigateTo({
          url: `/pages/user/name-edit/index?name=${nickName}`,
        });
        break;
      case 'avatarUrl':
        this.toModifyAvatar();
        break;
      default: {
        break;
      }
    }
  },
  onClose() {
    this.setData({
      typeVisible: false,
    });
  },
  onConfirm(e) {
    const { value } = e.detail;
    this.setData(
      {
        typeVisible: false,
        'personInfo.gender': value,
      },
      () => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '设置成功',
          theme: 'success',
        });
      },
    );
  },
  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    const app = getApp();

    console.log('获取到头像:', avatarUrl);

    wx.showLoading({
      title: '上传中...',
      mask: true,
    });

    // 上传头像到云存储
    const cloudPath = `user-avatars/${app.globalData.openid}_${Date.now()}.png`;
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: avatarUrl,
      success: res => {
        console.log('头像上传成功:', res.fileID);

        // 更新用户信息到数据库
        app.updateUserInfo(null, res.fileID).then(() => {
          wx.hideLoading();
          this.loadUserInfo();
          Toast({
            context: this,
            selector: '#t-toast',
            message: '头像设置成功',
            theme: 'success',
          });
        }).catch(err => {
          wx.hideLoading();
          console.error('更新头像到数据库失败:', err);
          Toast({
            context: this,
            selector: '#t-toast',
            message: '头像设置失败',
            theme: 'error',
          });
        });
      },
      fail: err => {
        wx.hideLoading();
        console.error('头像上传失败:', err);
        Toast({
          context: this,
          selector: '#t-toast',
          message: '头像上传失败',
          theme: 'error',
        });
      }
    });
  },

  // 修改昵称
  onNicknameChange(e) {
    const nickName = e.detail.value;
    const app = getApp();

    if (nickName && nickName.trim()) {
      wx.showLoading({
        title: '保存中...',
        mask: true,
      });

      app.updateUserInfo(nickName.trim(), null).then(() => {
        wx.hideLoading();
        this.loadUserInfo();
        Toast({
          context: this,
          selector: '#t-toast',
          message: '昵称修改成功',
          theme: 'success',
        });
      }).catch(err => {
        wx.hideLoading();
        console.error('更新昵称失败:', err);
        Toast({
          context: this,
          selector: '#t-toast',
          message: '昵称修改失败',
          theme: 'error',
        });
      });
    }
  },
});
