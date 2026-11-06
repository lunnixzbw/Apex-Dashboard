import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: `Refund and cancellation rules for ${BRAND} Premium purchases.`,
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund & Cancellation"
      intro={`How refunds and cancellations work for ${BRAND} Premium.`}
      sections={[
        { title: "What you are buying", paras: [
          `${BRAND} Premium is a digital service. It is activated on your account within moments of a successful payment and you can start using it straight away.`,
        ] },
        { title: "No automatic renewal, nothing to cancel", paras: [
          "Every plan is a one-time payment for a fixed period (for example 30 days). We never charge you again on our own. When the period ends, Premium simply stops and your servers go back to the free limits. There is no subscription to cancel.",
        ] },
        { title: "Refunds", paras: [
          "Because Premium is delivered instantly and cannot be returned, payments are generally not refundable once Premium has been activated. We will refund or correct your purchase in these cases:",
        ], list: [
          "You were charged but Premium was not added to your account and we cannot fix it.",
          "You were charged more than once for the same purchase.",
          "A technical fault on our side stopped you from using Premium for a significant part of the period you paid for.",
        ], after: [
          "Refunds are not given for change of mind, for bans or removals caused by breaking our Terms, or because a server was removed or no longer exists.",
        ] },
        { title: "How to ask", paras: [
          "Send a ticket from the contact page or open one in the support server within 7 days of the payment. Include your Discord user ID and the Razorpay payment ID (it starts with pay_). Do not share card or UPI details.",
        ] },
        { title: "How long it takes", paras: [
          "We aim to answer within 3 working days. Approved refunds are returned to the original payment method through Razorpay and usually reach your account within 5 to 7 working days, depending on your bank.",
        ] },
        { title: "Failed payments", paras: [
          "If a payment fails or is cancelled and money leaves your account, the bank or Razorpay normally returns it automatically within 5 to 7 working days. If Premium was not added and the money is not returned, contact us with the payment ID.",
        ] },
      ]}
    />
  );
}
