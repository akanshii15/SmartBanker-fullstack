# 💰 SmartBanker: AI-Driven Voice-Enabled Banking Interface

**SmartBanker** is a full-stack digital banking platform that delivers core banking functionalities through a sleek, secure, and interactive web interface. Designed for both functionality and accessibility, it offers a voice-enabled assistant, secure login via OTP and PIN, real-time transaction management, and downloadable PDF bank statements — all integrated with a responsive UI and intelligent chatbot support.

 
📦 **GitHub Repo**: [SmartBanker-fullstack](https://github.com/akanshii15/SmartBanker-fullstack)

---

## 🚀 Key Features

- 🔐 **Secure Login with 2FA**  
  Dual-layer authentication using Email-based OTP (EmailJS) and a secure 4-digit PIN.

- 🧠 **AI Voice Assistant (Web Speech API)**  
  Enables hands-free banking tasks like deposits, withdrawals, balance checks, logout, and statement generation.

- 📄 **Instant Bank Statement Download (jsPDF)**  
  Users can generate and download real-time PDF summaries of their transactions.

- 💸 **Full Banking Operations**  
  Includes deposits, withdrawals, balance inquiry, and dynamic transaction history.

- 💬 **Interactive Help Chatbot**  
  Context-aware assistant to guide users through banking features.

- 📱 **Responsive & Animated UI**  
  Optimized for mobile and desktop, with smooth transitions and modern animations.

---

## 🔐 Security Enhancements

- 📧 **Two-Factor Authentication (OTP via EmailJS)**  
  Secures user login with time-bound email verification.

- 🔑 **4-Digit PIN Layer**  
  Adds a second authentication step for added protection.

- ⏳ *(Planned)* **Auto Session Lock on Inactivity**  
  Optional enhancement to improve session security.

---

## 🧠 Future Enhancements

- 🏦 **Multi-User Architecture**  
  Move from local `users.json` to persistent databases like MongoDB/PostgreSQL.

- 📊 **Personal Dashboard with Insights**  
  Visual analytics showing spending patterns, balance graphs, etc.

- 🗂️ **Statement Filters**  
  Filter and download transaction history by date or type.

- 👨‍💼 **Admin Dashboard**  
  For monitoring transactions and managing users.

- 🌍 **Multilingual Voice Assistant**  
  Support for Hindi, English, and more.

---

## ⚙️ Tech Stack

| Layer            | Technologies Used                                            |
|------------------|--------------------------------------------------------------|
| **Frontend**      | HTML5, CSS3, JavaScript, Web Speech API, jsPDF              |
| **Backend**       | Node.js, Express.js                                         |
| **Voice/Chatbot** | Web Speech API, custom JS logic                             |
| **2FA/OTP**       | EmailJS (Service ID, Template ID, Public Key)               |
| **Data Storage**  | `users.json` (temporary), upgradable to MongoDB/PostgreSQL  |
                    

---

## 📁 Project Structure

SmartBanker/
├── public/ → HTML, CSS, JS files (client-side)
├── server/ → Express.js backend logic and routes
├── assets/ → Icons, images, static files
├── users.json → Temporary user data
├── app.js → Main server entry
└── README.md → Project documentation

---

## 🙋‍♀️ Creator

Made with ❤️ by **[Akanshi Singh](https://github.com/akanshii15)**

---


