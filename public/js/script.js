//script.js

// --- Hashing Function (SHA-256) ---
async function hashString(str) {
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashedPassword;
}

// --- Toast Notification Function ---
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    if (isError) {
        toast.classList.add('error');
    } else {
        toast.classList.add('success');
    }
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000); // Toast disappears after 3 seconds
}

// --- DOM Elements ---
const appDiv = document.getElementById('app');

// Sections
const signupSection = document.getElementById('signup-section');
const loginSection = document.getElementById('login-section');
const otpSection = document.getElementById('otp-section');
const forgotPasswordSection = document.getElementById('forgot-password-section');
const pinSection = document.getElementById('pin-section');
const dashboardSection = document.getElementById('dashboard-section');

// Navigation links
const toLoginLink = document.getElementById('to-login');
const toSignupLink = document.getElementById('to-signup');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginLink = document.getElementById('back-to-login');

// Sign Up elements
const newUsernameInput = document.getElementById('new-username');
const newPasswordInput = document.getElementById('new-password');
const newNameInput = document.getElementById('new-name');
const newAgeInput = document.getElementById('new-age');
const newBankInput = document.getElementById('new-bank');
const newAccountInput = document.getElementById('new-account');
const newPinInput = document.getElementById('new-pin');
const newEmailInput = document.getElementById('new-email');
const signupBtn = document.getElementById('signup-btn');

// Login elements
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('remember-me');
const loginBtn = document.getElementById('login-btn');

// OTP elements (for login)
const otpInput = document.getElementById('otp-input');
const verifyOtpBtn = document.getElementById('verify-otp-btn');

// Forgot Password elements
const fpUsernameInput = document.getElementById('fp-username');
const fpEmailInput = document.getElementById('fp-email');
const fpSendOtpBtn = document.getElementById('fp-send-otp');
const fpOtpArea = document.getElementById('fp-otp-area');
const fpOtpInput = document.getElementById('fp-otp');
const fpVerifyOtpBtn = document.getElementById('fp-verify-otp');
const fpPinArea = document.getElementById('fp-pin-area');
const fpPinInput = document.getElementById('fp-pin');
const fpVerifyPinBtn = document.getElementById('fp-verify-pin');
const fpNewPassArea = document.getElementById('fp-new-pass-area');
const fpNewPasswordInput = document.getElementById('fp-new-password');
const fpConfirmPasswordInput = document.getElementById('fp-confirm-password');
const fpResetPasswordBtn = document.getElementById('fp-reset-password');
const fpResultDiv = document.getElementById('fp-result');

// PIN Entry elements
const pinDisplay = document.getElementById('pin-display');
const keypad = document.getElementById('keypad');
const clearPinBtn = document.getElementById('clear-pin');
const submitPinBtn = document.getElementById('submit-pin');
let enteredPin = '';

// Dashboard elements
const userNameSpan = document.getElementById('user-name');
const userAgeSpan = document.getElementById('user-age');
const userBankSpan = document.getElementById('user-bank');
const userAccountSpan = document.getElementById('user-account');
const balanceSpan = document.getElementById('balance');
const amountInput = document.getElementById('amount');
const depositBtn = document.getElementById('deposit-btn');
const withdrawBtn = document.getElementById('withdraw-btn');
const transactionsList = document.getElementById('transactions');
const logoutBtn = document.getElementById('logout-btn');
const downloadStatementBtn = document.getElementById('download-statement');

// Help Widget elements
const helpToggleBtn = document.getElementById('help-toggle');
const helpPanelDiv = document.getElementById('help-panel');
const faqQuestions = document.querySelectorAll('.faq-question');

// NEW: Voice Assistant DOM Elements
const voiceToggleBtn = document.getElementById('voice-toggle');
const voiceStatusDiv = document.getElementById('voice-status');

// --- Global Variables ---
let currentUser = null;
let currentOTP = null;
let otpSentFor = null; // 'login' or 'forgotPassword'

// Voice Assistant Variables
let recognition; // SpeechRecognition object
let synth = window.speechSynthesis; // SpeechSynthesis object
let isListening = false;

// --- Helper Functions ---

function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'flex'; // Use flex for centering
        activeSection.classList.add('active');
    }
}

async function loadDashboardData() {
    if (currentUser) {
        try {
            const response = await fetch(`/api/user-data/${currentUser.username}`);
            const data = await response.json();
            if (data.success) {
                currentUser = data.user; // Update currentUser with fresh data
                userNameSpan.textContent = currentUser.name;
                userAgeSpan.textContent = currentUser.age;
                userBankSpan.textContent = currentUser.bank;
                userAccountSpan.textContent = currentUser.account;
                balanceSpan.textContent = currentUser.balance.toFixed(2);
                updateTransactions();
            } else {
                showToast(`Failed to load dashboard data: ${data.message}`, true);
                console.error("Failed to load dashboard data:", data.message);
                showSection('login-section');
                currentUser = null; // Clear user if data fetch fails
            }
        } catch (error) {
            showToast("Network error loading dashboard data.", true);
            console.error("Error loading dashboard data:", error);
            showSection('login-section');
            currentUser = null;
        }
    } else {
        showToast("No user logged in.", true);
        showSection('login-section');
    }
}

function updateTransactions() {
    transactionsList.innerHTML = '';
    if (currentUser && currentUser.transactions && currentUser.transactions.length > 0) {
        currentUser.transactions.forEach(tx => {
            const li = document.createElement('li');
            const date = new Date(tx.time);
            li.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}: ${tx.type} ₹${tx.amount.toFixed(2)}`;
            transactionsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No transactions yet.';
        transactionsList.appendChild(li);
    }
}

// --- NEW: Voice Assistant Functions ---

// Function to speak text
function speak(text) {
    if (!synth) {
        console.warn("SpeechSynthesis not supported by this browser.");
        return;
    }
    // Cancel any ongoing speech to avoid overlapping
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Set language
    utterance.rate = 1.0; // Speed of speech
    utterance.pitch = 1.0; // Pitch of speech
    synth.speak(utterance);
}

// Function to initialize Speech Recognition
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        console.warn("Web Speech API is not supported by this browser. Try Chrome.");
        voiceToggleBtn.style.display = 'none'; // Hide button if not supported
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false; // Listen for a single utterance
    recognition.interimResults = false; // Only return final results
    recognition.lang = 'en-US'; // Set language

    recognition.onstart = () => {
        isListening = true;
        voiceToggleBtn.classList.add('listening');
        voiceStatusDiv.style.display = 'block';
        voiceStatusDiv.textContent = 'Listening...';
        console.log("Voice assistant started listening.");
        speak("I am listening.");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Voice command received:", transcript);
        voiceStatusDiv.textContent = `Heard: "${transcript}"`;
        processVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        voiceStatusDiv.textContent = `Error: ${event.error}`;
        speak(`Sorry, I encountered an error: ${event.error}. Please try again.`);
        isListening = false;
        voiceToggleBtn.classList.remove('listening');
        voiceStatusDiv.style.display = 'none';
    };

    recognition.onend = () => {
        isListening = false;
        voiceToggleBtn.classList.remove('listening');
        voiceStatusDiv.style.display = 'none';
        console.log("Voice assistant stopped listening.");
    };
}

// Function to process voice commands
async function processVoiceCommand(command) {
    let responseText = "Sorry, I didn't understand that command.";

    if (command.includes("go to") || command.includes("show me")) {
        if (command.includes("sign up") || command.includes("signup")) {
            showSection('signup-section');
            responseText = "Navigating to the Sign Up section.";
        } else if (command.includes("login")) {
            showSection('login-section');
            responseText = "Navigating to the Login section.";
        } else if (command.includes("dashboard")) {
            if (currentUser) {
                showSection('dashboard-section');
                await loadDashboardData(); // Ensure dashboard data is fresh
                responseText = "Navigating to your Dashboard.";
            } else {
                responseText = "You need to be logged in to access the dashboard. Please log in first.";
                showSection('login-section'); // Redirect to login
            }
        } else if (command.includes("forgot password") || command.includes("recover password")) {
            showSection('forgot-password-section');
            // Reset forgot password sections to initial state
            document.getElementById("fp-otp-area").style.display = "none";
            document.getElementById("fp-pin-area").style.display = "none";
            document.getElementById("fp-new-pass-area").style.display = "none";
            document.getElementById("fp-result").textContent = "";
            document.getElementById("fp-username").value = "";
            document.getElementById("fp-email").value = "";
            document.getElementById("fp-otp").value = "";
            document.getElementById("fp-pin").value = "";
            document.getElementById("fp-new-password").value = "";
            document.getElementById("fp-confirm-password").value = "";
            document.getElementById("fp-username").disabled = false;
            document.getElementById("fp-email").disabled = false;
            document.getElementById("fp-send-otp").disabled = false;
            sessionStorage.removeItem("forgotPasswordOTP");
            responseText = "Navigating to the Forgot Password section.";
        } else {
            responseText = "I can navigate to Sign up, Login, Dashboard, or Forgot Password.";
        }
    } else if (command.includes("check balance") || command.includes("what is my balance")) {
        if (currentUser) {
            await loadDashboardData(); // Ensure balance is up-to-date
            responseText = `Your current balance is ₹${currentUser.balance.toFixed(2)}.`;
        } else {
            responseText = "You need to be logged in to check your balance. Please log in first.";
        }
    } else if (command.includes("view transactions") || command.includes("show transactions")) {
        if (currentUser) {
            await loadDashboardData(); // Ensure transactions are up-to-date
            const transactions = currentUser.transactions;
            if (transactions && transactions.length > 0) {
                const recentTx = transactions.slice(0, 3); // Read out last 3 transactions
                let txText = "Your recent transactions are: ";
                recentTx.forEach((tx, index) => {
                    txText += `Transaction ${index + 1}: ${tx.type} of ₹${tx.amount.toFixed(2)} on ${new Date(tx.time).toLocaleDateString()}. `;
                });
                responseText = txText;
            } else {
                responseText = "You have no transactions yet.";
            }
        } else {
            responseText = "You need to be logged in to view transactions. Please log in first.";
        }
    } else if (command.includes("logout")) {
        if (currentUser) {
            document.getElementById("logout-btn").click(); // Simulate logout button click
            responseText = "You have been logged out.";
        } else {
            responseText = "You are not currently logged in.";
        }
    } else if (command.includes("hello") || command.includes("hi")) {
        responseText = "Hello there! How can I help you with your banking today?";
    } else if (command.includes("stop listening") || command.includes("stop assistant")) {
        if (isListening) {
            recognition.stop();
            responseText = "Voice assistant stopped.";
        }
    }

    speak(responseText);
}

// Event listener for the voice toggle button
voiceToggleBtn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
});


// --- Event Listeners ---

// Navigation
toLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login-section');
});
toSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('signup-section');
});
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('forgot-password-section');
});
backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login-section');
});

// Sign Up
signupBtn.addEventListener('click', async () => {
    const username = newUsernameInput.value.trim();
    const password = newPasswordInput.value.trim();
    const name = newNameInput.value.trim();
    const age = parseInt(newAgeInput.value);
    const bank = newBankInput.value.trim();
    const account = newAccountInput.value.trim();
    const pin = newPinInput.value.trim();
    const email = newEmailInput.value.trim();

    if (!username || !password || !name || isNaN(age) || age < 18 || !bank || !account || !pin || !email) {
        showToast('All fields are required and age must be 18+', true);
        return;
    }
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        showToast('PIN must be a 4-digit number.', true);
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        showToast('Please enter a valid email address.', true);
        return;
    }

    try {
        const hashedPassword = await hashString(password);
        const hashedPin = await hashString(pin);

        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password: hashedPassword,
                name,
                age,
                bank,
                account,
                pin: hashedPin,
                email
            })
        });

        const data = await response.json();
        if (data.success) {
            showToast(data.message, false);
            showSection('login-section');
            // Clear signup form
            newUsernameInput.value = '';
            newPasswordInput.value = '';
            newNameInput.value = '';
            newAgeInput.value = '';
            newBankInput.value = '';
            newAccountInput.value = '';
            newPinInput.value = '';
            newEmailInput.value = '';
        } else {
            showToast(data.message, true);
        }
    } catch (error) {
        showToast('Network error during signup. Please try again.', true);
        console.error('Signup error:', error);
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showToast('Username and password are required.', true);
        return;
    }

    try {
        const hashedPassword = await hashString(password);

        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: hashedPassword })
        });

        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
            showToast(data.message, false);
            // Send OTP to user's registered email
            currentOTP = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
            otpSentFor = 'login';
            const templateParams = {
                to_email: currentUser.email,
                from_name: 'SmartBanker',
                message: `Your OTP for SmartBanker login is: ${currentOTP}. This OTP is valid for 5 minutes. Do not share it with anyone.`
            };
            emailjs.send('service_uwmag7v', 'template_4g61pef', templateParams)
                .then((res) => {
                    console.log('Email successfully sent!', res.status, res.text);
                    showToast('OTP sent to your registered email.', false);
                    showSection('otp-section');
                }, (error) => {
                    console.error('Email sending failed:', error);
                    showToast('Failed to send OTP. Please try again.', true);
                });
        } else {
            showToast(data.message, true);
        }
    } catch (error) {
        showToast('Network error during login. Please try again.', true);
        console.error('Login error:', error);
    }
});

// Verify OTP (for login)
verifyOtpBtn.addEventListener('click', () => {
    const enteredOtp = otpInput.value.trim();
    if (!enteredOtp) {
        showToast('Please enter the OTP.', true);
        return;
    }

    if (otpSentFor === 'login' && enteredOtp === currentOTP) {
        if (rememberMeCheckbox.checked) {
            localStorage.setItem("rememberedUser", JSON.stringify({ username: currentUser.username }));
        } else {
            localStorage.removeItem("rememberedUser");
        }
        showToast('OTP verified. Welcome!', false);
        showSection('pin-section'); // Go to PIN entry after successful OTP
        enteredPin = ''; // Reset PIN
        pinDisplay.textContent = '----';
        speak(`OTP verified. Welcome ${currentUser.name}! Please enter your PIN.`);

    } else {
        showToast('Invalid OTP. Please try again.', true);
        otpInput.value = '';
    }
});

// Forgot Password - Send OTP
fpSendOtpBtn.addEventListener('click', async () => {
    const username = fpUsernameInput.value.trim();
    const email = fpEmailInput.value.trim();

    if (!username || !email) {
        showToast('Username and email are required.', true);
        return;
    }

    try {
        const response = await fetch(`/api/user-data/${username}`);
        const data = await response.json();

        if (data.success && data.user.email === email) {
            currentUser = data.user; // Temporarily load user for OTP
            currentOTP = Math.floor(100000 + Math.random() * 900000).toString();
            otpSentFor = 'forgotPassword';
            const templateParams = {
                to_email: currentUser.email,
                from_name: 'SmartBanker Password Recovery',
                message: `Your OTP for password recovery is: ${currentOTP}. This OTP is valid for 5 minutes. Do not share it with anyone.`
            };
            emailjs.send('service_uwmag7v', 'template_4g61pef', templateParams)
                .then((res) => {
                    console.log('Email successfully sent!', res.status, res.text);
                    showToast('OTP sent to your registered email.', false);
                    fpOtpArea.style.display = 'block';
                    fpUsernameInput.disabled = true;
                    fpEmailInput.disabled = true;
                    fpSendOtpBtn.disabled = true;
                }, (error) => {
                    console.error('Email sending failed:', error);
                    showToast('Failed to send OTP. Please try again.', true);
                });
        } else {
            showToast('Username or Email not found/matched.', true);
        }
    } catch (error) {
        showToast('Network error during OTP request.', true);
        console.error('Forgot password OTP error:', error);
    }
});

// Forgot Password - Verify OTP
fpVerifyOtpBtn.addEventListener('click', () => {
    const enteredOtp = fpOtpInput.value.trim();
    if (!enteredOtp) {
        showToast('Please enter the OTP.', true);
        return;
    }

    if (otpSentFor === 'forgotPassword' && enteredOtp === currentOTP) {
        showToast('OTP verified. Now enter your PIN.', false);
        fpOtpArea.style.display = 'none';
        fpPinArea.style.display = 'block';
        fpResultDiv.textContent = '';
        fpResultDiv.style.color = '';
        enteredPin = ''; // Reset pin for new entry
        pinDisplay.textContent = '----'; // Reset pin display
    } else {
        showToast('Invalid OTP. Please try again.', true);
        fpOtpInput.value = '';
    }
});

// Forgot Password - Verify PIN
fpVerifyPinBtn.addEventListener('click', async () => {
    const enteredPinHash = await hashString(fpPinInput.value.trim()); // Hash the entered PIN
    if (!fpPinInput.value.trim()) {
        showToast('Please enter your PIN.', true);
        return;
    }
    if (fpPinInput.value.trim().length !== 4) {
        showToast('PIN must be 4 digits.', true);
        return;
    }

    try {
        const response = await fetch('/api/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, pin: enteredPinHash }) // Send hashed PIN
        });
        const data = await response.json();

        if (data.success) {
            showToast(data.message, false);
            fpPinArea.style.display = 'none';
            fpNewPassArea.style.display = 'block';
            fpResultDiv.textContent = 'Enter your new password.';
            fpResultDiv.style.color = 'green';
        } else {
            showToast(data.message, true);
            fpResultDiv.textContent = data.message;
            fpResultDiv.style.color = 'red';
        }
    } catch (error) {
        showToast('Network error during PIN verification.', true);
        console.error('Forgot password PIN verification error:', error);
    }
});


// Forgot Password - Reset Password
fpResetPasswordBtn.addEventListener('click', async () => {
    const newPassword = fpNewPasswordInput.value.trim();
    const confirmPassword = fpConfirmPasswordInput.value.trim();

    if (!newPassword || !confirmPassword) {
        showToast('Please enter and confirm your new password.', true);
        return;
    }
    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match.', true);
        return;
    }
    if (newPassword.length < 6) { // Basic password length validation
        showToast('Password must be at least 6 characters long.', true);
        return;
    }

    try {
        const hashedPassword = await hashString(newPassword);

        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, newPassword: hashedPassword })
        });

        const data = await response.json();
        if (data.success) {
            showToast(data.message, false);
            showSection('login-section');
            // Clear form
            fpNewPasswordInput.value = '';
            fpConfirmPasswordInput.value = '';
            fpResultDiv.textContent = '';
            fpResultDiv.style.color = '';
            // Reset state
            currentUser = null;
            otpSentFor = null;
            currentOTP = null;
        } else {
            showToast(data.message, true);
            fpResultDiv.textContent = data.message;
            fpResultDiv.style.color = 'red';
        }
    } catch (error) {
        showToast('Network error during password reset.', true);
        console.error('Password reset error:', error);
    }
});


// PIN Keypad Logic
keypad.addEventListener('click', (e) => {
    if (e.target.classList.contains('pin-key')) {
        if (enteredPin.length < 4) {
            enteredPin += e.target.textContent;
            pinDisplay.textContent = enteredPin.padEnd(4, '-');
        }
    }
});

clearPinBtn.addEventListener('click', () => {
    enteredPin = '';
    pinDisplay.textContent = '----';
});

submitPinBtn.addEventListener('click', async () => {
    if (enteredPin.length !== 4) {
        showToast('Please enter a 4-digit PIN.', true);
        return;
    }

    try {
        const hashedPin = await hashString(enteredPin);
        const response = await fetch('/api/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, pin: hashedPin })
        });
        const data = await response.json();
        if (data.success) {
            showToast(data.message, false);
            await loadDashboardData(); // Load fresh data after PIN verification
            showSection('dashboard-section');
        } else {
            showToast(data.message, true);
            enteredPin = ''; // Clear PIN on incorrect entry
            pinDisplay.textContent = '----';
        }
    } catch (error) {
        showToast('Network error during PIN verification.', true);
        console.error('PIN verification error:', error);
    }
});

// Dashboard actions
depositBtn.addEventListener('click', async () => {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid positive amount.', true);
        return;
    }

    try {
        const response = await fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, amount })
        });

        const data = await response.json();
        if (data.success) {
            showToast(data.message, false);
            currentUser = data.user; // Update current user data
            balanceSpan.textContent = currentUser.balance.toFixed(2);
            updateTransactions();
            amountInput.value = ''; // Clear input
        } else {
            showToast(data.message, true);
        }
    } catch (error) {
        showToast('Network error during deposit. Please try again.', true);
        console.error('Deposit error:', error);
    }
});

withdrawBtn.addEventListener('click', async () => {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid positive amount.', true);
        return;
    }
    if (amount > currentUser.balance) {
        showToast('Insufficient balance.', true);
        return;
    }

    try {
        const response = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, amount })
        });

        const data = await response.json();
        if (data.success) {
            showToast(data.message, false);
            currentUser = data.user; // Update current user data
            balanceSpan.textContent = currentUser.balance.toFixed(2);
            updateTransactions();
            amountInput.value = ''; // Clear input
        } else {
            showToast(data.message, true);
        }
    } catch (error) {
        showToast('Network error during withdrawal. Please try again.', true);
        console.error('Withdrawal error:', error);
    }
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem("rememberedUser");
    showToast('Logged out successfully!', false);
    showSection('login-section');
    usernameInput.value = '';
    passwordInput.value = '';
    rememberMeCheckbox.checked = false;
    otpInput.value = ''; // Clear OTP input
    currentOTP = null; // Clear OTP state
    otpSentFor = null;
    // Reset forgot password sections to initial state
    document.getElementById("fp-otp-area").style.display = "none";
    document.getElementById("fp-pin-area").style.display = "none";
    document.getElementById("fp-new-pass-area").style.display = "none";
    document.getElementById("fp-result").textContent = "";
    document.getElementById("fp-username").value = "";
    document.getElementById("fp-email").value = "";
    document.getElementById("fp-otp").value = "";
    document.getElementById("fp-pin").value = "";
    document.getElementById("fp-new-password").value = "";
    document.getElementById("fp-confirm-password").value = "";
    document.getElementById("fp-username").disabled = false;
    document.getElementById("fp-email").disabled = false;
    document.getElementById("fp-send-otp").disabled = false;
    sessionStorage.removeItem("forgotPasswordOTP");
});

// Download Statement
downloadStatementBtn.addEventListener('click', () => {
    if (!currentUser) {
        showToast("No user logged in to download statement.", true);
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("SmartBanker Account Statement", 20, 20);

    doc.setFontSize(12);
    doc.text(`Account Holder: ${currentUser.name}`, 20, 35);
    doc.text(`Username: ${currentUser.username}`, 20, 42);
    doc.text(`Account Number: ${currentUser.account}`, 20, 49);
    doc.text(`Bank: ${currentUser.bank}`, 20, 56);
    doc.text(`Current Balance: ₹${currentUser.balance.toFixed(2)}`, 20, 63);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);

    doc.setFontSize(16);
    doc.text("Transactions:", 20, 85);

    doc.setFontSize(10);
    let y = 95;
    if (currentUser.transactions && currentUser.transactions.length > 0) {
        currentUser.transactions.forEach((tx, index) => {
            if (y > 280) { // Check for page overflow
                doc.addPage();
                y = 20; // Reset Y for new page
                doc.setFontSize(16);
                doc.text("Transactions (continued):", 20, 20);
                doc.setFontSize(10);
                y = 30;
            }
            const date = new Date(tx.time);
            const transactionString = `Type: ${tx.type} | Amount: ₹${tx.amount.toFixed(2)} | Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            doc.text(`${index + 1}. ${transactionString}`, 20, y);
            y += 7;
        });
    } else {
        doc.text("No transactions recorded.", 20, y);
    }

    doc.save(`${currentUser.username}_statement_${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast("Bank statement downloaded!", false);
});


// Help Widget Logic
helpToggleBtn.addEventListener('click', () => {
    const isPanelVisible = helpPanelDiv.style.display === 'block';
    helpPanelDiv.style.display = isPanelVisible ? 'none' : 'block';
});

faqQuestions.forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        if (answer.style.display === 'block') {
            answer.style.display = 'none';
        } else {
            // Close other open answers
            document.querySelectorAll('.faq-answer').forEach(ans => {
                if (ans !== answer) {
                    ans.style.display = 'none';
                }
            });
            answer.style.display = 'block';
        }
    });
});

// Close help panel if clicked outside
document.addEventListener('click', (event) => {
    if (!helpPanelDiv.contains(event.target) && !helpToggleBtn.contains(event.target)) {
        helpPanelDiv.style.display = 'none';
    }
});


// --- Initial Load Logic (check for remembered user and show initial section) ---
window.onload = async () => {
    // Initialize EmailJS
    emailjs.init("83HgMJ3eIhBHZ-5pb"); // Ensure your public key is here

    // Initialize Voice Assistant
    initSpeechRecognition(); // Call this to set up the recognition object

    const remembered = JSON.parse(localStorage.getItem("rememberedUser"));
    if (remembered && remembered.username) {
        try {
            const response = await fetch(`/api/user-data/${remembered.username}`);
            const data = await response.json();
            if (data.success) {
                currentUser = data.user;
                showToast(`Welcome back, ${currentUser.name}! Please enter your PIN.`, false);
                document.getElementById("username").value = remembered.username;
                document.getElementById("remember-me").checked = true;
                showSection("pin-section");
                speak(`Welcome back ${currentUser.name}! Please enter your PIN to proceed.`);
            } else {
                showToast("Remembered user data not found. Please log in.", true);
                showSection("login-section");
                speak("Welcome to SmartBanker. Please log in or sign up.");
            }
        } catch (error) {
            console.error("Error loading remembered user:", error);
            showToast("Network error. Please try logging in.", true);
            showSection("login-section");
            speak("Welcome to SmartBanker. Network error. Please log in or sign up.");
        }
    } else {
        showSection("signup-section");
        speak("Welcome to SmartBanker. Please sign up or log in.");
    }
};