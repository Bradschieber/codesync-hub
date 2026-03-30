import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Returns a unified, chronological activity timeline for a single order.
 * Aggregates: AuditLog, Payment, TransferInstruction, PayoutHold, Dispute records.
 * Admin-only.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { orderId } = await req.json();
    if (!orderId) return Response.json({ error: 'orderId is required' }, { status: 400 });

    const sb = base44.asServiceRole;

    // Parallel fetch of all related records
    const [auditLogs, payments, transferInstructions, payoutHolds, disputes] = await Promise.all([
      sb.entities.AuditLog.filter({ order_id: orderId }, '-created_date', 200),
      sb.entities.Payment.filter({ order_id: orderId }, '-created_date', 50),
      sb.entities.TransferInstruction.filter({ order_id: orderId }, '-created_date', 50),
      sb.entities.PayoutHold.filter({ order_id: orderId }, '-created_date', 50),
      sb.entities.Dispute.filter({ order_id: orderId }, '-created_date', 20),
    ]);

    const events = [];

    // Map audit logs
    for (const log of auditLogs) {
      events.push({
        id: `audit-${log.id}`,
        timestamp: log.created_date,
        category: categoryFromEventType(log.event_type),
        event_type: log.event_type,
        actor_role: log.actor_role || 'system',
        label: labelFromEventType(log.event_type),
        detail: buildAuditDetail(log),
        raw: log.details_json || {},
        stripe_event_id: log.stripe_event_id || null,
      });
    }

    // Map payment records (supplement audit log)
    for (const p of payments) {
      events.push({
        id: `payment-${p.id}`,
        timestamp: p.paid_at || p.created_date,
        category: 'payment',
        event_type: `PAYMENT_${p.type?.toUpperCase()}_${p.status?.toUpperCase()}`,
        actor_role: 'system',
        label: `${typeLabel(p.type)} — ${p.status}`,
        detail: `$${p.amount?.toFixed(2)} gross · SC fee $${(p.platform_fee_amount || 0).toFixed(2)} · Stripe fee $${(p.stripe_fee_amount || 0).toFixed(2)} · Builder net $${(p.net_for_builder || 0).toFixed(2)}${p.refund_amount > 0 ? ` · Refunded $${p.refund_amount.toFixed(2)}` : ''}`,
        raw: { payment_id: p.id, stripe_charge_id: p.stripe_charge_id, stripe_payment_intent_id: p.stripe_payment_intent_id },
      });
    }

    // Map transfer instructions
    for (const ti of transferInstructions) {
      events.push({
        id: `ti-${ti.id}`,
        timestamp: ti.actual_release_date || ti.created_date,
        category: 'payout',
        event_type: `TRANSFER_${ti.type?.toUpperCase()}_${ti.status?.toUpperCase()}`,
        actor_role: ti.admin_user_id ? 'admin' : 'system',
        label: `Payout: ${ti.type?.replace(/_/g, ' ')} — ${ti.status?.replace(/_/g, ' ')}`,
        detail: `Net $${(ti.transfer_amount_net || 0).toFixed(2)}${ti.stripe_transfer_id ? ` · Stripe transfer: ${ti.stripe_transfer_id}` : ''}${ti.failure_reason ? ` · Failure: ${ti.failure_reason}` : ''}`,
        raw: { transfer_instruction_id: ti.id, stripe_transfer_id: ti.stripe_transfer_id },
      });
    }

    // Map payout holds
    for (const h of payoutHolds) {
      events.push({
        id: `hold-${h.id}`,
        timestamp: h.hold_start_date || h.created_date,
        category: 'hold',
        event_type: `HOLD_${h.reason?.toUpperCase()}_${h.status?.toUpperCase()}`,
        actor_role: h.admin_user_id ? 'admin' : 'system',
        label: `Hold: ${h.reason?.replace(/_/g, ' ')} — ${h.status}`,
        detail: `Amount held: $${(h.amount_held || 0).toFixed(2)}${h.actual_release_date ? ` · Released: ${h.actual_release_date.split('T')[0]}` : ''}${h.admin_notes ? ` · Notes: ${h.admin_notes}` : ''}`,
        raw: { hold_id: h.id },
      });
    }

    // Map disputes
    for (const d of disputes) {
      events.push({
        id: `dispute-${d.id}`,
        timestamp: d.created_date,
        category: 'dispute',
        event_type: `DISPUTE_${d.type?.toUpperCase()}_${d.status?.toUpperCase()}`,
        actor_role: d.buyer_id ? 'buyer' : 'system',
        label: `${d.type?.replace(/_/g, ' ')} — ${d.status?.replace(/_/g, ' ')}`,
        detail: `${d.reason || ''}${d.buyer_notes ? ` · "${d.buyer_notes.slice(0, 100)}"` : ''}${d.resolution_notes ? ` · Resolution: ${d.resolution_notes}` : ''}`,
        raw: { dispute_id: d.id, amount: d.amount_disputed },
      });
    }

    // Sort all events chronologically descending
    events.sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tb - ta;
    });

    return Response.json({ success: true, orderId, timeline: events });

  } catch (error) {
    console.error('getOrderTimeline error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function categoryFromEventType(et) {
  if (!et) return 'system';
  if (et.includes('PAYMENT') || et.includes('REFUND')) return 'payment';
  if (et.includes('TRANSFER') || et.includes('PAYOUT') || et.includes('DEPOSIT_RELEASE') || et.includes('HOLD')) return 'payout';
  if (et.includes('SHIP') || et.includes('TRACK') || et.includes('DELIVER')) return 'shipment';
  if (et.includes('DISPUTE') || et.includes('ISSUE')) return 'dispute';
  if (et.includes('AGREEMENT') || et.includes('POLICY') || et.includes('LEGAL')) return 'agreement';
  return 'system';
}

function labelFromEventType(et) {
  const labels = {
    PAYMENT_SUCCEEDED: 'Payment received',
    CUSTOM_BUILD_DEPOSIT_PAID: 'Deposit paid',
    CUSTOM_BUILD_FINAL_PAYMENT_PAID: 'Final payment received',
    TRACKING_SUBMITTED: 'Tracking submitted',
    SHIPMENT_VERIFIED: 'Shipment verified',
    SHIPMENT_VERIFICATION_REJECTED: 'Tracking rejected',
    DELIVERY_CONFIRMED: 'Delivery confirmed',
    TRANSFER_SUCCEEDED: 'Payout released',
    TRANSFER_FAILED: 'Payout failed',
    DEPOSIT_RELEASED: 'Deposit released',
    DEPOSIT_HELD: 'Deposit held',
    ISSUE_REPORTED: 'Issue reported',
    REFUND_INITIATED: 'Refund issued',
    DISPUTE_OPENED: 'Dispute opened',
    DISPUTE_UPDATED: 'Dispute updated',
    BUYER_DEFAULT_FLAGGED: 'Buyer default flagged',
    ORDER_CREATED: 'Order created',
    PURCHASE_AGREEMENT_GENERATED: 'Purchase agreement generated',
    AGREEMENT_ACCEPTED: 'Agreement accepted',
  };
  return labels[et] || et?.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase()) || et;
}

function buildAuditDetail(log) {
  const d = log.details_json || {};
  const parts = [];
  if (d.amount !== undefined) parts.push(`Amount: $${Number(d.amount).toFixed(2)}`);
  if (d.refund_amount !== undefined) parts.push(`Refund: $${Number(d.refund_amount).toFixed(2)}`);
  if (d.tracking_number) parts.push(`Tracking: ${d.tracking_number}`);
  if (d.tracking_carrier) parts.push(`Carrier: ${d.tracking_carrier}`);
  if (d.admin_notes) parts.push(`Notes: ${d.admin_notes}`);
  if (d.reason) parts.push(`Reason: ${d.reason}`);
  if (d.stripe_transfer_id) parts.push(`Transfer: ${d.stripe_transfer_id}`);
  if (d.is_first_transaction) parts.push('First transaction');
  return parts.join(' · ') || null;
}

function typeLabel(type) {
  const labels = { deposit: 'Deposit payment', final_balance: 'Final payment', full_purchase: 'Full purchase' };
  return labels[type] || type;
}