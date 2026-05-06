const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/twilio-media" });

app.all("/incoming-call", (req, res) => {
  res.type("text/xml");
  res.send(
    '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Response>' +
      '<Connect>' +
      '<Stream url="wss://miss-render-hotline.onrender.com/twilio-media" />' +
      "</Connect>" +
      "</Response>"
  );
});

wss.on("connection", (ws) => {
  console.log("Twilio connected to /twilio-media");

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
    console.log("Twilio event:", data.event);

    if (data.event === "start") {
      console.log("Stream started:", data.start?.streamSid);
    }

    if (data.event === "media") {
      // Caller audio arrives here from Twilio.
      // We are not sending anything back yet.
    }

    if (data.event === "stop") {
      console.log("Stream stopped");
    }
  });

  ws.on("close", () => {
    console.log("Twilio websocket closed");
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server running on port " + port);
});