import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";

const content = {
  fr: {
    title: "Comment ça marche ?",
    steps: [
      { t: "Explorez", d: "Regardez les offres disponibles autour de vous." },
      { t: "Réservez", d: "Sélectionnez votre panier d'invendus." },
      { t: "Récupérez", d: "Allez chez le commerçant avant l'heure de fermeture." }
    ]
  },
  en: {
    title: "How it works?",
    steps: [
      { t: "Explore", d: "Check available offers near you." },
      { t: "Reserve", d: "Select your anti-waste basket." },
      { t: "Collect", d: "Pick it up at the store before closing time." }
    ]
  },
  th: {
    title: "มันทำงานอย่างไร?",
    steps: [
      { t: "สำรวจ", d: "ดูข้อเสนอที่ใช้ได้ใกล้ตัวคุณ" },
      { t: "จอง", d: "เลือกตะกร้าสินค้าของคุณ" },
      { t: "รับสินค้า", d: "ไปที่ร้านค้าก่อนเวลาปิดทำการ" }
    ]
  },
  zh: {
    title: "如何运作？",
    steps: [
      { t: "探索", d: "查看您附近的可用优惠。" },
      { t: "预订", d: "选择您的反浪费篮子。" },
      { t: "领取", d: "在关门前到店领取。" }
    ]
  }
};

const Instructions = () => {
  const [lang, setLang] = useState('fr');

  return (
    <div className="min-h-screen bg-earth p-4 pb-20">
      <div className="max-w-md mx-auto pt-8">
        {/* Sélecteur de langue */}
        <div className="flex justify-center gap-2 mb-8">
          {['fr', 'en', 'th', 'zh'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-2 rounded-full uppercase font-bold text-xs transition-colors ${
                lang === l ? 'bg-citrus text-white' : 'bg-white text-earth border border-border'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          {content[lang].title}
        </h1>

        <div className="space-y-4">
          {content[lang].steps.map((step, index) => (
            <Card key={index} className="border-none shadow-md">
              <CardContent className="flex items-start gap-4 p-4">
                <div className="bg-citrus text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-bold text-earth">{step.t}</h3>
                  <p className="text-sm text-gray-600">{step.d}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Instructions;