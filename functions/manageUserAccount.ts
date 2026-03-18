import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Handles both deactivation/activation and deletion of buyer accounts
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { action, user_id, is_active } = await req.json();
    if (!user_id) {
      return Response.json({ error: 'user_id is required' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    if (action === 'delete') {
      // Delete associated UserProfile if it exists (non-builder users may still have one)
      const profiles = await sr.entities.UserProfile.filter({ user_id });
      await Promise.all(profiles.map(p => sr.entities.UserProfile.delete(p.id)));
      // Delete the user account
      await sr.entities.User.delete(user_id);
      return Response.json({ success: true });
    }

    if (action === 'toggle') {
      // Update is_active on UserProfile (if exists) or create a minimal record to track status
      const profiles = await sr.entities.UserProfile.filter({ user_id });
      if (profiles.length > 0) {
        await sr.entities.UserProfile.update(profiles[0].id, { is_active });
      }
      // Also update directly on User entity
      await sr.entities.User.update(user_id, { is_active });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action. Use "delete" or "toggle".' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});