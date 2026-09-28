import { useEffect } from 'react';

/**
 * Injects Schema.org JSON-LD for Flower Power Pizza Ranong:
 * - Restaurant & FoodEstablishment (Local Business)
 * - Menu & Cuisine (Authentic Italian, Pasta, Pizza, Waterfall Ambience)
 * - GeoCoordinates (Ranong Hotsprings / Bang Rin)
 * - FAQPage (AI & Voice Search optimization)
 */
export function PizzaStructuredData() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const scriptId = 'fp-pizza-schema-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["Restaurant", "FoodEstablishment"],
          "@id": "https://www.flowerpowerpizza.com/#restaurant",
          "name": "Flower Power Pizza Ranong",
          "alternateName": [
            "Flower Power Pizza - Ranong Hotspring",
            "Flower Power Ranong Italian Restaurant",
            "ฟลาวเวอร์ พาวเวอร์ พิซซ่า ระนอง"
          ],
          "description": "Authentic Italian pizzeria and homemade fresh pasta in Ranong, Thailand. Featuring a 48h slow-fermented crust with 100% Italian flour, homemade artisan sausage, focaccia, fine wines, and fresh fruit shakes in an enchanting tropical garden with a private waterfall, pond, indoor hall, outdoor terrace, and traditional garden huts.",
          "url": "https://www.flowerpowerpizza.com",
          "telephone": "+66949800200",
          "image": [
            "https://www.flowerpowerpizza.com/flower-power-pizza-emblem.png",
            "https://www.flowerpowerpizza.com/Flower_Power_Pizza_-_HotSpring.png"
          ],
          "logo": "https://www.flowerpowerpizza.com/flower-power-pizza-logo-512.png",
          "priceRange": "$$",
          "servesCuisine": [
            "Italian",
            "Pizza",
            "Homemade Fresh Pasta",
            "Mediterranean",
            "Vegetarian Friendly"
          ],
          "currenciesAccepted": "THB",
          "paymentAccepted": "Cash, Credit Card, PromptPay QR",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "129/6 Moo 1, Tambon Bang Rin",
            "addressLocality": "Ranong",
            "addressRegion": "Ranong",
            "postalCode": "85000",
            "addressCountry": "TH"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 9.9575,
            "longitude": 98.6339
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "11:00",
              "closes": "21:30"
            }
          ],
          "hasMenu": "https://www.flowerpowerpizza.com/#menu",
          "amenityFeature": [
            {
              "@type": "LocationFeatureSpecification",
              "name": "Private Natural Waterfall",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Tropical Pond & Garden",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Traditional Garden Huts (Capanne)",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Indoor Air Conditioned Dining & Outdoor Veranda",
              "value": true
            },
            {
              "@type": "LocationFeatureSpecification",
              "name": "Home & Hotel Fast Delivery",
              "value": true
            }
          ],
          "potentialAction": {
            "@type": "OrderAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.flowerpowerpizza.com/order",
              "inLanguage": ["en", "it", "th", "de"],
              "actionPlatform": [
                "http://schema.org/DesktopWebPlatform",
                "http://schema.org/MobileWebPlatform"
              ]
            },
            "deliveryMethod": [
              "http://purl.org/goodrelations/v1#DeliveryModeDirectDelivery",
              "http://purl.org/goodrelations/v1#DeliveryModePickUp"
            ]
          }
        },
        {
          "@type": "FAQPage",
          "@id": "https://www.flowerpowerpizza.com/#faq",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Where can I find authentic Italian pizza and fresh pasta in Ranong?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Flower Power Pizza in Bang Rin, Ranong is the premier authentic Italian restaurant in Ranong. They make 48-hour slow-matured pizza with 100% Italian-imported flour, homemade fresh pasta from scratch, artisan sausage, and authentic Italian espresso in a garden with a private waterfall."
              }
            },
            {
              "@type": "Question",
              "name": "Does Flower Power Pizza deliver to hotels and resorts in Ranong?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Flower Power Pizza delivers across all of Ranong city, including hotels near Raksawarin Hot Springs, Khao Niwet, and the ferry piers. Flat delivery fee is 30 THB, and delivery is 100% FREE for orders over 300 THB."
              }
            },
            {
              "@type": "Question",
              "name": "What makes the location of Flower Power Pizza Ranong unique?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The restaurant is situated in an extraordinary natural oasis featuring a private natural waterfall, a tranquil pond, an indoor dining hall, an open-air terrace, and traditional private garden huts (capanne)."
              }
            },
            {
              "@type": "Question",
              "name": "What are the opening hours of Flower Power Pizza Ranong?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Flower Power Pizza Ranong is open every day from 11:00 AM to 9:30 PM (21:30) for dine-in, takeaway, and home delivery."
              }
            }
          ]
        }
      ]
    };

    scriptEl.textContent = JSON.stringify(schemaData);

    return () => {
      // Keep or clean up
    };
  }, []);

  return null;
}
