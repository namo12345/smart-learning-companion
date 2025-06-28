export default async function handler(req, res) {
  const API_KEY = process.env.OR_KEY;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: req.body.prompt }]
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
