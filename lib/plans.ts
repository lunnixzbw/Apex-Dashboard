// Premium plans sold on the website. EDIT THE PRICES HERE: amount is in paise (100 paise = ₹1).
// Premium is a per-user subscription: the buyer chooses which of their servers get it (up to `servers`).
export type Product = "premium" | "noprefix";

export interface Plan {
  id: string;
  product: Product;
  name: string;
  days: number; // 0 = lifetime
  lifetime?: boolean;
  amount: number; // paise
  servers: number; // Premium only: how many servers the buyer can activate it on
  badge?: string;
}

const tiers = [
  { key: "weekly", name: "Weekly", days: 7 },
  { key: "monthly", name: "Monthly", days: 30 },
  { key: "quarterly", name: "3 Months", days: 90, badge: "Popular" },
  { key: "yearly", name: "Yearly", days: 365, badge: "Best value" },
  { key: "lifetime", name: "Lifetime", days: 0, badge: "Forever" },
];
const mk = (product: Product, rupees: number[]): Plan[] =>
  tiers.map((t, i) => ({ id: `${product}_${t.key}`, product, name: t.name, days: t.days, amount: rupees[i] * 100, servers: 1, badge: t.badge, lifetime: t.days === 0 }));

export const PREMIUM_PLANS = mk("premium", [20, 80, 200, 800, 950]);
export const NOPREFIX_PLANS = mk("noprefix", [10, 40, 100, 300, 500]);
export const PLANS: Plan[] = [...PREMIUM_PLANS, ...NOPREFIX_PLANS];

export const CURRENCY = "INR";

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function formatPrice(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export const PREMIUM_BENEFITS = [
  { title: "Anti-Betray", text: "Advanced protection against betrayal-related activities." },
  { title: "AI Chat", text: "Interact with AI directly through Zevion." },
  { title: "Bot Profile", text: "Customize and manage your bot profile." },
  { title: "Giveaways", text: "Access more giveaway customization and options." },
  { title: "Ticket Panels", text: "Create up to 10 ticket panels." },
  { title: "Applications", text: "Create and manage more application forms." },
  { title: "Premium Commands", text: "Unlock additional Premium-exclusive commands." },
  { title: "Exclusive Perks", text: "Get access to more Premium features and benefits." },
];

export const NOPREFIX_BENEFITS = [
  { title: "No prefix needed", text: "Run any command without typing the prefix, just the command name." },
  { title: "Works in every server", text: "It belongs to your account, so it works wherever Zevion is." },
];
