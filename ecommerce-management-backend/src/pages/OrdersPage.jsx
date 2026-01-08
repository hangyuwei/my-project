import React, { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  getOrders,
  saveOrder as saveOrderApi,
  deleteOrder as deleteOrderApi,
  getOrderDetail,
  batchUpdateOrders,
} from '../utils/api';
import { useDebounce } from '../hooks/useDebounce';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 使用防抖，延迟500ms执行搜索
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    goodsSku: '',
    num: '',
    userId: '',
    salesPromotionId: '',
    totalPrice: '',
    status: 'pending'
  });

  const pageSize = 10;
  const statusLabels = {
    pending: '待发货',
    shipped: '已发货',
    completed: '已完成',
    refunded: '已退款'
  };

  const statusColors = {
    pending: 'badge-warning',
    shipped: 'badge-info',
    completed: 'badge-success',
    refunded: 'badge-error'
  };

  const gradeLabels = {
    bronze: '铜牌会员',
    silver: '银牌会员',
    gold: '金牌会员'
  };

  // 获取订单列表
  const fetchOrders = async (page = 1, search = '', status = '') => {
    try {
      // 首次加载显示全屏loading，搜索时显示搜索loading
      if (orders.length === 0) {
        setLoading(true);
      } else {
        setSearchLoading(true);
      }
      const data = await getOrders({ page, pageSize, search, status });
      setTotalPages(Math.ceil((data.total || 0) / pageSize));
      setOrders(data.list || []);
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, debouncedSearchTerm, statusFilter);
  }, [currentPage, debouncedSearchTerm, statusFilter]);

  // 搜索处理
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 状态筛选处理
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // 打开新增/编辑模态框
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        id: item.id,
        goodsSku: item.goodsSku,
        num: item.num,
        userId: item.userId,
        salesPromotionId: item.salesPromotionId || '',
        totalPrice: item.totalPrice,
        status: item.status
      });
    } else {
      setEditingItem(null);
      setFormData({
        id: '',
        goodsSku: '',
        num: '',
        userId: '',
        salesPromotionId: '',
        totalPrice: '',
        status: 'pending'
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

  // 保存订单
  const saveOrder = async () => {
    try {
      const orderData = {
        ...formData,
        num: parseInt(formData.num),
        totalPrice: parseFloat(formData.totalPrice),
        salesPromotionId: formData.salesPromotionId || null,
        updateTime: new Date()
      };

      if (editingItem) {
        // 更新
        await saveOrderApi({ ...orderData, _id: editingItem._id });
      } else {
        // 新增
        orderData.createTime = new Date();
        await saveOrderApi(orderData);
      }
      
      closeModal();
      fetchOrders(currentPage, debouncedSearchTerm, statusFilter);
    } catch (error) {
      console.error('保存订单失败:', error);
      alert('保存失败，请重试');
    }
  };

  // 删除订单
  const deleteOrder = async (id) => {
    if (!confirm('确定要删除这个订单吗？')) return;
    
    try {
      await deleteOrderApi(id);
      fetchOrders(currentPage, debouncedSearchTerm, statusFilter);
    } catch (error) {
      console.error('删除订单失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 查看订单详情
  const viewOrderDetail = async (order) => {
    try {
      const detail = await getOrderDetail(order._id);
      setOrderDetail(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('获取订单详情失败:', error);
      alert('获取详情失败，请重试');
    }
  };

  // 批量更新订单状态
  const batchUpdateStatus = async (newStatus) => {
    const selectedOrders = orders.filter(order => 
      document.getElementById(`order-${order._id}`)?.checked
    );
    
    if (selectedOrders.length === 0) {
      alert('请选择要更新的订单');
      return;
    }
    
    if (!confirm(`确定要将选中的 ${selectedOrders.length} 个订单状态更新为"${statusLabels[newStatus]}"吗？`)) {
      return;
    }
    
    try {
      await batchUpdateOrders(selectedOrders.map((order) => order._id), newStatus);
      fetchOrders(currentPage, debouncedSearchTerm, statusFilter);
      
      // 取消所有选择
      selectedOrders.forEach(order => {
        const checkbox = document.getElementById(`order-${order._id}`);
        if (checkbox) checkbox.checked = false;
      });
    } catch (error) {
      console.error('批量更新失败:', error);
      alert('批量更新失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
        <button
          onClick={() => openModal()}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          新增订单
        </button>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索订单ID..."
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
          onChange={handleStatusFilter}
          className="select select-bordered"
        >
          <option value="">全部状态</option>
          <option value="pending">待发货</option>
          <option value="shipped">已发货</option>
          <option value="completed">已完成</option>
          <option value="refunded">已退款</option>
        </select>
      </div>

      {/* 批量操作栏 */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">批量操作：</span>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => batchUpdateStatus('shipped')}
        >
          标记为已发货
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => batchUpdateStatus('completed')}
        >
          标记为已完成
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => batchUpdateStatus('refunded')}
        >
          标记为已退款
        </button>
      </div>

      {/* 订单列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input type="checkbox" className="checkbox" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                订单信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                商品信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                总价
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
            {orders.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="checkbox" 
                    id={`order-${item._id}`}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.id}</div>
                    <div className="text-sm text-gray-500">用户: {item.userId}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.createTime).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">SKU: {item.goodsSku}</div>
                    <div className="text-sm text-gray-500">数量: {item.num}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{item.totalPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${statusColors[item.status]}`}>
                    {statusLabels[item.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => viewOrderDetail(item)}
                    className="text-green-600 hover:text-green-900"
                    title="查看详情"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openModal(item)}
                    className="text-blue-600 hover:text-blue-900"
                    title="编辑"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteOrder(item._id)}
                    className="text-red-600 hover:text-red-900"
                    title="删除"
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
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingItem ? '编辑订单' : '新增订单'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">订单ID</span>
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="订单ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">商品SKU</span>
                  </label>
                  <input
                    type="text"
                    name="goodsSku"
                    value={formData.goodsSku}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="商品SKU"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">数量</span>
                  </label>
                  <input
                    type="number"
                    name="num"
                    value={formData.num}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="数量"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">用户ID</span>
                </label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="用户ID"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">促销活动ID（可选）</span>
                </label>
                <input
                  type="text"
                  name="salesPromotionId"
                  value={formData.salesPromotionId}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="促销活动ID"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">总价</span>
                </label>
                <input
                  type="number"
                  name="totalPrice"
                  value={formData.totalPrice}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="总价"
                  step="0.01"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">订单状态</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="select select-bordered w-full"
                >
                  <option value="pending">待发货</option>
                  <option value="shipped">已发货</option>
                  <option value="completed">已完成</option>
                  <option value="refunded">已退款</option>
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button onClick={closeModal} className="btn">
                取消
              </button>
              <button onClick={saveOrder} className="btn btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 订单详情模态框 */}
      {showDetailModal && orderDetail && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">订单详情</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">订单ID</label>
                  <p className="text-sm text-gray-900">{orderDetail.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">订单状态</label>
                  <p>
                    <span className={`badge ${statusColors[orderDetail.status]}`}>
                      {statusLabels[orderDetail.status]}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">创建时间</label>
                  <p className="text-sm text-gray-900">
                    {new Date(orderDetail.createTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">总价</label>
                  <p className="text-sm text-gray-900">¥{orderDetail.totalPrice}</p>
                </div>
              </div>

              {orderDetail.user && (
                <div>
                  <label className="text-sm font-medium text-gray-500">用户信息</label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">姓名: {orderDetail.user.name}</p>
                    <p className="text-sm">ID: {orderDetail.user.id}</p>
                    <p className="text-sm">等级: {gradeLabels[orderDetail.user.grade] || orderDetail.user.grade}</p>
                  </div>
                </div>
              )}

              {orderDetail.goods && (
                <div>
                  <label className="text-sm font-medium text-gray-500">商品信息</label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">商品名称: {orderDetail.goods.goodName}</p>
                    <p className="text-sm">SKU: {orderDetail.goods.sku}</p>
                    <p className="text-sm">单价: ¥{orderDetail.goods.price}</p>
                    <p className="text-sm">数量: {orderDetail.num}</p>
                  </div>
                </div>
              )}

              {orderDetail.promotion && (
                <div>
                  <label className="text-sm font-medium text-gray-500">促销活动</label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">活动名称: {orderDetail.promotion.name}</p>
                    <p className="text-sm">活动描述: {orderDetail.promotion.description}</p>
                    <p className="text-sm">优惠金额: ¥{orderDetail.promotion.multiPrize}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button onClick={() => setShowDetailModal(false)} className="btn">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
