import { db } from '../libs/cloudbase.js';
import { safeGet } from './repo.utils.js';

const collection = () => db.collection('orderLogs');

/**
 * Create an order log entry
 * @param {Object} logData - Log data
 * @param {string} logData.orderId - Order database ID (_id)
 * @param {string} logData.orderNo - Order number (display ID)
 * @param {string} logData.status - Order status (pending, shipped, completed, refunded, etc.)
 * @param {string} logData.statusName - Human-readable status name
 * @param {string} logData.action - Action type (created, updated, batch_updated, etc.)
 * @param {string} logData.operator - Operator (user ID or 'system')
 * @param {string} logData.notes - Optional notes
 * @returns {Promise<Object>} Created log entry
 */
export const createLog = async (logData) => {
  const log = {
    orderId: logData.orderId,
    orderNo: logData.orderNo || '',
    status: logData.status,
    statusName: logData.statusName || '',
    action: logData.action || 'updated',
    operator: logData.operator || 'system',
    notes: logData.notes || '',
    timestamp: new Date(),
  };

  return collection().add(log);
};

/**
 * Get logs for a specific order
 * @param {string} orderId - Order database ID (_id)
 * @returns {Promise<Array>} Array of log entries
 */
export const findLogsByOrderId = async (orderId) => {
  const result = await safeGet(
    collection()
      .where({ orderId })
      .orderBy('timestamp', 'desc')
  );

  return result.data || [];
};

/**
 * Get recent logs for multiple orders
 * @param {Array<string>} orderIds - Array of order database IDs
 * @returns {Promise<Array>} Array of log entries
 */
export const findLogsByOrderIds = async (orderIds) => {
  if (!orderIds || orderIds.length === 0) return [];

  const _ = db.command;
  const result = await safeGet(
    collection()
      .where({
        orderId: _.in(orderIds)
      })
      .orderBy('timestamp', 'desc')
      .limit(1000)
  );

  return result.data || [];
};

/**
 * Delete logs for a specific order (when order is deleted)
 * @param {string} orderId - Order database ID (_id)
 * @returns {Promise<Object>} Result
 */
export const deleteLogsByOrderId = async (orderId) => {
  const _ = db.command;
  return collection().where({ orderId }).remove();
};
