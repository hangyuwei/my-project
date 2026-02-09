import { ensureArray, ensureObject, pickFirst, toInt, toString } from './adaptUtils';

/**
 *  * @param {number} spuId
 * @param {number} pageNum
 * @param {number} pageSize
 * @param {number} commentsLevel
 * @param {boolean} hasImage
 */
export function getGoodsAllComments(params) {
  const { hasImage } = params.queryParameter;
  if (hasImage) {
    return {
      pageNum: 1,
      pageSize: 10,
      totalCount: '1',
      pageList: [
        {
          spuId: '1722045',
          skuId: '0',
          specInfo: '',
          commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
          commentResources: [
            {
              src: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
              type: 'image',
            },
            {
              src: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/comment-video.mp4',
              type: 'video',
              coverSrc: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
            },
            {
              src: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/comment-video.mp4',
              type: 'video',
              coverSrc: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
            },
            {
              src: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/comment-video.mp4',
              type: 'video',
              coverSrc: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
            },
          ],
          commentScore: 4,
          uid: '88881048075',
          userName: 'Dean',
          userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
          isAnonymity: false,
          commentTime: '1591953561000',
          isAutoComment: false,
          sellerReply: '亲，你好，我们会联系商家和厂商给您一个满意的答复请一定妥善保管好发票',
          goodsDetailInfo: '颜色:纯净白  尺码:S码',
        },
        {
          spuId: '1722045',
          skuId: '0',
          specInfo: '',
          commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
          commentResources: [
            {
              src: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
              type: 'image',
            },
          ],
          commentScore: 4,
          uid: '88881048075',
          userName: 'Dean',
          userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
          isAnonymity: false,
          commentTime: '1591953561000',
          isAutoComment: false,
          sellerReply: '亲，你好，我们会联系商家和厂商给您一个满意的答复请一定妥善保管好发票',
          goodsDetailInfo: '颜色:纯净白  尺码:S码',
        },
        {
          spuId: '1722045',
          skuId: '0',
          specInfo: '',
          commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
          commentResources: [
            {
              src: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
              type: 'image',
            },
            {
              src: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/comment-video.mp4',
              type: 'video',
              coverSrc: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
            },
          ],
          commentScore: 4,
          uid: '88881048075',
          userName: 'Dean',
          userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
          isAnonymity: false,
          commentTime: '1591953561000',
          isAutoComment: false,
          sellerReply: '亲，你好，我们会联系商家和厂商给您一个满意的答复请一定妥善保管好发票',
          goodsDetailInfo: '颜色:纯净白  尺码:S码',
        },
        {
          spuId: '1722045',
          skuId: '0',
          specInfo: '',
          commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
          commentResources: [
            {
              src: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
              type: 'image',
            },
            {
              src: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/comment-video.mp4',
              type: 'video',
              coverSrc: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
            },
            {
              src: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/comment-video.mp4',
              type: 'video',
              coverSrc: 'https://tdesign.gtimg.com/miniprogram/template/retail/goods/nz-08b.png',
            },
          ],
          commentScore: 4,
          uid: '88881048075',
          userName: 'Dean',
          userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
          isAnonymity: false,
          commentTime: '1591953561000',
          isAutoComment: false,
          sellerReply: '亲，你好，我们会联系商家和厂商给您一个满意的答复请一定妥善保管好发票',
          goodsDetailInfo: '颜色:纯净白  尺码:S码',
        },
      ],
    };
  }
  return {
    pageNum: 1,
    pageSize: 10,
    totalCount: '47',
    pageList: [
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '很不错',
        commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentImageUrls: null,
        commentScore: 1,
        uid: '88881048075',
        userName: 'Dean',
        userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
        isAnonymity: false,
        commentTime: '1592224320000',
        isAutoComment: false,
        sellerReply: '亲，你好，我们会联系商家和厂商给您一个满意的答复请一定妥善保管好发票',
        goodsDetailInfo: '颜色:纯净白  尺码:S码',
      },
      {
        spuId: '1722045',
        skuId: '1697693',
        specInfo: '很适合',
        commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentImageUrls: null,
        commentScore: 1,
        uid: '88881048075',
        userName: 'Dean',
        userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
        isAnonymity: false,
        commentTime: '1592224320000',
        isAutoComment: false,
        sellerReply: '亲，你好，我们会联系商家和厂商给您一个满意的答复请一定妥善保管好发票',
        goodsDetailInfo: '颜色:纯净白  尺码:S码',
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: 'NICE',
        commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: 'Dean',
        userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: true,
        sellerReply: '亲，你好，我们会联系商家和厂商给您一个满意的答复请一定妥善保管好发票',
      },
      {
        spuId: '1722045',
        skuId: '0',
        specInfo: '',
        commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: 'Dean',
        userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
        isAnonymity: false,
        commentTime: '1592218074000',
        isAutoComment: false,
        goodsDetailInfo: '颜色:纯净白  尺码:S码',
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '测试dr超长:dr专用超长;bwtgg01:fff',
        commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: 'Dean',
        userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
        isAnonymity: false,
        commentTime: '1592217607000',
        isAutoComment: false,
      },
      {
        spuId: '1722045',
        skuId: '1697693',
        specInfo: '测试dr超长:超长测试超长测试1;bwtgg01:bbb',
        commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentImageUrls: null,
        commentScore: 4,
        uid: '88881048075',
        userName: 'Dean',
        userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
        isAnonymity: false,
        commentTime: '1592217607000',
        isAutoComment: false,
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '测试dr超长:dr专用超长;bwtgg01:fff',
        commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: 'Dean',
        userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
        isAnonymity: false,
        commentTime: '1592205599000',
        isAutoComment: false,
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '测试dr超长:dr专用超长;bwtgg01:fff',
        commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881048075',
        userName: 'Dean',
        userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
        isAnonymity: false,
        commentTime: '1592188822000',
        isAutoComment: false,
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '测试dr超长:dr专用超长;bwtgg01:fff',
        commentContent: '收到货了，第一时间试了一下，很漂亮特别喜欢，大爱大爱，颜色也很好看。棒棒!',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881055835',
        userName: 'Max',
        userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
        isAnonymity: false,
        commentTime: '1593792002000',
        isAutoComment: true,
      },
      {
        spuId: '1722045',
        skuId: '1697694',
        specInfo: '测试dr超长:dr专用超长;bwtgg01:fff',
        commentContent: '',
        commentImageUrls: null,
        commentScore: 5,
        uid: '88881055835',
        userName: 'Max',
        userHeadUrl: 'https://tdesign.gtimg.com/miniprogram/template/retail/avatar/avatar1.png',
        isAnonymity: false,
        commentTime: '1593792001000',
        isAutoComment: true,
      },
    ],
  };
}

export function getGoodsCommentsCount() {
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


const mapCommentItem = (comment = {}, hasImage = false) => {
  const source = ensureObject(comment);
  const mediaList = ensureArray(source.commentResources || source.media || source.medias || source.images);
  const commentResources = mediaList.map((media) => {
    if (media && typeof media === 'object') {
      return {
        src: pickFirst(media.src, media.url, media.image, ''),
        type: pickFirst(media.type, media.mediaType, 'image'),
        coverSrc: pickFirst(media.coverSrc, media.cover, media.thumb, undefined),
      };
    }
    return { src: media, type: 'image' };
  });

  return {
    spuId: toString(pickFirst(source.spuId, source.productId, '')),
    skuId: toString(pickFirst(source.skuId, source.variantId, '0')),
    specInfo: pickFirst(source.specInfo, source.specification, ''),
    commentContent: pickFirst(source.commentContent, source.content, ''),
    commentResources: hasImage ? commentResources : source.commentResources,
    commentImageUrls: hasImage ? undefined : pickFirst(source.commentImageUrls, null),
    commentScore: toInt(pickFirst(source.commentScore, source.score, source.rating, 0), 0),
    uid: toString(pickFirst(source.uid, source.userId, '')),
    userName: pickFirst(source.userName, source.user?.name, source.nickname, ''),
    userHeadUrl: pickFirst(source.userHeadUrl, source.user?.avatar, source.avatar, ''),
    isAnonymity: pickFirst(source.isAnonymity, source.isAnonymous, false),
    commentTime: pickFirst(source.commentTime, source.createdAt, ''),
    isAutoComment: pickFirst(source.isAutoComment, false),
    sellerReply: pickFirst(source.sellerReply, source.reply, ''),
    goodsDetailInfo: pickFirst(source.goodsDetailInfo, source.detailInfo, ''),
  };
};

export function adaptGoodsAllComments(real = {}, params = {}) {
  if (real && Array.isArray(real.pageList)) return real;
  const source = ensureObject(real);
  // 支持云函数返回格式 { success, data: { homePageComments, ... } }
  const dataSource = source.data || source;
  const list = ensureArray(dataSource.pageList || dataSource.list || dataSource.items || dataSource.homePageComments);
  // 没有数据时返回空列表，不返回mock数据
  if (!list.length) {
    return {
      pageNum: 1,
      pageSize: 10,
      totalCount: '0',
      pageList: [],
    };
  }

  const hasImage = Boolean(params?.queryParameter?.hasImage);
  const mapped = list.map((item) => mapCommentItem(item, hasImage));

  return {
    pageNum: toInt(pickFirst(dataSource.pageNum, dataSource.page, source.pageNum, 1), 1),
    pageSize: toInt(pickFirst(dataSource.pageSize, dataSource.limit, source.pageSize, mapped.length), mapped.length),
    totalCount: toString(pickFirst(dataSource.totalCount, dataSource.total, source.totalCount, mapped.length), mapped.length),
    pageList: mapped,
  };
}

export function adaptGoodsCommentsCount(real = {}) {
  if (real && real.commentCount !== undefined) return real;
  const source = ensureObject(real);
  // 没有数据时返回0，不返回mock数据
  return {
    commentCount: toString(pickFirst(source.commentCount, source.total, 0)),
    badCount: toString(pickFirst(source.badCount, source.bad, 0)),
    middleCount: toString(pickFirst(source.middleCount, source.neutral, 0)),
    goodCount: toString(pickFirst(source.goodCount, source.good, 0)),
    hasImageCount: toString(pickFirst(source.hasImageCount, source.withImage, 0)),
    goodRate: pickFirst(source.goodRate, source.rate, 100),
    uidCount: '0',
  };
}
