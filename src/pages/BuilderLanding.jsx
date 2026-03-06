import { useState } from "react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Store, Users, Fingerprint, CheckCircle, CreditCard } from "lucide-react";
import BuilderAccountFormModal from "../components/builder/BuilderAccountFormModal";

const NAVY = "#1B2B4B";

export default function BuilderLanding() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="bg-[#FDFBF8] text-[#1B2B4B] font-sans">

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-6">For Independent Builders</p>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6" style={{ color: NAVY }}>
          Sell your instruments<br />with confidence.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Stringed Collective helps independent builders reach serious buyers through a professional storefront and protected transactions.
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

      {/* ── Divider ── */}
      <div className="border-t border-[#E8E4DE] max-w-6xl mx-auto" />

      {/* ── Why Builders Need a Better Platform ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">The Problem</p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: NAVY }}>
          Why builders need a better platform
        </h2>
        <div className="text-gray-500 text-base leading-relaxed space-y-4">
          <p>
            Most musicians buying a new instrument head straight to the big box stores or major online retailers. Not because boutique builders aren't better — but because they don't know where to find them, or they assume the process is too complicated or too risky.
          </p>
          <p>
            That's the real problem. There are exceptional independent builders doing incredible work, and there are buyers willing to spend serious money on the right instrument — but the two rarely find each other.
          </p>
          <p>
            Stringed Collective is changing that. We're actively marketing to buyers who haven't considered boutique before, showing them that buying from an independent builder can be just as seamless, safe, and trustworthy as buying from a major retailer — and far more rewarding.
          </p>
        </div>
      </section>

      {/* ── Why Builders Win ── */}
      <section className="bg-[#F5F3EF] border-y border-[#E8E4DE]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">What You Get</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-12" style={{ color: NAVY }}>
            Built around how builders actually work
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: "Every transaction is guaranteed",
                body: "We guarantee every sale so buyers and builders are never left holding the bag. Deposits, custom builds, and stock sales are all handled through a structured process that keeps both sides covered."
              },
              {
                icon: Store,
                title: "Professional storefronts",
                body: "Your work is presented in a clean, trustworthy retail environment. Your brand, your story, your builds — all in one place that looks the part."
              },
              {
                icon: Users,
                title: "We bring the buyers to you",
                body: "We run the advertising and promotion so you don't have to. Our team markets the platform to serious buyers actively looking for boutique and custom instruments — you focus on building."
              },
              {
                icon: Fingerprint,
                title: "Keep your identity",
                body: "Your storefront is yours. We give you the tools and the structure, but your brand, your voice, and your builds stay front and center."
              },
              {
                icon: CreditCard,
                title: "A buying experience buyers trust",
                body: "We give buyers a seamless, trustworthy checkout experience — as polished as any major music retailer. We support credit card payments and financing options, so price is less of a barrier to a sale."
              }
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
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">The Process</p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-12" style={{ color: NAVY }}>
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          {[
            { step: "01", title: "Create your builder profile", body: "Tell us about your craft, your experience, and what you build. This becomes the foundation of your storefront." },
            { step: "02", title: "Build your storefront and add instruments", body: "List your stock builds with photos and specs, or set up custom build offerings. You stay in control of everything." },
            { step: "03", title: "Start connecting with buyers", body: "Buyers browsing for handmade instruments will find your work. You handle inquiries, quotes, and orders through the platform." },
          ].map(({ step, title, body }) => (
            <div key={step} className="border-t-2 border-[#1B2B4B] pt-5">
              <p className="text-xs font-bold tracking-widest text-gray-300 mb-3">{step}</p>
              <h3 className="font-semibold text-sm mb-2" style={{ color: NAVY }}>{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#F5F3EF] border border-[#E8E4DE] rounded-sm p-6">
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <span className="font-semibold" style={{ color: NAVY }}>Your storefront can be set up quickly</span>, and you stay in control of your brand and your builds.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Stringed Collective sits in the middle as the trusted platform — handling the transaction structure, buyer communication tools, and payment protection. Builders keep their identity and their relationship with their work. Buyers get the confidence to purchase from someone they don't already know.
          </p>
        </div>
      </section>

      {/* ── Founding Builders ── */}
      <section className="bg-[#1B2B4B]">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-300 mb-4">Limited Early Group</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Founding builders wanted
          </h2>
          <p className="text-blue-100 text-base leading-relaxed mb-10">
            We are personally inviting our first group of builders to help launch Stringed Collective. This is a small group — we are looking to bring on our first 10 builders before we open more broadly.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left mb-10 max-w-xl mx-auto">
            {[
              "Free early access to the platform",
              "Featured placement at launch",
              "Direct input as the platform develops",
              "Early visibility with buyers as the marketplace grows",
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
          Join Stringed Collective and get your work in front of musicians looking for something different.
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