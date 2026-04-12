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
        answer: "Stringed Collective helps with storefront tools, listings, buyer discovery, payment processing, transaction oversight, shipment verification, and marketplace protections. The goal is to let builders stay focused on the work while the platform helps support the business side of the transaction.",
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
        answer: "Builders are expected to set up and maintain their builder policies through the platform. These may include your custom-build deposit amount, expected build time, return policy, and warranty policy.",
      },
      {
        question: "Are my builder policies part of the transaction?",
        answer: "Yes. Your builder-defined policies are incorporated into the applicable transaction agreement. That means the policies attached to the order become part of the transaction terms.",
      },
    ],
  },
  {
    title: "Listings and Selling",
    items: [
      {
        question: "How do I list instruments?",
        answer: "Builders can create listings through their builder tools. Listings should clearly describe the instrument, including photos, specifications, pricing, availability, shipping details, condition, and any important limitations or delays.",
      },
      {
        question: "What can I sell on Stringed Collective?",
        answer: "Builders may list handcrafted instruments and related items they directly build, design, or otherwise accurately describe in a manner approved by Stringed Collective. Mass-produced, drop-shipped, counterfeit, infringing, or deceptively described products are not allowed unless expressly approved in writing.",
      },
      {
        question: "What is the difference between a stock build and a custom build?",
        answer: "A stock build is a completed instrument listed for sale and ready to ship. A custom build is created after the builder and buyer agree on specifications. Custom builds usually involve a deposit, a build timeline, and a final payment before shipment.",
      },
      {
        question: "Can I list an instrument as ready to ship?",
        answer: "Yes, but only if the instrument is actually completed, available, and ready to ship as described. Builders are responsible for making sure listing information is accurate.",
      },
    ],
  },
  {
    title: "Orders, Payments, and Payouts",
    items: [
      {
        question: "How are payments handled?",
        answer: "All payments are processed through Stringed Collective. Depending on the order type and stage of the transaction, the platform may collect buyer payments, hold funds temporarily, verify shipment information, release payouts according to platform rules, and deduct applicable fees, chargebacks, refund costs, or other permitted amounts.",
      },
      {
        question: "What does \"guaranteed transactions\" mean?",
        answer: "Stringed Collective acts as a trusted broker between builders and buyers. The platform helps reduce risk by administering payments, verifying shipment information where required, and stepping in if a transaction fails or one side does not fulfill its obligations.",
      },
      {
        question: "When do builders get paid for stock builds?",
        answer: "For stock builds, Stringed Collective collects the buyer's payment and the builder ships the instrument. Once valid tracking is provided and the shipment is verified, payout may be released according to platform rules. For a builder's first transaction or early transactions, additional protection may apply and payout may be delayed until delivery confirmation.",
      },
      {
        question: "How do custom-build deposits work?",
        answer: "For custom builds, the buyer pays the deposit required by the builder's policy. The deposit confirms the buyer's commitment to the project. Under platform rules, the deposit may be released promptly to the builder so materials can be purchased and work can begin. Receiving a deposit does not remove the builder's obligation to complete the order under the transaction terms and platform rules.",
      },
      {
        question: "When is the final payment released for a custom build?",
        answer: "When the builder marks the build complete, the buyer may be notified that final payment is required. Shipment cannot happen until final payment has been received through the platform. After the builder ships the order and provides valid tracking information, Stringed Collective may verify shipment before releasing the final payout.",
      },
      {
        question: "What is shipment verification?",
        answer: "Shipment verification is the process Stringed Collective uses before releasing certain payouts. This may include confirming that the tracking number exists and that the shipment is active with the carrier.",
      },
      {
        question: "What is first-transaction protection?",
        answer: "For a builder's first transaction, or in some early transactions, Stringed Collective may apply additional risk controls. This can include delaying payout until delivery confirmation instead of releasing funds immediately after shipment verification.",
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
        answer: "Builders are responsible for accurate listings, product quality, fulfillment, packaging, shipment, delivery, and compliance with their return and warranty commitments.",
      },
      {
        question: "When does risk of loss shift?",
        answer: "Unless otherwise required by law or expressly stated in the applicable transaction agreement, risk of loss remains with the builder until the order is shipped in accordance with platform requirements and carrier acceptance is confirmed.",
      },
      {
        question: "How do returns work?",
        answer: "Each builder defines their own return policy through the platform. That policy is incorporated into the applicable transaction agreement and governs the order, subject to platform rules and applicable law.",
      },
      {
        question: "When does the return window begin?",
        answer: "Unless otherwise stated in the applicable transaction terms, the return period begins when the shipment is marked delivered.",
      },
      {
        question: "How do warranties work?",
        answer: "Builders define their own warranty policy. Warranty terms are incorporated into the applicable transaction agreement, and warranty coverage generally begins when the instrument is delivered to the buyer.",
      },
    ],
  },
  {
    title: "Fees and Platform Rules",
    items: [
      {
        question: "What does Stringed Collective cost?",
        answer: "Builders can join Stringed Collective without listing fees or monthly subscription fees. The platform currently collects a 5% transaction fee on completed sales, subject to any promotional or founding-builder programs that may apply.",
      },
      {
        question: "Can I complete a transaction outside the platform with a buyer I met on Stringed Collective?",
        answer: "No. Builders may not move platform transactions off-platform to avoid fees, oversight, or marketplace protections. Violations may result in enforcement action, including listing removal, payout holds, suspension, or account termination.",
      },
      {
        question: "Do I need to communicate with buyers through the platform?",
        answer: "Yes. Transaction-related communications should take place through Stringed Collective's in-platform tools when available. This helps protect both parties and provides a clear record if a dispute, delay, or change in specifications needs to be reviewed.",
      },
      {
        question: "Can Stringed Collective recover money from future payouts if something goes wrong?",
        answer: "Yes. If Stringed Collective has to refund, credit, or otherwise compensate a buyer because of a builder-caused transaction failure, the platform may recover those amounts through offsets, deductions from future payouts, direct reimbursement requests, withheld funds, or other lawful collection methods.",
      },
    ],
  },
  {
    title: "Delays, Problems, and Support",
    items: [
      {
        question: "What happens if I am delayed on a custom build?",
        answer: "Builders are expected to provide a good-faith expected build time and communicate promptly if a material delay comes up. If a custom build is not completed or shipped within the expected build time plus seven calendar days, and no approved extension or documented buyer agreement exists, Stringed Collective may allow cancellation or provide another remedy under platform rules.",
      },
      {
        question: "What happens if a buyer does not pay the final balance?",
        answer: "If a buyer does not pay the final balance after a custom build is marked complete, Stringed Collective may apply platform buyer default rules. That can include a limited payment window, cancellation of the order, application of the builder's published deposit or cancellation policy where permitted, and other steps needed to resolve the transaction.",
      },
      {
        question: "What happens if a builder cannot complete an order?",
        answer: "If a builder fails to fulfill an order, fails to ship, materially delays performance, or materially misrepresents the item, Stringed Collective may intervene and may issue a refund, reversal, credit, or other remedy according to platform rules and applicable law.",
      },
      {
        question: "How does Stringed Collective handle disputes or transaction issues?",
        answer: "Stringed Collective may review supporting information from either party, rely on in-platform communications and tracking records, pause or review a transaction, issue a refund or credit where appropriate, deny a claim, or take other protective action consistent with platform rules and applicable law.",
      },
      {
        question: "How do I get help?",
        answer: "If you need help with your storefront, listings, orders, payouts, or transaction issues, contact Stringed Collective support through the platform's builder support tools.",
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