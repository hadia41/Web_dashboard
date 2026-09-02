# LifeLink Admin Dashboard & Emergency Dispatch Portal 🩸

A high-performance, real-time web-based Admin Dashboard & Management System built for the **LifeLink Blood Donation Ecosystem**.

---

## 🚀 Key Features

- **📊 Command Center Overview:** Real-time KPI counters (Active Requests, Available Donors, Completed Transfusions, Lives Saved), emergency urgency distribution, and supply vs. demand charts.
- **🩸 Blood Requests Management:** Full lifecycle tracking for hospital requests (CRITICAL, HIGH, MEDIUM, LOW), live fulfillment progress bars, and instant status transitions.
- **👥 Donors & Users Registry:** Searchable registry by blood type, city, and donor availability status with verification badges.
- **📋 Donation Logs & Audit Trail:** Verified hospital transfusion logs with exportable records.
- **📈 Analytics & Forecasting:** Monthly request vs. donation velocity charts and regional city distributions.
- **⚡ Direct Supabase Integration:** Directly syncs with your PostgreSQL database schema with seamless local fallback.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Components:** [React 19](https://react.dev/), [Lucide Icons](https://lucide.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with Custom Glassmorphism Theme
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Database:** [Supabase](https://supabase.com/) (`@supabase/supabase-js`)

---

## 💻 Quick Start & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for live DB)
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐙 Push to GitHub Guide

Run the following commands in your terminal to push this project to your GitHub repository:

```bash
# 1. Initialize Git repository
git init

# 2. Add all files to staging
git add .

# 3. Create initial commit
git commit -m "feat: lifelink emergency admin dashboard and management portal"

# 4. Set default branch to main
git branch -M main

# 5. Connect your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push code to GitHub
git push -u origin main
```
