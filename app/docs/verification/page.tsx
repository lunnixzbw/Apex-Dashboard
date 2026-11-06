import type { Metadata } from "next";
import { H1, Lead, H2, P, Steps, Note } from "@/components/docs/prose";
import { BRAND, docsHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Verification",
  description: `How ${BRAND} website verification works and how to turn it on.`,
  alternates: { canonical: docsHref("/verification") },
};

export default function VerificationDoc() {
  return (
    <>
      <H1>Verification</H1>
      <Lead>Stop raid bots and alts with a one-click check, a captcha image, or a Cloudflare security check on our website.</Lead>

      <H2>Methods</H2>
      <P><b>Button</b>: members press Verify and get the role. <b>Captcha</b>: members type the characters from an image. <b>Both</b>: shows both options. <b>Website</b>: members are sent to a page that runs a Cloudflare check that blocks bots, then press Verify.</P>

      <H2>Turn it on</H2>
      <Steps items={[
        { title: "Open the dashboard", body: <>Pick your server and open <b>Verification</b>.</> },
        { title: "Choose a channel and a role", body: <>The channel is where the panel is posted. The role is what members get when they pass.</> },
        { title: "Select the method", body: <>Choose <b>Website + Cloudflare check</b> and enable verification. {BRAND} posts the panel straight away.</> },
        { title: "Move the role", body: <>Make sure the {BRAND} role is above the verified role so it can hand it out.</> },
      ]} />

      <H2>What members see</H2>
      <Steps items={[
        { title: "Press Verify in the panel", body: <>{BRAND} replies privately with a personal link.</> },
        { title: "Pass the security check", body: <>The link opens the verification page. Cloudflare checks the visitor is human, then they press <b>Verify</b>.</> },
        { title: "Get access", body: <>They receive the verified role and {BRAND} sends them a DM saying they have been verified in your server.</> },
      ]} />
      <Note>The link works only for the member it was made for, can be used once and expires after 15 minutes. If it expires, they simply press Verify in the panel again.</Note>
    </>
  );
}
