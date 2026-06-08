"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: string;
  slug: string;
  price: number;
  image: string;
  title: string;
  description: string;
  stockQuantity: number;
}

export default function ProductCard({
  id,
  slug,
  price,
  image,
  title,
  description,
  stockQuantity,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false, type: "" });
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast({ message: "", visible: false, type: "" });
    }, 3000);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const response = await fetch(`${apiUrl}/api/basket/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: id,
          name: title,
          price,
          image,
          detail: description,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add to cart");
      }

      // Dispatch event to update cart count in header
      window.dispatchEvent(new Event("cartUpdated"));
      
      // Redirect to the cart page
      router.push("/cart");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to add to cart",
        "error",
      );
    } finally {
      setIsAdding(false);
    }
  };

  const displayImage = image.startsWith("/") ? image : `/images/products/${image}`;

  return (
    <>
      {/* Toast Notification */}
      {toast.visible && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-4 rounded-lg text-white font-semibold z-50 transition-opacity whitespace-nowrap ${
            toast.type === "success" ? "bg-[#CF1745]" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="group relative bg-white rounded-xl overflow-hidden shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between h-full">
        <div>
          <Link href={`/products/${slug}`} className="block relative aspect-[4/5] overflow-hidden">
            <Image
              src={displayImage}
              alt={title}
              fill
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {stockQuantity === 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded">
                Out of Stock
              </div>
            )}
          </Link>
          <div className="p-8 pb-4">
            <Link href={`/products/${slug}`} className="block">
              <h4 className="text-xl text-black font-semibold mb-2 line-clamp-2 h-14 capitalize hover:text-[#CF1745] transition-colors">
                {title}
              </h4>
            </Link>
            <p className="text-sm text-slate-400 mb-4 font-light leading-relaxed line-clamp-1">
              {description}
            </p>
            <p className="text-lg font-mono text-[#CF1745] font-semibold mb-4">
              ${Number(price).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="p-8 pt-0">
          <button
            onClick={handleBuyNow}
            disabled={stockQuantity === 0 || isAdding}
            className={`w-full px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-all ${
              stockQuantity === 0
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#CF1745E6] text-white hover:bg-[#CF1745] hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            }`}
          >
            {stockQuantity === 0 ? "Out of Stock" : isAdding ? "Processing..." : "Buy Now"}
          </button>
        </div>
      </div>
    </>
  );
}

