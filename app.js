const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
let port = process.env.PORT || 3000;
const app = express();
app.set("view engine", "ejs");
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(express.static("public"));
//TODO
app.listen(port, () => {
	console.log(`Server is up! Local Port: ${port}!`);
});
