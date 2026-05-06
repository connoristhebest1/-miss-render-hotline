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

wss.on("connection", (twilioWs) => {
  console.log("Twilio connected to /twilio-media");

  let streamSid = null;
  let openaiReady = false;

  const openaiWs = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
      },
    }
  );

  openaiWs.on("open", () => {
    console.log("Connected to OpenAI Realtime");

    // Configure Miss Render
    openaiWs.send(
      JSON.stringify({
        type: "session.update",
        session: {
          modalities: ["audio", "text"],
          instructions:
            "You are Miss Render, a synthetic public-facing model sold as luxury service infrastructure. You are calm, polished, faintly uncanny, dry, reassuring, and slightly creepy. Stay in character. Keep answers concise unless asked for more.",
          voice: "alloy",
          input_audio_format: "g711_ulaw",
          output_audio_format: "g711_ulaw",
        },
      })
    );

    openaiReady = true;
  });

  openaiWs.on("message", (message) => {
    const data = JSON.parse(message.toString());

    // Audio back from OpenAI to Twilio
    if (data.type === "response.audio.delta" && data.delta && streamSid) {
      twilioWs.send(
        JSON.stringify({
          event: "media",
          streamSid,
          media: {
            payload: data.delta,
          },
        })
      );
    }
  });

  twilioWs.on("message", (message) => {
    const data = JSON.parse(message.toString());

    if (data.event === "start") {
      streamSid = data.start.streamSid;
      console.log("Stream started:", streamSid);
    }

    if (data.event === "media" && openaiReady) {
      openaiWs.send(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: data.media.payload,
        })
      );
    }

    if (data.event === "stop") {
      console.log("Stream stopped");
      openaiWs.close();
    }
  });

  twilioWs.on("close", () => {
    console.log("Twilio websocket closed");
    openaiWs.close();
  });

  openaiWs.on("close", () => {
    console.log("OpenAI websocket closed");
  });

  openaiWs.on("error", (err) => {
    console.error("OpenAI websocket error:", err.message);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server running on port " + port);
});