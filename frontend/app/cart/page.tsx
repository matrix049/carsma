'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, calculateTotal } = useCart();
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t('shoppingCart')}</h1>

      {cart.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">{t('emptyCart')}</h2>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {t('continueShopping')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row lg:items-start gap-12">
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {cart.map((item) => (
                <li key={item._id} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                    <img
                      src={item.image || 'https://via.placeholder.com/150'}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-base font-medium text-zinc-900 dark:text-zinc-100">
                        <h3>{item.name}</h3>
                        <p className="ml-4 rtl:mr-4 rtl:ml-0 font-bold text-blue-600">{(item.price * item.quantity).toFixed(0)} MAD</p>
                      </div>
                      <p className="mt-1 text-sm text-zinc-500 uppercase">{item.category}</p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 py-1 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-s-lg"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-medium text-zinc-900 dark:text-zinc-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-3 py-1 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-e-lg"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="font-medium text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 transition-colors rtl:mr-auto rtl:ml-0"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Cart Summary */}
          <div className="w-full lg:w-80 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950/50 sticky top-32">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{t('orderSummary')}</h2>
            <div className="mt-6 flex justify-between text-base font-medium text-zinc-900 dark:text-zinc-100">
              <p>{t('subtotal')}</p>
              <p>{calculateTotal().toFixed(0)} MAD</p>
            </div>
            <div className="mt-6">
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-blue-500 transition-all font-bold"
              >
                {t('proceedToCheckout')}
              </Link>
            </div>
            <div className="mt-6 flex justify-center text-center text-sm text-zinc-500">
              <p>
                <Link href="/" className="font-medium text-blue-600 hover:text-blue-500 inline-block transition-colors">
                  &larr; {t('continueShopping')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
