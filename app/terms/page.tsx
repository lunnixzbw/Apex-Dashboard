import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal";
import { BRAND } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The rules for using ${BRAND}, its website and ${BRAND} Premium.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      intro={`By adding ${BRAND} to a server, signing in to the dashboard or buying Premium you agree to these terms.`}
      sections={[
        { title: "Who we are and what this covers", paras: [
          `${BRAND} ("we", "us") is a Discord bot and website that provide moderation, security, community and utility tools. These terms cover the bot, this website, the dashboard and ${BRAND} Premium (together, the "Service").`,
          "If you use the Service on behalf of a server or community, you confirm that you have the authority to do so.",
        ] },
        { title: "Using the Service", paras: ["You must follow these rules whenever you use the Service:"], list: [
          "Follow the Discord Terms of Service and Community Guidelines. You must meet Discord's minimum age requirement.",
          "Do not use the Service to harass, scam, spam, raid or harm others, or to break the law.",
          "Do not try to attack, overload, reverse engineer or find ways around the limits of the Service, including the payment and verification systems.",
          "Do not resell or share Premium in a way that goes beyond the number of servers your plan allows.",
          "You are responsible for how you configure the bot in your server, including who you give moderation and security powers to.",
        ] },
        { title: "Your account", paras: [
          "You sign in with Discord. We only receive your Discord user ID, name, avatar and the list of servers you are in. You are responsible for everything done through your account.",
        ] },
        { title: `${BRAND} Premium`, paras: [
          `${BRAND} Premium is an optional paid upgrade that belongs to your Discord account. Each plan lasts for a fixed period and allows Premium to be activated on a fixed number of servers. Plans are one-time payments and do not renew automatically. Buying again adds the new period on top of the time you have left.`,
          "Prices are shown in Indian Rupees (INR) on the Premium page, including any taxes that apply, and may change for future purchases. Payments are processed by Razorpay. We never see or store your card, UPI or bank details.",
          "When a Premium period ends, the affected servers return to the free limits. Your data and settings are not deleted.",
          "Refunds are covered in our Refund & Cancellation Policy.",
        ] },
        { title: "Availability and changes", paras: [
          "We work to keep the Service online but do not promise it will always be available or free of errors. We may add, change or remove features, including features that are part of Premium, and we may change these terms. If a change is important we will announce it on this website or in the support server. Using the Service after a change means you accept it.",
        ] },
        { title: "Suspension", paras: [
          "We may remove the bot from a server, block a user or end Premium without a refund if these terms are broken, if a payment is reversed or found to be fraudulent, or if needed to protect the Service or other people.",
        ] },
        { title: "Content and ownership", paras: [
          `The ${BRAND} name, logo, website and bot code belong to us. You keep ownership of the content in your server. You give us permission to process it only as needed to provide the features you turn on.`,
        ] },
        { title: "No warranty and limit of liability", paras: [
          `The Service is provided "as is" and "as available". The security tools reduce risk but cannot guarantee that a server will never be attacked. To the fullest extent allowed by law, we are not liable for indirect or consequential losses, lost data, lost profits or damage to a server, and our total liability for any claim is limited to the amount you paid us in the 3 months before the claim.`,
        ] },
        { title: "Governing law", paras: [
          "These terms are governed by the laws of India. Courts in India will have jurisdiction over any dispute, unless the law where you live gives you rights that cannot be waived.",
        ] },
      ]}
    />
  );
}
