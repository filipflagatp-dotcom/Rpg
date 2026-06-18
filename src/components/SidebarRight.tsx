import { useState } from "react";
import { Dices, Plus, Sparkles } from "lucide-react";
import { GmSettings, Character, DiceRoll, Campaign } from "../types";

interface SidebarRightProps {
  isOpen: boolean;
  gmSettings: GmSettings;
  setGmSettings: (settings: GmSettings) => void;
  onRollSelect: (roll: DiceRoll) => void;
  character: Character;
  campaign: Campaign;
}

export function SidebarRight({ isOpen, gmSettings, setGmSettings, onRollSelect, character, campaign }: SidebarRightProps) {
  const [tab, setTab] = useState<"dice" | "gm">("dice");
  const [lastRoll, setLastRoll] = useState<{dice: number, result: number} | null>(null);
  const [selectedStat, setSelectedStat] = useState<string>("none");

  if (!isOpen) return null;

  const rollDice = (max: number, defaultStatKey: string) => {
    const result = Math.floor(Math.random() * max) + 1;
    setLastRoll({ dice: max, result });
    setSelectedStat(defaultStatKey);
  };

  const getModifier = () => {
    if (!lastRoll || selectedStat === "none") return 0;
    const raw = character.stats[selectedStat] || 0;
    if (campaign.rpgSystem === "dd35") {
      return Math.floor((raw - 10) / 2);
    }
    return raw;
  };

  const getStatLabel = (statKey: string) => {
    if (statKey === "none") return "Brak modyfikatora";
    const found = campaign.statsConfig.find(sc => sc.key === statKey);
    return found ? found.label.split('/')[0].trim() : statKey;
  };

  const handleAddRollToChat = () => {
    if (lastRoll) {
      const mod = getModifier();
      const total = lastRoll.result + mod;
      const statLabel = selectedStat !== "none" ? ` (${getStatLabel(selectedStat)})` : "";
      
      let text = "";
      if (selectedStat !== "none") {
        const modSign = mod >= 0 ? `+ ${mod}` : `- ${Math.abs(mod)}`;
        text = `*Rzucam kością K${lastRoll.dice}: Wyrzuciłem ${lastRoll.result} ${modSign}${statLabel} = ${total}*`;
      } else {
        text = `*Rzucam kością K${lastRoll.dice}: Wyrzuciłem ${lastRoll.result}*`;
      }
      
      onRollSelect({
        dice: lastRoll.dice,
        result: lastRoll.result,
        modifier: mod,
        statName: getStatLabel(selectedStat),
        total,
        text
      });
      setLastRoll(null);
    }
  };

  const getDifficultyLabel = (lvl: number) => {
    if (lvl <= 3) return "ŁATWY (Relaks / Opowieść)";
    if (lvl <= 7) return "WYWAŻONY (Klasyczna Warszawa / Lochy)";
    return "MORDERI / HARDCORE (Wysoka śmiertelność)";
  };

  return (
    <aside className="absolute md:relative right-0 top-0 w-full md:w-80 h-full flex-shrink-0 border-l-4 border-[#1a0f07] bg-gradient-to-b from-[#2c1e13] to-[#1e130b] flex flex-col transition-all duration-300 ease-in-out z-30 overflow-y-auto shadow-2xl">
      <div className="grid grid-cols-2 border-b-2 border-[#5c4028]/60 bg-[#140b05]">
        <button 
          onClick={() => setTab("dice")} 
          className={`py-3 text-xs font-bold uppercase tracking-wider transition font-mono ${tab === "dice" ? "text-[#ffd700] border-b-2 border-[#ffd700] bg-[#5c4028]/25" : "text-[#a08568] hover:text-[#ffd700]"}`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Dices className="w-3.5 h-3.5" /> Kostnica
          </span>
        </button>
        <button 
          onClick={() => setTab("gm")} 
          className={`py-3 text-xs font-bold uppercase tracking-wider transition font-mono ${tab === "gm" ? "text-[#ffd700] border-b-2 border-[#ffd700] bg-[#5c4028]/25" : "text-[#a08568] hover:text-[#ffd700]"}`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Mistrz Gry
          </span>
        </button>
      </div>

      {tab === "dice" && (
        <div className="p-4 space-y-4 flex-1 flex flex-col text-left">
          <div className="space-y-3">
            <h2 className="fantasy-title text-sm font-bold text-[#ffd700] tracking-wider uppercase flex items-center gap-2 border-b border-[#5c4028]/40 pb-2">
              <Dices className="w-4 h-4 text-amber-500" /> Generator Rzutów
            </h2>
            
            <p className="text-[10px] text-[#c5a880]/80 leading-relaxed font-sans">
              Wybierz kość, aby dokonać rzutu testującego. System automatycznie uwzględni modyfikatory twojej karty postaci w opisie.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {campaign.dicesConfig.map(d => (
                <button 
                  key={d.dice}
                  onClick={() => rollDice(d.dice, d.statKey)} 
                  className="p-2 bg-[#5c4028]/10 border border-[#5c4028]/40 hover:border-[#ffd700]/40 rounded hover:bg-[#5c4028]/25 transition text-center group"
                >
                  <span className="block text-[#ffd700] group-hover:scale-110 transition text-base font-bold font-serif">K{d.dice}</span>
                  <span className="text-[9px] text-[#c5a880] font-mono leading-tight">{d.desc}</span>
                </button>
              ))}
              <button 
                onClick={() => rollDice(20, "none")} 
                className="p-2.5 bg-[#5c4028]/15 border border-[#5c4028]/50 hover:border-[#ffd700]/50 rounded hover:bg-[#5c4028]/30 transition text-center group col-span-2"
              >
                <span className="block text-[#ffd700] group-hover:scale-110 transition text-lg font-extrabold tracking-wider fantasy-title">K20</span>
                <span className="text-[9px] text-[#ffd700]/80 font-mono">Główny Test Umiejętności</span>
              </button>
            </div>

            <div className="bg-[#0f0a06] border border-[#5c4028]/40 p-3 rounded text-center relative overflow-hidden h-32 flex flex-col items-center justify-center font-mono">
              <div className="absolute inset-0 bg-[#ffd700]/5 pointer-events-none"></div>
              <span className="text-[9px] text-[#a08568] uppercase tracking-widest block">Ostatni Wynik</span>
              <div className="text-3xl font-extrabold text-[#ffd700] fantasy-title transition-all duration-300">
                {lastRoll ? lastRoll.result : "-"}
              </div>
              <div className="text-[9px] text-[#c5a880] mt-0.5 italic">
                {lastRoll ? `Z kości K${lastRoll.dice}` : "Rzuć kością..."}
              </div>
              {lastRoll && (
                <div className="mt-2 text-xs text-[#ffd700] flex items-center gap-1.5 border-t border-[#5c4028]/30 pt-1.5 w-full justify-center">
                  <span className="text-[10px] text-[#a08568] uppercase">Suma:</span>
                  <span className="font-bold text-sm bg-[#5c4028]/30 px-2 py-0.5 rounded border border-[#5c4028]/50">
                    {lastRoll.result + getModifier()}
                  </span>
                  <span className="text-[9px] text-[#a08568]">
                    ({lastRoll.result} + {getModifier()})
                  </span>
                </div>
              )}
            </div>

            {lastRoll && (
              <div className="space-y-1 bg-[#170e08] border border-[#5c4028]/40 p-2 rounded text-xs font-sans">
                <label className="text-[9px] text-[#a08568] uppercase block font-bold font-mono">Wybierz atrybut modyfikatora:</label>
                <select
                  value={selectedStat}
                  onChange={(e) => setSelectedStat(e.target.value)}
                  className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2 py-1.5 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]"
                >
                  <option value="none">Brak (+0)</option>
                  {campaign.statsConfig.map(sc => (
                    <option key={sc.key} value={sc.key}>
                      {sc.label.split('/')[0].trim()} (+{character.stats[sc.key] || 0})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button 
              disabled={!lastRoll}
              onClick={handleAddRollToChat}
              className="w-full py-2 bg-[#5c4028]/40 hover:bg-[#5c4028]/70 text-[#ffd700] border border-[#5c4028]/70 hover:border-[#ffd700]/50 rounded font-bold text-xs transition uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed font-mono"
            >
              <Plus className="w-3.5 h-3.5" /> Dodaj do Akcji
            </button>
          </div>
        </div>
      )}

      {tab === "gm" && (
        <div className="p-4 space-y-4 flex-1 flex flex-col text-left">
          <div className="flex items-center justify-between border-b border-[#5c4028]/40 pb-2">
            <span className="text-[10px] text-[#ffd700] uppercase font-bold tracking-wider font-mono">Ustawienia narratora</span>
            <span className="text-[9px] bg-[#5c4028]/40 text-[#c5a880] px-2 py-0.5 rounded border border-[#5c4028]/60 font-mono">Gemini GM</span>
          </div>

          {/* Tone Setup */}
          <div className="space-y-1.5 text-xs font-sans">
            <label className="text-[10px] text-[#a08568] uppercase font-bold tracking-widest font-mono block">Profil Narracyjny</label>
            <select
              value={gmSettings.tone}
              onChange={(e) => setGmSettings({ ...gmSettings, tone: e.target.value as any })}
              className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded px-2.5 py-1.5 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700]"
            >
              <option value="cyberpunk">Standard (Klimatyczny)</option>
              <option value="noir">Detektywistyczny Noir (Cynizm i mgła)</option>
              <option value="brutal">Brutalny & Mroczny (Błoto i krew)</option>
              <option value="slapstick">Humorystyczny (Specyficzny polski humor)</option>
              <option value="action">Dynamiczny Blockbuster (Akcja i wybuchy)</option>
            </select>
          </div>

          {/* Prompt Length */}
          <div className="space-y-1.5 text-xs font-sans">
            <label className="text-[10px] text-[#a08568] uppercase font-bold tracking-widest font-mono block">Długość Opisów</label>
            <div className="grid grid-cols-3 gap-1 font-mono">
              {[
                { value: "short", label: "Krótka" },
                { value: "medium", label: "Średnia" },
                { value: "long", label: "Długa" }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGmSettings({ ...gmSettings, length: opt.value as any })}
                  className={`py-1 rounded border text-[10px] font-bold uppercase tracking-wider transition ${gmSettings.length === opt.value ? "border-[#ffd700]/70 bg-[#5c4028]/35 text-[#ffe680]" : "border-[#5c4028]/30 bg-[#0f0a06] text-[#a08568] hover:text-[#ffd700]"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Threat / Difficulty slider */}
          <div className="space-y-1.5 text-xs font-sans">
            <div className="flex justify-between items-center text-[10px] text-[#a08568] font-mono font-bold">
              <span>ZAGROŻENIE ŚWIATA (TRUDNOŚĆ)</span>
              <span className="text-[#ffd700]">{gmSettings.difficultyLevel} / 10</span>
            </div>
            <input 
              type="range" 
              min="1" max="10" 
              value={gmSettings.difficultyLevel} 
              onChange={(e) => setGmSettings({ ...gmSettings, difficultyLevel: parseInt(e.target.value) })}
              className="w-full accent-[#daa520] bg-[#0f0a06] border border-[#5c4028]/25 cursor-pointer h-1 rounded" 
            />
            <div className="text-[9px] text-[#c5a880] italic uppercase font-mono tracking-wider">
              {getDifficultyLabel(gmSettings.difficultyLevel)}
            </div>
          </div>

          {/* Custom directives (Prompt modifiers) */}
          <div className="space-y-1.5 text-xs font-sans flex-1 flex flex-col">
            <label className="text-[10px] text-[#a08568] uppercase font-bold tracking-widest font-mono block">Zasady & Dyrektywy Mistrza Gry</label>
            <textarea 
              rows={4} 
              value={gmSettings.customDirectives}
              onChange={(e) => setGmSettings({ ...gmSettings, customDirectives: e.target.value })}
              className="w-full bg-[#0f0a06] border border-[#5c4028]/50 rounded p-2 text-xs text-[#e0cfb3] focus:outline-none focus:border-[#ffd700] resize-none font-sans flex-1" 
              placeholder="np. Skup się wyłącznie na magii i tajemnicach starożytnych smoków..."
            />
            <span className="text-[8px] text-[#a08568] block font-mono leading-normal pt-1">
              Dyrektywy behawioralne natychmiast modyfikują zachowanie Gemini AI.
            </span>
          </div>

          <button 
            onClick={() => setGmSettings({
              tone: "cyberpunk",
              length: "short",
              customDirectives: "",
              difficultyLevel: 5
            })}
            className="w-full py-1.5 border border-dashed border-red-900/60 hover:border-red-500 text-[10px] text-red-400 hover:text-red-300 bg-red-950/5 hover:bg-red-950/20 rounded transition font-mono uppercase tracking-wider mt-4"
          >
            Resetuj parametry GM
          </button>
        </div>
      )}
    </aside>
  );
}
