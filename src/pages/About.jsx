import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Lock, Users, CheckCircle } from "lucide-react";

const NAVY = "#1B2B4B";

export default function About() {
  return (
    <div style={{ backgroundColor: "#FAF9F7", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-bold mb-5 tracking-tight leading-tight" style={{ color: "#1B2B4B", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            About Stringed Collective.
          </h1>
          <p className="text-lg leading-relaxed mb-4" style={{ color: "#3D3D3D" }}>
            Stringed Collective connects independent instrument builders with players around the world who value craftsmanship and individuality.
          </p>
          <p className="text-lg leading-relaxed" style={{ color: "#3D3D3D" }}>
            Our marketplace makes it easier to discover exceptional instruments and purchase them through a secure, structured platform that protects both buyer and builder.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-start mb-20">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#6B6B6B" }}>Our Story</h2>
            <p className="text-base leading-relaxed mb-5" style={{ color: "#3D3D3D" }}>
              Stringed Collective was created to solve a real problem.
            </p>
            <p className="text-base leading-relaxed mb-5" style={{ color: "#3D3D3D" }}>
              Remarkable instrument builders exist all over the world, but many struggle to reach the players who would value their work most. Independent builders often rely on personal websites, social media, or word of mouth — which makes discovery difficult and transactions uncertain.
            </p>
            <p className="text-base leading-relaxed mb-5" style={{ color: "#3D3D3D" }}>
              At the same time, players who want something truly unique often hesitate to purchase directly from someone they've never met.
            </p>
            <p className="text-base leading-relaxed mb-5 font-medium" style={{ color: NAVY }}>
              Stringed Collective bridges that gap.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "#3D3D3D" }}>
              We provide a professional marketplace where builders can showcase their work and where transactions are structured and protected so both sides can move forward with confidence.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[
              { value: "150+", label: "Verified Builders" },
              { value: "2,000+", label: "Instruments Sold" },
              { value: "4.9", label: "Average Rating" },
              { value: "50+", label: "States Reached" },
            ].map(({ value, label }) => (
              <div key={label} className="p-6 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                <p className="text-3xl font-bold mb-1" style={{ color: NAVY, fontFamily: "'DM Sans', system-ui, sans-serif" }}>{value}</p>
                <p className="text-sm" style={{ color: "#6B6B6B" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-10" style={{ color: "#6B6B6B" }}>How It Works</h2>
          <h3 className="text-xl font-bold mb-8" style={{ color: NAVY }}>Buying an instrument through Stringed Collective</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Discover Independent Builders",
                text: "Browse instruments from independent builders around the world. Each builder has their own storefront where you can explore available instruments, learn about their craft, and request custom builds.",
              },
              {
                step: "02",
                title: "Purchase Through the Platform",
                text: "When you're ready to buy, the transaction happens through Stringed Collective. Payments are handled securely and the purchase agreement clearly documents the instrument, pricing, and terms.",
              },
              {
                step: "03",
                title: "Receive Your Instrument",
                text: "Builders ship instruments directly to buyers. Stringed Collective verifies the shipment and releases payment according to the agreed terms so both parties are protected.",
              },
            ].map(({ step, title, text }) => (
              <div key={step} className="p-7 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                <p className="text-xs font-bold tracking-widest mb-4" style={{ color: "#8A9BB0" }}>{step}</p>
                <h4 className="text-base mb-3" style={{ color: NAVY, fontWeight: 600 }}>{title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-10" style={{ color: "#6B6B6B" }}>What We Stand For</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle,
                title: "Builder-First Standards",
                text: "Every builder is reviewed before listing. We focus on independent makers who take exceptional care in their craft and in their relationships with players."
              },
              {
                icon: Users,
                title: "Direct Relationships",
                text: "Stringed Collective facilitates the connection between builder and player without replacing it. Buyers and builders communicate directly throughout the process."
              },
              {
                icon: Lock,
                title: "Guaranteed Transactions",
                text: "Stringed Collective stands between buyer and builder to guarantee the transaction. Payments are held securely and released according to the agreed terms so neither side carries the risk alone."
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="p-7 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                <div className="mb-4" style={{ color: NAVY }}>
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-base mb-3" style={{ color: "#1B2B4B", fontWeight: 600, fontFamily: "'DM Sans', system-ui, sans-serif" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 px-10 text-center" style={{ backgroundColor: NAVY }}>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>Ready to find your next instrument?</h2>
          <p className="mb-8 text-base" style={{ color: "#A8B8D0" }}>Explore instruments from independent builders around the world.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={createPageUrl("Catalog")}
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 text-sm transition-colors"
              style={{ backgroundColor: "#FFFFFF", color: NAVY }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#EEF1F7"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FFFFFF"}
            >
              Browse Instruments <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={createPageUrl("JoinBuilders")}
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 text-sm border transition-colors text-white"
              style={{ borderColor: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Join as Builder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}