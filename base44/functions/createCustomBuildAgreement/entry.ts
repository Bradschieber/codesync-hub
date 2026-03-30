import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await req.json();
    if (!orderId) return Response.json({ error: 'orderId is required' }, { status: 400 });

    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Order not found' }, { status: 404 });
    const order = orders[0];

    if (order.order_type !== 'custom') {
      return Response.json({ error: 'This endpoint only handles custom build orders' }, { status: 400 });
    }
    if (!['agreement_pending', 'pending_payment'].includes(order.current_status)) {
      return Response.json({ error: `Order not eligible for agreement acceptance, current: ${order.current_status}` }, { status: 400 });
    }

    // Fetch builder profile for policy snapshot
    const builderProfiles = await base44.asServiceRole.entities.UserProfile.filter({ id: order.builder_id });
    if (!builderProfiles.length) return Response.json({ error: 'Builder profile not found' }, { status: 404 });
    const builder = builderProfiles[0];

    // Enforce payout readiness
    if (!builder.stripe_payouts_enabled || builder.stripe_onboarding_status !== 'complete') {
      return Response.json({ error: 'Builder Stripe account is not ready to accept payments' }, { status: 400 });
    }

    // Determine if first custom build
    const existingCustomOrders = await base44.asServiceRole.entities.Order.filter({
      builder_id: order.builder_id,
      order_type: 'custom',
    });
    const completedCustomOrders = existingCustomOrders.filter(o =>
      o.id !== order.id &&
      ['deposit_paid', 'deposit_paid_pending_admin_release', 'build_authorized', 'build_in_progress',
       'build_complete', 'final_payment_paid', 'shipment_verified', 'delivered'].includes(o.current_status)
    );
    const isFirstCustomBuild = completedCustomOrders.length === 0;

    // Create PolicySnapshot
    const policySnapshot = await base44.asServiceRole.entities.PolicySnapshot.create({
      order_id: order.id,
      builder_id: order.builder_id,
      snapshot_version: '1.0',
      snapshotted_at: new Date().toISOString(),
      snapshot_json: {
        deposit_type: builder.deposit_type,
        deposit_percent: builder.deposit_percent,
        deposit_fixed_amount: builder.deposit_fixed_amount,
        deposit_refundable: builder.deposit_refundable,
        payment_schedule: builder.payment_schedule,
        typical_build_time: builder.typical_build_time,
        return_policy: builder.return_policy,
        returns_accepted: builder.returns_accepted,
        return_window_days: builder.return_window_days,
        return_condition: builder.return_condition,
        return_restocking_fee_percent: builder.return_restocking_fee_percent,
        return_shipping_paid_by: builder.return_shipping_paid_by,
        warranty_policy: builder.warranty_policy,
        warranty_duration: builder.warranty_duration,
        warranty_coverage: builder.warranty_coverage,
        warranty_exclusions: builder.warranty_exclusions,
        warranty_claim_process: builder.warranty_claim_process,
        shipping_policy: builder.shipping_policy,
        ships_domestically: builder.ships_domestically,
        ships_internationally: builder.ships_internationally,
        shipping_carriers: builder.shipping_carriers,
        shipping_insurance_included: builder.shipping_insurance_included,
        shipping_packaging: builder.shipping_packaging,
        shipping_timeline: builder.shipping_timeline,
      },
    });

    // Calculate deposit amount from policy
    const grossAmount = order.total_gross_amount || order.total_amount || 0;
    let depositAmount = 0;
    if (builder.deposit_required) {
      if (builder.deposit_type === 'percent') {
        depositAmount = Math.round(grossAmount * (builder.deposit_percent / 100) * 100) / 100;
      } else if (builder.deposit_type === 'fixed') {
        depositAmount = builder.deposit_fixed_amount || 0;
      }
    }
    const finalBalance = grossAmount - depositAmount;

    // Create AgreementSnapshot
    const agreementSnapshot = await base44.asServiceRole.entities.AgreementSnapshot.create({
      order_id: order.id,
      builder_id: order.builder_id,
      buyer_id: user.id,
      order_type: 'custom',
      snapshot_version: '1.0',
      snapshotted_at: new Date().toISOString(),
      listing_snapshot_json: order.items || [],
      specifications_snapshot_json: order.custom_build_specs || {},
      pricing_snapshot_json: {
        gross_amount: grossAmount,
        deposit_amount: depositAmount,
        final_balance_amount: finalBalance,
        platform_fee_percent: 0.05,
        deposit_type: builder.deposit_type,
        deposit_percent: builder.deposit_percent,
      },
      buyer_info_snapshot_json: {
        buyer_id: user.id,
        buyer_email: user.email,
        buyer_name: user.full_name,
        shipping_address: order.shipping_address,
      },
      builder_info_snapshot_json: {
        builder_id: builder.id,
        business_name: builder.business_name,
        display_name: builder.display_name,
        location: builder.location,
        stripe_account_id: builder.stripe_account_id,
      },
    });

    // Update order
    await base44.asServiceRole.entities.Order.update(order.id, {
      current_status: 'agreement_accepted',
      payment_stage: 'awaiting_deposit',
      purchase_agreement_signed: true,
      agreement_accepted_at: new Date().toISOString(),
      policy_snapshot_id: policySnapshot.id,
      agreement_snapshot_id: agreementSnapshot.id,
      deposit_amount: depositAmount,
      final_balance_amount: finalBalance,
      is_first_custom_build: isFirstCustomBuild,
      stripe_account_id_destination: builder.stripe_account_id,
    });

    await base44.asServiceRole.entities.AuditLog.create({
      event_type: 'CUSTOM_BUILD_AGREEMENT_ACCEPTED',
      entity_type: 'Order',
      entity_id: order.id,
      order_id: order.id,
      actor_user_id: user.id,
      actor_role: 'buyer',
      details_json: {
        policy_snapshot_id: policySnapshot.id,
        agreement_snapshot_id: agreementSnapshot.id,
        deposit_amount: depositAmount,
        final_balance: finalBalance,
        is_first_custom_build: isFirstCustomBuild,
      },
    });

    return Response.json({
      success: true,
      policySnapshotId: policySnapshot.id,
      agreementSnapshotId: agreementSnapshot.id,
      depositAmount,
      finalBalance,
      isFirstCustomBuild,
    });

  } catch (error) {
    console.error('createCustomBuildAgreement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});