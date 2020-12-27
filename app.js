const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
let port = process.env.PORT || 3000;
const app = express();
//ejs- use ejs as view engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
//static files from pub folder
app.use(express.static("public"));
//get method
app.get("/", (req, res) => {
	res.render("home");
});
app.get("/login", (req, res) => {
	res.render("login");
});
app.get("/register", (req, res) => {
	res.render("register");
});
app.listen(port, () => {
	console.log(`Server is up! Local Port: ${port}!`);
});
