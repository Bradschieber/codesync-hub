import { useState } from "react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Store, Globe, Fingerprint, CheckCircle } from "lucide-react";
import BuilderAccountFormModal from "../components/builder/BuilderAccountFormModal";

const NAVY = "#1B2B4B";

export default function BuilderLanding() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-[#FDFBF8] text-[#1B2B4B] font-sans">

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-20 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">
          Built for Independent Instrument Builders
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6" style={{ color: NAVY }}>
          Connect your instruments with players around the world.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Stringed Collective gives independent builders a professional storefront where players can discover their instruments — with guaranteed transactions that make buying easier and safer for everyone.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-3.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: NAVY }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
          >
            Create Your Builder Profile
          </button>
          <Link
            to={createPageUrl("FounderLetter")}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            Read the founder's letter <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
          {["Guaranteed transactions", "Professional storefronts", "Built for independent builders"].map(item => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" strokeWidth={2} />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-[#E8E4DE] max-w-6xl mx-auto" />

      {/* ── Why Builders Need a Better Platform ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Why Builders Need a Better Way to Sell</p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: NAVY }}>
          Why builders need a better way to sell
        </h2>
        <div className="text-gray-500 text-base leading-relaxed space-y-4">
          <p>
            Independent builders often rely on personal websites, social media, and word of mouth to sell their work. While that can work, it can also make it difficult for buyers to discover new builders and difficult for transactions to feel secure and straightforward.
          </p>
          <p>
            Stringed Collective creates a professional marketplace where independent builders can present their instruments clearly and connect with players who are actively searching for something different.
          </p>
        </div>
      </section>

      {/* ── Why Builders Win ── */}
      <section className="bg-[#F5F3EF] border-y border-[#E8E4DE]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Why Builders Win With Stringed Collective</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-12" style={{ color: NAVY }}>
            What you get as a builder
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: "Guaranteed transactions",
                body: "Every sale is protected by the platform so builders and buyers never carry the risk alone."
              },
              {
                icon: Store,
                title: "Professional storefronts",
                body: "Showcase your instruments in a clear, trusted retail environment where your brand and story are front and center."
              },
              {
                icon: Globe,
                title: "Reach players everywhere",
                body: "Your instruments become discoverable to players beyond your local network — buyers who are actively looking for something handmade."
              },
              {
                icon: Fingerprint,
                title: "Your brand stays yours",
                body: "Your storefront highlights your work, your builds, and your story. We give you the structure — you keep your identity."
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#D8D4CE] bg-white flex items-center justify-center">
                  <Icon className="w-4 h-4" style={{ color: NAVY }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1.5" style={{ color: NAVY }}>{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">How It Works</p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-12" style={{ color: NAVY }}>
          Three steps to get started
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          {[
            { step: "01", title: "Create your builder profile", body: "Tell us about your craft, your experience, and what you build." },
            { step: "02", title: "Build your storefront and add instruments", body: "List your instruments with photos and specs, or set up custom build offerings." },
            { step: "03", title: "Start connecting with players", body: "Buyers searching for handmade instruments will find your work through the platform." },
          ].map(({ step, title, body }) => (
            <div key={step} className="border-t-2 border-[#1B2B4B] pt-5">
              <p className="text-xs font-bold tracking-widest text-gray-300 mb-3">{step}</p>
              <h3 className="font-semibold text-sm mb-2" style={{ color: NAVY }}>{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400 text-center">Setting up your storefront takes just a few minutes.</p>
      </section>

      {/* ── Founding Builders ── */}
      <section className="bg-[#1B2B4B]">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-300 mb-4">Founding Builders</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Founding builders wanted
          </h2>
          <p className="text-blue-100 text-base leading-relaxed mb-10">
            We are personally inviting our first group of independent builders to help launch Stringed Collective. We are looking to bring on our first 10 founding builders before opening more broadly.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left mb-10 max-w-xl mx-auto">
            {[
              "Free early access to the platform",
              "Featured placement at launch",
              "Direct input on platform features",
              "Early visibility as the marketplace grows",
            ].map(item => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-sm text-blue-100 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-blue-300 text-sm mb-8">
            This isn't an exclusive club — it's an early group. If you build instruments seriously, you belong here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setModalOpen(true)}
              className="px-8 py-3.5 text-sm font-semibold text-[#1B2B4B] bg-white transition-colors hover:bg-gray-100"
            >
              Create Your Builder Profile
            </button>
            <Link
              to={createPageUrl("FounderLetter")}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-300 hover:text-white transition-colors"
            >
              Read the founder's letter <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: NAVY }}>
          Start your storefront today
        </h2>
        <p className="text-gray-500 text-base mb-10 leading-relaxed">
          Join Stringed Collective and get your instruments in front of players looking for something different.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-3.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: NAVY }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
          >
            Create Your Builder Profile
          </button>
          <Link
            to={createPageUrl("FounderLetter")}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            Read the founder's letter <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {modalOpen && <BuilderAccountFormModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}