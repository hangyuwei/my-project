import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';
import { OrderButtonTypes } from '../../config';
import { updateLocalOrderStatus } from '../../../../services/order/localOrders';

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    order: {
      type: Object,
      observer(order) {
        // 判定有传goodsIndex ，则认为是商品button bar, 仅显示申请售后按钮
        if (this.properties?.goodsIndex !== null) {
          const goods = order.goodsList[Number(this.properties.goodsIndex)];
          const rightButtons = (goods.buttons || [])
            .filter((b) => b.type == OrderButtonTypes.APPLY_REFUND)
            .map((button) => ({
              ...button,
              openType: button.openType || '',
            }));
          this.setData({
            buttons: {
              left: [],
              right: rightButtons,
            },
          });
          return;
        }
        // 订单的button bar 不显示申请售后按钮
        const buttonsRight = (order.buttons || [])
          // .filter((b) => b.type !== OrderButtonTypes.APPLY_REFUND)
          .map((button) => {
            //邀请好友拼团按钮
            if (button.type === OrderButtonTypes.INVITE_GROUPON && order.groupInfoVo) {
              const {
                groupInfoVo: { groupId, promotionId, remainMember, groupPrice },
                goodsList,
              } = order;
              const goodsImg = goodsList[0] && goodsList[0].imgUrl;
              const goodsName = goodsList[0] && goodsList[0].name;
              return {
                ...button,
                openType: 'share',
                dataShare: {
                  goodsImg,
                  goodsName,
                  groupId,
                  promotionId,
                  remainMember,
                  groupPrice,
                  storeId: order.storeId,
                },
              };
            }
            return {
              ...button,
              openType: button.openType || '',
            };
          });
        // 删除订单按钮单独挪到左侧
        const deleteBtnIndex = buttonsRight.findIndex((b) => b.type === OrderButtonTypes.DELETE);
        let buttonsLeft = [];
        if (deleteBtnIndex > -1) {
          buttonsLeft = buttonsRight.splice(deleteBtnIndex, 1);
        }
        this.setData({
          buttons: {
            left: buttonsLeft,
            right: buttonsRight,
          },
        });
      },
    },
    goodsIndex: {
      type: Number,
      value: null,
    },
    isBtnMax: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    order: {},
    buttons: {
      left: [],
      right: [],
    },
  },

  methods: {
    // 点击【订单操作】按钮，根据按钮类型分发
    onOrderBtnTap(e) {
      const { type } = e.currentTarget.dataset;
      switch (type) {
        case OrderButtonTypes.DELETE:
          this.onDelete(this.data.order);
          break;
        case OrderButtonTypes.CANCEL:
          this.onCancel(this.data.order);
          break;
        case OrderButtonTypes.CONFIRM:
          this.onConfirm(this.data.order);
          break;
        case OrderButtonTypes.PAY:
          this.onPay(this.data.order);
          break;
        case OrderButtonTypes.APPLY_REFUND:
          this.onApplyRefund(this.data.order);
          break;
        case OrderButtonTypes.VIEW_REFUND:
          this.onViewRefund(this.data.order);
          break;
        case OrderButtonTypes.COMMENT:
          this.onAddComment(this.data.order);
          break;
        case OrderButtonTypes.INVITE_GROUPON:
          //分享邀请好友拼团
          break;
        case OrderButtonTypes.REBUY:
          this.onBuyAgain(this.data.order);
      }
    },

    async onCancel(order) {
      console.log('[取消订单] 订单信息:', order);

      // 取消原因选项
      const cancelReasons = [
        '我不想买了',
        '信息填写错误，重新拍',
        '卖家缺货',
        '同类商品价格更低',
        '操作有误（重复下单/选错商品等）',
        '其他原因',
      ];

      try {
        // 选择取消原因
        const reasonResult = await new Promise((resolve, reject) => {
          wx.showActionSheet({
            itemList: cancelReasons,
            success: resolve,
            fail: () => reject(new Error('用户取消选择')),
          });
        });

        const cancelReason = cancelReasons[reasonResult.tapIndex];
        console.log('[取消订单] 选择的原因:', cancelReason);

        // 确认取消
        const confirmed = await Dialog.confirm({
          title: '确认取消订单？',
          content: `取消原因：${cancelReason}\n\n取消后订单将无法恢复`,
          confirmBtn: '确认取消',
          cancelBtn: '暂不取消',
        }).catch(() => false);

        if (!confirmed) {
          console.log('[取消订单] 用户取消确认');
          return;
        }

        wx.showLoading({ title: '取消中...' });

        // 调用云函数取消订单
        console.log('[取消订单] 调用云函数...', { orderNo: order.orderNo, cancelReason });
        const res = await wx.cloud.callFunction({
          name: 'cancelOrder',
          data: {
            orderNo: order.orderNo,
            cancelReason,
          },
        });

        console.log('[取消订单] 云函数返回:', res);
        wx.hideLoading();

        if (res.result && res.result.success) {
          // 更新本地订单状态为已取消(80)
          this.updateOrderStatus(order.orderNo, 80, '已取消');
          Toast({
            context: this,
            selector: '#t-toast',
            message: '订单已取消',
            icon: 'check-circle',
          });
          // 刷新订单列表
          setTimeout(() => {
            this.triggerEvent('refresh');
          }, 500);
        } else {
          const errorMsg = res.result?.error || '取消失败';
          console.error('[取消订单] 失败:', errorMsg);
          Toast({
            context: this,
            selector: '#t-toast',
            message: errorMsg,
            icon: 'error-circle',
          });
        }
      } catch (error) {
        wx.hideLoading();
        console.error('[取消订单] 异常:', error);

        if (error.message === '用户取消选择') {
          console.log('[取消订单] 用户取消选择原因');
          return;
        }

        // 更详细的错误提示
        let errorMsg = '取消失败，请重试';
        if (error.errMsg) {
          if (error.errMsg.includes('cloud init')) {
            errorMsg = '云环境未初始化，请检查配置';
          } else if (error.errMsg.includes('function not found')) {
            errorMsg = '云函数未部署，请联系管理员';
          } else {
            errorMsg = error.errMsg;
          }
        }

        Toast({
          context: this,
          selector: '#t-toast',
          message: errorMsg,
          icon: 'error-circle',
        });
      }
    },

    async onConfirm(order) {
      try {
        const confirmed = await Dialog.confirm({
          title: '确认是否已经收到货？',
          content: '',
          confirmBtn: '确认收货',
          cancelBtn: '取消',
        }).catch(() => false);

        if (!confirmed) return;

        wx.showLoading({ title: '处理中...' });

        // 调用云函数更新订单状态
        console.log('[确认收货] 调用云函数...', { orderNo: order.orderNo });
        const res = await wx.cloud.callFunction({
          name: 'confirmReceipt',
          data: { orderNo: order.orderNo },
        });

        console.log('[确认收货] 云函数返回:', res);
        wx.hideLoading();

        if (res.result && res.result.success) {
          // 同步更新本地订单状态
          this.updateOrderStatus(order.orderNo, 50, '已完成');
          Toast({
            context: this,
            selector: '#t-toast',
            message: '确认收货成功',
            icon: 'check-circle',
          });
          // 刷新订单列表
          setTimeout(() => {
            this.triggerEvent('refresh');
          }, 500);
        } else {
          const errorMsg = res.result?.error || '确认收货失败';
          console.error('[确认收货] 失败:', errorMsg);
          Toast({
            context: this,
            selector: '#t-toast',
            message: errorMsg,
            icon: 'error-circle',
          });
        }
      } catch (error) {
        wx.hideLoading();
        console.error('[确认收货] 异常:', error);
        Toast({
          context: this,
          selector: '#t-toast',
          message: '确认收货失败，请重试',
          icon: 'error-circle',
        });
      }
    },

    onPay(order) {
      // 模拟支付：将订单状态从"待付款"(5)更新为"待发货"(10)
      Dialog.confirm({
        title: '确认支付',
        content: `实付金额：¥${(order.amount / 100).toFixed(2)}`,
        confirmBtn: '确认支付',
        cancelBtn: '取消',
      })
        .then(() => {
          // 更新本地订单状态
          this.updateOrderStatus(order.orderNo, 10, '待发货');
          Toast({
            context: this,
            selector: '#t-toast',
            message: '支付成功',
            icon: 'check-circle',
          });
          // 刷新订单列表
          setTimeout(() => {
            this.triggerEvent('refresh');
          }, 500);
        })
        .catch(() => {
          // 用户取消支付
        });
    },

    // 更新订单状态
    updateOrderStatus(orderNo, newStatus, newStatusName) {
      updateLocalOrderStatus(orderNo, newStatus, newStatusName);
    },

    onBuyAgain() {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '你点击了再次购买',
        icon: 'check-circle',
      });
    },

    onApplyRefund(order) {
      const goods = order.goodsList[this.properties.goodsIndex];
      const params = {
        orderNo: order.orderNo,
        skuId: goods?.skuId ?? '19384938948343',
        spuId: goods?.spuId ?? '28373847384343',
        orderStatus: order.status,
        logisticsNo: order.logisticsNo,
        price: goods?.price ?? 89,
        num: goods?.num ?? 89,
        createTime: order.createTime,
        orderAmt: order.totalAmount,
        payAmt: order.amount,
        canApplyReturn: true,
      };
      const paramsStr = Object.keys(params)
        .map((k) => `${k}=${params[k]}`)
        .join('&');
      wx.navigateTo({ url: `/pages/order/apply-service/index?${paramsStr}` });
    },

    onViewRefund(order) {
      // 跳转到售后列表页面查看退款详情
      wx.navigateTo({
        url: `/pages/order/after-service-list/index?orderNo=${order.orderNo}`,
      });
    },

    /** 添加订单评论 */
    onAddComment(order) {
      const imgUrl = order?.goodsList?.[0]?.thumb;
      const title = order?.goodsList?.[0]?.title;
      const specs = order?.goodsList?.[0]?.specs;
      wx.navigateTo({
        url: `/pages/goods/comments/create/index?specs=${specs}&title=${title}&orderNo=${order?.orderNo}&imgUrl=${imgUrl}`,
      });
    },
  },
});
