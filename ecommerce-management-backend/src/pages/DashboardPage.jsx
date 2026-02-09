import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBagIcon,
  UsersIcon,
  DocumentTextIcon,
  GiftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { getDashboard } from '../utils/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGoods: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalPromotions: 0,
    onlineGoods: 0,
    completedOrders: 0,
    activePromotions: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  // 获取统计数据
  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      if (data && data.stats) {
        setStats(data.stats);
      }
      if (data && data.recentOrders) {
        setRecentOrders(data.recentOrders);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 即使失败也保持默认值，不会导致页面崩溃
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statusLabels = {
    pending_payment: '待付款',
    pending: '待发货',
    shipped: '已发货',
    completed: '已完成',
    refunded: '已退款'
  };

  const statusColors = {
    pending_payment: 'bg-orange-50 text-orange-700 border-orange-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    refunded: 'bg-red-50 text-red-700 border-red-200'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和快捷操作 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            系统概览
          </h1>
          <p className="text-gray-600">实时监控您的电商业务数据</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/goods')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            <span>添加商品</span>
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>订单管理</span>
          </button>
          <button
            onClick={() => navigate('/promotions')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <GiftIcon className="h-4 w-4" />
            <span>创建活动</span>
          </button>
          <button
            onClick={fetchStats}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <ArrowTrendingUpIcon className="h-4 w-4" />
            <span>刷新数据</span>
          </button>
        </div>
      </div>

      {/* 核心统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 商品统计卡片 */}
        <div
          className="glass-card p-6 animate-fade-in-up cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
          style={{ animationDelay: '100ms' }}
          onClick={() => navigate('/goods')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <ShoppingBagIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-50 border border-green-200">
              <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" />
              <span className="text-xs font-semibold text-green-600">+12%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">商品总数</p>
            <p className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{stats.totalGoods}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-blue-600">在线: {stats.onlineGoods}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{stats.totalGoods > 0 ? Math.round((stats.onlineGoods / stats.totalGoods) * 100) : 0}% 上架率</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* 会员统计卡片 */}
        <div
          className="glass-card p-6 animate-fade-in-up cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
          style={{ animationDelay: '200ms' }}
          onClick={() => navigate('/users')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-50 border border-green-200">
              <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" />
              <span className="text-xs font-semibold text-green-600">+8%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">会员总数</p>
            <p className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{stats.totalUsers}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-600">注册会员</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">活跃度 85%</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* 订单统计卡片 */}
        <div
          className="glass-card p-6 animate-fade-in-up cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
          style={{ animationDelay: '300ms' }}
          onClick={() => navigate('/orders')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-50 border border-green-200">
              <ArrowTrendingUpIcon className="h-3 w-3 text-green-600" />
              <span className="text-xs font-semibold text-green-600">+15%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">订单总数</p>
            <p className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{stats.totalOrders}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-orange-600">已完成: {stats.completedOrders}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* 促销统计卡片 */}
        <div
          className="glass-card p-6 animate-fade-in-up cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
          style={{ animationDelay: '400ms' }}
          onClick={() => navigate('/promotions')}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <GiftIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-purple-50 border border-purple-200">
              <span className="text-xs font-semibold text-purple-600">{stats.activePromotions} 进行中</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">促销活动</p>
            <p className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{stats.totalPromotions}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-purple-600">活动总数</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{stats.totalPromotions > 0 ? Math.round((stats.activePromotions / stats.totalPromotions) * 100) : 0}% 活跃</span>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* 收入和业务概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 总收入卡片 */}
        <div
          className="glass-card p-8 animate-fade-in-up cursor-pointer hover:shadow-lg transition-all duration-300 group"
          style={{ animationDelay: '500ms' }}
          onClick={() => navigate('/orders?status=completed')}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">总收入</h3>
            </div>
            <ArrowTrendingUpIcon className="h-6 w-6 text-green-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="mb-4">
            <p className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              ¥{stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-gray-600">
              来自 <span className="text-green-600 font-semibold">{stats.completedOrders}</span> 个已完成订单
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200 w-fit">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm text-green-700">较上月增长 18.3%</span>
            </div>
            <span className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">点击查看详情 →</span>
          </div>
        </div>

        {/* 业务概览卡片 */}
        <div className="glass-card p-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">业务概览</h3>
            </div>
          </div>
          <div className="space-y-4">
            <div
              className="space-y-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              onClick={() => navigate('/goods')}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">商品上架率</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.totalGoods > 0 ? Math.round((stats.onlineGoods / stats.totalGoods) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalGoods > 0 ? Math.round((stats.onlineGoods / stats.totalGoods) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div
              className="space-y-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              onClick={() => navigate('/orders')}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 group-hover:text-green-600 transition-colors">订单完成率</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div
              className="space-y-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
              onClick={() => navigate('/promotions')}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 group-hover:text-orange-600 transition-colors">活跃促销率</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.totalPromotions > 0 ? Math.round((stats.activePromotions / stats.totalPromotions) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalPromotions > 0 ? Math.round((stats.activePromotions / stats.totalPromotions) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近订单表格 */}
      <div className="glass-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '700ms' }}>
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Outfit', sans-serif" }}>最近订单</h3>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">实时更新</span>
              <button
                onClick={() => navigate('/orders')}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                查看全部 →
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    订单ID
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    用户ID
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    商品SKU
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    总价
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {recentOrders.map((order, index) => {
                  const orderId = order.orderId || order.orderNo || order.id || order._id || '-';
                  const userId = order.uid || order.openid || order.userId || '-';
                  const goodsSku = order.goodsSku || (order.orderItemVOs && order.orderItemVOs[0]?.skuId) || '-';
                  const totalPrice = order.totalPrice || (order.totalAmount ? (order.totalAmount / 100).toFixed(2) : '0');
                  const orderStatus = order.status || 'pending';

                  return (
                    <tr
                      key={order._id || index}
                      className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200 cursor-pointer group"
                      style={{ animationDelay: `${800 + index * 50}ms` }}
                      onClick={() => navigate('/orders')}
                    >
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-blue-600 group-hover:underline">{orderId}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 font-mono">
                          {typeof userId === 'string' && userId.length > 12 ? userId.slice(0, 12) + '...' : userId}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 font-mono">{goodsSku}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">¥{totalPrice}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[orderStatus] || statusColors['pending']}`}>
                          {statusLabels[orderStatus] || statusLabels['pending']}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {order.createTime ? new Date(Number(order.createTime)).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/orders');
                          }}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                          <span>查看</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 bg-white">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">暂无订单数据</p>
              <button
                onClick={() => navigate('/orders')}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all"
              >
                <PlusIcon className="h-4 w-4" />
                <span>创建订单</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
