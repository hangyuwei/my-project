import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getBanners, saveBanner, deleteBanner, uploadFile } from '../utils/api';

const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [previewMap, setPreviewMap] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    sort: 0,
    status: 'active'
  });

  // 获取横幅列表
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getBanners();
      console.log('🔍 获取到的原始数据:', data);
      const list = data.list || [];
      console.log('🔍 Banner 列表:', list);
      const nextPreview = {};
      list.forEach((item) => {
        console.log('🔍 处理 Banner 项:', {
          _id: item._id,
          title: item.title,
          imageUrl: item.imageUrl,
          imageTempUrl: item.imageTempUrl,
          hasImageUrl: !!item.imageUrl,
          hasImageTempUrl: !!item.imageTempUrl
        });
        if (item.imageUrl && item.imageTempUrl) {
          nextPreview[item.imageUrl] = item.imageTempUrl;
        }
      });
      if (Object.keys(nextPreview).length) {
        setPreviewMap((prev) => ({ ...prev, ...nextPreview }));
      }
      console.log('🔍 预览映射:', nextPreview);
      console.log('🔍 最终 Banner 数据:', list);
      setBanners(list);
    } catch (error) {
      console.error('❌ 获取横幅列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // 打开新增/编辑模态框
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        imageUrl: item.imageUrl || item.image || '',
        linkUrl: item.linkUrl || item.url || '',
        sort: item.sort || 0,
        status: item.status || 'active'
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        imageUrl: '',
        linkUrl: '',
        sort: 0,
        status: 'active'
      });
    }
    setShowModal(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  // 处理表单输入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resolvePreview = (value) => {
    if (!value) return '';
    return previewMap[value] || value;
  };

  const handleUpload = async (file, onSuccess) => {
    if (!file) return;
    try {
      setUploading(true);
      const result = await uploadFile(file);
      if (!result?.fileID) {
        throw new Error('Upload failed');
      }
      setPreviewMap((prev) => ({
        ...prev,
        [result.fileID]: result.tempFileURL || '',
      }));
      if (typeof onSuccess === 'function') {
        onSuccess(result.fileID);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event, onSuccess) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (file) {
      handleUpload(file, onSuccess);
    }
  };

  // 保存横幅
  const handleSaveBanner = async () => {
    try {
      if (!formData.title.trim()) {
        alert('请填写横幅标题');
        return;
      }
      if (!formData.imageUrl.trim()) {
        alert('请上传横幅图片');
        return;
      }

      const bannerData = {
        ...formData,
        sort: parseInt(formData.sort) || 0,
        updateTime: new Date()
      };

      if (editingItem) {
        await saveBanner({ ...bannerData, _id: editingItem._id });
      } else {
        bannerData.createTime = new Date();
        await saveBanner(bannerData);
      }

      closeModal();
      fetchBanners();
    } catch (error) {
      console.error('保存横幅失败:', error);
      alert('保存失败，请重试');
    }
  };

  // 删除横幅
  const handleDeleteBanner = async (id) => {
    if (!confirm('确定要删除这个横幅吗？')) return;

    try {
      await deleteBanner(id);
      fetchBanners();
    } catch (error) {
      console.error('删除横幅失败:', error);
      alert('删除失败，请重试');
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : (
        <>
          {/* 页面标题和操作栏 */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">横幅管理</h1>
            <button
              onClick={() => openModal()}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新增横幅
            </button>
          </div>

          {/* 横幅列表 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    横幅信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    排序
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-20 w-32">
                          {(item.imageUrl || item.image || item.imageTempUrl) ? (
                            <img
                              className="h-20 w-32 rounded-lg object-cover"
                              src={resolvePreview(item.imageTempUrl || item.imageUrl || item.image)}
                              alt={item.title}
                            />
                          ) : (
                            <div className="h-20 w-32 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">无图片</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          {item.linkUrl && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              链接: {item.linkUrl}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sort || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status === 'active' ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openModal(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {banners.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      暂无横幅数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 新增/编辑模态框 */}
          {showModal && (
            <div className="modal modal-open">
              <div className="modal-box w-11/12 max-w-lg">
                <h3 className="font-bold text-lg mb-4">
                  {editingItem ? '编辑横幅' : '新增横幅'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="label">
                      <span className="label-text">标题</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="横幅标题"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">横幅图片</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="url"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleInputChange}
                          className="input input-bordered w-full"
                          placeholder="图片 URL"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, (value) => {
                            setFormData(prev => ({...prev, imageUrl: value}));
                          })}
                          className="file-input file-input-bordered file-input-sm w-32"
                          disabled={uploading}
                        />
                      </div>
                      {formData.imageUrl && (
                        <div className="w-full h-32 border rounded-lg overflow-hidden">
                          <img
                            src={resolvePreview(formData.imageUrl)}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">跳转链接（可选）</span>
                    </label>
                    <input
                      type="text"
                      name="linkUrl"
                      value={formData.linkUrl}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="点击横幅跳转的链接"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">排序</span>
                    </label>
                    <input
                      type="number"
                      name="sort"
                      value={formData.sort}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="数字越小越靠前"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">状态</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="select select-bordered w-full"
                    >
                      <option value="active">启用</option>
                      <option value="inactive">禁用</option>
                    </select>
                  </div>
                </div>

                <div className="modal-action">
                  <button onClick={closeModal} className="btn">
                    取消
                  </button>
                  <button onClick={handleSaveBanner} className="btn btn-primary" disabled={uploading}>
                    {uploading ? '上传中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BannersPage;
