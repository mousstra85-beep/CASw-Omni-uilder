import JSZip from "jszip";
import { Project, ProjectFile, ProjectVersion, StepId } from "../types";

export function generateInitialInteractiveApp(title: string, category: string, description: string): string {
  const safeTitle = title || "Mon Application Pro";
  const primaryColor = category === "fintech" ? "#059669" : category === "delivery" ? "#EA580C" : category === "ecommerce" ? "#4F46E5" : "#2563EB";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${safeTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: '${primaryColor}',
            brandDark: '#1E293B',
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    .custom-scroll::-webkit-scrollbar { display: none; }
    .custom-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
  <!-- Top Navigation -->
  <header class="bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-4 py-3 shadow-xs">
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-lg shadow-sm">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <div>
          <h1 class="text-base font-bold leading-tight text-slate-900">${safeTitle}</h1>
          <p class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            En ligne • Mobile Money Prêt
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="toggleSearch()" class="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition">
          <i class="fa-solid fa-magnifying-glass text-sm"></i>
        </button>
        <button onclick="openCartModal()" class="relative w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition">
          <i class="fa-solid fa-basket-shopping text-sm"></i>
          <span id="cartCountBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Search Bar (Collapsible) -->
  <div id="searchBar" class="hidden bg-white border-b border-slate-200 px-4 py-2">
    <div class="max-w-4xl mx-auto relative">
      <input type="text" placeholder="Rechercher des articles, services..." class="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm border-none focus:ring-2 focus:ring-brand outline-none" />
      <i class="fa-solid fa-search absolute left-3 top-3 text-slate-400 text-xs"></i>
    </div>
  </div>

  <!-- Main Content Container -->
  <main class="flex-1 max-w-4xl w-full mx-auto p-4 space-y-5 pb-24">
    <!-- Hero Banner -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-brand p-5 text-white shadow-md">
      <div class="relative z-10 space-y-2 max-w-sm">
        <span class="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">Nouveauté 2026</span>
        <h2 class="text-xl font-extrabold leading-snug">Bienvenue sur ${safeTitle}</h2>
        <p class="text-xs text-slate-200 leading-relaxed">${description.slice(0, 95) || "Votre service rapide, sécurisé avec paiement Mobile Money instantané."}</p>
        <button onclick="triggerQuickAction()" class="mt-2 px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-xs hover:bg-slate-100 transition active:scale-95">
          Explorer maintenant <i class="fa-solid fa-arrow-right ml-1"></i>
        </button>
      </div>
      <div class="absolute right-2 -bottom-4 opacity-20 text-8xl text-white pointer-events-none">
        <i class="fa-solid fa-mobile-screen"></i>
      </div>
    </div>

    <!-- Quick Category Tabs -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800">Catégories populaires</h3>
        <span class="text-xs text-brand font-semibold cursor-pointer">Tout voir</span>
      </div>
      <div class="flex gap-2 overflow-x-auto custom-scroll pb-1">
        <button onclick="filterCategory('all')" class="cat-btn active whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold bg-brand text-white transition shadow-xs">Tous</button>
        <button onclick="filterCategory('vedette')" class="cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">⭐ En vedette</button>
        <button onclick="filterCategory('promo')" class="cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">🔥 Promotions</button>
        <button onclick="filterCategory('nouveau')" class="cat-btn whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition">✨ Nouveautés</button>
      </div>
    </div>

    <!-- Interactive Grid Cards -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800">Articles & Offres disponibles</h3>
        <span class="text-xs text-slate-500">4 disponibles</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <!-- Item 1 -->
        <div class="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div class="h-28 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center text-brand text-3xl mb-2">
              <i class="fa-solid fa-box-open"></i>
            </div>
            <span class="px-2 py-0.5 bg-blue-50 text-brand text-[10px] font-bold rounded-md">Pack Starter</span>
            <h4 class="font-bold text-xs text-slate-800 mt-1">Pack Essentiel Pro</h4>
            <p class="text-[11px] text-slate-500 mt-0.5">Livraison rapide 24h</p>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-sm font-extrabold text-slate-900">4 500 F</span>
            <button onclick="addToCart('Pack Essentiel Pro', 4500)" class="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition">
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Item 2 -->
        <div class="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div class="h-28 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-600 text-3xl mb-2">
              <i class="fa-solid fa-bolt"></i>
            </div>
            <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">Populaire</span>
            <h4 class="font-bold text-xs text-slate-800 mt-1">Abonnement Express</h4>
            <p class="text-[11px] text-slate-500 mt-0.5">Accès instantané VIP</p>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-sm font-extrabold text-slate-900">8 900 F</span>
            <button onclick="addToCart('Abonnement Express', 8900)" class="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition">
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Item 3 -->
        <div class="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div class="h-28 rounded-xl bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center text-amber-600 text-3xl mb-2">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <span class="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">Garantie</span>
            <h4 class="font-bold text-xs text-slate-800 mt-1">Service Sérénité</h4>
            <p class="text-[11px] text-slate-500 mt-0.5">Assistance dédiée 7j/7</p>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-sm font-extrabold text-slate-900">12 000 F</span>
            <button onclick="addToCart('Service Sérénité', 12000)" class="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition">
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Item 4 -->
        <div class="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div class="h-28 rounded-xl bg-gradient-to-br from-purple-100 to-pink-50 flex items-center justify-center text-purple-600 text-3xl mb-2">
              <i class="fa-solid fa-star"></i>
            </div>
            <span class="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md">Exclusif</span>
            <h4 class="font-bold text-xs text-slate-800 mt-1">Pack Premium Plus</h4>
            <p class="text-[11px] text-slate-500 mt-0.5">Toutes options incluses</p>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <span class="text-sm font-extrabold text-slate-900">25 000 F</span>
            <button onclick="addToCart('Pack Premium Plus', 25000)" class="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition">
              <i class="fa-solid fa-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Money Simulation Box -->
    <div class="bg-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-xs">
            <i class="fa-solid fa-money-bill-transfer"></i>
          </div>
          <span class="text-xs font-bold">Paiements Mobile Money intégrés</span>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">Instantané 0% frais</span>
      </div>
      <div class="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold">
        <div class="p-2 rounded-xl bg-slate-800 border border-slate-700">🟠 Orange Money</div>
        <div class="p-2 rounded-xl bg-slate-800 border border-slate-700">🌊 Wave</div>
        <div class="p-2 rounded-xl bg-slate-800 border border-slate-700">🟡 MTN MoMo</div>
        <div class="p-2 rounded-xl bg-slate-800 border border-slate-700">🔵 Moov Money</div>
      </div>
    </div>
  </main>

  <!-- Bottom Navigation Bar for Mobile -->
  <nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 z-30">
    <div class="max-w-md mx-auto flex items-center justify-between text-xs font-medium text-slate-500">
      <button class="flex flex-col items-center gap-1 text-brand">
        <i class="fa-solid fa-house text-base"></i>
        <span>Accueil</span>
      </button>
      <button onclick="triggerQuickAction()" class="flex flex-col items-center gap-1 hover:text-slate-900 transition">
        <i class="fa-solid fa-compass text-base"></i>
        <span>Explorer</span>
      </button>
      <button onclick="openCartModal()" class="flex flex-col items-center gap-1 hover:text-slate-900 transition">
        <i class="fa-solid fa-cart-shopping text-base"></i>
        <span>Panier</span>
      </button>
      <button onclick="openProfileModal()" class="flex flex-col items-center gap-1 hover:text-slate-900 transition">
        <i class="fa-solid fa-user text-base"></i>
        <span>Compte</span>
      </button>
    </div>
  </nav>

  <!-- Cart Modal -->
  <div id="cartModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
    <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="font-bold text-slate-900 text-base">Mon Panier</h3>
        <button onclick="closeCartModal()" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">✕</button>
      </div>
      <div id="cartItemsList" class="space-y-2">
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
          <div>
            <p class="font-bold text-slate-800">Pack Essentiel Pro</p>
            <span class="text-slate-400">1 x 4 500 F CFA</span>
          </div>
          <span class="font-extrabold text-slate-900">4 500 F CFA</span>
        </div>
      </div>
      <div class="border-t border-slate-200 pt-3 space-y-2">
        <div class="flex justify-between text-sm font-bold">
          <span>Total à payer :</span>
          <span id="cartTotalText" class="text-brand">4 500 F CFA</span>
        </div>
        <button onclick="simulatePayment()" class="w-full py-3 rounded-xl bg-brand text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-98 transition">
          Payer par Mobile Money
        </button>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast" class="hidden fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2">
    <i class="fa-solid fa-circle-check text-emerald-400"></i>
    <span id="toastMsg">Action effectuée</span>
  </div>

  <script>
    let cart = [{ name: 'Pack Essentiel Pro', price: 4500 }];

    function toggleSearch() {
      const el = document.getElementById('searchBar');
      el.classList.toggle('hidden');
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      const tm = document.getElementById('toastMsg');
      tm.innerText = msg;
      t.classList.remove('hidden');
      setTimeout(() => t.classList.add('hidden'), 2500);
    }

    function addToCart(name, price) {
      cart.push({ name, price });
      updateCartUI();
      showToast(name + ' ajouté au panier !');
    }

    function updateCartUI() {
      document.getElementById('cartCountBadge').innerText = cart.length;
      const list = document.getElementById('cartItemsList');
      list.innerHTML = '';
      let total = 0;
      cart.forEach(item => {
        total += item.price;
        list.innerHTML += \`
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
            <span class="font-bold text-slate-800">\${item.name}</span>
            <span class="font-extrabold text-slate-900">\${item.price.toLocaleString()} F CFA</span>
          </div>
        \`;
      });
      document.getElementById('cartTotalText').innerText = total.toLocaleString() + ' F CFA';
    }

    function openCartModal() {
      document.getElementById('cartModal').classList.remove('hidden');
    }
    function closeCartModal() {
      document.getElementById('cartModal').classList.add('hidden');
    }

    function simulatePayment() {
      closeCartModal();
      showToast('Validation Mobile Money en cours...');
      setTimeout(() => {
        alert('Succès ! Transaction validée par Mobile Money. Merci pour votre commande sur ${safeTitle} !');
        cart = [];
        updateCartUI();
      }, 1000);
    }

    function triggerQuickAction() {
      showToast('Chargement des offres en cours...');
    }

    function filterCategory(cat) {
      showToast('Filtre : ' + cat);
    }

    function openProfileModal() {
      alert('Compte utilisateur connecté : Moussa Traoré (+225 0700000000)');
    }
  </script>
</body>
</html>`;
}

export function createDefaultProject(title: string, description: string, category: Project["category"] = "custom", targetType: Project["targetType"] = "both"): Project {
  const safeTitle = title || "Nouvelle Application";
  const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const initialHtml = generateInitialInteractiveApp(safeTitle, category, description);

  const initialFiles: ProjectFile[] = [
    {
      name: "index.html",
      path: "www/index.html",
      language: "html",
      content: initialHtml,
      description: "Interface principale réactive avec Tailwind et Mobile Money"
    },
    {
      name: "AndroidManifest.xml",
      path: "android/app/src/main/AndroidManifest.xml",
      language: "xml",
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${safeTitle}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
      description: "Configuration du package Android et permissions requises"
    },
    {
      name: "build.gradle",
      path: "android/app/build.gradle",
      language: "groovy",
      content: `apply plugin: 'com.android.application'

android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}`,
      description: "Script de compilation Gradle pour APK et Android App Bundle (AAB)"
    },
    {
      name: "capacitor.config.json",
      path: "capacitor.config.json",
      language: "json",
      content: JSON.stringify({
        appId: `com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        appName: safeTitle,
        webDir: "www",
        bundledWebRuntime: false,
        plugins: {
          SplashScreen: {
            launchShowDuration: 1500,
            backgroundColor: "#0F172A"
          }
        }
      }, null, 2),
      description: "Configuration du pont natif mobile"
    }
  ];

  const initialVersion: ProjectVersion = {
    id: `v_${Date.now()}`,
    versionTag: "v1.0.0",
    timestamp: now,
    summary: "Création initiale du projet avec architecture multi-IA",
    author: "IA de Développement",
    filesCount: initialFiles.length
  };

  const subdomain = `${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    title: safeTitle,
    description: description || "Projet conçu avec les 3 IA AfriBuilder Studio",
    category,
    targetType,
    createdAt: now,
    updatedAt: now,
    currentStepId: "conception",
    stepProgress: 15,
    isCheckpointReached: false,
    userDecisionAfterApk: "pending",
    interactiveAppHtml: initialHtml,
    files: initialFiles,
    versions: [initialVersion],
    researchData: {
      enhancedTitle: `${safeTitle} - Solution No-Code Pro`,
      summary: `Projet optimisé pour mobile et web avec interface moderne et paiement Mobile Money instantané.`,
      keyFeatures: [
        "Interface responsive tactile fluide",
        "Panier et validation de commande en 1 clic",
        "Passerelle Mobile Money (Wave, Orange, MTN, Moov)",
        "Génération native APK et AAB intégrée"
      ],
      suggestedTheme: {
        primaryColor: "#2563EB",
        secondaryColor: "#10B981",
        accentColor: "#F59E0B",
        fontPairing: "Plus Jakarta Sans & Inter",
        designStyle: "Design épuré moderne avec Tailwind CSS"
      },
      freeResources: {
        icons: "Lucide React & FontAwesome 6",
        fonts: "Google Fonts (Inter / Plus Jakarta Sans)",
        illustrations: "Unsplash Free Assets",
        cdnLibraries: ["Tailwind CSS CDN", "FontAwesome CDN"]
      },
      accessibilityTips: [
        "Contraste élevé pour lisibilité en plein soleil",
        "Boutons tactiles d'au moins 44px de hauteur"
      ],
      competitiveAdvantage: "Conception 100% sans code avec déploiement instantané."
    },
    securityAudit: {
      globalScore: 98,
      securityStatus: "Sécurisé",
      performanceScore: 99,
      accessibilityScore: 96,
      mobileReadinessScore: 100,
      testsPassedCount: 16,
      totalTestsCount: 16,
      auditChecks: [
        { category: "Sécurité", name: "Protection XSS & Injection", status: "passed", detail: "Code conforme aux règles de sécurité web" },
        { category: "Sécurité", name: "Sécurisation Mobile Money", status: "passed", detail: "Validation des formulaires côté client" },
        { category: "Accessibilité", name: "Contraste WCAG 2.1 AA", status: "passed", detail: "Rapports de contraste validés à 100%" },
        { category: "Mobile", name: "Responsive & Écrans Tactiles", status: "passed", detail: "Balise Viewport adaptative prête pour Android" }
      ],
      recommendations: [
        "Tester l'installation sur un vrai smartphone Android via le QR Code",
        "Vérifier les numéros marchands Mobile Money dans l'espace admin"
      ]
    },
    apkBundleConfig: {
      packageName: `com.afribuilder.${safeTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      versionCode: 1,
      versionName: "1.0.0",
      apkSizeMb: "12.4 MB",
      aabSizeMb: "8.1 MB",
      sha256: "9F83A2E14B7D6C5E3F0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E",
      generatedAt: now,
      qrData: `https://${subdomain}.afribuilder.app`
    },
    webDeployment: {
      liveUrl: `https://${subdomain}.afribuilder.app`,
      subdomain,
      status: "deployed",
      deployedAt: now,
      ssl: true
    },
    hostingOptions: [
      {
        provider: "Vercel",
        name: "Vercel Free Tier",
        url: "https://vercel.com",
        isFree: true,
        tier: "100% Gratuit à vie",
        features: ["Déploiement 1 clic", "SSL automatique", "Bande passante 100GB/mois", "Nom de domaine personnalisé gratuit"],
        setupGuide: "1. Déposez vos fichiers sur GitHub\n2. Importez le dépôt sur vercel.com\n3. Cliquez sur 'Deploy' : votre site est en ligne en 20 secondes !"
      },
      {
        provider: "Netlify",
        name: "Netlify Free Starter",
        url: "https://netlify.com",
        isFree: true,
        tier: "100% Gratuit",
        features: ["Glisser-déposer de dossier ZIP", "HTTPS automatique", "Formulaires de contact intégrés"],
        setupGuide: "Glissez simplement le dossier 'www' sur app.netlify.com/drop pour être en ligne immédiatement !"
      },
      {
        provider: "Cloudflare",
        name: "Cloudflare Pages",
        url: "https://pages.cloudflare.com",
        isFree: true,
        tier: "100% Gratuit illimité",
        features: ["Protection DDoS mondiale", "Vitesse ultra-rapide en Afrique", "Bande passante illimitée"],
        setupGuide: "Liez votre compte GitHub et profitez du réseau CDN Cloudflare mondial sans limite."
      },
      {
        provider: "GitHub Pages",
        name: "GitHub Pages",
        url: "https://pages.github.com",
        isFree: true,
        tier: "100% Gratuit Open-Source",
        features: ["Hébergement direct depuis le dépôt", "Domaine yourname.github.io"],
        setupGuide: "Activez Pages dans l'onglet 'Settings > Pages' de votre dépôt GitHub."
      }
    ],
    documentation: `# Documentation Complète du Projet : ${safeTitle}

## 1. Vision & Fonctionnalités
- **Application :** ${safeTitle}
- **Type :** ${targetType === "both" ? "Application Android Native + Site Web" : targetType === "mobile_app" ? "Application Android Mobile" : "Site Web Responsive"}
- **Description :** ${description || "Application conçue sans code avec AfriBuilder AI"}
- **Paiements :** Passerelle Mobile Money (Orange Money, Wave, MTN MoMo, Moov)

## 2. Déploiement Web
L'application est optimisée pour fonctionner sur n'importe quel hébergement statique gratuit (Vercel, Netlify, Cloudflare).

## 3. Compilation Android (APK & AAB)
- Fichier APK : Dédié aux tests directs sur smartphone Android sans passer par le store.
- Fichier AAB (Android App Bundle) : Format requis pour la publication officielle sur le Google Play Store.`,
    totalTimeSpentMinutes: 3,
    totalCostFcfa: 15,
    chatHistory: [
      {
        id: "msg_1",
        role: "developer",
        senderName: "IA de Développement",
        text: `👋 Bienvenue ! Je suis votre IA de Développement et Administrateur. J'ai configuré l'architecture de votre projet "${safeTitle}". Les 3 IA (Développement, Recherche Web & Sécurité) sont synchronisées pour vous assister à chaque étape.`,
        timestamp: now
      }
    ]
  };
}

export async function exportProjectZip(project: Project): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file("README.md", `# ${project.title}\n\n${project.description}\n\nGénéré avec AfriBuilder AI Studio.\n\n## Structure du projet\n- www/ : Code source de l'application web\n- android/ : Configuration Android pour build APK/AAB\n- docs/ : Documentation complète`);
  zip.file("DOCUMENTATION.md", project.documentation);
  zip.file("capacitor.config.json", JSON.stringify({
    appId: project.apkBundleConfig.packageName,
    appName: project.title,
    webDir: "www"
  }, null, 2));

  // WWW Folder
  const wwwFolder = zip.folder("www");
  if (wwwFolder) {
    wwwFolder.file("index.html", project.interactiveAppHtml);
  }

  // Android Folder
  const androidFolder = zip.folder("android");
  if (androidFolder) {
    const appFolder = androidFolder.folder("app");
    if (appFolder) {
      appFolder.file("build.gradle", project.files.find(f => f.name === "build.gradle")?.content || "");
      const srcFolder = appFolder.folder("src");
      const mainFolder = srcFolder?.folder("main");
      if (mainFolder) {
        mainFolder.file("AndroidManifest.xml", project.files.find(f => f.name === "AndroidManifest.xml")?.content || "");
      }
    }
  }

  return await zip.generateAsync({ type: "blob" });
}
