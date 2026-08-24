import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Mail, Phone, MapPin, Globe, Music, Clock, DollarSign, Shield, Truck, Calendar, ExternalLink, Pencil } from "lucide-react";
import { normalizeSocialUrl } from "@/lib/socialLinks";
import BuilderEditForm from "./BuilderEditForm";

const NAVY = "#2F3E55";
const LABEL = "#7A7A7A";
const VALUE = "#1A1A1A";
const SUBTLE = "#5A5A5A";

function Field({ label, value }) {
  if (!value || (typeof value === "string" && !value.trim())) return null;
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: LABEL }}>{label}</dt>
      <dd className="text-sm" style={{ color: VALUE }}>{value}</dd>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="border-b px-6 py-5" style={{ borderColor: "#F0EDE8" }}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4" style={{ color: NAVY }} />
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: NAVY }}>{title}</h3>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </dl>
    </div>
  );
}

function SocialLink({ url, label, platform }) {
  if (!url) return null;
  const normalizedUrl = normalizeSocialUrl(url, platform);
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: LABEL }}>{label}</dt>
      <dd>
        <a href={normalizedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm break-all hover:underline" style={{ color: NAVY }}>
          {url} <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      </dd>
    </div>
  );
}

export default function BuilderDetailDrawer({ builderId, onClose }) {
  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!builderId) return;
    setLoading(true);
    setIsEditing(false);
    base44.entities.UserProfile.get(builderId)
      .then(setBuilder)
      .catch(() => setBuilder(null))
      .finally(() => setLoading(false));
  }, [builderId]);

  if (!builderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: NAVY, borderTopColor: "transparent" }} />
          </div>
        ) : !builder ? (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: LABEL }}>Builder not found.</div>
        ) : isEditing ? (
          <BuilderEditForm
            builder={builder}
            onSaved={(updated) => { setBuilder(updated); setIsEditing(false); }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "#E0DDD8" }}>
              <div className="flex items-center gap-3">
                {builder.logo_url ? (
                  <img src={builder.logo_url} className="w-10 h-10 object-cover" alt="" />
                ) : builder.avatar_url ? (
                  <img src={builder.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                ) : null}
                <div>
                  <h2 className="text-lg font-bold" style={{ color: VALUE }}>{builder.business_name || builder.display_name || "Unnamed Builder"}</h2>
                  {builder.tag_line && <p className="text-xs" style={{ color: SUBTLE }}>{builder.tag_line}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors hover:opacity-90"
                    style={{ backgroundColor: NAVY }}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" style={{ color: LABEL }} />
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 px-6 py-3 border-b" style={{ borderColor: "#F0EDE8" }}>
              {builder.is_approved && <span className="text-xs font-semibold px-2 py-0.5" style={{ backgroundColor: "#E8F5E9", color: "#27AE60" }}>Approved</span>}
              {!builder.is_approved && <span className="text-xs font-semibold px-2 py-0.5" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>Pending Approval</span>}
              {builder.is_verified && <span className="text-xs font-semibold px-2 py-0.5" style={{ backgroundColor: "#E8F5E9", color: "#27AE60" }}>Verified</span>}
              {builder.founding_builder && <span className="text-xs font-semibold px-2 py-0.5" style={{ backgroundColor: "#F9E5E8", color: "#7A1526" }}>Founding</span>}
              {builder.is_seller && <span className="text-xs font-semibold px-2 py-0.5" style={{ backgroundColor: "#EEF1F7", color: NAVY }}>Seller</span>}
              <span className="text-xs px-2 py-0.5" style={{ backgroundColor: "#F5F3F0", color: SUBTLE }}>
                Joined {new Date(builder.created_date).toLocaleDateString()}
              </span>
            </div>

            {/* Contact & Identity */}
            <Section title="Contact Information" icon={Mail}>
              <Field label="Email" value={builder.email} />
              <Field label="Phone" value={builder.phone} />
              <Field label="Display Name" value={builder.display_name} />
              <Field label="First Name" value={builder.first_name} />
              <Field label="Last Name" value={builder.last_name} />
              <Field label="Bio" value={builder.bio} />
            </Section>

            {/* Business Details */}
            <Section title="Business Details" icon={DollarSign}>
              <Field label="Business Name" value={builder.business_name} />
              <Field label="Slug" value={builder.slug} />
              <Field label="Years of Experience" value={builder.years_experience != null ? `${builder.years_experience} years` : null} />
              <Field label="Total Instruments Built" value={builder.total_instruments_built != null ? builder.total_instruments_built : null} />
              <Field label="Instruments Per Year" value={builder.instruments_per_year != null ? builder.instruments_per_year : null} />
              <Field label="Typical Build Time" value={builder.typical_build_time} />
              <Field label="Offers Stock Builds" value={builder.offers_stock_builds ? "Yes" : null} />
              <Field label="Offers Custom Builds" value={builder.offers_custom_builds ? "Yes" : null} />
              <Field label="Custom Build Description" value={builder.custom_build_description} />
            </Section>

            {/* Instrument Types */}
            {builder.instrument_types_built?.length > 0 && (
              <Section title="Instrument Types Built" icon={Music}>
                <div className="flex flex-wrap gap-2">
                  {builder.instrument_types_built.map((inst, i) => (
                    <span key={i} className="text-xs px-2 py-1" style={{ backgroundColor: "#EEF1F7", color: NAVY }}>
                      {inst.type === "Other" ? inst.other_description || "Other" : inst.type}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Specialties */}
            {builder.specialties?.length > 0 && (
              <Section title="Specialties" icon={Music}>
                <div className="flex flex-wrap gap-2">
                  {builder.specialties.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-1" style={{ backgroundColor: "#F5F3F0", color: SUBTLE }}>{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Musical Influences */}
            {(builder.musical_influences_loves || builder.musical_influences_artists || builder.musical_influences_in_builds) && (
              <Section title="Musical Influences" icon={Music}>
                <Field label="Music They Love" value={builder.musical_influences_loves} />
                <Field label="Artists & Records" value={builder.musical_influences_artists} />
                <Field label="How It Shows In Their Builds" value={builder.musical_influences_in_builds} />
              </Section>
            )}

            {/* Brand Story */}
            {builder.brand_story && (
              <Section title="Brand Story" icon={Music}>
                <p className="text-sm whitespace-pre-wrap" style={{ color: SUBTLE }}>{builder.brand_story}</p>
              </Section>
            )}

            {/* Location */}
            <Section title="Location" icon={MapPin}>
              <Field label="Location (Display)" value={builder.location} />
              <Field label="Business Address" value={[builder.business_address_1, builder.business_address_2].filter(Boolean).join(", ")} />
              <Field label="City" value={builder.business_city} />
              <Field label="State / Province" value={builder.business_state} />
              <Field label="Postal Code" value={builder.business_postal_code} />
              <Field label="Country" value={builder.business_country} />
            </Section>

            {/* Shipping Address */}
            {(builder.shipping_address_1 || builder.shipping_city) && (
              <Section title="Shipping Address" icon={Truck}>
                <Field label="Address" value={[builder.shipping_address_1, builder.shipping_address_2].filter(Boolean).join(", ")} />
                <Field label="City" value={builder.shipping_city} />
                <Field label="State / Province" value={builder.shipping_state} />
                <Field label="Postal Code" value={builder.shipping_postal_code} />
                <Field label="Country" value={builder.shipping_country} />
              </Section>
            )}

            {/* Web & Social */}
            {(builder.website_url || builder.facebook_url || builder.instagram_url || builder.x_url) && (
              <Section title="Website & Social" icon={Globe}>
                <SocialLink url={builder.website_url} label="Website" />
                <SocialLink url={builder.facebook_url} label="Facebook" platform="facebook" />
                <SocialLink url={builder.instagram_url} label="Instagram" platform="instagram" />
                <SocialLink url={builder.x_url} label="X (Twitter)" platform="x" />
              </Section>
            )}

            {/* Payment & Deposits */}
            <Section title="Payment & Deposits" icon={DollarSign}>
              <Field label="Deposit Required" value={builder.deposit_required ? "Yes" : "No"} />
              {builder.deposit_required && (
                <>
                  <Field label="Deposit Type" value={builder.deposit_type === "percent" ? "Percentage" : "Fixed Amount"} />
                  {builder.deposit_type === "percent" && <Field label="Deposit Percentage" value={builder.deposit_percent != null ? `${builder.deposit_percent}%` : null} />}
                  {builder.deposit_type === "fixed" && <Field label="Deposit Amount" value={builder.deposit_fixed_amount != null ? `$${builder.deposit_fixed_amount}` : null} />}
                  <Field label="Deposit Refundable" value={builder.deposit_refundable === "yes" ? "Yes" : builder.deposit_refundable === "partial" ? "Partial" : builder.deposit_refundable === "no" ? "No" : null} />
                </>
              )}
              <Field label="Payment Schedule" value={builder.payment_schedule} />
              <Field label="Payment Methods" value={builder.payment_methods} />
              <Field label="Pricing Notes" value={builder.pricing_notes} />
            </Section>

            {/* Warranty */}
            <Section title="Warranty Policy" icon={Shield}>
              <Field label="Warranty Policy" value={builder.warranty_policy} />
              <Field label="Warranty Duration" value={builder.warranty_duration} />
              {builder.warranty_coverage?.length > 0 && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: LABEL }}>Coverage Items</dt>
                  <dd className="text-sm space-y-1" style={{ color: VALUE }}>
                    {builder.warranty_coverage.map((c, i) => (
                      <div key={i}>{c.label}{c.duration ? ` - ${c.duration}` : ""}</div>
                    ))}
                  </dd>
                </div>
              )}
              {builder.warranty_exclusions?.length > 0 && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: LABEL }}>Exclusions</dt>
                  <dd className="text-sm space-y-1" style={{ color: VALUE }}>
                    {builder.warranty_exclusions.map((e, i) => <div key={i}>- {e}</div>)}
                  </dd>
                </div>
              )}
              <Field label="Claim Process" value={builder.warranty_claim_process} />
            </Section>

            {/* Returns */}
            <Section title="Return Policy" icon={Shield}>
              <Field label="Returns Accepted" value={builder.returns_accepted === "yes" ? "Yes" : builder.returns_accepted === "no" ? "No" : builder.returns_accepted === "case_by_case" ? "Case by Case" : null} />
              <Field label="Return Window" value={builder.return_window_days != null ? `${builder.return_window_days} days` : null} />
              <Field label="Return Condition" value={builder.return_condition} />
              <Field label="Restocking Fee" value={builder.return_restocking_fee_percent != null ? `${builder.return_restocking_fee_percent}%` : null} />
              <Field label="Return Shipping Paid By" value={builder.return_shipping_paid_by} />
              <Field label="Return Policy Details" value={builder.return_policy} />
            </Section>

            {/* Shipping */}
            <Section title="Shipping Policy" icon={Truck}>
              <Field label="Ships Domestically" value={builder.ships_domestically ? "Yes" : "No"} />
              <Field label="Ships Internationally" value={builder.ships_internationally ? "Yes" : "No"} />
              {builder.shipping_carriers?.length > 0 && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: LABEL }}>Carriers</dt>
                  <dd className="text-sm" style={{ color: VALUE }}>{builder.shipping_carriers.join(", ")}</dd>
                </div>
              )}
              <Field label="Insurance Included" value={builder.shipping_insurance_included === "yes" ? "Yes" : builder.shipping_insurance_included === "no" ? "No" : builder.shipping_insurance_included === "optional" ? "Optional" : null} />
              <Field label="Packaging" value={builder.shipping_packaging} />
              <Field label="Timeline" value={builder.shipping_timeline} />
              <Field label="Shipping Policy Details" value={builder.shipping_policy} />
            </Section>

            {/* Notification Preferences */}
            <Section title="Notification Preferences" icon={Mail}>
              <Field label="Email Notifications" value={builder.notify_email ? "Enabled" : "Disabled"} />
              <Field label="SMS Notifications" value={builder.notify_sms ? "Enabled" : "Disabled"} />
              <Field label="Notification Phone" value={builder.notification_phone} />
            </Section>

            {/* Stripe Account */}
            <Section title="Stripe Account" icon={DollarSign}>
              <Field label="Stripe Account ID" value={builder.stripe_account_id} />
              <Field label="Onboarding Status" value={builder.stripe_onboarding_status?.replace(/_/g, " ")} />
              <Field label="Payouts Enabled" value={builder.stripe_payouts_enabled ? "Yes" : "No"} />
              <Field label="Charges Enabled" value={builder.stripe_charges_enabled ? "Yes" : "No"} />
              <Field label="First Sale Completed" value={builder.is_first_sale_completed ? "Yes" : "No"} />
              <Field label="Last Successful Sale" value={builder.last_successful_sale_date} />
            </Section>

            {/* Storefront Settings */}
            <Section title="Storefront Settings" icon={Globe}>
              <Field label="Storefront Layout" value={builder.storefront_layout} />
              <Field label="Color Scheme" value={builder.storefront_color_scheme?.replace(/-/g, " ")} />
              <Field label="Featured Builder" value={builder.is_featured ? "Yes" : "No"} />
              <Field label="Featured Until" value={builder.featured_until_date} />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}