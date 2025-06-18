# 🏥 Exquio – Doctor Appointment Booking App

**Exquio** is a mobile app built with **React Native** and **Tailwind CSS**, designed to make doctor appointment booking quick, easy, and accessible. With **Supabase** powering the backend, including **PostgreSQL tables** and **user authentication**, Exquio provides a modern, secure, and responsive experience for both patients and doctors.

> 🚧 Currently ~80% complete – with core functionality working: authentication, booking, real-time doctor viewing, and database connectivity.

---

## 🔑 Key Features

✅ **Secure Authentication with Supabase**  
- Email/password login & signup  
- Session management  
- Realtime auth sync

✅ **Doctor Realtime View**  
- Browse available doctors  
- Specializations, availability, and ratings visible

✅ **Appointment Booking**  
- Book instantly with available slots  
- Database-stored appointment data via SQL tables

✅ **Tailwind Styling with NativeWind**  
- Mobile-optimized UI  
- Fast development using utility-first design

✅ **Patient Dashboard**  
- Manage upcoming appointments  
- Profile edit features (name, age, history)

✅ **Supabase PostgreSQL Backend**  
- Fully managed SQL tables  
- Tables: `users`, `doctors`, `appointments`, `slots`, etc.

---

## 🧱 Tech Stack

| Layer        | Tools & Libraries                        |
|--------------|------------------------------------------|
| Frontend     | React Native (with Expo)                 |
| Styling      | Tailwind CSS (via [nativewind](https://github.com/marklawlor/nativewind)) |
| Backend      | [Supabase](https://supabase.com)         |
| Database     | PostgreSQL (via Supabase)                |
| Auth         | Supabase Auth                            |
| State Mgmt   | React Context / useState (modular)       |
| API Layer    | Supabase Client SDK                      |

---

🚀 Getting Started
Prerequisites
Node.js & npm

Expo CLI (npm install -g expo-cli)

Supabase project + keys

Setup
bash
Copy
Edit
git clone https://github.com/your-username/exquio.git
cd exquio
npm install
npx expo start
Then, update .env or Supabase config file with your project URL and anon/public key:

js
Copy
Edit
// services/supabase.js
createClient(
  "https://your-project.supabase.co",
  "public-anon-key"
)
✅ Completed
 User signup/login

 Booking system & appointment screen

 Real-time doctor browsing

 Supabase DB setup and connection

🧠 Roadmap
 Push notifications for bookings

 Doctor-side dashboard

 Admin panel for approvals

 Payment integration

 Ratings & feedback

 Dark mode toggle

📬 Contact
Built with ❤️ by Sayees
🌐 sayees.vercel.app

Copyright (c) 2025 Sayees

All rights reserved.

This source code and all associated files are the exclusive property of Sayees. Unauthorized copying, modification, distribution, or use of this software, in whole or in part, is strictly prohibited.

This software is proprietary and confidential. It may not be reproduced, distributed, or used in any way without the express written consent of the copyright holder.


Exquio is a work-in-progress project aiming to bring convenience to healthcare booking through mobile-first, secure design.

© 2025 Exquio – All rights reserved.
