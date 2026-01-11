import { deleteGoods, listGoods, saveGoods, setGoodsStatus } from '../services/goods.service.js';
import { sendData } from '../utils/response.js';

export const getGoods = async (req, res) => {
  const page = Number.parseInt(req.query.page || '1', 10);
  const pageSize = Number.parseInt(req.query.pageSize || '10', 10);
  const search = (req.query.search || '').trim();
  const result = await listGoods({ page, pageSize, search });
  sendData(res, result);
};

export const postGoods = async (req, res) => {
  const result = await saveGoods(req.body || {});
  sendData(res, result);
};

export const removeGoods = async (req, res) => {
  const result = await deleteGoods(req.params.id);
  sendData(res, result);
};

export const patchGoodsStatus = async (req, res) => {
  const result = await setGoodsStatus(req.params.id, req.body?.status);
  sendData(res, result);
};
