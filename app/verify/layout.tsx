import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify",
  description: "Finish verifying for your Discord server.",
  robots: { index: false, follow: false },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
