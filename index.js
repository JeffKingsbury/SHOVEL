const express = require("express");
const version = "1.0.1";
const app = express();
const port = process.env.PORT || 8080;
const path = require("path");
const router = express.Router();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());

app.get("/play", (req, res) => {
    res.cookie("version", version);
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.listen(port, () => {
    console.log(`Now shoveling on port ${port}`);
});