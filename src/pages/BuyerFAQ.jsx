import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronDown, ChevronLeft } from "lucide-react";

const NAVY = "#1B2B4B";

const faqSections = [
  {
    title: "About Buying on Stringed Collective",
    items: [
      {
        question: "What is Stringed Collective?",
        answer: "Stringed Collective is a marketplace that connects buyers with independent instrument builders. It gives players a way to discover handcrafted instruments, purchase completed builds, and work directly with builders on custom instruments through a platform designed to make the process clearer and safer.",
      },
      {
        question: "Is Stringed Collective the builder or seller of the instrument?",
        answer: "Stringed Collective operates the marketplace and helps manage the transaction, but the instrument itself is built and sold by the independent builder. The platform supports the process by handling payments, transaction administration, shipment verification where required, and marketplace protections.",
      },
      {
        question: "Why buy through Stringed Collective instead of paying a builder directly?",
        answer: "Stringed Collective is designed to reduce the risk that can come with buying a high-value handmade instrument online. The platform helps manage payments, keeps a clear transaction record, verifies shipment information where required, and can step in if a transaction breaks down or one side does not fulfill its obligations.",
      },
    ],
  },
  {
    title: "Stock Builds and Custom Builds",
    items: [
      {
        question: "What is the difference between a stock build and a custom build?",
        answer: "A stock build is a completed instrument that is listed for sale and ready to ship. A custom build is made after the buyer and builder agree on specifications. Custom builds usually involve a deposit, a build timeline, and a final payment before shipment.",
      },
      {
        question: "How does a stock build purchase work?",
        answer: "For a stock build, the buyer purchases the instrument through the platform and pays the full purchase amount. The builder then ships the instrument, and Stringed Collective may verify the shipment before releasing payout to the builder.",
      },
      {
        question: "How does a custom build work?",
        answer: "For a custom build, the buyer and builder agree on the specifications through the platform. A transaction record or purchase agreement may then be created. The buyer pays the required deposit, the builder begins work, and the buyer pays the final balance once the build is complete and ready to move to shipment.",
      },
      {
        question: "Can I talk with a builder before committing to a custom build?",
        answer: "Yes. Buyers and builders can use the platform's communication tools to discuss specifications, timing, and other project details before moving forward.",
      },
    ],
  },
  {
    title: "Payments, Deposits, and Final Balance",
    items: [
      {
        question: "How are payments handled?",
        answer: "Payments are processed through Stringed Collective. By placing an order, you authorize Stringed Collective and its payment service providers to charge your selected payment method for deposits, full purchase amounts, final balances, shipping charges, taxes, and other disclosed charges associated with your order.",
      },
      {
        question: "How do deposits work on a custom build?",
        answer: "A deposit confirms the buyer's commitment to the project. The amount is set by the builder's policy and becomes part of the transaction terms. Under platform rules, the deposit may be released to the builder so materials can be purchased and work can begin.",
      },
      {
        question: "Is a custom-build deposit refundable?",
        answer: "Deposits are governed by the builder's disclosed policy, the transaction terms, platform rules, and applicable law. In many cases, a deposit may become nonrefundable once work has begun or material costs have been incurred. If a builder fails to perform or platform protection rules apply, Stringed Collective may review the transaction and provide a refund, credit, or other remedy where appropriate.",
      },
      {
        question: "When is final payment due?",
        answer: "When the builder marks a custom build as complete, the buyer is notified that final payment is required. Under the current transaction rules, final payment must be submitted within five (5) calendar days after notice is sent through the platform.",
      },
      {
        question: "Can a builder ship before I make the final payment?",
        answer: "No. For custom builds, shipment cannot happen until final payment has been received through the platform.",
      },
    ],
  },
  {
    title: "Shipping, Delivery, Returns, and Warranty",
    items: [
      {
        question: "Who ships the instrument?",
        answer: "The builder is responsible for packaging and shipping the instrument. Buyers are responsible for providing an accurate shipping address and contact information.",
      },
      {
        question: "What is shipment verification?",
        answer: "Shipment verification is part of the platform's transaction protection process. Before certain payouts are released, Stringed Collective may confirm that a tracking number exists and that the shipment is active with the carrier.",
      },
      {
        question: "When does the return period begin?",
        answer: "Unless otherwise stated in the applicable transaction terms, the return period begins when the shipment is marked delivered.",
      },
      {
        question: "How do returns work?",
        answer: "Returns are governed by the builder's return policy, the transaction terms, platform rules where applicable, and the law. Each builder sets their own return policy through the platform, and that policy becomes part of the order.",
      },
      {
        question: "How do warranties work?",
        answer: "Warranty terms are set by the builder and incorporated into the transaction terms. Unless otherwise stated, warranty coverage begins when the instrument is delivered.",
      },
    ],
  },
  {
    title: "Delays, Cancellations, and Transaction Issues",
    items: [
      {
        question: "What happens if a builder is delayed?",
        answer: "If a builder expects a material delay, they are expected to communicate it through the platform. If a custom build is not completed or shipped within the expected build time plus seven calendar days, and no approved extension or documented agreement exists, Stringed Collective may review the order and determine whether cancellation, refund, credit, or another remedy is appropriate.",
      },
      {
        question: "Can I cancel an order?",
        answer: "Cancellation rights depend on the type of order, the builder's policy, the transaction terms, platform rules, and applicable law. Buyers may not cancel outside the cancellation rights provided by those terms. Stock build cancellations may be possible before shipment. Custom build cancellations are usually more limited once work has started or materials have been purchased.",
      },
      {
        question: "What happens if a builder cannot complete the order?",
        answer: "If a builder fails to complete the order, fails to ship, materially delays performance, or materially misrepresents the item, Stringed Collective may intervene and may issue a refund, credit, reversal, or other remedy according to platform rules and applicable law.",
      },
      {
        question: "What happens if I do not pay the final balance on time?",
        answer: "If final payment is not made within the required payment window after a custom build is marked complete, the platform may cancel the order, apply the builder's cancellation or deposit policy where permitted, restrict account privileges, limit future purchasing privileges, or take other steps needed to resolve the transaction.",
      },
    ],
  },
  {
    title: "Trust, Protection, and Support",
    items: [
      {
        question: "What does Stringed Collective do if there is a dispute or transaction problem?",
        answer: "Stringed Collective may review records from the platform, including messages, order details, and tracking information. Depending on the situation, the platform may pause or review the transaction, issue a refund, partial refund, or credit, cancel an order, deny a claim, or take other protective action consistent with platform rules and applicable law.",
      },
      {
        question: "Why does Stringed Collective ask buyers and builders to keep transaction-related communication on the platform?",
        answer: "Keeping the conversation on the platform helps protect both sides. It creates a clear record of specifications, timing, changes, and other important details in case a question or dispute needs to be reviewed later.",
      },
      {
        question: "Should I use the platform instead of paying or arranging the deal off-platform?",
        answer: "Yes. Moving a transaction off-platform removes the protections, oversight, and transaction record that Stringed Collective provides. Buyers should complete payments and transaction-related communication through the platform whenever those tools are available.",
      },
      {
        question: "What if I want to dispute a charge with my payment provider?",
        answer: "Before initiating a chargeback or external payment dispute, buyers are expected to first contact Stringed Collective through the platform's support or dispute process, unless prohibited by law. Misusing the chargeback process or making false payment claims may lead to account restrictions, recovery of losses, or denial of future use of the platform.",
      },
      {
        question: "How do I get help?",
        answer: "If you need help with an order, payment, shipping issue, return question, or transaction problem, contact Stringed Collective support through the platform's support tools.",
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
        className="w-full flex items-center justify-between text-left py-4 gap-4"
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
          <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function BuyerFAQ() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBF8" }}>
      {/* Page Header */}
      <div className="border-b" style={{ borderColor: "#E8E5E0" }}>
        <div className="max-w-3xl mx-auto px-6 py-14">
          <Link
            to={createPageUrl("Account")}
            className="inline-flex items-center gap-1 text-sm mb-6 transition-opacity opacity-60 hover:opacity-100"
            style={{ color: NAVY }}
          >
            <ChevronLeft className="w-4 h-4" /> My Account
          </Link>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#8A9BB0" }}>
            Buyer FAQ
          </p>
          <h1 className="text-3xl font-bold mb-3" style={{ color: NAVY }}>
            Buyer FAQ
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-xl">
            Answers to the questions buyers ask most often about purchasing on Stringed Collective.
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