import Stripe from "stripe";

let target = process.env.STRIPE_TARGET;

// 1. Safety check: Target environment validation
if (!target) {
  console.warn("STRIPE_TARGET non definito. Utilizzo di TEST di default.");
  target = "TEST";
}

const allowedTargets = ["IT", "TH", "TEST"];
if (!allowedTargets.includes(target)) {
  console.warn(`STRIPE_TARGET "${target}" non valido. Utilizzo di TEST di default.`);
  target = "TEST";
}

// 2. Resolve target secret key
let secretKey = "";
if (target === "IT") {
  secretKey = process.env.STRIPE_SECRET_KEY_IT || "";
} else if (target === "TH") {
  secretKey = process.env.STRIPE_SECRET_KEY_TH || "";
} else if (target === "TEST") {
  secretKey = process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || "";
}

// 3. Safety check: Secret key validation
if (!secretKey) {
  console.warn(
    `Stripe secret key missing for target environment "${target}". ` +
    `Stripe calls will fail until valid key is provided.`
  );
}

// 4. Initialize Stripe client
export const stripe = new Stripe(secretKey || "sk_test_placeholder", {
  apiVersion: "2023-10-16" as any,
});

export const STRIPE_TARGET = target;
