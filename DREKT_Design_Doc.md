# 📂 DREKT: Project Design Document

**Version:** 2.0  
**Mission:** To democratize the Philippine Supply Chain by eliminating information asymmetry. We empower small businesses, startups, and producers (who lack 'connections') to trade directly, bypassing gatekeepers and predatory middlemen.

---

## 1. The Core Problem: Information Asymmetry

### The 'Network' Gap
Currently, profitable supply chains are 'gatekept' by middlemen. If you don't have the right connections, you can't enter the market.

### The 'Facebook' Trap
Small entrepreneurs rely on unverified Facebook groups for suppliers, leading to scams, ghosting, and unstable pricing.

### The Risk Blindness
Small players have zero visibility on logistics risks (typhoons, road blocks), causing their businesses to fail where big corporations would survive.

---

## 2. The Solution: 'DREKT' Platform

A B2B (Business-to-Business) brokerage platform that acts as the 'Great Equalizer.' It provides Verified Information and Direct Connections to anyone, regardless of their network size.

---

## 3. User Personas (The 'Underdogs')

### The Entrepreneur
A startup founder making chili garlic oil who needs a steady glass jar supplier (currently blocked by minimum order quantities).

### The Small Producer
A small furniture factory in Pampanga or a Rice Farmer in Nueva Ecija who gets squeezed by middlemen because they don't know who else to sell to.

### The Distributor
A sari-sari store wholesaler or small grocery owner looking for better margins but lacks access to big factories.

---

## 4. Business Model (How we make money)

### Digital Brokerage
DREKT functions as a transparent digital broker.

### Commission Rate
We take a minimal transaction fee (approx. 1%) on successful orders. We profit by enabling volume and trust, not by gouging margins.

---

## 5. Key Features & Architecture

### A. The Smart Dashboard (The 'Equalizer')

**Search:** Finds Small & Medium Enterprises (SMEs) alongside big corporations.

**Filters:**
- **Industry:** Packaging, Raw Materials, Food & Bev, Textiles, Electronics.
- **Scale:** Filter by 'No Minimum Order' (crucial for startups).
- **Verification:** 'Verified Partner' badges to replace the uncertainty of Facebook groups.

### B. The Geospatial Map (Visibility)

**Function:** Shows where the supply chain actually is.

**Utility:** Helps a buyer find the closest supplier to save on shipping costs (which is often the killer for small businesses).

### C. DREKT VISION (Risk Intelligence)

**Purpose:** To give small players the same 'War Room' intelligence that big conglomerates have.

**The Logic:**
- Predicts supply chain disruptions (Typhoons, Traffic, Checkpoints).
- **Actionable Advice:** 'Typhoon incoming in Region 3. Your glass bottle supplier might be delayed. Here is a backup supplier in Batangas.'

---

## 6. Technical Stack

- **Framework:** Next.js (React)
- **Deployment:** Vercel (Free Tier)
- **Data Strategy:** 'Hybrid' Database (Mock Data for local SMEs + Web Scraping for large distributors).

---

## 7. The 'Golden Rule' for AI

### Stop saying 'Farmer-First'
Say **'Small Business First.'** Farmers are important, but they are just one type of producer.

### Focus on Asymmetry
The goal is to verify information that is currently hidden or unreliable.

### Context
Use diverse examples: A shoe maker in Marikina, a sardine canner in Zamboanga, a pili nut candy maker in Bicol.
