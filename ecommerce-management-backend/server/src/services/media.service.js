import path from 'node:path';
import { cloudApp } from '../libs/cloudbase.js';
import { generateId } from '../utils/id.js';

const buildCloudPath = ({ folder, filename }) => {
  const ext = path.extname(filename || '') || '.jpg';
  const name = generateId('goods');
  return `${folder || 'goods'}/${name}${ext}`;
};

export const uploadBufferToCloud = async ({ buffer, filename, folder }) => {
  const cloudPath = buildCloudPath({ folder, filename });
  const uploadResult = await cloudApp.uploadFile({
    cloudPath,
    fileContent: buffer,
  });
  const fileID = uploadResult.fileID;
  const tempResult = await cloudApp.getTempFileURL({
    fileList: [{ fileID, maxAge: 3600 }],
  });
  const tempFileURL = tempResult.fileList?.[0]?.tempFileURL || '';
  return {
    fileID,
    tempFileURL,
    cloudPath,
  };
};
