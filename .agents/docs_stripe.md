# Stripe Service Integration

## Overview
Stripe is the payment gateway service for room and accommodation bookings. It is used to generate hosted checkout pages and verify successfully completed payments.

## Environment Variables
* `STRIPE_SECRET_KEY`: The private API key (starts with `sk_test_` or `sk_live_`) used inside Vercel serverless functions.
* `STRIPE_WEBHOOK_SECRET` (optional): Endpoint webhook signing secret if webhooks are utilized.

## Key APIs & Methods Used

### 1. `stripe.checkout.sessions.create`
Creates a Stripe Checkout Session to redirect customers for payment.
* **Usage:** `api/create-checkout-session.ts`
* **Parameters passed:**
  * `payment_method_types`: `['card']`
  * `line_items`: Array of product items (nights, additional guests, dynamic calculation).
  * `mode`: `'payment'`
  * `success_url`: Redirect URL on successful checkout, containing `{CHECKOUT_SESSION_ID}`.
  * `cancel_url`: Redirect URL on cancellation.
  * `metadata`: Associated reservation details (checkIn, checkOut, guests, name, email, phone, roomName, ratePlanId, basePrice, extraGuestCharge, octorateRoomId).

### 2. `stripe.checkout.sessions.retrieve`
Retrieves details of a Checkout Session by its ID to check payment status and extract metadata.
* **Usage:** `api/verify-checkout-session.ts`
* **Key fields verified:**
  * `payment_status`: Must be `'paid'` to confirm checkout validity.
  * `metadata`: Extracted to process local reservation actions and push bookings to Octorate.

### 3. `stripe.checkout.sessions.update`
Updates an existing Checkout Session.
* **Usage:** `api/verify-checkout-session.ts` (updates metadata state or tracking flags after processing).

## Design & Security Best Practices
* **Secret Keys:** Never expose `STRIPE_SECRET_KEY` on the client side. Always keep Stripe operations inside serverless `/api` routes.
* **Pricing Math Consistency:** All pricing calculations must match the backend validation exactly to prevent payment tamper. Ensure Stripe quantities and unit prices align with room configuration settings.
