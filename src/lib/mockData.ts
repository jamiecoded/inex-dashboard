import { Transaction } from "@/types";

const now = new Date();
const yr = now.getFullYear();
const mo = String(now.getMonth() + 1).padStart(2, "0");
const lastMo = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, "0");
const lastYr = now.getMonth() === 0 ? yr - 1 : yr;
const twoMoAgo = String(
  now.getMonth() === 0 ? 11 
  : now.getMonth() === 1 ? 12 
  : now.getMonth() - 1
).padStart(2, "0");
const twoYr = now.getMonth() <= 1 ? yr - 1 : yr;

export const initialTransactions: Transaction[] = [
  // ── CURRENT MONTH ──────────────────────
  {
    id: "t001",
    merchant: "Monthly Salary",
    subtext: "Bank transfer · Direct deposit",
    category: "Income",
    date: `${yr}-${mo}-01`,
    type: "credit",
    amount: 5000,
    notes: "Primary salary"
  },
  {
    id: "t002",
    merchant: "Freelance Project — Client A",
    subtext: "Wire transfer · Invoice #1042",
    category: "Income",
    date: `${yr}-${mo}-04`,
    type: "credit",
    amount: 1800,
    notes: "Web design project"
  },
  {
    id: "t003",
    merchant: "Apartment Rent",
    subtext: "Direct debit · Landlord",
    category: "Housing",
    date: `${yr}-${mo}-02`,
    type: "debit",
    amount: 1200,
    notes: ""
  },
  {
    id: "t004",
    merchant: "Whole Foods Market",
    subtext: "Card purchase · Groceries",
    category: "Food",
    date: `${yr}-${mo}-05`,
    type: "debit",
    amount: 84,
    notes: ""
  },
  {
    id: "t005",
    merchant: "Uber rides",
    subtext: "Card purchase · Transport",
    category: "Transport",
    date: `${yr}-${mo}-06`,
    type: "debit",
    amount: 34,
    notes: ""
  },
  {
    id: "t006",
    merchant: "Netflix",
    subtext: "Subscription · Monthly",
    category: "Utilities",
    date: `${yr}-${mo}-07`,
    type: "debit",
    amount: 18,
    notes: ""
  },
  {
    id: "t007",
    merchant: "Electricity Bill",
    subtext: "Direct debit · City Power",
    category: "Utilities",
    date: `${yr}-${mo}-08`,
    type: "debit",
    amount: 73,
    notes: ""
  },
  {
    id: "t008",
    merchant: "Trader Joe's",
    subtext: "Card purchase · Groceries",
    category: "Food",
    date: `${yr}-${mo}-10`,
    type: "debit",
    amount: 61,
    notes: ""
  },
  {
    id: "t009",
    merchant: "Gym Membership",
    subtext: "Subscription · FitLife",
    category: "Other",
    date: `${yr}-${mo}-11`,
    type: "debit",
    amount: 45,
    notes: ""
  },
  {
    id: "t010",
    merchant: "Freelance Project — Client B",
    subtext: "Wire transfer · Invoice #1043",
    category: "Income",
    date: `${yr}-${mo}-13`,
    type: "credit",
    amount: 950,
    notes: "Logo design"
  },
  {
    id: "t011",
    merchant: "Amazon",
    subtext: "Card purchase · Online shopping",
    category: "Other",
    date: `${yr}-${mo}-14`,
    type: "debit",
    amount: 112,
    notes: "Desk accessories"
  },
  {
    id: "t012",
    merchant: "Spotify",
    subtext: "Subscription · Monthly",
    category: "Utilities",
    date: `${yr}-${mo}-15`,
    type: "debit",
    amount: 10,
    notes: ""
  },

  // ── LAST MONTH ─────────────────────────
  {
    id: "t013",
    merchant: "Monthly Salary",
    subtext: "Bank transfer · Direct deposit",
    category: "Income",
    date: `${lastYr}-${lastMo}-01`,
    type: "credit",
    amount: 5000,
    notes: ""
  },
  {
    id: "t014",
    merchant: "Apartment Rent",
    subtext: "Direct debit · Landlord",
    category: "Housing",
    date: `${lastYr}-${lastMo}-02`,
    type: "debit",
    amount: 1200,
    notes: ""
  },
  {
    id: "t015",
    merchant: "Freelance Project — Client C",
    subtext: "Wire transfer · Invoice #1039",
    category: "Income",
    date: `${lastYr}-${lastMo}-09`,
    type: "credit",
    amount: 1200,
    notes: ""
  },
  {
    id: "t016",
    merchant: "Whole Foods Market",
    subtext: "Card purchase · Groceries",
    category: "Food",
    date: `${lastYr}-${lastMo}-05`,
    type: "debit",
    amount: 92,
    notes: ""
  },
  {
    id: "t017",
    merchant: "Electricity Bill",
    subtext: "Direct debit · City Power",
    category: "Utilities",
    date: `${lastYr}-${lastMo}-08`,
    type: "debit",
    amount: 68,
    notes: ""
  },
  {
    id: "t018",
    merchant: "Uber rides",
    subtext: "Card purchase · Transport",
    category: "Transport",
    date: `${lastYr}-${lastMo}-12`,
    type: "debit",
    amount: 41,
    notes: ""
  },
  {
    id: "t019",
    merchant: "Restaurant — Dinner",
    subtext: "Card purchase · Dining",
    category: "Food",
    date: `${lastYr}-${lastMo}-17`,
    type: "debit",
    amount: 78,
    notes: ""
  },
  {
    id: "t020",
    merchant: "Netflix",
    subtext: "Subscription · Monthly",
    category: "Utilities",
    date: `${lastYr}-${lastMo}-15`,
    type: "debit",
    amount: 18,
    notes: ""
  },

  // ── TWO MONTHS AGO ─────────────────────
  {
    id: "t021",
    merchant: "Monthly Salary",
    subtext: "Bank transfer · Direct deposit",
    category: "Income",
    date: `${twoYr}-${twoMoAgo}-01`,
    type: "credit",
    amount: 5000,
    notes: ""
  },
  {
    id: "t022",
    merchant: "Apartment Rent",
    subtext: "Direct debit · Landlord",
    category: "Housing",
    date: `${twoYr}-${twoMoAgo}-02`,
    type: "debit",
    amount: 1200,
    notes: ""
  },
  {
    id: "t023",
    merchant: "Freelance Project — Client A",
    subtext: "Wire transfer · Invoice #1035",
    category: "Income",
    date: `${twoYr}-${twoMoAgo}-11`,
    type: "credit",
    amount: 2200,
    notes: ""
  },
  {
    id: "t024",
    merchant: "Grocery Run",
    subtext: "Card purchase · Trader Joe's",
    category: "Food",
    date: `${twoYr}-${twoMoAgo}-06`,
    type: "debit",
    amount: 55,
    notes: ""
  },
  {
    id: "t025",
    merchant: "Internet Bill",
    subtext: "Direct debit · ISP",
    category: "Utilities",
    date: `${twoYr}-${twoMoAgo}-10`,
    type: "debit",
    amount: 60,
    notes: ""
  },
  {
    id: "t026",
    merchant: "Flight tickets",
    subtext: "Card purchase · Travel",
    category: "Transport",
    date: `${twoYr}-${twoMoAgo}-14`,
    type: "debit",
    amount: 320,
    notes: "Work trip"
  },
  {
    id: "t027",
    merchant: "Electricity Bill",
    subtext: "Direct debit · City Power",
    category: "Utilities",
    date: `${twoYr}-${twoMoAgo}-08`,
    type: "debit",
    amount: 81,
    notes: ""
  },
  {
    id: "t028",
    merchant: "Gym Membership",
    subtext: "Subscription · FitLife",
    category: "Other",
    date: `${twoYr}-${twoMoAgo}-11`,
    type: "debit",
    amount: 45,
    notes: ""
  }
];
