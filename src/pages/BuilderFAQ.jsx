import { useState } from "react";
import { ChevronDown } from "lucide-react";

const NAVY = "#1B2B4B";

const faqSections = [
  {
    title: "About Stringed Collective",
    items: [
      {
        question: "What is Stringed Collective?",
        answer: "Stringed Collective is a marketplace designed specifically for independent instrument builders. The platform helps builders reach players around the world, present their instruments professionally, and complete transactions securely.",
      },
      {
        question: "Who is the platform for?",
        answer: "Stringed Collective is built for independent builders who create custom or boutique instruments and want a professional platform to connect with players.\n\nBuilders maintain their own brand and storefront while the platform manages payments and transaction handling.",
      },
    ],
  },
  {
    title: "Listing Instruments",
    items: [
      {
        question: "How do I list instruments?",
        answer: "Builders can add instruments directly from the builder dashboard. Each listing includes photos, specifications, pricing, and availability.\n\nListings can represent:\n• Completed instruments ready to ship\n• Instruments built to order\n• Custom builds initiated through the platform messaging system",
      },
      {
        question: "Can I sell custom builds?",
        answer: "Yes. Buyers can contact builders through the platform to discuss custom instruments.\n\nOnce specifications and pricing are agreed upon, Stringed Collective generates a purchase agreement that documents the build specifications and payment terms.",
      },
    ],
  },
  {
    title: "Payments and Transactions",
    items: [
      {
        question: "How are payments handled?",
        answer: "All payments are processed through Stringed Collective. The platform collects payment from the buyer and holds funds until the transaction milestones are completed.\n\nThis structure protects both builders and buyers during the transaction.",
      },
      {
        question: "What does \"guaranteed transactions\" mean?",
        answer: "Stringed Collective stands between the builder and buyer to guarantee each transaction.\n\nIf either party fails to fulfill the agreed terms, the platform works to resolve the situation and ensure the other party is made whole.",
      },
      {
        question: "When do builders get paid?",
        answer: "For stock instruments, payment is released after shipment is confirmed.\n\nFor custom builds, the deposit is released when the build begins. The remaining payment is released after shipment.\n\nFor a builder's first transaction on the platform, payment is released after delivery confirmation. After the first successful transaction, payments are released upon confirmed shipment.",
      },
    ],
  },
  {
    title: "Custom Builds",
    items: [
      {
        question: "How do deposits work?",
        answer: "Builders define their own deposit policy in their builder profile. Deposits can be set as either:\n• A percentage of the total build price\n• A fixed dollar amount\n\nThese terms are automatically included in the purchase agreement.",
      },
      {
        question: "What happens after the deposit is paid?",
        answer: "Once the deposit is paid, the builder begins the build process according to the agreed specifications and timeline.\n\nBuilders may provide progress updates through the platform during the build process.",
      },
      {
        question: "When is the final payment made?",
        answer: "When the builder marks the instrument as complete, the buyer reviews the completed build and pays the remaining balance through the platform before the instrument ships.",
      },
    ],
  },
  {
    title: "Shipping",
    items: [
      {
        question: "Who ships the instrument?",
        answer: "Builders are responsible for packaging and shipping the instrument.\n\nBuilders must provide a valid tracking number from an approved shipping carrier.",
      },
      {
        question: "When is payment released?",
        answer: "For established builders, payment is released after shipment is confirmed.\n\nFor a builder's first transaction, payment is released after delivery confirmation.",
      },
    ],
  },
  {
    title: "Returns and Warranty",
    items: [
      {
        question: "What is the return policy?",
        answer: "Each builder defines their own return policy in their builder profile.\n\nThe return policy is included in the purchase agreement so buyers understand the terms before completing a purchase.",
      },
      {
        question: "When does the return window begin?",
        answer: "If a builder offers returns, the return period begins once the instrument is delivered and confirmed by the shipping carrier.",
      },
      {
        question: "How do warranties work?",
        answer: "Builders define their own warranty coverage in their builder profile.\n\nWarranty terms are included in the purchase agreement and begin once the instrument is delivered.",
      },
    ],
  },
  {
    title: "Platform Fees",
    items: [
      {
        question: "What does Stringed Collective cost?",
        answer: "Builders can join Stringed Collective at no cost.\n\nThe platform charges a 5% fee on completed sales. There are no listing fees or monthly subscription fees.",
      },
      {
        question: "What is the Founding Builder offer?",
        answer: "Founding builders pay 0% platform fees on their first three instruments sold within their first six months on the platform.\n\nAfter that period, the standard 5% transaction fee applies.",
      },
    ],
  },
  {
    title: "Builder Responsibilities",
    items: [
      {
        question: "Can builders complete transactions outside the platform?",
        answer: "Builders may not complete transactions outside Stringed Collective with buyers introduced through the platform for the purpose of avoiding platform fees.\n\nDoing so may result in removal from the marketplace.",
      },
      {
        question: "What happens if a builder cannot complete an order?",
        answer: "If a builder cannot fulfill an order, Stringed Collective will work with the buyer to resolve the situation and issue a refund if necessary.\n\nRepeated cancellations may affect a builder's ability to continue selling on the platform.",
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        question: "Can builders communicate directly with buyers?",
        answer: "Yes. Builders and buyers can communicate through the platform messaging system to discuss instruments, specifications, and custom builds.",
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
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#8A9BB0" }}>
            Builder FAQ
          </p>
          <h1 className="text-3xl font-bold mb-3" style={{ color: NAVY }}>
            Builder FAQ
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-xl">
            Everything builders need to know about selling instruments on Stringed Collective.
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