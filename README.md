<div align="center">
  <img src="public/logo.png" alt="InEx Logo" width="160" />
  <h1>InEx Dashboard</h1>
  <p><strong>Income & Expense Financial Dashboard</strong></p>
  
  <a href="https://inex-dashboard.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-inex--dashboard.vercel.app-2ec4b6?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
</div>

<br />

**InEx** (Income-Expense) is a powerful, fully-responsive financial dashboard designed to grant users total visibility into their monetary footprint. Engineered with Next.js and animated natively via Framer Motion, it translates raw transaction data into clean, actionable, and visually stunning intelligence.

## 🧭 Application Structure

The platform is divided into highly specialized data-visualization routes:

### 1. Overview Dashboard (`/`)
The command center. Instantly view your overall metrics (Total Balance, active Income, and total Expenses) parsed elegantly through animated StatCards, a 30-day chronological bar chart pulse, and your most recent critical transactions all in one screen. 

### 2. Transactions Control (`/transactions`)
A high-performance transaction ledger. Features complete multi-parameter filtering, custom chronological sorting, category tag tracking, and deep search capabilities. Powered by a responsive horizontal-scroll interface guaranteeing zero layout breakage across desktop and mobile.

### 3. Insights Engine (`/insights`)
Deep data breakdown. This automated analysis hub calculates your net savings rate, isolates your highest-spending categories, tracks recurring vendors, and flags transactional anomalies against your 90-day rolling averages using intelligent comparative metrics.

### 4. Categories Matrix (`/categories`)
The architecture of your spending. Monitor precisely where your money flows with granular visual breakdowns, specific color-coded tags mapped to dynamic donut charts, and automated budget allocation warnings.

### 5. Report Generator (`/reports`)
Your export pipeline. A dynamic, structured configuration tool allowing you to rapidly compile user-defined date ranges and custom category filters into accessible analytical summaries or structured external CSVs.

## ⚡ Tech Stack

*   **Core:** React 19 / Next.js 15 (App Router)
*   **Styling Structure:** TailwindCSS v4 with advanced Fluid Clamp Typography
*   **Motion Matrix:** Framer Motion (liquid modal & layout transitions)
*   **Deployment Environment:** Vercel Global Edge Network

## 📐 Responsive Infrastructure
InEx utilizes a completely responsive fluid `clamp()` formula enforcing aggressive zero-layout shifts. Grids gracefully collapse, interactive toolbars convert into hidden touch-carousels, and headers utilize absolute responsive padding ensuring pixel-perfect harmony from 320px smartphones up to multi-monitor ultrawide displays.
