import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

const APP_URL = "https://preview-sandbox--699b4908ac9a3afade5feb65.base44.app";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderFormId } = await req.json();
    const sb = base44.asServiceRole;

    const forms = await sb.entities.CustomBuildOrderForm.filter({ id: orderFormId });
    if (!forms.length) return Response.json({ error: 'Order form not found' }, { status: 404 });
    const form = forms[0];

    const profiles = await sb.entities.UserProfile.filter({ user_id: user.id });
    if (!profiles.length || profiles[0].id !== form.builder_id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const builder = profiles[0];

    const requests = await sb.entities.CustomBuildRequest.filter({ id: form.custom_build_request_id });
    const request = requests[0];

    // Generate PDF
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 20;

    function checkPageBreak(needed = 10) {
      if (y + needed > 270) { doc.addPage(); y = 20; }
    }

    function addLine(text, size = 10, style = 'normal', color = [30, 30, 30]) {
      checkPageBreak(size + 4);
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(String(text || ''), contentW);
      doc.text(lines, margin, y);
      y += (lines.length * (size * 0.45)) + 3;
    }

    function addSection(title) {
      checkPageBreak(14);
      y += 3;
      doc.setFillColor(240, 237, 230);
      doc.rect(margin, y - 4, contentW, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(47, 62, 85);
      doc.text(title.toUpperCase(), margin + 2, y + 0.5);
      y += 8;
    }

    function addField(label, value) {
      if (!value && value !== 0) return;
      checkPageBreak(8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(label + ':', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      const lines = doc.splitTextToSize(String(value), contentW - 40);
      doc.text(lines, margin + 38, y);
      y += (lines.length * 4.5) + 2;
    }

    // Header
    doc.setFillColor(27, 43, 75);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Stringed Collective', margin, 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Custom Build Order Form', margin, 20);
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 220);
    doc.text(`Order Form ID: ${form.id?.slice(-10).toUpperCase() || 'N/A'}  |  Version ${form.version_number || 1}  |  ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 26);
    y = 38;

    // Parties
    addSection('Order Form Details');
    addField('Builder', form.builder_name);
    addField('Buyer', form.buyer_name);
    addField('Buyer Email', form.buyer_email);
    if (form.title) addField('Title', form.title);

    // Builder Note
    if (form.builder_note) {
      addSection('Builder Note');
      addLine(form.builder_note, 10, 'normal', [60, 60, 60]);
    }

    // Build Summary
    if (form.build_summary) {
      addSection('Build Summary');
      addLine(form.build_summary, 10, 'normal', [60, 60, 60]);
    }

    // Specifications
    const specs = form.specifications || {};
    const specEntries = Object.entries(specs).filter(([k, v]) => v && !k.startsWith('other'));
    if (specEntries.length > 0) {
      addSection('Final Build Specifications');
      for (const [k, v] of specEntries) {
        const label = k.replace(/([A-Z])/g, ' $1').trim();
        addField(label, String(v));
      }
    }

    // Commercial Terms
    addSection('Commercial Terms');
    addField('Total Price', form.total_price ? `$${Number(form.total_price).toLocaleString()}` : '');
    addField('Deposit Required', form.deposit_amount ? `$${Number(form.deposit_amount).toLocaleString()}` : '');
    addField('Final Balance', form.final_balance ? `$${Number(form.final_balance).toLocaleString()}` : '');
    addField('Estimated Build Timeline', form.estimated_build_timeline);
    addField('Payment Due Window', form.payment_due_window_days ? `${form.payment_due_window_days} days` : '');
    if (form.shipping_notes) addField('Shipping Notes', form.shipping_notes);

    // Included Items
    if (form.included_items) {
      addSection('Included Items');
      addLine(form.included_items, 10, 'normal', [60, 60, 60]);
    }

    // Exclusions
    if (form.exclusions_assumptions) {
      addSection('Build Scope Notes & Assumptions');
      addLine(form.exclusions_assumptions, 10, 'normal', [60, 60, 60]);
    }

    // Reference Images (listed by caption — full images viewable on platform)
    if (form.reference_images?.length > 0) {
      addSection('Build Reference Images');
      addLine(`${form.reference_images.length} reference image(s) are included with this Order Form and viewable on the Stringed Collective platform. These are supporting visuals only.`, 9, 'italic', [80, 80, 80]);
      for (const [i, img] of form.reference_images.entries()) {
        if (img.caption) addField(`Image ${i + 1}`, img.caption);
      }
    }

    // Policy Summary
    if (form.policy_deposit_summary || form.policy_return_summary || form.policy_warranty_summary) {
      addSection('Policy Summary');
      if (form.policy_deposit_summary) addField('Deposit / Cancellation', form.policy_deposit_summary);
      if (form.policy_return_summary) addField('Return Policy', form.policy_return_summary);
      if (form.policy_warranty_summary) addField('Warranty', form.policy_warranty_summary);
    }

    // Footer notice
    checkPageBreak(20);
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    const noticeLines = doc.splitTextToSize(
      'IMPORTANT: This Custom Build Order Form is not yet an active order. A custom order is created only after buyer acceptance and completion of the purchase agreement through Stringed Collective.',
      contentW
    );
    doc.text(noticeLines, margin, y);

    // Upload PDF using File object (same pattern as generatePurchaseAgreement)
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfFile = new File([pdfArrayBuffer], 'order-form.pdf', { type: 'application/pdf' });
    const uploadResult = await sb.integrations.Core.UploadFile({ file: pdfFile });
    const pdfUrl = uploadResult.file_url;

    // Update form
    await sb.entities.CustomBuildOrderForm.update(orderFormId, {
      status: 'sent',
      pdf_url: pdfUrl,
      sent_at: new Date().toISOString(),
    });

    // Update request
    if (request) {
      await sb.entities.CustomBuildRequest.update(form.custom_build_request_id, {
        status: 'order_form_sent',
      });
    }

    // Email buyer
    const reviewUrl = `${APP_URL}/OrderFormReview?formId=${orderFormId}`;
    if (form.buyer_email) {
      await sb.integrations.Core.SendEmail({
        from_name: 'Stringed Collective',
        to: form.buyer_email,
        subject: `Your Custom Build Order Form is ready for review — ${form.builder_name}`,
        body: `
<div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #FDFBF8; color: #1B2B4B;">
  <div style="margin-bottom: 24px;">
    <span style="font-size: 1.1rem; font-weight: 700; letter-spacing: 0.02em;">Stringed</span>
    <span style="font-size: 1.1rem; font-weight: 400; letter-spacing: 0.1em;"> Collective</span>
  </div>
  <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 12px;">Your Custom Build Order Form is ready</h2>
  <p style="color: #4A5568; margin-bottom: 12px;">Hi ${form.buyer_name || 'there'},</p>
  <p style="color: #4A5568; margin-bottom: 12px;"><strong>${form.builder_name}</strong> has prepared a Custom Build Order Form for your review.</p>
  ${form.title ? `<div style="background: #F7F6F3; border: 1px solid #E3E0D8; border-radius: 8px; padding: 16px; margin-bottom: 16px;"><p style="margin: 0; font-weight: 600;">${form.title}</p></div>` : ''}
  <p style="color: #4A5568; margin-bottom: 8px;">This Order Form outlines the full build specifications, pricing, timeline, and terms. You can:</p>
  <ul style="color: #4A5568; margin-bottom: 24px; padding-left: 20px;">
    <li><strong>Accept</strong> to create your custom order and proceed to the purchase agreement</li>
    <li><strong>Request Changes</strong> to continue discussing details with the builder</li>
    <li><strong>Decline</strong> if this isn't the right fit</li>
  </ul>
  <p style="text-align: center; margin: 28px 0;">
    <a href="${reviewUrl}" style="background-color: #C57A1F; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 0.95rem; display: inline-block;">Review Order Form</a>
  </p>
  <p style="color: #9CA3AF; font-size: 0.8rem; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px;">Questions? Reply to this email or visit the Stringed Collective platform to message your builder directly.</p>
</div>`
      });
    }

    return Response.json({ success: true, pdf_url: pdfUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});