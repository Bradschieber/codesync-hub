import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Guitar, Heart, Users, Star, ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="bg-stone-50">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-20 px-4 text-center">
        <Guitar className="w-14 h-14 text-amber-400 mx-auto mb-5" />
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Stringed Collective</h1>
        <p className="text-stone-300 text-xl max-w-2xl mx-auto">
          We exist to connect the most passionate guitar builders in the world with the players who will cherish their work for generations.
        </p>
      </div>

      {/* Story */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-stone-800 mb-4">Our Story</h2>
            <p className="text-stone-600 leading-relaxed mb-4">
              Stringed Collective was born from a simple frustration: remarkable guitar builders were hidden from the players who would love their work most. Mass-market retailers dominated the market, while independent luthiers struggled to reach their audience.
            </p>
            <p className="text-stone-600 leading-relaxed">
              We built this platform to change that — a curated marketplace where craftsmanship is celebrated, where every guitar has a story, and where the relationship between builder and player can flourish.
            </p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
            <div className="grid grid-cols-2 gap-6 text-center">
              {[
                { value: "150+", label: "Master Builders" },
                { value: "2,000+", label: "Instruments Sold" },
                { value: "4.9★", label: "Average Rating" },
                { value: "50+", label: "States Reached" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-bold text-amber-700">{value}</p>
                  <p className="text-stone-500 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">What We Stand For</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: "Craftsmanship First", text: "Every builder on our platform is vetted for skill, quality, and integrity. We only feature makers who take exceptional pride in their work." },
              { icon: Users, title: "Community Driven", text: "We're more than a marketplace — we're a community of builders, players, and enthusiasts who share a deep love for handcrafted instruments." },
              { icon: Star, title: "Exceptional Value", text: "Buying direct from the builder means better instruments for less. No middlemen inflating costs, just pure value from maker to player." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-stone-200">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-stone-800 mb-2">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-stone-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Find Your Guitar?</h2>
          <p className="text-stone-400 mb-6">Browse hundreds of handcrafted instruments from independent makers.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("Catalog")} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3 rounded-xl flex items-center justify-center gap-2">
              Browse Guitars <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to={createPageUrl("JoinBuilders")} className="border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-xl">
              Join as Builder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}