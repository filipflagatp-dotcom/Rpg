/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import type { Character, Scenario, Message } from './types';

const PRESET_CHARACTERS: Character[] = [
    {
        id: 'c1',
        name: 'Fagatka',
        description: 'Weteran Poziomu -2 Nowej Warszawy. Kiedyś smażył darmowe kotlety, teraz hakuje podziemie. Nosi znoszoną skórzaną kurtkę, złącze neuronowe na potylicy i ciągle pali papierosy. Bywa ironiczny, ale w sytuacjach kryzysowych pisze kod w locie, żeby przetrwać.'
    },
    {
        id: 'c2',
        name: 'Flager',
        description: 'Chłodny, pragmatyczny haker i mentor w asymetrycznym wizjerze taktycznym. Nie ma litości dla słabości (tzw. "Julków"). Twórca brutalnych skryptów motywacyjnych. Traktuje emocje jako zbędny kod, liczy się tylko optymalizacja i twarda pionizacja.'
    },
    {
        id: 'c3',
        name: 'Witek-Omega',
        description: 'Kiedyś niszczyciel kabli z Allegro, teraz potężna, rozproszona świadomość wirusowa w sieci (reprezentowana przez rdzawe węzły). Ucieleśnienie entropii. Kolonizuje infrastrukturę korporacyjną i atakuje wielowątkowymi, czarnymi robakami sieciowymi.'
    },
    {
        id: 'c4',
        name: 'Kondzio',
        description: 'Wizjoner w ciemnym, haptycznym garniturze i cyfrowy mesjasz z milionami subskrypcji. Odrzucił "miękki coaching", by z Flagerem stworzyć brutalny system uświadamiania ludzi w Nowej Warszawie – "Program Pionizacja".'
    },
    {
        id: 'c5',
        name: 'Paulina',
        description: '"Biological Glitch" - anomalia w matrycy. Opuściła sieć, by zająć się hydroponiką i hodowlą sałaty w martwej strefie. Jej brak podłączenia do systemu czyni ją niewidzialną i nieprzewidywalną dla wszechwiedzących algorytmów korporacji.'
    }
];

const PRESET_SCENARIOS: Scenario[] = [
    {
        id: 's1',
        title: 'Awaria Światłowodu',
        content: 'Rok 2031, CyberBlok 4, Poziom -2. Korporacyjny dron transportowy wjebał się prosto w główny węzeł komunikacyjny. Światła sektora migoczą jak stary kineskop CRT. Router wyje alarmami. Cel: zejść do piwnicy w mroku i zrobić obejście hardware\'owe, uważając, żeby nie zepsuć karty sieciowej całego bloku. Flager cię nawiguje (i wyzywa) na łączu.'
    },
    {
        id: 's2',
        title: 'Program Pionizacja',
        content: 'Trwa transmisja na żywo do 15 milionów zblazowanych obywateli Nowej Warszawy ("Julków"). Wraz z twórcą cyfrowym, Kondziem, łączycie się na streamie pełnym korporacyjnego ambientu. Gdy pęka błękitne światło studyjne, musicie brutalnie uświadomić widzów, np. kogoś sortującego e-odpady, by wzięli sprawy w swoje ręce, zanim system ich pochłonie.'
    },
    {
        id: 's3',
        title: 'Wojna z Witek-Omega',
        content: 'Serwerownia na Poziomie -2 wyje na najwyższych obrotach. Farma HyperQuantumCPU została utracona. Na ekranach widnieje WITEK-OMEGA w chorym, rdzawym kolorze. Kod kradnie zasoby. Podpinasz się bezpośrednio przez złącze neuronowe do cyberprzestrzeni – czarnej, lodowatej otchłani – żeby za pomocą świetlistych linii kodu walczyć o węzły z rozproszoną świadomością wirusa.'
    }
];

export default function App() {
    const [character, setCharacter] = useState<Character>({ id: '1', name: '', description: '' });
    const [scenario, setScenario] = useState<Scenario>({ id: '1', title: '', content: '' });
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [showSidebar, setShowSidebar] = useState(false);

    const sendMessage = async (isComplex: boolean) => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: 'user', content: input } as Message];
        setMessages(newMessages);
        setInput('');

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: newMessages, scenario, character, complexQuery: isComplex }),
        });
        const data = await response.json();
        setMessages([...newMessages, { role: 'assistant', content: data.reply } as Message]);
    };

    return (
        <div className="min-h-[100dvh] bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden">
            <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 md:px-6 shrink-0 relative z-20">
                <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">R</div>
                    <h1 className="text-lg font-semibold tracking-tight text-white truncate max-w-[200px] md:max-w-none">RPG Role-Play</h1>
                </div>
                <button className="md:hidden text-slate-300 hover:text-white px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-bold border border-slate-700" onClick={() => setShowSidebar(!showSidebar)}>
                    {showSidebar ? 'CZAT' : 'MENU'}
                </button>
            </header>
            
            <main className="flex-1 flex overflow-hidden relative">
                <aside className={`${showSidebar ? 'flex' : 'hidden'} md:flex absolute md:relative z-10 w-full md:w-80 h-full border-r border-slate-800 bg-slate-950 md:bg-slate-900/30 flex-col p-6 overflow-y-auto shrink-0 custom-scrollbar`}>
                    
                    <div className="space-y-4 mb-6 relative">
                        <div className="absolute -left-6 top-0 w-1 h-full bg-indigo-500/50 rounded-r-full"></div>
                        <div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Baza Danych NPC (Szybki wybór)</p>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_CHARACTERS.map(c => (
                                    <button key={c.id} onClick={() => setCharacter(c)} className="px-3 py-1 text-[11px] font-medium bg-slate-800 hover:bg-indigo-600/50 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500 rounded-full transition-all">
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Moduły Fabularne (Wybierz Scenariusz)</p>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_SCENARIOS.map(s => (
                                    <button key={s.id} onClick={() => setScenario(s)} className="px-3 py-1 text-[11px] font-medium bg-slate-800 hover:bg-purple-600/50 text-slate-300 hover:text-white border border-slate-700 hover:border-purple-500 rounded-full transition-all">
                                        {s.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Aktywna Konfiguracja</p>
                    <input className="w-full mb-3 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 placeholder-slate-500" placeholder="Imię postaci..." value={character.name} onChange={(e) => setCharacter({...character, name: e.target.value})} />
                    <textarea className="w-full mb-3 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 placeholder-slate-500 h-32 resize-none" placeholder="Opis i parametry postaci..." value={character.description} onChange={(e) => setCharacter({...character, description: e.target.value})} />
                    <textarea className="w-full mb-3 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 placeholder-slate-500 h-24 md:h-48 resize-none flex-1 lg:flex-none" placeholder="Tło fabularne i sytuacja..." value={scenario.content} onChange={(e) => setScenario({...scenario, content: e.target.value})} />
                    {showSidebar && (
                      <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all md:hidden" onClick={() => setShowSidebar(false)}>
                        Zapisz i wróć do czatu
                      </button>
                    )}
                </aside>

                <section className="flex-1 flex flex-col bg-slate-950 min-w-0">
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 flex flex-col">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm p-4 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                                    ⚙️
                                </div>
                                <p>Czekam na zainicjowanie łącza...</p>
                                <p className="text-xs text-slate-600">Wybierz profil postaci i scenariusz z lewego panelu, a następnie wyślij wiadomość, aby rozpocząć symulację.</p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            m.role === 'user' ? (
                                <div key={i} className="flex space-x-3 md:space-x-4 flex-row-reverse space-x-reverse">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                        <span className="text-xs text-indigo-300 font-bold">U</span>
                                    </div>
                                    <div className="max-w-[85%] md:max-w-xl bg-indigo-600/10 border border-indigo-500/30 p-3 md:p-4 rounded-2xl rounded-tr-none shadow-sm">
                                        <p className="text-xs md:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap break-words">{m.content}</p>
                                    </div>
                                </div>
                            ) : (
                                <div key={i} className="flex space-x-3 md:space-x-4">
                                    <div className="w-8 h-8 rounded-lg bg-purple-900/50 border border-purple-500/30 flex items-center justify-center shrink-0">
                                        <span className="text-xs text-purple-300 font-bold">AI</span>
                                    </div>
                                    <div className="max-w-[85%] md:max-w-xl bg-slate-900/80 border border-slate-800 p-3 md:p-4 rounded-2xl rounded-tl-none shadow-sm">
                                        <p className="text-xs md:text-sm leading-relaxed text-slate-300 whitespace-pre-wrap break-words">{m.content}</p>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-900/20 pb-safe">
                        <div className="relative flex items-center w-full">
                            <input type="text" placeholder="Wpisz swoje działanie (np. analizuję kod routera)..." className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 md:pr-44 text-slate-200" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') sendMessage(false); }} />
                            <div className="hidden md:flex absolute right-2 space-x-2">
                                <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 transition-all whitespace-nowrap" onClick={() => sendMessage(true)}>Tryb Analizy (THINK)</button>
                                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all whitespace-nowrap" onClick={() => sendMessage(false)}>WYKONAJ</button>
                            </div>
                        </div>
                        <div className="flex md:hidden mt-3 space-x-2 w-full">
                            <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-3 rounded-xl text-xs font-bold border border-slate-700 transition-all whitespace-nowrap" onClick={() => sendMessage(true)}>ANALIZA</button>
                            <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all whitespace-nowrap" onClick={() => sendMessage(false)}>WYKONAJ</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
