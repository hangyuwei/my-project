import React, { useState, useEffect } from 'react';
import { EyeIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getAfterSales, getAfterSaleDetail, updateAfterSaleStatus } from '../utils/api';

const AfterSalesPage = () => {
  const [afterSales, setAfterSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const pageSize = 10;

  // 售后状态
  const statusLabels = {
    APPLIED: '待处理',
    SELLER_AGREED: '已同意',
    SELLER_REJECTED: '已拒绝',
    WAIT_BUYER_RETURN: '待买家退货',
    BUYER_SHIPPED: '买家已寄回',
    SELLER_RECEIVED: '已收货',
    REFUNDING: '退款中',
    REFUNDED: '已退款',
    CANCELED: '已取消',
  };

  const statusColors = {
    APPLIED: 'badge-warning',
    SELLER_AGREED: 'badge-info',
    SELLER_REJECTED: 'badge-error',
    WAIT_BUYER_RETURN: 'badge-warning',
    BUYER_SHIPPED: 'badge-info',
    SELLER_RECEIVED: 'badge-info',
    REFUNDING: 'badge-warning',
    REFUNDED: 'badge-success',
    CANCELED: 'badge-ghost',
  };

  const typeLabels = {
    ONLY_REFUND: '仅退款',
    RETURN_REFUND: '退货退款',
  };

  // 订单状态标签和颜色
  const orderStatusLabels = {
    5: '待付款',
    10: '待发货',
    20: '已发货',
    30: '已完成',
    40: '已发货',
    50: '已完成',
    80: '已取消',
  };

  const orderStatusColors = {
    5: 'badge-warning',
    10: 'badge-info',
    20: 'badge-info',
    30: 'badge-success',
    40: 'badge-info',
    50: 'badge-success',
    80: 'badge-error',
  };

  // 获取售后列表
  const fetchAfterSales = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const data = await getAfterSales({ page, pageSize, status });
      setTotalPages(Math.ceil((data.total || 0) / pageSize));
      setAfterSales(data.list || []);
    } catch (error) {
      console.error('获取售后列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAfterSales(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  // 状态筛选处理
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // 查看详情
  const viewDetail = async (item) => {
    try {
      const detail = await getAfterSaleDetail(item._id);
      setSelectedItem(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('获取售后详情失败:', error);
      alert('获取详情失败，请重试');
    }
  };

  // 同意退款
  const handleAgree = async (item) => {
    if (!confirm('确定要同意该退款申请吗？')) return;

    try {
      const newStatus = item.type === 'ONLY_REFUND' ? 'REFUNDING' : 'WAIT_BUYER_RETURN';
      await updateAfterSaleStatus(item._id, newStatus);
      fetchAfterSales(currentPage, statusFilter);
      alert('操作成功');
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 拒绝退款
  const openRejectModal = (item) => {
    setSelectedItem(item);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('请输入拒绝原因');
      return;
    }

    try {
      await updateAfterSaleStatus(selectedItem._id, 'SELLER_REJECTED', rejectReason);
      setShowRejectModal(false);
      fetchAfterSales(currentPage, statusFilter);
      alert('操作成功');
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 确认收货
  const handleReceive = async (item) => {
    if (!confirm('确认已收到买家退回的商品吗？')) return;

    try {
      await updateAfterSaleStatus(item._id, 'REFUNDING');
      fetchAfterSales(currentPage, statusFilter);
      alert('操作成功');
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 确认退款
  const handleRefund = async (item) => {
    if (!confirm('确认已完成退款吗？')) return;

    try {
      await updateAfterSaleStatus(item._id, 'REFUNDED');
      fetchAfterSales(currentPage, statusFilter);
      alert('退款成功');
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 格式化金额 - 优先使用元字段，否则直接使用 applyAmount（旧数据存的是元）
  const formatAmount = (item) => {
    // 优先使用已转换的元字段（新数据）
    if (item.applyAmountYuan !== undefined && item.applyAmountYuan !== null) {
      return parseFloat(item.applyAmountYuan).toFixed(2);
    }
    // 旧数据 applyAmount 存的是元，直接使用
    const amount = item.applyAmount;
    if (!amount) return '0.00';
    return parseFloat(amount).toFixed(2);
  };

  // 格式化分转元（用于订单快照中的金额）
  const formatFenToYuan = (fen) => {
    if (!fen) return '0.00';
    return (fen / 100).toFixed(2);
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
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">售后管理</h1>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center space-x-4">
        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          className="select select-bordered"
        >
          <option value="">全部状态</option>
          <option value="APPLIED">待处理</option>
          <option value="SELLER_AGREED">已同意</option>
          <option value="SELLER_REJECTED">已拒绝</option>
          <option value="WAIT_BUYER_RETURN">待买家退货</option>
          <option value="BUYER_SHIPPED">买家已寄回</option>
          <option value="REFUNDING">退款中</option>
          <option value="REFUNDED">已退款</option>
          <option value="CANCELED">已取消</option>
        </select>
      </div>

      {/* 售后列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                售后单号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                订单号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                类型
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                退款金额
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                原因
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                申请时订单状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                售后状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                申请时间
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {afterSales.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  暂无售后申请
                </td>
              </tr>
            ) : (
              afterSales.map((item) => (
                <tr key={item._id}>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                    {item.afterSaleNo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {item.orderNo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    <span className="badge badge-outline badge-sm">
                      {typeLabels[item.type] || item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                    ¥{formatAmount(item)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                    {item.reasonText || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.orderSnapshot?.orderStatus ? (
                      <span className={`badge badge-sm ${orderStatusColors[item.orderSnapshot.orderStatus] || 'badge-ghost'}`}>
                        {item.orderSnapshot.orderStatusName || orderStatusLabels[item.orderSnapshot.orderStatus] || '未知'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`badge badge-sm ${statusColors[item.status]}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {item.applyTime ? new Date(item.applyTime).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewDetail(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="查看详情"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>

                      {item.status === 'APPLIED' && (
                        <>
                          <button
                            onClick={() => handleAgree(item)}
                            className="text-green-600 hover:text-green-900"
                            title="同意"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(item)}
                            className="text-red-600 hover:text-red-900"
                            title="拒绝"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {item.status === 'BUYER_SHIPPED' && (
                        <button
                          onClick={() => handleReceive(item)}
                          className="btn btn-xs btn-outline btn-info"
                        >
                          确认收货
                        </button>
                      )}

                      {item.status === 'REFUNDING' && (
                        <button
                          onClick={() => handleRefund(item)}
                          className="btn btn-xs btn-outline btn-success"
                        >
                          确认退款
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
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
      )}

      {/* 详情模态框 */}
      {showDetailModal && selectedItem && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">售后详情</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">售后单号</label>
                  <p className="text-sm text-gray-900">{selectedItem.afterSaleNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">状态</label>
                  <p>
                    <span className={`badge ${statusColors[selectedItem.status]}`}>
                      {statusLabels[selectedItem.status]}
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">订单号</label>
                  <p className="text-sm text-gray-900">{selectedItem.orderNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">售后类型</label>
                  <p className="text-sm text-gray-900">{typeLabels[selectedItem.type]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">申请时订单状态</label>
                  <p>
                    {selectedItem.orderSnapshot?.orderStatus ? (
                      <span className={`badge ${orderStatusColors[selectedItem.orderSnapshot.orderStatus] || 'badge-ghost'}`}>
                        {selectedItem.orderSnapshot.orderStatusName || orderStatusLabels[selectedItem.orderSnapshot.orderStatus] || '未知'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">订单金额</label>
                  <p className="text-sm text-gray-900">
                    ¥{selectedItem.orderSnapshot ? formatFenToYuan(selectedItem.orderSnapshot.paymentAmount || selectedItem.orderSnapshot.totalAmount) : '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">申请退款金额</label>
                  <p className="text-sm text-red-600 font-bold">¥{formatAmount(selectedItem)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">申请时间</label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.applyTime ? new Date(selectedItem.applyTime).toLocaleString() : '-'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">退款原因</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                  {selectedItem.reasonText || '未填写'}
                </p>
              </div>

              {selectedItem.remark && (
                <div>
                  <label className="text-sm font-medium text-gray-500">退款说明</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                    {selectedItem.remark}
                  </p>
                </div>
              )}

              {selectedItem.evidence && selectedItem.evidence.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">凭证图片</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedItem.evidence.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`凭证${idx + 1}`}
                        className="w-24 h-24 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.buyerLogistics && (
                <div>
                  <label className="text-sm font-medium text-gray-500">买家退货物流</label>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">物流公司: {selectedItem.buyerLogistics.company}</p>
                    <p className="text-sm">物流单号: {selectedItem.buyerLogistics.logisticsNo}</p>
                    <p className="text-sm">
                      寄出时间: {selectedItem.buyerLogistics.shipTime
                        ? new Date(selectedItem.buyerLogistics.shipTime).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                </div>
              )}

              {selectedItem.orderSnapshot && (
                <div>
                  <label className="text-sm font-medium text-gray-500">订单商品信息</label>
                  <div className="bg-gray-50 p-3 rounded space-y-2">
                    {(selectedItem.orderSnapshot.goodsList || []).map((goods, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {goods.thumb && (
                          <img src={goods.thumb} alt="" className="w-12 h-12 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{goods.title || goods.goodsName}</p>
                          <p className="text-xs text-gray-500">x{goods.buyQuantity || goods.num}</p>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm">
                      订单金额: ¥{formatFenToYuan(selectedItem.orderSnapshot.paymentAmount)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              {selectedItem.status === 'APPLIED' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleAgree(selectedItem);
                    }}
                    className="btn btn-success"
                  >
                    同意退款
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openRejectModal(selectedItem);
                    }}
                    className="btn btn-error"
                  >
                    拒绝
                  </button>
                </>
              )}
              {selectedItem.status === 'BUYER_SHIPPED' && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleReceive(selectedItem);
                  }}
                  className="btn btn-info"
                >
                  确认收货
                </button>
              )}
              {selectedItem.status === 'REFUNDING' && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleRefund(selectedItem);
                  }}
                  className="btn btn-success"
                >
                  确认退款
                </button>
              )}
              <button onClick={() => setShowDetailModal(false)} className="btn">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 拒绝原因模态框 */}
      {showRejectModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">拒绝退款申请</h3>

            <div>
              <label className="label">
                <span className="label-text">拒绝原因 <span className="text-red-500">*</span></span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="textarea textarea-bordered w-full"
                rows="3"
                placeholder="请输入拒绝原因，买家可以看到此原因"
              />
            </div>

            <div className="modal-action">
              <button onClick={() => setShowRejectModal(false)} className="btn">
                取消
              </button>
              <button onClick={handleReject} className="btn btn-error">
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AfterSalesPage;
