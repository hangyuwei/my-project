/**
 * Cloud File Manager - Handles conversion of cloud:// fileIDs to temporary URLs
 * with caching to avoid repeated conversions and handle expiration
 */

const CACHE_DURATION = 1.5 * 60 * 60 * 1000; // 1.5 hours (temp URLs valid for 2 hours)
const urlCache = new Map();

/**
 * Get temporary URL from cloud fileID with caching
 * @param {string} fileId - Cloud storage fileID (cloud://...)
 * @returns {Promise<string>} Temporary URL
 */
async function getTempFileURL(fileId) {
  if (!fileId || !fileId.startsWith('cloud://')) {
    return fileId;
  }

  // Check cache
  const cached = urlCache.get(fileId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.url;
  }

  try {
    const result = await wx.cloud.getTempFileURL({
      fileList: [fileId],
    });

    if (result.fileList && result.fileList[0]) {
      const tempUrl = result.fileList[0].tempFileURL;
      // Cache the result
      urlCache.set(fileId, {
        url: tempUrl,
        timestamp: Date.now(),
      });
      return tempUrl;
    }
  } catch (error) {
    console.error('[CloudFileManager] Failed to get temp URL:', error);
  }

  return fileId;
}

/**
 * Batch convert multiple cloud fileIDs to temporary URLs
 * @param {string[]} fileIds - Array of cloud storage fileIDs
 * @returns {Promise<Object>} Map of fileID to temporary URL
 */
async function batchGetTempFileURL(fileIds) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return {};
  }

  const urlMap = {};
  const uncachedIds = [];
  const now = Date.now();

  // Check cache first
  fileIds.forEach((fileId) => {
    if (!fileId || !fileId.startsWith('cloud://')) {
      urlMap[fileId] = fileId;
      return;
    }

    const cached = urlCache.get(fileId);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      urlMap[fileId] = cached.url;
    } else {
      uncachedIds.push(fileId);
    }
  });

  // Fetch uncached URLs
  if (uncachedIds.length > 0) {
    try {
      const result = await wx.cloud.getTempFileURL({
        fileList: uncachedIds,
      });

      if (result.fileList) {
        result.fileList.forEach((file) => {
          if (file.tempFileURL) {
            urlMap[file.fileID] = file.tempFileURL;
            // Cache the result
            urlCache.set(file.fileID, {
              url: file.tempFileURL,
              timestamp: now,
            });
          }
        });
      }
    } catch (error) {
      console.error('[CloudFileManager] Batch get temp URLs failed:', error);
    }
  }

  return urlMap;
}

/**
 * Clear cached URL for a specific fileID
 * @param {string} fileId - Cloud storage fileID
 */
function clearCache(fileId) {
  if (fileId) {
    urlCache.delete(fileId);
  }
}

/**
 * Clear all cached URLs
 */
function clearAllCache() {
  urlCache.clear();
}

/**
 * Check if a URL is a cloud storage fileID
 * @param {string} url - URL or fileID to check
 * @returns {boolean}
 */
function isCloudFileId(url) {
  return typeof url === 'string' && url.startsWith('cloud://');
}

/**
 * Check if a URL is a temporary cloud storage URL that might be expired
 * @param {string} url - URL to check
 * @returns {boolean}
 */
function isTempCloudUrl(url) {
  return (
    typeof url === 'string' &&
    (url.includes('tcb.qcloud.la') || url.includes('.myqcloud.com')) &&
    url.includes('sign=') &&
    url.includes('&t=')
  );
}

/**
 * Extract timestamp from temporary cloud storage URL
 * @param {string} url - Temporary URL
 * @returns {number|null} Timestamp in seconds or null if not found
 */
function extractExpiration(url) {
  if (!isTempCloudUrl(url)) {
    return null;
  }

  const match = url.match(/[?&]t=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if a temporary URL has expired or will expire soon
 * @param {string} url - Temporary URL
 * @param {number} bufferSeconds - Buffer time in seconds before expiration (default: 300 = 5 minutes)
 * @returns {boolean}
 */
function isUrlExpired(url, bufferSeconds = 300) {
  const expiration = extractExpiration(url);
  if (!expiration) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return now + bufferSeconds >= expiration;
}

module.exports = {
  getTempFileURL,
  batchGetTempFileURL,
  clearCache,
  clearAllCache,
  isCloudFileId,
  isTempCloudUrl,
  isUrlExpired,
  extractExpiration,
};
