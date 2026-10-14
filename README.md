# 🏆 Esports Arena — Free Fire Tournament Dashboard

Welcome to **Esports Arena**, a full-stack competitive tournament dashboard designed specifically for organizing Free Fire esports tournaments. It includes real-time custom room distribution, an internal coin wallet economy, Free Fire scoring leaderboards, duplicate player detection, and admin/player communications.

---

## ⚡ Quick Start (Run Locally in 1 Minute)

The app is pre-configured and tested with demo seed data so you can test all features immediately without any setup:

```bash
# 1. Open the project folder in terminal or powershell:
cd c:\Users\ELCOT\Desktop\esports\esports

# 2. Start the development server:
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

---

## 🔑 Demo Testing Accounts (1-Click Instant Login)

On the entry screen or using the top-bar **"Demo as:"** dropdown, you can test both roles instantly:

| Role | Account Name | Email | Password | Permissions & Features |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Rithish (Admin) | `rithishmdu77@gmail.com` | `rithish@240408` | Full control: create tournaments, approve teams, refund coins, manage room IDs/passwords, scoring leaderboards, broadcast announcements |
| **Player** | Rahul Sharma (Team Hydra) | `skylord@esportsarena.com` | `player123` | Squad captain: 450 coins wallet, registered tournaments, room ID reveal, private chat with admin |
| **Player** | Vikram Singh (Total Gaming) | `shadowx@esportsarena.com` | `player123` | Squad captain: 200 coins wallet, pending approvals |
| **Player** | Aman Patel (Blind Esports) | `toxic@esportsarena.com` | `player123` | Squad captain: 0 coins wallet, locked chat until first tournament joined |

---

## 🚀 Setting Up Real Free Supabase Backend (Step-by-Step for Beginners)

Follow these exact steps to connect your free Supabase database:

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com/) and click **Sign Up** (or Sign In).
2. Click **New Project**.
3. Choose an organization, enter a project name (e.g., `esports-arena`), choose a database password, and pick a region close to your players.
4. Click **Create new project** and wait ~2 minutes for it to initialize.

### Step 2: Paste the SQL Database Schema
1. In your Supabase project dashboard, click on the **SQL Editor** tab (the `>_` icon in the left sidebar).
2. Click **New query**.
3. Open the file [`supabase_schema.sql`](file:///c:/Users/ELCOT/Desktop/esports/esports/supabase_schema.sql) from this project.
4. Copy the entire contents of `supabase_schema.sql` and paste them into the Supabase SQL Editor.
5. Click **Run** (or press `Ctrl + Enter`).
6. You should see `Success. No rows returned`. All tables, RLS security policies, stored procedures, and triggers are now active!

### Step 3: Copy Your API Keys into `.env`
1. In your Supabase dashboard, go to **Project Settings** (gear icon at bottom left) ➔ **API**.
2. Find:
   - **Project URL** (e.g., `https://abcdefghijklm.supabase.co`)
   - **Project API keys** ➔ **`anon` `public`** key
3. In this project folder, create a new file named `.env` (or copy from `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key-here
   ```
4. Restart the dev server (`Ctrl + C` then `npm run dev`). The app will now connect to your Supabase backend!

### Step 4: How to Create Your First Admin
By strict security rule, the **Admin role is stored in the database and can never be selected by a user during signup**.

1. Go to the app, click **Enter as Player** ➔ **Create Account**, and sign up with your email (e.g. `you@gmail.com`).
2. Go back to your Supabase dashboard ➔ **SQL Editor**.
3. Run this single command replacing your email:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'you@gmail.com';
   ```
4. Now, go to the app, click **Enter as Admin**, log in with your email and password, and you will have full Administrator privileges!

---

## ☁️ How to Deploy Free on Vercel

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase Anon Key
5. Click **Deploy**. Vercel will build and give you a free HTTPS URL to share with players!

---

## 📋 Feature Testing Checklist

### Testing as Admin:
- [x] **Entry Gate Security:** Try logging into "Enter as Admin" with a player account — verifies access denial.
- [x] **Overview Dashboard:** View stat cards (Tournaments, Teams, Verified Players, Pending Reviews, Revenue Coins) and charts.
- [x] **Tournaments Management:** Create a tournament, edit map/mode/fees, switch status to "Live" or "Completed" in 1 click.
- [x] **Registration Management:** Review team rosters, approve teams, reject with 1-click coin refund, and test **Anti-Cheat Duplicate UID detection**.
- [x] **Export Data:** Click "Export CSV" and "Export Excel (.xlsx)" to download team lists.
- [x] **Match Rooms:** Add custom Room ID & Password, enter placements & kills, and watch the live leaderboard calculate points.
- [x] **Coin Dispenser:** Add/deduct coins from any team wallet with a reason, or bulk credit all teams.
- [x] **Chat Communications:** Post pinned announcements to all players, or answer individual team private threads.

### Testing as Player:
- [x] **Team Roster Registration:** Register team with Solo, Duo, or Squad mode; dynamic player input fields; numeric Free Fire UID validation.
- [x] **Coin Wallet:** Check balance, review transaction history, see placeholder for Razorpay payments.
- [x] **Join Tournament:** 1-click atomic join with coin deduction and auto-unlock of admin chat.
- [x] **My Registrations:** Check review badge (Pending/Approved/Rejected) and copy revealed Room ID and Password 15 minutes before match.
- [x] **Leaderboard:** View standings, match kills, and calculated Free Fire placement points.
- [x] **Chat:** Read pinned announcements; test private admin chat (locked if no tournament joined).

---

## 🔮 What's Next (Suggested Next Steps)
- **Real Razorpay Payment Gateway:** Replace the coin placeholder with live UPI/Card payments using Razorpay Webhooks.
- **Discord / WhatsApp Bot Integration:** Auto-send Room ID and Password to captains on WhatsApp/Discord 15 minutes before the match.
- **Automated Bracket Tournament Generator:** Single-elimination and double-elimination bracket views for 1v1 and 2v2 modes.
- **Screenshot / OCR Anti-Cheat:** Let players upload match end-screen screenshots to auto-verify kills and placement.
