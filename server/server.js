import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://elioh6.github.io/small-ai-project"
  ]
}));

app.use(express.json());

if (!process.env.OPENROUTER_API_KEY) {
  console.error("Missing OPENROUTER_API_KEY in .env");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5500",
    "X-Title": "BTS SIO AI"
  }
});

const conversations = new Map();

app.get("/", (req, res) => {
  res.json({ message: "Backend is running." });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const cleanMessage = message.trim();
    const chatId = sessionId || "default";

    if (!conversations.has(chatId)) {
      conversations.set(chatId, [
        {
          role: "system",
          content:
            "You are a helpful student assistant for BTS SIO students. Answer clearly, simply, and in a student-friendly way."
        }
      ]);
    }

    const history = conversations.get(chatId);

    history.push({
      role: "user",
      content: cleanMessage
    });

    const completion = await client.chat.completions.create({
      model: "openrouter/free",
      messages: history,
      max_tokens: 300,
      temperature: 0.7
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I could not generate a response.";

    history.push({
      role: "assistant",
      content: reply
    });

    if (history.length > 20) {
      const systemMessage = history[0];
      const recent = history.slice(-18);
      conversations.set(chatId, [systemMessage, ...recent]);
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);

    if (error?.status === 429) {
      return res.status(429).json({
        error: "Free models are temporarily rate-limited. Try again in a moment."
      });
    }

    if (error?.status === 400) {
      return res.status(400).json({
        error: error?.error?.message || "Bad request sent to provider."
      });
    }

    res.status(500).json({
      error: error?.message || "Something went wrong while generating the response."
    });
  }
});

app.post("/api/reset", (req, res) => {
  const { sessionId } = req.body;
  const chatId = sessionId || "default";
  conversations.delete(chatId);
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});