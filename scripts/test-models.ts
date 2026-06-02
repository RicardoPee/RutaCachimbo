import "dotenv/config";

async function main() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  // Test simple: solo texto, sin PDF, modelo gemini-2.0-flash-001
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Di 'hola' en español" }] }],
      }),
    }
  );

  console.log("gemini-2.0-flash-001:", response.status, response.statusText);
  const data = await response.json();
  if (!response.ok) {
    console.log("Error:", data.error?.message?.substring(0, 200));
  } else {
    console.log("OK:", data.candidates?.[0]?.content?.parts?.[0]?.text);
  }

  // Test con gemini-2.0-flash-lite
  const response2 = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Di 'hola' en español" }] }],
      }),
    }
  );

  console.log("\ngemini-2.0-flash-lite:", response2.status, response2.statusText);
  const data2 = await response2.json();
  if (!response2.ok) {
    console.log("Error:", data2.error?.message?.substring(0, 200));
  } else {
    console.log("OK:", data2.candidates?.[0]?.content?.parts?.[0]?.text);
  }

  // Test con gemini-2.5-flash
  const response3 = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Di 'hola' en español" }] }],
      }),
    }
  );

  console.log("\ngemini-2.5-flash:", response3.status, response3.statusText);
  const data3 = await response3.json();
  if (!response3.ok) {
    console.log("Error:", data3.error?.message?.substring(0, 200));
  } else {
    console.log("OK:", data3.candidates?.[0]?.content?.parts?.[0]?.text);
  }
}

main().catch(console.error);
