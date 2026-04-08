import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Store, User, QrCode, Megaphone } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const content = {
  fr: {
    title: "Mode d'emploi",
    merchantTitle: "Espace Commerçant",
    customerTitle: "Espace Client",
    merchantDesc: "Suivez ces étapes pour publier une offre.",
    scanAction: "Scannez le QR Code pour commencer",
    promoAdvice: "N'oubliez pas de mettre cette affiche dans votre magasin, sur le comptoir par exemple pour qu'elle soit bien visible ! Parlez de cette application à tous vos clients pour qu'ils profitent de vos super promotions !",
    steps: [
      { t: "Connexion", d: "Entrez votre email et votre mot de passe.", icon: "🔑" },
      { t: "Configuration", d: "Dans le tableau de bord, allez dans 'Paramètres boutique' pour remplir vos informations.", icon: "⚙️" },
      { t: "Création", d: "Cliquez sur 'Publiez une offre'. Prenez une photo ou téléchargez-en une depuis votre ordinateur.", icon: "📸" },
      { t: "Validation", d: "Remplissez les champs nécessaires et cliquez sur 'Publier'. Votre offre est en ligne !", icon: "✅" }
    ],
    customerText: "Scannez pour voir les offres et payez directement en magasin."
  },
  en: {
    title: "How it works",
    merchantTitle: "Merchant Space",
    customerTitle: "Customer Space",
    merchantDesc: "Follow these steps to publish an offer.",
    scanAction: "Scan the QR Code to start",
    promoAdvice: "Don't forget to put this poster in your shop, on the counter for example! Tell all your customers about this app so they can enjoy your great promotions!",
    steps: [
      { t: "Login", d: "Enter your email and password.", icon: "🔑" },
      { t: "Setup", d: "In the dashboard, go to 'Shop Settings' to fill in your information.", icon: "⚙️" },
      { t: "Create", d: "Click 'Publish an offer'. Take a photo or upload one from your computer.", icon: "📸" },
      { t: "Validate", d: "Fill in the required fields and click 'Publish'. Your offer is instantly online!", icon: "✅" }
    ],
    customerText: "Scan to see offers and pay directly at the shop."
  },
  th: {
    title: "คู่มือการใช้งาน",
    merchantTitle: "สำหรับร้านค้า",
    customerTitle: "สำหรับลูกค้า",
    merchantDesc: "ทำตามขั้นตอนเหล่านี้เพื่อเผยแพร่ข้อเสนอ",
    scanAction: "สแกน QR Code เพื่อเริ่มต้น",
    promoAdvice: "อย่าลืมวางป้ายนี้ในร้านของคุณ เช่น บนเคาน์เตอร์ เพื่อให้ลูกค้าเห็นได้ชัดเจน! บอกลูกค้าทุกคนเกี่ยวกับแอปนี้เพื่อให้พวกเขาไม่พลาดโปรโมชั่นสุดพิเศษของคุณ!",
    steps: [
      { t: "เข้าสู่ระบบ", d: "กรอกอีเมลและรหัสผ่านของคุณ", icon: "🔑" },
      { t: "ตั้งค่า", d: "ไปที่ 'การตั้งค่าร้านค้า' เพื่อกรอกข้อมูลของคุณ", icon: "⚙️" },
      { t: "สร้างข้อเสนอ", d: "คลิก 'เผยแพร่ข้อเสนอ' ถ่ายรูปหรืออัปโหลดรูปภาพ", icon: "📸" },
      { t: "ยืนยัน", d: "กรอกข้อมูลและคลิก 'เผยแพร่' ข้อเสนอของคุณจะออนไลน์ทันที", icon: "✅" }
    ],
    customerText: "สแกนเพื่อดูข้อเสนอและชำระเงินโดยตรงที่ร้านค้า"
  },
  ru: {
    title: "Инструкция",
    merchantTitle: "Для бизнеса",
    customerTitle: "Для клиента",
    merchantDesc: "Выполните следующие шаги, чтобы опубликовать предложение.",
    scanAction: "Отсканируйте QR-код, чтобы начать",
    promoAdvice: "Не забудьте разместить этот плакат в своем магазине, например на прилавке! Рассказывайте об этом приложении всем клиентам, чтобы они знали о ваших супер-акциях!",
    steps: [
      { t: "Вход", d: "Введите ваш email и пароль.", icon: "🔑" },
      { t: "Настройка", d: "В панели управления перейдите в 'Настройки магазина' и заполните данные.", icon: "⚙️" },
      { t: "Создание", d: "Нажмите 'Опубликовать предложение'. Сделайте фото или загрузите его.", icon: "📸" },
      { t: "Готово", d: "Заполните поля и нажмите 'Опубликовать'. Ваше предложение сразу в сети!", icon: "✅" }
    ],
    customerText: "Сканируйте, чтобы увидеть предложения и платите в магазине."
  }
};

const Instructions = () => {
  const [lang, setLang] = useState('fr');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-earth p-4 pb-20">
      <div className="max-w-md mx-auto pt-4">
        
        <Button variant="ghost" className="text-white mb-4 hover:bg-white/10" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Retour
        </Button>

        {/* Sélecteur de langue */}
        <div className="flex justify-center gap-2 mb-8 bg-black/20 p-2 rounded-full">
          {['fr', 'en', 'th', 'ru'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 py-2 rounded-full uppercase font-bold text-xs transition-all ${
                lang === l ? 'bg-citrus text-white shadow-lg' : 'text-white/60 hover:text-white'
              }`}
            >
              {l === 'th' ? 'ไทย' : l === 'ru' ? 'РУ' : l}
            </button>
          ))}
        </div>

        {/* SECTION COMMERÇANT */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Store className="text-citrus w-6 h-6" />
            <h2 className="text-2xl font-black text-white uppercase italic">{content[lang].merchantTitle}</h2>
          </div>
          
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2 text-citrus animate-pulse">
              <QrCode className="w-4 h-4" />
              <span className="text-sm font-black uppercase tracking-wider">
                {content[lang].scanAction}
              </span>
            </div>
            <p className="text-white/80 text-xs font-medium bg-black/10 p-3 rounded-xl border border-white/5">
              {content[lang].merchantDesc}
            </p>
          </div>
          
          <Card className="border-none bg-citrus/90 shadow-inner p-2 mb-8 shadow-2xl">
            <img 
              src="/images/scan merchant.png" 
              alt="Scan QR Commerçant" 
              className="w-full rounded-lg shadow-lg border-2 border-white/10"
            />
          </Card>

          <div className="space-y-4">
            {content[lang].steps.map((step, index) => (
              <Card key={index} className="border-none bg-white/95 shadow-lg overflow-hidden">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="bg-citrus text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner font-bold text-xl">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-earth uppercase text-sm">{index + 1}. {step.t}</h3>
                    <p className="text-earth/70 text-xs leading-tight mt-1">{step.d}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* SECTION CONSOMMATEUR */}
        <div className="mt-12 pt-8 border-t-2 border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-stem w-6 h-6" />
            <h2 className="text-2xl font-black text-white uppercase italic">{content[lang].customerTitle}</h2>
          </div>

          <div className="bg-stem/10 border border-stem/30 rounded-2xl p-4 mb-6 flex gap-3 shadow-lg">
            <Megaphone className="text-stem shrink-0 w-5 h-5" />
            <p className="text-white/90 text-[11px] leading-relaxed font-bold italic">
              {content[lang].promoAdvice}
            </p>
          </div>
          
          <Card className="border-none bg-citrus/90 shadow-2xl overflow-hidden p-2 mb-12">
            <div className="bg-earth p-4 rounded-lg text-center">
              <p className="text-white font-bold text-sm mb-4 leading-tight">
                {content[lang].customerText}
              </p>
              <img 
                src="/images/FreshRescueOFFERS.jpeg" 
                alt="Scan Customer Offers" 
                className="w-full rounded-lg shadow-inner border-2 border-citrus/20"
              />
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Instructions;