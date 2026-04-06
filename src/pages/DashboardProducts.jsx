import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus, Guitar, Pencil, Trash2, Eye, EyeOff, ChevronLeft,
  AlertTriangle, CheckCircle2, Clock, ImageIcon
} from "lucide-react";
import HeroImagePublishModal from "@/components/listings/HeroImagePublishModal";
import HeroImagePublishConfirmModal from "@/components/listings/HeroImagePublishConfirmModal";
import HeroImageReviewPanel from "@/components/listings/HeroImageReviewPanel";
import LimitedVisibilityBanner from "@/components/listings/LimitedVisibilityBanner";

const NAVY = "#1B2B4B";

const INITIAL_FORM = {
  name: "", description: "", about_this_build: "", price: "",
  status: "available", is_available: true, is_featured: false,
  image_urls: [], weight_oz: "", offers_local_pickup: false, local_pickup_details: "",
  specifications: {},
};

function VisibilityChip({ product }) {
  const isLimited =
    !product.builder_approved_marketplace_hero &&
    product.hero_processing_status !== "approved_by_builder" &&
    product.listing_visibility_state !== "full_visibility";

  if (!product.is_available) return null;

  if (isLimited) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
        <AlertTriangle className="w-3 h-3" /> Limited Visibility
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>
      <CheckCircle2 className="w-3 h-3" /> Full Visibility
    </span>
  );
}

export default function DashboardProducts() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Hero image modals
  const [showHeroPublishModal, setShowHeroPublishModal] = useState(false);
  const [showHeroConfirmModal, setShowHeroConfirmModal] = useState(false);
  const [showHeroReviewPanel, setShowHeroReviewPanel] = useState(false);
  const [heroReviewProduct, setHeroReviewProduct] = useState(null);
  const [pendingPublishData, setPendingPublishData] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        const prods = await base44.entities.Product.filter({ builder_id: profiles[0].id }, "-created_date", 100);
        setProducts(prods);
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  function startNew() {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
  }

  function startEdit(product) {
    setShowForm(true);
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      about_this_build: product.about_this_build || "",
      price: product.price || "",
      status: product.status || "available",
      is_available: product.is_available !== false,
      is_featured: product.is_featured || false,
      image_urls: product.image_urls || [],
      weight_oz: product.weight_oz || "",
      offers_local_pickup: product.offers_local_pickup || false,
      local_pickup_details: product.local_pickup_details || "",
      specifications: product.specifications || {},
    });
    // Show limited visibility banner if applicable
  }

  function cancelEdit() {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setShowForm(false);
  }

  async function handleUploadImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_urls: [...f.image_urls, file_url] }));
    setUploadingImage(false);
    e.target.value = "";
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, image_urls: f.image_urls.filter((_, i) => i !== idx) }));
  }

  async function executeSave(data) {
    setSaving(true);
    const payload = {
      ...data,
      price: parseFloat(data.price) || 0,
      weight_oz: data.weight_oz ? parseFloat(data.weight_oz) : undefined,
      builder_id: profile.id,
      builder_name: profile.business_name || user.full_name,
    };
    let savedProduct;
    if (editingProduct) {
      savedProduct = await base44.entities.Product.update(editingProduct.id, payload);
    } else {
      savedProduct = await base44.entities.Product.create(payload);
    }
    setSaving(false);
    cancelEdit();
    loadData();
    return savedProduct;
  }

  async function handleSave() {
    const isPublishing = form.is_available;
    const needsHeroApproval =
      isPublishing &&
      !form.builder_approved_marketplace_hero &&
      !(editingProduct?.builder_approved_marketplace_hero) &&
      !(editingProduct?.listing_visibility_state === "full_visibility");

    if (needsHeroApproval) {
      setPendingPublishData(form);
      setShowHeroPublishModal(true);
      return;
    }
    await executeSave(form);
  }

  async function handlePublishAnyway() {
    setShowHeroPublishModal(false);
    setShowHeroConfirmModal(true);
  }

  async function handleConfirmLimitedPublish() {
    setShowHeroConfirmModal(false);
    await executeSave({ ...pendingPublishData, listing_visibility_state: "limited_visibility" });
  }

  async function handleReviewHeroFromModal() {
    setShowHeroPublishModal(false);
    setShowHeroConfirmModal(false);
    if (editingProduct) {
      setHeroReviewProduct(editingProduct);
      setShowHeroReviewPanel(true);
    } else {
      // For new products: save first, then immediately open the review panel
      const savedProduct = await executeSave({ ...pendingPublishData, listing_visibility_state: "limited_visibility" });
      if (savedProduct) {
        setHeroReviewProduct(savedProduct);
        setShowHeroReviewPanel(true);
      }
    }
  }

  function handleReviewHeroFromBanner() {
    if (editingProduct) {
      setHeroReviewProduct(editingProduct);
      setShowHeroReviewPanel(true);
    }
  }

  function handleHeroApproved(updatedProduct) {
    setShowHeroReviewPanel(false);
    setHeroReviewProduct(null);
    loadData();
    // Update editingProduct to reflect changes
    setEditingProduct(updatedProduct);
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await base44.entities.Product.delete(product.id);
    loadData();
  }

  async function toggleAvailability(product) {
    await base44.entities.Product.update(product.id, { is_available: !product.is_available });
    loadData();
  }

  const isEditingLimitedLive = editingProduct &&
    editingProduct.is_available &&
    !editingProduct.builder_approved_marketplace_hero &&
    editingProduct.hero_processing_status !== "approved_by_builder" &&
    editingProduct.listing_visibility_state !== "full_visibility";

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-12 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link to={createPageUrl("Dashboard")} className="inline-flex items-center gap-1 text-sm mb-4 opacity-60 hover:opacity-100 transition-opacity" style={{ color: NAVY }}>
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#1A1A1A" }}>Stock Listings</h1>
              <p className="text-sm mt-1" style={{ color: "#5A5A5A" }}>Manage your available instruments for sale.</p>
            </div>
            {!editingProduct && (
              <button
                onClick={startNew}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: NAVY }}
              >
                <Plus className="w-4 h-4" /> Add Listing
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* New / Edit Form */}
        {showForm && (
          <div className="bg-white border p-6" style={{ borderColor: "#E0DDD8" }}>
            <h2 className="text-base font-bold mb-5" style={{ color: "#1A1A1A" }}>
              {editingProduct ? `Editing: ${editingProduct.name}` : "New Listing"}
            </h2>

            {/* Limited Visibility Banner */}
            {isEditingLimitedLive && (
              <LimitedVisibilityBanner onReviewHero={handleReviewHeroFromBanner} />
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>Instrument Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border px-3 py-2.5 text-sm focus:outline-none"
                  style={{ borderColor: "#DEDBD6" }}
                  placeholder="e.g. Vintage Burst Telecaster"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>Price (USD) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="w-full border px-3 py-2.5 text-sm focus:outline-none"
                  style={{ borderColor: "#DEDBD6" }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-none"
                style={{ borderColor: "#DEDBD6" }}
                placeholder="Describe this instrument for buyers..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>About This Build (editorial)</label>
              <textarea
                rows={3}
                value={form.about_this_build}
                onChange={e => setForm(f => ({ ...f, about_this_build: e.target.value }))}
                className="w-full border px-3 py-2.5 text-sm focus:outline-none resize-none"
                style={{ borderColor: "#DEDBD6" }}
                placeholder="Materials, inspiration, craftsmanship story..."
              />
            </div>

            {/* Photos */}
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#6B6B6B" }}>Photos</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {form.image_urls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 border" style={{ borderColor: "#DEDBD6" }}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black bg-opacity-60 text-white flex items-center justify-center text-xs rounded-full hover:bg-opacity-80"
                    >×</button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-60 text-white px-1 rounded">Hero</span>
                    )}
                  </div>
                ))}
                <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed cursor-pointer text-xs text-gray-400 hover:bg-gray-50 transition-colors ${uploadingImage ? "border-blue-300 bg-blue-50" : "border-gray-300"}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} disabled={uploadingImage} />
                  {uploadingImage ? (
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Plus className="w-5 h-5 mb-1" />Add photo</>
                  )}
                </label>
              </div>
            </div>

            {/* Status + Availability */}
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border px-3 py-2.5 text-sm focus:outline-none appearance-none"
                  style={{ borderColor: "#DEDBD6" }}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>Weight (oz)</label>
                <input
                  type="number"
                  value={form.weight_oz}
                  onChange={e => setForm(f => ({ ...f, weight_oz: e.target.value }))}
                  className="w-full border px-3 py-2.5 text-sm focus:outline-none"
                  style={{ borderColor: "#DEDBD6" }}
                  placeholder="Optional"
                />
              </div>
              <div className="flex flex-col gap-3 pt-5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))} className="w-4 h-4 accent-slate-700" />
                  <span style={{ color: "#4A4A4A" }}>Listed as available</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.offers_local_pickup} onChange={e => setForm(f => ({ ...f, offers_local_pickup: e.target.checked }))} className="w-4 h-4 accent-slate-700" />
                  <span style={{ color: "#4A4A4A" }}>Offers local pickup</span>
                </label>
              </div>
            </div>

            {form.offers_local_pickup && (
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B6B6B" }}>Local Pickup Details</label>
                <input
                  value={form.local_pickup_details}
                  onChange={e => setForm(f => ({ ...f, local_pickup_details: e.target.value }))}
                  className="w-full border px-3 py-2.5 text-sm focus:outline-none"
                  style={{ borderColor: "#DEDBD6" }}
                  placeholder="City, state, availability notes..."
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.price}
                className="px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-colors"
                style={{ backgroundColor: NAVY }}
              >
                {saving ? "Saving..." : editingProduct ? "Save Changes" : "Create Listing"}
              </button>
              <button
                onClick={cancelEdit}
                className="px-5 py-2.5 text-sm font-medium border transition-colors"
                style={{ borderColor: "#DEDBD6", color: "#5A5A5A" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Products list */}
        {products.length === 0 && !editingProduct ? (
          <div className="text-center py-20">
            <Guitar className="w-12 h-12 mx-auto mb-4" style={{ color: "#CCCCCC" }} />
            <h3 className="text-base font-bold mb-2" style={{ color: "#3D3D3D" }}>No listings yet</h3>
            <p className="text-sm mb-5" style={{ color: "#8A8A8A" }}>Add your first stock instrument listing.</p>
            <button onClick={startNew} className="px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: NAVY }}>
              Add First Listing
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-white border flex flex-col sm:flex-row sm:items-center gap-4 p-4"
                style={{ borderColor: "#E0DDD8" }}
              >
                {/* Image */}
                <div className="w-20 h-16 flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#F0EDE8" }}>
                  {product.image_urls?.[0] ? (
                    <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6" style={{ color: "#C8C4BC" }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-sm" style={{ color: "#1A1A1A" }}>{product.name}</h3>
                    <VisibilityChip product={product} />
                    {!product.is_available && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>
                        Unlisted
                      </span>
                    )}
                    {product.status === "sold" && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
                        Sold
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "#A0692A" }}>${product.price?.toLocaleString()}</p>
                  {product.specifications?.instrumentCategory && (
                    <p className="text-xs text-gray-400 mt-0.5">{product.specifications.instrumentCategory}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { startEdit(product); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 border transition-colors hover:bg-stone-50"
                    style={{ borderColor: "#DEDBD6", color: "#4A4A4A" }}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => toggleAvailability(product)}
                    className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 border transition-colors hover:bg-stone-50"
                    style={{ borderColor: "#DEDBD6", color: product.is_available ? "#166534" : "#6B7280" }}
                    title={product.is_available ? "Click to unlist" : "Click to list"}
                  >
                    {product.is_available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {product.is_available ? "Live" : "Unlisted"}
                  </button>
                  {product.is_available &&
                    !product.builder_approved_marketplace_hero &&
                    product.hero_processing_status !== "approved_by_builder" && (
                    <button
                      onClick={() => { setHeroReviewProduct(product); setShowHeroReviewPanel(true); }}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 border transition-colors"
                      style={{ borderColor: "#D97706", color: "#92400E", backgroundColor: "#FFFBEB" }}
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Review Hero
                    </button>
                  )}
                  <button
                    onClick={() => deleteProduct(product)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showHeroPublishModal && (
        <HeroImagePublishModal
          onReviewHero={handleReviewHeroFromModal}
          onPublishAnyway={handlePublishAnyway}
          onClose={() => setShowHeroPublishModal(false)}
        />
      )}
      {showHeroConfirmModal && (
        <HeroImagePublishConfirmModal
          onConfirm={handleConfirmLimitedPublish}
          onGoBack={() => { setShowHeroConfirmModal(false); setShowHeroPublishModal(true); }}
        />
      )}
      {showHeroReviewPanel && heroReviewProduct && (
        <HeroImageReviewPanel
          product={heroReviewProduct}
          onApproved={handleHeroApproved}
          onKeepLimited={() => { setShowHeroReviewPanel(false); setHeroReviewProduct(null); }}
          onClose={() => { setShowHeroReviewPanel(false); setHeroReviewProduct(null); }}
        />
      )}
    </div>
  );
}