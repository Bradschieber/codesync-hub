import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Mail, MessageCircle, Instagram, Facebook } from "lucide-react";

const NAVY = "#1B2B4B";

function SectionHeading({ children }) {
  return (
    <h2
      className="text-lg font-bold mt-12 mb-4 pb-2 border-b"
      style={{ color: NAVY, borderColor: "#E8E5E0" }}
    >
      {children}
    </h2>
  );
}

function SubHeading({ children }) {
  return (
    <h3 className="text-base font-semibold mt-7 mb-2" style={{ color: NAVY }}>
      {children}
    </h3>
  );
}

function P({ children }) {
  return (
    <p className="text-sm leading-relaxed mb-3" style={{ color: "#4A4A4A" }}>
      {children}
    </p>
  );
}

function UL({ children }) {
  return (
    <ul
      className="list-disc list-outside ml-5 space-y-1.5 text-sm leading-relaxed my-3"
      style={{ color: "#4A4A4A" }}
    >
      {children}
    </ul>
  );
}

export default function BuilderQuickStartGuide() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #EEF1F7 0%, #FAF9F7 100%)" }} className="pt-14 pb-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to={createPageUrl("BuilderResources")}
            className="inline-flex items-center gap-1 text-sm mb-6 transition-opacity opacity-60 hover:opacity-100"
            style={{ color: NAVY }}
          >
            <ChevronLeft className="w-4 h-4" /> Builder Resources
          </Link>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#8A9BB0" }}>
            Quick Start Guide
          </p>
          <h1 className="text-3xl font-bold leading-snug mb-3" style={{ color: "#1A1A1A" }}>
            Builder Quick Start Guide
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#5A5A5A" }}>
            Everything you need to set up your storefront on Stringed Collective — step by step, with no pressure.
          </p>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-t pt-10" style={{ borderColor: "#E8E5E0" }}>
          <P>
            You're one of the first builders we've invited to Stringed Collective, and we want your first experience
            setting up shop to be genuinely easy. This guide walks through what to expect at each step and how to reach
            us directly if anything trips you up.
          </P>
          <P>
            There's no such thing as a dumb question here — you're helping us figure out the early days of this together,
            and we'd rather you ask than get stuck.
          </P>
          <P>
            <span className="font-semibold" style={{ color: NAVY }}>A quick note on timing:</span> right now we're
            focused on testing this process out and working out any rough edges — we won't be formally launching with
            marketing and promotion for about a month. So there's no rush and no pressure to get everything perfect on
            the first try. Nothing goes live on the public site until we've reviewed and approved it, so feel free to
            explore, try things out, and see what works for your shop. Everything here is easy to change later.
          </P>

          {/* Before You Start */}
          <SectionHeading>Before You Start: A Few Things to Know</SectionHeading>
          <P>
            None of this is required before you begin — you can start setup anytime and fill things in as you go. This
            is just a heads-up on what's ahead, not a checklist you need to finish first.
          </P>

          <SubHeading>Photos</SubHeading>
          <UL>
            <li>
              A <span className="font-medium" style={{ color: NAVY }}>Builder Card Photo</span> — This photo will be the
              image used to introduce your storefront on our "Builders" page. It will also show up when your storefront is
              included in search results. You want it to be a polished representation of your brand — it could be a photo
              of you or your workshop. You want this to be a quality, well-lit shot of you at the bench or your space.
              This image beats a logo or empty background.
            </li>
            <li>A logo, if you have one (optional).</li>
            <li>A banner image for the top of your storefront page (optional).</li>
            <li>At least one clear photo per instrument you plan to list.</li>
          </UL>
          <P>
            If none of the specs below mean much to you, that's completely fine — any decent photo works, and our system
            automatically cleans up and standardizes backgrounds for you. But if you're using a tool to prep your
            images, these will help you get it right the first time:
          </P>
          <UL>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Builder Card Photo</span> — crops to a 4:3 ratio;
              aim for at least 1200×900px
            </li>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Banner</span> — works best as a wide, landscape
              image, around 1600×400px (roughly 4:1); there's no crop tool for this one, so keep text or logos away from
              the edges
            </li>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Logo</span> — square or wide works best; at least
              500px on the short side, and a transparent PNG will blend into the header more cleanly than a white
              background
            </li>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Instrument photos</span> — these are separate from
              the photos you'll provide for actual product listings. Good lighting and a plain background is always a
              good plan.
            </li>
          </UL>
          <P>
            Need some help with these images? That's completely fine — tools like{" "}
            <a href="https://canva.com" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: NAVY }}>
              Canva
            </a>{" "}
            (free) make it easy to crop, resize, and clean up photos without any experience. For writing help — your
            bio, policies, anything text-heavy — Claude, ChatGPT, and Google Gemini work well when you need a little
            help. And if you get stuck on any of it, just reach out. We're happy to help.
          </P>

          <SubHeading>Your Story</SubHeading>
          <P>
            A few sentences about your background and what makes your builds distinctive. This doesn't need to be super
            polished — buyers respond to authenticity. It's your passion for building that needs to shine.
          </P>

          <SubHeading>Your Shop Policies</SubHeading>
          <UL>
            <li>Your return/warranty policy.</li>
            <li>Your shipping approach (flat rate, or calculated per order).</li>
            <li>If you take custom orders: your typical build timeline and deposit percentage.</li>
          </UL>

          <SubHeading>Payment Setup</SubHeading>
          <P>
            You'll connect a Stripe account so we can pay you for sales. This takes about 5–10 minutes and asks for
            basic business/bank details. You can finish this later if you want to get your storefront live first — but
            you won't be able to receive a real payout until it's done, so we recommend knocking it out early.
          </P>

          {/* Walking Through Setup */}
          <SectionHeading>Walking Through Setup</SectionHeading>
          <P>
            Setup is 8 short steps. Only a few are required — the rest you can skip and come back to.
          </P>
          <ol
            className="list-decimal list-outside ml-5 space-y-3 text-sm leading-relaxed my-4"
            style={{ color: "#4A4A4A" }}
          >
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Foundation</span> — your shop name, location, and
              basic legal agreements. <span className="italic">Required.</span>
            </li>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Your Story</span> — tell buyers about yourself and
              your craft.
            </li>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Show Your Craft</span> — upload your Builder Card
              Photo and any workshop photos or video. Optional, but strongly recommended — this is your storefront's
              first impression.
            </li>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Your Business</span> — years of experience,
              categories you build in. Optional.
            </li>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Shop Policies</span> — your returns, warranty, and
              shipping approach, plus a confirmation checkbox. <span className="italic">Required.</span>
            </li>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>References</span> — if you have past customers
              willing to vouch for you, add them here. Optional, and verified references earn you a "Verified Builder"
              badge.
            </li>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Payments</span> — connect Stripe (see above). Not
              required to finish setup, but required before you can get paid.
            </li>
            <li>
              <span className="font-medium" style={{ color: NAVY }}>Next Steps</span> — a checklist showing what's done
              and what's left before you can submit your storefront for review.
            </li>
          </ol>

          {/* Your First Listing */}
          <SectionHeading>Your First Listing</SectionHeading>
          <P>
            Before your storefront can go live, you'll need at least one complete listing — either a ready-made
            instrument or just check the box that you offer custom builds — both count. If you are adding a stock build,
            it needs a name, price, at least one photo, and whatever specs (wood, scale length, electronics, etc.) help
            buyers understand what makes your build worth a closer look. Once that's in place, you can submit your
            storefront for review.
          </P>
          <P>
            <span className="font-semibold" style={{ color: NAVY }}>A note on this one:</span> this is one of the areas
            where we need your input in order to get this right. We know the product specs section needs some work to
            make it the best possible experience for buyers. We've taken a first pass at which specs matter most for
            showcasing the build, but we really want your input. If a field feels like it's missing something important,
            asking for the wrong thing, or just doesn't make sense for how you build — tell us. This is the section most
            likely to change as we learn from real builders, and your feedback here matters more than almost anything
            else in this guide.
          </P>

          {/* Getting Approved */}
          <SectionHeading>Getting Approved</SectionHeading>
          <P>
            We will personally review every new storefront before it goes live on the public site — checking your
            profile, photos, and listing to make sure everything looks right. This isn't a gatekeeping step; it's just a
            quick sanity check to make sure everything displays properly before it's public. Most storefronts sail through
            with no issues. We'll be in touch as soon as it's approved.
          </P>
          <P>
            <span className="font-semibold" style={{ color: NAVY }}>Just a heads up,</span> even after we review and
            approve your storefront, we don't plan to promote the site until we have enough builders and products to make
            it interesting.
          </P>

          {/* How You Can Help Us */}
          <SectionHeading>How You Can Help Us</SectionHeading>
          <P>
            You're one of our very first builders, and that means your experience matters more than you might think. As
            you go through setup and list your first instruments, keep an eye out for anything that's confusing,
            missing, or just feels off — and jot it down as you go.
          </P>
          <P>
            A running note in a Google Doc, a text, an email, whatever's easiest — share it with us whenever you have a
            few minutes, even if it's just a quick list. We'd genuinely rather hear about the rough edges now, while
            it's just a handful of us figuring this out together, than after we've opened the doors more widely.
          </P>
          <P>
            Have a question this guide didn't cover — payments, shipping, custom builds, and the like? Check the{" "}
            <Link to={createPageUrl("BuilderFAQ")} className="underline font-medium" style={{ color: NAVY }}>
              Builder FAQ
            </Link>{" "}
            for quick answers.
          </P>

          {/* Need Help */}
          <SectionHeading>Need Help? We're Right Here.</SectionHeading>
          <P>Seriously — reach out any time, however's easiest for you:</P>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 my-5">
            <a
              href="mailto:info@stringedcollective.com"
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#E8E5E0", color: NAVY }}
            >
              <Mail className="w-4 h-4" />
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8A9BB0" }}>Email</p>
                <p className="text-sm font-medium">info@stringedcollective.com</p>
              </div>
            </a>
            <a
              href="https://wa.me/16302044451"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ borderColor: "#E8E5E0", color: NAVY }}
            >
              <MessageCircle className="w-4 h-4" />
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8A9BB0" }}>WhatsApp</p>
                <p className="text-sm font-medium">+1 630 204 4451</p>
              </div>
            </a>
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg border"
              style={{ borderColor: "#E8E5E0", color: NAVY }}
            >
              <Instagram className="w-4 h-4" />
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8A9BB0" }}>Instagram</p>
                <p className="text-sm font-medium" style={{ color: "#8A9BB0" }}>Coming Soon</p>
              </div>
            </div>
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg border"
              style={{ borderColor: "#E8E5E0", color: NAVY }}
            >
              <Facebook className="w-4 h-4" />
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8A9BB0" }}>FB Messenger</p>
                <p className="text-sm font-medium" style={{ color: "#8A9BB0" }}>Coming Soon</p>
              </div>
            </div>
          </div>
          <P>
            We'd rather answer five small questions than have you stuck on something that should've been simple. Welcome
            aboard.
          </P>
        </div>

        {/* Footer nav */}
        <div className="mt-14 pt-8 border-t" style={{ borderColor: "#E8E5E0" }}>
          <Link
            to={createPageUrl("BuilderResources")}
            className="inline-flex items-center gap-1 text-sm font-medium transition-opacity opacity-70 hover:opacity-100"
            style={{ color: NAVY }}
          >
            <ChevronLeft className="w-4 h-4" /> Back to Builder Resources
          </Link>
        </div>
      </div>
    </div>
  );
}