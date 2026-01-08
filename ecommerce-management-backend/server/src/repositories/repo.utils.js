import { db } from '../libs/cloudbase.js';

export const isCollectionMissing = (error) => {
  const message = String(error?.message || '');
  const code = error?.code || error?.errorCode;
  return (
    code === 'DATABASE_COLLECTION_NOT_EXIST' ||
    message.includes('DATABASE_COLLECTION_NOT_EXIST') ||
    message.includes('Db or Table not exist')
  );
};

export const safeCount = async (query) => {
  try {
    return await query.count();
  } catch (error) {
    if (isCollectionMissing(error)) {
      return { total: 0 };
    }
    throw error;
  }
};

export const safeGet = async (query) => {
  try {
    return await query.get();
  } catch (error) {
    if (isCollectionMissing(error)) {
      return { data: [] };
    }
    throw error;
  }
};

export const safeDocGet = async (collectionName, id) => {
  try {
    return await db.collection(collectionName).doc(id).get();
  } catch (error) {
    if (isCollectionMissing(error)) {
      return { data: [] };
    }
    throw error;
  }
};

export const applyWhere = (collection, where) => {
  if (where && Object.keys(where).length > 0) {
    return collection.where(where);
  }
  return collection;
};
