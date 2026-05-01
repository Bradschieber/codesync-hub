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
            Stringed Collective is a modern marketplace for handcrafted instruments from independent builders.
          </p>
          <p className="text-lg leading-relaxed" style={{ color: "#3D3D3D" }}>
            We bring instrument lovers and boutique makers together through a polished online shopping experience — making it easier to discover, purchase, and commission exceptional instruments from builders around the world.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-start mb-20">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#6B6B6B" }}>Our Story</h2>
            <p className="text-base leading-relaxed mb-5" style={{ color: "#3D3D3D" }}>
              Independent builders create some of the most inspiring instruments in the world — but their work is often difficult to discover.
            </p>
            <p className="text-base leading-relaxed mb-5" style={{ color: "#3D3D3D" }}>
              Many builders rely on personal websites, social media, word of mouth, and small communities to reach buyers. At the same time, instrument lovers are used to the convenience and structure of major online retailers, even when those retailers do not carry the kind of unique, handcrafted instruments they are looking for.
            </p>
            <p className="text-base leading-relaxed mb-5 font-medium" style={{ color: NAVY }}>
              Stringed Collective was created to bridge that gap.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "#3D3D3D" }}>
              We give builders a professional marketplace to showcase their work, and we give buyers a trusted place to discover distinctive instruments, connect with makers, and complete purchases through a clear, organized process.
            </p>
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
                title: "Discover independent builders",
                text: "Explore ready-to-ship instruments, builder storefronts, and shop updates from independent makers around the world.",
              },
              {
                step: "02",
                title: "Shop through a modern marketplace",
                text: "Review listings, compare details, ask questions, and purchase through an organized platform built for boutique instrument sales.",
              },
              {
                step: "03",
                title: "Follow the order from purchase to delivery",
                text: "Stringed Collective helps manage order records, payment milestones, shipment steps, and support if questions come up.",
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
                title: "Independent craft",
                text: "We believe independent builders deserve a professional place to share their work without losing the individuality that makes it special."
              },
              {
                icon: Users,
                title: "Better discovery",
                text: "Exceptional instruments should not only be found by chance, through scattered posts, private groups, or word of mouth."
              },
              {
                icon: Lock,
                title: "A more complete buying experience",
                text: "We combine boutique builder access with the structure buyers expect from a modern online marketplace."
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
          <p className="mb-8 text-base" style={{ color: "#A8B8D0" }}>Explore handcrafted instruments from independent builders around the world.</p>
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
              to={createPageUrl("BuilderLanding")}
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 text-sm border transition-colors text-white"
              style={{ borderColor: "rgba(255,255,255,0.3)" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Become a Founding Builder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}