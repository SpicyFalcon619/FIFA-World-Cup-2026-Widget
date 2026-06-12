// --- FIFA/EA Sports Player ID Mapping ---
// Maps player names to their official Sofifa/EA Sports player ID headshots.

const sofifaIdMap: Record<string, string> = {
  // Argentina
  "e. martinez": "202652",
  "emiliano martinez": "202652",
  "c. romero": "232639",
  "cristian romero": "232639",
  "l. martinez": "242440", // Lisandro Martinez
  "lisandro martinez": "242440",
  "n. otamendi": "192366",
  "nicolas otamendi": "192366",
  "n. molina": "247262",
  "nahuel molina": "247262",
  "n. tagliafico": "211256",
  "nicolas tagliafico": "211256",
  "e. fernandez": "265293",
  "enzo fernandez": "265293",
  "a. mac allister": "242444",
  "alexis mac allister": "242444",
  "r. de paul": "212616",
  "rodrigo de paul": "212616",
  "l. paredes": "207439",
  "leandro paredes": "207439",
  "g. lo celso": "226226",
  "giovani lo celso": "226226",
  "l. messi": "158023",
  "lionel messi": "158023",
  "lautaro martinez": "231478",
  "j. alvarez": "256790",
  "julian alvarez": "256790",
  "a. di maria": "183898",
  "angel di maria": "183898",

  // France
  "m. maignan": "206585",
  "mike maignan": "206585",
  "w. saliba": "243580",
  "william saliba": "243580",
  "d. upamecano": "229558",
  "dayot upamecano": "229558",
  "j. kounde": "241461",
  "jules kounde": "241461",
  "t. hernandez": "232656",
  "theo hernandez": "232656",
  "i. konate": "237681",
  "ibrahima konate": "237681",
  "a. tchouameni": "240833",
  "aurelien tchouameni": "240833",
  "e. camavinga": "253163",
  "eduardo camavinga": "253163",
  "a. rabiot": "205858",
  "adriyen rabiot": "205858",
  "w. zaire-emery": "271578",
  "warren zaire-emery": "271578",
  "y. fofana": "243455",
  "youssouf fofana": "243455",
  "k. mbappe": "231747",
  "kylian mbappe": "231747",
  "o. dembele": "231443",
  "ousmane dembele": "231443",
  "a. griezmann": "194765",
  "antoine griezmann": "194765",
  "m. thuram": "235165",
  "marcus thuram": "235165",

  // Portugal
  "diogo costa": "243169",
  "ruben dias": "239818",
  "antonio silva": "268421",
  "joao cancelo": "210514",
  "nuno mendes": "252112",
  "diogo dalot": "234574",
  "bruno fernandes": "212198",
  "joao neves": "272828",
  "vitinha": "255295",
  "joao palhinha": "226277",
  "bernardo silva": "218667",
  "cristiano ronaldo": "20801",
  "c. ronaldo": "20801",
  "rafael leao": "241722",
  "joao felix": "242441",
  "diogo jota": "224458",

  // England
  "j. pickford": "204935",
  "jordan pickford": "204935",
  "j. stones": "203574",
  "john stones": "203574",
  "m. guehi": "247246",
  "marc guehi": "247246",
  "k. walker": "188377",
  "kyle walker": "188377",
  "k. trippier": "186345",
  "kieran trippier": "186345",
  "t. alexander-arnold": "231281",
  "trent alexander-arnold": "231281",
  "d. rice": "234396",
  "declan rice": "234396",
  "j. bellingham": "256630",
  "jude bellingham": "256630",
  "c. gallagher": "244263",
  "conor gallagher": "244263",
  "k. mainoo": "271703",
  "kobbie mainoo": "271703",
  "c. palmer": "257233",
  "cole palmer": "257233",
  "h. kane": "202126",
  "harry kane": "202126",
  "b. saka": "246781",
  "bukayo saka": "246781",
  "p. foden": "237692",
  "phil foden": "237692",
  "o. watkins": "222665",
  "ollie watkins": "222665",

  // Brazil
  "alisson": "212831",
  "marquinhos": "207865",
  "gabriel magalhaes": "238160",
  "danilo": "199304",
  "guilherme arana": "233119",
  "eder militao": "240130",
  "bruno guimaraes": "247411",
  "lucas paqueta": "237086",
  "joao gomes": "260389",
  "douglas luiz": "235883",
  "andreas pereira": "219717",
  "vinicius junior": "238794",
  "vinicius jr": "238794",
  "rodrygo": "243812",
  "raphinha": "233064",
  "endrick": "271576",

  // USA
  "m. turner": "232049",
  "matt turner": "232049",
  "c. richards": "246237",
  "chris richards": "246237",
  "t. ream": "201298",
  "tim ream": "201298",
  "a. robinson": "235569",
  "antonee robinson": "235569",
  "joe scally": "255288",
  "c. carter-vickers": "229261",
  "cameron carter-vickers": "229261",
  "w. mckennie": "238712",
  "weston mckennie": "238712",
  "t. adams": "232990",
  "tyler adams": "232990",
  "y. musah": "257774",
  "yunus musah": "257774",
  "j. de la torre": "228945",
  "luca de la torre": "228945",
  "m. tillman": "257228",
  "malik tillman": "257228",
  "c. pulisic": "227796",
  "christian pulisic": "227796",
  "t. weah": "240310",
  "timothy weah": "240310",
  "f. balogun": "256860",
  "folarin balogun": "256860",
  "r. pepi": "256117",
  "ricardo pepi": "256117",

  // Mexico
  "g. ochoa": "163587",
  "guillermo ochoa": "163587",
  "c. montes": "232534",
  "cesar montes": "232534",
  "j. vasquez": "254881",
  "johan vasquez": "254881",
  "j. sanchez": "240375",
  "jorge sanchez": "240375",
  "g. arteaga": "241088",
  "gerardo arteaga": "241088",
  "j. araujo": "248792",
  "julian araujo": "248792",
  "e. alvarez": "237383",
  "edson alvarez": "237383",
  "l. chavez": "240366",
  "luis chavez": "240366",
  "e. sanchez": "259648",
  "erick sanchez": "259648",
  "o. pineda": "224419",
  "orbelin pineda": "224419",
  "c. rodriguez": "243452",
  "carlos rodriguez": "243452",
  "s. gimenez": "254534",
  "santiago gimenez": "254534",
  "u. antuna": "240974",
  "uriel antuna": "240974",
  "j. quinones": "232047",
  "julian quinones": "232047",
  "r. jimenez": "213565",
  "raul jimenez": "213565",

  // Canada
  "m. crepeau": "211029",
  "maxime crepeau": "211029",
  "d. cornelius": "236814",
  "derek cornelius": "236814",
  "a. johnston": "255282",
  "alistair johnston": "255282",
  "a. davies": "234398",
  "alphonso davies": "234398",
  "moise bombito": "274880",
  "kamal miller": "248811",
  "s. eustaquio": "241775",
  "stephen eustaquio": "241775",
  "ismael kone": "268412",
  "j. shaffelburg": "251125",
  "jacob shaffelburg": "251125",
  "jonathan osorio": "212574",
  "ali ahmed": "271579",
  "jonathan david": "243621",
  "cyle larin": "226252",
  "t. bair": "246580",
  "theo bair": "246580",
  "t. buchanan": "251126",
  "tajon buchanan": "251126"
};

// Normalize names (lowercase, strip accents/diacritics)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s.-]/g, "") // strip special chars
    .trim();
}

export function getPlayerPhoto(name: string): string | null {
  if (!name) return null;
  const normalized = normalizeName(name);

  // Direct lookup
  let id = sofifaIdMap[normalized];
  
  // Try substring lookup if direct fails (e.g. "L. Messi" matches "lionel messi")
  if (!id) {
    const matchedKey = Object.keys(sofifaIdMap).find(key => {
      // If name is short form "x. yyyyy" check if key ends with "yyyyy"
      if (normalized.includes(".") && normalized.split(".").length > 1) {
        const lastName = normalized.split(".")[1].trim();
        return key.endsWith(lastName);
      }
      return key.includes(normalized) || normalized.includes(key);
    });
    if (matchedKey) id = sofifaIdMap[matchedKey];
  }

  if (id) {
    // Construct Sofifa CDN URL path
    const part1 = id.padStart(6, "0").slice(0, 3);
    const part2 = id.padStart(6, "0").slice(3, 6);
    return `https://cdn.sofifa.net/players/${part1}/${part2}/24_120.png`;
  }

  return null;
}
