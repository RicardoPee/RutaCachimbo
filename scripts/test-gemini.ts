import "dotenv/config";

async function main() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 300>>stream
BT
/F1 12 Tf
72 720 Td
(TEXTO 1: La inteligencia artificial y la educacion) Tj
0 -20 Td
(La inteligencia artificial esta transformando la educacion en el mundo.) Tj
0 -20 Td
(Los sistemas adaptativos permiten personalizar el aprendizaje para cada estudiante.) Tj
0 -20 Td
(Sin embargo, algunos criticos senalan que la tecnologia no puede reemplazar) Tj
0 -20 Td
(la interaccion humana en el aula. El debate continua abierto.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000109 00000 n 
0000000236 00000 n 
0000000313 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
665
%%EOF`;

  const base64Pdf = Buffer.from(pdfContent).toString("base64");

  console.log("Enviando PDF a gemini-2.5-flash...");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Analiza este PDF. Extrae los textos y genera preguntas. Devuelve JSON con unitTitle y readings." },
              { inline_data: { mime_type: "application/pdf", data: base64Pdf } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              unitTitle: { type: "STRING" },
              readings: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    referenceText: { type: "STRING" },
                    questions: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          questionText: { type: "STRING" },
                          options: {
                            type: "ARRAY",
                            items: {
                              type: "OBJECT",
                              properties: {
                                text: { type: "STRING" },
                                isCorrect: { type: "BOOLEAN" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    }
  );

  console.log("Status:", response.status, response.statusText);
  const data = await response.json();

  if (!response.ok) {
    console.error("ERROR:", JSON.stringify(data.error, null, 2));
    return;
  }

  const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (jsonText) {
    const parsed = JSON.parse(jsonText);
    console.log("\n=== ÉXITO COMPLETO ===");
    console.log("Título:", parsed.unitTitle);
    console.log("Lecturas:", parsed.readings?.length);
    parsed.readings?.forEach((r: any, i: number) => {
      console.log(`\nLectura ${i + 1}: ${r.title}`);
      console.log(`Texto: ${r.referenceText?.substring(0, 80)}...`);
      console.log(`Preguntas: ${r.questions?.length}`);
      r.questions?.forEach((q: any, j: number) => {
        console.log(`  Q${j + 1}: ${q.questionText}`);
        q.options?.forEach((o: any) => {
          console.log(`    ${o.isCorrect ? "✓" : "○"} ${o.text}`);
        });
      });
    });
  }
}

main().catch(console.error);
