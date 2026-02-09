import { DEFAULT_AVATAR_URL, normalizeAvatarUrl } from '../../../../../constants/avatar';

Component({
  externalClasses: ['wr-class'],
  options: {
    multipleSlots: true,
  },
  properties: {
    goodsDetailInfo: {
      type: String,
      value: '',
    },
    sellerReply: {
      type: String,
      value: '',
    },
    userHeadUrl: {
      type: String,
      value: '',
      observer(value) {
        this.syncAvatar(value);
      },
    },
    userName: {
      type: String,
      default: '',
    },
    commentContent: {
      type: String,
      value: '',
    },
    commentScore: {
      type: Number,
      value: 0,
    },
    commentTime: {
      type: String,
      value: '',
    },
    commentResources: {
      type: Array,
      value: [],
    },
  },

  data: {
    defaultAvatarUrl: DEFAULT_AVATAR_URL,
    safeUserHeadUrl: DEFAULT_AVATAR_URL,
    showMoreStatus: false,
    showContent: false,
    hideText: false,
    eleHeight: null,
    overText: false,
    isDisabled: true,
    startColors: ['#FFC51C', '#DDDDDD'],
  },
  lifetimes: {
    attached() {
      this.syncAvatar(this.properties.userHeadUrl);
    },
  },
  methods: {
    syncAvatar(url) {
      this.setData({
        safeUserHeadUrl: normalizeAvatarUrl(url),
      });
    },
    onAvatarError() {
      if (this.data.safeUserHeadUrl === DEFAULT_AVATAR_URL) return;
      this.setData({
        safeUserHeadUrl: DEFAULT_AVATAR_URL,
      });
    },
  },
});
