import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { updateId, orderId } = await req.json();

    const [updates, orders] = await Promise.all([
      base44.asServiceRole.entities.BuildUpdate.filter({ id: updateId }),
      base44.asServiceRole.entities.Order.filter({ id: orderId }),
    ]);

    const update = updates[0];
    const order = orders[0];

    if (!update || !order) {
      return Response.json({ error: "Update or order not found" }, { status: 404 });
    }

    const buyerEmail = order.buyer_email;
    const buyerName  = order.buyer_name || "there";
    const itemName   = order.items?.[0]?.product_name || "your instrument";
    const builderName = order.builder_name || "Your builder";

    if (buyerEmail) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: buyerEmail,
        subject: `${builderName} just posted a new build update on ${itemName}`,
        body: `
Hi ${buyerName},

${builderName} just shared a new progress update on your custom build:

"${update.title}"${update.description ? `\n\n${update.description}` : ""}

Log in to view the full update, including any photos or video they shared.

— Stringed Collective
        `.trim(),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});