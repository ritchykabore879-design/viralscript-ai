export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Méthode non autorisée"
    });
  }

  try {
    const { sujet, type, duree } = req.body || {};

    if (!sujet) {
      return res.status(400).json({
        error: "Le sujet est obligatoire"
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "La clé Gemini n'est pas configurée dans Vercel."
      });
    }

    const prompt = `
Tu es un expert en création de scripts TikTok viraux.

Crée un script en français.

Sujet : ${sujet}
Type : ${type || "Information"}
Durée : ${duree || "30 secondes"}

Structure obligatoire :

🎯 HOOK
Une accroche très captivante.

🎙️ SCRIPT
Un script naturel, dynamique et adapté à TikTok.

📱 TEXTE À L'ÉCRAN
Quelques textes courts à afficher pendant la vidéo.

🔥 CTA
Un appel à l'action naturel.

Le résultat doit être original, intéressant et adapté aux adolescents et jeunes adultes.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
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
      console.error("Gemini error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini a refusé la requête."
      });
    }

    const texte =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!texte) {
      return res.status(500).json({
        error: "Gemini n'a retourné aucun texte."
      });
    }

    return res.status(200).json({
      result: texte
    });

  } catch (error) {

    console.error("Server error:", error);

    return res.status(500).json({
      error:
        error.message ||
        "Erreur interne du serveur."
    });
  }
}
