const sheetId = "1anWPcNxxjs9bMjxgwey9P8FNm4_usHGr";
const formations = {
  433: [["AT", "AT", "AT"], ["MF", "MF", "MF"], ["DF", "DF", "DF", "DF"], ["GK"]],
  4231: [["AT"], ["MF", "MF", "MF"], ["MF", "MF"], ["DF", "DF", "DF", "DF"], ["GK"]],
  442: [["AT", "AT"], ["MF", "MF", "MF", "MF"], ["DF", "DF", "DF", "DF"], ["GK"]],
  352: [["AT", "AT"], ["MF", "MF", "MF", "MF", "MF"], ["DF", "DF", "DF"], ["GK"]],
};
let players = [], slots = [], activeSlot = null, search = "";
const positionGroup = (position) => ({ GK: "GK", CB: "DF", LB: "DF", RB: "DF", LWB: "DF", RWB: "DF", DM: "MF", CM: "MF", AM: "MF", AMC: "MF", AMF: "MF", LW: "AT", RW: "AT", ST: "AT", CF: "AT", FW: "AT" })[position] || "Other";
const positionOrder = { GK: 0, DF: 1, MF: 2, AT: 3, Other: 4 };

function getPlayers() {
  const callback = `ycacPlayers_${Date.now()}`;
  const query = new URLSearchParams({ tqx: `out:json;responseHandler:${callback}`, sheet: "Players" });
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const cleanup = () => { script.remove(); delete window[callback]; };
    window[callback] = (response) => { cleanup(); if (response.status !== "ok") { reject(new Error("Could not load players")); return; } const headers = response.table.cols.map((column) => column.label); resolve(response.table.rows.map((row) => Object.fromEntries(headers.map((header, index) => [header, row.c[index]?.v ?? ""]))).filter((player) => player.active !== false)); };
    script.onerror = () => { cleanup(); reject(new Error("Could not load players")); };
    script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${query}`;
    document.head.append(script);
  });
}

function resetFormation() { slots = formations[document.querySelector("#formation").value].flat().map((role, index) => ({ id: index, role, playerId: null })); activeSlot = null; document.querySelector("#formation-name").textContent = document.querySelector("#formation").selectedOptions[0].text; document.querySelector("#picker-status").textContent = "Formation ready. Choose a pitch slot, then select a player."; render(); }
function renderPitch() { const groups = []; for (const row of formations[document.querySelector("#formation").value]) groups.push(slots.splice(0, row.length)); slots = groups.flat(); document.querySelector("#pitch").innerHTML = groups.map((row) => `<div class="pitch-row">${row.map((slot) => { const player = players.find((item) => item.player_id === slot.playerId); return `<button class="slot ${player ? "assigned" : ""} ${activeSlot === slot.id ? "active" : ""}" type="button" data-slot="${slot.id}" aria-label="${slot.role} slot">${player ? `<span class="slot-number">${player.shirt_number || ""}</span><span class="slot-name">${player.display_name}</span>` : `<span class="slot-role">${slot.role}</span>`}</button>`; }).join("")}</div>`).join(""); document.querySelectorAll(".slot").forEach((button) => button.addEventListener("click", () => { activeSlot = Number(button.dataset.slot); document.querySelector("#picker-status").textContent = `Select a player for the ${slots[activeSlot].role} slot.`; render(); })); }
function renderRoster() { const selected = new Set(slots.map((slot) => slot.playerId).filter(Boolean)); const visible = players.filter((player) => player.display_name.toLocaleLowerCase().includes(search)); const groups = ["GK", "DF", "MF", "AT", "Other"]; document.querySelector("#roster").innerHTML = groups.map((group) => { const groupPlayers = visible.filter((player) => positionGroup(player.primary_position) === group); if (!groupPlayers.length) return ""; return `<section class="roster-group"><h3>${group}</h3><div class="player-list">${groupPlayers.map((player) => `<button class="player-card ${selected.has(player.player_id) ? "selected" : ""}" type="button" data-player="${player.player_id}"><span class="player-number">${player.shirt_number || "–"}</span><span class="player-name">${player.display_name}</span><span class="player-position">${player.primary_position || group}</span></button>`).join("")}</div></section>`; }).join("") || `<p class="loading">No players found.</p>`; document.querySelectorAll(".player-card").forEach((button) => button.addEventListener("click", () => assignPlayer(button.dataset.player))); }
function assignPlayer(playerId) { const current = slots.find((slot) => slot.playerId === playerId); if (current) current.playerId = null; const player = players.find((item) => item.player_id === playerId); let target = activeSlot === null ? slots.find((slot) => !slot.playerId && slot.role === positionGroup(player.primary_position)) : slots[activeSlot]; target ||= slots.find((slot) => !slot.playerId); if (!target) { document.querySelector("#picker-status").textContent = "The XI is full. Select a pitch slot to replace a player."; render(); return; } target.playerId = playerId; activeSlot = null; document.querySelector("#picker-status").textContent = `${player.display_name} added to the XI.`; render(); }
function renderOutput() { const selected = slots.filter((slot) => slot.playerId); document.querySelector("#selected-count").textContent = selected.length; document.querySelector("#lineup-output").textContent = selected.length ? `${document.querySelector("#formation").selectedOptions[0].text} · ${selected.map((slot) => players.find((player) => player.player_id === slot.playerId).display_name).join(" · ")}` : "Your selected XI will appear here."; }
function render() { renderPitch(); renderRoster(); renderOutput(); }

document.querySelector("#formation").addEventListener("change", resetFormation);
document.querySelector("#clear-squad").addEventListener("click", resetFormation);
document.querySelector("#player-search").addEventListener("input", (event) => { search = event.target.value.trim().toLocaleLowerCase(); renderRoster(); });
document.querySelector("#copy-squad").addEventListener("click", async () => { const text = document.querySelector("#lineup-output").textContent; if (!slots.some((slot) => slot.playerId)) return; await navigator.clipboard.writeText(`YC&AC Pulse Starting XI\n${text}`); document.querySelector("#picker-status").textContent = "Lineup copied to your clipboard."; });
getPlayers().then((data) => { players = data.sort((a, b) => positionOrder[positionGroup(a.primary_position)] - positionOrder[positionGroup(b.primary_position)] || a.display_name.localeCompare(b.display_name)); resetFormation(); }).catch(() => { document.querySelector("#roster").innerHTML = `<p class="loading">The squad could not be loaded. Please try again.</p>`; });
