# 📂 DREKT: Project Design Document

# DREKT Platform - Technical Specification & AI System Directives

## [PROJECT CONTEXT]
You are building DREKT, a B2B SaaS and Supply Chain Intelligence Platform. The goal is to connect MSMEs (Micro, Small, and Medium Enterprises) directly with suppliers, bypassing middlemen. 
**Crucial Context:** Do NOT build a simple directory. Build a robust, trust-based platform with real-time data persistence, consolidated communications, and supply chain intelligence.

## [TECH STACK]
* [cite_start]**Frontend:** React (Next.js) or VueJS [cite: 33]
* **Styling:** Tailwind CSS
* [cite_start]**Backend:** Node.js [cite: 35] 
* [cite_start]**Database:** MongoDB [cite: 36]
* [cite_start]**Hosting:** Vercel (Frontend) + Render/Heroku/AWS (Backend) [cite: 37, 38]

## [DESIGN SYSTEM & UI DIRECTIVES]
* [cite_start]**Inspiration:** JobStreet[cite: 25]. Clean, corporate, intuitive, and highly scannable.
* **Colors:** Background: `#FFFFFF` | Text: `#000000` | Primary/Accent: `#16A34A` (Green).
* **Typography:** Headings: `Montserrat` | Body/UI Elements: `Poppins`.
* **STRICT UI RULES:**
  * [cite_start]DO NOT use gamified UI (e.g., Capitalism Lab style)[cite: 26].
  * [cite_start]DO NOT use overly "sci-fi" elements[cite: 27].
  * [cite_start]Keep dashboards clean; avoid heavy text blocks and information overload[cite: 25].

## [CORE ARCHITECTURE & FEATURES]

### 1. Smart Search & Dashboard (DrektSTATS)
* **Layout:** JobStreet-style search bar and sidebar filters (Industry, Minimum Order Quantity, Location).
* [cite_start]**Data Visualization:** Implement clean graphs/charts showing supply metrics and resource flow[cite: 29]. [cite_start]DO NOT build a basic, empty dashboard[cite: 30].

### 2. Live Inventory System (Anti-Liability)
* [cite_start]**Rule:** System must rely on dynamic database entries, NOT static inputs that display false stock[cite: 61]. 
* **Action:** Build robust CRUD operations for suppliers to update inventory seamlessly.

### 3. Consolidated Communication Hub
* [cite_start]**Problem:** B2B buyers hate managing separate email threads[cite: 68].
* [cite_start]**Solution:** Implement an internal messaging system tying buyers and suppliers together within the app[cite: 69].

### 4. Supply Chain Intelligence (DrektVISION)
* [cite_start]**Function:** Integrate real-time weather APIs to provide typhoon/weather alerts affecting agricultural routes[cite: 18, 73].
* [cite_start]**UI:** Clean mapping interface showing supplier locations and potential logistics disruptions[cite: 67].

## [DATA MODELS (MongoDB Schemas - Target Structure)]
* [cite_start]**User/Buyer:** `id`, `businessName`, `industry`, `subscriptionTier` (Free, Premium)[cite: 71], `savedSuppliers`.
* **Supplier:** `id`, `businessName`, `isVerified` (Boolean), `inventory` (Array of objects with real-time stock levels), `location` (GeoJSON).

## [STRICT AI GUARDRAILS - DO NOT VIOLATE]
1. **NO MOCK DATA:** Do not generate hardcoded frontend mock data. [cite_start]You must build backend connections and database schemas to establish data persistence[cite: 32, 97, 98].
2. **TERMINOLOGY:** Use "Small Business First". Do not exclusively say "Farmer-First". Use diverse Philippine business examples (e.g., Marikina shoemaker, Zamboanga canner).
3. **MONETIZATION LOGIC:** DREKT is a B2B SaaS. We do not rely on 1% transaction cuts. [cite_start]Build logic supporting Subscription Tiers and Premium Search Rankings[cite: 70, 71].