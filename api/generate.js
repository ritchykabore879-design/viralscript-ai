export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Méthode non autorisée"
    });
  }

  try {
    const { sujet, type, duree } = req.body;

    if (!sujet) {
      return res.status(400).json({
        error: "Le sujet est obligatoire"
      });
    }

    const prompt = `
Tu es un expert en création de contenu TikTok.

Crée un script TikTok en français.

Sujet : ${sujet}
Type : ${type || "Information"}
Durée : ${duree || "30 secondes"}

Réponds exactement avec cette structure :

🎯 HOOK
[hook captivant]

🎙️ SCRIPT
[script complet]

📱 TEXTE À L'ÉCRAN
[textes courts à afficher]

🔥 CTA
[appel à l'action]

Le contenu doit être naturel, captivant et adapté à une vidéo courte.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=" +
      process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erreur Gemini",
        details: data
      });
    }

    const texte =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!texte) {
      return res.status(500).json({
        error: "Aucune réponse de l'IA"
      });
    }

    return res.status(200).json({
      result: texte
    });

  } catch (error) {

    return res.status(500).json({
      error: "Erreur serveur",
      details: error.message
    });

  }
          }
