const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Define a secret key for JWT
const secretKey = 'your_secret_key';

// Load user data from JSON file
let userData;
try {
  const userFileData = fs.readFileSync('data/users.json', 'utf8');
  userData = JSON.parse(userFileData);
} catch (error) {
  userData = {};
}

// User registration endpoint
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (userData[username]) {
    res.status(400).send('Username already exists');
    return;
  }

  userData[username] = {
    password: password
  };

  fs.writeFileSync('data/users.json', JSON.stringify(userData));
  res.status(201).send('User registered successfully');
});

// User login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!userData[username]) {
    res.status(401).send('Invalid username or password');
    return;
  }

  if (userData[username].password !== password) {
    res.status(401).send('Invalid username or password');
    return;
  }

  const payload = {
    username: username,
    userId: username // Use username as user ID in this example
  };
  const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

  res.status(200).send({ token: token });
});

// Protected route
app.get('/protected', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach decoded user information to request object
    next(); // Proceed to the protected route handler
  } catch (error) {
    res.status(401).send('Invalid token');
  }
});

// Protected route handler
app.get('/protected', (req, res) => {
  const userId = req.user.userId; // Access user ID from decoded token

  res.status(200).send('Protected resource accessed successfully');
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
