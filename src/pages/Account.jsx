import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BuyerAccountView from "../components/account/BuyerAccountView";
import BuilderAccountView from "../components/account/BuilderAccountView";

const NAVY = "#1B2B4B";

export default function Account() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForm(profiles[0]);
      } else {
        setForm({ first_name: "", last_name: "", display_name: u.full_name || "", location: "", phone: "" });
      }
    } catch {
      base44.auth.redirectToLogin();
    }
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, form);
    } else {
      const created = await base44.entities.UserProfile.create({ ...form, user_id: user.id, email: user.email });
      setProfile(created);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin w-7 h-7 border-2 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
    </div>
  );

  const isBuilder = profile?.account === "seller" || profile?.account === "admin";
  const sharedProps = { user, profile, form, setForm, saving, saved, onSave: handleSave };

  return isBuilder
    ? <BuilderAccountView {...sharedProps} />
    : <BuyerAccountView {...sharedProps} />;
}