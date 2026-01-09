import { deleteUser, listUsers, saveUser } from '../services/users.service.js';
import { sendData } from '../utils/response.js';

export const getUsers = async (req, res) => {
  const page = Number.parseInt(req.query.page || '1', 10);
  const pageSize = Number.parseInt(req.query.pageSize || '10', 10);
  const search = (req.query.search || '').trim();
  const result = await listUsers({ page, pageSize, search });
  sendData(res, result);
};

export const postUsers = async (req, res) => {
  const result = await saveUser(req.body || {});
  sendData(res, result);
};

export const removeUsers = async (req, res) => {
  const result = await deleteUser(req.params.id);
  sendData(res, result);
};
