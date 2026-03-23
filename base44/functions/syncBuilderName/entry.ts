import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { data, old_data } = body;

    // Only proceed if business_name or display_name changed
    const newName = data?.business_name || data?.display_name;
    const oldName = old_data?.business_name || old_data?.display_name;

    if (!newName || newName === oldName) {
      return Response.json({ message: "No name change detected, skipping sync." });
    }

    const builderId = data?.id;
    if (!builderId) {
      return Response.json({ error: "No builder id found in payload" }, { status: 400 });
    }

    // Find all products by this builder
    const products = await base44.asServiceRole.entities.Product.filter({ builder_id: builderId });

    // Update each product's builder_name
    await Promise.all(
      products.map(p => base44.asServiceRole.entities.Product.update(p.id, { builder_name: newName }))
    );

    return Response.json({ message: `Synced builder_name to "${newName}" for ${products.length} product(s).` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});