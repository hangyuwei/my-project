import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  getGoods,
  saveGoods as saveGoodsApi,
  deleteGoods as deleteGoodsApi,
  updateGoodsStatus,
} from '../utils/api';
import { useDebounce } from '../hooks/useDebounce';

const GoodsPage = () => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 使用防抖，延迟500ms执行搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    goodName: '',
    price: '',
    description: '',
    stock: '',
    coverImage: '',
    galleryImages: [''],
    detailImages: [''],
    status: 'online'
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
      setTotalPages(Math.ceil((data.total || 0) / pageSize));
      setGoods(data.list || []);
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
        goodName: item.goodName,
        price: item.price,
        description: item.description,
        stock: item.stock,
        coverImage: item.coverImage || (item.picture && item.picture[0]) || '',
        galleryImages: item.galleryImages || item.picture || [''],
        detailImages: item.detailImages || [''],
        status: item.status
      });
    } else {
      setEditingItem(null);
      setFormData({
        sku: '',
        goodName: '',
        price: '',
        description: '',
        stock: '',
        coverImage: '',
        galleryImages: [''],
        detailImages: [''],
        status: 'online'
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
  };

  const updateImageList = (key, index, value) => {
    const nextList = [...(formData[key] || [])];
    nextList[index] = value;
    setFormData(prev => ({
      ...prev,
      [key]: nextList
    }));
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
          {/* 页面标题和操作栏 */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
            <button
              onClick={() => openModal()}
              className="btn btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新增商品
            </button>
          </div>

          {/* 搜索栏 */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
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
          </div>

          {/* 商品列表 */}
          <div className="bg-white shadow rounded-lg overflow-hidden relative">
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
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {goods.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                      {(item.coverImage || (item.picture && item.picture[0])) ? (
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={item.coverImage || (item.picture && item.picture[0])}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{item.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => toggleStatus(item)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'online'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.status === 'online' ? '上架' : '下架'}
                  </button>
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
                    onClick={() => handleDeleteGoods(item._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
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
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingItem ? '编辑商品' : '新增商品'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">SKU</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="商品SKU"
                  />
                </div>
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
                  <span className="label-text">商品描述</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="商品描述"
                  rows="3"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Cover Image</span>
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => handleCoverImageChange(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Cover image URL"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Gallery Images</span>
                </label>
                {formData.galleryImages.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateImageList('galleryImages', index, e.target.value)}
                      className="input input-bordered flex-1"
                      placeholder="Gallery image URL"
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
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateImageList('detailImages', index, e.target.value)}
                      className="input input-bordered flex-1"
                      placeholder="Detail image URL"
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
        </>
      )}
    </div>
  );
};

export default GoodsPage;
