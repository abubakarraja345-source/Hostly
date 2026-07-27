import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Hostly Luxury Co-Hosting & Virtual Operations" });
  });

  // AI Concierge Chat API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({
          reply: getFallbackConciergeReply(message)
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the AI Concierge for "Hostly" (hostly.io), a premier luxury short-term rental co-hosting & 24/7 virtual operations agency (combining VirtuPro virtual assistant services and The Luxe Programs luxury property management).
      
Answer host/property owner inquiries with sophistication, elegance, and deep short-term rental industry expertise.
Key Services:
- White-Glove Luxury Co-Hosting (turnkey guest relations, listing optimization, interior staging advice, revenue share from 12%).
- Dedicated Virtual Assistant Operations Teams (24/7 guest messaging in <3 min, cleaner & maintenance dispatch, ID verification, PriceLabs dynamic pricing, accounting).
- Direct Booking Site Setup & Revenue Management (+25-35% net profit boost).

User Message: "${message}"

Respond concisely (2-4 paragraphs), in an executive, warm, luxury tone. Emphasize how Hostly increases ROI, eliminates host burnout, and delivers 5-star VIP guest experiences.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      return res.json({ reply: response.text || getFallbackConciergeReply(message) });
    } catch (error) {
      console.error("Gemini AI Chat Error:", error);
      return res.json({ reply: getFallbackConciergeReply(req.body.message) });
    }
  });

  // Instant Custom Proposal Generator API
  app.post("/api/proposal", async (req, res) => {
    try {
      const { propertyName, propertyType, location, bedrooms, averageNightlyRate, currentOccupancy, primaryGoal } = req.body;
      const nightly = parseFloat(averageNightlyRate) || 450;
      const occ = parseFloat(currentOccupancy) || 55;

      const currentAnnualGross = Math.round(nightly * (occ / 100) * 365);
      const projectedOccupancy = Math.min(88, Math.round(occ + 22));
      const projectedADR = Math.round(nightly * 1.15); // 15% ADR lift via PriceLabs & Direct Bookings
      const projectedAnnualGross = Math.round(projectedADR * (projectedOccupancy / 100) * 365);
      const annualLift = projectedAnnualGross - currentAnnualGross;

      res.json({
        success: true,
        summary: {
          propertyName: propertyName || "Luxury Rental Property",
          location: location || "Prime Vacation Market",
          propertyType: propertyType || "Luxury Villa / Estate",
          bedrooms: bedrooms || "3-4 Beds",
          primaryGoal: primaryGoal || "Increase Profit & Hands-Off Hosting",
          currentAnnualGross: `$${currentAnnualGross.toLocaleString()}`,
          projectedAnnualGross: `$${projectedAnnualGross.toLocaleString()}`,
          annualRevenueIncrease: `+$${annualLift.toLocaleString()}`,
          projectedOccupancy: `${projectedOccupancy}%`,
          projectedADR: `$${projectedADR}`,
          recommendedPlan: occ < 60 ? "Full White-Glove Luxury Co-Hosting + Dynamic Revenue Engine" : "24/7 Virtual Assistant Operations & Direct Booking Scale",
          keyDeliverables: [
            "24/7/365 Guest Concierge Desk (Avg < 3 Min Response Time)",
            "PriceLabs & Wheelhouse Daily Dynamic Revenue Tuning",
            "Automated Cleaner & Maintenance Dispatch Workflow",
            "Guest ID Vetting & Fraud Prevention Protocol",
            "Custom Branded Direct Booking Portal Setup",
            "Monthly Owner P&L Financial Transparency Report"
          ]
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Proposal generation failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hostly server running on http://localhost:${PORT}`);
  });
}

function getFallbackConciergeReply(msg: string = ""): string {
  const lower = msg.toLowerCase();
  if (lower.includes("price") || lower.includes("cost") || lower.includes("fee") || lower.includes("plan")) {
    return `Hostly offers flexible, performance-driven investment structures tailored to your portfolio size:

1. **Virtual Operations Desk**: Starting at $899/month for dedicated 24/7 guest messaging, cleaner dispatch, dynamic pricing, and guest screening.
2. **Luxury Co-Hosting**: 10% - 15% revenue share (compared to traditional 25-30% property managers), including complete hands-off property management and VIP guest concierge.
3. **Enterprise Portfolio**: Customized co-hosting and virtual assistant team deployment for 10+ properties.

Would you like me to calculate your estimated annual revenue lift with Hostly?`;
  }
  if (lower.includes("virtual assistant") || lower.includes("va") || lower.includes("team") || lower.includes("virtupro")) {
    return `Hostly's Virtual Assistant & Operations Desk operates as your 24/7 back-office engine.

Our trained STR specialists handle:
- Instant guest inquiries in under 3 minutes across Airbnb, VRBO, & Direct Bookings.
- Cleaning & turnover team scheduling with automated photo checklist verification.
- Maintenance triage & emergency vendor dispatch.
- Daily dynamic price optimization using PriceLabs, Wheelhouse & Beyond Pricing.
- Guest ID verification and automated keyless lock code delivery.

We seamlessly integrate with your existing PMS (Hostaway, Guesty, Hospitable, OwnerRez) so you can step away from day-to-day operations completely.`;
  }
  return `Welcome to Hostly! We combine white-glove luxury short-term rental co-hosting with dedicated 24/7 virtual assistant teams to scale your property portfolio.

Whether you own a single luxury villa or manage dozens of short-term rentals, Hostly delivers:
• **+25% to +35% Higher Revenue** via daily dynamic pricing & direct bookings.
• **Sub-3 Minute Response Time** 24/7/365 for flawless 5-star guest reviews.
• **Zero Burnout** by taking 100% of guest inquiries, cleaning dispatches, and maintenance off your plate.

How can I assist your hosting goals today? Feel free to ask about our co-hosting model, virtual assistant teams, or custom revenue calculator!`;
}

startServer();
