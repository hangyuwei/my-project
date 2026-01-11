import {
  batchUpdateOrders,
  deleteOrder,
  getOrderDetail,
  listOrders,
  saveOrder,
} from '../services/orders.service.js';
import { sendData, sendError } from '../utils/response.js';

export const getOrders = async (req, res) => {
  const page = Number.parseInt(req.query.page || '1', 10);
  const pageSize = Number.parseInt(req.query.pageSize || '10', 10);
  const search = (req.query.search || '').trim();
  const status = (req.query.status || '').trim();
  const userId = (req.query.userId || '').trim();
  const result = await listOrders({ page, pageSize, search, status, userId });
  sendData(res, result);
};

export const postOrders = async (req, res) => {
  const result = await saveOrder(req.body || {});
  sendData(res, result);
};

export const removeOrders = async (req, res) => {
  const result = await deleteOrder(req.params.id);
  sendData(res, result);
};

export const patchOrdersBatch = async (req, res) => {
  const result = await batchUpdateOrders(req.body || {});
  sendData(res, result);
};

export const getOrderDetailById = async (req, res) => {
  const detail = await getOrderDetail(req.params.id);
  if (!detail) {
    sendError(res, 404, 'Order not found');
    return;
  }
  sendData(res, detail);
};
