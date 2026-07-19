import Stripe from "stripe";

const target = process.env.STRIPE_TARGET;

// 1. Safety check: Target environment validation
if (!target) {
  throw new Error(
    "FATAL: STRIPE_TARGET is not defined in the environment. " +
    "Must be set to one of: IT, TH, TEST. Server execution blocked."
  );
}

const allowedTargets = ["IT", "TH", "TEST"];
if (!allowedTargets.includes(target)) {
  throw new Error(
    `FATAL: STRIPE_TARGET "${target}" is invalid. ` +
    "Must be set to one of: IT, TH, TEST. Server execution blocked."
  );
}

// 2. Resolve target secret key
let secretKey = "";
if (target === "IT") {
  secretKey = process.env.STRIPE_SECRET_KEY_IT || "";
} else if (target === "TH") {
  secretKey = process.env.STRIPE_SECRET_KEY_TH || "";
} else if (target === "TEST") {
  secretKey = process.env.STRIPE_SECRET_KEY_TEST || "";
}

// 3. Safety check: Secret key validation
if (!secretKey) {
  throw new Error(
    `FATAL: Stripe secret key is missing for target environment "${target}". ` +
    `Please set STRIPE_SECRET_KEY_${target} in your environment. Server execution blocked.`
  );
}

// 4. Initialize Stripe client
export const stripe = new Stripe(secretKey, {
  apiVersion: "2023-10-16" as any,
});

export const STRIPE_TARGET = target;
