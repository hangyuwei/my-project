import { db } from '../libs/cloudbase.js';
import { applyWhere, safeCount, safeGet } from './repo.utils.js';

const collection = () => db.collection('user');

// 适配用户数据：将数据库字段映射为前端期望的字段
export const adaptUser = (user) => {
  if (!user) return user;

  // 如果已经是前端格式，直接返回
  if (user.name && user.id) return user;

  // 数据库字段 -> 前端字段
  return {
    ...user,
    id: user.id || user.openid || user._openid,
    name: user.name || user.nickName || '未知用户',
    // 会员等级：可以根据实际业务规则计算，这里先设置默认值
    grade: user.grade || 'bronze',
  };
};

export const findPaged = async ({ page, pageSize, search }) => {
  let query = collection();

  if (search) {
    // 搜索时同时匹配 name 和 nickName 字段
    const searchRegex = db.RegExp({ regexp: search, options: 'i' });
    query = query.where(
      db.command.or([
        { name: searchRegex },
        { nickName: searchRegex }
      ])
    );
  }

  const listResult = await safeGet(
    query
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
  );

  // 计算总数时也要应用搜索条件
  let countQuery = collection();
  if (search) {
    const searchRegex = db.RegExp({ regexp: search, options: 'i' });
    countQuery = countQuery.where(
      db.command.or([
        { name: searchRegex },
        { nickName: searchRegex }
      ])
    );
  }
  const countResult = await safeCount(countQuery);

  return {
    list: (listResult.data || []).map(adaptUser),
    total: countResult.total || 0,
  };
};

export const create = async (data) => collection().add(data);

export const updateById = async (id, data) => collection().doc(id).update(data);

export const removeById = async (id) => collection().doc(id).remove();

export const findByUserId = async (userId) => {
  // userId 在订单中实际上是 openid
  // 尝试多个可能的字段：openid, id, _openid
  const result = await safeGet(
    collection()
      .where(
        db.command.or([
          { openid: userId },
          { id: userId },
          { _openid: userId }
        ])
      )
      .limit(1)
  );
  return result;
};
