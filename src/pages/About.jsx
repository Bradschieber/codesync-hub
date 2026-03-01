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
          <h1 className="text-5xl sm:text-6xl font-bold mb-5 tracking-tight leading-tight" style={{ color: "#1A1A1A" }}>
            About Stringed Collective.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#3D3D3D" }}>
            We exist to connect serious instrument builders with the players who will cherish their work for generations.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-start mb-20">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#6B6B6B" }}>Our Story</h2>
            <p className="text-base leading-relaxed mb-5" style={{ color: "#3D3D3D" }}>
              Stringed Collective was built to solve a real problem: remarkable guitar builders were invisible to the players who would love their work most. Mass-market retailers dominated, while independent luthiers struggled to reach a serious audience.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "#3D3D3D" }}>
              We built this platform to change that — a protected, structured marketplace where craft is respected, transactions are secure, and the relationship between builder and player can be direct and honest.
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
                <p className="text-3xl font-bold mb-1" style={{ color: NAVY }}>{value}</p>
                <p className="text-sm" style={{ color: "#6B6B6B" }}>{label}</p>
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
                text: "Every builder is reviewed before listing. We only feature makers who take exceptional care in their craft and their customer relationships."
              },
              {
                icon: Users,
                title: "Direct Relationships",
                text: "We facilitate the connection between builder and player — not replace it. Buyers and makers communicate clearly throughout every transaction."
              },
              {
                icon: Lock,
                title: "Protected Transactions",
                text: "Payments are held securely and released only after successful delivery. No one carries the risk alone — that's our commitment to both sides."
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="p-7 border" style={{ borderColor: "#E0DDD8", backgroundColor: "#FFFFFF" }}>
                <div className="mb-4" style={{ color: NAVY }}>
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-base mb-3" style={{ color: "#1A1A1A" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4A4A4A" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 px-10 text-center" style={{ backgroundColor: NAVY }}>
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Ready to find your instrument?</h2>
          <p className="mb-8 text-base" style={{ color: "#A8B8D0" }}>Browse instruments from independent builders — directly.</p>
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