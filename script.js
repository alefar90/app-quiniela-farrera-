const API_URL = "https://quiniela-api.alefar90.workers.dev";

const { useEffect, useMemo, useState } = React;
const ADMIN_PASSWORD = "";
const ADMIN_WHATSAPP_NUMBER = "17863120172";
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/EviN0M7ZRG9EBjEbwYZkLO?mode=gi_t";

const WORLD_CUP_GROUPS = {
  A: ["México", "Sudáfrica", "Corea del Sur", "República Checa"],
  B: ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"],
  C: ["Brasil", "Marruecos", "Haití", "Escocia"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Países Bajos", "Japón", "Suecia", "Túnez"],
  G: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
  H: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"],
  I: ["Francia", "Senegal", "Irak", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "RD Congo", "Uzbekistán", "Colombia"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"] };


const SCORING_RULES = {
  groupStage: {
    correct1x2: 3,
    correctGoalDifference: 1,
    exactScore: 2,
    exactGroupPosition1: 2,
    exactGroupPosition2: 2,
    exactGroupPosition3: 2,
    exactGroupPosition4: 2 } };



const STORAGE_KEYS = {
  participants: "qf_participants_v3",
  currentParticipantId: "qf_current_participant_id_v3",
  realResults: "qf_real_results_v3",
  adminSession: "qf_admin_session_v3" };


const HOST_CITIES = [
{ city: "Ciudad de México", country: "México", timeZone: "America/Mexico_City", stadium: "Estadio Azteca" },
{ city: "Guadalajara", country: "México", timeZone: "America/Mexico_City", stadium: "Estadio Akron" },
{ city: "Monterrey", country: "México", timeZone: "America/Monterrey", stadium: "Estadio BBVA" },
{ city: "Toronto", country: "Canadá", timeZone: "America/Toronto", stadium: "BMO Field" },
{ city: "Vancouver", country: "Canadá", timeZone: "America/Vancouver", stadium: "BC Place" },
{ city: "Miami", country: "Estados Unidos", timeZone: "America/New_York", stadium: "Hard Rock Stadium" },
{ city: "Nueva York/Nueva Jersey", country: "Estados Unidos", timeZone: "America/New_York", stadium: "MetLife Stadium" },
{ city: "Dallas", country: "Estados Unidos", timeZone: "America/Chicago", stadium: "AT&T Stadium" },
{ city: "Los Ángeles", country: "Estados Unidos", timeZone: "America/Los_Angeles", stadium: "SoFi Stadium" },
{ city: "Seattle", country: "Estados Unidos", timeZone: "America/Los_Angeles", stadium: "Lumen Field" },
{ city: "Atlanta", country: "Estados Unidos", timeZone: "America/New_York", stadium: "Mercedes-Benz Stadium" },
{ city: "Houston", country: "Estados Unidos", timeZone: "America/Chicago", stadium: "NRG Stadium" }];


const USER_TIMEZONES =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "America/Mexico_City",
        "America/Monterrey",
        "America/Bogota",
        "America/Lima",
        "America/Caracas",
        "America/Santo_Domingo",
        "America/Panama",
        "America/Santiago",
        "America/Argentina/Buenos_Aires",
        "America/Toronto",
        "America/Vancouver",
        "Europe/Madrid"
      ];


const MATCH_REFERENCE_TIMEZONE = "America/New_York";

function normalizeTeamName(team) {
  const aliases = {
    "República de Corea": "Corea del Sur",
    "RI de Irán": "Irán",
    "Arabia Saudí": "Arabia Saudita"
  };

  return aliases[team] || team;
}

function getGroupMatchId(group, homeTeam, awayTeam) {
  const teams = WORLD_CUP_GROUPS[group];
  const normalizedHome = normalizeTeamName(homeTeam);
  const normalizedAway = normalizeTeamName(awayTeam);
  const homeIndex = teams.indexOf(normalizedHome) + 1;
  const awayIndex = teams.indexOf(normalizedAway) + 1;
  const sorted = [homeIndex, awayIndex].sort((a, b) => a - b);

  return `${group}-${sorted[0]}-${sorted[1]}`;
}

function createScheduledMatch(group, date, time, homeTeam, awayTeam, stadium) {
  const normalizedHome = normalizeTeamName(homeTeam);
  const normalizedAway = normalizeTeamName(awayTeam);

  return {
    id: getGroupMatchId(group, normalizedHome, normalizedAway),
    group,
    homeTeam: normalizedHome,
    awayTeam: normalizedAway,
    label: `${normalizedHome}-${normalizedAway}`,
    hostCity: "Este de Estados Unidos",
    hostCountry: "Hora ET",
    hostTimeZone: MATCH_REFERENCE_TIMEZONE,
    stadium,
    kickoffLocalISO: `${date}T${time}:00`
  };
}

const MATCHES = [
  createScheduledMatch("A", "2026-06-11", "15:00", "México", "Sudáfrica", "Estadio Ciudad de México"),
  createScheduledMatch("A", "2026-06-11", "22:00", "República de Corea", "República Checa", "Estadio Guadalajara"),

  createScheduledMatch("B", "2026-06-12", "15:00", "Canadá", "Bosnia y Herzegovina", "Estadio Toronto"),
  createScheduledMatch("D", "2026-06-12", "21:00", "Estados Unidos", "Paraguay", "Estadio Los Ángeles"),

  createScheduledMatch("B", "2026-06-13", "15:00", "Catar", "Suiza", "Estadio Bahía de San Francisco"),
  createScheduledMatch("C", "2026-06-13", "18:00", "Brasil", "Marruecos", "Estadio Nueva York Nueva Jersey"),
  createScheduledMatch("C", "2026-06-13", "21:00", "Haití", "Escocia", "Estadio Boston"),
  createScheduledMatch("D", "2026-06-14", "00:00", "Australia", "Turquía", "Estadio BC Place Vancouver"),

  createScheduledMatch("E", "2026-06-14", "13:00", "Alemania", "Curazao", "Estadio Houston"),
  createScheduledMatch("F", "2026-06-14", "16:00", "Países Bajos", "Japón", "Estadio Dallas"),
  createScheduledMatch("E", "2026-06-14", "19:00", "Costa de Marfil", "Ecuador", "Estadio Filadelfia"),
  createScheduledMatch("F", "2026-06-14", "22:00", "Suecia", "Túnez", "Estadio Monterrey"),

  createScheduledMatch("H", "2026-06-15", "12:00", "España", "Cabo Verde", "Estadio Atlanta"),
  createScheduledMatch("G", "2026-06-15", "15:00", "Bélgica", "Egipto", "Estadio Seattle"),
  createScheduledMatch("H", "2026-06-15", "18:00", "Arabia Saudí", "Uruguay", "Estadio Miami"),
  createScheduledMatch("G", "2026-06-15", "21:00", "RI de Irán", "Nueva Zelanda", "Estadio Los Ángeles"),

  createScheduledMatch("I", "2026-06-16", "15:00", "Francia", "Senegal", "Estadio Nueva York Nueva Jersey"),
  createScheduledMatch("I", "2026-06-16", "18:00", "Irak", "Noruega", "Estadio Boston"),
  createScheduledMatch("J", "2026-06-16", "21:00", "Argentina", "Argelia", "Estadio Kansas City"),
  createScheduledMatch("J", "2026-06-17", "00:00", "Austria", "Jordania", "Estadio Bahía de San Francisco"),

  createScheduledMatch("K", "2026-06-17", "13:00", "Portugal", "RD Congo", "Estadio Houston"),
  createScheduledMatch("L", "2026-06-17", "16:00", "Inglaterra", "Croacia", "Estadio Dallas"),
  createScheduledMatch("L", "2026-06-17", "19:00", "Ghana", "Panamá", "Estadio Toronto"),
  createScheduledMatch("K", "2026-06-17", "22:00", "Uzbekistán", "Colombia", "Estadio Ciudad de México"),

  createScheduledMatch("A", "2026-06-18", "12:00", "República Checa", "Sudáfrica", "Estadio Atlanta"),
  createScheduledMatch("B", "2026-06-18", "15:00", "Suiza", "Bosnia y Herzegovina", "Estadio Los Ángeles"),
  createScheduledMatch("B", "2026-06-18", "18:00", "Canadá", "Catar", "Estadio BC Place Vancouver"),
  createScheduledMatch("A", "2026-06-18", "21:00", "México", "República de Corea", "Estadio Guadalajara"),

  createScheduledMatch("D", "2026-06-19", "15:00", "Estados Unidos", "Australia", "Estadio Seattle"),
  createScheduledMatch("C", "2026-06-19", "18:00", "Escocia", "Marruecos", "Estadio Boston"),
  createScheduledMatch("C", "2026-06-19", "21:00", "Brasil", "Haití", "Estadio Filadelfia"),
  createScheduledMatch("D", "2026-06-20", "00:00", "Turquía", "Paraguay", "Estadio Bahía de San Francisco"),

  createScheduledMatch("F", "2026-06-20", "13:00", "Países Bajos", "Suecia", "Estadio Houston"),
  createScheduledMatch("E", "2026-06-20", "16:00", "Alemania", "Costa de Marfil", "Estadio Toronto"),
  createScheduledMatch("E", "2026-06-20", "22:00", "Ecuador", "Curazao", "Estadio Kansas City"),
  createScheduledMatch("F", "2026-06-21", "00:00", "Túnez", "Japón", "Estadio Monterrey"),

  createScheduledMatch("H", "2026-06-21", "12:00", "España", "Arabia Saudí", "Estadio Atlanta"),
  createScheduledMatch("G", "2026-06-21", "15:00", "Bélgica", "Irán", "Estadio Los Ángeles"),
  createScheduledMatch("H", "2026-06-21", "18:00", "Uruguay", "Cabo Verde", "Estadio Miami"),
  createScheduledMatch("G", "2026-06-21", "21:00", "Nueva Zelanda", "Egipto", "Estadio BC Place Vancouver"),

  createScheduledMatch("J", "2026-06-22", "13:00", "Argentina", "Austria", "Estadio Dallas"),
  createScheduledMatch("I", "2026-06-22", "17:00", "Francia", "Irak", "Estadio Filadelfia"),
  createScheduledMatch("I", "2026-06-22", "20:00", "Noruega", "Senegal", "Estadio Nueva York Nueva Jersey"),
  createScheduledMatch("J", "2026-06-22", "23:00", "Jordania", "Argelia", "Estadio Bahía de San Francisco"),

  createScheduledMatch("K", "2026-06-23", "13:00", "Portugal", "Uzbekistán", "Estadio Houston"),
  createScheduledMatch("L", "2026-06-23", "16:00", "Inglaterra", "Ghana", "Estadio Boston"),
  createScheduledMatch("L", "2026-06-23", "19:00", "Panamá", "Croacia", "Estadio Toronto"),
  createScheduledMatch("K", "2026-06-23", "22:00", "Colombia", "RD Congo", "Estadio Guadalajara"),

  createScheduledMatch("B", "2026-06-24", "15:00", "Suiza", "Canadá", "Estadio BC Place Vancouver"),
  createScheduledMatch("B", "2026-06-24", "15:00", "Bosnia y Herzegovina", "Catar", "Estadio Seattle"),
  createScheduledMatch("C", "2026-06-24", "18:00", "Escocia", "Brasil", "Estadio Miami"),
  createScheduledMatch("C", "2026-06-24", "18:00", "Marruecos", "Haití", "Estadio Atlanta"),
  createScheduledMatch("A", "2026-06-24", "21:00", "República Checa", "México", "Estadio Ciudad de México"),
  createScheduledMatch("A", "2026-06-24", "21:00", "Sudáfrica", "República de Corea", "Estadio Monterrey"),

  createScheduledMatch("E", "2026-06-25", "16:00", "Curazao", "Costa de Marfil", "Estadio Filadelfia"),
  createScheduledMatch("E", "2026-06-25", "16:00", "Ecuador", "Alemania", "Estadio Nueva York Nueva Jersey"),
  createScheduledMatch("F", "2026-06-25", "19:00", "Japón", "Suecia", "Estadio Dallas"),
  createScheduledMatch("F", "2026-06-25", "19:00", "Túnez", "Países Bajos", "Estadio Kansas City"),
  createScheduledMatch("D", "2026-06-25", "22:00", "Turquía", "Estados Unidos", "Estadio Los Ángeles"),
  createScheduledMatch("D", "2026-06-25", "22:00", "Paraguay", "Australia", "Estadio Bahía de San Francisco"),

  createScheduledMatch("I", "2026-06-26", "15:00", "Noruega", "Francia", "Estadio Boston"),
  createScheduledMatch("I", "2026-06-26", "15:00", "Senegal", "Irak", "Estadio Toronto"),
  createScheduledMatch("H", "2026-06-26", "20:00", "Cabo Verde", "Arabia Saudí", "Estadio Houston"),
  createScheduledMatch("H", "2026-06-26", "20:00", "Uruguay", "España", "Estadio Guadalajara"),
  createScheduledMatch("G", "2026-06-26", "23:00", "Egipto", "Irán", "Estadio Seattle"),
  createScheduledMatch("G", "2026-06-26", "23:00", "Nueva Zelanda", "Bélgica", "Estadio BC Place Vancouver"),

  createScheduledMatch("L", "2026-06-27", "17:00", "Panamá", "Inglaterra", "Estadio Nueva York Nueva Jersey"),
  createScheduledMatch("L", "2026-06-27", "17:00", "Croacia", "Ghana", "Estadio Filadelfia"),
  createScheduledMatch("K", "2026-06-27", "19:30", "Colombia", "Portugal", "Estadio Miami"),
  createScheduledMatch("K", "2026-06-27", "19:30", "RD Congo", "Uzbekistán", "Estadio Atlanta"),
  createScheduledMatch("J", "2026-06-27", "22:00", "Argelia", "Austria", "Estadio Kansas City"),
  createScheduledMatch("J", "2026-06-27", "22:00", "Jordania", "Argentina", "Estadio Dallas")
];

function safeParse(value, fallback) {
  try {var _JSON$parse;
    return (_JSON$parse = JSON.parse(value)) !== null && _JSON$parse !== void 0 ? _JSON$parse : fallback;
  } catch {
    return fallback;
  }
}

function loadFromStorage(key, fallback) {
  return safeParse(localStorage.getItem(key), fallback);
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  // Aquí luego se conectaría Supabase/Firebase para persistencia real multiusuario.
}
async function saveParticipantToAPI(participant) {
  const response = await fetch(`${API_URL}/participants/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(participant)
  });

  return response.json();
}

function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
}

function zonedDateFromLocalISO(localISO, timeZone) {
  const guess = new Date(`${localISO}Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit" }).
  formatToParts(guess);

  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  const asUTC = Date.UTC(
  Number(map.year),
  Number(map.month) - 1,
  Number(map.day),
  Number(map.hour),
  Number(map.minute),
  Number(map.second));


  return new Date(guess.getTime() - (asUTC - guess.getTime()));
}

function formatMatchTime(match, timeZone) {
  const date = zonedDateFromLocalISO(match.kickoffLocalISO, match.hostTimeZone);

  return new Intl.DateTimeFormat("es", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit" }).
  format(date);
}

function getMatchOutcome(homeGoals, awayGoals) {
  const h = Number(homeGoals);
  const a = Number(awayGoals);

  if (Number.isNaN(h) || Number.isNaN(a)) return "";
  if (h > a) return "1";
  if (h < a) return "2";
  return "X";
}

function getGoalDifference(homeGoals, awayGoals) {
  const h = Number(homeGoals);
  const a = Number(awayGoals);

  if (Number.isNaN(h) || Number.isNaN(a)) return null;
  return h - a;
}

function isCompleteScore(item) {
  return (
    item &&
    item.homeGoals !== "" &&
    item.awayGoals !== "" &&
    item.homeGoals !== null &&
    item.awayGoals !== null);

}

function calculateMatchPoints(prediction, realResult, rules = SCORING_RULES) {
  if (!isCompleteScore(prediction) || !(realResult !== null && realResult !== void 0 && realResult.finished) || !isCompleteScore(realResult)) {
    return {
      points: 0,
      correct1x2: false,
      exactScore: false,
      correctGoalDifference: false };

  }

  const predOutcome = getMatchOutcome(prediction.homeGoals, prediction.awayGoals);
  const realOutcome = getMatchOutcome(realResult.homeGoals, realResult.awayGoals);
  const predDiff = getGoalDifference(prediction.homeGoals, prediction.awayGoals);
  const realDiff = getGoalDifference(realResult.homeGoals, realResult.awayGoals);

  const correct1x2 = predOutcome === realOutcome;
  const correctGoalDifference = correct1x2 && predDiff === realDiff;
  const exactScore =
  Number(prediction.homeGoals) === Number(realResult.homeGoals) &&
  Number(prediction.awayGoals) === Number(realResult.awayGoals);

  let points = 0;

  if (correct1x2) points += rules.groupStage.correct1x2;
  if (correctGoalDifference) points += rules.groupStage.correctGoalDifference;
  if (exactScore) points += rules.groupStage.exactScore;

  return { points, correct1x2, exactScore, correctGoalDifference };
}

function calculateParticipantTotal(participant, realResults, rules = SCORING_RULES) {
  return Object.entries(participant.predictions || {}).reduce(
  (acc, [matchId, prediction]) => {
    const result = calculateMatchPoints(prediction, realResults[matchId], rules);

    acc.points += result.points;
    acc.correct1x2 += result.correct1x2 ? 1 : 0;
    acc.exactScores += result.exactScore ? 1 : 0;
    acc.correctGoalDifferences += result.correctGoalDifference ? 1 : 0;

    return acc;
  },
  {
    points: 0,
    correct1x2: 0,
    exactScores: 0,
    correctGoalDifferences: 0 });


}

function calculateLeaderboard(participants, realResults, rules = SCORING_RULES) {
  return participants.
  filter(p => p.locked).
  map(p => ({
    ...p,
    totals: calculateParticipantTotal(p, realResults, rules) })).

  sort(
  (a, b) =>
  b.totals.points - a.totals.points ||
  b.totals.exactScores - a.totals.exactScores ||
  a.name.localeCompare(b.name));

}

function buildAdminPredictionsMatrix(participants, matches) {
  return participants.
  filter(p => p.locked).
  map(participant => {
    const row = {
      participant: participant.name,
      alias: participant.alias || "—",
      submittedAt: participant.submittedAt || "—" };


    matches.forEach(match => {var _participant$predicti;
      const prediction = (_participant$predicti = participant.predictions) === null || _participant$predicti === void 0 ? void 0 : _participant$predicti[match.id];
      row[match.label] = isCompleteScore(prediction) ?
      `${prediction.homeGoals}-${prediction.awayGoals}` :
      "—";
    });

    return row;
  });
}

function buildAdminPredictionsLongTable(participants, matches) {
  return participants.
  filter(p => p.locked).
  flatMap((participant) =>
  matches.map(match => {var _participant$predicti2;
    const prediction = ((_participant$predicti2 = participant.predictions) === null || _participant$predicti2 === void 0 ? void 0 : _participant$predicti2[match.id]) || {};

    return {
      participant: participant.name,
      alias: participant.alias || "—",
      submittedAt: participant.submittedAt || "—",
      match: `${match.homeTeam} vs ${match.awayTeam}`,
      predictedScore: isCompleteScore(prediction) ?
      `${prediction.homeGoals}-${prediction.awayGoals}` :
      "—",
      outcome: isCompleteScore(prediction) ?
      getMatchOutcome(prediction.homeGoals, prediction.awayGoals) :
      "—",
      goalDifference: isCompleteScore(prediction) ?
      getGoalDifference(prediction.homeGoals, prediction.awayGoals) :
      "—" };

  }));

}

function lockParticipantPredictions(participant) {
  return {
    ...participant,
    locked: true,
    submittedAt: new Date().toLocaleString("es-US") };

}

function canEditPredictions(participant) {
  return Boolean(participant) && !participant.locked;
}

function createEmptyPredictions() {
  return MATCHES.reduce((acc, match) => {
    acc[match.id] = { homeGoals: "", awayGoals: "" };
    return acc;
  }, {});
}

function createEmptyResults() {
  return MATCHES.reduce((acc, match) => {
    acc[match.id] = { homeGoals: "", awayGoals: "", finished: false };
    return acc;
  }, {});
}

function downloadFile(filename, content, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function toCSV(rows) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const escapeCell = value => `"${String(value !== null && value !== void 0 ? value : "").replaceAll('"', '""')}"`;

  return [
  headers.join(","),
  ...rows.map(row => headers.map(header => escapeCell(row[header])).join(","))].
  join("\n");
}

function Header() {
  return /*#__PURE__*/(
    React.createElement("header", { className: "header" }, /*#__PURE__*/
    React.createElement("div", { className: "header-inner" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { className: "logo" }, /*#__PURE__*/
    React.createElement("span", { className: "logo-mark" }, "\u26BD"), /*#__PURE__*/
    React.createElement("span", null, "Quiniela Farrera")), /*#__PURE__*/

    React.createElement("p", { className: "header-copy" }, "Mundial 2026 \xB7 Administrada por Alexander")))));




}

function NavigationTabs({ activeTab, setActiveTab }) {
  const tabs = ["Inicio", "Registro", "Partidos", "Pronósticos", "Predicciones diarias", "Ranking", "Administrador"];

  return /*#__PURE__*/(
    React.createElement("nav", { className: "tabs" },
    tabs.map((tab) => /*#__PURE__*/
    React.createElement("button", {
      key: tab,
      className: `tab-button ${activeTab === tab ? "active" : ""}`,
      onClick: () => setActiveTab(tab) },

    tab))));




}

function ScoringRulesTable() {
  const rules = SCORING_RULES.groupStage;

  const rows = [
  ["Signo 1X2 correcto", rules.correct1x2],
  ["Diferencia correcta, solo si también acertó 1X2", rules.correctGoalDifference],
  ["Resultado exacto", rules.exactScore],
  ["Posición exacta 1º", rules.exactGroupPosition1],
  ["Posición exacta 2º", rules.exactGroupPosition2],
  ["Posición exacta 3º", rules.exactGroupPosition3],
  ["Posición exacta 4º", rules.exactGroupPosition4]];


  return /*#__PURE__*/(
    React.createElement("div", { className: "table-wrap" }, /*#__PURE__*/
    React.createElement("table", null, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("th", null, "Regla"), /*#__PURE__*/
    React.createElement("th", null, "Puntos"))), /*#__PURE__*/


    React.createElement("tbody", null,
    rows.map(([label, points]) => /*#__PURE__*/
    React.createElement("tr", { key: label }, /*#__PURE__*/
    React.createElement("td", null, label), /*#__PURE__*/
    React.createElement("td", null, points)))))));






}

function HomeTab({ setActiveTab }) {
  return /*#__PURE__*/(
    React.createElement("section", { className: "grid" }, /*#__PURE__*/

      React.createElement("div", { className: "card" }, /*#__PURE__*/
        React.createElement("h1", null, "Bienvenido a la Quiniela Farrera"), /*#__PURE__*/
        React.createElement(
          "p",
          { className: "lead" },
          "Participa en la Quiniela Farrera del Mundial 2026. Regístrate, revisa los partidos, llena tus pronósticos y envíalos oficialmente cuando estés seguro."
        ), /*#__PURE__*/
        React.createElement("div", { className: "actions" }, /*#__PURE__*/
          React.createElement(
            "button",
            { className: "btn red", onClick: () => setActiveTab("Registro") },
            "Empezar a jugar"
          )
        )
      ), /*#__PURE__*/
    React.createElement("div", { className: "card" },
    React.createElement("h2", null, "Cómo jugar"),
    React.createElement(
      "p",
      { className: "small" },
      "Mira este tutorial rápido antes de registrarte y llenar tus pronósticos."
    ),
    React.createElement("video", {
      className: "tutorial-video",
      controls: true,
      playsInline: true,
      preload: "metadata",
      poster: "icon-512.png",
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    })
    ), /*#__PURE__*/

      React.createElement("div", { className: "card" }, /*#__PURE__*/
        React.createElement("h2", null, "Paso a paso"), /*#__PURE__*/
        React.createElement("div", { className: "grid grid-4" }, /*#__PURE__*/

          React.createElement("div", { className: "stat" }, /*#__PURE__*/
            React.createElement("strong", null, "1"), /*#__PURE__*/
            React.createElement("span", null, "Regístrate con tu nombre y alias.")
          ), /*#__PURE__*/

          React.createElement("div", { className: "stat" }, /*#__PURE__*/
            React.createElement("strong", null, "2"), /*#__PURE__*/
            React.createElement("span", null, "Selecciona tu zona horaria.")
          ), /*#__PURE__*/

          React.createElement("div", { className: "stat" }, /*#__PURE__*/
            React.createElement("strong", null, "3"), /*#__PURE__*/
            React.createElement("span", null, "Llena los goles de cada partido.")
          ), /*#__PURE__*/

          React.createElement("div", { className: "stat" }, /*#__PURE__*/
            React.createElement("strong", null, "4"), /*#__PURE__*/
            React.createElement("span", null, "Envía tus pronósticos. Luego quedan bloqueados.")
          )
        )
      ), /*#__PURE__*/

      React.createElement("div", { className: "card" }, /*#__PURE__*/
        React.createElement("h2", null, "Reglas de puntuación"), /*#__PURE__*/
        React.createElement(ScoringRulesTable, null), /*#__PURE__*/
        React.createElement(
          "div",
          { className: "notice" },
          "Ejemplo: si Inglaterra gana 2-1 a Croacia y pronosticas 2-1, sumas 6 puntos: 3 por 1X2 correcto, 1 por diferencia correcta y 2 por marcador exacto."
        )
      ), /*#__PURE__*/

      React.createElement("div", { className: "actions", style: { marginTop: 16 } }, /*#__PURE__*/
        React.createElement(
          "button",
          { className: "btn red", onClick: () => setActiveTab("Registro") },
          "Empezar a jugar"
        )
      )
    )
  );
}

function RegistrationTab({
  participants,
  setParticipants,
  currentParticipantId,
  setCurrentParticipantId,
  setActiveTab })
{
  const current = participants.find(p => p.id === currentParticipantId);

  const [form, setForm] = useState({
    name: (current === null || current === void 0 ? void 0 : current.name) || "",
    alias: (current === null || current === void 0 ? void 0 : current.alias) || "",
    phone: (current === null || current === void 0 ? void 0 : current.phone) || "",
    email: (current === null || current === void 0 ? void 0 : current.email) || "",
    country: (current === null || current === void 0 ? void 0 : current.country) || "",
    city: (current === null || current === void 0 ? void 0 : current.city) || "",
    timeZone: (current === null || current === void 0 ? void 0 : current.timeZone) || getBrowserTimeZone() });


  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }

    if (current !== null && current !== void 0 && current.locked) {
      alert("Este participante ya envió sus pronósticos y no puede modificar su registro.");
      return;
    }

    const participant = {
      id: (current === null || current === void 0 ? void 0 : current.id) || crypto.randomUUID(),
      ...form,
      predictions: (current === null || current === void 0 ? void 0 : current.predictions) || createEmptyPredictions(),
      locked: (current === null || current === void 0 ? void 0 : current.locked) || false,
      submittedAt: (current === null || current === void 0 ? void 0 : current.submittedAt) || "" };


    const updatedParticipants = current ?
    participants.map(p => p.id === current.id ? participant : p) :
    [...participants, participant];

    setParticipants(updatedParticipants);
saveParticipantToAPI(participant);
    setCurrentParticipantId(participant.id);
    localStorage.setItem(STORAGE_KEYS.currentParticipantId, participant.id);

alert("Enhorabuena, ya estás registrado y puedes unirte al grupo en WhatsApp.");    setActiveTab("Partidos");
  }

  return /*#__PURE__*/(
    React.createElement("section", { className: "card" }, /*#__PURE__*/
    React.createElement("h2", null, "Registro"), /*#__PURE__*/
    React.createElement("p", { className: "small" }, "Detectamos tu zona horaria automáticamente para mostrarte los partidos en tu hora local. Si no es correcta, puedes cambiarla."), /*#__PURE__*/    currentParticipantId && React.createElement("div", { className: "notice success" },
      React.createElement("strong", null, "Enhorabuena, ya estás registrado."),
      React.createElement("p", null, "Puedes unirte al grupo oficial de WhatsApp de la Quiniela Farrera."),
      React.createElement("a", {
        className: "btn success",
        href: WHATSAPP_GROUP_URL,
        target: "_blank",
        rel: "noopener noreferrer"
      }, "Unirme al grupo de WhatsApp")
    ),


    React.createElement("form", { onSubmit: submit, className: "grid grid-2" }, /*#__PURE__*/
    React.createElement("div", { className: "form-row" }, /*#__PURE__*/
    React.createElement("label", null, "Nombre obligatorio"), /*#__PURE__*/
    React.createElement("input", { value: form.name, onChange: e => updateField("name", e.target.value) })), /*#__PURE__*/


    React.createElement("div", { className: "form-row" }, /*#__PURE__*/
    React.createElement("label", null, "Alias"), /*#__PURE__*/
    React.createElement("input", { value: form.alias, onChange: e => updateField("alias", e.target.value) })), /*#__PURE__*/


    React.createElement("div", { className: "form-row" }, /*#__PURE__*/
    React.createElement("label", null, "Tel\xE9fono"), /*#__PURE__*/
    React.createElement("input", { value: form.phone, onChange: e => updateField("phone", e.target.value) })), /*#__PURE__*/


    React.createElement("div", { className: "form-row" }, /*#__PURE__*/
    React.createElement("label", null, "Correo"), /*#__PURE__*/
    React.createElement("input", { type: "email", value: form.email, onChange: e => updateField("email", e.target.value) })), /*#__PURE__*/


    React.createElement("div", { className: "form-row" }, /*#__PURE__*/
    React.createElement("label", null, "Tu zona horaria"), /*#__PURE__*/
    React.createElement("select", { value: form.timeZone, onChange: e => updateField("timeZone", e.target.value) },
    USER_TIMEZONES.map((tz) => /*#__PURE__*/
    React.createElement("option", { key: tz, value: tz },
    tz)))), /*#__PURE__*/





    React.createElement("div", { className: "actions" }, /*#__PURE__*/
    React.createElement("button", { className: "btn" }, "Guardar registro")))));




}

function MatchesTab({ participants, currentParticipantId }) {
  const participant = participants.find(p => p.id === currentParticipantId);
  const userTimeZone = (participant === null || participant === void 0 ? void 0 : participant.timeZone) || getBrowserTimeZone();

  const [sortConfig, setSortConfig] = useState({
    key: "group",
    direction: "asc"
  });

  function getSortValue(match, key) {
    if (key === "group") return match.group;
    if (key === "match") return `${match.homeTeam} vs ${match.awayTeam}`;
    if (key === "venue") return `${match.stadium} ${match.hostCity} ${match.hostCountry}`;
    if (key === "hostTime") return zonedDateFromLocalISO(match.kickoffLocalISO, match.hostTimeZone).getTime();
    if (key === "userTime") return zonedDateFromLocalISO(match.kickoffLocalISO, match.hostTimeZone).getTime();
    return "";
  }

  function sortMatches(key) {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  }

  function sortLabel(key, label) {
    if (sortConfig.key !== key) return `${label} ↕`;
    return `${label} ${sortConfig.direction === "asc" ? "↑" : "↓"}`;
  }

  const sortedMatches = [...MATCHES].sort((a, b) => {
    const aValue = getSortValue(a, sortConfig.key);
    const bValue = getSortValue(b, sortConfig.key);

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return sortConfig.direction === "asc"
      ? String(aValue).localeCompare(String(bValue), "es")
      : String(bValue).localeCompare(String(aValue), "es");
  });

  return /*#__PURE__*/(
    React.createElement("section", { className: "card" }, /*#__PURE__*/
      React.createElement("div", { className: "admin-section-title" }, /*#__PURE__*/
        React.createElement("div", null, /*#__PURE__*/
          React.createElement("h2", null, "Partidos"), /*#__PURE__*/
          React.createElement("p", { className: "small" }, "Hora de sede y tu hora local según la zona horaria seleccionada.")
        ), /*#__PURE__*/
        React.createElement("span", { className: "badge" }, MATCHES.length, " partidos")
      ),

      !participant && /*#__PURE__*/
        React.createElement("div", { className: "notice warning" }, "Regístrate primero para mostrar tu hora local."), /*#__PURE__*/

      React.createElement("div", { className: "table-wrap" }, /*#__PURE__*/
        React.createElement("table", null, /*#__PURE__*/
          React.createElement("thead", null, /*#__PURE__*/
            React.createElement("tr", null, /*#__PURE__*/
              React.createElement("th", null,
                React.createElement("button", { className: "sort-button", onClick: () => sortMatches("group") }, sortLabel("group", "Grupo"))
              ), /*#__PURE__*/
              React.createElement("th", null,
                React.createElement("button", { className: "sort-button", onClick: () => sortMatches("match") }, sortLabel("match", "Partido"))
              ), /*#__PURE__*/
              React.createElement("th", null,
                React.createElement("button", { className: "sort-button", onClick: () => sortMatches("venue") }, sortLabel("venue", "Sede"))
              ), /*#__PURE__*/
              React.createElement("th", null,
                React.createElement("button", { className: "sort-button", onClick: () => sortMatches("hostTime") }, sortLabel("hostTime", "Hora local de sede"))
              ), /*#__PURE__*/
              React.createElement("th", null,
                React.createElement("button", { className: "sort-button", onClick: () => sortMatches("userTime") }, sortLabel("userTime", "Tu hora local"))
              )
            )
          ), /*#__PURE__*/

          React.createElement("tbody", null,
            sortedMatches.map((match) => /*#__PURE__*/
              React.createElement("tr", { key: match.id }, /*#__PURE__*/
                React.createElement("td", null, /*#__PURE__*/
                  React.createElement("span", { className: "badge" }, match.group)
                ), /*#__PURE__*/

                React.createElement("td", null, /*#__PURE__*/
                  React.createElement("strong", null, match.homeTeam), " vs ", /*#__PURE__*/
                  React.createElement("strong", null, match.awayTeam)
                ), /*#__PURE__*/

                React.createElement("td", null,
                  match.stadium, /*#__PURE__*/
                  React.createElement("br", null), /*#__PURE__*/
                  React.createElement("span", { className: "small" }, match.hostCity, ", ", match.hostCountry)
                ), /*#__PURE__*/

                React.createElement("td", null,
                  formatMatchTime(match, match.hostTimeZone), /*#__PURE__*/
                  React.createElement("br", null), /*#__PURE__*/
                  React.createElement("span", { className: "small" }, match.hostTimeZone)
                ), /*#__PURE__*/

                React.createElement("td", null,
                  formatMatchTime(match, userTimeZone), /*#__PURE__*/
                  React.createElement("br", null), /*#__PURE__*/
                  React.createElement("span", { className: "small" }, userTimeZone)
                )
              )
            )
          )
        )
      )
    )
  );
}

function PredictionMatchCard({ match, prediction, locked, onChange }) {var _prediction$homeGoals, _prediction$awayGoals;
  return /*#__PURE__*/(
    React.createElement("div", { className: "match-card" }, /*#__PURE__*/
    React.createElement("strong", { className: "team home" }, match.homeTeam), /*#__PURE__*/

    React.createElement("input", {
      className: "score-input",
      type: "number",
      min: "0",
      disabled: locked,
      value: (_prediction$homeGoals = prediction === null || prediction === void 0 ? void 0 : prediction.homeGoals) !== null && _prediction$homeGoals !== void 0 ? _prediction$homeGoals : "",
      onChange: e => onChange(match.id, "homeGoals", e.target.value) }), /*#__PURE__*/


    React.createElement("span", { className: "versus" }, "-"), /*#__PURE__*/

    React.createElement("input", {
      className: "score-input",
      type: "number",
      min: "0",
      disabled: locked,
      value: (_prediction$awayGoals = prediction === null || prediction === void 0 ? void 0 : prediction.awayGoals) !== null && _prediction$awayGoals !== void 0 ? _prediction$awayGoals : "",
      onChange: e => onChange(match.id, "awayGoals", e.target.value) }), /*#__PURE__*/


    React.createElement("strong", { className: "team away" }, match.awayTeam), /*#__PURE__*/

    React.createElement("div", { className: "match-meta" }, /*#__PURE__*/
    React.createElement("span", null, "Grupo ", match.group), /*#__PURE__*/
    React.createElement("span", null, "1X2: ", /*#__PURE__*/
    React.createElement("strong", null, isCompleteScore(prediction) ? getMatchOutcome(prediction.homeGoals, prediction.awayGoals) : "—")), /*#__PURE__*/

    React.createElement("span", null, "Diferencia: ", /*#__PURE__*/
    React.createElement("strong", null, isCompleteScore(prediction) ? getGoalDifference(prediction.homeGoals, prediction.awayGoals) : "—")))));




}

function WhatsAppNotifyButton({ participant }) {
  const message = `Hola Alexander, ya completé y envié mis pronósticos para la Quiniela Farrera del Mundial 2026. Mi nombre es: ${participant.name}. Mi alias es: ${participant.alias || "—"}. Por favor agrégame al grupo y confirma que recibiste mi información.`;

  const url = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return /*#__PURE__*/(
    React.createElement("a", { className: "btn success", href: url, target: "_blank", rel: "noreferrer" }, "Notificar al administrador"));



}

function PredictionsTab({ participants, setParticipants, currentParticipantId }) {
  const participant = participants.find(p => p.id === currentParticipantId);
  const [groupFilter, setGroupFilter] = useState("A");

  if (!participant) {
    return /*#__PURE__*/(
      React.createElement("section", { className: "card" }, /*#__PURE__*/
      React.createElement("h2", null, "Pron\xF3sticos"), /*#__PURE__*/
      React.createElement("div", { className: "notice warning" }, "Primero debes registrarte.")));


  }

  const locked = participant.locked;
  const groupMatches = MATCHES.filter(m => m.group === groupFilter);

  function updatePrediction(matchId, field, value) {
    if (!canEditPredictions(participant)) return;

    const updatedParticipant = {
      ...participant,
      predictions: {
        ...participant.predictions,
        [matchId]: {
          ...participant.predictions[matchId],
          [field]: value } } };




    setParticipants(participants.map(p => p.id === participant.id ? updatedParticipant : p));
  }

  function saveDraft() {
    saveToStorage(STORAGE_KEYS.participants, participants);
    alert("Borrador guardado.");
  }

  function submitPredictions() {
    alert(
    "Advertencia importante: al enviar tus pronósticos, quedarán registrados oficialmente en la Quiniela Farrera. Después del envío no podrás modificarlos. Revisa cuidadosamente todos los marcadores antes de confirmar.");


    const confirmed = confirm(
    "¿Estás seguro de enviar tus pronósticos? Esta acción no se puede deshacer.");


    if (!confirmed) return;

    const lockedParticipant = lockParticipantPredictions(participant);

    setParticipants(participants.map(p => p.id === participant.id ? lockedParticipant : p));
  }

  return /*#__PURE__*/(
    React.createElement("section", { className: "card" }, /*#__PURE__*/
    React.createElement("div", { className: "admin-section-title" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "Pron\xF3sticos"), /*#__PURE__*/
    React.createElement("p", { className: "small" }, "Participante: ", /*#__PURE__*/
    React.createElement("strong", null, participant.name))),



    locked && /*#__PURE__*/React.createElement("span", { className: "badge success" }, "Pron\xF3sticos enviados y bloqueados")),


    locked && /*#__PURE__*/
    React.createElement("div", { className: "notice success" }, "Pron\xF3sticos enviados y bloqueados.", /*#__PURE__*/

    React.createElement("br", null), "Fecha y hora de env\xEDo: ", /*#__PURE__*/
    React.createElement("strong", null, participant.submittedAt)), /*#__PURE__*/



    React.createElement("div", { className: "form-row" }, /*#__PURE__*/
    React.createElement("label", null, "Grupo"), /*#__PURE__*/
    React.createElement("select", { value: groupFilter, onChange: e => setGroupFilter(e.target.value) },
    Object.keys(WORLD_CUP_GROUPS).map((group) => /*#__PURE__*/
    React.createElement("option", { key: group, value: group }, "Grupo ",
    group)))), /*#__PURE__*/





    React.createElement("div", { className: "grid" },
    groupMatches.map(match => {var _participant$predicti3;return /*#__PURE__*/(
        React.createElement(PredictionMatchCard, {
          key: match.id,
          match: match,
          prediction: (_participant$predicti3 = participant.predictions) === null || _participant$predicti3 === void 0 ? void 0 : _participant$predicti3[match.id],
          locked: locked,
          onChange: updatePrediction }));})), /*#__PURE__*/




    React.createElement("div", { className: "actions", style: { marginTop: 16 } }, /*#__PURE__*/
    React.createElement("button", { className: "btn secondary", disabled: locked, onClick: saveDraft }, "Guardar borrador"), /*#__PURE__*/



    React.createElement("button", { className: "btn red", disabled: locked, onClick: submitPredictions }, "Enviar pron\xF3sticos definitivos"),



    locked && /*#__PURE__*/React.createElement(WhatsAppNotifyButton, { participant: participant }), /*#__PURE__*/

    React.createElement("button", {
      className: "btn ghost",
      onClick: () =>
      downloadFile(
      `pronosticos-${participant.alias || participant.name}.json`,
      JSON.stringify(participant, null, 2)) }, "Exportar pron\xF3sticos JSON"))));








}

function LeaderboardTable({ leaderboard }) {
  return /*#__PURE__*/(
    React.createElement("div", { className: "table-wrap" }, /*#__PURE__*/
    React.createElement("table", null, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("th", null, "Posici\xF3n"), /*#__PURE__*/
    React.createElement("th", null, "Participante"), /*#__PURE__*/
    React.createElement("th", null, "Alias"), /*#__PURE__*/
    React.createElement("th", null, "Puntos"), /*#__PURE__*/
    React.createElement("th", null, "Aciertos 1X2"), /*#__PURE__*/
    React.createElement("th", null, "Exactos"), /*#__PURE__*/
    React.createElement("th", null, "Diferencias"))), /*#__PURE__*/


    React.createElement("tbody", null,
    leaderboard.map((participant, index) => /*#__PURE__*/
    React.createElement("tr", {
      key: participant.id,
      className:
        index === 0 ? "rank-gold" :
        index === 1 ? "rank-silver" :
        index === 2 ? "rank-bronze" :
        ""
    }, /*#__PURE__*/
    React.createElement("td", null, index + 1), /*#__PURE__*/
    React.createElement("td", null, participant.name), /*#__PURE__*/
    React.createElement("td", null, participant.alias || "—"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement("strong", null, participant.totals.points)), /*#__PURE__*/

    React.createElement("td", null, participant.totals.correct1x2), /*#__PURE__*/
    React.createElement("td", null, participant.totals.exactScores), /*#__PURE__*/
    React.createElement("td", null, participant.totals.correctGoalDifferences))),



    !leaderboard.length && /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", { colSpan: "7" }, "A\xFAn no hay participantes con pron\xF3sticos enviados."))))));






}

function RankingTab({ participants, realResults }) {
  const leaderboard = useMemo(
  () => calculateLeaderboard(participants, realResults),
  [participants, realResults]);


  return /*#__PURE__*/(
    React.createElement("section", { className: "card" }, /*#__PURE__*/
    React.createElement("div", { className: "admin-section-title" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "Ranking"), /*#__PURE__*/
    React.createElement("p", { className: "small" }, "Se actualiza autom\xE1ticamente cuando Alexander marca resultados como finalizados.")), /*#__PURE__*/




    React.createElement("button", {
      className: "btn ghost",
      onClick: () =>
      downloadFile("ranking-quiniela-farrera.json", JSON.stringify(leaderboard, null, 2)) }, "Exportar ranking")), /*#__PURE__*/






    React.createElement(LeaderboardTable, { leaderboard: leaderboard })));


}

function DailyPredictionsTab({ participants }) {
  const submittedParticipants = participants.filter(p => p.locked);

  const matchDates = Array.from(
    new Set(MATCHES.map(match => match.kickoffLocalISO.slice(0, 10)))
  );

  const [selectedDate, setSelectedDate] = useState(matchDates[0] || "");

  const matchesForDate = MATCHES.filter(
    match => match.kickoffLocalISO.slice(0, 10) === selectedDate
  );

  function formatDateInput(dateISO) {
    const [year, month, day] = dateISO.split("-");
    return `${day}/${month}/${year}`;
  }

  function formatDateLabel(dateISO) {
    const [year, month, day] = dateISO.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return new Intl.DateTimeFormat("es", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function getPredictionText(prediction) {
    if (!isCompleteScore(prediction)) return "—";
    return `${prediction.homeGoals}-${prediction.awayGoals}`;
  }

  return /*#__PURE__*/(
    React.createElement("section", { className: "card daily-predictions" }, /*#__PURE__*/

      React.createElement("div", { className: "daily-date-picker" }, /*#__PURE__*/
        React.createElement("label", null, "Selecciona día:"), /*#__PURE__*/
        React.createElement("select", {
          value: selectedDate,
          onChange: e => setSelectedDate(e.target.value)
        },
          matchDates.map(date => /*#__PURE__*/
            React.createElement("option", { key: date, value: date }, formatDateInput(date))
          )
        )
      ), /*#__PURE__*/

      React.createElement("p", { className: "small daily-date-label" }, formatDateLabel(selectedDate)), /*#__PURE__*/

      React.createElement("div", { className: "table-wrap" }, /*#__PURE__*/
        React.createElement("table", { className: "daily-table" }, /*#__PURE__*/

          React.createElement("thead", null, /*#__PURE__*/
            React.createElement("tr", null, /*#__PURE__*/
              React.createElement("th", null, "Nombre"),
              matchesForDate.map(match => /*#__PURE__*/
                React.createElement(
                  "th",
                  { key: match.id },
                  `${match.homeTeam}-${match.awayTeam}`
                )
              )
            )
          ), /*#__PURE__*/

          React.createElement("tbody", null,
            submittedParticipants.map(participant => /*#__PURE__*/
              React.createElement("tr", { key: participant.id }, /*#__PURE__*/
                React.createElement("td", null, participant.name),
                matchesForDate.map(match => {
                  const prediction = participant.predictions?.[match.id];

                  return /*#__PURE__*/(
                    React.createElement(
                      "td",
                      { key: match.id },
                      getPredictionText(prediction)
                    )
                  );
                })
              )
            ),

            !submittedParticipants.length && /*#__PURE__*/
              React.createElement("tr", null, /*#__PURE__*/
                React.createElement(
                  "td",
                  { colSpan: matchesForDate.length + 1 },
                  "Todavía no hay participantes con pronósticos enviados."
                )
              )
          )
        )
      )
    )
  );
}

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");

  async function submit(event) {
  event.preventDefault();

  try {
    const response = await fetch(`${API_URL}/admin/check`, {
      method: "GET",
      headers: {
        "x-admin-token": password
      }
    });

    if (!response.ok) {
      alert("Contraseña incorrecta.");
      return;
    }

    sessionStorage.setItem(STORAGE_KEYS.adminSession, password);
    onLogin(true);
  } catch (error) {
    console.error("Error validando admin:", error);
    alert("No se pudo validar el acceso admin.");
  }
}

  return /*#__PURE__*/(
    React.createElement("section", { className: "card" }, /*#__PURE__*/
    React.createElement("h2", null, "Login de administrador"), /*#__PURE__*/

    React.createElement("p", { className: "code-note" }, "// Acceso privado para Alexander Farrera. Ingresa la clave administrativa para gestionar participantes, pronósticos, resultados y ranking.. En producci\xF3n debe usarse autenticaci\xF3n real, autorizaci\xF3n por roles y backend seguro."), /*#__PURE__*/




    React.createElement("form", { onSubmit: submit, className: "grid grid-2" }, /*#__PURE__*/
    React.createElement("div", { className: "form-row" }, /*#__PURE__*/
    React.createElement("label", null, "Contrase\xF1a"), /*#__PURE__*/
    React.createElement("input", {
      type: "password",
      placeholder: "Contrase\xF1a de Alexander",
      value: password,
      onChange: e => setPassword(e.target.value) })), /*#__PURE__*/



    React.createElement("div", { className: "actions" }, /*#__PURE__*/
    React.createElement("button", { className: "btn" }, "Entrar")))));




}

function AdminSummary({ participants, realResults }) {
  const sent = participants.filter(p => p.locked).length;
  const finished = Object.values(realResults).filter(r => r.finished).length;

  return /*#__PURE__*/(
    React.createElement("div", { className: "grid grid-4" }, /*#__PURE__*/
    React.createElement("div", { className: "stat" }, /*#__PURE__*/
    React.createElement("strong", null, participants.length), /*#__PURE__*/
    React.createElement("span", null, "Total participantes")), /*#__PURE__*/

    React.createElement("div", { className: "stat" }, /*#__PURE__*/
    React.createElement("strong", null, sent), /*#__PURE__*/
    React.createElement("span", null, "Enviaron pron\xF3sticos")), /*#__PURE__*/

    React.createElement("div", { className: "stat" }, /*#__PURE__*/
    React.createElement("strong", null, participants.length - sent), /*#__PURE__*/
    React.createElement("span", null, "Pendientes")), /*#__PURE__*/

    React.createElement("div", { className: "stat" }, /*#__PURE__*/
    React.createElement("strong", null, finished), /*#__PURE__*/
    React.createElement("span", null, "Resultados cargados"))));



}

function AdminPredictionsMatrix({ participants }) {
  const matrix = buildAdminPredictionsMatrix(participants, MATCHES);

  return /*#__PURE__*/(
    React.createElement("div", { className: "table-wrap" }, /*#__PURE__*/
    React.createElement("table", null, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("th", null, "Participante"), /*#__PURE__*/
    React.createElement("th", null, "Alias"),
    MATCHES.map((match) => /*#__PURE__*/
    React.createElement("th", { key: match.id }, match.label)))), /*#__PURE__*/



    React.createElement("tbody", null,
    matrix.map((row, index) => /*#__PURE__*/
    React.createElement("tr", { key: index }, /*#__PURE__*/
    React.createElement("td", null, row.participant), /*#__PURE__*/
    React.createElement("td", null, row.alias),
    MATCHES.map((match) => /*#__PURE__*/
    React.createElement("td", { key: match.id }, row[match.label])))),




    !matrix.length && /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", { colSpan: MATCHES.length + 2 }, "No hay pron\xF3sticos enviados todav\xEDa."))))));






}

function AdminLongTable({ participants }) {
  const rows = buildAdminPredictionsLongTable(participants, MATCHES);

  return /*#__PURE__*/(
    React.createElement("div", { className: "table-wrap" }, /*#__PURE__*/
    React.createElement("table", null, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("th", null, "Participante"), /*#__PURE__*/
    React.createElement("th", null, "Alias"), /*#__PURE__*/
    React.createElement("th", null, "Fecha env\xEDo"), /*#__PURE__*/
    React.createElement("th", null, "Partido"), /*#__PURE__*/
    React.createElement("th", null, "Marcador"), /*#__PURE__*/
    React.createElement("th", null, "1X2"), /*#__PURE__*/
    React.createElement("th", null, "Diferencia"))), /*#__PURE__*/


    React.createElement("tbody", null,
    rows.map((row, index) => /*#__PURE__*/
    React.createElement("tr", { key: index }, /*#__PURE__*/
    React.createElement("td", null, row.participant), /*#__PURE__*/
    React.createElement("td", null, row.alias), /*#__PURE__*/
    React.createElement("td", null, row.submittedAt), /*#__PURE__*/
    React.createElement("td", null, row.match), /*#__PURE__*/
    React.createElement("td", null, row.predictedScore), /*#__PURE__*/
    React.createElement("td", null, row.outcome), /*#__PURE__*/
    React.createElement("td", null, row.goalDifference))),



    !rows.length && /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", { colSpan: "7" }, "No hay datos."))))));






}

function AdminResultsEditor({ realResults, setRealResults }) {
  const [groupFilter, setGroupFilter] = useState("A");
  const groupMatches = MATCHES.filter(m => m.group === groupFilter);

  function updateResult(matchId, field, value) {
    setRealResults({
      ...realResults,
      [matchId]: {
        ...realResults[matchId],
        [field]: value } });


  }

  return /*#__PURE__*/(
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("div", { className: "form-row" }, /*#__PURE__*/
    React.createElement("label", null, "Grupo"), /*#__PURE__*/
    React.createElement("select", { value: groupFilter, onChange: e => setGroupFilter(e.target.value) },
    Object.keys(WORLD_CUP_GROUPS).map((group) => /*#__PURE__*/
    React.createElement("option", { key: group, value: group }, "Grupo ",
    group)))), /*#__PURE__*/





    React.createElement("div", { className: "grid" },
    groupMatches.map(match => {var _result$homeGoals, _result$awayGoals;
      const result = realResults[match.id] || {};

      return /*#__PURE__*/(
        React.createElement("div", { className: "match-card", key: match.id }, /*#__PURE__*/
        React.createElement("strong", { className: "team home" }, match.homeTeam), /*#__PURE__*/

        React.createElement("input", {
          className: "score-input",
          type: "number",
          min: "0",
          value: (_result$homeGoals = result.homeGoals) !== null && _result$homeGoals !== void 0 ? _result$homeGoals : "",
          onChange: e => updateResult(match.id, "homeGoals", e.target.value) }), /*#__PURE__*/


        React.createElement("span", { className: "versus" }, "-"), /*#__PURE__*/

        React.createElement("input", {
          className: "score-input",
          type: "number",
          min: "0",
          value: (_result$awayGoals = result.awayGoals) !== null && _result$awayGoals !== void 0 ? _result$awayGoals : "",
          onChange: e => updateResult(match.id, "awayGoals", e.target.value) }), /*#__PURE__*/


        React.createElement("strong", { className: "team away" }, match.awayTeam), /*#__PURE__*/

        React.createElement("div", { className: "match-meta" }, /*#__PURE__*/
        React.createElement("label", null, /*#__PURE__*/
        React.createElement("input", {
          type: "checkbox",
          checked: Boolean(result.finished),
          onChange: e => updateResult(match.id, "finished", e.target.checked) }),
        " ", "Partido finalizado"), /*#__PURE__*/



        React.createElement("span", null, "1X2 real:",
        " ", /*#__PURE__*/
        React.createElement("strong", null,
        isCompleteScore(result) ?
        getMatchOutcome(result.homeGoals, result.awayGoals) :
        "—")))));





    })), /*#__PURE__*/


    React.createElement("div", { className: "actions", style: { marginTop: 14 } }, /*#__PURE__*/
    React.createElement("button", { className: "btn", onClick: () => saveToStorage(STORAGE_KEYS.realResults, realResults) }, "Guardar resultados reales"), /*#__PURE__*/



    React.createElement("button", {
      className: "btn ghost",
      onClick: () =>
      downloadFile("resultados-reales.json", JSON.stringify(realResults, null, 2)) }, "Exportar resultados reales"))));







}

function AdminTab({ participants, realResults, setRealResults }) {
  const [isAdmin, setIsAdmin] = useState(
  sessionStorage.getItem(STORAGE_KEYS.adminSession) === "true");

  const [view, setView] = useState("matrix");

  if (!isAdmin) {
    return /*#__PURE__*/React.createElement(AdminLogin, { onLogin: setIsAdmin });
  }

  const sentParticipants = participants.filter(p => p.locked);
  const leaderboard = calculateLeaderboard(participants, realResults);
  async function deleteParticipant(id, alias) {
  const confirmDelete = confirm(
    `¿Eliminar al participante ${alias || id}? Esta acción no se puede deshacer.`
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_URL}/admin/participants/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-token": sessionStorage.getItem(STORAGE_KEYS.adminSession)
      }
    });

    if (!response.ok) {
      alert("No se pudo eliminar el participante.");
      return;
    }

    alert(`${alias || "Participante"} eliminado correctamente.`);
    location.reload();
  } catch (error) {
    console.error(error);
    alert("Error eliminando participante.");
  }
}

  return /*#__PURE__*/(
    React.createElement("section", { className: "admin-layout" }, /*#__PURE__*/
    React.createElement("div", { className: "card admin-section-title" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "Panel privado de Alexander"), /*#__PURE__*/
    React.createElement("p", { className: "small" }, "Administra pron\xF3sticos recibidos, resultados reales y ranking.")), /*#__PURE__*/


    React.createElement("button", {
      className: "btn danger",
      onClick: () => {
        sessionStorage.removeItem(STORAGE_KEYS.adminSession);
        setIsAdmin(false);
      } }, "Cerrar sesi\xF3n")), /*#__PURE__*/





    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("h3", null, "Resumen general"), /*#__PURE__*/
    React.createElement(AdminSummary, { participants: participants, realResults: realResults })), /*#__PURE__*/
   
 React.createElement("div", { className: "card" },
  React.createElement("h3", null, "Administrar participantes"),
  participants.length === 0
    ? React.createElement("p", { className: "small" }, "No hay participantes registrados.")
    : React.createElement("div", { className: "table-wrap" },
        React.createElement("table", null,
          React.createElement("thead", null,
            React.createElement("tr", null,
              React.createElement("th", null, "Nombre"),
              React.createElement("th", null, "Alias"),
              React.createElement("th", null, "Estado"),
              React.createElement("th", null, "Acción")
            )
          ),
          React.createElement("tbody", null,
            participants.map(p =>
              React.createElement("tr", { key: p.id },
                React.createElement("td", null, p.name || "-"),
                React.createElement("td", null, p.alias || "-"),
                React.createElement("td", null, p.locked ? "Enviado" : "Pendiente"),
                React.createElement("td", null,
                  React.createElement("button", {
                    className: "btn danger",
                    onClick: () => deleteParticipant(p.id, p.alias || p.name)
                  }, "Eliminar")
                )
              )
            )
          )
        )
      )
), /*#__PURE__*/

    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("div", { className: "admin-section-title" }, /*#__PURE__*/
    React.createElement("h3", null, "Pron\xF3sticos recibidos"), /*#__PURE__*/

    React.createElement("div", { className: "actions" }, /*#__PURE__*/
    React.createElement("button", {
      className: "btn secondary",
      onClick: () => setView(view === "matrix" ? "long" : "matrix") },

    view === "matrix" ? "Ver tabla larga" : "Ver matriz"), /*#__PURE__*/


    React.createElement("button", {
      className: "btn ghost",
      onClick: () =>
      downloadFile("pronosticos-recibidos.json", JSON.stringify(sentParticipants, null, 2)) }, "Exportar JSON"), /*#__PURE__*/





    React.createElement("button", {
      className: "btn ghost",
      onClick: () =>
      downloadFile(
      "pronosticos-recibidos.csv",
      toCSV(buildAdminPredictionsLongTable(participants, MATCHES)),
      "text/csv") }, "Exportar CSV"))),








    view === "matrix" ? /*#__PURE__*/
    React.createElement(AdminPredictionsMatrix, { participants: participants }) : /*#__PURE__*/

    React.createElement(AdminLongTable, { participants: participants })), /*#__PURE__*/



    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("h3", null, "Resultados reales"), /*#__PURE__*/
    React.createElement(AdminResultsEditor, { realResults: realResults, setRealResults: setRealResults })), /*#__PURE__*/


    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("h3", null, "Ranking calculado"), /*#__PURE__*/
    React.createElement("div", { className: "actions", style: { marginBottom: 12 } }, /*#__PURE__*/
    React.createElement("button", {
      className: "btn ghost",
      onClick: () => downloadFile("ranking.json", JSON.stringify(leaderboard, null, 2)) }, "Exportar ranking")), /*#__PURE__*/




    React.createElement(LeaderboardTable, { leaderboard: leaderboard })), /*#__PURE__*/


    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("h3", null, "Reglas de puntuaci\xF3n"), /*#__PURE__*/
    React.createElement(ScoringRulesTable, null))));



}

function App() {
  const [activeTab, setActiveTab] = useState("Inicio");
const [participants, setParticipants] = useState([]);

  const [realResults, setRealResults] = useState(() => ({
    ...createEmptyResults(),
    ...loadFromStorage(STORAGE_KEYS.realResults, {}) }));

  const [currentParticipantId, setCurrentParticipantId] = useState(
  () => localStorage.getItem(STORAGE_KEYS.currentParticipantId) || "");


useEffect(() => {
  async function loadParticipants() {
    try {
      const response = await fetch(`${API_URL}/participants`);
      const data = await response.json();
      setParticipants(data);
    } catch (error) {
      console.error("Error cargando participantes:", error);
    }
  }

  loadParticipants();
}, []);  useEffect(() => saveToStorage(STORAGE_KEYS.realResults, realResults), [realResults]);

  return /*#__PURE__*/(
    React.createElement("div", { className: "app-shell" }, /*#__PURE__*/
    React.createElement(Header, null), /*#__PURE__*/

    React.createElement("main", { className: "container" }, /*#__PURE__*/
    React.createElement(NavigationTabs, { activeTab: activeTab, setActiveTab: setActiveTab }),

    activeTab === "Inicio" && /*#__PURE__*/React.createElement(HomeTab, { setActiveTab: setActiveTab }),

    activeTab === "Registro" && /*#__PURE__*/
    React.createElement(RegistrationTab, {
      participants: participants,
      setParticipants: setParticipants,
      currentParticipantId: currentParticipantId,
      setCurrentParticipantId: setCurrentParticipantId,
      setActiveTab: setActiveTab }),



    activeTab === "Partidos" && /*#__PURE__*/
    React.createElement(MatchesTab, { participants: participants, currentParticipantId: currentParticipantId }),


    activeTab === "Pronósticos" && /*#__PURE__*/
    React.createElement(PredictionsTab, {
      participants: participants,
      setParticipants: setParticipants,
      currentParticipantId: currentParticipantId }),

    activeTab === "Predicciones diarias" && /*#__PURE__*/
    React.createElement(DailyPredictionsTab, { participants: participants }),

    activeTab === "Ranking" && /*#__PURE__*/
    React.createElement(RankingTab, { participants: participants, realResults: realResults }),


    activeTab === "Administrador" && /*#__PURE__*/
    React.createElement(AdminTab, {
      participants: participants,
      realResults: realResults,
      setRealResults: setRealResults }))));





}

ReactDOM.createRoot(document.getElementById("root")).render( /*#__PURE__*/React.createElement(App, null));
