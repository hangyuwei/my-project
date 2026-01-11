import { getDashboard } from '../services/dashboard.service.js';
import { sendData } from '../utils/response.js';

export const getDashboardData = async (req, res) => {
  const result = await getDashboard();
  sendData(res, result);
};
