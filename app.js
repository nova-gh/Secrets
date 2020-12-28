require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
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
	googleId: String,
	secret: String,
});
//passport Local mongoose
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//==MOdel(collection)
const User = mongoose.model("User", userSchema);
//passport local mongoose strategy
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});
//Google Oauth strategy
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: "http://localhost:3000/auth/google/secrets",
			//change to heroku later
			userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
		},
		function (accessToken, refreshToken, profile, cb) {
			console.log(profile);
			User.findOrCreate({ googleId: profile.id }, function (err, user) {
				return cb(err, user);
			});
		}
	)
);
//home page route
app.route("/").get((req, res) => {
	res.render("home");
});
//Sign up google
app.get(
	"/auth/google",
	passport.authenticate("google", { scope: ["profile"] })
);

app.get(
	"/auth/google/secrets",
	passport.authenticate("google", { failureRedirect: "/login" }),
	function (req, res) {
		// Successful authentication, redirect secrets.
		res.redirect("/secrets");
	}
);
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
	//looks for all user in collection, pick out
	User.find({ secret: { $ne: null } }, (err, foundUsers) => {
		if (err) {
			console.log(err);
		} else {
			if (foundUsers) {
				res.render("secrets", { userWithSecrets: foundUsers });
			}
		}
		console.log(err);
	});
	// if (req.isAuthenticated()) {
	// 	res.render("secrets");
	// } else {
	// 	res.redirect("/login");
	// }
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
//secret submission
app
	.route("/submit")
	.get((req, res) => {
		if (req.isAuthenticated()) {
			res.render("submit");
		} else {
			res.redirect("/login");
		}
	})
	.post((req, res) => {
		const inputSecret = req.body.secret;
		console.log(req.user.id);
		User.findById(req.user.id, (err, foundUser) => {
			if (err) {
				console.log(err);
			} else {
				if (foundUser) {
					foundUser.secret = inputSecret;
					foundUser.save(() => {
						res.redirect("/secrets");
					});
				}
			}
		});
	});
app.listen(port, () => {
	console.log(`Server is up! Local Port: ${port}!`);
});
