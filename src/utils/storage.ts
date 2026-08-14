import { AdminSettings, MobileMoneyOperator, Project, UserAccount } from "../types";
import { createDefaultProject } from "./projectGenerators";

const STORAGE_KEY_USER = "afribuilder_user";
const STORAGE_KEY_USERS_DB = "afribuilder_users_db";
const STORAGE_KEY_PROJECTS = "afribuilder_projects";
const STORAGE_KEY_ACTIVE_PROJECT_ID = "afribuilder_active_project_id";
const STORAGE_KEY_ADMIN_SETTINGS = "afribuilder_admin_settings";

export const DEFAULT_MERCHANT_CODES: MobileMoneyOperator[] = [
  {
    id: "orange_money",
    name: "Orange Money",
    icon: "🟠",
    color: "#FF6600",
    merchantCode: "OM-88421",
    ussdTemplate: "#144*37*88421*MONTANT#",
    description: "Côte d'Ivoire, Sénégal, Mali, Cameroun, Guinée, BF",
    active: true
  },
  {
    id: "wave",
    name: "Wave Mobile Money",
    icon: "🌊",
    color: "#1DC3E8",
    merchantCode: "WAVE-77409",
    ussdTemplate: "Scanner QR Code Wave ou envoyer au +225 0700000000",
    description: "Sénégal, Côte d'Ivoire, Mali, Burkina Faso (0% frais)",
    active: true
  },
  {
    id: "mtn_momo",
    name: "MTN MoMo",
    icon: "🟡",
    color: "#FFCC00",
    merchantCode: "MOMO-91024",
    ussdTemplate: "*133# ou *126# code marchand 91024",
    description: "Bénin, Cameroun, Côte d'Ivoire, Ghana, Congo",
    active: true
  },
  {
    id: "moov_money",
    name: "Moov Money",
    icon: "🔵",
    color: "#006699",
    merchantCode: "MOOV-55120",
    ussdTemplate: "*155*4*1*55120*MONTANT#",
    description: "Côte d'Ivoire, Bénin, Togo, Gabon, Niger",
    active: true
  },
  {
    id: "free_djamo",
    name: "Free Money / Djamo",
    icon: "🟢",
    color: "#10B981",
    merchantCode: "DJAMO-11983",
    ussdTemplate: "*150# ou virement instantané Djamo",
    description: "Sénégal, Côte d'Ivoire, UEMOA",
    active: true
  }
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  promoModeFree: true, // Keep app free for promotional phase as requested!
  rateFcfaPerMinute: 5, // 1 credit for 1 minute = 5 FCFA (modifiable by admin)
  merchantCodes: DEFAULT_MERCHANT_CODES,
  adminPin: "0000",
  totalWorkMinutesLogged: 42,
  totalRevenueFcfa: 210
};

export const INITIAL_DEMO_USER: UserAccount = {
  id: "usr_demo_1",
  nom: "Traoré",
  prenom: "Moussa",
  phoneMobileMoney: "+225 07 48 92 10 33",
  pinCode: "1234",
  credits: 50,
  createdAt: new Date().toISOString(),
  isAdmin: true
};

export function loadStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    if (!raw) {
      const initial = [INITIAL_DEMO_USER];
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [INITIAL_DEMO_USER];
  }
}

export function saveUsersDb(users: UserAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users DB", e);
  }
}

export function getCurrentUser(): UserAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(INITIAL_DEMO_USER));
      return INITIAL_DEMO_USER;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_USER;
  }
}

export function setCurrentUser(user: UserAccount) {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    // Also sync in DB
    const users = loadStoredUsers();
    const idx = users.findIndex(u => u.phoneMobileMoney.replace(/\s+/g, "") === user.phoneMobileMoney.replace(/\s+/g, ""));
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    saveUsersDb(users);
  } catch (e) {
    console.error("Failed to set current user", e);
  }
}

export function recoverPinByPhone(phone: string): { success: boolean; pin?: string; user?: UserAccount; message: string } {
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const users = loadStoredUsers();
  const match = users.find(u => u.phoneMobileMoney.replace(/[^0-9+]/g, "") === cleanPhone);

  if (match) {
    return {
      success: true,
      pin: match.pinCode,
      user: match,
      message: `Compte retrouvé avec succès pour ${match.prenom} ${match.nom}. Votre code PIN secret est : ${match.pinCode}`
    };
  }

  return {
    success: false,
    message: "Aucun compte n'a été trouvé avec ce numéro Mobile Money. Veuillez vérifier le numéro ou créer un nouveau compte."
  };
}

export function getAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ADMIN_SETTINGS, JSON.stringify(DEFAULT_ADMIN_SETTINGS));
      return DEFAULT_ADMIN_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

export function saveAdminSettings(settings: AdminSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save admin settings", e);
  }
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      const defaultProj = createDefaultProject(
        "Boutique Ivoire Express",
        "Application de commerce électronique et livraison rapide avec paiement Wave et Orange Money à Abidjan",
        "ecommerce",
        "both"
      );
      const initial = [defaultProj];
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(initial));
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT_ID, defaultProj.id);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [createDefaultProject("Mon Application", "Description", "custom", "both")];
  }
}

export function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save projects", e);
  }
}

export function getActiveProjectId(): string | null {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT_ID);
}

export function setActiveProjectId(id: string) {
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT_ID, id);
}
