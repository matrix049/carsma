'use client';

import React, { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import { fetchProducts, createProduct, updateProduct, deleteProduct, uploadProductImage, Product } from '@/lib/apiServices';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import WheelLoader from '@/components/WheelLoader';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { logout } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: '',
    inStock: true
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

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        image: product.image,
        description: product.description || '',
        category: product.category,
        inStock: product.inStock
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
        inStock: true
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
      inStock: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;

      // Upload new image if file is selected
      if (selectedFile) {
        setIsUploading(true);
        const uploadResult = await uploadProductImage(selectedFile);
        imageUrl = uploadResult.imageUrl;
        setIsUploading(false);
      }

      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        image: imageUrl,
        description: formData.description.trim(),
        category: formData.category.trim(),
        inStock: formData.inStock
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

        <main className="flex-1 overflow-y-auto pt-20 md:pt-0 px-5 py-6 md:p-14">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 md:mb-16">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter font-jakarta uppercase leading-tight">
                Product <span className="text-zinc-800">Management</span>
              </h1>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mt-3 flex items-center gap-3">
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                {products.length} products loaded
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.25)] whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
              <button
                onClick={loadProducts}
                className="h-11 w-11 flex items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </header>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-2xl border border-rose-900/50 bg-rose-950/20 p-6">
              <p className="text-rose-400 text-sm font-bold">Error: {error}</p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-32">
              <WheelLoader size="lg" className="text-blue-600" />
              <p className="mt-8 text-sm font-black uppercase tracking-widest text-zinc-600">
                Loading Products...
              </p>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !error && (
            <>
              {products.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-zinc-600 text-sm font-black uppercase tracking-widest mb-6">
                    No products found
                  </p>
                  <button
                    onClick={() => handleOpenModal()}
                    className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, idx) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="rounded-3xl border border-zinc-900 bg-zinc-900/30 overflow-hidden hover:border-zinc-700 transition-all group"
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                          }}
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="h-8 w-8 rounded-xl bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        {!product.inStock && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        <h3 className="text-lg font-black text-white mb-2 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-3 line-clamp-2">
                          {product.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-black text-white">
                              ${product.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">
                              {product.category}
                            </p>
                          </div>
                          <div className={`h-3 w-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Product Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl"
              >
                {/* Close button */}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="p-8">
                  <h2 className="text-3xl font-black tracking-tighter font-jakarta uppercase mb-8">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 transition-all"
                        placeholder="e.g. BMW Wall Art"
                      />
                    </div>

                    {/* Price and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                          Price (USD) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 transition-all"
                          placeholder="49.99"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-400 mb-2">
                          Category *
                        </label>
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 transition-all"
                          placeholder="e.g. BMW, Audi, Mercedes"
                        />
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 mb-2">
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
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}

                      {/* File Upload Input */}
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
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
                          value={formData.image}
                          onChange={handleInputChange}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 transition-all"
                          placeholder="Or enter image URL: https://example.com/image.jpg"
                        />
                      </div>
                      
                      <p className="text-xs text-zinc-600 mt-2">
                        Upload an image file (max 5MB) or enter an image URL
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-bold text-zinc-400 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-600 transition-all resize-none"
                        placeholder="Product description..."
                      />
                    </div>

                    {/* In Stock */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-600"
                      />
                      <label className="text-sm font-bold text-zinc-400">
                        In Stock
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}