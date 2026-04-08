# InEx 📊

InEx is a modern, fully responsive financial dashboard application designed to give users comprehensive insights into their spending, income, and overall transaction footprint.

![InEx Dashboard](https://github.com/jamiecoded/inex-dashboard/assets/placeholder.png)

## Features 🚀

- **Liquid Responsive Design**: The entire layout is structured with zero layout shifts from ultra-narrow smartphones (`320px`) up to ultrawide desktops (`2560px`). 
- **Dynamic Dashboard Metrics**: Calculate realtime `Total Balance`, `Income`, and `Expenses` tracked over dynamically generated datasets.
- **Deep Category Insights**: Granular visual breakdowns of expenditures parsed into distinct actionable categories (Housing, Utilities, Food) powered by Framer Motion chart animations.
- **Reporting Generator**: Export your data metrics through a native mobile-friendly report carousel configuration toolbar.
- **Dark Mode Aesthetic**: Curated glass-morphism dark modes integrating subtle vibrant highlights prioritizing pure black aesthetics with highly accessible `#2ec4b6` interaction tones.

## Technologies Used 💻

- **Framework**: [Next.js](https://nextjs.org/) (React 18 app directory)
- **Styling**: Vanilla CSS Variables & TailwindCSS v4 with advanced clamp() fluid typography.
- **Database / State**: React Context API managing complex cross-route transaction sets.
- **Micro-Animations**: Framer Motion for liquid-smooth modal transitions, drawer toggles, and StatCard entrance effects.
- **Icons**: Lucide React optimized scalable vectors.

## Installation & Local Setup ⚙️

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jamiecoded/inex-dashboard.git
   cd inex-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Mobile Considerations 📱

InEx was explicitly redesigned mobile-first focusing on avoiding flex-wrappers and utilizing purely horizontal hidden scroll carousels for extreme filtering and menu interactions. Grids are cleanly forced into 1-col limits in any bound under `640px`.

## Contributors
* Application architecture completely reconstructed and deployed by AI pair programming.

---
*Created with ♥️ for modern UI/UX workflows.*
