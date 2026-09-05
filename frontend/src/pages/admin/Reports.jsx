import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAdminDate } from '../../context/AdminDateContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDatePicker from '../../components/common/AdminDatePicker';
import Pagination from '../../components/common/Pagination';
import client from '../../api/client';
import { TrendingUp, Award, ShoppingCart, Loader2, Inbox } from 'lucide-react';

const Reports = () => {
  const { colors, isLight } = useAdminTheme();
  const { selectedDate } = useAdminDate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/analytics/summary');
      if (res.data?.success && Array.isArray(res.data?.data?.productsPerformance)) {
        setTopProducts(res.data.data.productsPerformance);
      } else {
        setTopProducts([]);
      }
    } catch (err) {
      // Quiet fallback
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const top4 = useMemo(() => {
    return topProducts.slice(0, 4);
  }, [topProducts]);

  const paginatedProducts = useMemo(() => {
    return topProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [topProducts, currentPage]);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-amber-100 text-amber-700 border-amber-200';
      case 2: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      case 3: return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 space-y-8">
        <header className={`pb-6 border-b ${colors.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${colors.text} flex items-center space-x-2`}>
              <TrendingUp className="h-6 w-6 text-brand-500" />
              <span>Sales & Analytics Reports</span>
            </h1>
            <p className={`${colors.textSecondary} text-sm mt-1`}>Top performing products and revenue analytics for {selectedDate}.</p>
          </div>

          <AdminDatePicker label="Report Date" />
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        ) : topProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-neutral-200 shadow-sm text-center">
            <Inbox className="h-12 w-12 text-neutral-300 mb-3" />
            <p className="text-sm font-semibold text-neutral-600">No product sales reports available</p>
            <p className="text-xs text-neutral-400 mt-1">Start accepting checkouts to compile analytics</p>
          </div>
        ) : (
          <>
            {/* Top 4 Product Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {top4.map((product, idx) => (
                <div
                  key={product._id}
                  className={`group p-6 rounded-2xl border ${colors.cardBg} ${colors.cardBorder} space-y-4 card-hover cursor-default relative overflow-hidden`}
                >
                  {idx === 0 && (
                    <div className="absolute top-3 right-3">
                      <Award className="h-5 w-5 text-amber-500" />
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold border ${getRankColor(idx + 1)}`}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${colors.text} truncate`}>{product.name}</p>
                      <p className={`text-[10px] ${colors.textSecondary} capitalize`}>{product.category}</p>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${isLight ? 'bg-neutral-50' : 'bg-neutral-900/30'} space-y-2`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className={colors.textSecondary}>Orders</span>
                      <span className={`font-bold ${colors.text} flex items-center space-x-1`}>
                        <ShoppingCart className="h-3.5 w-3.5 text-brand-500" />
                        <span>{(product.totalOrders || 0).toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={colors.textSecondary}>Revenue</span>
                      <span className={`font-bold ${colors.text}`}>INR {(product.revenue || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* All Products Table */}
            <section className={`${colors.cardBg} border ${colors.cardBorder} rounded-2xl overflow-hidden shadow-sm`}>
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <h2 className="text-base font-semibold text-neutral-900">All Products Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 uppercase tracking-wider font-bold">
                      <th className="py-4 px-6">Rank</th>
                      <th className="py-4 px-6">Product</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Total Sales</th>
                      <th className="py-4 px-6">Generated Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-600 dark:text-slate-300 font-medium">
                    {paginatedProducts.map((product, idx) => (
                      <tr key={product._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center justify-center h-6 w-6 rounded-md text-[10px] font-bold border ${getRankColor((currentPage - 1) * itemsPerPage + idx + 1)}`}>
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-900 truncate max-w-xs">{product.name}</td>
                        <td className="py-4 px-6 capitalize">{product.category}</td>
                        <td className="py-4 px-6 font-semibold text-neutral-900">{(product.totalOrders || 0).toLocaleString()} units</td>
                        <td className="py-4 px-6 font-semibold text-brand-500">INR {(product.revenue || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={topProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Reports;
