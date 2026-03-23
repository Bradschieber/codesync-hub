import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * Entity automation handler — triggers on Order create and update.
 * - Stock builds: trigger on create (order_type === "stock")
 * - Custom builds: trigger on update when payment_stage changes to "deposit_paid"
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data, old_data } = payload;
    const order = data;

    if (!order) {
      return Response.json({ skipped: true, reason: "No order data in payload" });
    }

    const orderId = event?.entity_id || order?.id;
    if (!orderId) {
      return Response.json({ skipped: true, reason: "No order ID" });
    }

    let shouldGenerate = false;
    let reason = "";

    if (event.type === "create" && order.order_type === "stock") {
      shouldGenerate = true;
      reason = "Stock build order created";
    } else if (event.type === "update" && order.order_type === "custom") {
      // Trigger when payment_stage transitions to deposit_paid
      const wasDepositPaid = old_data?.payment_stage === "deposit_paid";
      const isNowDepositPaid = order.payment_stage === "deposit_paid";
      if (!wasDepositPaid && isNowDepositPaid) {
        shouldGenerate = true;
        reason = "Custom build deposit paid";
      }
    }

    if (!shouldGenerate) {
      return Response.json({ skipped: true, reason: "Trigger condition not met" });
    }

    // Check if agreement already exists
    const existing = await base44.asServiceRole.entities.PurchaseAgreement.filter({ order_id: orderId });
    if (existing && existing.length > 0) {
      return Response.json({ skipped: true, reason: "Agreement already exists for this order" });
    }

    console.log(`Generating Purchase Agreement for order ${orderId}: ${reason}`);

    // Invoke the PDF generation function as service role
    const result = await base44.asServiceRole.functions.invoke("generatePurchaseAgreement", {
      order_id: orderId,
      regenerate: false,
    });

    console.log("Purchase Agreement generation result:", JSON.stringify(result));

    return Response.json({ success: true, reason, result });

  } catch (error) {
    console.error("onOrderCreated automation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});