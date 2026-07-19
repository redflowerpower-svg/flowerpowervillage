# Google Maps JS API Service Integration

## Overview
Google Maps JS API is integrated on the client-side to allow customers to specify and confirm their precise delivery location on an interactive map. It handles geocoding, distance circle rendering, and delivery coordinate checks.

## Environment Variables
* `VITE_GOOGLE_MAPS_API_KEY`: The public browser API key used to authorize script loading and map tiles/services.

## SDK & Components Used
We use the modern official React wrapper: `@vis.gl/react-google-maps`.

### Key Components
1. `<APIProvider apiKey={...}>`: Wrap the component context with the maps loader API.
2. `<Map defaultCenter={...} defaultZoom={...}>`: Renders the interactive map.
3. `<Marker position={...}>`: Places markers (e.g. for restaurant location and selected customer location).
4. `useMap()`: Hook to interact with the raw `google.maps.Map` instance directly.

## Native Google Maps Services Used
Once the SDK loads, we interact with the global `google.maps` namespace:

### 1. `google.maps.Geocoder`
Resolves text addresses to geographic coordinates (`lat`, `lng`), or reverse-geocodes clicked map coordinates into a readable address string.
* **Usage:** `src/pizza/components/CheckoutFlow.tsx`

### 2. `google.maps.Circle`
Renders a radius limit circle (e.g. 5km radius) around the restaurant on the map to indicate the delivery coverage zone.
* **Usage:** `src/pizza/components/CheckoutFlow.tsx`

### 3. `google.maps.Size`
Defines markers sizes dynamically in maps.
* **Usage:** `src/pizza/components/CheckoutFlow.tsx`, `src/admin/components/Dashboard.tsx`

## Design Rules & Accessibility
* Ensure map elements are not overlapping other interactive UI components.
* Check if `typeof google !== 'undefined' && google.maps` before using any global constructor to prevent startup errors or race conditions during script load.
