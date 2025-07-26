const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; // Use promises version for async/await
const path = require('path'); // Node.js module to handle file paths

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json()); // To parse JSON requests

// Define the path to your users.json file
const usersFilePath = path.join(__dirname, 'users.json');

// --- API ROUTES ---
// IMPORTANT: Place API routes *before* the static file serving for the root.
// Otherwise, the static file server might intercept requests like /signup

// Helper to read users data
async function readUsers() {
    try {
        const data = await fs.readFile(usersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If users.json doesn't exist, return an empty array and create the file
            await fs.writeFile(usersFilePath, JSON.stringify([]), 'utf8');
            return [];
        }
        console.error("Error reading users.json:", error);
        return []; // Return empty array on other errors
    }
}

// Helper to write users data
async function writeUsers(users) {
    try {
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error("Error writing users.json:", error);
    }
}

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, password, name, age, bank, account, pin, email } = req.body;

    if (!username || !password || !name || !age || !bank || !account || !pin || !email) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    let users = await readUsers();
    if (users.find(user => user.username === username)) {
        return res.status(409).json({ success: false, message: 'Username already exists.' });
    }
    if (users.find(user => user.email === email)) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const newUser = {
        username,
        password, // Hashed password from frontend
        name,
        age,
        bank,
        account,
        pin, // Hashed PIN from frontend
        email,
        balance: 0,
        transactions: []
    };
    users.push(newUser);
    await writeUsers(users);
    res.json({ success: true, message: 'Account created successfully!' });
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let users = await readUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, message: 'Login successful!', user: {
            username: user.username,
            name: user.name,
            email: user.email,
            balance: user.balance,
            transactions: user.transactions,
            age: user.age,
            bank: user.bank,
            account: user.account
        }});
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
});

// Get User Data Route
app.get('/api/user-data/:username', async (req, res) => {
    const username = req.params.username;
    let users = await readUsers();
    const user = users.find(u => u.username === username);

    if (user) {
        res.json({ success: true, user: {
            username: user.username,
            name: user.name,
            email: user.email,
            balance: user.balance,
            transactions: user.transactions,
            age: user.age,
            bank: user.bank,
            account: user.account
        }});
    } else {
        res.status(404).json({ success: false, message: 'User not found.' });
    }
});

// Deposit Route
app.post('/api/deposit', async (req, res) => {
    const { username, amount } = req.body;
    let users = await readUsers();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex !== -1) {
        users[userIndex].balance += amount;
        users[userIndex].transactions.unshift({
            type: 'Deposit',
            amount: amount,
            time: new Date().toISOString()
        });
        await writeUsers(users);
        res.json({ success: true, message: 'Deposit successful!', user: users[userIndex] });
    } else {
        res.status(404).json({ success: false, message: 'User not found.' });
    }
});

// Withdraw Route
app.post('/api/withdraw', async (req, res) => {
    const { username, amount } = req.body;
    let users = await readUsers();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex !== -1) {
        if (users[userIndex].balance >= amount) {
            users[userIndex].balance -= amount;
            users[userIndex].transactions.unshift({
                type: 'Withdrawal',
                amount: amount,
                time: new Date().toISOString()
            });
            await writeUsers(users);
            res.json({ success: true, message: 'Withdrawal successful!', user: users[userIndex] });
        } else {
            res.status(400).json({ success: false, message: 'Insufficient balance.' });
        }
    } else {
        res.status(404).json({ success: false, message: 'User not found.' });
    }
});

// Verify PIN Route
app.post('/api/verify-pin', async (req, res) => {
    const { username, pin } = req.body; // 'pin' here is the hashed PIN from frontend
    let users = await readUsers();
    const user = users.find(u => u.username === username);

    if (user) {
        if (user.pin === pin) { // Compare with stored hashed PIN
            res.json({ success: true, message: 'PIN verified!' });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect PIN.' });
        }
    } else {
        res.status(404).json({ success: false, message: 'User not found.' });
    }
});

// Reset Password Route
app.post('/api/reset-password', async (req, res) => {
    const { username, newPassword } = req.body; // 'newPassword' here is the hashed new password from frontend
    let users = await readUsers();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex !== -1) {
        users[userIndex].password = newPassword; // Update with new hashed password
        await writeUsers(users);
        res.json({ success: true, message: 'Password reset successfully!' });
    } else {
        res.status(404).json({ success: false, message: 'User not found.' });
    }
});


// --- SERVING STATIC FILES AND HTML ---
// This middleware tells Express to serve static files (like CSS, JS, images)
// from the 'public' directory.
// Any request that matches a file in 'public' will be served directly.
app.use(express.static(path.join(__dirname, 'public')));

// This route handles the root URL '/' and sends back your index.html
// This MUST be after app.use(express.static) and your API routes.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
