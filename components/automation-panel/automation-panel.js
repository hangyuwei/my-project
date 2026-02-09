const recorder = require('../../utils/automation/recorder');
const player = require('../../utils/automation/player');
const storage = require('../../utils/automation/storage');

Component({
  data: {
    visible: false,
    mode: 'record', // 'record' | 'play'

    // 录制状态
    isRecording: false,
    isPaused: false,
    eventCount: 0,
    duration: 0,
    durationText: '0s',

    // 回放状态
    isPlaying: false,
    progress: 0,
    speed: 1.0,
    hasRecord: false,

    // 状态显示
    statusText: '空闲',
    statusClass: 'idle',

    // 录制列表
    recordList: [],
    selectedRecord: ''
  },

  lifetimes: {
    attached() {
      this.initAutomation();
      this.loadRecords();
    },

    detached() {
      this.cleanup();
    }
  },

  methods: {
    /**
     * 初始化自动化系统
     */
    initAutomation() {
      // 监听录制事件
      recorder.on('recordStart', () => {
        this.setData({
          isRecording: true,
          isPaused: false,
          statusText: '录制中',
          statusClass: 'recording'
        });
      });

      recorder.on('recordStop', async (data) => {
        this.setData({
          isRecording: false,
          isPaused: false,
          statusText: '空闲',
          statusClass: 'idle',
          eventCount: data.eventCount,
          duration: data.duration,
          durationText: this.formatDuration(data.duration)
        });

        // 保存录制数据
        await storage.saveRecord(data);
        await this.loadRecords();

        wx.showToast({
          title: '录制已保存',
          icon: 'success'
        });
      });

      recorder.on('recordPause', () => {
        this.setData({
          isPaused: true,
          statusText: '已暂停',
          statusClass: 'idle'
        });
      });

      recorder.on('recordResume', () => {
        this.setData({
          isPaused: false,
          statusText: '录制中',
          statusClass: 'recording'
        });
      });

      recorder.on('eventRecorded', () => {
        const status = recorder.getStatus();
        this.setData({
          eventCount: status.eventCount,
          duration: status.duration,
          durationText: this.formatDuration(status.duration)
        });
      });

      // 监听回放事件
      player.on('playStart', () => {
        this.setData({
          isPlaying: true,
          isPaused: false,
          statusText: '回放中',
          statusClass: 'playing',
          progress: 0
        });
      });

      player.on('playStop', () => {
        this.setData({
          isPlaying: false,
          isPaused: false,
          statusText: '空闲',
          statusClass: 'idle'
        });
      });

      player.on('playComplete', () => {
        this.setData({
          isPlaying: false,
          isPaused: false,
          statusText: '空闲',
          statusClass: 'idle',
          progress: 100
        });

        wx.showToast({
          title: '回放完成',
          icon: 'success'
        });
      });

      player.on('playPause', () => {
        this.setData({
          isPaused: true,
          statusText: '已暂停',
          statusClass: 'idle'
        });
      });

      player.on('playResume', () => {
        this.setData({
          isPaused: false,
          statusText: '回放中',
          statusClass: 'playing'
        });
      });

      player.on('progress', (data) => {
        this.setData({
          progress: parseFloat(data.progress)
        });
      });

      player.on('playError', (data) => {
        wx.showToast({
          title: '回放失败: ' + data.error,
          icon: 'none'
        });
      });
    },

    /**
     * 清理资源
     */
    cleanup() {
      recorder.off('recordStart');
      recorder.off('recordStop');
      recorder.off('recordPause');
      recorder.off('recordResume');
      recorder.off('eventRecorded');

      player.off('playStart');
      player.off('playStop');
      player.off('playComplete');
      player.off('playPause');
      player.off('playResume');
      player.off('progress');
      player.off('playError');
    },

    /**
     * 切换面板显示
     */
    togglePanel() {
      this.setData({
        visible: !this.data.visible
      });
    },

    /**
     * 切换模式
     */
    switchMode(e) {
      const mode = e.currentTarget.dataset.mode;
      this.setData({ mode });
    },

    /**
     * 开始/停止录制
     */
    toggleRecord() {
      if (this.data.isRecording) {
        const recordData = recorder.stop();
        console.log('录制停止:', recordData);
      } else {
        const sessionName = `录制_${new Date().toLocaleString('zh-CN')}`;
        recorder.start(sessionName);
        this.setData({
          eventCount: 0,
          duration: 0,
          durationText: '0s'
        });
      }
    },

    /**
     * 暂停/恢复录制
     */
    pauseRecord() {
      if (this.data.isPaused) {
        recorder.resume();
      } else {
        recorder.pause();
      }
    },

    /**
     * 清空录制
     */
    clearRecord() {
      recorder.clear();
      this.setData({
        eventCount: 0,
        duration: 0,
        durationText: '0s'
      });
      wx.showToast({
        title: '已清空',
        icon: 'success'
      });
    },

    /**
     * 开始/停止回放
     */
    async togglePlay() {
      if (this.data.isPlaying) {
        player.stop();
      } else {
        if (!this.data.selectedRecord) {
          wx.showToast({
            title: '请选择录制记录',
            icon: 'none'
          });
          return;
        }

        const record = await storage.getRecord(this.data.selectedRecord);
        if (!record) {
          wx.showToast({
            title: '录制记录不存在',
            icon: 'none'
          });
          return;
        }

        await player.play(record, { speed: this.data.speed });
      }
    },

    /**
     * 暂停/恢复回放
     */
    pausePlay() {
      if (this.data.isPaused) {
        player.resume();
      } else {
        player.pause();
      }
    },

    /**
     * 速度改变
     */
    onSpeedChange(e) {
      const speed = parseFloat(e.detail.value);
      this.setData({ speed });
      player.setSpeed(speed);
    },

    /**
     * 加载录制列表
     */
    async loadRecords() {
      const records = await storage.getAllRecords();
      const recordList = records.map(record => ({
        ...record,
        durationText: this.formatDuration(record.duration)
      }));

      this.setData({ recordList });
    },

    /**
     * 选择录制记录
     */
    selectRecord(e) {
      const sessionId = e.currentTarget.dataset.sessionId;
      this.setData({
        selectedRecord: sessionId,
        hasRecord: true
      });
    },

    /**
     * 播放录制记录
     */
    async playRecord(e) {
      const sessionId = e.currentTarget.dataset.sessionId;
      this.setData({
        selectedRecord: sessionId,
        hasRecord: true,
        mode: 'play'
      });

      // 延迟一下再播放
      setTimeout(async () => {
        await this.togglePlay();
      }, 300);
    },

    /**
     * 删除录制记录
     */
    async deleteRecord(e) {
      const sessionId = e.currentTarget.dataset.sessionId;

      const res = await new Promise((resolve) => {
        wx.showModal({
          title: '确认删除',
          content: '确定要删除这条录制记录吗？',
          success: resolve
        });
      });

      if (res.confirm) {
        await storage.deleteRecord(sessionId);
        await this.loadRecords();

        if (this.data.selectedRecord === sessionId) {
          this.setData({
            selectedRecord: '',
            hasRecord: false
          });
        }

        wx.showToast({
          title: '已删除',
          icon: 'success'
        });
      }
    },

    /**
     * 格式化时长
     */
    formatDuration(ms) {
      const seconds = Math.floor(ms / 1000);
      if (seconds < 60) {
        return `${seconds}s`;
      }
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  }
});
