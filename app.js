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
	.post((req, res) => {
		User.register(
			{ username: req.body.username },
			req.body.password,
			(err, user) => {
				if (err) {
					console.log(err);
					res.redirect("/register");
				} else {
					passport.authenticate("local")(req, res, () => {
						//since user registered direct them to secrets
						res.redirect("/secrets");
					});
				}
			}
		);
	});
//Secrets page route
app.route("/secrets").get((req, res) => {
	if (req.isAuthenticated()) {
		res.render("secrets");
	} else {
		res.redirect("/login");
	}
});
//login page route
app
	.route("/login")
	.get((req, res) => {
		res.render("login");
	})
	.post((req, res) => {
		const user = new User({
			username: req.body.username,
			password: req.body.password,
		});
		req.login(user, (err) => {
			if (err) {
				console.log(err);
			} else {
				passport.authenticate("local")(req, res, () => {
					//since user registered direct them to secrets
					res.redirect("/secrets");
				});
			}
		});
	});
//logout route
app.route("/logout").get((req, res) => {
	req.logOut();
	res.redirect("/");
});
app.listen(port, () => {
	console.log(`Server is up! Local Port: ${port}!`);
});
