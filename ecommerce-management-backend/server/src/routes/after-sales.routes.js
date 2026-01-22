import { Router } from 'express';
import * as repo from '../repositories/after-sales.repo.js';
import * as ordersRepo from '../repositories/orders.repo.js';
import { sendData, sendError } from '../utils/response.js';

const router = Router();

// 获取售后列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status = '' } = req.query;
    const result = await repo.findPaged({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      status,
    });
    sendData(res, result);
  } catch (err) {
    console.error('获取售后列表失败:', err);
    sendError(res, 500, err.message);
  }
});

// 获取售后详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await repo.findById(id);
    if (!result) {
      return sendError(res, 404, '售后单不存在');
    }
    sendData(res, result);
  } catch (err) {
    console.error('获取售后详情失败:', err);
    sendError(res, 500, err.message);
  }
});

// 更新售后状态
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    // 状态描述映射
    const statusDescMap = {
      APPLIED: '等待商家处理',
      SELLER_AGREED: '商家已同意',
      SELLER_REJECTED: '商家已拒绝',
      WAIT_BUYER_RETURN: '请寄回商品',
      BUYER_SHIPPED: '等待商家收货',
      SELLER_RECEIVED: '商家已收货',
      REFUNDING: '退款处理中',
      REFUNDED: '退款成功',
      CANCELED: '已取消',
    };

    const updateData = {
      status,
      statusDesc: statusDescMap[status] || status,
      updateTime: Date.now(),
    };

    // 根据状态添加额外字段
    if (status === 'SELLER_REJECTED' && rejectReason) {
      updateData.rejectReason = rejectReason;
      updateData.rejectTime = Date.now();
    }
    if (status === 'SELLER_AGREED' || status === 'WAIT_BUYER_RETURN') {
      updateData.agreeTime = Date.now();
    }
    if (status === 'SELLER_RECEIVED') {
      updateData.receiveTime = Date.now();
    }
    if (status === 'REFUNDED') {
      updateData.refundTime = Date.now();
    }

    await repo.updateById(id, updateData);

    // 当售后完成退款时，同步更新订单状态为已退款
    if (status === 'REFUNDED') {
      const afterSale = await repo.findById(id);
      if (afterSale && afterSale.orderId) {
        try {
          await ordersRepo.updateById(afterSale.orderId, {
            status: 'refunded',
            orderStatus: 80,
            hasAfterSale: false,
            updateTime: Date.now(),
          });
          console.log('订单状态已更新为已退款:', afterSale.orderId);
        } catch (orderUpdateErr) {
          console.error('更新订单状态失败:', orderUpdateErr);
        }
      }
    }

    // 当售后被取消或拒绝时，清除订单的售后标记
    if (status === 'CANCELED') {
      const afterSale = await repo.findById(id);
      if (afterSale && afterSale.orderId) {
        try {
          await ordersRepo.updateById(afterSale.orderId, {
            hasAfterSale: false,
            updateTime: Date.now(),
          });
        } catch (orderUpdateErr) {
          console.error('更新订单售后标记失败:', orderUpdateErr);
        }
      }
    }

    sendData(res, { id, status });
  } catch (err) {
    console.error('更新售后状态失败:', err);
    sendError(res, 500, err.message);
  }
});

export default router;
