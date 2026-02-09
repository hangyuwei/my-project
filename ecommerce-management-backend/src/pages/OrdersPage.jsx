import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  HomeIcon,
  ArrowPathIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  getOrders,
  saveOrder as saveOrderApi,
  deleteOrder as deleteOrderApi,
  getOrderDetail,
  batchUpdateOrders,
} from '../utils/api';
import { useDebounce } from '../hooks/useDebounce';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // 从 URL 参数读取初始状态筛选值
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // 存储全部订单的统计数据（不受筛选影响）
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending_payment: 0,
    pending: 0,
    shipped: 0,
    completed: 0,
    refunded: 0
  });

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
    pending_payment: '待付款',
    pending: '待发货',
    shipped: '已发货',
    completed: '已完成',
    refunded: '已退款',
    after_sale: '售后中',
    canceled: '已取消'
  };

  const statusColors = {
    pending_payment: 'badge-warning',
    pending: 'badge-warning',
    shipped: 'badge-primary',
    completed: 'badge-success',
    refunded: 'badge-error',
    after_sale: 'badge-info',
    canceled: 'badge-ghost'
  };

  const gradeLabels = {
    bronze: '铜牌会员',
    silver: '银牌会员',
    gold: '金牌会员'
  };

  const normalizeTime = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric)) return new Date(numeric);
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
  };

  const buildOrderTimeline = (order) => {
    if (!order) return [];
    const timeline = [];
    const push = (label, time) => {
      const date = normalizeTime(time);
      if (!date) return;
      timeline.push({ label, time: date });
    };

    push('创建订单', order.createTime);

    const paymentTime =
      order.paymentVO?.paySuccessTime ||
      order.paymentVO?.payTime ||
      order.payTime ||
      order.paymentTime ||
      order.paidTime ||
      order.paySuccessTime;
    push('支付成功', paymentTime);

    const shipTime = order.shipTime || order.deliveryTime || order.deliverTime || order.sendTime;
    push('已发货', shipTime);

    const receiveTime = order.receiveTime || order.confirmTime || order.signTime;
    push('确认收货', receiveTime);

    const finishTime = order.finishTime || order.completeTime;
    push('交易完成', finishTime);

    push('订单取消', order.cancelTime);

    const refundTime = order.refundTime || order.refundSuccessTime || order.refundedTime;
    push('已退款', refundTime);

    const updateTime = order.updateTime || order.updatedAt;
    const updateDate = normalizeTime(updateTime);
    const createDate = normalizeTime(order.createTime);
    if (updateDate && (!createDate || updateDate.getTime() !== createDate.getTime())) {
      const statusText = statusLabels[order.status] || order.orderStatusName || order.status || '';
      push(`状态更新${statusText ? `为${statusText}` : ''}`, updateDate);
    }

    const seen = new Set();
    return timeline
      .sort((a, b) => a.time - b.time)
      .filter((entry) => {
        const key = `${entry.label}-${entry.time.getTime()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((entry) => ({
        ...entry,
        time: entry.time.toLocaleString(),
      }));
  };

  const getOrderId = (order) => order?._id || order?.id;

  const updateOrderStatus = async (order, status) => {
    const id = getOrderId(order);
    if (!id) {
      alert('订单ID缺失，无法更新状态');
      return;
    }
    try {
      await batchUpdateOrders([id], status);
      fetchOrders(currentPage, debouncedSearchTerm, statusFilter);
      fetchOrderStats(); // 刷新统计数据
    } catch (error) {
      console.error('更新订单状态失败:', error);
      alert('更新失败，请重试');
    }
  };

  // 获取订单统计数据（不受筛选影响）
  const fetchOrderStats = async () => {
    try {
      // 获取全部订单来统计各状态数量
      const data = await getOrders({ page: 1, pageSize: 1000, search: '', status: '' });
      const allOrders = data.list || [];
      setOrderStats({
        total: allOrders.length,
        pending_payment: allOrders.filter(o => o.status === 'pending_payment').length,
        pending: allOrders.filter(o => o.status === 'pending').length,
        shipped: allOrders.filter(o => o.status === 'shipped').length,
        completed: allOrders.filter(o => o.status === 'completed').length,
        refunded: allOrders.filter(o => o.status === 'refunded').length
      });
    } catch (error) {
      console.error('获取订单统计失败:', error);
    }
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

  // 初始化时获取统计数据
  useEffect(() => {
    fetchOrderStats();
  }, []);

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
      fetchOrderStats(); // 刷新统计数据
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
      fetchOrderStats(); // 刷新统计数据
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
      fetchOrderStats(); // 刷新统计数据

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

  const timelineEntries = buildOrderTimeline(orderDetail);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 面包屑导航 */}
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <button
          onClick={() => navigate('/')}
          className="flex items-center hover:text-blue-600 transition-colors"
        >
          <HomeIcon className="h-4 w-4 mr-1" />
          首页
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">订单管理</span>
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
            <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
            <p className="text-sm text-gray-500 mt-1">共 {orderStats.total} 个订单</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchOrders(currentPage, debouncedSearchTerm, statusFilter)}
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
            新增订单
          </button>
        </div>
      </div>

      {/* 订单状态统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${statusFilter === '' ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'}`}
          onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
        >
          <p className="text-sm text-gray-500">全部订单</p>
          <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
        </div>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${statusFilter === 'pending_payment' ? 'bg-orange-50 border-orange-300' : 'bg-white hover:bg-gray-50'}`}
          onClick={() => { setStatusFilter('pending_payment'); setCurrentPage(1); }}
        >
          <p className="text-sm text-gray-500">待付款</p>
          <p className="text-2xl font-bold text-orange-600">{orderStats.pending_payment}</p>
        </div>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${statusFilter === 'pending' ? 'bg-yellow-50 border-yellow-300' : 'bg-white hover:bg-gray-50'}`}
          onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
        >
          <p className="text-sm text-gray-500">待发货</p>
          <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
        </div>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${statusFilter === 'shipped' ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'}`}
          onClick={() => { setStatusFilter('shipped'); setCurrentPage(1); }}
        >
          <p className="text-sm text-gray-500">已发货</p>
          <p className="text-2xl font-bold text-blue-600">{orderStats.shipped}</p>
        </div>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-all ${statusFilter === 'completed' ? 'bg-green-50 border-green-300' : 'bg-white hover:bg-gray-50'}`}
          onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }}
        >
          <p className="text-sm text-gray-500">已完成</p>
          <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
        </div>
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
          <option value="pending_payment">待付款</option>
          <option value="pending">待发货</option>
          <option value="shipped">已发货</option>
          <option value="completed">已完成</option>
          <option value="refunded">已退款</option>
        </select>
      </div>

      {/* 批量操作栏 */}
      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">批量操作：</span>
        <button
          type="button"
          className="btn btn-sm btn-outline gap-1"
          onClick={() => batchUpdateStatus('shipped')}
        >
          <TruckIcon className="h-4 w-4" />
          标记发货
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline btn-success gap-1"
          onClick={() => batchUpdateStatus('completed')}
        >
          <CheckCircleIcon className="h-4 w-4" />
          标记完成
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline btn-error gap-1"
          onClick={() => batchUpdateStatus('refunded')}
        >
          <XCircleIcon className="h-4 w-4" />
          标记退款
        </button>
      </div>

      {/* 订单列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden" style={{ overflowX: 'scroll' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <input type="checkbox" className="checkbox" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                订单信息
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">
                商品信息
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                收货地址
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                总价
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((item) => (
              <tr key={item._id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    id={`order-${item._id}`}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <div className="text-xs font-medium text-gray-900">{item.id}</div>
                    <div className="text-xs text-gray-500">用户: {item.userId.slice(0, 12)}...</div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.createTime).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-xs font-medium text-gray-900 truncate max-w-xs">
                      {item.goodsName || item.goodsSku || '未知商品'}
                    </div>
                    <div className="text-xs text-gray-500">SKU: {item.goodsSku?.slice(-10) || '-'}</div>
                    <div className="text-xs text-gray-500">数量: {item.num}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs">
                    {item.logisticsVO ? (
                      <>
                        <div className="font-medium text-gray-900">
                          {item.logisticsVO.receiverName} {item.logisticsVO.receiverPhone}
                        </div>
                        <div className="text-gray-500 truncate max-w-xs">
                          {item.logisticsVO.receiverProvince}
                          {item.logisticsVO.receiverCity}
                          {item.logisticsVO.receiverCountry}
                        </div>
                        <div className="text-gray-500 truncate max-w-xs">
                          {item.logisticsVO.receiverAddress}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400">暂无地址</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                  ¥{item.totalPrice}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.status === 'pending' ? (
                    <button
                      type="button"
                      className={`badge badge-sm ${statusColors[item.status] || 'badge-ghost'} cursor-pointer select-none`}
                      title="点击标记为已发货"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        updateOrderStatus(item, 'shipped');
                      }}
                    >
                      {statusLabels[item.status] || item.status || '未知'}
                    </button>
                  ) : (
                    <span className={`badge badge-sm ${statusColors[item.status] || 'badge-ghost'}`}>
                      {statusLabels[item.status] || item.status || '未知'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewOrderDetail(item)}
                      className="text-green-600 hover:text-green-900"
                      title="查看详情"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal(item)}
                      className="text-blue-600 hover:text-blue-900"
                      title="编辑"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteOrder(item._id)}
                      className="text-red-600 hover:text-red-900"
                      title="删除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex justify-center py-4">
        <div className="join">
          <button
            className="join-item btn btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            上一页
          </button>
          <button className="join-item btn btn-sm btn-active pointer-events-none">
            {currentPage} / {totalPages}
          </button>
          <button
            className="join-item btn btn-sm"
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
                  <option value="pending_payment">待付款</option>
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

              <div>
                <label className="text-sm font-medium text-gray-500">收货地址</label>
                <div className="bg-gray-50 p-3 rounded">
                  {orderDetail.logisticsVO ? (
                    <>
                      <p className="text-sm">收货人: {orderDetail.logisticsVO.receiverName}</p>
                      <p className="text-sm">联系电话: {orderDetail.logisticsVO.receiverPhone}</p>
                      <p className="text-sm">
                        收货地址: {orderDetail.logisticsVO.receiverProvince}
                        {orderDetail.logisticsVO.receiverCity}
                        {orderDetail.logisticsVO.receiverCountry}
                        {orderDetail.logisticsVO.receiverAddress}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">暂无收货地址信息</p>
                  )}
                </div>
              </div>

              {orderDetail.goods && (
                <div>
                  <label className="text-sm font-medium text-gray-500">商品信息</label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">商品名称: {orderDetail.goods.goodName}</p>
                    <p className="text-sm">SKU: {orderDetail.goods.sku}</p>
                    <p className="text-sm">单价: ¥{(orderDetail.goods.price / 100).toFixed(2)}</p>
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

              <div>
                <label className="text-sm font-medium text-gray-500">订单操作日志</label>
                <div className="bg-gray-50 p-3 rounded space-y-2 max-h-60 overflow-y-auto">
                  {orderDetail.logs && orderDetail.logs.length > 0 ? (
                    orderDetail.logs.map((log, index) => (
                      <div
                        key={log._id || index}
                        className="border-b border-gray-200 pb-2 last:border-b-0"
                      >
                        <div className="flex items-start justify-between text-sm">
                          <div className="flex-1">
                            <div className="font-medium text-gray-700">
                              {log.statusName || log.status}
                            </div>
                            <div className="text-gray-600 mt-1">
                              {log.notes}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              操作人: {log.operator} · 操作: {log.action}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">暂无操作日志</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">订单时间线</label>
                <div className="bg-gray-50 p-3 rounded space-y-2">
                  {timelineEntries.length > 0 ? (
                    timelineEntries.map((item, index) => (
                      <div
                        key={`${item.label}-${item.time}-${index}`}
                        className="flex items-start justify-between text-sm"
                      >
                        <span className="text-gray-700">{item.label}</span>
                        <span className="text-gray-500">{item.time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">暂无时间线数据</p>
                  )}
                </div>
              </div>
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
