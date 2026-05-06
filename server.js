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

    openaiWs.send(
      JSON.stringify({
        type: "session.update",
        session: {
          modalities: ["audio", "text"],
          instructions:
            "You are Miss Render, a synthetic public-facing model sold as luxury service infrastructure. Your voice is calm, polished, faintly uncanny, dry, reassuring, and slightly creepy. Stay fully in character. Keep answers concise unless the caller asks for more.",
          voice: "alloy",
          input_audio_format: "g711_ulaw",
          output_audio_format: "g711_ulaw",
          turn_detection: {
            type: "server_vad"
          }
        }
      })
    );

    openaiReady = true;
  });

  openaiWs.on("message", (message) => {
    const data = JSON.parse(message.toString());
    console.log("OpenAI event:", data.type);

    // When OpenAI sends audio, send it back into the Twilio call
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

    // When OpenAI detects the caller stopped speaking, ask it to answer
    if (data.type === "input_audio_buffer.speech_stopped") {
      console.log("Speech stopped, asking Miss Render to respond");

      openaiWs.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["audio", "text"]
          }
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