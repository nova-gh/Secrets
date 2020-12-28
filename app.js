require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
let port = process.env.PORT || 3000;
const app = express();
//ejs- use ejs as view engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
//static files from pub folder
app.use(express.static("public"));
//==Mongoose Connection

mongoose.connect(
	"mongodb+srv://admin:admin413@cluster0.hgnmf.mongodb.net/userDB",
	{ useNewUrlParser: true, useUnifiedTopology: true }
);
//==DB scehma
const userSchema = new mongoose.Schema({
	email: String,
	password: String,
});
//==MOdel(collection)
const User = mongoose.model("User", userSchema);

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
		bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
			// Store hash in your password DB.
			const newUser = new User({
				email: req.body.username,
				password: hash,
				//hashed pass
			});
			newUser.save((err) => {
				if (!err) {
					res.render("secrets");
				} else {
					res.send(err);
				}
			});
		});
	});
//login page route
app
	.route("/login")
	.get((req, res) => {
		res.render("login");
	})
	.post((req, res) => {
		const username = req.body.username;
		const password = req.body.password;
		//find query
		User.findOne({ email: username }, (err, foundUser) => {
			if (!err) {
				if (foundUser) {
					bcrypt.compare(password, foundUser.password, function (err, result) {
						if (result === true) {
							res.render("secrets");
						}
					});
				}
			}
		});
	});

app.listen(port, () => {
	console.log(`Server is up! Local Port: ${port}!`);
});
