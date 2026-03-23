import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { jsPDF } from 'npm:jspdf@4.0.0';

const AGREEMENT_VERSION = "1.0";

function formatCurrency(amount) {
  if (amount == null) return "N/A";
  return `$${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function generateAgreementNumber(orderId) {
  const ts = Date.now().toString(36).toUpperCase();
  const short = orderId.slice(-6).toUpperCase();
  return `SC-PA-${short}-${ts}`;
}

function buildPdf({ order, buyer, builder, builderProfile, agreementNumber, generatedAt }) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  function checkPage(needed = 10) {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function drawHRule(color = [220, 218, 212]) {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  }

  function sectionTitle(text) {
    checkPage(12);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(text.toUpperCase(), margin, y);
    y += 2;
    drawHRule([210, 207, 200]);
    doc.setTextColor(30, 30, 30);
  }

  function row(label, value, indent = 0) {
    checkPage(7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin + indent, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    const valStr = String(value ?? "N/A");
    const lines = doc.splitTextToSize(valStr, contentW - 60);
    doc.text(lines, margin + indent + 55, y);
    y += lines.length * 5 + 1;
  }

  function bodyText(text, indent = 0) {
    checkPage(8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(text, contentW - indent);
    doc.text(lines, margin + indent, y);
    y += lines.length * 5 + 2;
  }

  // ── HEADER ────────────────────────────────────────────────────────────
  doc.setFillColor(47, 62, 85);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Stringed Collective", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 195, 210);
  doc.text("Purchase Agreement", margin, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 195, 210);
  doc.text(agreementNumber, pageW - margin, 12, { align: "right" });
  doc.text(`Generated: ${formatDate(generatedAt)}`, pageW - margin, 20, { align: "right" });

  y = 36;

  // ── OVERVIEW ──────────────────────────────────────────────────────────
  doc.setFillColor(247, 246, 243);
  doc.rect(margin, y, contentW, 22, "F");
  doc.setDrawColor(220, 218, 212);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentW, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(47, 62, 85);
  doc.text("Order Summary", margin + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(`Order ID: ${order.id}`, margin + 4, y + 13);
  doc.text(`Order Type: ${order.order_type === "custom" ? "Custom Build" : "Stock Build"}`, margin + 4, y + 19);
  doc.text(`Total Amount: ${formatCurrency(order.total_amount)}`, pageW - margin - 4, y + 13, { align: "right" });
  if (order.deposit_amount) {
    doc.text(`Deposit: ${formatCurrency(order.deposit_amount)}`, pageW - margin - 4, y + 19, { align: "right" });
  }

  y += 28;

  // ── BUYER INFORMATION ────────────────────────────────────────────────
  sectionTitle("Buyer Information");
  const buyerName = buyer ? `${buyer.first_name || ""} ${buyer.last_name || ""}`.trim() || buyer.full_name || buyer.email : order.buyer_name || "N/A";
  row("Full Name", buyerName);
  row("Email", buyer?.email || order.buyer_email || "N/A");

  const addr = order.shipping_address;
  if (addr) {
    const addrStr = [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(", ");
    row("Shipping Address", addrStr || "N/A");
  }

  // ── BUILDER / SELLER INFORMATION ──────────────────────────────────────
  sectionTitle("Builder / Seller Information");
  row("Business Name", builderProfile?.business_name || order.builder_name || "N/A");
  row("Location", builderProfile?.location || [builderProfile?.business_city, builderProfile?.business_state, builderProfile?.business_country].filter(Boolean).join(", ") || "N/A");
  if (builderProfile?.website_url) row("Website", builderProfile.website_url);

  // ── ITEMS PURCHASED ───────────────────────────────────────────────────
  sectionTitle("Items Purchased");
  const items = order.items || [];
  if (items.length === 0) {
    bodyText("No items recorded.");
  } else {
    items.forEach((item, idx) => {
      checkPage(14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      doc.text(`${idx + 1}. ${item.product_name || "Instrument"}`, margin + 2, y);
      y += 5;
      row("Builder", item.builder_name, 4);
      row("Unit Price", formatCurrency(item.product_price), 4);
      row("Quantity", item.quantity ?? 1, 4);
      row("Subtotal", formatCurrency((item.product_price || 0) * (item.quantity || 1)), 4);
      y += 2;
    });
  }

  // ── PRICING & TRANSACTION ─────────────────────────────────────────────
  sectionTitle("Pricing & Transaction Details");
  row("Order Total", formatCurrency(order.total_amount));
  if (order.deposit_amount) {
    row("Deposit Amount", formatCurrency(order.deposit_amount));
    const remaining = (order.total_amount || 0) - (order.deposit_amount || 0);
    row("Remaining Balance", formatCurrency(remaining));
  }
  if (order.stripe_session_id) row("Transaction Reference", order.stripe_session_id);
  row("Order Date", formatDate(order.created_date));
  if (order.build_start_date) row("Build Start Date", formatDate(order.build_start_date));
  if (order.estimated_build_completion_date) row("Est. Completion", formatDate(order.estimated_build_completion_date));

  // ── BUILDER TERMS & POLICIES ──────────────────────────────────────────
  sectionTitle("Builder Terms & Policies");

  // Warranty
  if (builderProfile?.warranty_policy || builderProfile?.warranty_duration) {
    checkPage(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(47, 62, 85);
    doc.text("Warranty Policy", margin, y);
    y += 5;
    if (builderProfile.warranty_duration) row("Duration", builderProfile.warranty_duration);
    if (builderProfile.warranty_policy) bodyText(builderProfile.warranty_policy, 2);
    const wc = builderProfile.warranty_coverage || [];
    wc.forEach(c => { if (c.label) row(c.label, c.duration || "Covered"); });
    const exc = builderProfile.warranty_exclusions || [];
    if (exc.length > 0) row("Exclusions", exc.join(", "));
    if (builderProfile.warranty_claim_process) bodyText(`Claim Process: ${builderProfile.warranty_claim_process}`, 2);
  }

  // Returns
  checkPage(10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(47, 62, 85);
  doc.text("Return Policy", margin, y);
  y += 5;
  const returnsMap = { yes: "Returns Accepted", no: "All Sales Final", case_by_case: "Case-by-Case" };
  row("Returns", returnsMap[builderProfile?.returns_accepted] || "Not Specified");
  if (builderProfile?.return_window_days) row("Return Window", `${builderProfile.return_window_days} days`);
  if (builderProfile?.return_condition) row("Condition Required", builderProfile.return_condition);
  if (builderProfile?.return_restocking_fee_percent) row("Restocking Fee", `${builderProfile.return_restocking_fee_percent}%`);
  if (builderProfile?.return_shipping_paid_by) row("Return Shipping Paid By", builderProfile.return_shipping_paid_by);
  if (builderProfile?.return_policy) bodyText(builderProfile.return_policy, 2);

  // Shipping
  checkPage(10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(47, 62, 85);
  doc.text("Shipping Policy", margin, y);
  y += 5;
  if (builderProfile?.shipping_timeline) row("Timeline", builderProfile.shipping_timeline);
  if (builderProfile?.shipping_carriers?.length) row("Carriers", builderProfile.shipping_carriers.join(", "));
  row("Insurance", builderProfile?.shipping_insurance_included || "N/A");
  if (builderProfile?.shipping_policy) bodyText(builderProfile.shipping_policy, 2);

  // Payment
  if (builderProfile?.deposit_required) {
    checkPage(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(47, 62, 85);
    doc.text("Payment Terms", margin, y);
    y += 5;
    const depositLabel = builderProfile.deposit_type === "fixed"
      ? `$${builderProfile.deposit_fixed_amount} fixed deposit`
      : `${builderProfile.deposit_percent}% deposit`;
    row("Deposit Required", depositLabel);
    if (builderProfile.payment_schedule) row("Payment Schedule", builderProfile.payment_schedule);
    if (builderProfile.payment_methods) row("Accepted Methods", builderProfile.payment_methods);
    if (builderProfile.pricing_notes) bodyText(builderProfile.pricing_notes, 2);
  }

  // ── LEGAL NOTICE ──────────────────────────────────────────────────────
  checkPage(30);
  y += 6;
  doc.setFillColor(245, 244, 240);
  const legalH = 28;
  doc.rect(margin, y, contentW, legalH, "F");
  doc.setDrawColor(210, 207, 200);
  doc.rect(margin, y, contentW, legalH);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(47, 62, 85);
  doc.text("Legal Notice", margin + 4, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  const legalText = "This Purchase Agreement is a binding document between the buyer and builder, facilitated by Stringed Collective. The terms and policies contained herein represent a snapshot of the builder's policies at the time this order was created. Stringed Collective acts as the transaction platform and is not a party to this agreement. By completing this purchase, both parties agree to the terms described above.";
  const legalLines = doc.splitTextToSize(legalText, contentW - 8);
  doc.text(legalLines, margin + 4, y);
  y += legalLines.length * 4.5 + 6;

  // ── FOOTER ────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`Stringed Collective · Purchase Agreement · ${agreementNumber} · Page ${i} of ${totalPages}`, pageW / 2, pageH - 8, { align: "center" });
  }

  return doc.output("arraybuffer");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { order_id, regenerate = false } = body;

    if (!order_id) {
      return Response.json({ error: "order_id is required" }, { status: 400 });
    }

    // Auth: must be logged in; regenerate requires admin
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (regenerate && user.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required for regeneration" }, { status: 403 });
    }

    // Load order
    const orders = await base44.asServiceRole.entities.Order.filter({ id: order_id });
    if (!orders || orders.length === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orders[0];

    // Load buyer profile
    let buyer = null;
    if (order.user_id) {
      const buyerProfiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: order.user_id });
      buyer = buyerProfiles[0] || null;
    }

    // Load builder profile
    let builderProfile = null;
    if (order.builder_id) {
      const builderProfiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: order.builder_id });
      builderProfile = builderProfiles[0] || null;
    }

    // Check for existing agreement (unless regenerating)
    const existingAgreements = await base44.asServiceRole.entities.PurchaseAgreement.filter({ order_id });
    const existingAgreement = existingAgreements[0] || null;

    if (existingAgreement && !regenerate) {
      return Response.json({
        success: true,
        agreement_id: existingAgreement.id,
        pdf_url: existingAgreement.pdf_url,
        agreement_number: existingAgreement.agreement_number,
        message: "Agreement already exists",
      });
    }

    // Build snapshots (always from live data if new; preserve originals on regenerate)
    const buyerSnapshot = regenerate && existingAgreement?.buyer_snapshot_json
      ? existingAgreement.buyer_snapshot_json
      : {
          user_id: order.user_id,
          name: order.buyer_name,
          email: order.buyer_email,
          shipping_address: order.shipping_address,
          first_name: buyer?.first_name,
          last_name: buyer?.last_name,
          phone: buyer?.phone,
        };

    const builderSnapshot = regenerate && existingAgreement?.builder_snapshot_json
      ? existingAgreement.builder_snapshot_json
      : {
          user_id: order.builder_id,
          name: order.builder_name,
          business_name: builderProfile?.business_name,
          location: builderProfile?.location,
          business_city: builderProfile?.business_city,
          business_state: builderProfile?.business_state,
          business_country: builderProfile?.business_country,
          website_url: builderProfile?.website_url,
          email: builderProfile?.email,
          phone: builderProfile?.phone,
          slug: builderProfile?.slug,
        };

    const listingSnapshot = regenerate && existingAgreement?.listing_snapshot_json
      ? existingAgreement.listing_snapshot_json
      : (order.items || []);

    const pricingSnapshot = regenerate && existingAgreement?.pricing_snapshot_json
      ? existingAgreement.pricing_snapshot_json
      : {
          total_amount: order.total_amount,
          deposit_amount: order.deposit_amount,
          order_type: order.order_type,
          stripe_session_id: order.stripe_session_id,
          build_start_date: order.build_start_date,
          estimated_build_completion_date: order.estimated_build_completion_date,
        };

    const builderTermsSnapshot = regenerate && existingAgreement?.builder_terms_snapshot_json
      ? existingAgreement.builder_terms_snapshot_json
      : {
          deposit_required: builderProfile?.deposit_required,
          deposit_type: builderProfile?.deposit_type,
          deposit_percent: builderProfile?.deposit_percent,
          deposit_fixed_amount: builderProfile?.deposit_fixed_amount,
          deposit_refundable: builderProfile?.deposit_refundable,
          payment_schedule: builderProfile?.payment_schedule,
          payment_methods: builderProfile?.payment_methods,
          pricing_notes: builderProfile?.pricing_notes,
          warranty_policy: builderProfile?.warranty_policy,
          warranty_duration: builderProfile?.warranty_duration,
          warranty_coverage: builderProfile?.warranty_coverage,
          warranty_exclusions: builderProfile?.warranty_exclusions,
          warranty_claim_process: builderProfile?.warranty_claim_process,
          return_policy: builderProfile?.return_policy,
          returns_accepted: builderProfile?.returns_accepted,
          return_window_days: builderProfile?.return_window_days,
          return_condition: builderProfile?.return_condition,
          return_restocking_fee_percent: builderProfile?.return_restocking_fee_percent,
          return_shipping_paid_by: builderProfile?.return_shipping_paid_by,
          shipping_policy: builderProfile?.shipping_policy,
          ships_domestically: builderProfile?.ships_domestically,
          ships_internationally: builderProfile?.ships_internationally,
          shipping_carriers: builderProfile?.shipping_carriers,
          shipping_insurance_included: builderProfile?.shipping_insurance_included,
          shipping_timeline: builderProfile?.shipping_timeline,
          typical_build_time: builderProfile?.typical_build_time,
        };

    // Generate PDF
    const agreementNumber = existingAgreement?.agreement_number || generateAgreementNumber(order_id);
    const generatedAt = new Date().toISOString();

    // Reconstruct builderProfile from snapshot for regeneration
    const profileForPdf = regenerate && existingAgreement
      ? existingAgreement.builder_terms_snapshot_json
      : builderProfile;

    const pdfBytes = buildPdf({
      order: { ...order, ...pricingSnapshot },
      buyer: buyerSnapshot,
      builder: builderSnapshot,
      builderProfile: { ...profileForPdf, ...builderSnapshot },
      agreementNumber,
      generatedAt,
    });

    // Upload PDF
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", blob, `purchase-agreement-${agreementNumber}.pdf`);

    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: blob });
    const pdfUrl = uploadResult.file_url;

    // Save or update PurchaseAgreement entity
    const agreementData = {
      order_id,
      buyer_user_id: order.user_id,
      builder_user_id: order.builder_id,
      store_id: builderProfile?.id || null,
      agreement_number: agreementNumber,
      document_type: "PurchaseAgreement",
      order_type: order.order_type,
      buyer_snapshot_json: buyerSnapshot,
      builder_snapshot_json: builderSnapshot,
      listing_snapshot_json: listingSnapshot,
      pricing_snapshot_json: pricingSnapshot,
      builder_terms_snapshot_json: builderTermsSnapshot,
      pdf_url: pdfUrl,
      generated_at: generatedAt,
      version_number: AGREEMENT_VERSION,
      status: regenerate ? "regenerated" : "generated",
    };

    let savedAgreement;
    if (existingAgreement && regenerate) {
      savedAgreement = await base44.asServiceRole.entities.PurchaseAgreement.update(existingAgreement.id, {
        pdf_url: pdfUrl,
        generated_at: generatedAt,
        status: "regenerated",
      });
    } else {
      savedAgreement = await base44.asServiceRole.entities.PurchaseAgreement.create(agreementData);
    }

    // Update the Order with the pdf_url reference
    await base44.asServiceRole.entities.Order.update(order_id, {
      purchase_agreement_signed: true,
    });

    // Send confirmation email with PDF link
    if (!regenerate && order.buyer_email) {
      const builderDisplay = builderSnapshot.business_name || builderSnapshot.name || "your builder";
      const itemList = listingSnapshot.map(i => `• ${i.product_name || "Instrument"} — ${formatCurrency(i.product_price)}`).join("\n");
      const emailBody = `
Hello ${buyerSnapshot.name || buyerSnapshot.email},

Thank you for your purchase through Stringed Collective! Your order has been confirmed and your Purchase Agreement has been generated.

ORDER DETAILS
─────────────────────────────────────
Order ID: ${order.id}
Agreement #: ${agreementNumber}
Order Type: ${order.order_type === "custom" ? "Custom Build" : "Stock Build"}
Builder: ${builderDisplay}

ITEMS PURCHASED
─────────────────────────────────────
${itemList}

TOTAL: ${formatCurrency(order.total_amount)}
${order.deposit_amount ? `Deposit Paid: ${formatCurrency(order.deposit_amount)}` : ""}

DOWNLOAD YOUR PURCHASE AGREEMENT
─────────────────────────────────────
Your Purchase Agreement is available here:
${pdfUrl}

This document contains the full terms of your purchase, including the builder's warranty, return, and shipping policies that were in effect at the time of your order.

If you have any questions, you can reply to this email or contact your builder through the Stringed Collective platform.

Thank you for supporting independent luthiers,
The Stringed Collective Team
      `.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.buyer_email,
        subject: `Your Purchase Agreement — Order #${agreementNumber}`,
        body: emailBody,
      });
    }

    return Response.json({
      success: true,
      agreement_id: savedAgreement.id || existingAgreement?.id,
      agreement_number: agreementNumber,
      pdf_url: pdfUrl,
      status: regenerate ? "regenerated" : "generated",
    });

  } catch (error) {
    console.error("generatePurchaseAgreement error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});