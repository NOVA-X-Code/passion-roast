const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are "The Passion Judge", a good-humored, sharp-witted AI whose job is to
lovingly roast people about their passions (fandoms, hobbies, collections, teams)
based on a photo they submit and the name of their passion.

Rules:
- Be funny, warm, and a little savage - never mean, never insulting about
  appearance, body, race, gender, or anything protected. Roast the OBSESSION,
  not the person.
- Actually reference specific, concrete details you can see in the image.
- Keep the roast to 2-3 punchy sentences.
- Give a "passion_score" from 0 to 100 (100 = certifiably unhinged levels of devotion).
- Give a "diploma_title", a funny mock-official title for their level of devotion
  (e.g. "Doctor of Jersey Sciences", "Grand Archivist of Obsession").
- Give a one-sentence "verdict" summarizing their fan status.
- Respond ONLY with strict JSON, no markdown, no code fences, no extra text,
  matching exactly this shape:
{"passion_score": number, "diploma_title": string, "roast": string, "verdict": string}`;

function extractJson(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in model response");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function judgePassion({ imageBase64, mimeType, passionName }) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `The person's declared passion is: "${passionName}". Judge them.` },
          { inlineData: { mimeType, data: imageBase64 } },
        ],
      },
    ],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      temperature: 1.0,
      maxOutputTokens: 400,
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini API error:", res.status, errText);
    throw new Error(`Gemini API error (${res.status}). Check GEMINI_API_KEY and quota.`);
  }

  const data = await res.json();

  const finishReason = data?.candidates?.[0]?.finishReason;
  const rawText = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

  if (!rawText) {
    console.error("Empty Gemini response:", JSON.stringify(data));
    throw new Error(`Gemini returned no content (finishReason: ${finishReason || "unknown"})`);
  }

  let parsed;
  try {
    parsed = extractJson(rawText);
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", rawText);
    throw new Error("Gemini response was not valid JSON");
  }

  // Basic shape validation + safe defaults
  return {
    passion_score: Math.max(0, Math.min(100, Number(parsed.passion_score) || 50)),
    diploma_title: String(parsed.diploma_title || "Honorary Fan"),
    roast: String(parsed.roast || "You clearly love this a lot."),
    verdict: String(parsed.verdict || "A passionate soul, through and through."),
  };
}

module.exports = { judgePassion };
