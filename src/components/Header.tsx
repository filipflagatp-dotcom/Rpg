import { Sidebar, Dices, ArrowLeft, Settings } from "lucide-react";

interface HeaderProps {
  toggleLeft: () => void;
  toggleRight: () => void;
  view: 'dashboard' | 'gameplay' | 'settings';
  setView: (view: 'dashboard' | 'gameplay' | 'settings') => void;
  campaignTitle?: string;
}

export function Header({ toggleLeft, toggleRight, view, setView, campaignTitle }: HeaderProps) {
  const handleReturn = () => {
    // If it's a campaign window opened via window.open, close it. Otherwise navigate to dashboard.
    if (window.name || window.opener) {
      window.close();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <header className="border-b-4 border-[#1a0f07] bg-gradient-to-r from-[#2c1e13] via-[#3d2719] to-[#2c1e13] px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center w-full justify-between md:w-auto gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#d4af37] to-[#aa7c11] rounded p-0.5 shadow-md flex items-center justify-center">
            <span className="text-lg">🛡️</span>
          </div>
          <div className="text-left">
            <h1 className="fantasy-title text-base md:text-lg font-bold text-[#ffd700] tracking-wider leading-tight">
              {campaignTitle ? campaignTitle.toUpperCase() : "FLAGER'S RPG ENGINE"}
            </h1>
            <p className="text-[9px] text-[#a08568] uppercase tracking-widest font-mono flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
              {campaignTitle ? "Aktywna Sesja RPG" : "DASHBOARD SILNIKA v2.0"}
            </p>
          </div>
        </div>
      </div>

      {view === 'gameplay' ? (
        <div className="flex flex-wrap items-center justify-center gap-2 bg-[#1e130b]/60 border border-[#5c4028]/40 p-1 rounded w-full md:w-auto">
          <button 
            onClick={toggleLeft} 
            className="px-2.5 py-1.5 rounded bg-[#5c4028]/20 border border-[#5c4028]/40 text-[#c5a880] hover:text-[#ffd700] hover:bg-[#5c4028]/40 transition flex items-center gap-1.5 text-xs font-bold font-sans" 
            title="Karta Postaci"
          >
            <Sidebar className="w-3.5 h-3.5" />
            <span>Karta Postaci</span>
          </button>
          
          <button 
            onClick={handleReturn} 
            className="px-3 py-1.5 rounded border border-[#ffd700]/40 bg-gradient-to-r from-[#aa7c11]/80 to-[#daa520]/80 hover:from-[#daa520] hover:to-[#ffd700] text-black transition flex items-center gap-1.5 text-xs font-black shadow-[0_0_10px_rgba(218,165,32,0.15)] font-sans uppercase tracking-wider"
            title="Powrót do listy projektów"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
            <span>Projekty</span>
          </button>

          <button 
            onClick={toggleRight} 
            className="px-2.5 py-1.5 rounded bg-[#5c4028]/20 border border-[#5c4028]/40 text-[#c5a880] hover:text-[#ffd700] hover:bg-[#5c4028]/40 transition flex items-center gap-1.5 text-xs font-bold font-sans" 
            title="Rzuty Kostkami"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Kostnica</span>
          </button>
        </div>
      ) : (
        view === 'settings' && (
          <button 
            onClick={() => setView('dashboard')}
            className="px-3 py-1.5 rounded border border-[#5c4028]/50 bg-[#1e130b]/60 text-[#c5a880] hover:text-[#ffd700] hover:bg-[#5c4028]/35 transition flex items-center gap-1.5 text-xs font-bold font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Powrót do Projektów</span>
          </button>
        )
      )}

      <div className="flex items-center justify-center w-full md:w-auto flex-wrap gap-3 text-xs font-mono">
        <div className="px-3 py-1.5 rounded border border-[#5c4028]/40 bg-[#1e130b]/30 flex items-center gap-2 text-[#ffd700]/80">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="font-bold text-[10px] uppercase tracking-wider">Gemini 2.5 Active</span>
        </div>
      </div>
    </header>
  );
}
