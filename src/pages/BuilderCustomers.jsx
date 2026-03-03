import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Users, Mail, ShoppingBag, Search, Download } from "lucide-react";
import { format } from "date-fns";

export default function BuilderCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    try {
      const u = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        const builderName = p.business_name || p.display_name;
        const allOrders = await base44.entities.Order.list("-created_date", 500);
        const builderOrders = allOrders.filter(order =>
          order.builder_id === p.id || order.items?.some(item => item.builder_name === builderName)
        );

        // Aggregate by buyer
        const byBuyer = {};
        builderOrders.forEach(order => {
          const key = order.buyer_email || order.user_id;
          if (!key) return;
          if (!byBuyer[key]) {
            byBuyer[key] = {
              email: order.buyer_email,
              name: order.buyer_name || order.buyer_email,
              orders: [],
              totalSpent: 0,
              lastOrder: null,
            };
          }
          byBuyer[key].orders.push(order);
          byBuyer[key].totalSpent += order.total_amount || 0;
          const d = new Date(order.created_date);
          if (!byBuyer[key].lastOrder || d > new Date(byBuyer[key].lastOrder)) {
            byBuyer[key].lastOrder = order.created_date;
          }
        });

        setCustomers(Object.values(byBuyer).sort((a, b) => b.totalSpent - a.totalSpent));
      }
    } catch { base44.auth.redirectToLogin(); }
    setLoading(false);
  }

  function exportCSV() {
    const rows = [["Name", "Email", "Orders", "Total Spent", "Last Order"]];
    customers.forEach(c => {
      rows.push([c.name, c.email, c.orders.length, c.totalSpent.toFixed(2), c.lastOrder ? format(new Date(c.lastOrder), "yyyy-MM-dd") : ""]);
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = customers.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("Dashboard")} className="text-stone-400 hover:text-indigo-600"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold" style={{ color: "#1B2B4B" }}>My Customers</h1>
        <span className="ml-auto text-sm text-stone-400">{customers.length} customer{customers.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Total Customers</p>
          <p className="text-2xl font-bold" style={{ color: "#1B2B4B" }}>{customers.length}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Repeat Buyers</p>
          <p className="text-2xl font-bold" style={{ color: "#1B2B4B" }}>{customers.filter(c => c.orders.length > 1).length}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-2xl font-bold" style={{ color: "#A0692A" }}>${customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Search + Export */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 bg-white text-stone-700" />
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors bg-white"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-stone-200 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">No customers found yet</p>
          <p className="text-stone-400 text-sm mt-1">Customers will appear here once orders are placed.</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left text-xs text-stone-400 uppercase tracking-wider px-5 py-3 font-semibold">Customer</th>
                <th className="text-left text-xs text-stone-400 uppercase tracking-wider px-5 py-3 font-semibold hidden sm:table-cell">Email</th>
                <th className="text-center text-xs text-stone-400 uppercase tracking-wider px-5 py-3 font-semibold">Orders</th>
                <th className="text-right text-xs text-stone-400 uppercase tracking-wider px-5 py-3 font-semibold">Total Spent</th>
                <th className="text-right text-xs text-stone-400 uppercase tracking-wider px-5 py-3 font-semibold hidden md:table-cell">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.email || i} className={`border-b border-stone-50 hover:bg-stone-50 transition-colors ${i % 2 === 0 ? "" : "bg-stone-50/30"}`}>
                  <td className="px-5 py-3 font-medium text-stone-700">{c.name}</td>
                  <td className="px-5 py-3 text-stone-500 hidden sm:table-cell">
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />{c.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-stone-500">
                      <ShoppingBag className="w-3.5 h-3.5" />{c.orders.length}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold" style={{ color: "#A0692A" }}>${c.totalSpent.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-stone-400 hidden md:table-cell">
                    {c.lastOrder ? format(new Date(c.lastOrder), "MMM d, yyyy") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}