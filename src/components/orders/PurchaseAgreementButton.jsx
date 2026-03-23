import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Download, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Props:
 *   orderId       — required
 *   userRole      — "buyer" | "builder" | "admin"
 *   variant       — button variant (default "outline")
 *   size          — button size (default "sm")
 */
export default function PurchaseAgreementButton({ orderId, userRole = "buyer", variant = "outline", size = "sm" }) {
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    loadAgreement();
  }, [orderId]);

  async function loadAgreement() {
    setLoading(true);
    try {
      const results = await base44.entities.PurchaseAgreement.filter({ order_id: orderId });
      setAgreement(results[0] || null);
    } catch (err) {
      console.error("Failed to load purchase agreement:", err);
    }
    setLoading(false);
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const result = await base44.functions.invoke("generatePurchaseAgreement", {
        order_id: orderId,
        regenerate: true,
      });
      if (result?.data?.pdf_url) {
        await loadAgreement();
      }
    } catch (err) {
      console.error("Regeneration failed:", err);
    }
    setRegenerating(false);
  }

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!agreement?.pdf_url) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <a href={agreement.pdf_url} target="_blank" rel="noopener noreferrer">
        <Button variant={variant} size={size} className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Purchase Agreement
        </Button>
      </a>

      {userRole === "admin" && (
        <Button
          variant="ghost"
          size={size}
          onClick={handleRegenerate}
          disabled={regenerating}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          title="Regenerate PDF (admin only — preserves original snapshot data)"
        >
          {regenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {regenerating ? "Regenerating..." : "Regenerate PDF"}
        </Button>
      )}
    </div>
  );
}