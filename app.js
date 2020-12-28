require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

let port = process.env.PORT || 3000;
const app = express();
//ejs- use ejs as view engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
//static files from pub folder
app.use(express.static("public"));
//express-session
app.use(
	session({
		secret: "Our little secret.",
		resave: false,
		saveUninitialized: true,
		cookie: { secure: true },
	})
);
//passport
app.use(passport.initialize());
app.use(passport.session());
//==Mongoose Connection
mongoose.connect(
	"mongodb+srv://admin:admin413@cluster0.hgnmf.mongodb.net/userDB",
	{ useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.set("useCreateIndex", true);
//==DB scehma
const userSchema = new mongoose.Schema({
	email: String,
	password: String,
});
//passport Local mongoose
userSchema.plugin(passportLocalMongoose);

//==MOdel(collection)
const User = mongoose.model("User", userSchema);
//passport local mongoose strategy
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//home page route
app.route("/").get((req, res) => {
	res.render("home");
});
//register page route
app
	.route("/register")
	.get((req, res) => {
		res.render("register");
	})
	.post((req, res) => {});
//login page route
app
	.route("/login")
	.get((req, res) => {
		res.render("login");
	})
	.post((req, res) => {});

app.listen(port, () => {
	console.log(`Server is up! Local Port: ${port}!`);
});
