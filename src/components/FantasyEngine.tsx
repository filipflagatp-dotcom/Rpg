import { useState, useEffect } from "react";
import { 
  Settings, 
  FolderOpen, 
  PlusCircle, 
  Globe, 
  Eye, 
  EyeOff, 
  Save, 
  Download, 
  Terminal, 
  X, 
  HelpCircle, 
  User, 
  Cpu, 
  Compass, 
  Volume2, 
  Network, 
  HardDrive,
  Flame,
  ArrowRight,
  Database
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  image?: string;
}

export function FantasyEngine() {
  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState<"projects" | "settings">("projects");
  const [settingsTab, setSettingsTab] = useState<"general" | "engine" | "ai" | "resources" | "player">("general");
  
  // Storage states for settings
  const [language, setLanguage] = useState("Polski");
  const [scaling, setScaling] = useState(100);
  const [visualStyle, setVisualStyle] = useState("Ciemny");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiModel, setApiModel] = useState("Pro");
  const [rateLimit, setRateLimit] = useState(true);
  const [launchAtStartup, setLaunchAtStartup] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [backupPath, setBackupPath] = useState("J:\\backups\\flager_rpg");
  const [autoBackup, setAutoBackup] = useState(true);

  // Engine Settings
  const [rpgSystem, setRpgSystem] = useState("Zasady domowe (Custom)");
  const [autoRoll, setAutoRoll] = useState(true);
  const [baseRollModifier, setBaseRollModifier] = useState(1);
  const [npcDensity, setNpcDensity] = useState(70);
  const [storyComplexity, setStoryComplexity] = useState(80);
  const [worldType, setWorldType] = useState("High Fantasy");
  const [autoCombat, setAutoCombat] = useState(true);
  const [combatDifficulty, setCombatDifficulty] = useState(5);
  const [loadMap, setLoadMap] = useState(false);
  const [loadPlot, setLoadPlot] = useState(true);
  const [generateEvilCity, setGenerateEvilCity] = useState(false);

  // GM Profiles — which profile is active in the engine tab editor
  const [activeGmProfile, setActiveGmProfile] = useState<"dd35" | "cyberpunk">("dd35");

  const savedProfiles = (() => {
    try { return JSON.parse(localStorage.getItem("flager_gm_profiles") || "{}"); }
    catch { return {}; }
  })();

  // D&D 3.5 GM Profile
  const [dd35Temp, setDd35Temp] = useState(savedProfiles.dd35Temp ?? 0.4);
  const [dd35TopP, setDd35TopP] = useState(savedProfiles.dd35TopP ?? 0.88);
  const [dd35HaltGeneration, setDd35HaltGeneration] = useState(savedProfiles.dd35HaltGeneration ?? true);
  const [dd35BonusTracking, setDd35BonusTracking] = useState(savedProfiles.dd35BonusTracking ?? true);
  const [dd35AoO, setDd35AoO] = useState(savedProfiles.dd35AoO ?? true);
  const [dd35InitiativeTracker, setDd35InitiativeTracker] = useState(savedProfiles.dd35InitiativeTracker ?? true);
  const [dd35NoAdvantage, setDd35NoAdvantage] = useState(savedProfiles.dd35NoAdvantage ?? true);
  const [dd35Directives, setDd35Directives] = useState(savedProfiles.dd35Directives ?? 
    "Używaj wyłącznie mechanik D&D 3.5e. Zakazane: advantage/disadvantage z 5e. Operuj na premii bazowej ataku (BAB) i płaskich modyfikatorach. Formatuj odpowiedzi w sekcjach [NARRACJA] i [MECHANIKA]."
  );

  // Cyberpunk RED GM Profile
  const [cpTemp, setCpTemp] = useState(savedProfiles.cpTemp ?? 0.75);
  const [cpTopP, setCpTopP] = useState(savedProfiles.cpTopP ?? 0.87);
  const [cpHaltGeneration, setCpHaltGeneration] = useState(savedProfiles.cpHaltGeneration ?? true);
  const [cpNetrunnerRules, setCpNetrunnerRules] = useState(savedProfiles.cpNetrunnerRules ?? true);
  const [cpHumanityTracking, setCpHumanityTracking] = useState(savedProfiles.cpHumanityTracking ?? true);
  const [cpDirectives, setCpDirectives] = useState(savedProfiles.cpDirectives ?? 
    "Prowadź grę ściśle według zasad Cyberpunk RED. Śledź Humanitaryzm (HUM) i punkty pancerza (SP). Formatuj odpowiedzi w sekcjach [NARRACJA] i [MECHANIKA]. Uwzględniaj zasady hakowania i runnerów sieci."
  );

  useEffect(() => {
    localStorage.setItem("flager_gm_profiles", JSON.stringify({
      dd35Temp, dd35TopP, dd35HaltGeneration, dd35BonusTracking, dd35AoO, dd35InitiativeTracker, dd35NoAdvantage, dd35Directives,
      cpTemp, cpTopP, cpHaltGeneration, cpNetrunnerRules, cpHumanityTracking, cpDirectives
    }));
  }, [
    dd35Temp, dd35TopP, dd35HaltGeneration, dd35BonusTracking, dd35AoO, dd35InitiativeTracker, dd35NoAdvantage, dd35Directives,
    cpTemp, cpTopP, cpHaltGeneration, cpNetrunnerRules, cpHumanityTracking, cpDirectives
  ]);

  // AI settings
  const [aiModelType, setAiModelType] = useState("Gemini 1.5 Pro");
  const [narrationIntensity, setNarrationIntensity] = useState(75);
  const [realtimeImages, setRealtimeImages] = useState(true);
  const [worldDepthParams, setWorldDepthParams] = useState(2);

  // Projects list
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Chronicles of Aethelgard",
      description: "Klasyczna kampania High Fantasy w krainie podupadłych królestw ludzkich, zagrożonych przez powracających smokobójców.",
      status: "Aktywny"
    },
    {
      id: "2",
      title: "Dungeon Master's Realm",
      description: "Eksperymentalny generator lochów sandboxowych z zaawansowaną sztuczną inteligencją reagującą na rzuty graczy.",
      status: "Zapisano"
    }
  ]);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);

  // Sync key back to localStorage and trigger change detection
  useEffect(() => {
    localStorage.setItem("GEMINI_API_KEY", apiKey);
    // Dispatch custom event to notify server API key has changed
    window.dispatchEvent(new Event("storage"));
  }, [apiKey]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    const newProj: Project = {
      id: Date.now().toString(),
      title: newProjTitle,
      description: newProjDesc || "Brak opisu projektu.",
      status: "Zapisano"
    };
    setProjects([newProj, ...projects]);
    setNewProjTitle("");
    setNewProjDesc("");
    setShowAddProjectForm(false);
  };

  return (
    <div className="flex-1 bg-[#0f0a06] text-[#e0cfb3] flex flex-col font-serif overflow-y-auto min-h-screen relative p-4 md:p-6 selection:bg-[#d4a373] selection:text-black">
      {/* Background Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#24170e]/40 via-[#0a0502]/90 to-[#030100] pointer-events-none z-0"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl w-full mx-auto flex flex-col gap-6">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row items-center justify-between border-b-2 border-[#5c4028]/40 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37] via-[#aa7c11] to-[#604207] rounded-full p-0.5 shadow-lg flex items-center justify-center relative group">
              <div className="absolute -inset-1 bg-[#ffd700]/20 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000"></div>
              <div className="w-full h-full bg-[#1e130b] rounded-full flex items-center justify-center">
                <Flame className="w-7 h-7 text-[#ffd700] animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-extrabold tracking-wider fantasy-gold-text fantasy-title">
                FLAGER'S RPG ENGINE
              </h1>
              <p className="text-[10px] md:text-xs text-[#a08568] tracking-widest uppercase font-mono mt-0.5">
                Kreator Sandboxu RPG z integracją Gemini AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0 bg-[#24170e]/80 border border-[#5c4028]/50 px-4 py-2 rounded shadow-md font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <span className="text-[#c5a880] uppercase tracking-wider">Silnik Gemini: Aktywny</span>
          </div>
        </header>

        {/* TOP MAIN NAVIGATION */}
        <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-[#5c4028]/20 pb-4">
          <button 
            onClick={() => { setActiveTab("projects"); setShowAddProjectForm(false); }}
            className={`py-3 px-4 rounded border font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === "projects" && !showAddProjectForm ? "border-[#ffd700]/60 bg-[#5c4028]/35 text-[#ffe680] shadow-[0_0_15px_rgba(218,165,32,0.15)]" : "border-[#5c4028]/30 bg-[#1e130b]/60 text-[#a08568] hover:text-[#ffd700] hover:border-[#ffd700]/30"}`}
          >
            <FolderOpen className="w-4 h-4" /> [MOJE PROJEKTY]
          </button>
          
          <button 
            onClick={() => { setActiveTab("projects"); setShowAddProjectForm(true); }}
            className={`py-3 px-4 rounded border font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${showAddProjectForm ? "border-[#ffd700]/60 bg-[#5c4028]/35 text-[#ffe680] shadow-[0_0_15px_rgba(218,165,32,0.15)]" : "border-[#5c4028]/30 bg-[#1e130b]/60 text-[#a08568] hover:text-[#ffd700] hover:border-[#ffd700]/30"}`}
          >
            <PlusCircle className="w-4 h-4" /> [STWÓRZ NOWY]
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`py-3 px-4 rounded border font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === "settings" ? "border-[#ffd700]/60 bg-[#5c4028]/35 text-[#ffe680] shadow-[0_0_15px_rgba(218,165,32,0.15)]" : "border-[#5c4028]/30 bg-[#1e130b]/60 text-[#a08568] hover:text-[#ffd700] hover:border-[#ffd700]/30"}`}
          >
            <Settings className="w-4 h-4" /> [USTAWIENIA SILNIKA]
          </button>

          <a 
            href="https://ai.google.dev" 
            target="_blank" 
            rel="noreferrer"
            className="py-3 px-4 rounded border border-[#5c4028]/30 bg-[#1e130b]/60 text-[#a08568] hover:text-[#ffd700] hover:border-[#ffd700]/30 transition-all duration-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-center"
          >
            <Globe className="w-4 h-4" /> [SPOŁECZNOŚĆ]
          </a>
        </nav>

        {/* -------------------- VIEW 1: PROJECTS & NEW PROJECT -------------------- */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content Area: Background Artwork & Projects List */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Fantasy Graphic Art Frame Banner */}
              <div className="relative rounded-lg overflow-hidden border-2 border-[#5c4028]/70 shadow-2xl h-64 md:h-72">
                <img 
                  src="/assets/fantasy_bg.png" 
                  alt="Flager's RPG Engine Background" 
                  className="w-full h-full object-cover object-center filter saturate-75 brightness-[0.65]" 
                  onError={(e) => {
                    // Fallback to stylized CSS styling if the image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback styling placeholder */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1c1109] via-[#3a2211] to-[#1c1109] flex flex-col items-center justify-center p-6 text-center">
                  <Flame className="w-12 h-12 text-[#ffd700]/60 mb-2 animate-bounce" />
                  <span className="fantasy-title text-2xl text-[#ffd700]">Epickie Wyprawy Czekają</span>
                  <span className="text-xs text-[#a08568] mt-1 font-mono">Brak renderu graficznego - kliknij Settings, aby wgrać klucz</span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a06] via-transparent to-transparent"></div>
                
                {/* Text inside banner */}
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-[10px] text-[#ffd700] tracking-widest font-mono uppercase font-bold">Kampanie Sandboxowe</span>
                  <h2 className="text-xl md:text-2xl font-bold font-serif text-[#fcf6e6] fantasy-title mt-0.5">Wkraczaj do Krainy Aethelgard</h2>
                  <p className="text-xs text-[#c5a880]/90 leading-relaxed font-sans max-w-lg mt-1.5 hidden sm:block">
                    System dynamicznie integruje opisy z AI na podstawie twoich statystyk i rzutów kośćmi. Ustaw parametry, wybierz scenariusz i poprowadź swoją postać przez nieprzewidywalną przygodę.
                  </p>
                </div>
              </div>

              {/* Conditionally Render Add Project Form or Project List */}
              {showAddProjectForm ? (
                <div className="fantasy-wood-panel p-6 rounded-lg border-2 border-[#5c4028] space-y-4">
                  <h3 className="text-lg font-bold fantasy-gold-text fantasy-title border-b border-[#5c4028]/40 pb-2 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-amber-500" /> KREATOR NOWEGO PROJEKTU
                  </h3>
                  <form onSubmit={handleCreateProject} className="space-y-4 font-sans text-sm">
                    <div>
                      <label className="text-[11px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Nazwa Przygody / Świata</label>
                      <input 
                        type="text" 
                        required
                        value={newProjTitle}
                        onChange={(e) => setNewProjTitle(e.target.value)}
                        placeholder="np. Saga o Kryształowym Szczycie"
                        className="w-full bg-[#170e08] border border-[#5c4028]/50 hover:border-[#ffd700]/30 rounded px-3 py-2 text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Krótki zarys fabularny</label>
                      <textarea 
                        rows={4}
                        value={newProjDesc}
                        onChange={(e) => setNewProjDesc(e.target.value)}
                        placeholder="Opisz ogólny cel, antagonistów i początkową lokację. Będzie to fundament dla promptów generowanych przez Gemini."
                        className="w-full bg-[#170e08] border border-[#5c4028]/50 hover:border-[#ffd700]/30 rounded p-3 text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        type="submit" 
                        className="px-6 py-2.5 bg-gradient-to-r from-[#aa7c11] to-[#daa520] hover:from-[#daa520] hover:to-[#ffd700] text-black font-bold text-xs rounded transition uppercase tracking-wider font-mono shadow-md"
                      >
                        Rozpocznij Projekt
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowAddProjectForm(false)}
                        className="px-4 py-2.5 border border-[#5c4028]/60 hover:border-red-500 hover:text-red-400 bg-transparent text-[#a08568] font-bold text-xs rounded transition uppercase tracking-wider font-mono"
                      >
                        Anuluj
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#c5a880] uppercase tracking-widest font-mono border-b border-[#5c4028]/30 pb-2">
                    Dostępne Projekty RPG ({projects.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((proj) => (
                      <div 
                        key={proj.id}
                        className="fantasy-wood-panel p-5 rounded-lg border-2 border-[#5c4028]/60 hover:border-[#ffd700]/40 transition duration-300 flex flex-col justify-between group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 bg-[#5c4028]/40 border-l border-b border-[#5c4028]/60 text-[9px] text-[#ffd700] uppercase px-2 py-0.5 font-mono tracking-wider font-bold">
                          {proj.status}
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-base text-[#ffd700] group-hover:text-[#ffe680] transition fantasy-title">
                            {proj.title}
                          </h4>
                          <p className="text-xs text-[#c5a880]/80 leading-relaxed font-sans line-clamp-3">
                            {proj.description}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            alert(`Ładowanie kampanii "${proj.title}" do silnika narracyjnego...`);
                          }}
                          className="mt-4 w-full py-1.5 bg-[#5c4028]/20 hover:bg-[#5c4028]/55 border border-[#5c4028]/60 hover:border-[#ffd700]/40 text-[#c5a880] hover:text-[#ffe680] rounded text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 font-mono"
                        >
                          Wczytaj Kampanię <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Quick Actions & Controls */}
            <div className="space-y-6">
              
              {/* Quick Actions Panel */}
              <div className="fantasy-wood-panel p-5 rounded-lg border-2 border-[#5c4028] shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-[#ffd700] tracking-widest uppercase font-mono border-b border-[#5c4028]/40 pb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-500" /> Szybkie Operacje
                </h3>
                
                <div className="space-y-2.5 font-sans">
                  <button 
                    onClick={() => alert("Eksportowanie danych gry do JSON...")}
                    className="w-full py-3 bg-[#24170e]/80 hover:bg-[#3d2719]/80 border border-[#5c4028]/70 hover:border-[#ffd700]/50 text-[#e0cfb3] hover:text-[#ffd700] rounded transition flex items-center justify-between px-4 text-xs font-bold group"
                  >
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4 text-amber-500" /> EKSPORTUJ GRA
                    </span>
                    <span className="text-[10px] text-[#a08568] font-mono group-hover:text-[#ffd700] transition">Alt + E</span>
                  </button>

                  <button 
                    onClick={() => alert("Budowanie paczki zasobów kampanii...")}
                    className="w-full py-3 bg-[#24170e]/80 hover:bg-[#3d2719]/80 border border-[#5c4028]/70 hover:border-[#ffd700]/50 text-[#e0cfb3] hover:text-[#ffd700] rounded transition flex items-center justify-between px-4 text-xs font-bold group"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-amber-500" /> BUDUJ ZASOBY
                    </span>
                    <span className="text-[10px] text-[#a08568] font-mono group-hover:text-[#ffd700] transition">Alt + B</span>
                  </button>

                  <button 
                    onClick={() => alert("Generowanie linku do udostępnienia przygody...")}
                    className="w-full py-3 bg-[#24170e]/80 hover:bg-[#3d2719]/80 border border-[#5c4028]/70 hover:border-[#ffd700]/50 text-[#e0cfb3] hover:text-[#ffd700] rounded transition flex items-center justify-between px-4 text-xs font-bold group"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-500" /> UDOSTĘPNIJ MOD
                    </span>
                    <span className="text-[10px] text-[#a08568] font-mono group-hover:text-[#ffd700] transition">Alt + S</span>
                  </button>
                </div>
              </div>

              {/* Info Parchment Panel */}
              <div className="fantasy-parchment p-5 rounded-lg border border-[#c5a880]/40 text-[#4c3c2b] space-y-3 shadow-lg">
                <h4 className="font-bold text-xs uppercase tracking-widest font-mono border-b border-[#c5a880]/30 pb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#8b5a2b]" /> KRONIKA SILNIKA
                </h4>
                <p className="text-xs leading-relaxed font-serif">
                  Silnik Flager RPG integruje zaawansowane modele językowe Gemini z klasycznymi mechanikami lochów i smoków. Narzędzie automatycznie przelicza rzuty modyfikatora pod zasady gry (np. D&D 5E).
                </p>
                <div className="text-[10px] bg-[#ebdcae]/50 border border-[#d4c39e] p-2 rounded font-mono text-[#5c442d] leading-normal">
                  <strong>TIP:</strong> Uzupełnij swój klucz API w ustawieniach, aby aktywować pełną moc narracji.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* -------------------- VIEW 2: SETTINGS (SKEUOMORPHIC PANEL) -------------------- */}
        {activeTab === "settings" && (
          <div className="fantasy-wood-panel rounded-lg border-4 border-[#1a0f07] shadow-2xl relative overflow-hidden flex flex-col">
            {/* Top Ornate Banner */}
            <div className="bg-[#1e130b] border-b-2 border-[#5c4028] px-6 py-4 flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#ffd700]" />
                <h2 className="text-lg md:text-xl font-bold tracking-wider fantasy-gold-text fantasy-title uppercase">
                  USTAWIENIA I OPCJE SILNIKA
                </h2>
              </div>
              <button 
                onClick={() => setActiveTab("projects")}
                className="p-1 rounded bg-[#5c4028]/20 hover:bg-[#5c4028]/60 border border-[#5c4028]/40 text-[#ffd700] transition hover:scale-105"
                title="Zamknij ustawienia"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inner Dashboard Layout Split */}
            <div className="grid grid-cols-1 md:grid-cols-4 min-h-[460px] bg-[#170e08]/90">
              
              {/* Left Settings Navigation */}
              <div className="md:col-span-1 border-r border-[#5c4028]/30 bg-[#140b05] p-3 flex flex-col gap-1.5">
                {[
                  { id: "general", label: "OGÓLNE", icon: Settings },
                  { id: "engine", label: "SILNIK ROZGRYWKI", icon: Compass },
                  { id: "ai", label: "SZTUCZNA INTELIGENCJA", icon: Cpu },
                  { id: "resources", label: "ZASOBY I EXPORT", icon: Database },
                  { id: "player", label: "PROFIL GRACZA", icon: User }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSettingsTab(item.id as any)}
                      className={`w-full py-3 px-4 rounded text-left text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-2.5 ${settingsTab === item.id ? "bg-[#5c4028]/40 border-l-4 border-[#ffd700] text-[#ffd700] font-bold" : "text-[#a08568] hover:text-[#ffd700] hover:bg-[#1e130b]/30"}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Center Parchment Settings Sheet */}
              <div className="md:col-span-2 p-5 md:p-6 bg-[#0f0a06] flex flex-col justify-between">
                
                <div className="fantasy-parchment p-5 rounded-lg border border-[#c5a880]/40 text-[#3d2e1f] font-serif shadow-inner space-y-5 flex-grow overflow-y-auto max-h-[400px]">
                  
                  {/* 1. TAB: GENERAL (OGÓLNE) */}
                  {settingsTab === "general" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono">
                        Język i Interfejs
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[#5c442d] font-bold mb-1">Język Aplikacji</label>
                          <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded px-2 py-1.5 focus:outline-none focus:border-[#8b5a2b]"
                          >
                            <option value="Polski">Polski</option>
                            <option value="English">English</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#5c442d] font-bold mb-1">Styl Wizualny</label>
                          <select 
                            value={visualStyle} 
                            onChange={(e) => setVisualStyle(e.target.value)}
                            className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded px-2 py-1.5 focus:outline-none focus:border-[#8b5a2b]"
                          >
                            <option value="Ciemny">Ciemny (Głębokie Drewno)</option>
                            <option value="Jasny">Jasny (Antyczny Pergamin)</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[#5c442d] font-bold mb-1">Skalowanie Interfejsu ({scaling}%)</label>
                          <div className="flex gap-2">
                            {[75, 100, 125, 150].map((scale) => (
                              <button
                                key={scale}
                                type="button"
                                onClick={() => setScaling(scale)}
                                className={`px-3 py-1 rounded border text-[10px] font-bold transition font-mono ${scaling === scale ? "bg-[#8b5a2b] border-[#8b5a2b] text-[#fcf6e6]" : "bg-[#fcf6e6] border-[#d4c39e] text-[#5c442d] hover:bg-[#ebdcae]"}`}
                              >
                                {scale}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono pt-3">
                        Gemini Integracja
                      </h3>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[#5c442d] font-bold mb-1">Klucz API Gemini</label>
                          <div className="relative">
                            <input 
                              type={showApiKey ? "text" : "password"} 
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder="Wpisz klucz API (np. AIzaSy...)"
                              className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded pl-3 pr-9 py-1.5 focus:outline-none focus:border-[#8b5a2b] font-mono text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="absolute right-2 top-2 text-[#8b5a2b] hover:text-[#5c442d]"
                            >
                              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[#5c442d] font-bold mb-1">Wybór Modelu</label>
                            <select 
                              value={apiModel} 
                              onChange={(e) => setApiModel(e.target.value)}
                              className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded px-2 py-1.5 focus:outline-none focus:border-[#8b5a2b]"
                            >
                              <option value="Pro">Gemini 1.5 Pro</option>
                              <option value="Flash">Gemini 1.5 Flash</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-1.5 pt-4">
                            <input 
                              type="checkbox"
                              id="rateLimitToggle"
                              checked={rateLimit}
                              onChange={(e) => setRateLimit(e.target.checked)}
                              className="rounded border-[#d4c39e] text-[#8b5a2b] focus:ring-[#8b5a2b]"
                            />
                            <label htmlFor="rateLimitToggle" className="text-[#5c442d] font-bold">Limit zapytań</label>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono pt-3">
                        Zachowanie i Kopie
                      </h3>
                      
                      <div className="space-y-2 text-xs font-sans text-[#5c442d]">
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={launchAtStartup} 
                            onChange={(e) => setLaunchAtStartup(e.target.checked)} 
                            className="rounded text-[#8b5a2b] focus:ring-[#8b5a2b]"
                          />
                          <span>Uruchamiaj przy starcie systemu</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={autoUpdate} 
                            onChange={(e) => setAutoUpdate(e.target.checked)} 
                            className="rounded text-[#8b5a2b] focus:ring-[#8b5a2b]"
                          />
                          <span>Automatycznie sprawdzaj aktualizacje</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 2. TAB: GAME ENGINE (SILNIK ROZGRYWKI) */}
                  {settingsTab === "engine" && (
                    <div className="space-y-4">
                      {/* Profile selector */}
                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono">
                        Edytor Mistrza Gry — Wybierz Profil
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setActiveGmProfile("dd35")}
                          className={`py-2.5 rounded border text-xs font-bold uppercase tracking-wider transition-all font-mono flex flex-col items-center gap-0.5 ${activeGmProfile === "dd35" ? "border-[#8b5a2b] bg-[#8b5a2b]/20 text-[#5c3e21]" : "border-[#d4c39e] bg-[#fcf6e6] text-[#8b6540] hover:bg-[#ebdcae]"}`}
                        >
                          <span className="text-base">⚔️</span>
                          MG: D&amp;D 3.5
                        </button>
                        <button
                          onClick={() => setActiveGmProfile("cyberpunk")}
                          className={`py-2.5 rounded border text-xs font-bold uppercase tracking-wider transition-all font-mono flex flex-col items-center gap-0.5 ${activeGmProfile === "cyberpunk" ? "border-[#8b5a2b] bg-[#8b5a2b]/20 text-[#5c3e21]" : "border-[#d4c39e] bg-[#fcf6e6] text-[#8b6540] hover:bg-[#ebdcae]"}`}
                        >
                          <span className="text-base">🤖</span>
                          MG: Cyberpunk RED
                        </button>
                      </div>

                      {/* ===== D&D 3.5 PROFILE ===== */}
                      {activeGmProfile === "dd35" && (
                        <div className="space-y-4">
                          <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono pt-1">
                            ⚔️ Profil MG — D&amp;D 3.5e
                          </h3>

                          {/* Temperature */}
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between font-bold text-[#5c442d]">
                              <span>Temperatura modelu</span>
                              <span className="font-mono text-[#8b5a2b]">
                                {dd35Temp.toFixed(2)} {dd35Temp <= 0.5 ? "⚔️ Walka/Mechanika" : "📖 Eksploracja/RPG"}
                              </span>
                            </div>
                            <input type="range" min="0.1" max="1.0" step="0.05"
                              value={dd35Temp} onChange={(e) => setDd35Temp(parseFloat(e.target.value))}
                              className="w-full accent-[#8b5a2b] cursor-pointer" />
                            <p className="text-[10px] text-[#8b6540] font-sans italic">
                              0.3–0.5 = walka i mechanika (mniej halucynacji) · 0.7–0.8 = eksploracja i dialog NPC
                            </p>
                          </div>

                          {/* Top-P */}
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between font-bold text-[#5c442d]">
                              <span>Top-P (jądro próbkowania)</span>
                              <span className="font-mono text-[#8b5a2b]">{dd35TopP.toFixed(2)}</span>
                            </div>
                            <input type="range" min="0.70" max="1.0" step="0.01"
                              value={dd35TopP} onChange={(e) => setDd35TopP(parseFloat(e.target.value))}
                              className="w-full accent-[#8b5a2b] cursor-pointer" />
                            <p className="text-[10px] text-[#8b6540] font-sans italic">
                              Zalecane: 0.85–0.90 · Zapobiega losowości, zachowuje bogate słownictwo
                            </p>
                          </div>

                          {/* Mechanic enforcement toggles */}
                          <div className="space-y-2 text-xs">
                            <label className="block text-[#5c442d] font-bold uppercase tracking-wider font-mono">Egzekwowanie Mechaniki 3.5e</label>
                            {[
                              { state: dd35NoAdvantage, setter: setDd35NoAdvantage, label: "Zakaz Advantage/Disadvantage z 5e", desc: "Wymusza płaskie modyfikatory (+2/-4) i BAB" },
                              { state: dd35BonusTracking, setter: setDd35BonusTracking, label: "Śledzenie Typów Premii", desc: "Premie tego samego typu (enhancement, morale) się nie kumulują" },
                              { state: dd35AoO, setter: setDd35AoO, label: "Ataki Okazyjne (AoO)", desc: "Automatyczne alerty gdy ruch lub akcja wywołuje AoO" },
                              { state: dd35InitiativeTracker, setter: setDd35InitiativeTracker, label: "Tracker Inicjatywy i Czasu", desc: "Blok z listą inicjatywy, PW wrogów i licznikiem efektów na początku tury" },
                              { state: dd35HaltGeneration, setter: setDd35HaltGeneration, label: "Zasada Zatrzymania (Halt)", desc: "AI nie decyduje za gracza — kończy odpowiedź gdy wymagana jest akcja/rzut" },
                            ].map(({ state, setter, label, desc }) => (
                              <label key={label} className="flex items-start gap-2 cursor-pointer group">
                                <input type="checkbox" checked={state} onChange={(e) => setter(e.target.checked)}
                                  className="mt-0.5 rounded text-[#8b5a2b] focus:ring-[#8b5a2b] flex-shrink-0" />
                                <span>
                                  <span className="font-bold text-[#5c442d] group-hover:text-[#3d2010]">{label}</span>
                                  <span className="block text-[10px] text-[#8b6540] font-sans">{desc}</span>
                                </span>
                              </label>
                            ))}
                          </div>

                          {/* Custom directives */}
                          <div className="space-y-1 text-xs">
                            <label className="block text-[#5c442d] font-bold uppercase tracking-wider font-mono">Dyrektywy Systemowe MG</label>
                            <textarea rows={4} value={dd35Directives} onChange={(e) => setDd35Directives(e.target.value)}
                              className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded p-2 focus:outline-none focus:border-[#8b5a2b] resize-none font-sans text-[11px] text-[#3d2e1f]" />
                            <p className="text-[10px] text-[#8b6540] font-sans italic">
                              Te dyrektywy trafią bezpośrednio do promptu systemowego Gemini dla kampanii D&D 3.5.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* ===== CYBERPUNK RED PROFILE ===== */}
                      {activeGmProfile === "cyberpunk" && (
                        <div className="space-y-4">
                          <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono pt-1">
                            🤖 Profil MG — Cyberpunk RED
                          </h3>

                          {/* Temperature */}
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between font-bold text-[#5c442d]">
                              <span>Temperatura modelu</span>
                              <span className="font-mono text-[#8b5a2b]">
                                {cpTemp.toFixed(2)} {cpTemp <= 0.55 ? "🔫 Walka/Strzelanie" : "🌆 Klimat/Narracja"}
                              </span>
                            </div>
                            <input type="range" min="0.1" max="1.0" step="0.05"
                              value={cpTemp} onChange={(e) => setCpTemp(parseFloat(e.target.value))}
                              className="w-full accent-[#8b5a2b] cursor-pointer" />
                            <p className="text-[10px] text-[#8b6540] font-sans italic">
                              0.3–0.5 = strzelaniny i mechanika · 0.7–0.8 = noir, dialogi, klimat ulicy
                            </p>
                          </div>

                          {/* Top-P */}
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between font-bold text-[#5c442d]">
                              <span>Top-P (jądro próbkowania)</span>
                              <span className="font-mono text-[#8b5a2b]">{cpTopP.toFixed(2)}</span>
                            </div>
                            <input type="range" min="0.70" max="1.0" step="0.01"
                              value={cpTopP} onChange={(e) => setCpTopP(parseFloat(e.target.value))}
                              className="w-full accent-[#8b5a2b] cursor-pointer" />
                            <p className="text-[10px] text-[#8b6540] font-sans italic">
                              Zalecane: 0.85–0.90 · Zachowuje cyberpunkowy slang i styl ulicy
                            </p>
                          </div>

                          {/* Mechanic enforcement toggles */}
                          <div className="space-y-2 text-xs">
                            <label className="block text-[#5c442d] font-bold uppercase tracking-wider font-mono">Egzekwowanie Mechaniki Cyberpunk RED</label>
                            {[
                              { state: cpNetrunnerRules, setter: setCpNetrunnerRules, label: "Zasady Netrunnerów i Hackowania", desc: "Pełna mechanika sieci, ICE, programów ataku i RAS" },
                              { state: cpHumanityTracking, setter: setCpHumanityTracking, label: "Śledzenie Humanitaryzmu (HUM)", desc: "Każdy wszczep obniża HUM — AI informuje o granicy cyberpsychozy" },
                              { state: cpHaltGeneration, setter: setCpHaltGeneration, label: "Zasada Zatrzymania (Halt)", desc: "AI nie decyduje za gracza — kończy odpowiedź gdy wymagana jest akcja" },
                            ].map(({ state, setter, label, desc }) => (
                              <label key={label} className="flex items-start gap-2 cursor-pointer group">
                                <input type="checkbox" checked={state} onChange={(e) => setter(e.target.checked)}
                                  className="mt-0.5 rounded text-[#8b5a2b] focus:ring-[#8b5a2b] flex-shrink-0" />
                                <span>
                                  <span className="font-bold text-[#5c442d] group-hover:text-[#3d2010]">{label}</span>
                                  <span className="block text-[10px] text-[#8b6540] font-sans">{desc}</span>
                                </span>
                              </label>
                            ))}
                          </div>

                          {/* Custom directives */}
                          <div className="space-y-1 text-xs">
                            <label className="block text-[#5c442d] font-bold uppercase tracking-wider font-mono">Dyrektywy Systemowe MG</label>
                            <textarea rows={4} value={cpDirectives} onChange={(e) => setCpDirectives(e.target.value)}
                              className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded p-2 focus:outline-none focus:border-[#8b5a2b] resize-none font-sans text-[11px] text-[#3d2e1f]" />
                            <p className="text-[10px] text-[#8b6540] font-sans italic">
                              Te dyrektywy trafią bezpośrednio do promptu systemowego Gemini dla kampanii Cyberpunk RED.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Shared generation options */}
                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono pt-2">
                        Generacja Elementów Świata
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between font-bold text-[#5c442d] mb-1">
                            <span>Gęstość NPC / Postaci Pobocznych</span>
                            <span className="font-mono text-[#8b5a2b]">{npcDensity}%</span>
                          </div>
                          <input type="range" min="10" max="100" value={npcDensity}
                            onChange={(e) => setNpcDensity(parseInt(e.target.value))}
                            className="w-full accent-[#8b5a2b] cursor-pointer" />
                        </div>
                        <div>
                          <div className="flex justify-between font-bold text-[#5c442d] mb-1">
                            <span>Złożoność Intryg Fabularnych</span>
                            <span className="font-mono text-[#8b5a2b]">{storyComplexity}%</span>
                          </div>
                          <input type="range" min="10" max="100" value={storyComplexity}
                            onChange={(e) => setStoryComplexity(parseInt(e.target.value))}
                            className="w-full accent-[#8b5a2b] cursor-pointer" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-sans text-[#5c442d]">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={loadMap} onChange={(e) => setLoadMap(e.target.checked)} className="rounded text-[#8b5a2b]" />
                            <span>Wczytuj mapę regionalną</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" checked={loadPlot} onChange={(e) => setLoadPlot(e.target.checked)} className="rounded text-[#8b5a2b]" />
                            <span>Wczytuj wątek główny</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}



                  {/* 3. TAB: ARTIFICIAL INTELLIGENCE (SZTUCZNA INTELIGENCJA) */}
                  {settingsTab === "ai" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono">
                        Model i Ustawienia AI
                      </h3>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[#5c442d] font-bold mb-1">Główny Model Narracyjny</label>
                          <select 
                            value={aiModelType} 
                            onChange={(e) => setAiModelType(e.target.value)}
                            className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded px-2 py-1.5 focus:outline-none focus:border-[#8b5a2b]"
                          >
                            <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Zalecany do kampanii)</option>
                            <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Szybkie odpowiedzi)</option>
                            <option value="Gemini 1.0 Ultra">Gemini 1.0 Ultra (Dziedzictwo)</option>
                          </select>
                        </div>

                        <div>
                          <div className="flex justify-between font-bold text-[#5c442d] mb-1">
                            <span>Głębokość i Intensywność Narracji</span>
                            <span className="font-mono text-[#8b5a2b]">
                              {narrationIntensity < 30 ? "Subtelna" : narrationIntensity < 70 ? "Zbalansowana" : "Epicka"} ({narrationIntensity}%)
                            </span>
                          </div>
                          
                          {/* Skeuomorphic Dragon slider simulation */}
                          <div className="relative flex items-center py-2">
                            <input 
                              type="range"
                              min="10" max="100"
                              value={narrationIntensity}
                              onChange={(e) => setNarrationIntensity(parseInt(e.target.value))}
                              className="w-full accent-[#8b5a2b] cursor-pointer h-2 bg-[#ebdcae] rounded-lg border border-[#d4c39e]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#c5a880]/30 pt-3">
                          <div>
                            <span className="block font-bold text-[#5c442d]">Generowanie Ilustracji Lokacji</span>
                            <span className="text-[10px] text-[#8b6540] font-sans">Automatycznie twórz szkice miejsc podczas rozgrywki</span>
                          </div>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={realtimeImages} 
                              onChange={(e) => setRealtimeImages(e.target.checked)}
                              className="sr-only peer"
                              id="imagesToggle"
                            />
                            <label htmlFor="imagesToggle" className="w-9 h-5 bg-[#d4c39e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#fcf6e6] after:border-[#ebdcae] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8b5a2b]"></label>
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className="block text-[#5c442d] font-bold mb-1">Głębokość Generacji Świata (Parametry)</label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setWorldDepthParams(Math.max(1, worldDepthParams - 1))}
                              className="w-8 h-8 rounded border border-[#d4c39e] bg-[#fcf6e6] text-[#5c442d] font-bold text-center hover:bg-[#ebdcae] text-sm"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-[#8b5a2b] text-base w-6 text-center">{worldDepthParams}</span>
                            <button
                              type="button"
                              onClick={() => setWorldDepthParams(Math.min(5, worldDepthParams + 1))}
                              className="w-8 h-8 rounded border border-[#d4c39e] bg-[#fcf6e6] text-[#5c442d] font-bold text-center hover:bg-[#ebdcae] text-sm"
                            >
                              +
                            </button>
                            <span className="text-[10px] text-[#8b6540] font-sans italic">Zalecany przedział: 2-3 stopnie szczegółowości.</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* 4. TAB: EXPORTS & RESOURCES */}
                  {settingsTab === "resources" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono">
                        Zarządzanie Danymi
                      </h3>
                      
                      <p className="text-xs text-[#5c442d] leading-normal font-sans">
                        W tym panelu możesz zarządzać plikami zapisu, logami przygód, eksportem notatek Mistrza Gry oraz wyczyścić pamięć podręczną modeli.
                      </p>

                      <div className="space-y-3 pt-2">
                        <button 
                          onClick={() => alert("Notatki z sesji wyeksportowane do formatu Markdown (.md).")}
                          className="w-full py-2 bg-[#ebdcae] border border-[#d4c39e] hover:bg-[#d4c39e] text-[#5c442d] rounded text-xs font-bold transition font-mono uppercase tracking-wider text-center"
                        >
                          Eksportuj kronikę do Markdown
                        </button>
                        <button 
                          onClick={() => alert("Generowanie kopii zapasowej bazy danych...")}
                          className="w-full py-2 bg-[#ebdcae] border border-[#d4c39e] hover:bg-[#d4c39e] text-[#5c442d] rounded text-xs font-bold transition font-mono uppercase tracking-wider text-center"
                        >
                          Stwórz Kopię Zapasową (ZIP)
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm("Czy chcesz zresetować pamięć podręczną Gemini i wyczyścić całą historię? Te dane zostaną bezpowrotnie usunięte.")) {
                              alert("Pamięć podręczna wyczyszczona.");
                            }
                          }}
                          className="w-full py-2 border border-red-400/50 hover:bg-red-500/10 text-red-700 rounded text-xs font-bold transition font-mono uppercase tracking-wider text-center"
                        >
                          Wyczyść cache narracji
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 5. TAB: PLAYER PROFILE */}
                  {settingsTab === "player" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono">
                        Karta Gracza
                      </h3>
                      
                      <p className="text-xs text-[#5c442d] leading-normal font-sans">
                        Ustawienia tożsamości gracza w silniku wieloosobowym / lokalnym. Wpływa na ton głosu NPC oraz zwroty grzecznościowe w wypowiedziach.
                      </p>

                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[#5c442d] font-bold mb-1">Pseudonim Gracza</label>
                            <input 
                              type="text" 
                              defaultValue="Flager"
                              className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded px-3 py-1.5 focus:outline-none focus:border-[#8b5a2b]"
                            />
                          </div>
                          <div>
                            <label className="block text-[#5c442d] font-bold mb-1">Rola Mistrza Gry</label>
                            <select className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded px-2 py-1.5 focus:outline-none focus:border-[#8b5a2b]">
                              <option>Zawsze Mistrz Gry</option>
                              <option>Współgracz AI</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-[#5c442d] font-bold mb-1">Dodatkowe preferencje Mistrza Gry</label>
                          <textarea 
                            rows={3}
                            placeholder="np. Preferuję powolną, mroczną intrygę w stylu dark fantasy..."
                            className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded p-2.5 focus:outline-none focus:border-[#8b5a2b] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Save Changes inside Center Settings Area */}
                <div className="mt-4 pt-3 border-t border-[#5c4028]/30 flex justify-end gap-3 font-sans">
                  <button 
                    onClick={() => {
                      alert("Ustawienia zostały zapisane i zsynchronizowane z plikiem konfiguracyjnym.");
                      setActiveTab("projects");
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-[#aa7c11] to-[#daa520] hover:from-[#daa520] hover:to-[#ffd700] text-black font-bold text-xs rounded transition uppercase tracking-wider font-mono shadow-md"
                  >
                    ZAPISZ I WYJDŹ
                  </button>
                </div>

              </div>

              {/* Right Sidebar: Shortcuts / Actions Panel */}
              <div className="md:col-span-1 border-l border-[#5c4028]/30 bg-[#140b05] p-5 flex flex-col gap-4">
                <h3 className="text-[10px] font-bold text-[#ffd700] tracking-widest uppercase font-mono border-b border-[#5c4028]/40 pb-2">
                  Zasady Skrótów
                </h3>

                <div className="space-y-3 font-sans text-xs">
                  
                  <div className="p-3 bg-[#1e130b]/60 border border-[#5c4028]/40 rounded text-center space-y-1">
                    <span className="block text-[9px] text-[#a08568] uppercase font-mono">SZYBKI ZAPIS</span>
                    <button 
                      onClick={() => alert("Automatyczny zapis wywołany...")}
                      className="w-full py-1.5 bg-[#8b5a2b]/20 hover:bg-[#8b5a2b]/50 border border-[#8b5a2b]/50 hover:border-[#ffd700]/50 text-[#ffd700] rounded text-[10px] font-bold uppercase transition font-mono tracking-wider"
                    >
                      ALT + [ S ]
                    </button>
                  </div>

                  <div className="p-3 bg-[#1e130b]/60 border border-[#5c4028]/40 rounded text-center space-y-1">
                    <span className="block text-[9px] text-[#a08568] uppercase font-mono">SZYBKI IMPORT</span>
                    <button 
                      onClick={() => alert("Wybierz plik JSON kampanii do wczytania...")}
                      className="w-full py-1.5 bg-[#8b5a2b]/20 hover:bg-[#8b5a2b]/50 border border-[#8b5a2b]/50 hover:border-[#ffd700]/50 text-[#ffd700] rounded text-[10px] font-bold uppercase transition font-mono tracking-wider"
                    >
                      ALT + [ I ]
                    </button>
                  </div>

                  <div className="p-3 bg-[#1e130b]/60 border border-[#5c4028]/40 rounded text-center space-y-1">
                    <span className="block text-[9px] text-[#a08568] uppercase font-mono">KONSOLA DEBUGGOWANIA</span>
                    <button 
                      onClick={() => alert("Konsola deweloperska Gemini włączona. Podgląd logów JSON w tle.")}
                      className="w-full py-1.5 bg-[#8b5a2b]/20 hover:bg-[#8b5a2b]/50 border border-[#8b5a2b]/50 hover:border-[#ffd700]/50 text-[#ffd700] rounded text-[10px] font-bold uppercase transition font-mono tracking-wider"
                    >
                      CTRL + [ ? ]
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* BOTTOM METADATA STATUS BAR */}
        <footer className="bg-[#1e130b]/60 border border-[#5c4028]/40 p-3 rounded flex flex-col md:flex-row items-center justify-between text-[10px] text-[#a08568] font-mono tracking-wider uppercase">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-amber-500" /> Pamięć: 120 GB / 250 GB</span>
            <span className="flex items-center gap-1"><Network className="w-3.5 h-3.5 text-amber-500" /> Sieć: 200 Mbps (Stabilne)</span>
          </div>
          <div className="mt-2 md:mt-0 text-[#ffd700]/70">
            Zapisano ostatnie zmiany: 2 min temu
          </div>
        </footer>

      </div>
    </div>
  );
}
