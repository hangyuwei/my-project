const { readDb, writeDb, generateId, nowIso } = require('./_helpers');

exports.main = async (event = {}) => {
  const db = readDb();
  const rightsNo = event.rightsNo || `R${Date.now()}`;
  const record = {
    id: rightsNo,
    rightsNo,
    orderNo: event.orderNo || '',
    reason: event.reason || event.applyReason?.desc || '',
    status: 'PENDING',
    createdAt: nowIso(),
  };
  db.rights.unshift(record);
  writeDb(db);
  return {};
};
