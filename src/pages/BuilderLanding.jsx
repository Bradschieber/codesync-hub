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
          Why selling custom instruments is harder than it should be
        </h2>
        <div className="text-gray-500 text-base leading-relaxed space-y-4">
          <p>
            Independent builders often rely on personal websites, social media, and word of mouth to sell their work. While that can work, it can also make it difficult for new players to discover your instruments.
          </p>
          <p>
            Even when someone is ready to buy, the transaction itself can feel uncertain. Sending thousands of dollars to someone you've never met — or committing weeks of work to a build without secure payment — creates risk on both sides.
          </p>
          <p>
            Stringed Collective was created to remove that friction.
          </p>
          <p>
            By acting as a trusted marketplace between builder and buyer, Stringed Collective provides a professional storefront where players can discover your work — while the platform guarantees the transaction so neither side carries the risk alone.
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
                body: "Stringed Collective stands between the builder and buyer to guarantee every transaction. Payments are handled through the platform so both sides know the deal is secure. If either party fails to follow through, Stringed Collective makes the other whole."
              },
              {
                icon: Store,
                title: "Professional storefronts",
                body: "Showcase your instruments in a clean, trusted retail environment where players can explore your builds and learn your story."
              },
              {
                icon: Globe,
                title: "Reach players everywhere",
                body: "Stringed Collective brings your instruments to players beyond your local network. We handle the marketing — from search visibility to advertising and promotion — so the right players can discover your work."
              },
              {
                icon: Fingerprint,
                title: "Your brand stays yours",
                body: "Your storefront highlights your work, your builds, and your voice. Stringed Collective provides the platform — you keep your identity."
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
            { step: "01", title: "Create your builder profile", body: "Tell us about your craft, your experience, and the instruments you build." },
            { step: "02", title: "Build your storefront and add instruments", body: "List instruments with photos and specs, or offer custom builds through your storefront." },
            { step: "03", title: "Start connecting with players", body: "Players discover your work through the platform, and Stringed Collective handles the transaction so the sale is secure." },
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
            We're personally inviting a small group of independent builders whose work we respect to help launch Stringed Collective. Our goal is to bring together the first 10 founding builders before opening the marketplace more broadly.
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