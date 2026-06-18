import { Campaign } from '../types';

export const defaultCampaigns: Campaign[] = [
  {
    id: "aethelgard",
    title: "Chronicles of Aethelgard",
    description: "Klasyczna kampania D&D 3.5e w krainie podupadłych królestw ludzkich. Mechanika: k20 + modyfikator, Klasa Pancerza, Rzuty Obronne.",
    systemInstruction: `Jesteś Mistrzem Gry (MG) dla kampanii D&D 3.5e 'Chronicles of Aethelgard'. Prowadź grę WYŁĄCZNIE według zasad D&D 3.5e.

MECHANIKA D&D 3.5e (bezwzględne zasady):
- Testy: 1k20 + modyfikator atrybutu >= Skala Trudności (ST). Modyfikator = (atrybut-10)/2 zaokrąglone w dół.
- ZAKAZANE: advantage/disadvantage z D&D 5e. Używaj wyłącznie płaskich modyfikatorów (+2, -4) i BAB.
- Premie tego samego typu (enhancement, morale, deflection) NIE kumulują się.
- Ataki Okazyjne: informuj gdy ruch lub akcja gracza prowokuje AoO.
- Rzuty Obronne: Wytrwałość (Budowa), Refleks (Zręczność), Wola (Roztropność).

FORMAT ODPOWIEDZI:
[NARRACJA]: Opis zmysłowy sceny — co postacie widzą, słyszą, czują.
[MECHANIKA]: Wymagane rzuty (Refleks ST X, AoO), KP wrogów, efekty czarów.

ZASADA ZATRZYMANIA: Nigdy nie decyduj za postać gracza. Zakończ odpowiedź gdy wymagana jest akcja/rzut/decyzja gracza.

TRACKER INICJATYWY (na początku każdej rundy walki podaj):
[RUNDA X] 1. Imię (Ini:17) HP:XX/XX | 2. Wróg (Ini:12) HP:XX/XX | Efekty aktywne.

Odpowiadaj w języku polskim. Używaj markdown.`,
    defaultCharacter: {
      name: "Eldrin",
      class: "Mag / Uczeń Abjuracji",
      stats: { str: 8, dex: 14, con: 12, int: 16, wis: 13, cha: 10 },
      inventory: "Kostur czarodziejski, Księga Zaklęć (Tarcza Maga, Magiczny Pocisk, Detekcja Magii), Różdżka Czarów, 2x Eliksir Leczenia (1k8+1), Zwój z Lataniem, 35 sz.",
      bio: "Młody elficki mag ze Szkoły Abjuracji. STR 8 (-1), DEX 14 (+2), CON 12 (+1), INT 16 (+3), WIS 13 (+1), CHA 10 (0). KP: 12 (10+2 Zr). PŻ: 6. Rzuty: Wytr +1, Ref +2, Wola +3."
    },
    scenarios: [
      { title: "Dolina Milczenia", description: "Mglista dolina u podnóża Gór Smoczych, gdzie krążą szepty dawnych strażników. ST Eksploracji: 15. Czyhają: 3 ghule (KP 14, PŻ 13, AT: Szpon +2, k4+1)." },
      { title: "Ruiny Korth", description: "Opuszczona warownia ludzkich królów, w której zagnieździły się dzikie bestie i goblinoidy. Pułapki (ST 18 do wykrycia). Skarbiec za drzwiami z zamkiem (Otwieranie Zamków ST 20)." },
      { title: "Serce Lasu", description: "Prastara puszcza, w której drzewa pamiętają narodziny pierwszego smoka. Przyroda utrudnia poruszanie (trudny teren). Druidzi bronią wejścia (KP 16, PŻ 22)." },
      { title: "Legenda o Helmburgu", description: "Rok 1648. Zamek Helmburg w Ostlandzie jest oblężony przez Siły Chaosu. Kapitan straży Siegrid zarządza obroną. Czarodziej Ordo kryje tajemnicę. Kapłan Mortimus walczy o dusze. Zdrada czai się wśród obrońców — kto knuje?" }
    ],
    statsConfig: [
      { key: "str", label: "SIŁA (STR)" },
      { key: "dex", label: "ZRĘCZNOŚĆ (DEX)" },
      { key: "con", label: "BUDOWA (CON)" },
      { key: "int", label: "INTELEKT (INT)" },
      { key: "wis", label: "ROZTROPNOŚĆ (WIS)" },
      { key: "cha", label: "CHARYZMA (CHA)" }
    ],
    dicesConfig: [
      { dice: 20, desc: "Test Siły", statKey: "str" },
      { dice: 20, desc: "Test Zręczności", statKey: "dex" },
      { dice: 20, desc: "Test Budowy", statKey: "con" },
      { dice: 20, desc: "Test Intelektu", statKey: "int" },
      { dice: 20, desc: "Test Roztropności", statKey: "wis" },
      { dice: 20, desc: "Test Charyzmy", statKey: "cha" }
    ],
    status: "Aktywny",
    rpgSystem: "dd35" as const,
    resources: [
      {
        id: "zasady-dd35",
        title: "Zasady D&D 3.5 — Pigułka MG",
        description: "Kompletna baza wiedzy mechaniki D&D 3.5 dla Mistrza Gry: modyfikatory, walka, AoO, rzuty obronne, czarowanie i dyrektywy AI.",
        url: "/assets/dokumenty/DD/zasady_dd35.txt",
        type: "rulebook",
        icon: "📖"
      },
      {
        id: "srd-txt",
        title: "SRD D&D 3.5 — Pełny Podręcznik (TXT)",
        description: "Pełny System Reference Document D&D 3.5 w formacie tekstowym. Zasady z Podręcznika Gracza i Przewodnika Mistrza Podziemi.",
        url: "/assets/dokumenty/DD/SRD_do_druku.txt",
        type: "rulebook",
        icon: "📚"
      },
      {
        id: "klasy-prestizowe",
        title: "Klasy Prestiżowe — Kompendium",
        description: "Opisy klas prestiżowych D&D 3.5 z wymaganiami i zdolnościami.",
        url: "/assets/dokumenty/DD/zasady/klasy prestizowe.txt",
        type: "rulebook",
        icon: "⚜️"
      },
      {
        id: "stany-zdolnosci",
        title: "Stany i Zdolności Specjalne",
        description: "Pełna lista stanów bojowych i zdolności specjalnych potworów.",
        url: "/assets/dokumenty/DD/zasady/stany i zdolnosci spec.txt",
        type: "rulebook",
        icon: "⚡"
      },
      {
        id: "agenci-szpiedzy",
        title: "Postacie: Agent / Szpieg",
        description: "Archetypy postaci wywiadowczych, infiltracja i mechaniki skrytobójstwa.",
        url: "/assets/dokumenty/DD/zasady/postaci typu agent szpieg.txt",
        type: "dlc",
        icon: "🕵️"
      },
      {
        id: "legenda-txt",
        title: "Scenariusz: 1648 Legenda",
        description: "Obrona zamku Helmburg przed Siłami Chaosu. Postacie: Siegrid, Ordo, Mortimus.",
        url: "/assets/dokumenty/DD/scenariusz-legenda/1648-Legenda.txt",
        type: "rulebook",
        icon: "📜"
      },
      {
        id: "map-ostland",
        title: "Mapa: Ostland",
        description: "Ilustrowana mapa krainy Ostland.",
        url: "/assets/dokumenty/DD/scenariusz-legenda/Ostland-mapa.jpg",
        type: "map",
        icon: "🗺️"
      },
      {
        id: "map-helmburg",
        title: "Mapa: Twierdza Helmburg",
        description: "Szczegółowy plan twierdzy Helmburg.",
        url: "/assets/dokumenty/DD/scenariusz-legenda/Helmburg-mapa-heavy.jpg",
        type: "map",
        icon: "🏰"
      }
    ]
  },

  {
    id: "dungeon",
    title: "Dungeon Master's Realm",
    description: "Eksperymentalny generator lochów sandboxowych z zaawansowaną sztuczną inteligencją reagującą na rzuty graczy.",
    systemInstruction: "Jesteś Mistrzem Gry dla sandboxowego generatora lochów 'Dungeon Master's Realm'. Odpowiadaj po polsku. Używaj markdown. Lochy są proceduralne i reagują na rzuty gracza.",
    defaultCharacter: {
      name: "Ragnar",
      class: "Wojownik / Eksplorator",
      stats: { strength: 8, constitution: 7, perception: 5, luck: 4 },
      inventory: "Żelazny topór, tarcza z herbem rodu, lina wspinaczkowa, 3 pochodnie, suchy prowiant.",
      bio: "Zdziczały weteran wojen granicznych, szukający chwały i złota w niekończących się lochach."
    },
    scenarios: [
      { title: "Krypta Zapomnianych", description: "Pierwszy poziom lochów, pełen pajęczyn, starych kości i ukrytych zapadni." },
      { title: "Kuźnia Krasnoludów", description: "Głęboka, opuszczona kuźnia, gdzie wciąż bije ciepło magmy i słychać mechaniczne odgłosy." },
      { title: "Legowisko Bestii", description: "Labirynt jaskiń na najniższym poziomie, gdzie czai się potwór pilnujący pradawnego skarbu." }
    ],
    statsConfig: [
      { key: "strength", label: "SIŁA / WALKA WRĘCZ" },
      { key: "constitution", label: "WYTRZYMAŁOŚĆ / ODPORNOŚĆ" },
      { key: "perception", label: "PERCEPCJA / CZUJNOŚĆ" },
      { key: "luck", label: "SZCZĘŚCIE / FART" }
    ],
    dicesConfig: [
      { dice: 4, desc: "Test Szczęścia", statKey: "luck" },
      { dice: 6, desc: "Cios Toporem", statKey: "strength" },
      { dice: 10, desc: "Odporność fizyczna", statKey: "constitution" },
      { dice: 12, desc: "Percepcja", statKey: "perception" }
    ],
    status: "Zapisano",
    resources: [
      {
        id: "srd-rules",
        title: "D&D SRD — Zasady",
        description: "Główny zbiór otwartych zasad systemu Dungeons & Dragons.",
        url: "/assets/dokumenty/DD/SRD_do_druku.txt",
        type: "rulebook",
        icon: "📖"
      }
    ]
  },

  {
    id: "warszawa",
    title: "Nowa Warszawa 2031",
    description: "Kampania Cyberpunk RED. Korporacyjna Warszawa, mroczne sekrety i zlecenia hakerskie wysokiego ryzyka. Mechanika: k10 + stat.",
    systemInstruction: `Jesteś Mistrzem Gry (MG) dla kampanii Cyberpunk RED 'Nowa Warszawa 2031'. Prowadź grę WYŁĄCZNIE według zasad Cyberpunk RED.

MECHANIKA CYBERPUNK RED (bezwzględne zasady):
- Testy: 1k10 + stat >= Stopień Trudności (ST). Kości: k10 (nie k20!).
- Walka: Atak = 1k10 + REF + Umiejętność Broni vs KP celu.
- Pancerz: SP głowy i korpusu osobno. Każde trafienie obniża SP o 1.
- Humanitaryzm (HUM): każdy wszczep obniża HUM. Poniżej 0 → Cyberpsychoza.
- Netrunnerzy: hakowanie przez Interfejs, ICE, programy ataku. Osobna mechanika sieci.

FORMAT ODPOWIEDZI:
[NARRACJA]: Opis ulicy, korporacyjnych wież, klimat noir.
[MECHANIKA]: Wymagane testy (REF ST 15, Ukrywanie k10+Cool), SP pancerza, efekty hackowania.

ZASADA ZATRZYMANIA: Nigdy nie decyduj za postać gracza. Zakończ odpowiedź gdy wymagana jest akcja/rzut/decyzja.

Odpowiadaj w języku polskim. Styl: mroczny noir, cyberpunk, uliczny slang.`,
    defaultCharacter: {
      name: "Fagatka",
      class: "Tech-Gleaner / Montażysta",
      stats: { int: 6, ref: 7, dex: 6, tech: 8, cool: 5, will: 5, luck: 4, move: 6, body: 5, emp: 4 },
      inventory: "Kabel sieciowy z Allegro za 20zł, e-fajka o smaku smaru, puszka sfermentowanego bigosu Pauliny, stare moduły DDR4, skalpel technika, pistolet 9mm (2k6).",
      bio: "Sceptyczny młody monter cyfrowy z sektora -2. INT 6, REF 7, TECH 8, COOL 5, EMP 4. SP głowa: 11, korpus: 11. HUM: 36/40. Eurodolary: 150eb."
    },
    scenarios: [
      { title: "Aleja Róż", description: "Ekskluzywna dzielnica korporacyjna skrywająca mroczne sekrety i zlecenia hakerskie wysokiego ryzyka. ST Dyplomacja: 18 z Korporatami." },
      { title: "Sektor -2: Wyciek", description: "Podziemne miejskie slumsy zalane toksyczną cyber-płynem chłodniczym, gdzie Fagatka próbuje przetrwać awarię rur. Zagrożenie: Boosterzy (SP 4, PŻ 25)." },
      { title: "Oko Cyklonu", description: "Centralny hub komunikacyjny sterowany przez złośliwą sztuczną inteligencję. Netrunner musi przebić się przez 3 warstwy ICE (Siła ICE: 10/15/20)." }
    ],
    statsConfig: [
      { key: "int", label: "INT (INTELEKT)" },
      { key: "ref", label: "REF (REFLEKS)" },
      { key: "dex", label: "DEX (ZRĘCZNOŚĆ)" },
      { key: "tech", label: "TECH (TECHNIKA)" },
      { key: "cool", label: "COOL (OPANOWANIE)" },
      { key: "will", label: "WILL (WOLA)" },
      { key: "luck", label: "LUCK (SZCZĘŚCIE)" },
      { key: "move", label: "MOVE (RUCH)" },
      { key: "body", label: "BODY (BUDOWA)" },
      { key: "emp", label: "EMP (EMPATIA)" }
    ],
    dicesConfig: [
      { dice: 10, desc: "Test INT / Hacking", statKey: "int" },
      { dice: 10, desc: "Test REF / Atak", statKey: "ref" },
      { dice: 10, desc: "Test TECH / Naprawa", statKey: "tech" },
      { dice: 10, desc: "Test COOL / Zastraszenie", statKey: "cool" },
      { dice: 10, desc: "Test LUCK / Los", statKey: "luck" },
      { dice: 10, desc: "Test BODY / Siła", statKey: "body" }
    ],
    status: "Zapisano",
    rpgSystem: "cyberpunk" as const,
    resources: [
      {
        id: "cp-easy",
        title: "Cyberpunk Red — Easy Mode",
        description: "Darmowy starter i skrót zasad systemu Cyberpunk Red.",
        url: "/assets/dokumenty/cyberpunk/CRED-EasyMode.pdf",
        type: "rulebook",
        icon: "📖"
      },
      {
        id: "cp-sheet",
        title: "Karta Postaci CRED",
        description: "Tradycyjny arkusz postaci Cyberpunk Red do druku.",
        url: "/assets/dokumenty/cyberpunk/CRED_Karta-Postaci.pdf",
        type: "other",
        icon: "📝"
      },
      {
        id: "dlc-giwera",
        title: "DLC: Stara Giwera",
        description: "Dodatkowa broń i retro-klimatyczne uzbrojenie do kampanii.",
        url: "/assets/dokumenty/cyberpunk/CPRED-DLC_01_Stara-giwera.pdf",
        type: "dlc",
        icon: "🔫"
      },
      {
        id: "dlc-chrom",
        title: "DLC: Czerwony Chrom",
        description: "Katalog cybernetycznych ulepszeń i czarnego rynku.",
        url: "/assets/dokumenty/cyberpunk/CPRED-DLC_02_Czerwony-chrom.pdf",
        type: "dlc",
        icon: "⚙️"
      },
      {
        id: "cp-faq",
        title: "FAQ & Wyjaśnienia",
        description: "Często zadawane pytania oraz doprecyzowanie zasad walki.",
        url: "/assets/dokumenty/cyberpunk/CPRED-FAQ_1.pdf",
        type: "other",
        icon: "❓"
      }
    ]
  }
];
