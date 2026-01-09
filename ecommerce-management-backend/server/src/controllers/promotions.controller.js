import { deletePromotion, listPromotions, savePromotion } from '../services/promotions.service.js';
import { sendData } from '../utils/response.js';

export const getPromotions = async (req, res) => {
  const page = Number.parseInt(req.query.page || '1', 10);
  const pageSize = Number.parseInt(req.query.pageSize || '10', 10);
  const search = (req.query.search || '').trim();
  const result = await listPromotions({ page, pageSize, search });
  sendData(res, result);
};

export const postPromotions = async (req, res) => {
  const result = await savePromotion(req.body || {});
  sendData(res, result);
};

export const removePromotions = async (req, res) => {
  const result = await deletePromotion(req.params.id);
  sendData(res, result);
};
