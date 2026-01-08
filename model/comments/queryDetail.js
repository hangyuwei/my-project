import { ensureArray, ensureObject, pickFirst } from '../adaptUtils';

const queryDetail = {
  commentInfos: [
    {
      id: '647984992708380600',
      uid: '',
      userName: 'Dean Cheng',
      userHeadUrl:
        'https://bizmid-material-qa-1302115263.cos.ap-guangzhou.myqcloud.com/comment/default_head.png',
      commentId: '1937712',
      commentIdName: '小鹿商品',
      commentIdImageUrl:
        'https://bizmid-material-qa-1302115263.file.myqcloud.com/persist/4bf2ded7-1759-4821-919c-cc4960e14120/1078823925183295617/100000114727/material/1/cdbeb389be64427b8c165627895ff0bc-1610425563793-%E5%A4%B4%E5%83%8F.png',
      commentStage: 1,
      commentCheckStatus: 2,
      commentIdType: 1,
      content: '',
      commentInfo: {
        score: null,
        content: '',
        medias: [],
        commentTime: '1617872404000',
      },
      isAgainComment: 0,
      commentHasAgainComment: 0,
      isAnonymous: 0,
      replyList: [],
      specification: '颜色:白色 ',
      specificationJson: '{"颜色":"白色"}',
      commentExtendId: '1937713',
      commentTime: '1617872404000',
      score: 0,
      goodsScore: null,
      freightScore: null,
      serviceScore: null,
      medias: [],
      againCommentList: null,
    },
  ],
  logisticsScore: null,
  serviceScore: null,
};

/**
 * @param {string} skuId
 * @param {string} spuId
 * @param {string} orderNo
 */
export function queryCommentDetail() {
  return queryDetail;
}


export function adaptCommentDetail(real = {}) {
  if (real && Array.isArray(real.commentInfos)) return real;
  const source = ensureObject(real);
  const list = ensureArray(source.items || source.commentInfos || source.list);
  if (!list.length) return queryCommentDetail();

  const base = queryCommentDetail();
  const baseInfo = base.commentInfos[0] || {};

  return {
    commentInfos: list.map((item, index) => {
      const info = ensureObject(item);
      return {
        ...baseInfo,
        id: pickFirst(info.id, baseInfo.id, String(index)),
        uid: pickFirst(info.uid, info.userId, baseInfo.uid, ''),
        userName: pickFirst(info.userName, info.user?.name, baseInfo.userName, ''),
        userHeadUrl: pickFirst(info.userHeadUrl, info.user?.avatar, baseInfo.userHeadUrl, ''),
        commentId: pickFirst(info.commentId, baseInfo.commentId, ''),
        commentIdName: pickFirst(info.commentIdName, baseInfo.commentIdName, ''),
        commentIdImageUrl: pickFirst(info.commentIdImageUrl, info.image, baseInfo.commentIdImageUrl, ''),
        content: pickFirst(info.content, baseInfo.content, ''),
        commentInfo: {
          ...baseInfo.commentInfo,
          score: pickFirst(info.commentInfo?.score, info.score, baseInfo.commentInfo?.score, null),
          content: pickFirst(info.commentInfo?.content, info.content, baseInfo.commentInfo?.content, ''),
          medias: ensureArray(info.commentInfo?.medias || info.medias),
          commentTime: pickFirst(info.commentInfo?.commentTime, info.commentTime, baseInfo.commentInfo?.commentTime, ''),
        },
        specification: pickFirst(info.specification, info.specInfo, baseInfo.specification, ''),
        specificationJson: pickFirst(info.specificationJson, baseInfo.specificationJson, ''),
        commentExtendId: pickFirst(info.commentExtendId, baseInfo.commentExtendId, ''),
        commentTime: pickFirst(info.commentTime, baseInfo.commentTime, ''),
        score: pickFirst(info.score, baseInfo.score, 0),
        goodsScore: pickFirst(info.goodsScore, baseInfo.goodsScore, null),
        freightScore: pickFirst(info.freightScore, baseInfo.freightScore, null),
        serviceScore: pickFirst(info.serviceScore, baseInfo.serviceScore, null),
        medias: ensureArray(info.medias || baseInfo.medias),
        againCommentList: pickFirst(info.againCommentList, baseInfo.againCommentList, null),
      };
    }),
    logisticsScore: pickFirst(source.logisticsScore, base.logisticsScore, null),
    serviceScore: pickFirst(source.serviceScore, base.serviceScore, null),
  };
}
