import React from "react";
import { AdminSettings, Project, UserAccount } from "../types";
import { Sparkles, Shield, Cpu, Search, Plus, User, Settings, FolderOpen, Coins, Share2 } from "lucide-react";

interface NavbarProps {
  currentUser: UserAccount;
  projects: Project[];
  activeProject: Project | null;
  adminSettings: AdminSettings;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenPayment: () => void;
  onOpenShare?: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  projects,
  activeProject,
  adminSettings,
  onSelectProject,
  onNewProject,
  onOpenAuth,
  onOpenAdmin,
  onOpenPayment,
  onOpenShare,
  onOpenSettings,
}) => {
  return (
    <header id="app-header" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Promo banner */}
      {adminSettings.promoModeFree && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold py-1 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
          <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Offre Spéciale</span>
          <span>🎉 Mode Promotion Gratuit Activé : Génération d'applications, APK, AAB et hébergement 100% offerts !</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-900/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                AfriBuilder <span className="text-blue-400 font-black">AI</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Studio No-Code
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              3 IA Synchronisées : Dév • Recherche • Sécurité
            </p>
          </div>
        </div>

        {/* 3 Coordinated AI Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-xs">
          <div className="flex items-center gap-1 text-blue-400 font-medium">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>IA Dév</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-amber-400 font-medium">
            <Search className="w-3.5 h-3.5" />
            <span>IA Recherche</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>IA Contrôle</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded-full">
            Synchronisées
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Projects Selector Dropdown */}
          <div className="relative flex items-center">
            <FolderOpen className="w-4 h-4 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={activeProject?.id || ""}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-8 pr-7 py-2 font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none max-w-[140px] sm:max-w-[200px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* New Project Button */}
          <button
            id="btn-new-project"
            onClick={onNewProject}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Projet</span>
          </button>

          {/* Direct Share Button if active project */}
          {activeProject && onOpenShare && (
            <button
              id="btn-navbar-share"
              onClick={onOpenShare}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-xs active:scale-95"
              title="Partager l'application (WhatsApp, Instagram, Mail, Lien...)"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Partager</span>
            </button>
          )}

          {/* Project Settings & GitHub PAT Button */}
          {activeProject && onOpenSettings && (
            <button
              id="btn-navbar-project-settings"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-2.5 py-2 rounded-xl transition shadow-xs active:scale-95"
              title="Paramètres du Projet & Exportation GitHub (PAT)"
            >
              <Settings className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">Paramètres & GitHub</span>
            </button>
          )}

          {/* Credits / Pricing Pill */}
          <button
            id="btn-credits-pill"
            onClick={onOpenPayment}
            className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold px-2.5 py-2 rounded-xl transition"
            title="Tarification et Mobile Money"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{adminSettings.promoModeFree ? "Gratuit (Promo)" : `${currentUser.credits} min (${currentUser.credits * adminSettings.rateFcfaPerMinute} F)`}</span>
          </button>

          {/* Admin Switch */}
          <button
            id="btn-open-admin"
            onClick={onOpenAdmin}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
            title="Administration & Tarifs Mobile Money"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Button */}
          <button
            id="btn-user-profile"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-2.5 py-2 rounded-xl transition"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline max-w-[100px] truncate">{currentUser.prenom}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
