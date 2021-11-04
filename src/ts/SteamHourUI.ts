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

  updateOverallStats(jsonData.stats);

  // Create columns, including making sorters work

  document.querySelector("section.summary").classList.add("active");
}

function displayError(error: string) {
  document.querySelector("section.error p").textContent = error;
  document.querySelector("section.error").classList.add("active");
}

function updateOverallStats(stats: SteamHour.Stats) {

  document.querySelector("section.summary span.games_num")
    .textContent = stats.totalNumberOfGames.toString();
  document.querySelector("section.summary span.total_minutes")
    .textContent = stats.totalNumberOfMinutesPlayed.toString();

  updateStat("sixtyplus", stats.games60PlusNum, stats.games60PlusPercent);
  updateStat("lessthansixty", stats.games60MinusNum, stats.games60MinusPercent);
  updateStat("zerominutes", stats.gamesZeroNum, stats.gamesZeroPercent);

}

function updateStat(baseSelector: string, num: number, percent: string): void {
  document.querySelector(`section.summary span.${baseSelector}.num`)
    .textContent = num.toString();
  document.querySelector(`section.summary span.${baseSelector}.percent`)
    .textContent = percent;
}

// Function for setting the game list of a column – used initially & by sorters
// Clears the old content, reads the list, sorts it according to what's wanted, generates html
