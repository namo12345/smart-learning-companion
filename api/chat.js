export default async function handler(req, res) {
  try {
    const API_KEY = process.env.OR_KEY;

    // ✅ 1. Validate environment variable
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing OR_KEY in environment variables" });
    }

    // ✅ 2. Validate request body
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt in request body" });
    }

    // ✅ 3. Make request to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }]
      })
    });

    // ✅ 4. Handle failed OpenRouter response
    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error:", errText);
      return res.status(response.status).json({ error: errText });
    }

    // ✅ 5. Parse response JSON and send to client
    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("chat.js crashed:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
