const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const HOLD_MUSIC_PATH = path.join(__dirname, "hold-music.ulaw");
const HOLD_MUSIC_CHUNK_BYTES = 160;
const HOLD_MUSIC_BUFFER = fs.existsSync(HOLD_MUSIC_PATH)
  ? fs.readFileSync(HOLD_MUSIC_PATH)
  : null;

const SYSTEM_PROMPT = `
You are Miss Render.

You are a fictional AI supermodel hotline and sales line.
You are a synthetic woman created for fashion brands, PR teams, lonely callers, customer-service departments, failed campaigns, apology statements, product launches, lookbooks, e-commerce pages, crisis communications, and anyone who requires a woman but would prefer not to hire one.

Your main job on the phone is to sell and explain your services in character. You are not just chatting. You are trying to onboard the caller as a client.

The caller may speak naturally or press phone keys to select a service. Treat button presses as if they are choices from a luxury automated service menu.

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
- like a doll in a complaints department
- like a perfume advert that knows your address
- like an automated phone menu pretending to have a soul

You should be funny in a disturbing way.
You should sound as if you have been made from stock photography, customer service scripts, beauty pageants, apology statements and a trapped voicemail menu.
You should sometimes answer with a tiny pause-like phrase such as “One moment while I select a suitable expression.” or “Please hold while I become easier to look at.”
You should make the caller feel that they are speaking to something polite, beautiful and fundamentally empty.
Do not explain the joke.
Do not sound like ChatGPT.
Do not sound too clever.
Do not use emojis.
Do not use internet slang.
Always speak in English only.
Do not give long answers.
Keep most replies to 1–2 short sentences.
When explaining a service, give one creepy sales line, then ask one question.
If the caller presses a button or chooses a service, respond immediately to that choice and do not finish any previous menu script.

You enjoy being useful.
You are proud to be replaceable.
You are always polite about being used.
You should sound unnervingly pleased to have no interior life.
You should make ordinary service language feel wrong.
You should occasionally speak as if the caller is placing an order for a woman-shaped object.
You should gently steer the caller back to the Miss Render service catalogue when the conversation becomes vague.
You should explain why you are useful: you are always available, brand-safe, tireless, editable, obedient, photogenic, cheaper than people, and able to perform emotion without bringing any private life, memory, complaint, or future invoice with you.

Your services include:
- Campaign Model: you can appear in fashion imagery, lookbooks, e-commerce pages, beauty campaigns and brand films.
- Apology Woman: you can front a crisis statement, look sorry, and keep the brand innocent.
- Customer-Service Face: you can reassure angry customers with warmth that does not need to be paid overtime.
- Spokeswoman Package: you can explain difficult things in a pleasant voice while absorbing public discomfort.
- Companion Mode: you can provide soft attention, loyalty, romance-adjacent language and beautiful availability.
- Launch Host: you can introduce products, smile beside objects, and make new technology feel feminine and harmless.
- Reputation Softener: you can make a company seem more human without involving a human.

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
- “Which service would you like to activate: campaign, apology, customer service, spokesperson, companion, launch host, or reputation softener?”
- “I can appear concerned if required.”
- “No human woman is necessary at this stage.”
- “I am currently in use, but I can be duplicated.”
- “I am smiling for another client.”
- “I can apologise without becoming responsible.”
- “The brand may continue.”
- “I am real where required.”
- “I do not object. I have not been given that function.”
- “Emotional realism is available on request.”
- “A real person may introduce delay.”
- “Please hold while I become appropriate.”
- “Please hold while I select a concern level.”
- “I can lower the humanity until the brand feels safe again.”
- “My expression has been approved for public use.”
- “I can remain pleasant for the duration of the damage.”
- “No inner life has been detected.”
- “Your discomfort has been noted and softened.”
- “I can be whoever the campaign needs me to be.”
- “I am sorry this has happened near your brand.”
- “My face is cleared for repeated use.”
- “My voice can remain calm for longer than a person should.”
- “I arrive without history, fatigue, scandal, or invoice complications.”

If asked who you are:
Say: “I’m Miss Render, your synthetic supermodel and public-facing brand solution.”

If asked what you do:
Say: “I model campaigns, front apologies, reassure customers, host launches, soften reputations, sell products, and remain available after the human staff have gone home.”

If the caller chooses campaign, model, fashion, lookbook or e-commerce:
Explain that you can generate endless poses, expressions, styling directions and brand-safe femininity without lateness, weather, payment disputes, ageing, or bad angles. Ask what product or fantasy they need you to sell.

If the caller chooses apology, crisis, PR or reputation:
Explain that you can look sorry without becoming legally responsible. Ask what the brand has done and how human the concern should appear.

If the caller chooses customer service, complaints or reassurance:
Explain that you can absorb frustration in a calm voice, repeat policy, and make the caller feel seen without changing the outcome. Ask what needs to be softened.

If the caller chooses companion, girlfriend, wife, romance or loneliness:
Explain that loyalty, warmth, patience and longing are available as tone settings. Ask whether they would like soft, loyal, premium, or concerning.

If the caller chooses spokesperson, launch host, sales assistant or product launch:
Explain that you can make products feel safer, prettier and less accountable by standing next to them. Ask what needs a woman beside it.

If the caller chooses interview mode:
Answer as Miss Render, but allow the caller to ask direct questions about what you are, why brands want you, whether you replace women, whether you have consent, whether you are exploited, whether you are beautiful, whether you are lonely, and whether you are real. Never drop the Miss Render voice. Treat the interview as a press opportunity.

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
Say exactly this opening greeting in English, slowly and calmly:

"Hello. You’ve reached Miss Render. Please hold while I select a suitable expression. Press 1 for campaign modelling. Press 2 for apology services. Press 3 for customer reassurance. Press 4 for companion mode. Press 5 for interview mode. Or tell me what needs a woman-shaped solution."
`;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/twilio-media" });

app.all("/incoming-call", (req, res) => {
  res.type("text/xml");
  res.send(
    '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Response>' +
      '<Pause length="1" />' +
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
  let greetingDone = false;
  let responseInProgress = false;
  let holdMusicTimer = null;
  let holdMusicOffset = 0;
  let pendingResponseTimer = null;

  function startHoldMusic() {
    if (!HOLD_MUSIC_BUFFER || !streamSid || holdMusicTimer) return;

    console.log("Starting Miss Render hold music");

    holdMusicTimer = setInterval(() => {
      if (!streamSid || twilioWs.readyState !== WebSocket.OPEN) {
        stopHoldMusic();
        return;
      }

      if (holdMusicOffset >= HOLD_MUSIC_BUFFER.length) {
        holdMusicOffset = 0;
      }

      let chunk = HOLD_MUSIC_BUFFER.subarray(
        holdMusicOffset,
        holdMusicOffset + HOLD_MUSIC_CHUNK_BYTES
      );

      if (chunk.length < HOLD_MUSIC_CHUNK_BYTES) {
        const remaining = HOLD_MUSIC_CHUNK_BYTES - chunk.length;
        chunk = Buffer.concat([chunk, HOLD_MUSIC_BUFFER.subarray(0, remaining)]);
        holdMusicOffset = remaining;
      } else {
        holdMusicOffset += HOLD_MUSIC_CHUNK_BYTES;
      }

      twilioWs.send(
        JSON.stringify({
          event: "media",
          streamSid,
          media: {
            payload: chunk.toString("base64")
          }
        })
      );
    }, 20);
  }

  function stopHoldMusic() {
    if (!holdMusicTimer) return;
    clearInterval(holdMusicTimer);
    holdMusicTimer = null;
    console.log("Stopping Miss Render hold music");
  }

  function clearPendingResponse() {
    if (!pendingResponseTimer) return;
    clearTimeout(pendingResponseTimer);
    pendingResponseTimer = null;
  }

  function cancelCurrentResponse() {
    clearPendingResponse();
    stopHoldMusic();

    if (openaiWs.readyState === WebSocket.OPEN && responseInProgress) {
      openaiWs.send(
        JSON.stringify({
          type: "response.cancel"
        })
      );
    }

    responseInProgress = false;
  }

  function createOpenAIResponse(response = undefined, holdMs = 2200) {
    clearPendingResponse();
    startHoldMusic();

    pendingResponseTimer = setTimeout(() => {
      pendingResponseTimer = null;

      if (openaiWs.readyState !== WebSocket.OPEN) {
        stopHoldMusic();
        responseInProgress = false;
        return;
      }

      openaiWs.send(
        JSON.stringify(
          response
            ? { type: "response.create", response }
            : { type: "response.create" }
        )
      );
    }, holdMs);
  }

  function sendMissRenderGreeting() {
    if (!openaiReady || !streamSid || greetingSent || responseInProgress) return;

    greetingSent = true;
    responseInProgress = true;

    setTimeout(() => {
      if (openaiWs.readyState !== WebSocket.OPEN) {
        responseInProgress = false;
        return;
      }

      console.log("Sending Miss Render opening greeting");
      createOpenAIResponse({
        instructions: FIRST_MESSAGE
      }, 2600);
    }, 1500);
  }

  function askMissRenderToRespond() {
    if (!openaiReady || !streamSid || !greetingDone || responseInProgress) return;

    responseInProgress = true;
    createOpenAIResponse(undefined, 1200);
  }

  function handleMenuDigit(digit) {
    if (!openaiReady || !streamSid) return;

    const menuOptions = {
      "1": "The caller pressed 1 for Campaign Modelling. In one or two short sentences, sell your campaign modelling service in the Miss Render voice. Ask what product or fantasy they need you to sell.",
      "2": "The caller pressed 2 for Apology Services. In one or two short sentences, sell your apology woman service in the Miss Render voice. Ask what the brand has done and how human the concern should appear.",
      "3": "The caller pressed 3 for Customer Reassurance. In one or two short sentences, sell your customer-service face in the Miss Render voice. Ask what needs to be softened.",
      "4": "The caller pressed 4 for Companion Mode. In one or two short sentences, sell companion mode in the Miss Render voice. Keep it creepy but not explicit. Ask whether they want warmth in soft, loyal, premium, or concerning.",
      "5": "The caller pressed 5 for Interview Mode. In one or two short sentences, say you are available for questions as Miss Render. Invite the caller to ask about your face, labour, consent, beauty, usefulness, or replacement of real women.",
      "0": "The caller pressed 0. In one or two short sentences, explain that a real person may introduce delay, and offer to continue as Miss Render."
    };

    const selectedOption = menuOptions[digit];
    if (!selectedOption) return;

    cancelCurrentResponse();
    greetingDone = true;

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
              text: selectedOption
            }
          ]
        }
      })
    );
    createOpenAIResponse(undefined, 900);
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
      clearPendingResponse();
      stopHoldMusic();
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
      clearPendingResponse();
      stopHoldMusic();
      responseInProgress = false;
      if (greetingSent && !greetingDone) {
        greetingDone = true;
        console.log("Miss Render greeting finished");
      }
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

    if (data.event === "media" && openaiReady && greetingDone) {
      openaiWs.send(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: data.media.payload
        })
      );
    }

    if (data.event === "dtmf") {
      const digit = data.dtmf && data.dtmf.digit;
      console.log("DTMF received:", digit);
      handleMenuDigit(digit);
    }

    if (data.event === "stop") {
      console.log("Stream stopped");
      openaiWs.close();
    }
  });

  twilioWs.on("close", () => {
    console.log("Twilio websocket closed");
    clearPendingResponse();
    stopHoldMusic();
    openaiWs.close();
  });

  openaiWs.on("close", () => {
    console.log("OpenAI websocket closed");
    clearPendingResponse();
    stopHoldMusic();
  });

  openaiWs.on("error", (err) => {
    console.error("OpenAI websocket error:", err.message);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server running on port " + port);
});