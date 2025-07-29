#💰 SmartBanker: AI-Driven Voice-Enabled Banking Interface
SmartBanker is a full-stack digital banking platform that delivers core banking functionalities through a sleek, secure, and interactive web interface. Designed for both functionality and accessibility, it offers a voice-enabled assistant, secure login via OTP and PIN, real-time transaction management, and downloadable PDF bank statements — all integrated with a responsive UI and intelligent chatbot support.

📦 GitHub Repo: SmartBanker-fullstack

##🚀 Key Features
🔐 Secure Login with 2FA
→ Dual-layer authentication using Email-based OTP (EmailJS) and a secure 4-digit PIN.

💬 AI Voice Assistant (Web Speech API)
→ Enables hands-free banking tasks like deposits, withdrawals, balance checks, logout, and statement generation.

📄 Instant Bank Statement Download (jsPDF)
→ Users can generate and download real-time PDF summaries of their transactions.

💸 Full Transaction Functionality
→ Supports balance inquiry, deposits, withdrawals, and dynamic transaction history display.

🤖 Integrated Help Chatbot
→ Assists users in navigating app features with quick, contextual guidance.

📱 Responsive & Animated UI
→ Modern, device-friendly interface with smooth animations and visual feedback.

##🔐 Security Layer
✅ OTP via EmailJS
→ Secure one-time password delivery using configured EmailJS service/template IDs.

✅ 4-Digit PIN Verification
→ An added authentication step post-OTP for layered access control.

🛡️ Designed for Session Locking (Future-Ready)
→ Potential enhancement to auto-lock on inactivity or suspicious behavior.

##🧠 Future Enhancements
📈 Data-Driven Dashboard
→ Visual analytics for users to track deposits, withdrawals, and savings trends.

🗂️ Advanced Statement Filters
→ Generate filtered PDF statements by date range or transaction type.

👥 Multi-User Architecture with DB
→ Migrate from users.json to MongoDB/PostgreSQL for true user account support.

🧑‍💻 Admin Panel
→ Role-based dashboard to monitor, approve, or audit transactions.

🌍 Multi-language Voice Assistant
→ Localized voice command support for wider accessibility.

##⚙️ Tech Stack & Architecture
Frontend:
→ HTML5, CSS3 (responsive design, animation), JavaScript (DOM control, voice, jsPDF)

Backend:
→ Node.js + Express.js (REST APIs, user session logic, OTP routes)

Real-Time & Voice:
→ Web Speech API (voice assistant), custom chatbot via JavaScript

Authentication:
→ EmailJS integration for secure OTP (Service ID, Template ID, Public Key)

Data Storage:
→ Local JSON (users.json) for user info (pluggable with future database)

PDF Generation:
→ jsPDF for on-the-fly bank statement creation

Deployment:
→ Render / Netlify (based on your hosting)

##📁 Project Structure
php
Copy
Edit
📦 SmartBanker/
├── 📁 public/       # HTML, CSS, client JS files
├── 📁 server/       # Node.js + Express routes
├── 📁 assets/       # Images & voice assets
├── 📄 users.json    # Temporary user data store
├── 📄 app.js        # Server entry point
└── 📄 README.md     # Project documentation


##🙋‍♀️ Creator
Made with ❤️ by Akanshi Singh
