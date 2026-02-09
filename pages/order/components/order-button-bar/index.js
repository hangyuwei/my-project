import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';
import { OrderButtonTypes } from '../../config';
import { updateLocalOrderStatus, deleteLocalOrder } from '../../../../services/order/localOrders';

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
        // 售后按钮单独挪到左侧
        const refundBtnIndex = buttonsRight.findIndex((b) => b.type === OrderButtonTypes.APPLY_REFUND);
        let buttonsLeft = [];
        if (refundBtnIndex > -1) {
          buttonsLeft = buttonsRight.splice(refundBtnIndex, 1);
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

    onCancel(order) {
      // 取消原因选项
      const cancelReasons = [
        '我不想买了',
        '信息填写错误，重新拍',
        '卖家缺货',
        '同类商品价格更低',
        '操作有误（重复下单/选错商品等）',
        '其他原因',
      ];

      // 选择取消原因
      wx.showActionSheet({
        itemList: cancelReasons,
        success: (reasonResult) => {
          const cancelReason = cancelReasons[reasonResult.tapIndex];

          // 确认取消
          Dialog.confirm({
            context: this,
            selector: '#t-dialog',
            title: '确认取消订单？',
            content: `取消原因：${cancelReason}\n\n取消后订单将无法恢复`,
            confirmBtn: '确认取消',
            cancelBtn: '暂不取消',
          })
            .then(() => {
              wx.showLoading({ title: '取消中...', mask: true });

              wx.cloud
                .callFunction({
                  name: 'cancelOrder',
                  data: {
                    orderNo: order.orderNo,
                    cancelReason,
                  },
                })
                .then((res) => {
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
                })
                .catch((error) => {
                  wx.hideLoading();
                  console.error('[取消订单] 云函数调用异常:', error);

                  // 更详细的错误提示
                  let errorMsg = '取消失败，请重试';
                  if (error.errMsg) {
                    if (error.errMsg.includes('cloud init')) {
                      errorMsg = '云环境未初始化，请检查配置';
                    } else if (error.errMsg.includes('function not found')) {
                      errorMsg = '云函数未部署，请联系管理员';
                    } else if (error.errMsg.includes('timeout')) {
                      errorMsg = '请求超时，请检查网络';
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
                });
            })
            .catch(() => {
              // 用户点击了取消
              console.log('[取消订单] 用户取消操作');
            });
        },
        fail: () => {
          // 用户取消选择原因
          console.log('[取消订单] 用户取消选择原因');
        },
      });
    },

    onConfirm(order) {
      // 使用微信原生模态框
      wx.showModal({
        title: '确认收货',
        content: '确认是否已经收到货？',
        confirmText: '确认收货',
        cancelText: '取消',
        success: (res) => {
          if (!res.confirm) {
            console.log('[确认收货] 用户取消操作');
            return;
          }
          // 用户点击了确认
          wx.showLoading({ title: '处理中...', mask: true });

          // 调用云函数
          wx.cloud
            .callFunction({
              name: 'confirmReceipt',
              data: { orderNo: order.orderNo },
            })
            .then((res) => {
              wx.hideLoading();

              if (res.result && res.result.success) {
                // 同步更新本地订单状态
                this.updateOrderStatus(order.orderNo, 50, '已完成');
                // 显示成功弹窗
                wx.showModal({
                  title: '收货成功',
                  content: '感谢您的购买，欢迎下次光临！',
                  showCancel: false,
                  confirmText: '好的',
                  success: () => {
                    // 刷新订单列表
                    this.triggerEvent('refresh');
                  },
                });
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
            })
            .catch((error) => {
              wx.hideLoading();
              console.error('[确认收货] 云函数调用异常:', error);

              // 更详细的错误提示
              let errorMsg = '确认收货失败，请重试';
              if (error.errMsg) {
                if (error.errMsg.includes('cloud init')) {
                  errorMsg = '云环境未初始化，请检查配置';
                } else if (error.errMsg.includes('function not found')) {
                  errorMsg = '云函数未部署，请联系管理员';
                } else if (error.errMsg.includes('timeout')) {
                  errorMsg = '请求超时，请检查网络';
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
            });
        },
      });
    },

    onPay(order) {
      Dialog.confirm({
        context: this,
        selector: '#t-dialog',
        title: '确认支付',
        content: `应付金额：¥${(order.amount / 100).toFixed(2)}`,
        confirmBtn: '确认支付',
        cancelBtn: '取消',
      })
        .then(() => {
          wx.showLoading({ title: '支付中...', mask: true });

          wx.cloud
            .callFunction({
              name: 'payOrder',
              data: { orderNo: order.orderNo },
            })
            .then((res) => {
              wx.hideLoading();

              if (res.result && res.result.success) {
                // 同步更新本地订单状态
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
              } else {
                const errorMsg = res.result?.error || '支付失败';
                console.error('[支付订单] 失败:', errorMsg);
                Toast({
                  context: this,
                  selector: '#t-toast',
                  message: errorMsg,
                  icon: 'error-circle',
                });
              }
            })
            .catch((error) => {
              wx.hideLoading();
              console.error('[支付订单] 云函数调用异常:', error);

              let errorMsg = '支付失败，请重试';
              if (error.errMsg) {
                if (error.errMsg.includes('cloud init')) {
                  errorMsg = '云环境未初始化，请检查配置';
                } else if (error.errMsg.includes('function not found')) {
                  errorMsg = '云函数未部署，请联系管理员';
                } else if (error.errMsg.includes('timeout')) {
                  errorMsg = '请求超时，请检查网络';
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
            });
        })
        .catch(() => {
          console.log('[支付订单] 用户取消操作');
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

    onDelete(order) {
      Dialog.confirm({
        context: this,
        selector: '#t-dialog',
        title: '确认删除订单？',
        content: '删除后订单将无法恢复',
        confirmBtn: '确认删除',
        cancelBtn: '取消',
      })
        .then(() => {
          wx.showLoading({ title: '删除中...', mask: true });

          wx.cloud
            .callFunction({
              name: 'deleteOrder',
              data: { orderNo: order.orderNo },
            })
            .then((res) => {
              // 无论云函数是否成功，都尝试删除本地订单
              deleteLocalOrder(order.orderNo);

              wx.hideLoading();

              if (res.result && res.result.success) {
                Toast({
                  context: this,
                  selector: '#t-toast',
                  message: '订单已删除',
                  icon: 'check-circle',
                });
                // 刷新订单列表
                setTimeout(() => {
                  this.triggerEvent('refresh');
                }, 500);
              } else {
                // 即使云函数失败，本地订单已删除，仍然提示成功
                Toast({
                  context: this,
                  selector: '#t-toast',
                  message: '订单已删除',
                  icon: 'check-circle',
                });
                setTimeout(() => {
                  this.triggerEvent('refresh');
                }, 500);
              }
            })
            .catch((error) => {
              wx.hideLoading();
              console.error('[删除订单] 云函数调用异常:', error);

              // 尝试删除本地订单
              deleteLocalOrder(order.orderNo);

              // 本地订单已删除，仍然提示成功
              Toast({
                context: this,
                selector: '#t-toast',
                message: '订单已删除',
                icon: 'check-circle',
              });
              setTimeout(() => {
                this.triggerEvent('refresh');
              }, 500);
            });
        })
        .catch(() => {
          console.log('[删除订单] 用户取消操作');
        });
    },

    onApplyRefund(order) {
      const goodsIndex = this.properties.goodsIndex ?? 0;
      const goods = order.goodsList[goodsIndex];

      if (!goods) {
        console.error('[申请售后] 商品信息不存在');
        Toast({
          context: this,
          selector: '#t-toast',
          message: '商品信息不存在',
          icon: 'error-circle',
        });
        return;
      }

      // 获取商品价格（优先级：price > actualPrice > goodsPaymentPrice > paidAmountEach）
      const priceValue = goods.price || goods.actualPrice || goods.goodsPaymentPrice || goods.paidAmountEach || 0;
      const goodsPrice = parseInt(priceValue, 10) || 0;
      const goodsNum = parseInt(goods.num || goods.quantity || goods.buyQuantity, 10) || 1;

      const params = {
        orderNo: order.orderNo,
        skuId: goods.skuId || goods.sku || '',
        spuId: goods.spuId || goods.spu || '',
        orderStatus: order.status,
        logisticsNo: order.logisticsNo || '',
        price: goodsPrice, // 保持分为单位
        num: goodsNum,
        createTime: order.createTime,
        orderAmt: order.totalAmount || order.amount,
        payAmt: order.amount || order.paymentAmount,
        canApplyReturn: true,
        goodsName: encodeURIComponent(goods.title || goods.goodsName || goods.name || '商品'),
        goodsImage: encodeURIComponent(goods.thumb || goods.imgUrl || goods.primaryImage || goods.image || ''),
        specs: encodeURIComponent(Array.isArray(goods.specs) ? goods.specs.join(' ') : (goods.specs || '')),
      };

      const paramsStr = Object.keys(params)
        .map((k) => `${k}=${params[k]}`)
        .join('&');
      wx.navigateTo({
        url: `/pages/order/apply-service/index?${paramsStr}`,
        fail: (err) => {
          console.error('[申请售后] 跳转失败:', err);
          Toast({
            context: this,
            selector: '#t-toast',
            message: '页面跳转失败',
            icon: 'error-circle',
          });
        }
      });
    },

    onViewRefund(order) {
      // 查询该订单的售后记录
      wx.showLoading({ title: '加载中...', mask: true });

      wx.cloud.callFunction({
        name: 'afterSale',
        data: {
          action: 'getByOrderNo',
          orderNo: order.orderNo,
        },
      }).then((res) => {
        wx.hideLoading();

        if (res.result && res.result.success && res.result.data) {
          // 有售后记录，跳转到售后详情页
          const afterSale = res.result.data;
          wx.navigateTo({
            url: `/pages/order/after-service-detail/index?rightsNo=${afterSale.afterSaleNo || afterSale.rightsNo}`,
          });
        } else {
          // 没有售后记录，跳转到申请售后页面
          const goods = order.goodsList && order.goodsList[0];
          if (goods) {
            const params = {
              orderNo: order.orderNo,
              skuId: goods.skuId || '',
              spuId: goods.spuId || '',
              orderStatus: order.status,
              canApplyReturn: true,
              goodsName: encodeURIComponent(goods.title || goods.goodsName || '商品'),
              goodsImage: encodeURIComponent(goods.thumb || goods.imgUrl || ''),
              specs: encodeURIComponent(Array.isArray(goods.specs) ? goods.specs.join(' ') : ''),
              price: goods.price || 0,
              num: goods.num || 1,
            };
            const paramsStr = Object.keys(params).map((k) => `${k}=${params[k]}`).join('&');
            wx.navigateTo({
              url: `/pages/order/apply-service/index?${paramsStr}`,
            });
          } else {
            Toast({
              context: this,
              selector: '#t-toast',
              message: '商品信息不存在',
              icon: 'error-circle',
            });
          }
        }
      }).catch((error) => {
        wx.hideLoading();
        console.error('[查看售后] 查询失败:', error);
        // 查询失败时，默认跳转到申请售后页面
        const goods = order.goodsList && order.goodsList[0];
        if (goods) {
          const params = {
            orderNo: order.orderNo,
            skuId: goods.skuId || '',
            spuId: goods.spuId || '',
            orderStatus: order.status,
            canApplyReturn: true,
            goodsName: encodeURIComponent(goods.title || goods.goodsName || '商品'),
            goodsImage: encodeURIComponent(goods.thumb || goods.imgUrl || ''),
            specs: encodeURIComponent(Array.isArray(goods.specs) ? goods.specs.join(' ') : ''),
            price: goods.price || 0,
            num: goods.num || 1,
          };
          const paramsStr = Object.keys(params).map((k) => `${k}=${params[k]}`).join('&');
          wx.navigateTo({
            url: `/pages/order/apply-service/index?${paramsStr}`,
          });
        }
      });
    },

    /** 添加订单评论 */
    onAddComment(order) {
      const goods = order?.goodsList?.[0];
      const imgUrl = goods?.thumb || '';
      const title = goods?.title || '';
      const specs = Array.isArray(goods?.specs) ? goods.specs.join(' ') : (goods?.specs || '');
      const spuId = goods?.spuId || '';

      // 手动编码URL参数
      const params = [
        `orderNo=${encodeURIComponent(order?.orderNo || '')}`,
        `spuId=${encodeURIComponent(spuId)}`,
        `title=${encodeURIComponent(title)}`,
        `specs=${encodeURIComponent(specs)}`,
        `imgUrl=${encodeURIComponent(imgUrl)}`,
      ].join('&');

      wx.navigateTo({
        url: `/pages/goods/comments/create/index?${params}`,
      });
    },
  },
});
