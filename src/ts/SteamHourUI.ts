import * as SteamHour from "./SteamHour";

export function setup() {

  let form: HTMLFormElement = document.querySelector("form.steamid");
  let url: URL = new URL(window.location.toString());

  let steamId: string = url.searchParams.get("steamid");
  let includeFreeGames: boolean = url.searchParams.get("includefreegames") == null ? false : true;


  if (steamId != null && steamId.length > 0) {
    makeRequest(steamId, includeFreeGames, displayResults, displayError);
  }

  updateForm(form, steamId, includeFreeGames);

  setupFormInteractivity(form);
}

function updateForm(form: HTMLFormElement, steamId: string, includeFreeGames: boolean) {
  if (steamId != null || includeFreeGames) {
    let inputBox: HTMLInputElement = form.querySelector("input[name=steamid]");
    inputBox.value = steamId;

    let freeGamesCheckbox: HTMLInputElement = form.querySelector("input[name=includefreegames]");
    freeGamesCheckbox.checked = includeFreeGames;
  }
}

function setupFormInteractivity(form: HTMLFormElement) {
  form.addEventListener("submit", (event: Event) => {
    event.preventDefault();

    let formData: FormData = new FormData(event.target as HTMLFormElement);

    let steamId: string = formData.get("steamid") as string;
    let includeFreeGames: boolean = formData.get("includefreegames") === "on";

    makeRequest(steamId, includeFreeGames, displayResults, displayError);

    let url: URL = new URL(window.location.toString());
    url.searchParams.set("steamid", steamId);

    url.searchParams.delete("includefreegames");
    if (includeFreeGames) {
      url.searchParams.append("includefreegames", "on");
    }

    window.history.pushState(null, null, url.toString());
  });
}

function makeRequest(steamId: string, includeFreeGames: boolean, callback: (jsonData: SteamHour.UserGames) => void, errorCallback: (error: string) => void) {

  document.querySelector("section.error").classList.remove("active");
  document.querySelector("section.summary").classList.remove("active");

  SteamHour.MakeRequest(steamId, includeFreeGames, displayResults, displayError);
}

function displayResults(jsonData: SteamHour.UserGames) {

  updateOverallStats(jsonData);

  let column60Plus: DocumentFragment = makeColumn("60+ minutes", jsonData.games60Plus);
  let column60Minus: DocumentFragment = makeColumn("1–59 minutes", jsonData.games60Minus);
  let columnZero: DocumentFragment = makeColumn("0 minutes", jsonData.gamesZero);

  document.querySelector("section.games").appendChild(column60Plus);
  document.querySelector("section.games").appendChild(column60Minus);
  document.querySelector("section.games").appendChild(columnZero);

  document.querySelector("section.summary").classList.add("active");
}

function displayError(error: string) {
  document.querySelector("section.error p").textContent = error;
  document.querySelector("section.error").classList.add("active");
}

function updateOverallStats(jsonData: SteamHour.UserGames) {

  document.querySelector("section.summary span.games_num")
    .textContent = jsonData.stats.totalNumberOfGames.toString();
  document.querySelector("section.summary span.total_minutes")
    .textContent = jsonData.stats.totalNumberOfMinutesPlayed.toString();

  updateStat("sixtyplus",jsonData.games60Plus);
  updateStat("lessthansixty", jsonData.games60Minus);
  updateStat("zerominutes", jsonData.gamesZero);

}

function updateStat(baseSelector: string, gameCollection:SteamHour.GameCollection): void {
  document.querySelector(`section.summary span.${baseSelector}.num`)
    .textContent = gameCollection.num.toString();
  document.querySelector(`section.summary span.${baseSelector}.percent`)
    .textContent = gameCollection.percent;
}

function makeColumn(headerText: string, gameCollection: SteamHour.GameCollection): DocumentFragment {

  let columnTemplate: HTMLTemplateElement = document.querySelector("template.column");
  let column: DocumentFragment = document.importNode(columnTemplate, true).content;

  column.querySelector("h2").textContent = headerText;
  column.querySelector("span.num").textContent = gameCollection.num.toString();
  column.querySelector("span.percent").textContent = gameCollection.percent;

  return column;
}

// Function for setting the game list of a column – used initially & by sorters
// Clears the old content, reads the list, sorts it according to what's wanted, generates html
