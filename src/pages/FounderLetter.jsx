import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import BuilderAccountFormModal from "../components/builder/BuilderAccountFormModal";
import { useState } from "react";

const NAVY = "#1B2B4B";

// max-w-[680px] ≈ custom width for comfortable long-form reading
const COL = "max-w-[680px] mx-auto px-6";

const sections = [
  {
    id: "opening",
    body: `Music has always been about people.

At a time when technology is accelerating faster than ever, a lot of people worry about where that leads. But I believe something different is happening.

I think the future is going to create more opportunities for humans to be deeply human.

We're going to see a renaissance of people doing human things — making things with their hands, creating art, building communities, and coming together around music.

And few things represent that better than an instrument — something built by one human being so another human being can make music with it.

That idea is the North Star behind Stringed Collective.`,
  },
  {
    id: "my-story",
    heading: "My Story",
    body: `I've loved instruments for as long as I can remember.

When I was a kid I used to pick up my dad's guitar long before I had any idea how to play it. Something about the instrument itself fascinated me — the shape, the wood, the way it felt in your hands.

Eventually I learned how to play.

For more than 30 years I've played in working bands, and many of the best experiences of my life — and many of my closest friendships — have happened because of music.

A few years ago I started building guitars myself.

I've been building seriously for about five years now. I'm not at the level of many of the incredible builders out there yet, but I'm working on it every day. Like every builder, I'm chasing that next improvement — the next better instrument.

And being part of that community has been inspiring.`,
  },
  {
    id: "builder-community",
    heading: "The Builder Community",
    body: `If you spend time in the online builder communities, you see something remarkable.

There is an incredible amount of creativity and craftsmanship happening all over the world. Builders are experimenting, learning, helping each other, and pushing the craft forward.

The work being produced is extraordinary.

But I kept hearing the same question over and over again:

"How do I sell these?"

For some builders, it's about funding the next build.

For others, it's about turning a passion into a business.

And for more established builders, it's about something even simpler:

How do I reach more players who would love these instruments?

Most builders today rely on personal websites, social media, or word of mouth. Those tools can work, but they make discovery difficult and transactions uncertain.

Meanwhile, many players go straight to the large online retailers because those platforms feel easy, familiar, and safe.

That means many musicians never even realize that a handmade instrument from an independent builder is an option.`,
  },
  {
    id: "changing-discovery",
    heading: "Changing the Way Musicians Discover Instruments",
    body: `Part of the mission of Stringed Collective is to change that.

We want more musicians to see boutique instruments as a real option when they're searching for their next instrument.

Right now, large retailers offer something independent builders often don't have access to: a professional platform that makes discovery easy and transactions feel safe.

Stringed Collective is designed to give boutique builders that same level of platform.

A place where builders can present their work professionally, tell the story behind their instruments, and reach players who are actively searching for something different.

When musicians discover what independent builders are creating, it opens up an entirely new world of instruments.`,
  },
  {
    id: "why-exists",
    heading: "Why Stringed Collective Exists",
    body: `Stringed Collective is a marketplace designed specifically for independent instrument builders.

It provides the structure and trust that both builders and buyers need.

Builders can showcase their work through professional storefronts.

Players can explore instruments and collaborate on custom builds.

And transactions happen through a secure platform that protects both sides.

Payments are handled through the platform, terms are documented clearly, and the process is structured so neither side carries the risk alone.

Builders should be able to focus on building great instruments.

Players should be able to focus on making music.`,
  },
  {
    id: "the-beginning",
    heading: "The Beginning",
    dividerBefore: true,
    body: `Right now, Stringed Collective is just getting started.

We're inviting a small group of founding builders to help shape the platform and launch the marketplace.

If you're one of the builders reading this, thank you for reading this far and thank you for the work you're doing and the craft you're pushing forward.

My goal with Stringed Collective is simple:

Help more players discover your work.

Because the world needs more instruments built by humans.

And more music made by humans.`,
  },
  {
    id: "invitation",
    heading: "A Personal Invitation",
    body: `If you're a builder who cares deeply about the craft, I'd love for you to be part of what we're building.

Stringed Collective exists to support this community and help bring your instruments to a wider audience.

But I believe something incredible can happen if we choose it.`,
  },
];

const emphasisStarts = ['"', "Help more", "How do I", "Builders should", "Players should", "Because", "And more"];
const boldStarts = ["Help more", "Because", "And more"];

function LetterSection({ section }) {
  return (
    <div>
      {section.heading && (
        <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "#8A9BB0" }}>
          {section.heading}
        </p>
      )}
      <div className="space-y-4">
        {section.body.split("\n\n").map((para, j) => {
          const isEmphasis = emphasisStarts.some(s => para.startsWith(s));
          const isBold = boldStarts.some(s => para.startsWith(s));
          return (
            <p
              key={j}
              className="text-base leading-[1.8]"
              style={{
                color: isEmphasis ? NAVY : "#3D3D3D",
                fontWeight: isBold ? 500 : 400,
              }}
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
              "We're building a marketplace that gives independent builders the same kind of professional platform large retailers have — while preserving the direct relationship between builder and player.",
              "The platform handles transactions securely so both sides can move forward with confidence.",
              "We're currently inviting a small group of founding builders to help launch the marketplace and shape how it evolves.",
            ].map((text, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: "#4A5566" }}>{text}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Letter Body */}
      <div className={`${COL} py-16`}>
        <div className="space-y-16">
          {sections.map((section, i) => (
            <div key={section.id}>

              {/* Section divider before "The Beginning" */}
              {section.dividerBefore && (
                <div className="mb-16">
                  <p className="text-xs font-semibold tracking-widest uppercase mb-4 text-center" style={{ color: "#8A9BB0" }}>
                    Where we are now
                  </p>
                  <hr style={{ borderColor: "#E0DDD8" }} />
                </div>
              )}

              <LetterSection section={section} />

              {/* Pull quote after "Changing the Way..." section */}
              {section.id === "changing-discovery" && (
                <div className="my-16 py-12 text-center border-t border-b" style={{ borderColor: "#E8E5E0" }}>
                  <p
                    className="text-2xl sm:text-3xl font-semibold leading-snug mb-5"
                    style={{ color: NAVY, letterSpacing: "-0.01em" }}
                  >
                    "Help more players discover your work."
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
              "0% platform fees on your first three instruments sold within your first six months",
              "Featured placement as the marketplace launches",
              "Direct input on platform improvements and builder tools",
              "Early visibility as we grow the audience for independent builders",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: NAVY }} />
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
              Create Your Builder Profile
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