import { uploadBufferToCloud } from '../services/media.service.js';
import { sendData, sendError } from '../utils/response.js';

export const uploadFile = async (req, res) => {
  if (!req.file) {
    sendError(res, 400, 'Missing file');
    return;
  }
  const result = await uploadBufferToCloud({
    buffer: req.file.buffer,
    filename: req.file.originalname,
    folder: 'goods',
  });
  sendData(res, result);
};
