import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle } from "lucide-react";
import BuilderAccountFormModal from "../components/builder/BuilderAccountFormModal";
import { useState } from "react";

const NAVY = "#1B2B4B";
const COL = "max-w-[680px] mx-auto px-6";

const sections = [
  {
    id: "opening",
    label: null,
    body: `Music has always been about people.

At a time when technology is moving faster than ever, a lot of people are wondering what that means for work, creativity, and human connection.

I believe something important can happen if we choose it.

I think more people will start seeking out things that feel deeply human: things made by hand, art with a story behind it, communities built around shared passion, and music created between real people in real rooms.

Few things represent that better than an instrument.

An instrument is not just a product. It is something one person builds so another person can make music with it.

That idea is the north star for Stringed Collective.`,
  },
  {
    id: "my-story",
    label: "MY STORY",
    body: `I've loved instruments for as long as I can remember.

When I was a kid, I used to pick up my dad's guitar long before I had any idea how to play it. Something about the instrument itself fascinated me — the shape, the smell of the wood, the way it felt in my hands.

Eventually, I learned how to play.

For more than 30 years, I've played in working bands, and many of the best experiences of my life — and many of my closest friendships — have happened because of music.

A few years ago, I started building guitars myself.

I've been building seriously for about five years now. I'm not at the level of many of the incredible builders out there, but I'm working on it every day. Like every builder, I'm chasing the next improvement — the next better instrument.

Being part of that community has been inspiring.`,
  },
  {
    id: "builder-community",
    label: "THE BUILDER COMMUNITY",
    body: `If you spend time in online builder communities, you see something remarkable.

There is an incredible amount of creativity, craftsmanship, experimentation, and generosity happening all over the world. Builders are learning from each other, helping each other, and pushing the craft forward.

The work being produced is extraordinary.

But I kept hearing the same question again and again:

How do I sell these?

For some builders, that question is about funding the next build.

For others, it is about turning a serious passion into a sustainable business.

And for more established builders, it is often about something even simpler:

How do I reach more players who would love these instruments?

Most builders today rely on personal websites, social media, word of mouth, forums, or music gear listing sites. Those tools can help, but they still leave builders doing most of the work to create demand and attract the right buyers.

A storefront is useful. But a storefront alone does not solve the discovery problem.

Meanwhile, many players go straight to large online retailers because those platforms feel familiar, easy, and safe.

That means many musicians may never realize that a handmade instrument from an independent builder is a real option.`,
  },
  {
    id: "changing-discovery",
    label: "CHANGING THE WAY MUSICIANS DISCOVER INSTRUMENTS",
    body: `Part of the mission of Stringed Collective is to change that.

We want more musicians to see boutique instruments as a real option when they're searching for their next instrument.

Large retailers have something independent builders often do not: a professional platform that makes discovery easy and transactions feel safe.

Stringed Collective is designed to give independent builders that kind of platform — built specifically around their work.

A place where builders can present their instruments professionally, tell the story behind their craft, reach players who are actively looking for something different, and manage transactions through a more structured process.

When musicians discover what independent builders are creating, it opens up an entirely new world of instruments.`,
  },
  {
    id: "why-exists",
    label: "WHY STRINGED COLLECTIVE EXISTS",
    body: `Stringed Collective is a marketplace designed specifically for independent instrument builders.

It provides the structure and trust that both builders and buyers need.

Builders can showcase their work through professional storefronts.

Players can explore instruments, learn about builders, purchase stock builds, and start conversations about custom builds.

Transactions happen through the platform, so payments, terms, order details, and shipment steps are documented more clearly.

The goal is simple:

Builders should be able to focus on building great instruments.

Players should be able to focus on making music.`,
  },
  {
    id: "the-beginning",
    label: "THE BEGINNING",
    dividerBefore: true,
    dividerLabel: "WHERE WE ARE NOW",
    body: `Right now, Stringed Collective is just getting started.

We're inviting a small group of founding builders to help shape the platform and launch the marketplace.

If you're one of the builders reading this, thank you for taking the time to learn more. More importantly, thank you for the work you're doing and the craft you're helping push forward.

My goal with Stringed Collective is simple:

Help more players discover your work.

Because the world needs more human connection.

And more music made by humans.`,
  },
  {
    id: "invitation",
    label: "A PERSONAL INVITATION",
    body: `If you're a builder who cares deeply about the craft, I'd love for you to be part of what we're building.

Stringed Collective exists to support this community and help bring your instruments to a wider audience.

We're starting carefully, with a small group of founding builders who can help us build the platform the right way.

Thank you for considering being part of it.`,
  },
];

const emphasisLines = [
  "How do I sell these?",
  "How do I reach more players who would love these instruments?",
  "Help more players discover your work.",
  "Builders should be able to focus on building great instruments.",
  "Players should be able to focus on making music.",
  "The goal is simple:",
  "My goal with Stringed Collective is simple:",
  "Because the world needs more human connection.",
  "And more music made by humans.",
];

function LetterSection({ section }) {
  return (
    <div>
      {section.label && (
        <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "#8A9BB0" }}>
          {section.label}
        </p>
      )}
      <div className="space-y-4">
        {section.body.split("\n\n").map((para, j) => {
          const isEmphasis = emphasisLines.includes(para.trim());
          return (
            <p
              key={j}
              className={`leading-[1.8] ${isEmphasis ? "text-base font-medium" : "text-base"}`}
              style={{ color: isEmphasis ? NAVY : "#3D3D3D" }}
            >
              {para}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default function FounderLetter() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ backgroundColor: "#FDFBF8", minHeight: "100vh" }}>

      {/* Page Header */}
      <div className="border-b" style={{ borderColor: "#E8E5E0" }}>
        <div className={`${COL} py-14`}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#8A9BB0" }}>
            Founder Letter
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ color: NAVY }}>
            Why I Built Stringed Collective
          </h1>
          <p className="text-base text-gray-500 leading-relaxed">
            A personal note about music, builders, and why this platform exists.
          </p>
        </div>
      </div>

      {/* Summary Block */}
      <div className="border-b" style={{ borderColor: "#E8E5E0" }}>
        <div className={`${COL} py-10`}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "#8A9BB0" }}>
            A Quick Summary
          </p>
          <div className="space-y-3">
            {[
              "Stringed Collective was created to help independent instrument builders reach a wider audience and make boutique instruments easier for players to discover and purchase.",
              "We're building a marketplace that gives independent builders a professional platform to present their work, manage transactions, and connect with serious players — while preserving the direct relationship between builder and musician.",
              "The platform is designed to make transactions safer and more structured for both sides, so builders and buyers can move forward with greater confidence.",
              "Right now, we're inviting a small group of founding builders to help launch the marketplace and shape how it evolves.",
            ].map((text, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: "#4A5566" }}>{text}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Letter Body */}
      <div className={`${COL} py-16`}>
        <div className="space-y-16">
          {sections.map((section) => (
            <div key={section.id}>

              {section.dividerBefore && (
                <div className="mb-16">
                  <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-center" style={{ color: "#8A9BB0" }}>
                    {section.dividerLabel}
                  </p>
                  <hr style={{ borderColor: "#E0DDD8" }} />
                </div>
              )}

              <LetterSection section={section} />

              {/* Pull quote after "changing-discovery" */}
              {section.id === "changing-discovery" && (
                <div className="my-16 py-12 text-center border-t border-b" style={{ borderColor: "#E8E5E0" }}>
                  <p
                    className="text-2xl sm:text-3xl font-semibold leading-snug mb-5"
                    style={{ color: NAVY, letterSpacing: "-0.01em" }}
                  >
                    Help more players discover your work.
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#7A8A9E" }}>
                    The mission of Stringed Collective is simple:<br />
                    give independent builders the platform they deserve.
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Signature */}
          <div className="pt-6">
            <div className="space-y-1">
              <p className="text-base font-semibold" style={{ color: NAVY }}>Brad</p>
              <p className="text-sm" style={{ color: "#6B7A8D" }}>Founder, Stringed Collective</p>
              <p className="text-sm" style={{ color: "#9AABBF" }}>Guitar builder and lifelong musician</p>
            </div>
          </div>
        </div>
      </div>

      {/* Founding Builder Benefits */}
      <div className="border-t" style={{ borderColor: "#E8E5E0" }}>
        <div className={`${COL} py-14`}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#8A9BB0" }}>
            Founding Builder Benefits
          </p>
          <h2 className="text-xl font-bold mb-4" style={{ color: NAVY }}>
            What founding builders receive
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "#4A5566" }}>
            Builders who join early will help shape the platform and receive early advantages as Stringed Collective launches.
          </p>
          <ul className="space-y-3">
            {[
              "Free early access to the platform",
              "Simple 5% platform fee — no listing fees",
              "Help setting up your storefront",
              "Featured placement as the marketplace launches",
              "Direct input on platform improvements and builder tools",
              "Early visibility as we grow the audience for independent builders",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#4A7FA5" }} strokeWidth={1.5} />
                <p className="text-sm leading-relaxed" style={{ color: "#3D3D3D" }}>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t" style={{ borderColor: "#E8E5E0" }}>
        <div className={`${COL} py-16 text-center`}>
          <h2 className="text-xl font-bold mb-3" style={{ color: NAVY }}>
            Join the first group of founding builders
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-md mx-auto">
            Create your builder profile and help shape the early future of Stringed Collective.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setModalOpen(true)}
              className="px-8 py-3.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: NAVY }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#152038"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = NAVY}
            >
              Become a Founding Builder
            </button>
            <Link
              to={createPageUrl("BuilderLanding")}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Builder Landing Page
            </Link>
          </div>
        </div>
      </div>

      {modalOpen && <BuilderAccountFormModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}