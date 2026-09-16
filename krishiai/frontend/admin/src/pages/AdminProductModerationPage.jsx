import React, { useState, useEffect } from 'react';
import { PackageCheck, Check, X, AlertTriangle, Tag, DollarSign, Building } from 'lucide-react';
import { adminApi } from '@krishiai/api';
import { Button, Loader } from '@krishiai/ui';

export default function AdminProductModerationPage() {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingProducts();
      const list = res.data?.data?.products || res.data?.products || res.data || [];
      setPendingProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[AdminProductModeration] Error fetching pending products:', err);
      setPendingProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleModerate = async (productId, action) => {
    try {
      await adminApi.moderateProduct(productId, action);
      setPendingProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      setPendingProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Marketplace Product Moderation</h1>
          <p className="text-sm text-emerald-200/60">
            Audit catalog listings, chemical compliance, pesticide banned list, and pricing sanity.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-start">
          {pendingProducts.length} Items Pending Review
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader text="Loading catalog moderation queue..." />
        </div>
      ) : pendingProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0a1a0d]/60 border border-emerald-500/15">
          <PackageCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Catalog Clean & Clear</h3>
          <p className="text-xs text-emerald-200/60 mt-1">No products currently awaiting moderation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pendingProducts.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-[#0a1a0d]/80 border border-emerald-500/15 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-[#061409] text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
                    {p.category}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{p.price}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white line-clamp-2">{p.name}</h3>
                  <p className="text-xs text-emerald-200/60 flex items-center gap-1 mt-1">
                    <Building className="w-3 h-3 text-emerald-400/60" />
                    {p.vendor}
                  </p>
                </div>

                {p.complianceFlag && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{p.complianceFlag}</span>
                  </div>
                )}

                <div className="text-xs text-emerald-200/60 flex justify-between pt-2 border-t border-emerald-500/15">
                  <span>Batch Stock: {p.stock} units</span>
                  <span>MRP: {p.mrp}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModerate(p.id, 'reject')}
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Decline
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleModerate(p.id, 'approve')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Publish
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
