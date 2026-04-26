import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown, ChevronLeft } from "lucide-react";

const NAVY = "#1B2B4B";

const faqSections = [
  {
    title: "About Stringed Collective",
    items: [
      {
        question: "What is Stringed Collective?",
        answer: "Stringed Collective is a marketplace built for independent instrument builders. It gives builders a professional place to present their work, connect with buyers, manage transactions, and sell through a platform designed around trust and craftsmanship.",
      },
      {
        question: "Who is the platform for?",
        answer: "Stringed Collective is designed for independent builders, makers, and small shops creating handcrafted or boutique instruments. It is meant for builders who want a more professional way to showcase their work and manage sales online.",
      },
      {
        question: "What does Stringed Collective handle for builders?",
        answer: "Stringed Collective supports the transaction side of the business so builders can stay focused on the work. That includes storefront tools, listings, buyer discovery, payment processing, shipment verification, and transaction support.",
      },
    ],
  },
  {
    title: "Getting Started",
    items: [
      {
        question: "How do I get started as a builder?",
        answer: "Builders start by creating an account, setting up their profile, adding their builder policies, and creating listings. Your profile is where buyers begin to get a feel for who you are, what you build, and what kind of work you do.",
      },
      {
        question: "What builder policies do I need to set up?",
        answer: "Builders set up their builder policies through the platform. These include your custom-build deposit amount, expected build time, return policy, and warranty policy.",
      },
      {
        question: "Are my builder policies part of the transaction?",
        answer: "Yes. Your builder-defined policies become part of the transaction terms for the order. That helps both sides understand the expectations before work begins.",
      },
    ],
  },
  {
    title: "Listings and Selling",
    items: [
      {
        question: "How do I list instruments?",
        answer: "Builders create listings through their builder tools. A listing should clearly describe the instrument, including photos, specifications, pricing, availability, shipping details, condition, and any important limitations or delays.",
      },
      {
        question: "What can I sell on Stringed Collective?",
        answer: "Builders can list handcrafted instruments and related items they directly build, design, or accurately describe in a way approved by Stringed Collective. Mass-produced, drop-shipped, counterfeit, infringing, or deceptively described products are not allowed.",
      },
      {
        question: "What is the difference between a stock build and a custom build?",
        answer: "A stock build is a completed instrument listed for sale and ready to ship. A custom build is created after the builder and buyer agree on specifications. Custom builds usually involve a deposit, a build timeline, and a final payment before shipment.",
      },
      {
        question: "Can I list an instrument as ready to ship?",
        answer: "Yes, but only if the instrument is actually completed, available, and ready to ship as described. Buyers should be able to rely on that label with confidence.",
      },
      {
        question: "What are buyer references and builder badges?",
        answer: "Buyer References & Verified Builder Badge\n\nThe \"Verified Builder\" badge is a trust signal awarded to builders who successfully verify past buyer references.\n\nHow it Works: Builders submit contact information (email or phone) for up to two past buyers along with a short quote from them. Stringed Collective's team then reaches out to these references to confirm their authenticity.\n\nBenefits: Once enough references are verified (typically two), the builder earns the \"Verified Builder\" badge. This badge appears on their storefront, signaling to potential buyers that the builder has a track record of satisfied customers and has been vetted by the platform. This helps new buyers feel more confident engaging with the builder.\n\nOther Badge Options\n\nStringed Collective also features other badges to highlight builders:\n\nFounding Builder Badge: An exclusive, admin-assigned recognition for early builders who played a significant role in launching the marketplace. It distinguishes pioneers of the platform.\n\nFeatured Builder Badge: Admin-assigned to builders whose storefronts are actively promoted and showcased on the platform. This typically highlights builders with exceptional profiles, unique offerings, or strong engagement.",
      },
    ],
  },
  {
    title: "Orders, Payments, and Payouts",
    items: [
      {
        question: "How are payments handled?",
        answer: "All payments are processed through Stringed Collective. We collect buyer payments, hold funds when needed, verify shipment, and release payouts based on the stage of the order.\n\nThat structure helps protect both builders and buyers, and it keeps the transaction clear from start to finish.",
      },
      {
        question: "What does \"guaranteed transactions\" mean?",
        answer: "Stringed Collective acts as the trusted broker between builders and buyers. We manage payments, verify shipment information, and step in if a transaction breaks down or one side does not follow through.\n\nThe goal is to make high-trust, high-value instrument sales feel safer for everyone involved.",
      },
      {
        question: "When do builders get paid for stock builds?",
        answer: "For stock builds, the buyer pays through the platform and the builder ships the instrument. Once valid tracking is uploaded and the shipment is verified, Stringed Collective releases the payout.\n\nFor a builder's first transaction, payout is released after delivery confirmation as part of first-transaction protection.",
      },
      {
        question: "How do custom-build deposits work?",
        answer: "For custom builds, the buyer pays the deposit set by the builder's policy. That deposit confirms the buyer's commitment to the project.\n\nOnce the deposit is received, it is released to the builder so materials can be purchased and work can begin. Receiving the deposit does not change the builder's responsibility to complete the order according to the agreed terms.",
      },
      {
        question: "When is the final payment released for a custom build?",
        answer: "When the builder marks the build complete, the buyer is prompted to make the final payment. The instrument should not ship until that payment has been received through the platform.\n\nAfter the builder ships the order and uploads valid tracking, Stringed Collective verifies the shipment and then releases the final payout.",
      },
      {
        question: "What is shipment verification?",
        answer: "Shipment verification is the step where Stringed Collective confirms that the tracking number is valid and that the shipment is active with the carrier before releasing payout.\n\nThis helps protect both sides of the transaction and keeps the payout process tied to real shipment activity.",
      },
      {
        question: "What is first-transaction protection?",
        answer: "For a builder's first transaction on the platform, payout is released after delivery confirmation rather than immediately after shipment verification.\n\nThis extra step helps protect the marketplace early in a builder's selling history and builds trust for future transactions.",
      },
    ],
  },
  {
    title: "Shipping, Returns, and Warranty",
    items: [
      {
        question: "Who ships the instrument?",
        answer: "Builders are responsible for packaging and shipping the instrument, submitting accurate shipment information, and using valid tracking.",
      },
      {
        question: "What is the builder responsible for during fulfillment?",
        answer: "Builders are responsible for accurate listings, product quality, fulfillment, packaging, shipment, delivery, and following through on their return and warranty commitments.",
      },
      {
        question: "When does risk of loss shift?",
        answer: "Unless a transaction states otherwise, risk of loss stays with the builder until the order has been shipped in accordance with platform requirements and accepted by the carrier.",
      },
      {
        question: "How do returns work?",
        answer: "Each builder sets their own return policy through the platform. That policy becomes part of the transaction and governs the order, along with platform rules and applicable law.",
      },
      {
        question: "When does the return window begin?",
        answer: "Unless the transaction states otherwise, the return period begins when the shipment is marked delivered.",
      },
      {
        question: "How do warranties work?",
        answer: "Builders set their own warranty policy. Warranty terms become part of the transaction, and coverage generally begins when the instrument is delivered to the buyer.",
      },
    ],
  },
  {
    title: "Fees and Platform Rules",
    items: [
      {
        question: "What does Stringed Collective cost?",
        answer: "Builders can join Stringed Collective without listing fees or monthly subscription fees. The platform collects a 5% transaction fee on completed sales, subject to any approved founding-builder or promotional program.",
      },
      {
        question: "Can I complete a transaction outside the platform with a buyer I met on Stringed Collective?",
        answer: "No. If a buyer comes through Stringed Collective, the transaction needs to stay on the platform. That protects both sides and preserves the payment flow, transaction record, and marketplace protections.",
      },
      {
        question: "Do I need to communicate with buyers through the platform?",
        answer: "Yes. Transaction-related communication should stay on the platform whenever those tools are available. That keeps the details clear and creates a record if timing, specifications, or disputes ever need to be reviewed.",
      },
      {
        question: "Can Stringed Collective recover money from future payouts if something goes wrong?",
        answer: "Yes. If Stringed Collective has to refund or compensate a buyer because of a builder-caused transaction failure, those amounts can be recovered through future payout deductions, offsets, withheld funds, or direct reimbursement.",
      },
    ],
  },
  {
    title: "Delays, Problems, and Support",
    items: [
      {
        question: "What happens if I am delayed on a custom build?",
        answer: "Builders are expected to give a good-faith build timeline and communicate promptly if a meaningful delay comes up.\n\nIf a custom build is not completed or shipped within the expected build time plus seven calendar days, and there is no approved extension or documented agreement with the buyer, Stringed Collective can step in to review the order and determine the next step.",
      },
      {
        question: "What happens if a buyer does not pay the final balance?",
        answer: "If a buyer does not pay the final balance after a custom build is marked complete, Stringed Collective applies the platform's buyer default process. That can include a limited payment window, cancellation of the order, and application of the builder's published deposit or cancellation policy where permitted.",
      },
      {
        question: "What happens if a builder cannot complete an order?",
        answer: "If a builder does not fulfill an order, does not ship, materially delays performance, or materially misrepresents the item, Stringed Collective steps in and reviews the transaction. That can lead to a refund, credit, reversal, or other corrective action depending on the situation.",
      },
      {
        question: "How does Stringed Collective handle disputes or transaction issues?",
        answer: "When there is a transaction problem, Stringed Collective reviews the platform record, including messages, order details, and tracking information. We then determine the appropriate next step based on the transaction terms, platform rules, and the facts of the situation.",
      },
      {
        question: "How do I get help?",
        answer: "If you need help with your storefront, listings, orders, payouts, or a transaction issue, contact Stringed Collective support through the platform's builder support tools.",
      },
    ],
  },
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b" style={{ borderColor: "#E8E5E0" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left py-4 gap-4 group"
      >
        <span className="text-sm font-medium leading-snug" style={{ color: NAVY }}>
          {question}
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
          style={{ color: "#8A9BB0", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="pb-5">
          {answer.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3 last:mb-0 whitespace-pre-line">
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BuilderFAQ() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBF8" }}>
      {/* Page Header */}
      <div className="border-b" style={{ borderColor: "#E8E5E0" }}>
        <div className="max-w-3xl mx-auto px-6 py-14">
          <Link
            to={createPageUrl("BuilderResources")}
            className="inline-flex items-center gap-1 text-sm mb-6 transition-opacity opacity-60 hover:opacity-100"
            style={{ color: NAVY }}
          >
            <ChevronLeft className="w-4 h-4" /> Builder Resources
          </Link>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#8A9BB0" }}>
            Builder FAQ
          </p>
          <h1 className="text-3xl font-bold mb-3" style={{ color: NAVY }}>
            Builder FAQ
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-xl">
            Answers to the questions builders ask most often about selling on Stringed Collective.
          </p>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-14">
        {faqSections.map((section) => (
          <div key={section.title}>
            <h2
              className="text-xs font-semibold tracking-widest uppercase mb-5 pb-3 border-b-2"
              style={{ color: "#8A9BB0", borderColor: NAVY }}
            >
              {section.title}
            </h2>
            <div>
              {section.items.map((item) => (
                <FAQItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}