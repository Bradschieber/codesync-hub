import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PADDING_MAP = { tight: 0.05, balanced: 0.15, generous: 0.25 };
const SHADOW_MAP = { none: false, soft: true, medium: true };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id } = await req.json();
    if (!product_id) {
      return Response.json({ error: 'product_id is required' }, { status: 400 });
    }

    // Fetch product
    const products = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    const product = products[0];
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    // Only the product owner or admin can trigger processing
    // builder_id is the UserProfile ID, so we check against the profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
    const userProfileId = profiles[0]?.id;
    if (product.builder_id !== userProfileId && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sourceImageUrl = product.original_hero_image_url || product.image_urls?.[0];
    if (!sourceImageUrl) {
      return Response.json({ error: 'No source image available for processing' }, { status: 400 });
    }

    // Fetch admin config
    const configs = await base44.asServiceRole.entities.MarketplaceImageConfig.filter({ config_key: 'default' });
    const config = configs[0] || {};

    const bgColor = config.background_color || '#F7F5F0';
    const paddingPreset = config.padding_preset || 'balanced';
    const shadowMode = config.shadow_mode || 'soft';
    const outputSize = config.output_size || 2000;
    const outputFormat = config.output_format || 'png';

    const padding = PADDING_MAP[paddingPreset] ?? 0.15;
    const shadow = SHADOW_MAP[shadowMode] ?? true;

    // Mark as processing
    await base44.asServiceRole.entities.Product.update(product_id, {
      hero_processing_status: 'processing',
      processing_error_message: null,
    });

    // Build template version snapshot
    const templateVersion = `bg:${bgColor}_shadow:${shadowMode}_pad:${paddingPreset}_size:${outputSize}`;

    // Call Photoroom API
    const photoroomApiKey = Deno.env.get('PHOTOROOM_API_KEY');
    if (!photoroomApiKey) {
      throw new Error('PHOTOROOM_API_KEY is not set');
    }

    // Fetch the source image as a blob
    const imageResponse = await fetch(sourceImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch source image: ${imageResponse.status}`);
    }
    const imageBlob = await imageResponse.blob();

    // Build Photoroom request
    const formData = new FormData();
    formData.append('image_file', imageBlob, 'hero.jpg');
    formData.append('bg_color', bgColor);
    formData.append('output_type', 'rgba');
    formData.append('padding', String(padding));
    if (shadow) {
      formData.append('shadow_mode', shadowMode === 'medium' ? 'ai.hard' : 'ai.soft');
    }
    formData.append('size', `${outputSize}x${outputSize}`);
    formData.append('format', outputFormat);

    const photoroomRes = await fetch('https://sdk.photoroom.com/v1/segment', {
      method: 'POST',
      headers: {
        'x-api-key': photoroomApiKey,
      },
      body: formData,
    });

    if (!photoroomRes.ok) {
      const errText = await photoroomRes.text();
      throw new Error(`Photoroom API error ${photoroomRes.status}: ${errText}`);
    }

    const processedBlob = await photoroomRes.blob();

    // Upload processed image to Base44 storage
    const uploadFormData = new FormData();
    uploadFormData.append('file', processedBlob, `processed_hero_${product_id}.${outputFormat}`);

    const uploadFile = new File([processedBlob], `processed_hero_${product_id}.${outputFormat}`, { type: processedBlob.type });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file: uploadFile });

    // Update product with processed image
    await base44.asServiceRole.entities.Product.update(product_id, {
      processed_hero_image_url: file_url,
      hero_processing_status: 'preview_ready',
      processing_template_version: templateVersion,
      processed_generated_at: new Date().toISOString(),
      builder_approved_marketplace_hero: false,
      listing_visibility_state: 'limited_visibility',
      // Set original_hero_image_url if not already set
      ...(!product.original_hero_image_url ? { original_hero_image_url: sourceImageUrl } : {}),
    });

    return Response.json({
      success: true,
      processed_hero_image_url: file_url,
      template_version: templateVersion,
    });

  } catch (error) {
    console.error('processMarketplaceHero error:', error);

    // Try to mark the product as failed
    try {
      const base44 = createClientFromRequest(req);
      const { product_id } = await req.clone().json().catch(() => ({}));
      if (product_id) {
        await base44.asServiceRole.entities.Product.update(product_id, {
          hero_processing_status: 'failed',
          processing_error_message: error.message,
        });
      }
    } catch {}

    return Response.json({ error: error.message }, { status: 500 });
  }
});