const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Set views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/wedding");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connected to the database");
});

// User Schema
const userSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { 
        type: String, 
        required: true, 
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid mobile number!`
        }
    },
    password: { type: String, required: true, minlength: 6 }
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
    res.render("index"); // Render the index.ejs file
});



app.post('/register-popup', async (req, res) => {
    const { fname, lname, email, mobile, password } = req.body;
    const user = new User({ fname, lname, email, mobile, password });
    
    try {
        await user.save();
        res.redirect('/#login-popup'); // Redirect to the login page after successful signup
    } catch (error) {
        console.error('Error during signup:', error);
        res.redirect('/#register-popup', { errors: error.errors }); // Render signup page with error messages
    }
});

app.post("/login-popup", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });
        if (user) {
            res.redirect("/"); // Redirect to home page on successful login
        } else {
            res.status(401).send("Incorrect email or password."); // Send error message
        }
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send("Error logging in."); // Send server error
    }
});

app.get("/about", (req, res) => {
    res.render("about"); // Render the about.ejs file
});

app.get("/services", (req, res) => {
    res.render("services"); // Render the services.ejs file
});

app.get("/gallery", (req, res) => {
    res.render("gallery"); // Render the gallery.ejs file
});

app.get("/error", (req, res) => {
    res.render("error"); // Render the error.ejs file
});

app.get("/events", (req, res) => {
    res.render("events"); // Render the events.ejs file
});

app.get("/contact", (req, res) => {
    res.render("contact"); // Render the contact.ejs file
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
