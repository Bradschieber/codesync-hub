import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { builder_id } = await req.json();
    if (!builder_id) {
      return Response.json({ error: 'builder_id is required' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    // Fetch the builder profile first to get their name for cross-referencing
    const builderProfiles = await sr.entities.UserProfile.filter({ id: builder_id });
    const builderProfile = builderProfiles[0];
    const builderName = builderProfile?.business_name || builderProfile?.display_name;

    // Fetch all associated data - use both builder_id and builder_name to catch any mismatched records
    const [productsByBuilderId, productsByBuilderName, listings, posts, reviews, references] = await Promise.all([
      sr.entities.Product.filter({ builder_id }),
      builderName ? sr.entities.Product.filter({ builder_name: builderName }) : Promise.resolve([]),
      sr.entities.CustomBuildListing.filter({ builder_id }),
      sr.entities.WorkshopPost.filter({ builder_id }),
      sr.entities.BuilderReview.filter({ builder_id }),
      sr.entities.BuilderReference.filter({ builder_id }),
    ]);

    // Deduplicate products by id
    const productMap = new Map();
    [...productsByBuilderId, ...productsByBuilderName].forEach(p => productMap.set(p.id, p));
    const products = Array.from(productMap.values());

    await Promise.all([
      ...products.map(r => sr.entities.Product.delete(r.id)),
      ...listings.map(r => sr.entities.CustomBuildListing.delete(r.id)),
      ...posts.map(r => sr.entities.WorkshopPost.delete(r.id)),
      ...reviews.map(r => sr.entities.BuilderReview.delete(r.id)),
      ...references.map(r => sr.entities.BuilderReference.delete(r.id)),
    ]);

    // Delete the builder profile itself
    await sr.entities.UserProfile.delete(builder_id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});