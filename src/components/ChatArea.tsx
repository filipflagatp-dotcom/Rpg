import { useState, useRef, useEffect } from "react";
import { Radio, RefreshCw, Send, Dices } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Character, Message, Scenario, GmSettings, DiceRoll, Campaign } from "../types";

interface ChatAreaProps {
  scenario: Scenario;
  character: Character;
  gmSettings: GmSettings;
  quickRoll?: DiceRoll | null;
  onClearRoll: () => void;
  campaign: Campaign;
}

export function ChatArea({ scenario, character, gmSettings, quickRoll, onClearRoll, campaign }: ChatAreaProps) {
  const campaignId = campaign.id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveNotify, setSaveNotify] = useState(false);
  const [pendingDiceRoll, setPendingDiceRoll] = useState<DiceRoll | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage based on campaignId and scenario title
  useEffect(() => {
    const saved = localStorage.getItem(`flager_chat_${campaignId}_${scenario.title}`);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {}
    } else {
      setMessages([]);
    }
  }, [scenario, campaignId]);

  // Auto-save history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`flager_chat_${campaignId}_${scenario.title}`, JSON.stringify(messages));
      setSaveNotify(true);
      const timer = setTimeout(() => setSaveNotify(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [messages, scenario, campaignId]);

  useEffect(() => {
    if (quickRoll) {
      setInputVal((prev) => prev ? prev + " " + quickRoll.text : quickRoll.text);
      setPendingDiceRoll(quickRoll);
      onClearRoll();
    }
  }, [quickRoll, onClearRoll]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userMsg: Message = { role: "user", content: inputVal };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputVal("");
    setLoading(true);

    const diceRollToSend = pendingDiceRoll;
    setPendingDiceRoll(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          character,
          scenario,
          gmSettings,
          campaignId,
          campaignTitle: campaign.title,
          campaignDescription: campaign.description,
          systemInstruction: campaign.systemInstruction,
          rpgSystem: scenario.rpgSystem || campaign.rpgSystem || "custom",
          apiKey: localStorage.getItem("GEMINI_API_KEY") || "",
          diceRoll: diceRollToSend ? {
            dice: diceRollToSend.dice,
            result: diceRollToSend.result,
            modifier: diceRollToSend.modifier,
            statName: diceRollToSend.statName,
            total: diceRollToSend.total
          } : null
        })
      });
      const data = await response.json();
      if (data.text) {
        setMessages([...newMessages, { role: "model", content: data.text }]);
      } else {
        throw new Error(data.error || "Wystąpił błąd");
      }
    } catch (err: any) {
      setMessages([...newMessages, { role: "system", content: `## BŁĄD SYSTEMU\n${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const insertQuick = (text: string) => {
    setInputVal((prev) => prev ? prev + " " + text : text);
  };

  const getQuickActions = () => {
    if (campaignId === "warszawa") {
      return [
        { label: "/roll 1d20", text: "Proszę o rzut na umiejętność: K20" },
        { label: "*Zbadaj otoczenie*", text: "*Rozglądam się uważnie po mrocznym otoczeniu...* " },
        { label: "*Zaciągnij się e-fajką*", text: "*Zaciąga się mocno e-fajką o smaku smaru i rzuca:* " },
        { label: "*Sprawdź sieć*", text: "*Sprawdzam złącza i stan pingów na ruterze...* " }
      ];
    } else if (campaignId === "dungeon") {
      return [
        { label: "/roll 1d20", text: "Proszę o rzut na umiejętność: K20" },
        { label: "*Zbadaj otoczenie*", text: "*Rozglądam się uważnie po mrocznym korytarzu lochu...* " },
        { label: "*Zapal pochodnię*", text: "*Zapalam pochodnię, oświetlając wilgotne ściany...* " },
        { label: "*Nasłuchuj cieni*", text: "*Zatrzymuję się i nasłuchuję szeptów z ciemności...* " }
      ];
    } else {
      // Default / aethelgard (Fantasy)
      return [
        { label: "/roll 1d20", text: "Proszę o rzut na umiejętność: K20" },
        { label: "*Zbadaj otoczenie*", text: "*Rozglądam się uważnie po mrocznym otoczeniu...* " },
        { label: "*Przygotuj czar*", text: "*Zamykam oczy, skupiając energię wokół mojego kostura...* " },
        { label: "*Dotknij amuletu*", text: "*Sprawdzam stan mojego amuletu ochronnego i szepczę zaklęcie...* " }
      ];
    }
  };

  return (
    <section className="relative flex-grow flex flex-col bg-[#140b05]/30 overflow-hidden h-full z-10 transition-all duration-300">
      <div className="px-6 py-3 bg-[#1e130b]/60 border-b-2 border-[#5c4028]/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[#ffd700] font-bold tracking-wider uppercase fantasy-title text-xs">
              {scenario.title}
            </span>
            <span className="text-[10px] text-[#c5a880] hidden sm:inline truncate max-w-md">
              {scenario.description}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveNotify && (
            <span className="text-[9px] text-[#ffd700] bg-[#5c4028]/40 px-2 py-0.5 rounded animate-pulse border border-[#ffd700]/30 font-mono">
              ZAPISANO
            </span>
          )}
          <button 
            onClick={() => {
              if (window.confirm("Czy na pewno chcesz zresetować sesję w tym scenariuszu? Stracisz cały dotychczasowy postęp rozmowy.")) {
                setMessages([]);
                localStorage.removeItem(`flager_chat_${campaignId}_${scenario.title}`);
              }
            }} 
            className="text-[#ffd700] hover:text-[#ffe680] bg-[#5c4028]/20 hover:bg-[#5c4028]/45 px-3 py-1 rounded border border-[#5c4028]/60 transition flex items-center gap-1.5 text-xs font-mono"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restart Sesji
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm pb-10">
        {messages.length === 0 && (
          <div className="text-[#c5a880]/50 italic text-center mt-10">
            Cisza w eterze. Opisz swoje działania lub wykonaj rzut kością, aby rozpocząć przygodę...
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg p-5 border text-left shadow-lg ${msg.role === "user" ? "bg-[#3a2617]/50 border-[#ffd700]/30 text-[#fcf6e6] shadow-[0_4px_10px_rgba(0,0,0,0.3)]" : "fantasy-parchment border-[#d4c39e] text-[#3d2e1f] font-serif shadow-[0_4px_12px_rgba(0,0,0,0.4)]"}`}>
              {msg.role !== "user" && (
                <div className="text-[9px] text-[#8b5a2b] font-bold tracking-widest font-mono mb-2 border-b border-[#d4c39e]/80 pb-1 uppercase">
                  {msg.role === 'system' ? 'SYSTEM' : 'MISTRZ GRY'}
                </div>
              )}
              <div className={`prose max-w-none leading-relaxed ${msg.role === 'user' ? 'prose-invert text-[#fcf6e6] prose-p:text-[#fcf6e6] prose-strong:text-[#ffd700]' : 'text-[#3d2e1f] prose-p:text-[#3d2e1f] prose-strong:text-[#8b5a2b]'}`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="max-w-[85%] rounded-lg p-5 bg-[#1e130b]/80 border border-[#5c4028]/60 text-[#ffd700] text-left">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping delay-75"></span>
                    <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping delay-150"></span>
                  </div>
                  <span className="font-bold tracking-wider uppercase font-mono text-xs text-[#c5a880]">Mistrz Gry analizuje sytuację...</span>
                </div>
             </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          const result = Math.floor(Math.random() * 20) + 1;
          const text = `*Rzucam K20: Wyrzuciłem ${result}*`;
          setInputVal(prev => prev ? prev + " " + text : text);
          setPendingDiceRoll({
            dice: 20,
            result,
            modifier: 0,
            statName: "Brak",
            total: result,
            text
          });
        }}
        className="absolute bottom-32 right-4 md:right-6 lg:hidden z-40 bg-gradient-to-r from-[#aa7c11] to-[#daa520] hover:from-[#daa520] hover:to-[#ffd700] text-black p-3.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.5)] border-2 border-[#1a0f07] hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        title="Szybki Rzut K20"
      >
        <Dices className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-black text-[#ffd700] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#5c4028] opacity-0 group-hover:opacity-100 transition-opacity">K20</span>
      </button>

      <div className="relative z-20 p-4 border-t-2 border-[#5c4028]/60 bg-[#1e130b] space-y-3 shadow-[0_-4px_15px_rgba(0,0,0,0.5)]">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#a08568] font-bold uppercase tracking-wider text-[10px] font-mono hidden sm:inline">Gotowe gesty:</span>
          {getQuickActions().map(action => (
            <button 
              key={action.label}
              onClick={() => insertQuick(action.text)} 
              className="px-2 py-1 rounded bg-[#5c4028]/25 hover:bg-[#5c4028]/60 text-[#c5a880] hover:text-[#ffd700] border border-[#5c4028]/50 hover:border-[#ffd700]/40 transition font-mono whitespace-nowrap overflow-hidden text-ellipsis max-w-[45%] md:max-w-auto text-[10px] md:text-xs"
            >
              {action.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
            placeholder={`Opisz swoją deklarację jako ${character.name}...`}
            className="flex-1 bg-[#0f0a06] border border-[#5c4028]/60 hover:border-[#ffd700]/30 rounded px-4 py-3 text-sm text-[#e0cfb3] placeholder-[#a08568]/50 focus:outline-none focus:ring-1 focus:ring-[#ffd700] focus:border-[#ffd700]" 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-[#aa7c11] to-[#daa520] hover:from-[#daa520] hover:to-[#ffd700] text-black px-6 py-3 rounded text-xs font-bold transition flex items-center justify-center gap-2 hover:shadow-[0_0_12px_rgba(218,165,32,0.3)] tracking-wider uppercase font-mono disabled:opacity-50"
          >
            <span>Wyślij</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
