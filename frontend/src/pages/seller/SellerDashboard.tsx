import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CubeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { apiClient } from "../../lib/api";
import { Order, Review } from "../../types";

// Dashboard data structure
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  recentOrders: Order[];
  productPerformance: Array<{
    id: string;
    name: string;
    image: string;
    sales: number;
    revenue: number;
  }>;
  recentReviews: Review[];
}

const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, reviewsRes] = await Promise.all([
        apiClient.users.getSellerStats(),
        apiClient.orders.getAll({ limit: 5 }),
        apiClient.reviews.getBySeller("current"),
      ]);

      // handle stats response safely
      const statsData =
        (statsRes as any)?.data?.data ||
        (statsRes as any)?.data ||
        statsRes ||
        {};

      // handle orders safely (array or wrapped)
      const ordersRaw = (ordersRes as any)?.data ?? ordersRes;
      const ordersData = Array.isArray(ordersRaw)
        ? ordersRaw
        : ordersRaw?.data?.data ||
          ordersRaw?.data?.items ||
          ordersRaw?.data ||
          [];

      // handle reviews safely (array or wrapped)
      const reviewsRaw = (reviewsRes as any)?.data ?? reviewsRes;
      const reviewsData = Array.isArray(reviewsRaw)
        ? reviewsRaw
        : reviewsRaw?.data?.data ||
          reviewsRaw?.data?.items ||
          reviewsRaw?.data ||
          [];

      setStats({
        totalRevenue: statsData.totalRevenue ?? 0,
        totalOrders: statsData.totalOrders ?? 0,
        totalProducts: statsData.totalProducts ?? 0,
        pendingOrders: statsData.pendingOrders ?? 0,
        recentOrders: ordersData,
        productPerformance: statsData.topProducts ?? [],
        recentReviews: reviewsData,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card loading-skeleton h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's your store overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            title="Total Revenue"
            value={`ETB ${stats.totalRevenue.toLocaleString()}`}
            bgColor="bg-primary-100"
            textColor="text-primary-600"
          />
          <DashboardCard
            icon={<ShoppingBagIcon className="w-6 h-6" />}
            title="Total Orders"
            value={stats.totalOrders}
            bgColor="bg-green-100"
            textColor="text-green-600"
          />
          <DashboardCard
            icon={<CubeIcon className="w-6 h-6" />}
            title="Products"
            value={stats.totalProducts}
            bgColor="bg-blue-100"
            textColor="text-blue-600"
          />
          <DashboardCard
            icon={<ClockIcon className="w-6 h-6" />}
            title="Pending Orders"
            value={stats.pendingOrders}
            bgColor="bg-yellow-100"
            textColor="text-yellow-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardAction
            to="/seller/products/add"
            icon={<PlusIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />}
            title="Add Product"
            subtitle="Create new listing"
          />
          <DashboardAction
            to="/seller/products"
            icon={<CubeIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />}
            title="Manage Products"
            subtitle="View all products"
          />
          <DashboardAction
            to="/seller/orders"
            icon={<ShoppingBagIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />}
            title="View Orders"
            subtitle="Process orders"
          />
          <DashboardAction
            to="/store"
            icon={<EyeIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />}
            title="View Store"
            subtitle="See customer view"
          />
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentOrders orders={stats.recentOrders} />
          <TopProducts products={stats.productPerformance} />
        </div>

        {/* Recent Reviews */}
        <RecentReviews reviews={stats.recentReviews} />
      </div>
    </div>
  );
};

export default SellerDashboard;

//
// --- Subcomponents for cleaner UI ---
//

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bgColor: string;
  textColor: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  value,
  bgColor,
  textColor,
}) => (
  <div className="card">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${bgColor} ${textColor}`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

interface DashboardActionProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const DashboardAction: React.FC<DashboardActionProps> = ({
  to,
  icon,
  title,
  subtitle,
}) => (
  <Link
    to={to}
    className="card-hover flex items-center justify-center p-6 text-center"
  >
    <div>
      {icon}
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  </Link>
);

//
// --- Recent Orders ---
//
const RecentOrders: React.FC<{ orders: Order[] }> = ({ orders }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
      <Link
        to="/seller/orders"
        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
      >
        View all
      </Link>
    </div>
    {orders.length === 0 ? (
      <p className="text-sm text-gray-500">No recent orders found.</p>
    ) : (
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900">
                Order #{order.orderNumber}
              </p>
              <p className="text-sm text-gray-600">
                {order.buyer?.firstName} {order.buyer?.lastName}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ETB {order.total.toLocaleString()}
              </p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

//
// --- Top Products ---
//
const TopProducts: React.FC<{
  products: Array<{
    id: string;
    name: string;
    image: string;
    sales: number;
    revenue: number;
  }>;
}> = ({ products }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">Top Products</h2>
      <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
    </div>
    {products.length === 0 ? (
      <p className="text-sm text-gray-500">No top products found.</p>
    ) : (
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">{product.sales} sales</p>
              </div>
            </div>
            <p className="font-semibold text-gray-900">
              ETB {product.revenue.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);

//
// --- Recent Reviews ---
//
const RecentReviews: React.FC<{ reviews: Review[] }> = ({ reviews }) => (
  <div className="card mt-8">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
      <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />
    </div>
    {reviews.length === 0 ? (
      <p className="text-sm text-gray-500">No recent reviews found.</p>
    ) : (
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900">
                {review.user?.firstName} {review.user?.lastName}
              </p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-sm">{review.comment}</p>
            <p className="text-gray-500 text-xs mt-2">
              {review.product?.title}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);
