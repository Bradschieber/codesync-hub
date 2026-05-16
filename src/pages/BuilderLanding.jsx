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
          Help players discover the instruments only independent builders can make.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Stringed Collective is a new marketplace built for independent instrument builders — giving you a professional storefront, safer transaction tools, and a better way for players to discover your work.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-3.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: NAVY }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#152038"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = NAVY}>
            
            Become a Founding Builder
          </button>
          <Link
            to={createPageUrl("FounderLetter")}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
            
            Read the founder's letter <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
          {["Safer transactions", "Professional storefronts", "Built for independent builders"].map((item) =>
          <span key={item} className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" strokeWidth={2} />
              {item}
            </span>
          )}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-[#E8E4DE] max-w-6xl mx-auto" />

      {/* ── Why Builders Need a Better Platform ── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Why Builders Need a Better Way to Sell</p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: NAVY }}>
          A storefront alone doesn't solve the real problem
        </h2>
        <div className="text-gray-500 text-base leading-relaxed space-y-4">
          <p>
            Many independent builders already have a website, a social media following, or a storefront on a larger marketplace. Those tools can help, but they still leave builders doing most of the work to attract the right buyers.
          </p>
          <p>
            Stringed Collective is different because independent instrument builders are not just another category on the site — they are the reason the marketplace exists.
          </p>
          <p>
            We're building a platform focused on bringing serious players to handmade instruments, helping builders present their work professionally, and making transactions safer for both sides.
          </p>
          <p>
            A listing gives you a place to sell. Stringed Collective is being built to help the right buyers discover what you make.
          </p>
        </div>
      </section>

      {/* ── Why Builders Win ── */}
      <section className="bg-[#F5F3EF] border-y border-[#E8E4DE]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">Why Builders Join Stringed Collective</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-12" style={{ color: NAVY }}>
            A better way to present your work, reach players, and manage sales
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {[
            {
              icon: Shield,
              title: "Safer transactions",
              body: "Stringed Collective helps reduce risk for both sides by handling payments through the platform, documenting the order, and supporting clear transaction steps from purchase through shipment."
            },
            {
              icon: Store,
              title: "Professional storefronts",
              body: "Showcase your instruments in a clean, trusted marketplace environment where players can explore your builds, learn your story, and understand what makes your work different."
            },
            {
              icon: Globe,
              title: "Reach beyond your existing network",
              body: "Bring your instruments to players who may not already follow you on social media, visit the same forums, or know where to find independent builders."
            },
            {
              icon: Fingerprint,
              title: "Your brand stays yours",
              body: "Your storefront highlights your work, your builds, and your voice. Stringed Collective provides the platform — you keep your identity."
            }].
            map(({ icon: Icon, title, body }) =>
            <div key={title} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-[#D8D4CE] bg-white flex items-center justify-center">
                  <Icon className="w-4 h-4" style={{ color: NAVY }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1.5" style={{ color: NAVY }}>{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              </div>
            )}
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
          { step: "01", title: "Create your builder profile", body: "Tell players about your craft, your experience, your shop, and the instruments you build." },
          { step: "02", title: "Add your storefront and instruments", body: "List available instruments, describe your custom-build options, upload photos, and define your shop policies." },
          { step: "03", title: "Sell through a more trusted process", body: "Players can discover your work, ask questions, purchase stock builds, or start a custom-build conversation — with payments and order details handled through the platform." }].
          map(({ step, title, body }) =>
          <div key={step} className="border-t-2 border-[#1B2B4B] pt-5">
              <p className="text-xs font-bold tracking-widest text-gray-300 mb-3">{step}</p>
              <h3 className="font-semibold text-sm mb-2" style={{ color: NAVY }}>{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400 text-center">We'll help founding builders get set up before launch.</p>
      </section>

      {/* ── Founding Builders ── */}
      <section className="bg-[#1B2B4B]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-300 mb-4">Founding Builders</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Help shape the first version of Stringed Collective
          </h2>
          <div className="text-blue-100 text-base leading-relaxed space-y-4 mb-10">
            <p>
              We're personally inviting a small group of independent builders to help launch Stringed Collective. The goal is to start with a focused founding group whose work reflects the quality, character, and craft we want this marketplace to stand for.
            </p>
            <p>
              Before opening the platform more broadly, we want feedback from real builders — people who understand the challenges of selling handmade instruments online and care about creating a better experience for both makers and players.
            </p>
          </div>
          <p className="text-blue-200 text-sm font-medium mb-5">As a founding builder, you'll get:</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-10 max-w-xl">
            {[
            "Free early access to the platform",
            "Simple 5% platform fee — no listing fees",
            "Help setting up your storefront",
            "Featured placement during launch",
            "Direct input on builder tools and workflows",
            "Early visibility as the marketplace grows"].
            map((item) =>
            <div key={item} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-sm text-blue-100 leading-relaxed">{item}</p>
              </div>
            )}
          </div>
          <p className="text-blue-300 text-sm leading-relaxed mb-10 max-w-xl">We are starting with a small group of builders, but this isn't about gatekeeping. It's about starting carefully — with builders who care deeply about their craft and want to help create something better.

          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <button
              onClick={() => setModalOpen(true)}
              className="px-8 py-3.5 text-sm font-semibold text-[#1B2B4B] bg-white transition-colors hover:bg-gray-100">
              
              Become a Founding Builder
            </button>
            <Link
              to={createPageUrl("FounderLetter")}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-300 hover:text-white transition-colors">
              
              Read the founder's letter <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="border-t border-blue-900 pt-8 max-w-xl space-y-2">
            <p className="text-sm text-blue-200 font-medium">Have questions before you get started?</p>
            <p className="text-sm text-blue-200">
              Email us anytime at{" "}
              <a
                href="mailto:support@stringedcollective.com?subject=Founding%20Builder%20Question%20or%20Call%20Request"
                className="text-blue-300 underline hover:text-white transition-colors">
                
                support@stringedcollective.com
              </a>
              .
            </p>
            <p className="text-sm text-blue-300 leading-relaxed">
              We're happy to answer questions, talk through whether Stringed Collective is a good fit for your shop, or set up a short call if you'd like to discuss it in more detail.
            </p>
          </div>
        </div>
      </section>

      {modalOpen && <BuilderAccountFormModal onClose={() => setModalOpen(false)} />}
    </div>);

}