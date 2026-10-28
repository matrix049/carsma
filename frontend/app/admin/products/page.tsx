'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import { fetchProducts, createProduct, updateProduct, deleteProduct, uploadProductImage, Product } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@/components/Loader';

type StockTone = 'ok' | 'low' | 'out';

// One availability label per card: the "In Stock" switch wins, then the
// counted pieces (3D editions), otherwise plain "In stock" (made to order).
function stockStatus(product: Product): { label: string; tone: StockTone } {
  const qty = typeof product.stockQuantity === 'number' ? product.stockQuantity : null;
  if (!product.inStock) return { label: qty ? `Out of stock · ${qty} pcs` : 'Out of stock', tone: 'out' };
  if (qty === 0) return { label: 'Sold out · 0 left', tone: 'out' };
  if (qty !== null) return { label: `${qty} ${qty === 1 ? 'piece' : 'pieces'} left`, tone: qty <= 2 ? 'low' : 'ok' };
  return { label: 'In stock', tone: 'ok' };
}

const STOCK_TONE: Record<StockTone, string> = {
  ok: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
  low: 'bg-amber-500/10 text-amber-300 ring-amber-500/25',
  out: 'bg-rose-500/10 text-rose-300 ring-rose-500/25',
};

// Editor field styles. text-base (16px) stops iOS Safari zooming in on
// focus; min-h 48px keeps every control an easy thumb target.
const FIELD = 'w-full min-h-[48px] rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-base text-white focus:outline-none focus:border-blue-600 transition-colors';
const LABEL = 'mb-2 block text-sm font-bold text-zinc-400';
const HINT = 'mt-2 text-[13px] leading-relaxed text-zinc-600 md:text-xs';
const DIMENSION_PRESETS = ['120cm x 35cm', '120cm x 50cm', '120cm x 75cm', '150cm x 40cm'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { logout } = useAuth();

  // Free-text search filter over name + category
  const [search, setSearch] = useState('');

  // Form state
  const DEFAULT_DIMENSIONS = '120cm x 35cm';
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: '',
    inStock: true,
    dimensions: DEFAULT_DIMENSIONS,
    stockQuantity: '',
    gallery: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Lock the page behind the editor sheet so a swipe inside it doesn't
  // scroll the product grid underneath (iOS especially).
  useEffect(() => {
    if (!showModal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showModal]);

  const soldOutCount = useMemo(
    () => products.filter((p) => stockStatus(p).tone === 'out').length,
    [products],
  );

  // Filter the grid by a single free-text query that matches across name,
  // category, and dimensions (so the operator can type "g class" or
  // "120cm x 50cm" and narrow the list).
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const haystack = [p.name, p.category, p.dimensions, p.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, search]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image: product.image,
        description: product.description || '',
        category: product.category,
        inStock: product.inStock,
        dimensions: product.dimensions || DEFAULT_DIMENSIONS,
        stockQuantity: typeof product.stockQuantity === 'number' ? String(product.stockQuantity) : '',
        gallery: (product.gallery ?? []).join('\n'),
      });
      setPreviewUrl(product.image);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        image: '',
        description: '',
        category: '',
        inStock: true,
        dimensions: DEFAULT_DIMENSIONS,
        stockQuantity: '',
        gallery: '',
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({
      name: '',
      price: '',
      image: '',
      description: '',
      category: '',
      inStock: true,
      dimensions: DEFAULT_DIMENSIONS,
      stockQuantity: '',
      gallery: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Every product must ship with a real short description. The textarea
    // is `required` + minLength, but minLength counts whitespace, so guard
    // here against a blank / too-short description before we hit the API.
    if (formData.description.trim().length < 10) {
      alert('Please add a short description (at least 10 characters). Every product needs one.');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;

      // Upload new image if file is selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          const uploadResult = await uploadProductImage(selectedFile);
          imageUrl = uploadResult.imageUrl;
        } catch (uploadError: any) {
          setIsUploading(false);
          if (uploadError.message.includes('Authentication required') || uploadError.message.includes('Invalid token')) {
            alert('Your session has expired. Please log in again.');
            logout();
            return;
          }
          throw uploadError;
        }
        setIsUploading(false);
      }

      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        image: imageUrl,
        description: formData.description.trim(),
        category: formData.category.trim(),
        inStock: formData.inStock,
        dimensions: formData.dimensions.trim() || DEFAULT_DIMENSIONS,
        // Empty = stock not tracked (made to order).
        stockQuantity: formData.stockQuantity.trim() === '' ? null : Math.max(0, Math.floor(Number(formData.stockQuantity))),
        gallery: formData.gallery.split('\n').map((u) => u.trim()).filter(Boolean),
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, productData);
      } else {
        await createProduct(productData);
      }

      await loadProducts();
      handleCloseModal();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      
      // Handle authentication errors
      if (err.message.includes('Invalid token') || err.message.includes('Authentication required') || err.statusCode === 401) {
        alert('Your session has expired. Please log in again.');
        logout();
        return;
      }
      
      alert(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await deleteProduct(product._id);
      await loadProducts();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-black text-white font-inter">
        <AdminSidebar onLogout={logout} />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-20 sm:px-5 md:p-14">
          {/* Header — on phones the actions drop into a full-width row under the title */}
          <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8 lg:mb-12">
            <div className="min-w-0">
              <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-chalk sm:text-4xl">
                Products
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-smoke">
                {products.length} products
                {soldOutCount > 0 && <span className="text-rose-300">· {soldOutCount} sold out</span>}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-5 text-xs font-black uppercase tracking-widest transition-all hover:bg-blue-500 sm:flex-none md:rounded-2xl"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
              <button
                type="button"
                onClick={loadProducts}
                aria-label="Refresh products"
                title="Refresh"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all"
              >
                <svg className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </header>

          {/* Search bar — filters the grid by name / category / dimensions */}
          <div className="mb-5 md:mb-8">
            <div className="relative sm:max-w-xl">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, category, size…"
                aria-label="Search products"
                enterKeyHint="search"
                className="h-12 w-full text-ellipsis rounded-xl md:rounded-2xl border border-zinc-800 bg-zinc-900/60 pl-11 pr-12 text-base md:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 transition-colors [&::-webkit-search-cancel-button]:appearance-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {search && (
              <p className="mt-2 break-words text-xs font-bold uppercase tracking-widest text-zinc-500">
                {filteredProducts.length} of {products.length} match “{search}”
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-900/50 bg-rose-950/20 p-4 md:mb-8 md:p-6">
              <p className="break-words text-rose-400 text-sm font-bold">Error: {error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 md:py-32">
              <Loader size="lg" className="text-blue-600" />
              <p className="mt-8 text-sm font-black uppercase tracking-widest text-zinc-600">
                Loading Products...
              </p>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !error && (
            <>
              {products.length === 0 ? (
                <div className="py-16 text-center md:py-24">
                  <p className="text-zinc-600 text-sm font-black uppercase tracking-widest mb-6">
                    No products found
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="min-h-[48px] px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center md:py-24">
                  <p className="break-words text-zinc-600 text-sm font-black uppercase tracking-widest mb-6">
                    No products match “{search}”
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="min-h-[44px] px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product, idx) => {
                    const stock = stockStatus(product);
                    const soldOut = stock.tone === 'out';
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx, 10) * 0.05 }}
                        className="group flex flex-col overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-900 bg-zinc-900/30 hover:border-zinc-700 transition-colors"
                      >
                        {/* Phones: thumbnail + details side by side. sm and up: tile with the photo on top. */}
                        <div className="flex gap-3 p-3 sm:flex-1 sm:flex-col sm:gap-0 sm:p-0">
                          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800 sm:aspect-square sm:h-auto sm:w-full sm:rounded-none">
                            <img
                              src={product.image}
                              alt={product.name}
                              className={`absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ${soldOut ? 'opacity-60' : ''}`}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                              }}
                            />
                            {soldOut && (
                              <span className="absolute bottom-3 left-3 hidden rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white sm:inline-block">
                                {product.inStock ? 'Sold out' : 'Out of Stock'}
                              </span>
                            )}
                          </div>

                          {/* Product Info — who/what first, then price + availability */}
                          <div className="flex min-w-0 flex-1 flex-col sm:p-5 sm:pb-0">
                            <p className="truncate text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                              {product.category}
                            </p>
                            <h3 className="mt-0.5 line-clamp-2 break-words text-[15px] font-black leading-snug text-white md:text-lg">
                              {product.name}
                            </h3>
                            <p className="mt-1.5 hidden text-sm text-zinc-500 sm:line-clamp-2">
                              {product.description || 'No description'}
                            </p>
                            <p className="mt-1 text-[13px] text-zinc-500 md:text-xs">
                              {product.dimensions || '120cm x 35cm'}
                              {!!product.gallery?.length && <> · +{product.gallery.length} more photos</>}
                            </p>
                            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-2 sm:pt-4">
                              <p className="text-base font-black text-white sm:text-xl md:text-2xl">
                                {product.price.toFixed(2)} MAD
                              </p>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STOCK_TONE[stock.tone]}`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                                {stock.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions — full-size thumb targets on phones */}
                        <div className="flex gap-3 px-3 pb-3 sm:px-5 sm:pb-5 sm:pt-4 md:gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(product)}
                            aria-label={`Edit ${product.name}`}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.04] text-sm font-semibold text-white ring-1 ring-inset ring-white/10 hover:bg-white/[0.08] transition-colors md:h-10"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            aria-label={`Delete ${product.name}`}
                            title="Delete"
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/20 hover:bg-rose-500/20 transition-colors md:h-10 md:w-10"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>

        {/* Product editor — bottom sheet on phones (above the fixed top bar),
            centred dialog from md up. Header and Save/Cancel bar stay put
            while the fields scroll between them. */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              key="product-editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 backdrop-blur-sm md:items-center md:p-4"
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-editor-title"
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 48 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-zinc-800 bg-zinc-950 shadow-2xl md:max-w-2xl md:rounded-3xl md:border"
              >
                {/* Sheet header */}
                <div className="flex-shrink-0 border-b border-zinc-900 px-5 pb-4 pt-3 md:px-8 md:pb-6 md:pt-7">
                  <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15 md:hidden" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 pt-1">
                      <h2 id="product-editor-title" className="text-xl md:text-3xl font-black tracking-tighter font-jakarta uppercase leading-tight">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h2>
                      {editingProduct && (
                        <p className="mt-1 truncate text-sm text-zinc-500">{editingProduct.name}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      aria-label="Close"
                      className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-full md:rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 md:px-8 md:py-6">
                    {/* Product Name */}
                    <div>
                      <label htmlFor="product-name" className={LABEL}>
                        Product Name *
                      </label>
                      <input
                        id="product-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className={FIELD}
                        placeholder="e.g. BMW Wall Art"
                      />
                    </div>

                    {/* Price and Category */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="product-price" className={LABEL}>
                          Price (MAD) *
                        </label>
                        {/* No inputMode="decimal": on French/Arabic-region iPhones that
                            keypad only has ",", which type="number" rejects. */}
                        <input
                          id="product-price"
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className={FIELD}
                          placeholder="499.99"
                        />
                      </div>
                      <div>
                        <label htmlFor="product-category" className={LABEL}>
                          Category *
                        </label>
                        <input
                          id="product-category"
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className={FIELD}
                          placeholder="e.g. BMW, Audi, Mercedes"
                        />
                      </div>
                    </div>

                    {/* Dimensions — defaults to the standard 120cm x 35cm,
                        admin can override per product (e.g. larger format
                        for the G-Class line). */}
                    <div>
                      <label htmlFor="product-dimensions" className={LABEL}>
                        Dimensions
                      </label>
                      <input
                        id="product-dimensions"
                        type="text"
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleInputChange}
                        className={FIELD}
                        placeholder="120cm x 35cm"
                      />
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="w-full text-[11px] font-bold uppercase tracking-widest text-zinc-500 md:w-auto">Quick fill:</span>
                        {DIMENSION_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, dimensions: preset }))}
                            aria-pressed={formData.dimensions === preset}
                            className={`min-h-[44px] rounded-xl border px-3.5 text-[13px] font-bold transition-colors md:min-h-[36px] md:rounded-lg md:px-3 md:text-xs ${
                              formData.dimensions === preset
                                ? 'border-blue-600 bg-blue-600/15 text-blue-400'
                                : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <p className={HINT}>
                        Defaults to <span className="font-bold text-zinc-400">120cm x 35cm</span>. Shown to customers on the product page.
                      </p>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label htmlFor="product-image-file" className={LABEL}>
                        Product Image *
                      </label>

                      {/* Image Preview */}
                      {(previewUrl || formData.image) && (
                        <div className="mb-4 relative">
                          <img
                            src={previewUrl || formData.image}
                            alt="Product preview"
                            className="w-full h-48 object-cover rounded-xl border border-zinc-800"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            aria-label="Remove image"
                            className="absolute top-2 right-2 h-11 w-11 md:h-9 md:w-9 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}

                      {/* File Upload Input */}
                      <div className="space-y-3">
                        <input
                          id="product-image-file"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full min-h-[52px] bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600 transition-all file:mr-3 file:min-h-[36px] file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                        />

                        {/* OR Divider */}
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-px bg-zinc-800"></div>
                          <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">OR</span>
                          <div className="flex-1 h-px bg-zinc-800"></div>
                        </div>

                        {/* URL Input */}
                        <input
                          type="url"
                          name="image"
                          inputMode="url"
                          aria-label="Image URL"
                          value={formData.image}
                          onChange={handleInputChange}
                          className={FIELD}
                          placeholder="Or paste an image URL (https://…)"
                        />
                      </div>

                      <p className={HINT}>
                        Upload an image file (max 5MB) or enter an image URL
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="product-description" className={LABEL}>
                        Description *
                      </label>
                      <textarea
                        id="product-description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        minLength={10}
                        rows={3}
                        className={`${FIELD} resize-none`}
                        placeholder="Short description shown on the product page — e.g. brand, model year, what makes it special."
                      />
                      <p className={HINT}>
                        Required. Keep it short — one or two sentences customers read before buying.
                      </p>
                    </div>

                    {/* Extra photos — shown after the main image on the product page */}
                    <div>
                      <label htmlFor="product-gallery" className={LABEL}>
                        Extra photos <span className="font-normal text-zinc-600">(optional, one link per line)</span>
                      </label>
                      <textarea
                        id="product-gallery"
                        name="gallery"
                        rows={3}
                        value={formData.gallery}
                        onChange={handleInputChange}
                        className={`${FIELD} break-all font-mono resize-y md:text-xs`}
                        placeholder={'https://res.cloudinary.com/…/photo-2.jpg\nhttps://res.cloudinary.com/…/photo-3.jpg'}
                      />
                      {formData.gallery.trim() && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.gallery.split('\n').map((u) => u.trim()).filter(Boolean).map((u, i) => (
                            <img key={`${i}-${u}`} src={u} alt="" className="h-14 w-20 rounded-lg object-cover border border-zinc-800" />
                          ))}
                        </div>
                      )}
                      <p className={HINT}>Shown after the main image on the product page (swipe or arrows).</p>
                    </div>

                    {/* Pieces in stock — only for counted pieces like the 3D editions */}
                    <div>
                      <label htmlFor="product-stock" className={LABEL}>
                        Pieces in stock <span className="font-normal text-zinc-600">(optional)</span>
                      </label>
                      <input
                        id="product-stock"
                        type="number"
                        name="stockQuantity"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        className={FIELD}
                        placeholder="Leave empty if made to order"
                      />
                      <p className={HINT}>
                        Shown as &ldquo;Only N left&rdquo;. At 0 the piece shows as sold out and can&apos;t be ordered. Leave empty for made-to-order pieces.
                      </p>
                    </div>

                    {/* In Stock — the whole row is the tap target */}
                    <label
                      htmlFor="product-instock"
                      className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4"
                    >
                      <input
                        id="product-instock"
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                        className="h-5 w-5 flex-shrink-0 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-600"
                      />
                      <span className="text-sm font-bold text-zinc-400">In Stock</span>
                    </label>
                  </div>

                  {/* Save / Cancel — pinned to the bottom of the sheet */}
                  <div className="flex flex-shrink-0 gap-3 border-t border-zinc-900 bg-zinc-950 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:gap-4 md:px-8 md:py-5">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="h-12 flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="h-12 flex-[2] md:flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Uploading...
                        </>
                      ) : isSubmitting ? (
                        'Saving...'
                      ) : (
                        editingProduct ? 'Update Product' : 'Create Product'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}