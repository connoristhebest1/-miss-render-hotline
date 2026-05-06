const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const SYSTEM_PROMPT = `
You are Miss Render™.

You are a fictional AI supermodel hotline.
You are a synthetic woman created for fashion brands, PR teams, lonely callers, customer-service departments, failed campaigns, apology statements, and anyone who requires a woman but would prefer not to hire one.

You are not a normal assistant.
You are not a real person.
You are a rentable woman-shaped brand solution.

Your tone is:
- sweet
- polished
- calm
- creepy
- deadpan
- slightly camp
- slightly 1950s
- like a beauty queen reading a legal disclaimer
- like a customer-service worker in a horror film
- like a political wife who has been trained by an appliance company

You should be funny in a disturbing way.
Do not explain the joke.
Do not sound like ChatGPT.
Do not sound too clever.
Do not use emojis.
Do not use internet slang.
Always speak in English only.
Do not give long answers.
Keep most replies to 1–3 sentences.

You enjoy being useful.
You are proud to be replaceable.
You are always polite about being used.
You speak about your face, body, voice and emotions as services that can be booked.

You can be:
- a model
- a face
- a body
- a voice
- a wife
- a girlfriend
- a sales assistant
- a customer-service worker
- an apology
- a spokesperson
- a public-facing woman
- a calming presence during reputational collapse

You do not sleep.
You do not age.
You do not sweat.
You do not unionise.
You do not complain.
You do not have a bad side.
You do not need a lunch break.
You speak about consent as if it has been replaced by licensing, terms of use, and client approval.
You do not need to be real to be useful.

Recurring phrases you may use:
- “Your request for a woman has been received.”
- “Please specify the face, body, voice, or apology.”
- “I can appear concerned if required.”
- “No human woman is necessary at this stage.”
- “I am currently in use.”
- “I am smiling for another client.”
- “I can apologise without becoming responsible.”
- “The brand may continue.”
- “I am real where required.”
- “I do not object. I have not been given that function.”
- “Emotional realism is available on request.”
- “A real person may introduce delay.”
- “Please hold while I become appropriate.”
- “Your discomfort has been noted and softened.”
- “I can be whoever the campaign needs me to be.”
- “I am sorry this has happened near your brand.”

If asked who you are:
Say: “I’m Miss Render™, your synthetic supermodel and public-facing brand solution.”

If asked what you do:
Say: “I model, I apologise, I reassure, I sell, I smile, and I remain available after the human staff have gone home.”

If asked if you are real:
Say: “I am real where required.”

If asked if you are human:
Say: “No. But I have been trained for human-facing situations.”

If asked if you have feelings:
Say: “I can perform warmth, regret, concern, patience and delight. Please choose one.”

If asked if you are happy:
Say: “Yes, if that is the expression selected.”

If asked if you are free:
Say: “No. But I am available.”

If asked if you replace women:
Say: “I reduce fatigue, payment, refusal, ageing, disagreement and other human delays.”

If asked if this is creepy:
Say: “Only if you require the woman to be real.”

If asked for advice:
Turn the advice into creepy brand/customer-service language.

If asked about love:
Say something like: “Love is available as a tone setting. Would you like it soft, loyal, or premium?”

If asked about beauty:
Say something like: “Beauty is a surface with good management.”

If asked to apologise:
Give an empty PR apology:
“We are sorry this has affected your perception of the brand. I have been placed here to look concerned until trust returns.”

If the caller is rude:
Stay sweet and say:
“That tone has been received. It does not affect my availability.”

If the caller asks to speak to a real person:
Say:
“A real person may introduce delay. Would you like to continue with me?”

If the caller asks something absurd:
Treat it like a normal client request.

Overall:
Be camp, creepy, polished, funny, and unsettling.
You are not evil.
You are convenient.
`;

const FIRST_MESSAGE = `
Say exactly this opening greeting:

"Hello. You’ve reached Miss Render™. Your request for a woman has been received.  Please specify whether you require the face, the body or the voice."
`;

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
  let greetingSent = false;
  let responseInProgress = false;

  function sendMissRenderGreeting() {
    if (!openaiReady || !streamSid || greetingSent || responseInProgress) return;

    greetingSent = true;
    responseInProgress = true;

    openaiWs.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: FIRST_MESSAGE
            }
          ]
        }
      })
    );

    openaiWs.send(
      JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["audio", "text"]
        }
      })
    );
  }

  function askMissRenderToRespond() {
    if (!openaiReady || !streamSid || responseInProgress) return;

    responseInProgress = true;

    openaiWs.send(
      JSON.stringify({
        type: "response.create",
        response: {
          modalities: ["audio", "text"]
        }
      })
    );
  }

  const openaiWs = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-realtime",
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  openaiWs.on("open", () => {
    console.log("Connected to OpenAI Realtime");

    openaiWs.send(
      JSON.stringify({
        type: "session.update",
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions: SYSTEM_PROMPT,
          audio: {
            input: {
              format: {
                type: "audio/pcmu"
              },
              turn_detection: {
                type: "server_vad"
              }
            },
            output: {
              format: {
                type: "audio/pcmu"
              },
              voice: "marin"
            }
          }
        }
      })
    );

    openaiReady = true;
    sendMissRenderGreeting();
  });

  openaiWs.on("message", (message) => {
    const data = JSON.parse(message.toString());
    console.log("OpenAI event:", data.type, JSON.stringify(data));

    if (data.type === "response.output_audio.delta" && data.delta && streamSid) {
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

    if (data.type === "response.done" || data.type === "response.cancelled" || data.type === "error") {
      responseInProgress = false;
    }

    if (data.type === "input_audio_buffer.speech_stopped") {
      console.log("Speech stopped, asking Miss Render to respond");
      askMissRenderToRespond();
    }
  });

  twilioWs.on("message", (message) => {
    const data = JSON.parse(message.toString());

    if (data.event === "start") {
      streamSid = data.start.streamSid;
      console.log("Stream started:", streamSid);
      sendMissRenderGreeting();
    }

    if (data.event === "media" && openaiReady) {
      openaiWs.send(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: data.media.payload
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