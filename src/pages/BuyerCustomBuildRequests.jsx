import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Hammer, FileText, MessageSquare, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NAVY = "#1B2B4B";
const AMBER = "#C57A1F";

const STATUS_CONFIG = {
  pending:                    { label: "Pending Builder Review", bg: "bg-amber-100", text: "text-amber-700" },
  in_discussion:              { label: "In Discussion", bg: "bg-blue-100", text: "text-blue-700" },
  order_form_sent:            { label: "Order Form Ready", bg: "bg-indigo-100", text: "text-indigo-700", highlight: true },
  order_form_declined_by_buyer: { label: "Order Form Declined", bg: "bg-stone-100", text: "text-stone-600" },
  declined_by_builder:        { label: "Declined by Builder", bg: "bg-red-100", text: "text-red-700" },
  converted_to_order:         { label: "Order Created", bg: "bg-green-100", text: "text-green-700" },
  // Legacy
  accepted:                   { label: "Accepted", bg: "bg-green-100", text: "text-green-700" },
  reviewed:                   { label: "Reviewed", bg: "bg-stone-100", text: "text-stone-600" },
  quoted:                     { label: "Order Form Sent", bg: "bg-indigo-100", text: "text-indigo-700" },
  declined:                   { label: "Declined", bg: "bg-red-100", text: "text-red-700" },
  completed:                  { label: "Completed", bg: "bg-green-100", text: "text-green-700" },
};

export default function BuyerCustomBuildRequests() {
  const [requests, setRequests] = useState([]);
  const [orderForms, setOrderForms] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const [reqs, forms] = await Promise.all([
        base44.entities.CustomBuildRequest.filter({ customer_email: u.email }, "-created_date", 50),
        base44.entities.CustomBuildOrderForm.filter({ buyer_id: u.id }, "-created_date", 50),
      ]);
      setRequests(reqs);
      setOrderForms(forms);
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  function getLatestForm(requestId) {
    return orderForms
      .filter(f => f.custom_build_request_id === requestId && f.status !== "superseded")
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0] || null;
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin w-7 h-7 border-2 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  const activeRequests = requests.filter(r => !["converted_to_order", "declined_by_builder", "declined", "completed"].includes(r.status));
  const closedRequests = requests.filter(r => ["converted_to_order", "declined_by_builder", "declined", "completed"].includes(r.status));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10" style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>
      <div className="flex items-center gap-3 mb-8">
        <Link to={createPageUrl("Account")} className="text-stone-400 hover:text-stone-700">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>My Custom Build Requests</h1>
          <p className="text-sm text-stone-500">Track your conversations and Order Forms with builders</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-24">
          <Hammer className="w-16 h-16 text-stone-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 mb-2">No custom build requests yet</h3>
          <p className="text-sm text-stone-400 mb-6">Browse our builders and request a custom instrument built just for you.</p>
          <Link to={createPageUrl("Builders")} className="inline-block font-semibold px-5 py-2.5 text-sm text-white rounded-lg" style={{ backgroundColor: NAVY }}>
            Find a Builder
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {activeRequests.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Active Requests</h2>
              <div className="space-y-4">
                {activeRequests.map(req => <RequestCard key={req.id} request={req} latestForm={getLatestForm(req.id)} />)}
              </div>
            </section>
          )}
          {closedRequests.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Past Requests</h2>
              <div className="space-y-4">
                {closedRequests.map(req => <RequestCard key={req.id} request={req} latestForm={getLatestForm(req.id)} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, latestForm }) {
  const statusCfg = STATUS_CONFIG[request.status] || { label: request.status, bg: "bg-stone-100", text: "text-stone-600" };
  const hasActionableForm = latestForm && latestForm.status === "sent";
  const hasAcceptedForm = latestForm && latestForm.status === "accepted";

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${hasActionableForm ? "border-indigo-300 ring-1 ring-indigo-200" : "border-stone-200"}`}>
      {hasActionableForm && (
        <div className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> Order Form ready for your review — action required
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-bold text-stone-800 text-sm">{request.build_type || "Custom Build Request"}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {request.created_date ? formatDistanceToNow(new Date(request.created_date), { addSuffix: true }) : ""}
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${statusCfg.bg} ${statusCfg.text}`}>
            {statusCfg.label}
          </span>
        </div>

        {request.description && (
          <p className="text-sm text-stone-600 leading-relaxed line-clamp-2 mb-3">{request.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-stone-500 mb-4">
          {request.budget_range && <span>Budget: <strong>{request.budget_range}</strong></span>}
        </div>

        <div className="flex flex-wrap gap-2">
          {hasActionableForm && (
            <Link to={`/OrderFormReview?formId=${latestForm.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors"
              style={{ backgroundColor: AMBER }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#a8661a"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = AMBER}>
              <FileText className="w-3.5 h-3.5" /> Review Order Form
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {hasAcceptedForm && latestForm.linked_order_id && (
            <Link to={createPageUrl("Orders")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50">
              View Order
            </Link>
          )}
          {latestForm && !hasActionableForm && (
            <Link to={`/OrderFormReview?formId=${latestForm.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-stone-200 text-stone-500 hover:bg-stone-50">
              <FileText className="w-3.5 h-3.5" /> View Order Form
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}