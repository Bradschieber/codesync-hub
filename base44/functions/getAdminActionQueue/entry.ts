import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Returns bucketed admin action queues for the operations dashboard.
 * Admin-only.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const sb = base44.asServiceRole;

    const [allOrders, allTIs, allDisputes] = await Promise.all([
      sb.entities.Order.list('-created_date', 500),
      sb.entities.TransferInstruction.list('-created_date', 500),
      sb.entities.Dispute.list('-created_date', 200),
    ]);

    const activeOrders = allOrders.filter(o => o.current_status !== 'cancelled');

    // 1. Tracking submitted — needs admin verification
    const trackingQueue = activeOrders.filter(o => o.current_status === 'tracking_submitted');

    // 2. Deposit awaiting admin approval (first custom build)
    const depositApprovalQueue = activeOrders.filter(o => o.current_status === 'deposit_paid_pending_admin_release');

    // 3. Payout ready for release
    const readyTIs = allTIs.filter(ti => ti.status === 'ready_for_transfer');
    const payoutReleaseQueue = readyTIs.map(ti => {
      const order = activeOrders.find(o => o.id === ti.order_id);
      return order ? { ...order, _ti: ti } : null;
    }).filter(Boolean);

    // 4. First-sale delivery hold — shipment verified, payout held, delivery not yet confirmed
    const firstSaleHoldQueue = activeOrders.filter(o =>
      o.payout_status === 'held_first_sale' &&
      o.current_status === 'shipment_verified' &&
      !o.delivery_confirmed
    );

    // 5. Issue / dispute queue
    const issueQueue = allDisputes.filter(d =>
      ['open', 'under_review', 'awaiting_buyer', 'awaiting_builder'].includes(d.status)
    );

    // 6. Buyer default review
    const buyerDefaultQueue = activeOrders.filter(o => o.current_status === 'buyer_default_review');

    // 7. Payout failed
    const payoutFailedQueue = activeOrders.filter(o => o.payout_status === 'payout_failed');

    // 8. Recently resolved issues / refunds for awareness
    const recentResolutionQueue = allDisputes.filter(d =>
      ['resolved_buyer_favor', 'resolved_builder_favor', 'resolved_partial', 'closed'].includes(d.status) &&
      d.resolution_date &&
      new Date(d.resolution_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const summary = {
      tracking_needs_review: trackingQueue.length,
      deposit_needs_approval: depositApprovalQueue.length,
      payout_ready_for_release: payoutReleaseQueue.length,
      first_sale_awaiting_delivery: firstSaleHoldQueue.length,
      open_issues: issueQueue.length,
      buyer_default_review: buyerDefaultQueue.length,
      payout_failed: payoutFailedQueue.length,
      total_urgent: trackingQueue.length + depositApprovalQueue.length + payoutReleaseQueue.length + issueQueue.length + buyerDefaultQueue.length + payoutFailedQueue.length,
    };

    return Response.json({
      success: true,
      summary,
      queues: {
        tracking: trackingQueue.slice(0, 20),
        deposit_approval: depositApprovalQueue.slice(0, 20),
        payout_release: payoutReleaseQueue.slice(0, 20),
        first_sale_hold: firstSaleHoldQueue.slice(0, 20),
        issues: issueQueue.slice(0, 20),
        buyer_default: buyerDefaultQueue.slice(0, 10),
        payout_failed: payoutFailedQueue.slice(0, 10),
        recent_resolutions: recentResolutionQueue.slice(0, 10),
      },
    });

  } catch (error) {
    console.error('getAdminActionQueue error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});