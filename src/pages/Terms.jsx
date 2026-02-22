export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">Terms of Service</h1>
      <p className="text-stone-400 text-sm mb-10">Last updated: January 2025</p>

      <div className="prose prose-stone max-w-none space-y-8">
        {[
          { title: "1. Acceptance of Terms", content: "By accessing or using Stringed Collective, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service." },
          { title: "2. Marketplace Role", content: "Stringed Collective is a marketplace platform that connects independent guitar builders (sellers) with buyers. We are not a party to any transactions between buyers and sellers, and we are not responsible for the actions of any buyer or seller." },
          { title: "3. Builder Accounts", content: "Builders must apply and be approved to list instruments on our platform. By joining as a builder, you agree to provide accurate information about your products, fulfill orders in a timely manner, and maintain a professional standard of communication." },
          { title: "4. Transactions & Payments", content: "All payments are processed securely through Stripe. Stringed Collective charges a commission on each sale. Payment to builders will be disbursed according to our standard payout schedule after any applicable hold periods." },
          { title: "5. Prohibited Items", content: "You may not list counterfeit instruments, stolen property, or items that infringe on third-party intellectual property rights. We reserve the right to remove any listings that violate these terms." },
          { title: "6. Dispute Resolution", content: "In the event of a dispute between a buyer and seller, we encourage both parties to work together to reach a resolution. Stringed Collective may, at our discretion, mediate disputes but is under no obligation to do so." },
          { title: "7. Limitation of Liability", content: "To the maximum extent permitted by law, Stringed Collective shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues." },
          { title: "8. Changes to Terms", content: "We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the platform following the notice constitutes acceptance of the revised terms." },
        ].map(({ title, content }) => (
          <div key={title}>
            <h2 className="text-lg font-bold text-stone-800 mb-2">{title}</h2>
            <p className="text-stone-600 leading-relaxed">{content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}