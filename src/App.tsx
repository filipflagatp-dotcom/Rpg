/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { ChatArea } from './components/ChatArea';
import { Character, Scenario, GmSettings, DiceRoll, Campaign } from './types';
import { 
  FolderOpen, 
  PlusCircle, 
  Settings as SettingsIcon, 
  Globe, 
  ArrowRight,
  Database,
  Save,
  Download,
  HelpCircle,
  HardDrive,
  Network,
  X,
  Compass,
  Cpu,
  User,
  Eye,
  EyeOff
} from 'lucide-react';

import { defaultCampaigns } from './data/campaignsData';

const defaultGmSettings: GmSettings = {
  tone: "cyberpunk",
  length: "short",
  customDirectives: "",
  difficultyLevel: 5
};

export default function App() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // Core navigation state
  const [view, setView] = useState<'dashboard' | 'gameplay' | 'settings'>(() => {
    const params = new URLSearchParams(window.location.search);
    const cId = params.get('campaign');
    if (cId) return 'gameplay';
    return 'dashboard';
  });

  const [activeCampaignId, setActiveCampaignId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('campaign') || 'aethelgard';
  });

  // Load campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem("flager_custom_campaigns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return [...defaultCampaigns, ...parsed];
        }
      } catch (e) {}
    }
    return defaultCampaigns;
  });

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || campaigns[0];

  // Load/save active character, scenarios, activeScenario per campaign
  const [character, setCharacter] = useState<Character>(activeCampaign.defaultCharacter);
  const [scenarios, setScenarios] = useState<Scenario[]>(activeCampaign.scenarios);
  const [activeScenario, setActiveScenario] = useState<Scenario>(activeCampaign.scenarios[0]);

  useEffect(() => {
    const savedChar = localStorage.getItem(`flager_char_${activeCampaignId}`);
    if (savedChar) {
      try { setCharacter(JSON.parse(savedChar)); } catch (e) {}
    } else {
      setCharacter(activeCampaign.defaultCharacter);
    }

    const savedScen = localStorage.getItem(`flager_scenarios_${activeCampaignId}`);
    if (savedScen) {
      try { setScenarios(JSON.parse(savedScen)); } catch (e) {}
    } else {
      setScenarios(activeCampaign.scenarios);
    }

    const savedActive = localStorage.getItem(`flager_active_scen_${activeCampaignId}`);
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        setActiveScenario(parsed);
      } catch (e) {}
    } else {
      setActiveScenario(activeCampaign.scenarios[0]);
    }
  }, [activeCampaignId]);

  useEffect(() => {
    localStorage.setItem(`flager_char_${activeCampaignId}`, JSON.stringify(character));
  }, [character, activeCampaignId]);

  useEffect(() => {
    localStorage.setItem(`flager_scenarios_${activeCampaignId}`, JSON.stringify(scenarios));
  }, [scenarios, activeCampaignId]);

  useEffect(() => {
    localStorage.setItem(`flager_active_scen_${activeCampaignId}`, JSON.stringify(activeScenario));
  }, [activeScenario, activeCampaignId]);

  // Load/save GM Settings per campaign
  const [gmSettings, setGmSettings] = useState<GmSettings>(defaultGmSettings);

  useEffect(() => {
    const saved = localStorage.getItem(`flager_gm_settings_${activeCampaignId}`);
    if (saved) {
      try {
        setGmSettings(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setGmSettings(defaultGmSettings);
  }, [activeCampaignId]);

  useEffect(() => {
    localStorage.setItem(`flager_gm_settings_${activeCampaignId}`, JSON.stringify(gmSettings));
  }, [gmSettings, activeCampaignId]);

  const [quickRoll, setQuickRoll] = useState<DiceRoll | null>(null);

  // Settings Panel State
  const [settingsTab, setSettingsTab] = useState<"general" | "engine" | "ai" | "resources" | "player">("general");
  const [language, setLanguage] = useState("Polski");
  const [scaling, setScaling] = useState(100);
  const [visualStyle, setVisualStyle] = useState("Ciemny");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("GEMINI_API_KEY") || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiModel, setApiModel] = useState("Pro");
  const [rateLimit, setRateLimit] = useState(true);
  const [launchAtStartup, setLaunchAtStartup] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);

  // Sync API key to localStorage
  useEffect(() => {
    localStorage.setItem("GEMINI_API_KEY", apiKey);
  }, [apiKey]);

  // Dashboard creation states
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjSystem, setNewProjSystem] = useState<"dd35" | "cyberpunk" | "custom" | "">("");
  const [showAddProjectForm, setShowAddProjectForm] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    
    const newCampaignId = "custom_" + Date.now();
    const newCampaign: Campaign = {
      id: newCampaignId,
      title: newProjTitle.trim(),
      description: newProjDesc.trim() || "Brak opisu kampanii.",
      rpgSystem: (newProjSystem as any) || "custom",
      systemInstruction: `You are an AI Game Master for a tabletop RPG setting called '${newProjTitle.trim()}'. Respond in Polish. Use markdown.`,
      defaultCharacter: {
        name: "Bohater",
        class: "Awanturnik",
        stats: { sila: 6, zrecznosc: 6, intelekt: 6, charyzma: 6 },
        inventory: "Miecz jednoręczny, skórzana zbroja, worek na łupy.",
        bio: "Śmiały wędrowiec poszukujący bogactwa i sławy."
      },
      scenarios: [
        { title: "Początek Przygody", description: "Twoja opowieść zaczyna się tutaj. Opisz swój pierwszy krok..." }
      ],
      statsConfig: [
        { key: "sila", label: "SIŁA / WALKA" },
        { key: "zrecznosc", label: "ZRĘCZNOŚĆ / SPYT" },
        { key: "intelekt", label: "INTELEKT / WIEDZA" },
        { key: "charyzma", label: "CHARYZMA / GADKA" }
      ],
      dicesConfig: [
        { dice: 4, desc: "Test Charyzmy", statKey: "charyzma" },
        { dice: 6, desc: "Zręczny Unik", statKey: "zrecznosc" },
        { dice: 10, desc: "Siła fizyczna", statKey: "sila" },
        { dice: 12, desc: "Test Rozumu", statKey: "intelekt" }
      ],
      status: "Zapisano"
    };

    const updated = [...campaigns, newCampaign];
    setCampaigns(updated);

    const customOnly = updated.filter(c => c.id.startsWith("custom_"));
    localStorage.setItem("flager_custom_campaigns", JSON.stringify(customOnly));

    setNewProjTitle("");
    setNewProjDesc("");
    setShowAddProjectForm(false);
    
    // Launch newly created campaign in a new tab!
    window.open('/?campaign=' + newCampaignId, '_blank');
  };

  const handleAddScenario = (newScen: Scenario) => {
    const updated = [...scenarios, { ...newScen, custom: true }];
    setScenarios(updated);
    setActiveScenario(newScen);
  };

  const handleRemoveScenario = (title: string) => {
    const updated = scenarios.filter(s => s.title !== title);
    setScenarios(updated);
    
    if (activeScenario.title === title) {
      if (updated.length > 0) {
        setActiveScenario(updated[0]);
      } else {
        setActiveScenario(activeCampaign.scenarios[0]);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setLeftOpen(false);
        setRightOpen(false);
      } else {
        setLeftOpen(true);
        setRightOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="overflow-y-auto relative min-h-screen flex flex-col antialiased selection:bg-[#d4a373] selection:text-black bg-[#0f0a06] text-[#e0cfb3] font-serif">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#24170e]/40 via-[#0a0502]/90 to-[#030100] pointer-events-none z-0"></div>

      <Header 
        toggleLeft={() => setLeftOpen(!leftOpen)} 
        toggleRight={() => setRightOpen(!rightOpen)} 
        view={view}
        setView={setView}
        campaignTitle={view === 'gameplay' ? activeCampaign.title : undefined}
      />

      {/* -------------------- VIEW 1: DASHBOARD (MOJE PROJEKTY) -------------------- */}
      {view === 'dashboard' && (
        <main className="relative z-10 flex-grow max-w-6xl w-full mx-auto flex flex-col gap-6 p-4 md:p-6">
          <header className="flex flex-col md:flex-row items-center justify-between border-b-2 border-[#5c4028]/40 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37] via-[#aa7c11] to-[#604207] rounded-full p-0.5 shadow-lg flex items-center justify-center relative group">
                <div className="absolute -inset-1 bg-[#ffd700]/20 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000"></div>
                <div className="w-full h-full bg-[#1e130b] rounded-full flex items-center justify-center">
                  <span className="text-xl text-[#ffd700] font-bold">⚔️</span>
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

          <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-[#5c4028]/20 pb-4">
            <button 
              onClick={() => { setShowAddProjectForm(false); }}
              className={`py-3 px-4 rounded border font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${!showAddProjectForm ? "border-[#ffd700]/60 bg-[#5c4028]/35 text-[#ffe680] shadow-[0_0_15px_rgba(218,165,32,0.15)]" : "border-[#5c4028]/30 bg-[#1e130b]/60 text-[#a08568] hover:text-[#ffd700] hover:border-[#ffd700]/30"}`}
            >
              <FolderOpen className="w-4 h-4" /> [MOJE PROJEKTY]
            </button>
            
            <button 
              onClick={() => { setShowAddProjectForm(true); }}
              className={`py-3 px-4 rounded border font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${showAddProjectForm ? "border-[#ffd700]/60 bg-[#5c4028]/35 text-[#ffe680] shadow-[0_0_15px_rgba(218,165,32,0.15)]" : "border-[#5c4028]/30 bg-[#1e130b]/60 text-[#a08568] hover:text-[#ffd700] hover:border-[#ffd700]/30"}`}
            >
              <PlusCircle className="w-4 h-4" /> [STWÓRZ NOWY]
            </button>

            <button 
              onClick={() => setView('settings')}
              className="py-3 px-4 rounded border border-[#5c4028]/30 bg-[#1e130b]/60 text-[#a08568] hover:text-[#ffd700] hover:border-[#ffd700]/30 transition-all duration-200 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              <SettingsIcon className="w-4 h-4" /> [USTAWIENIA SILNIKA]
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative rounded-lg overflow-hidden border-2 border-[#5c4028]/70 shadow-2xl h-64 md:h-72">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1c1109] via-[#3a2211] to-[#1c1109] flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-3xl mb-2 animate-bounce">🔥</span>
                  <span className="fantasy-title text-2xl text-[#ffd700]">Epickie Wyprawy Czekają</span>
                  <span className="text-xs text-[#a08568] mt-1 font-mono">
                    {apiKey ? "Klucz API załadowany pomyślnie" : "Brak klucza API - kliknij Ustawienia Silnika, aby wgrać klucz"}
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a06] via-transparent to-transparent"></div>
                
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-[10px] text-[#ffd700] tracking-widest font-mono uppercase font-bold">Kampanie RPG Sandbox</span>
                  <h2 className="text-xl md:text-2xl font-bold font-serif text-[#fcf6e6] fantasy-title mt-0.5">Wybierz przygodę i ruszaj w nieznane</h2>
                  <p className="text-xs text-[#c5a880]/90 leading-relaxed font-sans max-w-lg mt-1.5 hidden sm:block">
                    System dynamicznie integruje opisy z AI na podstawie twoich statystyk i rzutów kośćmi. Ustaw parametry, wybierz scenariusz i poprowadź swoją postać przez nieprzewidywalną przygodę.
                  </p>
                </div>
              </div>

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
                        placeholder="np. Saga o Kryształowym Szczycie lub Cyberpunk Warszawa 2031"
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
                    <div>
                      <label className="text-[11px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">System Mechaniki</label>
                      <select
                        value={newProjSystem}
                        onChange={(e) => setNewProjSystem(e.target.value as any)}
                        className="w-full bg-[#170e08] border border-[#5c4028]/50 hover:border-[#ffd700]/30 rounded px-3 py-2 text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]"
                      >
                        <option value="custom">Autorski (Generic)</option>
                        <option value="dd35">D&D 3.5</option>
                        <option value="cyberpunk">Cyberpunk RED</option>
                      </select>
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
                    Dostępne Projekty RPG ({campaigns.length})
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaigns.map((camp) => (
                      <div 
                        key={camp.id}
                        className="fantasy-wood-panel p-5 rounded-lg border-2 border-[#5c4028]/60 hover:border-[#ffd700]/40 transition duration-300 flex flex-col justify-between group relative overflow-hidden text-left"
                      >
                        <div className="absolute top-0 right-0 bg-[#5c4028]/40 border-l border-b border-[#5c4028]/60 text-[9px] text-[#ffd700] uppercase px-2 py-0.5 font-mono tracking-wider font-bold">
                          {camp.status}
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-bold text-base text-[#ffd700] group-hover:text-[#ffe680] transition fantasy-title">
                            {camp.title}
                          </h4>
                          <p className="text-xs text-[#c5a880]/80 leading-relaxed font-sans line-clamp-3">
                            {camp.description}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            window.open('/?campaign=' + camp.id, '_blank');
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

            <div className="space-y-6">
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

              <div className="fantasy-parchment p-5 rounded-lg border border-[#c5a880]/40 text-[#4c3c2b] space-y-3 shadow-lg text-left">
                <h4 className="font-bold text-xs uppercase tracking-widest font-mono border-b border-[#c5a880]/30 pb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#8b5a2b]" /> KRONIKA SILNIKA
                </h4>
                <p className="text-xs leading-relaxed font-serif">
                  Silnik Flager RPG integruje zaawansowane modele językowe Gemini z klasycznymi mechanikami sandboxowych RPG. Narzędzie automatycznie przelicza rzuty kośćmi i cechy pod dynamiczne scenariusze.
                </p>
                <div className="text-[10px] bg-[#ebdcae]/50 border border-[#d4c39e] p-2 rounded font-mono text-[#5c442d] leading-normal">
                  <strong>TIP:</strong> Uzupełnij swój klucz API w ustawieniach silnika, aby aktywować pełną moc narracji w kampaniach.
                </div>
              </div>
            </div>
          </div>

          <footer className="bg-[#1e130b]/60 border border-[#5c4028]/40 p-3 rounded flex flex-col md:flex-row items-center justify-between text-[10px] text-[#a08568] font-mono tracking-wider uppercase mt-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-amber-500" /> PAMIĘĆ: 120 GB / 250 GB</span>
              <span className="flex items-center gap-1"><Network className="w-3.5 h-3.5 text-amber-500" /> SIEĆ: 200 MBPS (STABILNE)</span>
            </div>
            <div className="mt-2 md:mt-0 text-[#ffd700]/70">
              ZAPISANO OSTATNIE ZMIANY: 2 MIN TEMU
            </div>
          </footer>
        </main>
      )}

      {/* -------------------- VIEW 2: GAMEPLAY (CHAT & SIDEBARS) -------------------- */}
      {view === 'gameplay' && (
        <main className="flex-1 flex overflow-hidden h-[calc(100vh-65px)] relative z-10">
          <SidebarLeft 
            isOpen={leftOpen} 
            character={character} 
            setCharacter={setCharacter} 
            scenario={activeScenario} 
            setScenario={setActiveScenario} 
            scenarios={scenarios}
            onAddScenario={handleAddScenario}
            onRemoveScenario={handleRemoveScenario}
            campaign={activeCampaign}
          />
          
          <ChatArea 
            scenario={activeScenario} 
            character={character} 
            gmSettings={gmSettings}
            quickRoll={quickRoll} 
            onClearRoll={() => setQuickRoll(null)} 
            campaign={activeCampaign}
          />
          
          <SidebarRight 
            isOpen={rightOpen} 
            gmSettings={gmSettings}
            setGmSettings={setGmSettings}
            onRollSelect={(roll) => setQuickRoll(roll)}
            character={character}
            campaign={activeCampaign}
          />
        </main>
      )}

      {/* -------------------- VIEW 3: SETTINGS -------------------- */}
      {view === 'settings' && (
        <main className="relative z-10 flex-grow max-w-4xl w-full mx-auto p-4 md:p-6">
          <div className="fantasy-wood-panel rounded-lg border-4 border-[#1a0f07] shadow-2xl relative overflow-hidden flex flex-col">
            <div className="bg-[#1e130b] border-b-2 border-[#5c4028] px-6 py-4 flex items-center justify-between relative">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h2 className="text-lg md:text-xl font-bold tracking-wider fantasy-gold-text fantasy-title uppercase">
                  USTAWIENIA I OPCJE SILNIKA
                </h2>
              </div>
              <button 
                onClick={() => setView('dashboard')}
                className="p-1.5 rounded bg-[#5c4028]/20 hover:bg-[#5c4028]/60 border border-[#5c4028]/40 text-[#ffd700] transition hover:scale-105"
                title="Powrót"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 min-h-[460px] bg-[#170e08]/90">
              <div className="md:col-span-1 border-r border-[#5c4028]/30 bg-[#140b05] p-3 flex flex-col gap-1.5 text-left">
                {[
                  { id: "general", label: "OGÓLNE" },
                  { id: "engine", label: "SILNIK ROZGRYWKI" },
                  { id: "ai", label: "SZTUCZNA INTELIGENCJA" },
                  { id: "resources", label: "ZASOBY I EXPORT" },
                  { id: "player", label: "PROFIL GRACZA" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id as any)}
                    className={`w-full py-3 px-4 rounded text-left text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center gap-2.5 ${settingsTab === item.id ? "bg-[#5c4028]/40 border-l-4 border-[#ffd700] text-[#ffd700] font-bold" : "text-[#a08568] hover:text-[#ffd700] hover:bg-[#1e130b]/30"}`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="md:col-span-2 p-5 md:p-6 bg-[#0f0a06] flex flex-col justify-between text-left">
                <div className="fantasy-parchment p-5 rounded-lg border border-[#c5a880]/40 text-[#3d2e1f] font-serif shadow-inner space-y-5 flex-grow overflow-y-auto max-h-[400px]">
                  
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
                          <label className="block text-[#5c442d] font-bold mb-1">Klucz API Gemini (zapisywany lokalnie)</label>
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
                              <option value="Pro">Gemini 2.5 Pro</option>
                              <option value="Flash">Gemini 2.5 Flash</option>
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
                    </div>
                  )}

                  {settingsTab === "engine" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono">
                        System Gry & Ustawienia
                      </h3>
                      <p className="text-xs text-[#5c442d]">Wszystkie mechaniki lochów i rzutów kośćmi są dynamicznie synchronizowane z aktywną kampanią.</p>
                    </div>
                  )}

                  {settingsTab === "ai" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono">
                        Model i Ustawienia AI
                      </h3>
                      <p className="text-xs text-[#5c442d]">Głównym motorem napędowym gry jest model Gemini 2.5 Flash, zoptymalizowany pod kątem szybkich, immersyjnych dialogów z Mistrzem Gry.</p>
                    </div>
                  )}

                  {settingsTab === "resources" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono">
                        Zarządzanie Danymi
                      </h3>
                      <div className="space-y-3 pt-2">
                        <button 
                          onClick={() => alert("Notatki z sesji wyeksportowane.")}
                          className="w-full py-2 bg-[#ebdcae] border border-[#d4c39e] hover:bg-[#d4c39e] text-[#5c442d] rounded text-xs font-bold transition font-mono uppercase tracking-wider text-center"
                        >
                          Eksportuj kronikę do Markdown
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm("Czy chcesz zresetować pamięć podręczną i wyczyścić całą historię? Te dane zostaną bezpowrotnie usunięte.")) {
                              localStorage.clear();
                              alert("Baza danych wyczyszczona. Aplikacja zostanie przeładowana.");
                              window.location.href = "/";
                            }
                          }}
                          className="w-full py-2 border border-red-400/50 hover:bg-red-500/10 text-red-700 rounded text-xs font-bold transition font-mono uppercase tracking-wider text-center"
                        >
                          ZRESETUJ CAŁĄ BAZĘ DANYCH (Wyczyść LocalStorage)
                        </button>
                      </div>
                    </div>
                  )}

                  {settingsTab === "player" && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-sm text-[#5c3e21] border-b border-[#c5a880]/50 pb-1 uppercase tracking-widest font-mono">
                        Karta Gracza
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[#5c442d] font-bold mb-1">Pseudonim Gracza</label>
                          <input 
                            type="text" 
                            defaultValue="Flager"
                            className="w-full bg-[#fcf6e6] border border-[#d4c39e] rounded px-3 py-1.5 focus:outline-none focus:border-[#8b5a2b]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                <div className="mt-4 pt-3 border-t border-[#5c4028]/30 flex justify-end gap-3 font-sans">
                  <button 
                    onClick={() => {
                      alert("Ustawienia zostały zapisane.");
                      setView('dashboard');
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-[#aa7c11] to-[#daa520] hover:from-[#daa520] hover:to-[#ffd700] text-black font-bold text-xs rounded transition uppercase tracking-wider font-mono shadow-md"
                  >
                    ZAPISZ I WYJDŹ
                  </button>
                </div>
              </div>

              <div className="md:col-span-1 border-l border-[#5c4028]/30 bg-[#140b05] p-5 flex flex-col gap-4 text-left">
                <h3 className="text-[10px] font-bold text-[#ffd700] tracking-widest uppercase font-mono border-b border-[#5c4028]/40 pb-2">
                  System Skrótów
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
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
