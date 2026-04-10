// src/lib/translate.js
export async function translateText(text, targetLang) {
  if (!text || text.trim() === "") return "";
  
  try {
    // encodeURIComponent est plus robuste pour les caractères spéciaux
    const encodedText = encodeURIComponent(text);
    
    
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`
    );

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    
    if (data && data[0]) {
      return data[0].map((item) => item[0]).join("");
    }
    
    return text;
  } catch (error) {
    console.error(`Erreur Traduction vers ${targetLang}:`, error);
    return text; // Retourne le texte original en cas d'échec
  }
}