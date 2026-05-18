const API_URL = "https://quiniela-api.alefar90.workers.dev";

const { useEffect, useMemo, useState } = React;
const ADMIN_PASSWORD = "V1n0t1nt0*";
const ADMIN_WHATSAPP_NUMBER = "17863120172";

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


const USER_TIMEZONES = [
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
"Europe/Madrid"];


function generateGroupMatches(groups) {
  const kickoffHours = [12, 15, 18, 21];
  let matchIndex = 0;

  return Object.entries(groups).flatMap(([group, teams]) => {
    const matches = [];

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const host = HOST_CITIES[matchIndex % HOST_CITIES.length];
        const dayOffset = Math.floor(matchIndex / 4);
        const hour = kickoffHours[matchIndex % kickoffHours.length];
        const day = 11 + dayOffset;

        matches.push({
          id: `${group}-${i + 1}-${j + 1}`,
          group,
          homeTeam: teams[i],
          awayTeam: teams[j],
          label: `${teams[i]}-${teams[j]}`,
          hostCity: host.city,
          hostCountry: host.country,
          hostTimeZone: host.timeZone,
          stadium: host.stadium,
          kickoffLocalISO: `2026-06-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00` });


        matchIndex++;
      }
    }

    return matches;
  });
}

const MATCHES = generateGroupMatches(WORLD_CUP_GROUPS);

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
  const tabs = ["Inicio", "Registro", "Partidos", "Pronósticos", "Ranking", "Administrador"];

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
    React.createElement("h1", null, "Bienvenida a la Quiniela Farrera"), /*#__PURE__*/
    React.createElement("p", { className: "lead" }, "Participa en la Quiniela Farrera del Mundial 2026. Reg\xEDstrate, revisa el calendario, llena tus pron\xF3sticos y env\xEDalos oficialmente cuando est\xE9s seguro."), /*#__PURE__*/




    React.createElement("div", { className: "actions" }, /*#__PURE__*/
    React.createElement("button", { className: "btn red", onClick: () => setActiveTab("Registro") }, "Empezar a jugar"))), /*#__PURE__*/





    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("h2", null, "Paso a paso"), /*#__PURE__*/
    React.createElement("div", { className: "grid grid-4" }, /*#__PURE__*/
    React.createElement("div", { className: "stat" }, /*#__PURE__*/
    React.createElement("strong", null, "1"), /*#__PURE__*/
    React.createElement("span", null, "Reg\xEDstrate con tu nombre y alias.")), /*#__PURE__*/

    React.createElement("div", { className: "stat" }, /*#__PURE__*/
    React.createElement("strong", null, "2"), /*#__PURE__*/
    React.createElement("span", null, "Indica tu pa\xEDs, ciudad y zona horaria.")), /*#__PURE__*/

    React.createElement("div", { className: "stat" }, /*#__PURE__*/
    React.createElement("strong", null, "3"), /*#__PURE__*/
    React.createElement("span", null, "Llena los goles de cada partido.")), /*#__PURE__*/

    React.createElement("div", { className: "stat" }, /*#__PURE__*/
    React.createElement("strong", null, "4"), /*#__PURE__*/
    React.createElement("span", null, "Env\xEDa tus pron\xF3sticos. Luego quedan bloqueados.")))), /*#__PURE__*/




    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("h2", null, "Reglas de puntuaci\xF3n"), /*#__PURE__*/
    React.createElement(ScoringRulesTable, null), /*#__PURE__*/
    React.createElement("div", { className: "notice" }, "Ejemplo: si Inglaterra gana 2-1 a Croacia y pronosticas 2-1, sumas 6 puntos: 3 por 1X2 correcto, 1 por diferencia correcta y 2 por marcador exacto.")), /*#__PURE__*/





    React.createElement("div", { className: "card" }, /*#__PURE__*/
    React.createElement("div", { className: "admin-section-title" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "Calendario de partidos"), /*#__PURE__*/
    React.createElement("p", { className: "small" }, "Fechas y horas en la hora local de la sede del partido.")), /*#__PURE__*/

    React.createElement("span", { className: "badge" }, MATCHES.length, " partidos \xB7 12 grupos")), /*#__PURE__*/


    React.createElement("div", { className: "table-wrap" }, /*#__PURE__*/
    React.createElement("table", null, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("th", null, "Grupo"), /*#__PURE__*/
    React.createElement("th", null, "Partido"), /*#__PURE__*/
    React.createElement("th", null, "Sede"), /*#__PURE__*/
    React.createElement("th", null, "Fecha y hora local de sede"))), /*#__PURE__*/


    React.createElement("tbody", null,
    MATCHES.map((match) => /*#__PURE__*/
    React.createElement("tr", { key: match.id }, /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement("span", { className: "badge" }, match.group)), /*#__PURE__*/

    React.createElement("td", null, /*#__PURE__*/
    React.createElement("strong", null, match.homeTeam), " vs ", /*#__PURE__*/React.createElement("strong", null, match.awayTeam)), /*#__PURE__*/

    React.createElement("td", null,
    match.stadium, /*#__PURE__*/
    React.createElement("br", null), /*#__PURE__*/
    React.createElement("span", { className: "small" },
    match.hostCity, ", ", match.hostCountry)), /*#__PURE__*/


    React.createElement("td", null,
    formatMatchTime(match, match.hostTimeZone), /*#__PURE__*/
    React.createElement("br", null), /*#__PURE__*/
    React.createElement("span", { className: "small" }, match.hostTimeZone))))))), /*#__PURE__*/







    React.createElement("div", { className: "actions", style: { marginTop: 16 } }, /*#__PURE__*/
    React.createElement("button", { className: "btn red", onClick: () => setActiveTab("Registro") }, "Empezar a jugar")))));






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

    alert("Registro guardado.");
    setActiveTab("Partidos");
  }

  return /*#__PURE__*/(
    React.createElement("section", { className: "card" }, /*#__PURE__*/
    React.createElement("h2", null, "Registro"), /*#__PURE__*/
    React.createElement("p", { className: "small" }, "Tu pa\xEDs, ciudad y zona horaria se usan para mostrarte los horarios de los partidos en tu hora local."), /*#__PURE__*/



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
    React.createElement("label", null, "Pa\xEDs donde est\xE1s"), /*#__PURE__*/
    React.createElement("input", { value: form.country, onChange: e => updateField("country", e.target.value) })), /*#__PURE__*/


    React.createElement("div", { className: "form-row" }, /*#__PURE__*/
    React.createElement("label", null, "Ciudad donde est\xE1s"), /*#__PURE__*/
    React.createElement("input", { value: form.city, onChange: e => updateField("city", e.target.value) })), /*#__PURE__*/


    React.createElement("div", { className: "form-row" }, /*#__PURE__*/
    React.createElement("label", null, "Zona horaria"), /*#__PURE__*/
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

  return /*#__PURE__*/(
    React.createElement("section", { className: "card" }, /*#__PURE__*/
    React.createElement("div", { className: "admin-section-title" }, /*#__PURE__*/
    React.createElement("div", null, /*#__PURE__*/
    React.createElement("h2", null, "Partidos"), /*#__PURE__*/
    React.createElement("p", { className: "small" }, "Hora de sede y hora local del participante.")), /*#__PURE__*/



    React.createElement("span", { className: "badge" }, MATCHES.length, " partidos")),


    !participant && /*#__PURE__*/
    React.createElement("div", { className: "notice warning" }, "Reg\xEDstrate primero para mostrar la hora local seg\xFAn tu pa\xEDs y ciudad."), /*#__PURE__*/




    React.createElement("div", { className: "table-wrap" }, /*#__PURE__*/
    React.createElement("table", null, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("th", null, "Grupo"), /*#__PURE__*/
    React.createElement("th", null, "Partido"), /*#__PURE__*/
    React.createElement("th", null, "Sede"), /*#__PURE__*/
    React.createElement("th", null, "Hora local de sede"), /*#__PURE__*/
    React.createElement("th", null, "Tu hora local"))), /*#__PURE__*/


    React.createElement("tbody", null,
    MATCHES.map((match) => /*#__PURE__*/
    React.createElement("tr", { key: match.id }, /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement("span", { className: "badge" }, match.group)), /*#__PURE__*/

    React.createElement("td", null, /*#__PURE__*/
    React.createElement("strong", null, match.homeTeam), " vs ", /*#__PURE__*/React.createElement("strong", null, match.awayTeam)), /*#__PURE__*/

    React.createElement("td", null,
    match.stadium, /*#__PURE__*/
    React.createElement("br", null), /*#__PURE__*/
    React.createElement("span", { className: "small" },
    match.hostCity, ", ", match.hostCountry)), /*#__PURE__*/


    React.createElement("td", null,
    formatMatchTime(match, match.hostTimeZone), /*#__PURE__*/
    React.createElement("br", null), /*#__PURE__*/
    React.createElement("span", { className: "small" }, match.hostTimeZone)), /*#__PURE__*/

    React.createElement("td", null,
    formatMatchTime(match, userTimeZone), /*#__PURE__*/
    React.createElement("br", null), /*#__PURE__*/
    React.createElement("span", { className: "small" },
    participant !== null && participant !== void 0 && participant.city ? `${participant.city}, ${participant.country}` : userTimeZone)))))))));









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
    React.createElement("tr", { key: participant.id }, /*#__PURE__*/
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

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");

  function submit(event) {
    event.preventDefault();

    if (password !== ADMIN_PASSWORD) {
      alert("Contraseña incorrecta.");
      return;
    }

    sessionStorage.setItem(STORAGE_KEYS.adminSession, "true");
    onLogin(true);
  }

  return /*#__PURE__*/(
    React.createElement("section", { className: "card" }, /*#__PURE__*/
    React.createElement("h2", null, "Login de administrador"), /*#__PURE__*/

    React.createElement("p", { className: "code-note" }, "// Seguridad solo para prototipo. En producci\xF3n debe usarse autenticaci\xF3n real, autorizaci\xF3n por roles y backend seguro."), /*#__PURE__*/




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



    activeTab === "Ranking" && /*#__PURE__*/
    React.createElement(RankingTab, { participants: participants, realResults: realResults }),


    activeTab === "Administrador" && /*#__PURE__*/
    React.createElement(AdminTab, {
      participants: participants,
      realResults: realResults,
      setRealResults: setRealResults }))));





}

ReactDOM.createRoot(document.getElementById("root")).render( /*#__PURE__*/React.createElement(App, null));
