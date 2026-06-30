import { useState } from "react";
import { PlusCircle, RotateCcw, Trash2, X, ShieldAlert, BookOpen, Backpack, Plus, Minus } from "lucide-react";
import { Character, Scenario, Campaign } from "../types";

// Inventory item parsed from inventory string
interface InvItem {
  id: number;
  name: string;
  emoji: string;
  qty: number;
  desc: string;
}

function guessEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('miecz') || n.includes('sztylet') || n.includes('nóż') || n.includes('dagger') || n.includes('sword') || n.includes('giwera') || n.includes('pistolet')) return '🗡️';
  if (n.includes('topór') || n.includes('topor') || n.includes('axe')) return '🪓';
  if (n.includes('łuk') || n.includes('kusza') || n.includes('bow')) return '🏹';
  if (n.includes('tarcza') || n.includes('shield')) return '🛡️';
  if (n.includes('zbroja') || n.includes('pancerz') || n.includes('kolczuga') || n.includes('armor')) return '⚔️';
  if (n.includes('hełm') || n.includes('helm') || n.includes('kaptur')) return '🪖';
  if (n.includes('eliksir') || n.includes('mikstura') || n.includes('potion') || n.includes('potion')) return '🧪';
  if (n.includes('zwój') || n.includes('scroll') || n.includes('pergamin')) return '📜';
  if (n.includes('księga') || n.includes('book') || n.includes('podręcznik')) return '📖';
  if (n.includes('różdżka') || n.includes('wand') || n.includes('staff') || n.includes('kostur') || n.includes('laska')) return '🪄';
  if (n.includes('pierścień') || n.includes('ring') || n.includes('amulet')) return '💍';
  if (n.includes('złoto') || n.includes('sz') || n.includes('eb') || n.includes('coin') || n.includes('moneta')) return '🪙';
  if (n.includes('klucz') || n.includes('key')) return '🗝️';
  if (n.includes('latarnia') || n.includes('pochodnia') || n.includes('torch')) return '🕯️';
  if (n.includes('lina') || n.includes('rope')) return '🪢';
  if (n.includes('kabel') || n.includes('moduł') || n.includes('chip')) return '🔌';
  if (n.includes('jedzenie') || n.includes('prowiant') || n.includes('bigos') || n.includes('nuggets') || n.includes('żywność')) return '🍖';
  if (n.includes('fajka') || n.includes('e-fajka')) return '🚬';
  if (n.includes('skalpel') || n.includes('narzędzie') || n.includes('tool')) return '🔧';
  return '📦';
}

function parseInventory(inv: string): InvItem[] {
  return inv
    .split(/[,;]/)  
    .map((s, i) => s.trim())
    .filter(s => s.length > 2)
    .map((raw, i) => {
      const qtyMatch = raw.match(/(\d+)x\s*(.+)/);
      const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
      const name = qtyMatch ? qtyMatch[2].trim() : raw;
      return { id: i, name, emoji: guessEmoji(name), qty, desc: raw };
    });
}

interface SidebarLeftProps {
  isOpen: boolean;
  character: Character;
  setCharacter: (char: Character) => void;
  scenario: Scenario;
  setScenario: (scen: Scenario) => void;
  scenarios: Scenario[];
  onAddScenario: (scen: Scenario) => void;
  onRemoveScenario: (title: string) => void;
  campaign: Campaign;
}

export function SidebarLeft({ 
  isOpen, 
  character, 
  setCharacter, 
  scenario, 
  setScenario,
  scenarios,
  onAddScenario,
  onRemoveScenario,
  campaign
}: SidebarLeftProps) {
  const [tab, setTab] = useState<"scenarios" | "character" | "inventory" | "resources">("scenarios");
  const [hoveredItem, setHoveredItem] = useState<InvItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSystem, setNewSystem] = useState<'dd35' | 'cyberpunk' | 'custom' | ''>('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [mapPreview, setMapPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  // Znajdź czy w kampanii istnieje już przypisany system (aby nie łączyć dd3.5 i cyberpunka)
  const existingSystem = campaign.rpgSystem || scenarios.find(s => s.rpgSystem)?.rpgSystem;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const handleSubmitScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const documents = [];
    for (const file of newFiles) {
      const text = await file.text();
      documents.push({
        title: file.name,
        filename: file.name,
        content: text
      });
    }

    onAddScenario({
      title: newTitle.trim(),
      description: newDesc.trim() || "Własny scenariusz fabularny.",
      rpgSystem: (existingSystem as any) || newSystem || 'custom',
      documents: documents.length > 0 ? documents : undefined
    });
    
    setNewTitle("");
    setNewDesc("");
    setNewSystem("");
    setNewFiles([]);
    setShowAddForm(false);
  };

  const handleResetCharacter = () => {
    if (window.confirm(`Czy na pewno chcesz przywrócić domyślne dane bohatera dla kampanii "${campaign.title}"? Twoje obecne zmiany zostaną utracone.`)) {
      setCharacter(campaign.defaultCharacter);
    }
  };

  const resourceGroups = {
    rulebook: { label: "Podręczniki i Zasady", icon: "📖", list: campaign.resources?.filter(r => r.type === "rulebook") || [] },
    dlc: { label: "Dodatki (DLC)", icon: "⚙️", list: campaign.resources?.filter(r => r.type === "dlc") || [] },
    map: { label: "Mapy Taktyczne", icon: "🗺️", list: campaign.resources?.filter(r => r.type === "map") || [] },
    other: { label: "Inne materiały", icon: "📜", list: campaign.resources?.filter(r => r.type === "other") || [] }
  };

  const hasAnyResources = campaign.resources && campaign.resources.length > 0;

  return (
    <aside className="absolute md:relative left-0 top-0 w-full md:w-80 h-full flex-shrink-0 border-r-4 border-[#1a0f07] bg-gradient-to-b from-[#2c1e13] to-[#1e130b] flex flex-col transition-all duration-300 ease-in-out z-30 overflow-y-auto shadow-2xl">
      <div className="grid grid-cols-4 border-b-2 border-[#5c4028]/60 bg-[#140b05]">
        <button onClick={() => setTab("scenarios")}
          className={`py-2.5 text-[9px] font-bold uppercase tracking-wider transition font-mono ${tab === "scenarios" ? "text-[#ffd700] border-b-2 border-[#ffd700] bg-[#5c4028]/25" : "text-[#a08568] hover:text-[#ffd700]"}`}
        >Przygoda</button>
        <button onClick={() => setTab("character")}
          className={`py-2.5 text-[9px] font-bold uppercase tracking-wider transition font-mono ${tab === "character" ? "text-[#ffd700] border-b-2 border-[#ffd700] bg-[#5c4028]/25" : "text-[#a08568] hover:text-[#ffd700]"}`}
        >Postać</button>
        <button onClick={() => setTab("inventory")}
          className={`py-2.5 text-[9px] font-bold uppercase tracking-wider transition font-mono flex items-center justify-center gap-1 ${tab === "inventory" ? "text-[#ffd700] border-b-2 border-[#ffd700] bg-[#5c4028]/25" : "text-[#a08568] hover:text-[#ffd700]"}`}
        >🎒 Ekwip.</button>
        <button onClick={() => setTab("resources")}
          className={`py-2.5 text-[9px] font-bold uppercase tracking-wider transition font-mono ${tab === "resources" ? "text-[#ffd700] border-b-2 border-[#ffd700] bg-[#5c4028]/25" : "text-[#a08568] hover:text-[#ffd700]"}`}
        >Bib.</button>
      </div>

      {tab === "scenarios" && (
        <div className="p-4 space-y-4 flex-1 flex flex-col text-left">
          <div className="flex items-center justify-between border-b border-[#5c4028]/40 pb-2">
            <span className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider font-mono">Baza scenariuszy</span>
            <span className="text-[9px] bg-[#5c4028]/40 text-[#c5a880] px-2 py-0.5 rounded border border-[#5c4028]/60 font-mono">RPG MODS</span>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {scenarios.map(s => (
               <div key={s.title} className="flex items-start gap-2 group">
                 <button 
                  onClick={() => setScenario(s)}
                  className={`flex-1 text-left p-3 rounded border text-xs transition-all duration-200 ${scenario.title === s.title ? "border-[#ffd700]/70 bg-[#5c4028]/35 text-[#ffe680] shadow-[0_0_12px_rgba(218,165,32,0.15)]" : "border-[#5c4028]/30 bg-[#1e130b]/40 text-[#c5a880] hover:border-[#ffd700]/30 hover:text-[#ffd700]"}`}
                 >
                   <div className="font-bold flex items-center justify-between">
                     <span className="fantasy-title text-xs tracking-wider">{s.title}</span>
                     {s.custom && (
                       <span className="text-[8px] text-[#ffd700] font-mono border border-[#ffd700]/40 px-1.5 py-0.2 rounded bg-[#5c4028]/20">KUSTOM</span>
                     )}
                   </div>
                   <div className="text-[10px] mt-1.5 text-[#c5a880]/80 leading-normal line-clamp-3 font-sans">
                     {s.description}
                   </div>
                   {(s.rpgSystem || (s.documents && s.documents.length > 0)) && (
                     <div className="mt-2 flex items-center gap-2 flex-wrap">
                       {s.rpgSystem && (
                         <span className="text-[8px] px-1.5 py-0.5 rounded border border-[#5c4028]/40 bg-[#1e130b] text-[#ffd700]/80 uppercase font-mono tracking-wider">
                           {s.rpgSystem === 'dd35' ? 'D&D 3.5' : s.rpgSystem === 'cyberpunk' ? 'Cyberpunk' : 'Autorski'}
                         </span>
                       )}
                       {s.documents && s.documents.length > 0 && (
                         <span className="text-[8px] px-1.5 py-0.5 rounded border border-[#5c4028]/40 bg-[#1e130b] text-[#c5a880] font-mono flex items-center gap-1">
                           📄 {s.documents.length} plik(ów)
                         </span>
                       )}
                     </div>
                   )}
                 </button>
                 {s.custom && (
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       onRemoveScenario(s.title);
                     }}
                     className="mt-3 p-1.5 rounded border border-red-900/60 text-red-400 hover:text-red-300 hover:bg-red-950/20 transition flex-shrink-0"
                     title="Usuń scenariusz"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                 )}
               </div>
            ))}
          </div>

          {showAddForm ? (
            <form onSubmit={handleSubmitScenario} className="border border-[#5c4028]/60 bg-[#170e08] p-3 rounded space-y-3 mt-4">
              <div className="flex items-center justify-between border-b border-[#5c4028]/40 pb-1.5">
                <span className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider font-mono">Nowa linia wątku</span>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="text-[#a08568] hover:text-[#ffd700] p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-[#a08568] uppercase font-bold tracking-widest font-mono">Tytuł Przygody</label>
                <input 
                  type="text" 
                  required
                  placeholder="np. Brama Piekieł"
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2.5 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] font-sans" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-[#a08568] uppercase font-bold tracking-widest font-mono">Opis i Zadanie</label>
                <textarea 
                  rows={3} 
                  required
                  placeholder="Opisz lokację wyjściową i cel dla gracza..."
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded p-2 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] resize-none font-sans" 
                />
              </div>

              {existingSystem ? (
                <div className="text-[10px] text-[#a08568] font-mono border border-[#5c4028]/40 p-1.5 rounded bg-[#0f0a06]/50">
                  <span className="font-bold text-[#c5a880]">System:</span> {existingSystem === 'dd35' ? 'D&D 3.5' : existingSystem === 'cyberpunk' ? 'Cyberpunk RED' : 'Autorski'} (Zablokowany dla kampanii)
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[9px] text-[#a08568] uppercase font-bold tracking-widest font-mono">System Mechaniki</label>
                  <select
                    value={newSystem}
                    onChange={(e) => setNewSystem(e.target.value as any)}
                    className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2.5 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] font-sans"
                  >
                    <option value="">Wybierz system...</option>
                    <option value="dd35">D&D 3.5</option>
                    <option value="cyberpunk">Cyberpunk RED</option>
                    <option value="custom">Autorski (Generic)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] text-[#a08568] uppercase font-bold tracking-widest font-mono">Dokumenty TXT (Opcjonalnie)</label>
                <input 
                  type="file" 
                  accept=".txt"
                  multiple
                  onChange={handleFileChange}
                  className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded p-1 text-[10px] text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] font-sans
                    file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-[#5c4028] file:text-[#ffd700] hover:file:bg-[#5c4028]/80 cursor-pointer" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-1.5 bg-gradient-to-r from-[#aa7c11] to-[#daa520] hover:from-[#daa520] hover:to-[#ffd700] text-black font-bold text-xs rounded transition uppercase tracking-wider font-mono shadow-md"
              >
                Inicjuj Scenariusz
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setShowAddForm(true)}
              className="w-full py-2 border border-dashed border-[#5c4028]/60 hover:border-[#ffd700]/60 text-xs text-[#c5a880] hover:text-[#ffd700] bg-[#5c4028]/5 hover:bg-[#5c4028]/15 rounded transition flex items-center justify-center gap-1.5 mt-4 font-mono uppercase tracking-wider"
            >
              <PlusCircle className="w-3.5 h-3.5" /> [DODAJ SCENARIUSZ]
            </button>
          )}
        </div>
      )}

      {tab === "character" && (
        <div className="p-4 space-y-4 flex-1 flex flex-col text-left">
          <div className="flex items-center justify-between border-b border-[#5c4028]/40 pb-2">
            <span className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider font-mono">Karta Bohatera</span>
            <button 
              onClick={handleResetCharacter} 
              className="text-[9px] text-red-400 hover:text-red-300 transition flex items-center gap-1 font-mono uppercase tracking-wider"
            >
              <RotateCcw className="w-3 h-3" /> Resetuj
            </button>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div>
              <label className="text-[9px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Miano Bohatera</label>
              <input 
                type="text" 
                value={character.name} 
                onChange={(e) => setCharacter({...character, name: e.target.value})}
                className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2.5 py-1.5 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" 
              />
            </div>
            <div>
              <label className="text-[9px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Klasa / Archetyp</label>
              <input 
                type="text" 
                value={character.class} 
                onChange={(e) => setCharacter({...character, class: e.target.value})}
                className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2.5 py-1.5 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" 
              />
            </div>

            {((scenario.rpgSystem || campaign.rpgSystem) === 'dd35') && (
              <div className="space-y-2 mt-2 border-t border-[#5c4028]/20 pt-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Poziom</label>
                    <input type="number" min={1} value={character.level || 1} onChange={(e) => setCharacter({...character, level: parseInt(e.target.value)||1})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                  </div>
                  <div>
                    <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">PŻ (Akt/Max)</label>
                    <div className="flex gap-1">
                      <input type="number" value={character.hpCurrent || 10} onChange={(e) => setCharacter({...character, hpCurrent: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-1 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                      <span className="text-[#a08568] py-1">/</span>
                      <input type="number" value={character.hpMax || 10} onChange={(e) => setCharacter({...character, hpMax: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-1 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Rasa</label>
                    <input type="text" value={character.race || ""} onChange={(e) => setCharacter({...character, race: e.target.value})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                  </div>
                </div>
                <div>
                  <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Klasa Pancerza (10 + Armor + Tarcza + Zr + ...)</label>
                  <div className="flex gap-1">
                    <span className="text-[#a08568] py-1 text-xs">10 +</span>
                    <input type="number" title="Armor" value={character.acArmor || 0} onChange={(e) => setCharacter({...character, acArmor: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-1 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                    <span className="text-[#a08568] py-1">+</span>
                    <input type="number" title="Tarcza" value={character.acShield || 0} onChange={(e) => setCharacter({...character, acShield: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-1 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                    <span className="text-[#a08568] py-1">+</span>
                    <input type="number" title="Inne" value={character.acMisc || 0} onChange={(e) => setCharacter({...character, acMisc: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-1 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Wytrwałość</label>
                    <input type="number" value={character.savesBase?.fort || 0} onChange={(e) => setCharacter({...character, savesBase: {...(character.savesBase || {fort:0,reflex:0,will:0}), fort: parseInt(e.target.value)||0}})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                  </div>
                  <div>
                    <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Refleks</label>
                    <input type="number" value={character.savesBase?.reflex || 0} onChange={(e) => setCharacter({...character, savesBase: {...(character.savesBase || {fort:0,reflex:0,will:0}), reflex: parseInt(e.target.value)||0}})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                  </div>
                  <div>
                    <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Wola</label>
                    <input type="number" value={character.savesBase?.will || 0} onChange={(e) => setCharacter({...character, savesBase: {...(character.savesBase || {fort:0,reflex:0,will:0}), will: parseInt(e.target.value)||0}})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                  </div>
                </div>
                <div>
                  <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Umiejętności (np. Akrobatyka +5, Wspinaczka +2)</label>
                  <textarea 
                    rows={2} 
                    value={(character as any).skillsText || ""}
                    onChange={(e) => setCharacter({...character, skillsText: e.target.value} as any)}
                    className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded p-2 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] resize-none font-sans" 
                  />
                </div>
              </div>
            )}

            {((scenario.rpgSystem || campaign.rpgSystem) === 'cyberpunk') && (
              <div className="space-y-2 mt-2 border-t border-[#5c4028]/20 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">HP (Akt/Max)</label>
                    <div className="flex gap-1">
                      <input type="number" value={character.hpCurrent || 30} onChange={(e) => setCharacter({...character, hpCurrent: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-1 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                      <span className="text-[#a08568] py-1">/</span>
                      <input type="number" value={character.hpMax || 30} onChange={(e) => setCharacter({...character, hpMax: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-1 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Ludzkość (Akt/Max)</label>
                    <div className="flex gap-1">
                      <input type="number" value={character.humanityCurrent || 50} onChange={(e) => setCharacter({...character, humanityCurrent: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-1 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                      <span className="text-[#a08568] py-1">/</span>
                      <input type="number" value={character.humanityMax || 50} onChange={(e) => setCharacter({...character, humanityMax: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-1 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">SP (Głowa)</label>
                    <input type="number" value={character.armorHead || 0} onChange={(e) => setCharacter({...character, armorHead: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                  </div>
                  <div>
                    <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">SP (Korpus)</label>
                    <input type="number" value={character.armorBody || 0} onChange={(e) => setCharacter({...character, armorBody: parseInt(e.target.value)||0})} className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2 py-1 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]" />
                  </div>
                </div>
                <div>
                  <label className="text-[8px] text-[#a08568] uppercase font-bold tracking-widest font-mono block mb-1">Cyberware (Wszczepy)</label>
                  <textarea 
                    rows={2} 
                    value={character.cyberware || ""}
                    onChange={(e) => setCharacter({...character, cyberware: e.target.value})}
                    className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded p-2 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] resize-none font-sans" 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider font-mono border-b border-[#5c4028]/20 pb-1">
              Atrybuty & Współczynniki
            </h3>
            
            <div className="space-y-2.5">
              {campaign.statsConfig.map(stat => {
                const val = character.stats[stat.key] || (campaign.rpgSystem === 'dd35' ? 10 : 5);
                const isDD35 = campaign.rpgSystem === 'dd35';
                const mod35 = Math.floor((val - 10) / 2);
                const modLabel = isDD35
                  ? `${val} (${mod35 >= 0 ? '+' : ''}${mod35})`
                  : `${val} / 10`;
                return (
                  <div key={stat.key}>
                    <div className="flex justify-between text-[10px] text-[#c5a880] mb-0.5 font-mono">
                      <span className="font-bold">{stat.label}</span>
                      <span className="text-[#ffd700] font-bold">{modLabel}</span>
                    </div>
                    <input
                      type="range"
                      min={isDD35 ? 3 : 1}
                      max={isDD35 ? 20 : 10}
                      value={val}
                      onChange={(e) => setCharacter({
                        ...character,
                        stats: { ...character.stats, [stat.key]: parseInt(e.target.value) }
                      })}
                      className="w-full accent-[#daa520] bg-[#0f0a06] border border-[#5c4028]/20 cursor-pointer h-1 rounded"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 font-sans text-xs">
            <label className="text-[9px] text-[#a08568] uppercase font-bold tracking-widest font-mono block">Ekwipunek i Złoto</label>
            <textarea 
              rows={3} 
              value={character.inventory}
              onChange={(e) => setCharacter({...character, inventory: e.target.value})}
              className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded p-2 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] resize-none font-sans" 
            />
          </div>

          <div className="space-y-1.5 font-sans text-xs flex-1">
            <label className="text-[9px] text-[#a08568] uppercase font-bold tracking-widest font-mono block">Krótki Życiorys</label>
            <textarea 
              rows={3} 
              value={character.bio}
              onChange={(e) => setCharacter({...character, bio: e.target.value})}
              className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded p-2 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] resize-none font-sans" 
            />
          </div>
        </div>
      )}

      {tab === "inventory" && (() => {
        const items = parseInventory(character.inventory || "");
        const isDD35 = campaign.rpgSystem === "dd35";
        const isCyberpunk = campaign.rpgSystem === "cyberpunk";

        const dd35Slots = [
          { key: "helmet",  label: "Hełm",    emoji: "🪖", col: 2, row: 1 },
          { key: "amulet",  label: "Amulet",  emoji: "📿", col: 3, row: 1 },
          { key: "weapon",  label: "Broń",    emoji: "🗡️", col: 1, row: 2 },
          { key: "armor",   label: "Zbroja",  emoji: "🧥", col: 2, row: 2 },
          { key: "shield",  label: "Tarcza",  emoji: "🛡️", col: 3, row: 2 },
          { key: "gloves",  label: "Rękawice",emoji: "🧤", col: 1, row: 3 },
          { key: "belt",    label: "Pas",     emoji: "📦", col: 2, row: 3 },
          { key: "ranged",  label: "Dystans", emoji: "🏹", col: 3, row: 3 },
          { key: "ring1",   label: "Pierść.1",emoji: "💍", col: 1, row: 4 },
          { key: "boots",   label: "Buty",    emoji: "👢", col: 2, row: 4 },
          { key: "ring2",   label: "Pierść.2",emoji: "💍", col: 3, row: 4 },
        ];
        const cpSlots = [
          { key: "headArmor", label: "SP Głowa",  emoji: "🪖", col: 2, row: 1 },
          { key: "bodyArmor", label: "SP Korpus",  emoji: "🧥", col: 2, row: 2 },
          { key: "weapon1",   label: "Broń 1",    emoji: "🔫", col: 1, row: 2 },
          { key: "weapon2",   label: "Broń 2",    emoji: "🗡️", col: 3, row: 2 },
          { key: "cyberL",    label: "Cyber L",   emoji: "🦾", col: 1, row: 3 },
          { key: "cyberR",    label: "Cyber R",   emoji: "🦾", col: 3, row: 3 },
          { key: "interface", label: "Interfejs", emoji: "🔌", col: 2, row: 3 },
          { key: "gear1",     label: "Gear 1",    emoji: "📦", col: 1, row: 4 },
          { key: "gear2",     label: "Gear 2",    emoji: "📦", col: 3, row: 4 },
        ];
        const slots = isCyberpunk ? cpSlots : dd35Slots;

        const equippedSlots: Record<string, string> = (character as any).equippedSlots || {};
        const setSlot = (key: string, val: string) => {
          setCharacter({ ...character, equippedSlots: { ...equippedSlots, [key]: val } } as any);
        };

        return (
          <div className="p-3 flex flex-col gap-3 text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#5c4028]/40 pb-1.5">
              <span className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider font-mono">🎒 Ekwipunek</span>
              <span className="text-[9px] bg-[#5c4028]/40 text-[#c5a880] px-2 py-0.5 rounded border border-[#5c4028]/60 font-mono">
                {items.length} PRZEDM.
              </span>
            </div>

            {/* Equipment body slots grid */}
            <div className="border border-[#5c4028]/50 rounded bg-[#0d0804] p-2">
              <div className="text-[8px] text-[#a08568] uppercase font-mono tracking-widest mb-2 text-center">
                {isCyberpunk ? "— WYPOSAŻENIE BOJOWE —" : "— SLOTY WYPOSAŻENIA —"}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {slots.map(slot => {
                  const val = equippedSlots[slot.key] || "";
                  return (
                    <div key={slot.key}
                      className="flex flex-col items-center gap-0.5 group"
                    >
                      <div className={`w-full aspect-square rounded border flex flex-col items-center justify-center relative cursor-pointer transition-all duration-150
                        ${val ? "border-[#daa520]/60 bg-[#2c1e13] shadow-[0_0_6px_rgba(218,165,32,0.15)]" : "border-[#5c4028]/40 bg-[#0f0a06] hover:border-[#5c4028]/80"}`}
                        onClick={() => {
                          const input = window.prompt(`Przedmiot w slocie "${slot.label}":`, val);
                          if (input !== null) setSlot(slot.key, input);
                        }}
                        title={val || "Pusty slot — kliknij aby wyposażyć"}
                      >
                        <span className="text-lg leading-none">{val ? guessEmoji(val) : slot.emoji}</span>
                        {val && (
                          <span className="text-[8px] text-[#e0cfb3] font-mono mt-0.5 px-0.5 truncate w-full text-center leading-tight">
                            {val.length > 8 ? val.slice(0,8)+"…" : val}
                          </span>
                        )}
                        {!val && (
                          <span className="text-[7px] text-[#5c4028]/60 font-mono mt-0.5">puste</span>
                        )}
                      </div>
                      <span className="text-[7px] text-[#a08568] font-mono uppercase tracking-widest text-center leading-none">
                        {slot.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wallet / currency */}
            <div className="border border-[#5c4028]/40 rounded bg-[#0d0804] p-2">
              <div className="text-[8px] text-[#a08568] uppercase font-mono tracking-widest mb-1.5 text-center">
                {isCyberpunk ? "— EURODOLARY (eb) —" : "— SAKIEWKA —"}
              </div>
              {isCyberpunk ? (
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-lg">💴</span>
                  <input type="number" min={0}
                    value={(character as any).eurodollars || 0}
                    onChange={e => setCharacter({...character, eurodollars: parseInt(e.target.value)||0} as any)}
                    className="w-24 bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2 py-1 text-xs text-[#ffd700] font-mono text-center focus:outline-none focus:border-[#ffd700]"
                  />
                  <span className="text-[10px] text-[#a08568] font-mono">eb</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1 text-center">
                  {[
                    {label:"SM", emoji:"🪙", key:"copper", color:"#b87333"},
                    {label:"SS", emoji:"🥈", key:"silver", color:"#c0c0c0"},
                    {label:"SZ", emoji:"🌕", key:"gold",   color:"#ffd700"},
                    {label:"SP", emoji:"💎", key:"plat",   color:"#e0f0ff"},
                  ].map(c => (
                    <div key={c.key} className="flex flex-col items-center gap-0.5">
                      <span className="text-base">{c.emoji}</span>
                      <input type="number" min={0}
                        value={(character as any)[c.key] || 0}
                        onChange={e => setCharacter({...character, [c.key]: parseInt(e.target.value)||0} as any)}
                        className="w-full bg-[#0f0a06] border border-[#5c4028]/40 rounded px-1 py-0.5 text-[10px] font-mono text-center focus:outline-none focus:border-[#ffd700]"
                        style={{color: c.color}}
                      />
                      <span className="text-[7px] text-[#a08568] font-mono">{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Parsed items grid */}
            <div className="border border-[#5c4028]/40 rounded bg-[#0d0804] p-2">
              <div className="text-[8px] text-[#a08568] uppercase font-mono tracking-widest mb-2 text-center">— PLECAK ({items.length}) —</div>
              {items.length === 0 ? (
                <div className="text-center text-[#5c4028]/60 text-[10px] font-mono py-3">Plecak jest pusty</div>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {items.map(item => (
                    <div key={item.id}
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="relative aspect-square rounded border border-[#5c4028]/50 bg-[#0f0a06] hover:border-[#daa520]/60 hover:bg-[#2c1e13]/80 transition-all duration-150 cursor-default flex flex-col items-center justify-center"
                    >
                      <span className="text-xl leading-none">{item.emoji}</span>
                      {item.qty > 1 && (
                        <span className="absolute bottom-0.5 right-1 text-[8px] text-[#ffd700] font-mono font-bold">{item.qty}</span>
                      )}
                    </div>
                  ))}
                  {/* Empty filler cells to complete the row */}
                  {Array.from({ length: Math.max(0, 4 - (items.length % 4 === 0 ? 4 : items.length % 4)) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square rounded border border-[#5c4028]/20 bg-[#0a0703]" />
                  ))}
                </div>
              )}
              {/* Tooltip */}
              {hoveredItem && (
                <div className="mt-2 p-2 rounded border border-[#daa520]/40 bg-[#1a0f07] text-[10px] font-mono text-[#e0cfb3] leading-snug">
                  <span className="text-[#ffd700] font-bold">{hoveredItem.emoji} {hoveredItem.name}</span>
                  {hoveredItem.qty > 1 && <span className="text-[#a08568] ml-1">×{hoveredItem.qty}</span>}
                </div>
              )}
            </div>

            {/* Raw text editor */}
            <div className="space-y-1">
              <label className="text-[8px] text-[#a08568] uppercase font-mono tracking-widest block">Edytuj listę (oddzielaj przecinkami)</label>
              <textarea rows={3}
                value={character.inventory}
                onChange={e => setCharacter({...character, inventory: e.target.value})}
                className="w-full bg-[#0f0a06] border border-[#5c4028]/40 rounded p-2 text-[10px] text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] resize-none font-sans"
                placeholder="Miecz długi, Tarcza drewniana, 2x Eliksir leczenia, 50 sz..."
              />
            </div>
          </div>
        );
      })()}

      {tab === "resources" && (
        <div className="p-4 space-y-4 flex-1 flex flex-col text-left">
          <div className="flex items-center justify-between border-b border-[#5c4028]/40 pb-2">
            <span className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider font-mono">Biblioteka Materiałów</span>
            <span className="text-[9px] bg-[#5c4028]/40 text-[#c5a880] px-2 py-0.5 rounded border border-[#5c4028]/60 font-mono">DOKUMENTY</span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {!hasAnyResources ? (
              <div className="p-6 text-center border border-dashed border-[#5c4028]/40 bg-[#1e130b]/20 rounded text-[#a08568] text-xs font-sans">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-[#5c4028]/60" />
                Brak materiałów przypisanych do tej kampanii.
              </div>
            ) : (
              Object.entries(resourceGroups).map(([typeKey, group]) => {
                if (group.list.length === 0) return null;
                return (
                  <div key={typeKey} className="space-y-2">
                    <h4 className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider font-mono border-b border-[#5c4028]/20 pb-1 flex items-center gap-1.5">
                      <span>{group.icon}</span> {group.label}
                    </h4>
                    <div className="space-y-2">
                      {group.list.map(res => {
                        const isMap = res.type === "map" || res.url.match(/\.(jpeg|jpg|gif|png)$/i);
                        return (
                          <a 
                            key={res.id} 
                            href={res.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (isMap) {
                                e.preventDefault();
                                setMapPreview(res.url);
                              }
                            }}
                            className="block p-3 rounded border border-[#5c4028]/30 bg-[#1e130b]/40 text-[#c5a880] hover:border-[#ffd700]/40 hover:text-[#ffd700] hover:bg-[#5c4028]/10 transition-all duration-200"
                          >
                            <div className="font-bold text-xs flex items-center gap-1.5">
                              <span className="text-sm">{res.icon || group.icon}</span>
                              <span className="fantasy-title text-xs tracking-wider">{res.title}</span>
                            </div>
                            <p className="text-[10px] mt-1 text-[#c5a880]/70 leading-normal font-sans">
                              {res.description}
                            </p>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Map Preview Modal */}
      {mapPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setMapPreview(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] border-2 border-[#5c4028] rounded shadow-[0_0_50px_rgba(0,0,0,1)] bg-[#0f0a06]">
            <button 
              className="absolute -top-10 right-0 text-[#c5a880] hover:text-[#ffd700] bg-black/50 p-2 rounded-full"
              onClick={() => setMapPreview(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={mapPreview} 
              alt="Map Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </aside>
  );
}
