import React, { useState, useEffect } from "react";
import { AdminSettings, Project, UserAccount } from "./types";
import {
  getActiveProjectId,
  getAdminSettings,
  getCurrentUser,
  loadProjects,
  saveAdminSettings,
  saveProjects,
  setActiveProjectId,
  setCurrentUser,
} from "./utils/storage";
import { createDefaultProject } from "./utils/projectGenerators";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { AdminModal } from "./components/AdminModal";
import { ProjectCreateModal } from "./components/ProjectCreateModal";
import { PreviewModal } from "./components/PreviewModal";
import { ShareModal } from "./components/ShareModal";
import { PaymentModal } from "./components/PaymentModal";
import { ApkCheckpointModal } from "./components/ApkCheckpointModal";
import { ProjectWorkspace } from "./components/ProjectWorkspace";
import { ProjectSettingsModal } from "./components/ProjectSettingsModal";
import { Sparkles, Plus, Layers, ShieldCheck, Heart } from "lucide-react";

export default function App() {
  const [currentUser, setUser] = useState<UserAccount>(getCurrentUser());
  const [adminSettings, setSettings] = useState<AdminSettings>(getAdminSettings());
  const [projects, setProjectsList] = useState<Project[]>(loadProjects());
  const [activeId, setActiveIdState] = useState<string | null>(() => {
    const saved = getActiveProjectId();
    const list = loadProjects();
    return saved && list.some((p) => p.id === saved) ? saved : list[0]?.id || null;
  });

  // Modal open states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentActionName, setPaymentActionName] = useState<string>("Opération");
  const [onPaymentSuccessCallback, setOnPaymentSuccessCallback] = useState<(() => void) | undefined>(undefined);
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(false);

  // Active project reference
  const activeProject = projects.find((p) => p.id === activeId) || projects[0] || null;

  // Persist projects whenever changed
  const handleUpdateProject = (updated: Project) => {
    const updatedList = projects.map((p) => (p.id === updated.id ? updated : p));
    setProjectsList(updatedList);
    saveProjects(updatedList);
  };

  const handleSelectProject = (id: string) => {
    setActiveIdState(id);
    setActiveProjectId(id);
  };

  const handleCreateProject = (
    title: string,
    description: string,
    category: Project["category"],
    targetType: Project["targetType"]
  ) => {
    const newProj = createDefaultProject(title, description, category, targetType);
    const updatedList = [newProj, ...projects];
    setProjectsList(updatedList);
    saveProjects(updatedList);
    setActiveIdState(newProj.id);
    setActiveProjectId(newProj.id);
  };

  const handleOpenPaymentWithAction = (actionName: string, onSuccess: () => void) => {
    setPaymentActionName(actionName);
    setOnPaymentSuccessCallback(() => onSuccess);
    setIsPaymentOpen(true);
  };

  // Checkpoint decisions
  const handleContinueWorkflow = () => {
    if (activeProject) {
      const updated: Project = {
        ...activeProject,
        userDecisionAfterApk: "continue",
        currentStepId: "web_deployment",
        stepProgress: 85,
      };
      handleUpdateProject(updated);
    }
    setIsCheckpointOpen(false);
  };

  const handleStayAtApkLevel = () => {
    if (activeProject) {
      const updated: Project = {
        ...activeProject,
        userDecisionAfterApk: "stay_apk",
        currentStepId: "apk_generation",
      };
      handleUpdateProject(updated);
    }
    setIsCheckpointOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        projects={projects}
        activeProject={activeProject}
        adminSettings={adminSettings}
        onSelectProject={handleSelectProject}
        onNewProject={() => setIsCreateOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenPayment={() => {
          setPaymentActionName("Recharge Forfait Minutes");
          setOnPaymentSuccessCallback(undefined);
          setIsPaymentOpen(true);
        }}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Studio View */}
      <main className="flex-1">
        {activeProject ? (
          <ProjectWorkspace
            project={activeProject}
            currentUser={currentUser}
            adminSettings={adminSettings}
            onUpdateProject={handleUpdateProject}
            onOpenPreview={() => setIsPreviewOpen(true)}
            onOpenPayment={handleOpenPaymentWithAction}
            onOpenCheckpoint={() => setIsCheckpointOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : (
          <div className="max-w-md mx-auto my-20 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Aucun projet sélectionné</h2>
            <p className="text-xs text-slate-400">
              Créez votre première application sans aucune compétence grâce aux 3 IA coordonnées.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Projet</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-4 px-6 text-center text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">AfriBuilder AI Studio</span>
          <span>• Plateforme de création d'applications et sites web no-code</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span>Orange Money • Wave • MTN MoMo • Moov</span>
          <span>Sécurisé 100%</span>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(u) => setUser(u)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminSettings={adminSettings}
        onSettingsUpdated={(s) => setSettings(s)}
      />

      <ProjectCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {activeProject && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          project={activeProject}
        />
      )}

      {activeProject && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          project={activeProject}
        />
      )}

      {activeProject && (
        <ProjectSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          project={activeProject}
          onUpdateProject={handleUpdateProject}
        />
      )}

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        currentUser={currentUser}
        adminSettings={adminSettings}
        onUserUpdated={(u) => setUser(u)}
        requiredActionName={paymentActionName}
        onPaymentSuccess={onPaymentSuccessCallback}
      />

      {activeProject && (
        <ApkCheckpointModal
          isOpen={isCheckpointOpen}
          onClose={() => setIsCheckpointOpen(false)}
          project={activeProject}
          onContinueWorkflow={handleContinueWorkflow}
          onStayAtApkLevel={handleStayAtApkLevel}
          onDownloadApk={() => {
            handleOpenPaymentWithAction("Téléchargement Package APK/AAB", () => {
              setIsCheckpointOpen(false);
            });
          }}
        />
      )}
    </div>
  );
}
