const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const geolib = require('geolib');
const app = express();
const port = process.env.PORT || 9500;

app.use('/static', express.static('static'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
const loginConnection = mongoose.createConnection('mongodb+srv://priyaranjansahoo19055:U7cewv7DacWbMhjq@cluster0.3eqcork.mongodb.net/login', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const garageConnection = mongoose.createConnection('mongodb+srv://priyaranjansahoo19055:U7cewv7DacWbMhjq@cluster0.3eqcork.mongodb.net/garage', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});   

loginConnection.on('error', console.error.bind(console, 'Login connection error:'));
garageConnection.on('error', console.error.bind(console, 'Garage connection error:'));

loginConnection.once('connected', () => {
    console.log('Connected to MongoDB (login)');
});
garageConnection.once('connected', () => {
    console.log('Connected to MongoDB (garage)');
});

const GarageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    { timestamps: true }
);

const garage = garageConnection.model('garage', GarageSchema);

const LoginSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true }
    },
    { timestamps: true }
);

const Login = loginConnection.model('Login', LoginSchema);

// Define routes
app.get('/nextpage', (req, res) => {
    const params = {};
    res.status(203).render("nextpage.pug", params);
});
app.get('/SwiftSOS', (req, res) => {
    const { username } = req.query;
    res.status(200).render("SwiftSOS.pug", { username });
}); 
app.get('/', (req, res) => {
    const params = {};
    res.status(404).render("login.pug", params);
});

// Render the login page
app.get('/login', (req, res) => {
    res.render('login');
});     

// Handle login form submission
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Login.findOne({ username: username, password: password });
        if (user) {
            // Redirect to next page and pass the username as a query parameter
            res.redirect(`/SwiftSOS?username=${encodeURIComponent(username)}`);
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing request');
    }
});

// Render the signup page
app.get('/signup', (req, res) => {
    res.render('sign_up');
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const newLogin = new Login({
        username: username,
        password: password
    });
    try {
        await newLogin.save();
        res.status(200).send('Data saved successfully.Back to login page');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving to database');
    }
});

// Endpoint to fetch garages
app.get('/garages', async (req, res) => {
    try {
        const garages = await garage.find({});
        res.json(garages);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching garages');
    }
});

app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}`);
});
   