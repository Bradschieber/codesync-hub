import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function CartModal({ user, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    if (!user) { setLoading(false); return; }
    const data = await base44.entities.CartItem.filter({ user_id: user.id });
    setItems(data);
    setLoading(false);
  }

  async function removeItem(id) {
    await base44.entities.CartItem.delete(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const total = items.reduce((sum, i) => sum + (i.product_price * i.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:w-96 h-full sm:h-auto sm:max-h-[85vh] sm:rounded-l-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-stone-800">Your Cart</h2>
            <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">{items.length}</span>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-stone-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">Your cart is empty</p>
              <button onClick={onClose} className="mt-3 text-amber-600 hover:underline text-sm">Browse guitars</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 p-3 bg-stone-50 rounded-xl">
                {item.product_image && (
                  <img src={item.product_image} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 text-sm truncate">{item.product_name}</p>
                  <p className="text-stone-500 text-xs">{item.builder_name}</p>
                  <p className="text-amber-700 font-bold mt-1">${item.product_price?.toLocaleString()}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-1.5 text-stone-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-stone-200 space-y-3">
            <div className="flex justify-between text-sm font-semibold text-stone-800">
              <span>Subtotal</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <Link
              to={createPageUrl("Checkout")}
              onClick={onClose}
              className="block w-full bg-amber-600 hover:bg-amber-500 text-white text-center font-semibold py-3 rounded-xl transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}