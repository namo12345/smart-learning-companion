export default async function handler(req, res) {
  try {
    const API_KEY = process.env.OR_KEY;

    // Validate that the API key is present
    if (!API_KEY) {
      return res.status(500).json({ error: "Missing OR_KEY in environment variables" });
    }

    // Parse the prompt from request
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt in request body" });
    }

    // Send request to OpenRouter
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

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("chat.js failed:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
