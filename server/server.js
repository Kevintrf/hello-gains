const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(require("./routes/record"));
// get driver connection
const dbo = require("./db/conn");

const https = require("https");
const fs = require("fs");
const morgan = require("morgan");

// Middleware
app.use(morgan("dev"));

let options = {};

if (process.argv[2] && process.argv[2] === '-dev') {
  console.log("Development mode")

  app.listen(port, async () => {
    // perform a database connection when server starts
    await dbo.connectToServer(function (err) {
      if (err) console.error(err);
    });
    console.log(`Server is running on port: ${port}`);
  });
}
else {
  console.log("Production mode");
  options = {
    key: fs.readFileSync('/YourPathHere/privkey.pem'),
    cert: fs.readFileSync('/YourPathHere/cert.pem'),
    ca: fs.readFileSync('/YourPathHere/chain.pem'),
  };

  // Create HTTPS server
  const server = https.createServer(options, app);

  server.listen(port, async () => {
    // perform a database connection when server starts
    await dbo.connectToServer(function (err) {
      if (err) console.error(err);
    });
    console.log(`Server is running on port: ${port}`);
  });
}

