const express = require("express");
const app = express();

app.all("/incoming-call", (req, res) => {
  res.type("text/xml");
  res.send('<?xml version="1.0" encoding="UTF-8"?><Response><Say>Hello. You have reached Miss Render.</Say></Response>');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server running on port " + port);
});