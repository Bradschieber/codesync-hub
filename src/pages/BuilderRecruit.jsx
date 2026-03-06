import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Check, ArrowRight } from "lucide-react";

const NAVY = "#1B2B4B";

export default function BuilderRecruit() {
  return (
    <div style={{ backgroundColor: "#FDFBF8" }}>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 pt-20 pb-20 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: NAVY }}>
          Stringed Collective — For Independent Builders
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6" style={{ color: "#1A1A1A" }}>
          Sell your instruments<br className="hidden sm:block" /> with confidence.
        </h1>
        <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: "#4A4A4A" }}>
          Stringed Collective connects independent builders with musicians looking for something different — with every transaction protected.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={createPageUrl("JoinBuilders")}
            className="inline-block font-semibold px-8 py-3.5 text-sm text-white transition-colors"
            style={{ backgroundColor: NAVY }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
          >
            Create Your Builder Profile
          </Link>
          <Link
            to={createPageUrl("FounderLetter")}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: NAVY }}
          >
            Read the founder's letter <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-6"><div className="border-t" style={{ borderColor: "#E0DDD8" }} /></div>

      {/* ── Why Builders Join ── */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 py-20">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-12 text-center" style={{ color: "#7A7A7A" }}>
          Why Builders Join
        </h2>
        <div className="grid sm:grid-cols-3 gap-10">
          {[
            {
              title: "Reach serious buyers",
              body: "Get in front of musicians actively searching for custom and boutique instruments.",
            },
            {
              title: "Protected transactions",
              body: "We guarantee the payment process so builders and buyers never carry the risk alone.",
            },
            {
              title: "Professional storefront",
              body: "Your work deserves a platform that inspires confidence.",
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <div className="w-8 h-0.5 mb-5" style={{ backgroundColor: NAVY }} />
              <h3 className="font-semibold text-base mb-2" style={{ color: "#1A1A1A" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5A5A5A" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-6"><div className="border-t" style={{ borderColor: "#E0DDD8" }} /></div>

      {/* ── How It Works ── */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 py-20">
        <h2 className="text-xs font-semibold uppercase tracking-widest mb-12 text-center" style={{ color: "#7A7A7A" }}>
          How It Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          {[
            { step: "01", title: "Create your builder profile" },
            { step: "02", title: "Add instruments or offer custom builds" },
            { step: "03", title: "Start connecting with buyers" },
          ].map(({ step, title }) => (
            <div key={step} className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-4" style={{ color: "#E0DDD8" }}>{step}</span>
              <p className="text-sm font-medium leading-snug" style={{ color: "#1A1A1A" }}>{title}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm mt-12" style={{ color: "#7A7A7A" }}>
          Your storefront can be set up in minutes.
        </p>
      </section>

      {/* ── Why Builders Win ── */}
      <section className="py-20" style={{ backgroundColor: "#EEF1F7" }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-10 text-center" style={{ color: "#7A7A7A" }}>
            Why Builders Win With Stringed Collective
          </h2>
          <ul className="space-y-4">
            {[
              "Dedicated storefront for your brand",
              "Protected payments and secure transactions",
              "Showcase your instruments professionally",
              "Direct connection with serious buyers",
              "Maintain full control of your brand and your builds",
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: NAVY }} strokeWidth={2.5} />
                <span className="text-sm" style={{ color: "#3A3A3A" }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Founding Builders ── */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 py-20">
        <div className="border-l-2 pl-8" style={{ borderColor: NAVY }}>
          <h2 className="text-2xl font-bold mb-5" style={{ color: "#1A1A1A" }}>Founding Builders Wanted</h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#4A4A4A" }}>
            We're personally inviting a small group of builders to help launch Stringed Collective.
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#7A7A7A" }}>
            Founding builders receive:
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Free access to the platform",
              "Featured placement at launch",
              "Direct input on platform features",
              "Early exposure to a growing audience",
            ].map(item => (
              <li key={item} className="flex items-start gap-3">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: NAVY }} strokeWidth={2.5} />
                <span className="text-sm" style={{ color: "#3A3A3A" }}>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs italic" style={{ color: "#9A9A9A" }}>
            We are currently recruiting our first group of founding builders.
          </p>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-5xl mx-auto px-6"><div className="border-t" style={{ borderColor: "#E0DDD8" }} /></div>

      {/* ── Final CTA ── */}
      <section className="max-w-3xl mx-auto px-6 sm:px-8 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
          Start your storefront today.
        </h2>
        <p className="text-base leading-relaxed mb-10 max-w-xl mx-auto" style={{ color: "#4A4A4A" }}>
          Join Stringed Collective and get your work in front of musicians looking for something different.
        </p>
        <Link
          to={createPageUrl("JoinBuilders")}
          className="inline-block font-semibold px-8 py-3.5 text-sm text-white transition-colors mb-6"
          style={{ backgroundColor: NAVY }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
        >
          Create Your Builder Profile
        </Link>
        <div>
          <Link
            to={createPageUrl("FounderLetter")}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: NAVY }}
          >
            Read the founder's letter <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </div>
  );
}