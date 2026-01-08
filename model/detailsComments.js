import { ensureArray, ensureObject, pickFirst, toString } from './adaptUtils';

export function getGoodsDetailsComments() {
  return {
    homePageComments: [
      {
        spuId: '1722045',
        skuId: null,
        specInfo: null,
        commentContent:
          '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentScore: 4,
        uid: '88881048075',
        userName: 'Dean',
        userHeadUrl:
          'https://wx.qlogo.cn/mmopen/vi_32/5mKrvn3ibyDNaDZSZics3aoKlz1cv0icqn4EruVm6gKjsK0xvZZhC2hkUkRWGxlIzOEc4600JkzKn9icOLE6zjgsxw/132',
      },
    ],
  };
}

export function getGoodsDetailsCommentsCount() {
  return {
    commentCount: '47',
    badCount: '0',
    middleCount: '2',
    goodCount: '45',
    hasImageCount: '1',
    goodRate: 95.7,
    uidCount: '0',
  };
}


export function adaptGoodsDetailsComments(real = {}) {
  if (real && Array.isArray(real.homePageComments)) return real;
  const source = ensureObject(real);
  const list = ensureArray(source.homePageComments || source.list || source.items);
  if (!list.length) return getGoodsDetailsComments();

  return {
    homePageComments: list.map((item) => {
      const comment = ensureObject(item);
      return {
        spuId: toString(pickFirst(comment.spuId, comment.productId, '')),
        skuId: pickFirst(comment.skuId, comment.variantId, null),
        specInfo: pickFirst(comment.specInfo, comment.specification, null),
        commentContent: pickFirst(comment.commentContent, comment.content, ''),
        commentScore: pickFirst(comment.commentScore, comment.score, 0),
        uid: toString(pickFirst(comment.uid, comment.userId, '')),
        userName: pickFirst(comment.userName, comment.user?.name, ''),
        userHeadUrl: pickFirst(comment.userHeadUrl, comment.user?.avatar, ''),
      };
    }),
  };
}

export function adaptGoodsDetailsCommentsCount(real = {}) {
  if (real && real.commentCount !== undefined) return real;
  const source = ensureObject(real);
  if (!Object.keys(source).length) return getGoodsDetailsCommentsCount();
  return {
    commentCount: toString(pickFirst(source.commentCount, source.total, 0)),
    badCount: toString(pickFirst(source.badCount, source.bad, 0)),
    middleCount: toString(pickFirst(source.middleCount, source.neutral, 0)),
    goodCount: toString(pickFirst(source.goodCount, source.good, 0)),
    hasImageCount: toString(pickFirst(source.hasImageCount, source.withImage, 0)),
    goodRate: pickFirst(source.goodRate, source.rate, 0),
    uidCount: toString(pickFirst(source.uidCount, 0)),
  };
}
