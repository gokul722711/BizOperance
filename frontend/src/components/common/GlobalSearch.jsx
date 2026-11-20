import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ShoppingCart, Users, Package, CheckSquare, Loader2, ArrowRight } from 'lucide-react';
import { coreApi } from '../../api/endpoints';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ orders: [], customers: [], products: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ orders: [], customers: [], products: [], tasks: [] });
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ orders: [], customers: [], products: [], tasks: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await coreApi.search(query.trim());
        setResults(res.data || { orders: [], customers: [], products: [], tasks: [] });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const hasResults =
    results.orders.length > 0 ||
    results.customers.length > 0 ||
    results.products.length > 0 ||
    results.tasks.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mx-auto max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, customers, products, or tasks..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-indigo-600 mr-2 flex-shrink-0" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!query && (
            <div className="py-10 text-center text-xs text-slate-400">
              Type at least 2 characters to search across all operational data.
            </div>
          )}

          {query && !loading && !hasResults && (
            <div className="py-10 text-center text-sm text-slate-500">
              No matching records found for "{query}".
            </div>
          )}

          {hasResults && (
            <div className="space-y-4">
              {/* Orders */}
              {results.orders.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 mb-2 px-2">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-500" /> Orders
                  </div>
                  <div className="space-y-1">
                    {results.orders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => handleSelect('/orders')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600">
                            {o.title}
                          </div>
                          <div className="text-xs text-slate-500">{o.subtitle}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {results.customers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 mb-2 px-2">
                    <Users className="w-3.5 h-3.5 text-emerald-500" /> Customers
                  </div>
                  <div className="space-y-1">
                    {results.customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelect('/customers')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600">
                            {c.title}
                          </div>
                          <div className="text-xs text-slate-500">{c.subtitle}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 mb-2 px-2">
                    <Package className="w-3.5 h-3.5 text-purple-500" /> Products
                  </div>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect('/products')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600">
                            {p.title}
                          </div>
                          <div className="text-xs text-slate-500">{p.subtitle}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400 mb-2 px-2">
                    <CheckSquare className="w-3.5 h-3.5 text-amber-500" /> Tasks
                  </div>
                  <div className="space-y-1">
                    {results.tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelect('/tasks')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600">
                            {t.title}
                          </div>
                          <div className="text-xs text-slate-500">{t.subtitle}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div>Press ESC to close</div>
          <div>BizOperance Central Search</div>
        </div>
      </div>
    </div>
  );
}
