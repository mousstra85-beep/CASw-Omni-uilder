import React, { useState, useEffect } from "react";
import { Project } from "../types";
import {
  Share2,
  Copy,
  Check,
  QrCode,
  Mail,
  Send,
  X,
  ExternalLink,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Smartphone,
  Download,
  Sparkles,
  Phone,
  Layers,
  Globe,
  Share,
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [customPhone, setCustomPhone] = useState("");
  const [customMessage, setCustomMessage] = useState(
    `🚀 Découvrez l'application "${project.title}" créée avec l'IA AfriBuilder Studio !\n👉 Testez-la en direct ici :`
  );
  const [activeShareTab, setActiveShareTab] = useState<"instant" | "social" | "direct_number" | "qrcode">("instant");
  const [isWebShareSupported, setIsWebShareSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setIsWebShareSupported(true);
    }
  }, []);

  if (!isOpen) return null;

  const previewUrl = project.webDeployment?.liveUrl || `https://${project.id}.afribuilder.app`;
  const fullShareText = `${customMessage}\n${previewUrl}`;
  const instagramCaption = `✨ Nouvelle application créée sans coder : ${project.title} !\n\n${project.description}\n\n📲 Testez l'application en cliquant sur le lien dans ma bio ou ici : ${previewUrl}\n\n#AfriBuilder #NoCode #TechAfrique #Innovation #${project.category} #MobileApp`;

  const handleCopy = (textToCopy: string, key: string, customFeedback?: string) => {
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopiedKey(key);
      setShareFeedback(customFeedback || "Lien et message copiés dans le presse-papiers !");
      setTimeout(() => {
        setCopiedKey(null);
        setShareFeedback(null);
      }, 2500);
    } catch {
      setShareFeedback("Échec de copie automatique, veuillez copier le lien manuellement.");
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  /**
   * Generic Native Web Share API helper with automatic fallback to clipboard copy
   */
  const handleNativeShare = async (options?: {
    title?: string;
    text?: string;
    url?: string;
    fallbackKey?: string;
    targetName?: string;
  }) => {
    const title = options?.title || `Application ${project.title}`;
    const text = options?.text || customMessage;
    const url = options?.url || previewUrl;
    const fallbackKey = options?.fallbackKey || "native_share";
    const targetName = options?.targetName || "l'application";

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        setShareFeedback(`Partage réussi de ${targetName} !`);
        setTimeout(() => setShareFeedback(null), 2500);
        return;
      } catch (err: any) {
        // AbortError is triggered when user cancels native dialog - do not treat as error
        if (err?.name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: Copy link/text to clipboard with immediate visual notification
    handleCopy(`${text}\n${url}`, fallbackKey, `Lien copié ! Vous pouvez maintenant le coller dans ${targetName}.`);
  };

  // WhatsApp Native & Direct Share
  const handleWhatsAppNativeShare = () => {
    if (isWebShareSupported) {
      handleNativeShare({
        title: `Découvrez "${project.title}"`,
        text: `🚀 Découvrez "${project.title}" créée avec AfriBuilder Studio :`,
        url: previewUrl,
        fallbackKey: "whatsapp_native",
        targetName: "WhatsApp",
      });
    } else {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`;
      window.open(url, "_blank");
    }
  };

  const handleWhatsAppDirectWeb = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`;
    window.open(url, "_blank");
  };

  // WhatsApp to specific number
  const handleWhatsAppDirectNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = customPhone.replace(/[^0-9]/g, "");
    if (!cleanNumber) return;
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(fullShareText)}`;
    window.open(url, "_blank");
  };

  // Instagram Native & Direct Share
  const handleInstagramNativeShare = () => {
    if (isWebShareSupported) {
      handleNativeShare({
        title: project.title,
        text: instagramCaption,
        url: previewUrl,
        fallbackKey: "instagram_native",
        targetName: "Instagram",
      });
    } else {
      handleCopy(instagramCaption, "instagram_caption", "Légende copiée ! Ouverture d'Instagram...");
      window.open("https://www.instagram.com", "_blank");
    }
  };

  const handleInstagramDirectWeb = () => {
    handleCopy(instagramCaption, "instagram_caption", "Légende et hashtags copiés ! Collez-les dans votre Story ou Bio Instagram.");
    window.open("https://www.instagram.com", "_blank");
  };

  // Email Native & Direct Share
  const handleEmailNativeShare = () => {
    if (isWebShareSupported) {
      handleNativeShare({
        title: `Découvrez l'application ${project.title}`,
        text: `Bonjour,\n\nJe vous invite à découvrir notre application "${project.title}" :\n`,
        url: previewUrl,
        fallbackKey: "email_native",
        targetName: "votre client E-mail",
      });
    } else {
      handleEmailDirect();
    }
  };

  const handleEmailDirect = () => {
    const subject = encodeURIComponent(`Découvrez l'application ${project.title}`);
    const body = encodeURIComponent(`${fullShareText}\n\nApplication responsive mobile & web propulsée par AfriBuilder Studio.`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  // Telegram share
  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(previewUrl)}&text=${encodeURIComponent(customMessage)}`;
    window.open(url, "_blank");
  };

  // Facebook share
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(previewUrl)}`;
    window.open(url, "_blank");
  };

  // X / Twitter share
  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(customMessage)}&url=${encodeURIComponent(previewUrl)}`;
    window.open(url, "_blank");
  };

  // LinkedIn share
  const handleLinkedinShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(previewUrl)}`;
    window.open(url, "_blank");
  };

  // SMS direct
  const handleSmsShare = () => {
    const url = `sms:?body=${encodeURIComponent(fullShareText)}`;
    window.open(url, "_blank");
  };

  // Download QR Code image
  const handleDownloadQrCode = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(previewUrl)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `QRCode_${project.title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(previewUrl)}`, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Partage & Transfert de l'Application</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Web Share API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transférez votre application sur WhatsApp, Instagram, Email, Réseaux sociaux ou Lien direct
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {shareFeedback && (
          <div className="bg-emerald-600/20 border-b border-emerald-500/30 px-6 py-2 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in slide-in-from-top-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <Check className="w-4 h-4 text-emerald-400" />
              {shareFeedback}
            </span>
            <button onClick={() => setShareFeedback(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: "instant", label: "📱 Partage Rapide & Natif", icon: Share2 },
            { id: "social", label: "🌐 Réseaux & Médias", icon: Globe },
            { id: "direct_number", label: "💬 Envoi Direct Client (Numéro)", icon: Phone },
            { id: "qrcode", label: "🔲 QR Code & Affiche", icon: QrCode },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveShareTab(tab.id as any)}
              className={`whitespace-nowrap pb-2.5 px-3 border-b-2 transition ${
                activeShareTab === tab.id
                  ? "border-emerald-500 text-emerald-400 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {/* Main Direct URL Link Card (Present on all views with copy fallback) */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Lien Direct de l'Application :
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                Actif 24/7
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={previewUrl}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-emerald-400 outline-none select-all"
              />
              <button
                type="button"
                id="btn-sharemodal-copy-direct"
                onClick={() => handleCopy(previewUrl, "link_direct", "Lien direct copié dans le presse-papiers !")}
                className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition flex items-center gap-1.5 shrink-0 active:scale-95"
              >
                {copiedKey === "link_direct" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center shrink-0"
                title="Ouvrir le lien"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* TAB 1: INSTANT SHARING (WhatsApp, Instagram, Mail, SMS, Native Web Share) */}
          {activeShareTab === "instant" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Message d'accompagnement :</label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              {/* Native Mobile Web Share API Master Button */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-blue-600/20 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Partage Natif Téléphone & Ordinateur</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-mono">
                        navigator.share
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Ouvre le menu natif de votre appareil (WhatsApp, Instagram, AirDrop, Messages, etc.)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="btn-webshare-master"
                    onClick={() => handleNativeShare({ targetName: "vos applications" })}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Partager Maintenant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(fullShareText, "master_copy", "Texte et lien copiés !")}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 shrink-0"
                    title="Copier le message et le lien"
                  >
                    {copiedKey === "master_copy" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dedicated App Share Cards Grid with Native & Fallback Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp Card */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <MessageCircle className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">WhatsApp</h4>
                        <p className="text-[11px] text-slate-400">Discussion, statut ou groupe</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(fullShareText, "wa_card_copy", "Lien WhatsApp copié !")}
                      className="text-slate-400 hover:text-emerald-300 p-1.5 rounded-lg hover:bg-emerald-500/20 transition"
                      title="Copier le lien pour WhatsApp"
                    >
                      {copiedKey === "wa_card_copy" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-whatsapp-native"
                      onClick={handleWhatsAppNativeShare}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isWebShareSupported ? "Partage Natif" : "Ouvrir WhatsApp"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsAppDirectWeb}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
                      title="Ouvrir WhatsApp Web"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Instagram Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/30 via-purple-950/30 to-orange-950/20 border border-pink-500/30 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Instagram</h4>
                        <p className="text-[11px] text-slate-400">Story, Bio, Reel ou DM</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(instagramCaption, "insta_card_copy", "Légende Instagram copiée !")}
                      className="text-slate-400 hover:text-pink-300 p-1.5 rounded-lg hover:bg-pink-500/20 transition"
                      title="Copier la légende"
                    >
                      {copiedKey === "insta_card_copy" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-instagram-native"
                      onClick={handleInstagramNativeShare}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-orange-600 hover:opacity-95 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>{isWebShareSupported ? "Partage Natif" : "Copier & Instagram"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInstagramDirectWeb}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
                      title="Copier légende et ouvrir Instagram"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Email Card */}
                <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">E-mail</h4>
                        <p className="text-[11px] text-slate-400">Courriel pro pré-rempli</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(fullShareText, "email_card_copy", "Lien copié pour email !")}
                      className="text-slate-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-500/20 transition"
                      title="Copier le texte"
                    >
                      {copiedKey === "email_card_copy" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-email-native"
                      onClick={handleEmailNativeShare}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isWebShareSupported ? "Partage Natif" : "Ouvrir Messagerie"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleEmailDirect}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition"
                      title="Lancer le client mail par défaut"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SMS Card */}
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">SMS Téléphone</h4>
                        <p className="text-[11px] text-slate-400">Message texte direct mobile</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(fullShareText, "sms_card_copy", "Lien copié pour SMS !")}
                      className="text-slate-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-500/20 transition"
                      title="Copier le message SMS"
                    >
                      {copiedKey === "sms_card_copy" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSmsShare}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer SMS</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL & OTHER NETWORKS */}
          {activeShareTab === "social" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Publiez votre application sur les principaux réseaux sociaux et plateformes professionnelles :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Facebook */}
                <button
                  type="button"
                  onClick={handleFacebookShare}
                  className="p-3.5 rounded-2xl bg-blue-700/20 hover:bg-blue-700/30 border border-blue-600/40 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-md">
                      <Facebook className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Facebook & Messenger</h4>
                      <p className="text-[11px] text-slate-400">Partager sur votre fil d'actualité</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={handleTelegramShare}
                  className="p-3.5 rounded-2xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-md">
                      <Send className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Telegram</h4>
                      <p className="text-[11px] text-slate-400">Groupes, canaux ou messages privés</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-sky-400" />
                </button>

                {/* X / Twitter */}
                <button
                  type="button"
                  onClick={handleTwitterShare}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center border border-slate-700 shadow-md">
                      <Twitter className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">X (Twitter)</h4>
                      <p className="text-[11px] text-slate-400">Tweet avec lien interactif</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300" />
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={handleLinkedinShare}
                  className="p-3.5 rounded-2xl bg-blue-800/20 hover:bg-blue-800/30 border border-blue-700/40 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shadow-md">
                      <Linkedin className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">LinkedIn</h4>
                      <p className="text-[11px] text-slate-400">Présentation pro à votre réseau</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </button>
              </div>

              {/* Instagram Post Helper */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                    <Instagram className="w-4 h-4 text-pink-400" />
                    Légende optimisée pour Instagram & TikTok :
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(instagramCaption, "insta_box", "Légende copiée !")}
                    className="px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 text-[11px] font-bold transition flex items-center gap-1"
                  >
                    {copiedKey === "insta_box" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "insta_box" ? "Copié !" : "Copier la légende"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-mono whitespace-pre-line bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  {instagramCaption}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT CLIENT NUMBER (WhatsApp / SMS to specific Phone Number) */}
          {activeShareTab === "direct_number" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Envoyez directement l'application au numéro WhatsApp de votre client, partenaire ou collaborateur sans l'ajouter à vos contacts :
              </p>

              <form onSubmit={handleWhatsAppDirectNumber} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Numéro de téléphone avec indicatif pays (ex: +225 0700000000, +221 770000000, +33 600000000) :
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="Ex : +225 07 12 34 56 78"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Envoyer sur WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cleanNumber = customPhone.replace(/[^0-9]/g, "");
                      if (!cleanNumber) return;
                      window.open(`sms:${cleanNumber}?body=${encodeURIComponent(fullShareText)}`, "_blank");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>SMS Direct</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: QR CODE & FLYER PRINT */}
          {activeShareTab === "qrcode" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
                <div className="bg-white p-3 rounded-2xl shadow-xl shrink-0 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(previewUrl)}`}
                    alt="QR Code"
                    className="w-36 h-36"
                  />
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>QR Code Haute Définition</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Vos clients peuvent scanner ce code avec l'appareil photo de leur téléphone pour ouvrir l'application immédiatement.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={handleDownloadQrCode}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger Image PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(previewUrl, "qr_link", "Lien QR Code copié !")}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition flex items-center gap-1"
                    >
                      {copiedKey === "qr_link" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "qr_link" ? "Copié !" : "Copier le Lien"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Lien sécurisé SSL avec hébergement haute disponibilité & compatibilité Web Share
            </span>
            <button onClick={onClose} className="text-slate-400 hover:text-white font-semibold">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
