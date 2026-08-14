import { Project, ProjectFile } from "../types";

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  total_private_repos?: number;
  scopes?: string[];
}

export interface GitHubExportResult {
  success: boolean;
  repoUrl: string;
  cloneUrl: string;
  repoName: string;
  owner: string;
  pushedFilesCount: number;
  commitMessage: string;
  timestamp: string;
}

/**
 * Validates a GitHub Personal Access Token (PAT) by fetching the user profile
 */
export async function validateGitHubToken(token: string): Promise<GitHubUser> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error("Veuillez saisir un jeton d'accès personnel GitHub (PAT).");
  }

  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (res.status === 401) {
    throw new Error("Jeton GitHub invalide ou expiré (401 Unauthorized). Vérifiez votre token PAT.");
  }

  if (res.status === 403) {
    const rateLimitRemaining = res.headers.get("x-ratelimit-remaining");
    if (rateLimitRemaining === "0") {
      throw new Error("Limite de requêtes GitHub atteinte pour cette adresse IP/compte. Réessayez plus tard.");
    }
    throw new Error("Accès refusé par GitHub (403 Forbidden). Assurez-vous d'avoir coché la permission 'repo'.");
  }

  if (!res.ok) {
    throw new Error(`Erreur GitHub (${res.status}): ${res.statusText}`);
  }

  const scopesHeader = res.headers.get("x-oauth-scopes") || "";
  const scopes = scopesHeader.split(",").map((s) => s.trim()).filter(Boolean);

  const data = await res.json();
  return {
    login: data.login,
    name: data.name || data.login,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    public_repos: data.public_repos,
    total_private_repos: data.total_private_repos,
    scopes,
  };
}

/**
 * Converts text string to Base64 safely handling Unicode/UTF-8
 */
function utf8ToBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    // Fallback for browsers
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

/**
 * Creates or retrieves repository, and pushes all files using the GitHub API
 */
export async function exportProjectToGitHub(options: {
  token: string;
  project: Project;
  repoName: string;
  description?: string;
  isPrivate?: boolean;
  branch?: string;
  commitMessage?: string;
  onProgress?: (step: string, percentage: number) => void;
}): Promise<GitHubExportResult> {
  const {
    token,
    project,
    repoName,
    description = `Application ${project.title} générée par AfriBuilder AI Studio`,
    isPrivate = false,
    branch = "main",
    commitMessage = `🚀 Export initial du projet ${project.title} depuis AfriBuilder AI Studio`,
    onProgress,
  } = options;

  const cleanToken = token.trim();
  const cleanRepoName = repoName.trim().replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();

  if (!cleanRepoName) {
    throw new Error("Nom de dépôt GitHub invalide.");
  }

  // 1. Authenticate user
  onProgress?.("Vérification des identifiants GitHub & droits d'accès...", 10);
  const user = await validateGitHubToken(cleanToken);

  // 2. Check or create repository
  onProgress?.(`Vérification de l'existence du dépôt ${user.login}/${cleanRepoName}...`, 25);
  let repoExists = false;
  let defaultBranch = branch;

  const checkRepoRes = await fetch(`https://api.github.com/repos/${user.login}/${cleanRepoName}`, {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (checkRepoRes.ok) {
    repoExists = true;
    const repoData = await checkRepoRes.json();
    defaultBranch = repoData.default_branch || branch;
  } else if (checkRepoRes.status === 404) {
    // Create new repo
    onProgress?.(`Création du nouveau dépôt GitHub ${user.login}/${cleanRepoName}...`, 35);
    const createRes = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: cleanRepoName,
        description: description || project.description,
        private: Boolean(isPrivate),
        auto_init: true, // creates initial commit with README so default branch exists
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}));
      throw new Error(
        `Impossible de créer le dépôt GitHub: ${errData.message || createRes.statusText}. Vérifiez vos droits PAT ('repo').`
      );
    }
    repoExists = true;
  } else {
    throw new Error(`Erreur lors de la consultation du dépôt: HTTP ${checkRepoRes.status}`);
  }

  // Wait 1.2s for GitHub's async git repo initialization if newly created
  await new Promise((r) => setTimeout(r, 1200));

  // 3. Assemble files bundle
  onProgress?.("Préparation de l'arborescence des fichiers du projet...", 50);

  const filesToPush: { path: string; content: string }[] = [];

  // Project source files
  if (project.files && project.files.length > 0) {
    project.files.forEach((f) => {
      filesToPush.push({
        path: f.path.startsWith("/") ? f.path.slice(1) : f.path,
        content: f.content,
      });
    });
  }

  // Ensure interactiveAppHtml is present as standalone preview
  if (project.interactiveAppHtml) {
    filesToPush.push({
      path: "dist/index.html",
      content: project.interactiveAppHtml,
    });
  }

  // Comprehensive README.md
  const readmeContent = `# ${project.title}

${project.description}

> ⚡ **Généré par AfriBuilder AI Studio** — Plateforme No-Code & IA Mobile & Web pour l'Afrique.

---

## 📱 Spécifications du Projet

- **Catégorie :** \`${project.category}\`
- **Cible :** \`${project.targetType}\`
- **Package Android :** \`${project.apkBundleConfig?.packageName || "com.afribuilder.app"}\`
- **Version Android :** \`${project.apkBundleConfig?.versionName || "1.0.0"}\` (Code: ${project.apkBundleConfig?.versionCode || 1})
- **Empreinte SHA-256 :** \`${project.apkBundleConfig?.sha256 || "N/A"}\`
- **Lien Web Déployé :** [${project.webDeployment?.liveUrl || "https://afribuilder.app"}](${project.webDeployment?.liveUrl || "https://afribuilder.app"})

---

## 🚀 Démarrage Rapide

\`\`\`bash
# 1. Cloner le projet
git clone https://github.com/${user.login}/${cleanRepoName}.git
cd ${cleanRepoName}

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur local de développement
npm run dev
\`\`\`

---

## 📄 Documentation & Architecture
${project.documentation || "Documentation technique intégrée."}

---
*Exporté le ${new Date().toLocaleString("fr-FR")} depuis AfriBuilder AI Studio.*
`;

  filesToPush.push({ path: "README.md", content: readmeContent });

  // Add package.json if missing
  const hasPackageJson = filesToPush.some((f) => f.path === "package.json");
  if (!hasPackageJson) {
    filesToPush.push({
      path: "package.json",
      content: JSON.stringify(
        {
          name: cleanRepoName,
          private: true,
          version: project.apkBundleConfig?.versionName || "1.0.0",
          type: "module",
          description: project.description,
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
          },
          dependencies: {
            lucide: "^0.450.0",
            react: "^18.3.1",
            "react-dom": "^18.3.1",
          },
          devDependencies: {
            "@types/react": "^18.3.1",
            "@types/react-dom": "^18.3.1",
            "@vitejs/plugin-react": "^4.3.4",
            typescript: "^5.6.3",
            vite: "^6.0.1",
          },
        },
        null,
        2
      ),
    });
  }

  // Add .gitignore
  const hasGitignore = filesToPush.some((f) => f.path === ".gitignore");
  if (!hasGitignore) {
    filesToPush.push({
      path: ".gitignore",
      content: `node_modules
dist
.env
.env.local
*.log
.DS_Store
`,
    });
  }

  // 4. Push each file via Contents API
  const totalFiles = filesToPush.length;
  let pushedCount = 0;

  for (let i = 0; i < totalFiles; i++) {
    const file = filesToPush[i];
    const pct = Math.round(55 + (i / totalFiles) * 40);
    onProgress?.(`Envoi du fichier (${i + 1}/${totalFiles}) : ${file.path}...`, pct);

    try {
      // Get existing file SHA if any
      let existingSha: string | undefined = undefined;
      const getFileRes = await fetch(
        `https://api.github.com/repos/${user.login}/${cleanRepoName}/contents/${encodeURIComponent(file.path)}?ref=${defaultBranch}`,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        existingSha = fileData.sha;
      }

      // Put file content
      const putRes = await fetch(
        `https://api.github.com/repos/${user.login}/${cleanRepoName}/contents/${encodeURIComponent(file.path)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: existingSha ? `Update ${file.path} from AfriBuilder Studio` : commitMessage,
            content: utf8ToBase64(file.content),
            branch: defaultBranch,
            ...(existingSha ? { sha: existingSha } : {}),
          }),
        }
      );

      if (putRes.ok) {
        pushedCount++;
      } else {
        console.warn(`Could not push file ${file.path}: ${putRes.statusText}`);
      }
    } catch (err) {
      console.warn(`Error uploading ${file.path}:`, err);
    }
  }

  onProgress?.("Exportation GitHub finalisée avec succès !", 100);

  return {
    success: true,
    repoUrl: `https://github.com/${user.login}/${cleanRepoName}`,
    cloneUrl: `https://github.com/${user.login}/${cleanRepoName}.git`,
    repoName: cleanRepoName,
    owner: user.login,
    pushedFilesCount: pushedCount,
    commitMessage,
    timestamp: new Date().toISOString(),
  };
}
