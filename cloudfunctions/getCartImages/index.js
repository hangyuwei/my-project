const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

const isCloudFileId = (value) => typeof value === 'string' && value.startsWith('cloud://');

const pickImageSource = (product = {}) =>
  product.coverImage ||
  product.coverFileId ||
  product.imageFileId ||
  product.image ||
  product.primaryImage ||
  (Array.isArray(product.galleryImages) && product.galleryImages[0]) ||
  (Array.isArray(product.gallaryImages) && product.gallaryImages[0]) ||
  (Array.isArray(product.picture) && product.picture[0]) ||
  '';

exports.main = async (event = {}) => {
  const { spuIds = [] } = event;

  if (!spuIds.length) {
    return { images: {} };
  }

  try {
    // 批量查询商品
    const queries = spuIds.map((id) =>
      _.or([{ spuId: String(id) }, { mockId: String(id) }, { _id: String(id) }])
    );

    const res = await db.collection('goods')
      .where(_.or(queries))
      .field({ spuId: true, mockId: true, _id: true, coverImage: true, coverFileId: true, imageFileId: true, image: true, primaryImage: true, galleryImages: true, gallaryImages: true, picture: true })
      .get();

    const products = res.data || [];

    // 收集云存储fileID
    const fileIdMap = {};
    const cloudFileIds = [];

    products.forEach((product) => {
      const id = product.spuId || product.mockId || product._id;
      const imageSource = pickImageSource(product);
      fileIdMap[id] = imageSource;

      if (isCloudFileId(imageSource)) {
        cloudFileIds.push(imageSource);
      }
    });

    // 批量转换云存储URL
    let urlMap = {};
    if (cloudFileIds.length > 0) {
      const tempRes = await cloud.getTempFileURL({
        fileList: [...new Set(cloudFileIds)],
      });
      if (tempRes.fileList) {
        tempRes.fileList.forEach((file) => {
          if (file.tempFileURL) {
            urlMap[file.fileID] = file.tempFileURL;
          }
        });
      }
    }

    // 构建结果
    const images = {};
    spuIds.forEach((spuId) => {
      const source = fileIdMap[spuId] || '';
      images[spuId] = urlMap[source] || source || '';
    });

    return { images };
  } catch (error) {
    console.error('[getCartImages] 错误:', error);
    return { images: {}, error: error.message };
  }
};
