import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  HomeIcon,
  EyeIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  getGoods,
  saveGoods as saveGoodsApi,
  deleteGoods as deleteGoodsApi,
  updateGoodsStatus,
  uploadFile,
} from '../utils/api';
import { useDebounce } from '../hooks/useDebounce';
import { PRODUCT_CATEGORIES, CATEGORY_NAMES } from '../../../constants/productCategory';

const GoodsPage = () => {
  const navigate = useNavigate();
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [previewMap, setPreviewMap] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // 使用防抖，延迟500ms执行搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    spuId: '',
    goodName: '',
    price: '',
    description: '',
    stock: '',
    coverImage: '',
    galleryImages: [''],
    detailImages: [''],
    status: 'online',
    category: ''
  });

  const pageSize = 10;

  // 获取商品列表
  const fetchGoods = async (page = 1, search = '') => {
    try {
      // 首次加载显示全屏loading，搜索时显示搜索loading
      if (goods.length === 0) {
        setLoading(true);
      } else {
        setSearchLoading(true);
      }
      const data = await getGoods({ page, pageSize, search });
      const list = data.list || [];
      setTotalPages(Math.ceil((data.total || 0) / pageSize));
      setGoods(list);
      const nextPreviewMap = {};
      list.forEach((item) => {
        if (item.coverImage && item.coverUrl) {
          nextPreviewMap[item.coverImage] = item.coverUrl;
        }
        if (Array.isArray(item.galleryImages) && Array.isArray(item.galleryUrls)) {
          item.galleryImages.forEach((value, index) => {
            const url = item.galleryUrls[index];
            if (value && url) nextPreviewMap[value] = url;
          });
        }
        if (Array.isArray(item.detailImages) && Array.isArray(item.detailUrls)) {
          item.detailImages.forEach((value, index) => {
            const url = item.detailUrls[index];
            if (value && url) nextPreviewMap[value] = url;
          });
        }
      });
      if (Object.keys(nextPreviewMap).length) {
        setPreviewMap((prev) => ({ ...prev, ...nextPreviewMap }));
      }
    } catch (error) {
      console.error('获取商品列表失败:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchGoods(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  // 搜索处理
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 打开新增/编辑模态框
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        sku: item.sku,
        spuId: item.spuId || item.mockId || '',
        goodName: item.goodName,
        price: item.price,
        description: item.description,
        stock: item.stock,
        coverImage: item.coverImage || (item.picture && item.picture[0]) || '',
        galleryImages: item.galleryImages || item.picture || [''],
        detailImages: item.detailImages || [''],
        status: item.status,
        category: item.category || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        sku: '',
        spuId: '',
        goodName: '',
        price: '',
        description: '',
        stock: '',
        coverImage: '',
        galleryImages: [''],
        detailImages: [''],
        status: 'online',
        category: ''
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

  const handleCoverImageChange = (value) => {
    setFormData(prev => ({
      ...prev,
      coverImage: value
    }));
    // For direct URL paste, set it as its own preview
    if (value && value.startsWith('http')) {
      setPreviewMap(prev => ({
        ...prev,
        [value]: value
      }));
    }
  };

  const updateImageList = (key, index, value) => {
    const nextList = [...(formData[key] || [])];
    nextList[index] = value;
    setFormData(prev => ({
      ...prev,
      [key]: nextList
    }));
    // For direct URL paste, set it as its own preview
    if (value && value.startsWith('http')) {
      setPreviewMap(prev => ({
        ...prev,
        [value]: value
      }));
    }
  };

  const addImageInput = (key) => {
    setFormData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), '']
    }));
  };

  const removeImageInput = (key, index) => {
    const nextList = (formData[key] || []).filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [key]: nextList.length > 0 ? nextList : ['']
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
      alert('Upload failed. Please retry.');
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

  // 保存商品
  const handleSaveGoods = async () => {
    try {
      const galleryImages = (formData.galleryImages || []).filter(url => url.trim() !== '');
      const detailImages = (formData.detailImages || []).filter(url => url.trim() !== '');
      const coverImage = (formData.coverImage || '').trim() || galleryImages[0] || '';

      const goodsData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        coverImage,
        galleryImages,
        detailImages,
        picture: galleryImages,
        category: formData.category || null,
        updateTime: new Date()
      };

      if (editingItem) {
        // 更新
        await saveGoodsApi({ ...goodsData, _id: editingItem._id });
      } else {
        // 新增
        goodsData.createTime = new Date();
        await saveGoodsApi(goodsData);
      }
      
      closeModal();
      fetchGoods(currentPage, debouncedSearchTerm);
    } catch (error) {
      console.error('保存商品失败:', error);
      alert('保存失败，请重试');
    }
  };

  // 删除商品
  const handleDeleteGoods = async (id) => {
    if (!confirm('确定要删除这个商品吗？')) return;
    
    try {
      await deleteGoodsApi(id);
      fetchGoods(currentPage, debouncedSearchTerm);
    } catch (error) {
      console.error('删除商品失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 切换商品状态
  const toggleStatus = async (item) => {
    try {
      const newStatus = item.status === 'online' ? 'offline' : 'online';
      await updateGoodsStatus(item._id, newStatus);
      fetchGoods(currentPage, debouncedSearchTerm);
    } catch (error) {
      console.error('更新状态失败:', error);
      alert('更新状态失败，请重试');
    }
  };

  return (
    <div className="space-y-6">
      {/* 首次加载的全屏loading */}
      {loading && goods.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : (
        <>
          {/* 面包屑导航 */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center hover:text-blue-600 transition-colors"
            >
              <HomeIcon className="h-4 w-4 mr-1" />
              首页
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">商品管理</span>
          </div>

          {/* 页面标题和操作栏 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="返回首页"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
                <p className="text-sm text-gray-500 mt-1">共 {goods.length} 件商品</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchGoods(currentPage, debouncedSearchTerm)}
                className="btn btn-ghost btn-sm"
                title="刷新"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => openModal()}
                className="btn btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                新增商品
              </button>
            </div>
          </div>

          {/* 搜索和筛选栏 */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索商品名称..."
                value={searchTerm}
                onChange={handleSearch}
                className="input input-bordered w-full pl-10"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="loading loading-spinner loading-sm"></div>
                </div>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="select select-bordered"
            >
              <option value="">全部状态</option>
              <option value="online">上架中</option>
              <option value="offline">已下架</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="select select-bordered"
            >
              <option value="">全部分类</option>
              {Object.keys(PRODUCT_CATEGORIES).map((key) => (
                <option key={PRODUCT_CATEGORIES[key]} value={PRODUCT_CATEGORIES[key]}>
                  {CATEGORY_NAMES[PRODUCT_CATEGORIES[key]]}
                </option>
              ))}
            </select>
          </div>

          {/* 商品列表 */}
          <div className="bg-white shadow rounded-lg overflow-hidden relative mt-6">
            {searchLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="loading loading-spinner loading-md"></div>
              </div>
            )}
            <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                商品信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                价格
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                库存
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分类
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
            {goods.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="flex-shrink-0 h-16 w-16 cursor-pointer group"
                      onClick={() => { setPreviewItem(item); setShowPreviewModal(true); }}
                    >
                      {(item.coverUrl || item.coverImage || (item.picture && item.picture[0])) ? (
                        <img
                          className="h-16 w-16 rounded-lg object-cover group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                          src={resolvePreview(
                            item.coverUrl || item.coverImage || (item.picture && item.picture[0]),
                          )}
                          alt={item.goodName}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">无图片</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.goodName}</div>
                      <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-green-600">¥{item.price}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${item.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                    {item.stock}
                    {item.stock < 10 && <span className="ml-1 text-xs">(库存不足)</span>}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category ? CATEGORY_NAMES[item.category] || item.category : '未分类'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleStatus(item)}
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                      item.status === 'online'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {item.status === 'online' ? '上架' : '下架'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => { setPreviewItem(item); setShowPreviewModal(true); }}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="预览"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openModal(item)}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="编辑"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoods(item._id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="删除"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex justify-center">
        <div className="join">
          <button
            className="join-item btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            上一页
          </button>
          <button className="join-item btn btn-active">
            {currentPage} / {totalPages}
          </button>
          <button
            className="join-item btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            下一页
          </button>
        </div>
      </div>

      {/* 新增/编辑模态框 */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editingItem ? '编辑商品' : '新增商品'}
              </h3>
              <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">商品名称</span>
                  </label>
                  <input
                    type="text"
                    name="goodName"
                    value={formData.goodName}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="商品名称"
                  />
                  <p className="text-xs text-gray-500 mt-1">SKU 自动生成，无需填写。</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">商品 SPU ID</span>
                  </label>
                  <input
                    type="text"
                    name="spuId"
                    value={formData.spuId}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="商品唯一标识，如: 0, 1, 2..."
                  />
                  <p className="text-xs text-gray-500 mt-1">用于小程序查询商品，建议填写简单数字（如 0, 1, 2...）。留空则使用数据库 ID。</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">价格</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="商品价格"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">库存</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="库存数量"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">详情介绍文字</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="填写后显示在小程序详情介绍下方，支持换行"
                  rows="4"
                />
                <p className="text-xs text-gray-500 mt-1">留空则不显示详情文字。</p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Cover Image</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => handleCoverImageChange(e.target.value)}
                      className="input input-bordered w-full"
                      placeholder="Cover image URL"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, (value) => handleCoverImageChange(value))}
                      className="file-input file-input-bordered file-input-sm w-32"
                      disabled={uploading}
                    />
                  </div>
                  {formData.coverImage && (
                    <div className="w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={resolvePreview(formData.coverImage)}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Gallery Images</span>
                </label>
                {formData.galleryImages.map((url, index) => (
                  <div key={index} className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateImageList('galleryImages', index, e.target.value)}
                        className="input input-bordered flex-1"
                        placeholder="Gallery image URL"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(e, (value) => updateImageList('galleryImages', index, value))
                        }
                        className="file-input file-input-bordered file-input-sm w-32"
                        disabled={uploading}
                      />
                      {formData.galleryImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageInput('galleryImages', index)}
                          className="btn btn-sm btn-error"
                        >
                          删除
                        </button>
                      )}
                    </div>
                    {url && (
                      <div className="w-32 h-32 border rounded-lg overflow-hidden">
                        <img
                          src={resolvePreview(url)}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addImageInput('galleryImages')}
                  className="btn btn-sm btn-outline"
                >
                  添加图片
                </button>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Detail Images</span>
                </label>
                {formData.detailImages.map((url, index) => (
                  <div key={index} className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateImageList('detailImages', index, e.target.value)}
                        className="input input-bordered flex-1"
                        placeholder="Detail image URL"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileChange(e, (value) => updateImageList('detailImages', index, value))
                        }
                        className="file-input file-input-bordered file-input-sm w-32"
                        disabled={uploading}
                      />
                      {formData.detailImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageInput('detailImages', index)}
                          className="btn btn-sm btn-error"
                        >
                          删除
                        </button>
                      )}
                    </div>
                    {url && (
                      <div className="w-32 h-32 border rounded-lg overflow-hidden">
                        <img
                          src={resolvePreview(url)}
                          alt={`Detail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addImageInput('detailImages')}
                  className="btn btn-sm btn-outline"
                >
                  添加详情图
                </button>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">产品分类</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="">未分类</option>
                  {Object.keys(PRODUCT_CATEGORIES).map((key) => (
                    <option key={PRODUCT_CATEGORIES[key]} value={PRODUCT_CATEGORIES[key]}>
                      {CATEGORY_NAMES[PRODUCT_CATEGORIES[key]]}
                    </option>
                  ))}
                </select>
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
                  <option value="online">上架</option>
                  <option value="offline">下架</option>
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button onClick={closeModal} className="btn">
                取消
              </button>
              <button onClick={handleSaveGoods} className="btn btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 商品预览模态框 */}
      {showPreviewModal && previewItem && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">商品预览</h3>
              <button onClick={() => setShowPreviewModal(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 商品图片 */}
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {(previewItem.coverUrl || previewItem.coverImage || (previewItem.picture && previewItem.picture[0])) ? (
                    <img
                      src={resolvePreview(previewItem.coverUrl || previewItem.coverImage || (previewItem.picture && previewItem.picture[0]))}
                      alt={previewItem.goodName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      暂无图片
                    </div>
                  )}
                </div>
                {/* 图片缩略图 */}
                {previewItem.galleryImages && previewItem.galleryImages.length > 0 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {previewItem.galleryImages.filter(url => url).map((url, index) => (
                      <img
                        key={index}
                        src={resolvePreview(url)}
                        alt={`Gallery ${index + 1}`}
                        className="w-16 h-16 rounded object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 商品信息 */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{previewItem.goodName}</h2>
                  <p className="text-sm text-gray-500 mt-1">SKU: {previewItem.sku}</p>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-red-600">¥{previewItem.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                  <div>
                    <span className="text-sm text-gray-500">库存</span>
                    <p className={`font-semibold ${previewItem.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {previewItem.stock} 件
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">状态</span>
                    <p className={`font-semibold ${previewItem.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                      {previewItem.status === 'online' ? '上架中' : '已下架'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">分类</span>
                    <p className="font-semibold text-gray-900">
                      {previewItem.category ? CATEGORY_NAMES[previewItem.category] || previewItem.category : '未分类'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">SPU ID</span>
                    <p className="font-semibold text-gray-900">{previewItem.spuId || previewItem.mockId || '-'}</p>
                  </div>
                </div>

                {previewItem.description && (
                  <div>
                    <span className="text-sm text-gray-500">商品描述</span>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{previewItem.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => { setShowPreviewModal(false); openModal(previewItem); }}
                className="btn btn-primary"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                编辑商品
              </button>
              <button onClick={() => setShowPreviewModal(false)} className="btn">
                关闭
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

export default GoodsPage;
