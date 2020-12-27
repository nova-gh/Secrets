const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
let port = process.env.PORT || 3000;
const app = express();
//ejs- use ejs as view engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
//static files from pub folder
app.use(express.static("public"));
//==Mongoose Connection

mongoose.connect(
	"mongodb+srv://admin:admin413@cluster0.hgnmf.mongodb.net/secretsDB",
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
//login page route
app.route("/login").get((req, res) => {
	res.render("login");
});
//register page route
app
	.route("/register")
	.get((req, res) => {
		res.render("register");
	})
	.post((res, req) => {
		const newUser = new User({
			email: req.body.username,
			password: req.body.password,
		});
		newUser.save((err) => {
			if (!err) {
				res.render("secrets");
			} else {
				res.send(err);
			}
		});
	});
app.listen(port, () => {
	console.log(`Server is up! Local Port: ${port}!`);
});
