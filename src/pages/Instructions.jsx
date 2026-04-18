import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Store, User, QrCode, Megaphone } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../lib/i18n'; // On utilise ton propre hook

const content = {
  fr: {
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
  it: {
    merchantTitle: "Area Commerciante",
    customerTitle: "Area Cliente",
    merchantDesc: "Segui questi passaggi per pubblicare un'offerta.",
    scanAction: "Scansiona il QR Code per iniziare",
    promoAdvice: "Non dimenticare di esporre questo poster nel tuo negozio! Parlane ai tuoi clienti affinché approfittino delle tue promozioni!",
    steps: [
      { t: "Accesso", d: "Inserisci la tua email e la password.", icon: "🔑" },
      { t: "Configurazione", d: "Nel pannello di controllo, vai su 'Impostazioni negozio'.", icon: "⚙️" },
      { t: "Creazione", d: "Clicca su 'Pubblica un'offerta'. Scatta una foto o caricala.", icon: "📸" },
      { t: "Validazione", d: "Compila i campi necessari e clicca su 'Pubblica'.", icon: "✅" }
    ],
    customerText: "Scansiona per vedere le offerte e paga direttamente in negozio."
  },
  de: {
    merchantTitle: "Händlerbereich",
    customerTitle: "Kundenbereich",
    merchantDesc: "Folgen Sie diesen Schritten, um ein Angebot zu veröffentlichen.",
    scanAction: "QR-Code scannen zum Starten",
    promoAdvice: "Hängen Sie dieses Plakat gut sichtbar in Ihrem Geschäft, z. B. an der Theke! Erzählen Sie Ihren Kunden von der App, damit sie Ihre Aktionen nutzen können!",
    steps: [
      { t: "Anmelden", d: "E-Mail und Passwort eingeben.", icon: "🔑" },
      { t: "Einrichtung", d: "Im Dashboard unter „Geschäftseinstellungen“ Ihre Daten eintragen.", icon: "⚙️" },
      { t: "Erstellen", d: "„Angebot veröffentlichen“ wählen, Foto aufnehmen oder hochladen.", icon: "📸" },
      { t: "Fertig", d: "Felder ausfüllen und „Veröffentlichen“ – Ihr Angebot ist online.", icon: "✅" }
    ],
    customerText: "Scannen Sie, um Angebote zu sehen und direkt im Geschäft zu bezahlen."
  },
  ru: {
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
  const navigate = useNavigate();
  const { lang } = useTranslation(); // Récupère la langue actuelle (en, fr, de, ru, it)

  // On s'assure que la langue existe dans notre objet content, sinon on met 'fr'
  const activeLang = content[lang] ? lang : 'fr';

  return (
    <div className="min-h-screen bg-earth p-4 pb-20">
      <div className="max-w-md mx-auto pt-4">
        
        <Button variant="ghost" className="text-white mb-4 hover:bg-white/10" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> 
          {activeLang === 'de' ? 'Zurück' : activeLang === 'ru' ? 'Назад' : activeLang === 'en' ? 'Back' : 'Retour'}
        </Button>

        {/* SECTION COMMERÇANT */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Store className="text-citrus w-6 h-6" />
            <h2 className="text-2xl font-black text-white uppercase italic">{content[activeLang].merchantTitle}</h2>
          </div>
          
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2 text-citrus animate-pulse">
              <QrCode className="w-4 h-4" />
              <span className="text-sm font-black uppercase tracking-wider">
                {content[activeLang].scanAction}
              </span>
            </div>
            <p className="text-white/80 text-xs font-medium bg-black/10 p-3 rounded-xl border border-white/5">
              {content[activeLang].merchantDesc}
            </p>
          </div>
          
          <Card className="border-none bg-citrus/90 shadow-inner p-2 mb-8 shadow-2xl">
            <img 
              src="/images/scan merchant.png" 
              alt="Scan QR" 
              className="w-full rounded-lg"
            />
          </Card>

          <div className="space-y-4">
            {content[activeLang].steps.map((step, index) => (
              <Card key={index} className="border-none bg-white/95 shadow-lg">
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

        {/* SECTION CLIENT */}
        <div className="mt-12 pt-8 border-t-2 border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-stem w-6 h-6" />
            <h2 className="text-2xl font-black text-white uppercase italic">{content[activeLang].customerTitle}</h2>
          </div>

          <div className="bg-stem/10 border border-stem/30 rounded-2xl p-4 mb-6 flex gap-3 shadow-lg">
            <Megaphone className="text-stem shrink-0 w-5 h-5" />
            <p className="text-white/90 text-[11px] leading-relaxed font-bold italic">
              {content[activeLang].promoAdvice}
            </p>
          </div>
          
          <Card className="border-none bg-citrus/90 shadow-2xl p-2 mb-12 overflow-hidden">
            <div className="bg-earth p-2 sm:p-4 rounded-lg text-center">
              <p className="text-white font-bold text-sm mb-3 leading-tight px-2">
                {content[activeLang].customerText}
              </p>
              <div className="w-full overflow-hidden rounded-lg border border-white/10 bg-[#0a1628] shadow-inner">
                <iframe
                  title={
                    activeLang === 'de'
                      ? 'Plakat Angebote FR / DE / IT'
                      : activeLang === 'it'
                        ? 'Poster offerte FR / DE / IT'
                        : 'Affiche offres FR / DE / IT'
                  }
                  src="/poster-offres.html"
                  className="h-[min(88vh,920px)] w-full min-h-[560px] border-0"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-[10px] text-white/60">
                {activeLang === 'de'
                  ? 'Zum Drucken: /poster-offres.html im Browser öffnen → Drucken.'
                  : activeLang === 'it'
                    ? 'Per stampare: apri /poster-offres.html nel browser → Stampa.'
                    : 'Pour imprimer : ouvrez /poster-offres.html dans le navigateur → Imprimer.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Instructions;