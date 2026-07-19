# Octorate PMS API Service Integration

## Overview
Octorate is the Property Management System (PMS) channel manager. It handles accommodation booking states, checks live room availability, and receives direct booking submissions.

## Environment Variables
* `VITE_OCTORATE_CLIENT_ID`: The public client ID for OAuth integration.
* `OCTORATE_SECRET_KEY`: The private API secret key (never exposed to client).
* `VITE_OCTORATE_STRUCTURE_ID`: Octorate structure/hotel reference ID (default: `"366879"`).
* `VITE_OCTORATE_REDIRECT_URI`: OAuth redirect target.

## OAuth 3-Legged Authentication Flow
OAuth credentials are statefully managed in the `octorate_tokens` table in Supabase.
1. **Authorization URL:**
   `https://admin.octorate.com/octobook/identity/oauth.xhtml`
2. **Token Exchange Endpoint:**
   `https://api.octorate.com/octobook/rest/v1/identity/token` (grant_type: `"code"`)
3. **Token Refresh Endpoint:**
   `https://api.octorate.com/octobook/rest/v1/identity/token` (grant_type: `"refresh_token"`)

## Key API Endpoints & Request Formats
Requests go through Vercel dev reverse proxy: `/api-octorate/` redirects to `https://api.octorate.com/`.

### 1. `/connect/rest/v1/calendar/{structureId}`
Queries the availability calendar for rate plans within check-in/out range.
* **Usage:** `src/booking/lib/octorate.ts` (`checkAvailability`)
* **Headers:** `Authorization: Bearer <access_token>`
* **Parameters:** `dateFrom`, `dateTo`, `size`, `page`

### 2. `/connect/rest/v1/reservation`
Submits a finalized reservation payload to block rooms in the PMS after payment.
* **Usage:** `src/booking/lib/octorate.ts` (`createReservation`)
* **Headers:** `Authorization: Bearer <access_token>`
* **Payload:** Contains customer details, room ID, check-in/out dates, price, and status.

## Best Practices
* **Refresh Flow:** Always check token expiry and automatically refresh `access_token` using the refresh flow when any API call returns `401` or `403`.
* **Rate Limits / Pagination:** Structure calendars can be paginated. Handle pagination and whitelisting of target rate plan IDs securely.
