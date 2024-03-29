export interface UserGames {
  game_count: number;
  games: SteamGame[];
  playtime_forever: number;
  playtime_natural_language: string;
  games_60_plus?: GameCollection;
  games_60_minus?: GameCollection;
  games_zero?: GameCollection;
}

export interface GameCollection {
  games: SteamGame[];
  num: number;
  percent: string;
}

export interface SteamGame {
  appid: number;
  img_icon_url: string;
  img_logo_url: string;
  name: string;
  playtime_forever: number;
  playtime_linux_forever: number;
  playtime_mac_forever: number;
  playtime_windows_forever: number;
  playtime_natural_language: string;
}

function getPercent(fraction: number, whole: number): string {
  return (fraction / whole * 100).toFixed(2);
}

export function MakeRequest(steamId: string, includeFreeGames: boolean, callback: (jsonData: UserGames) => void, errorCallback: (error: string) => void) {

  let requestUrl = `./php/getgamelist.php?steamid=${steamId}`;

  if (includeFreeGames) {
    requestUrl += "&includefreegames=on";
  }

  // Make request
  fetch(requestUrl)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      else {
        errorCallback(`HTTP error: ${response.status} ${response.statusText}`);
        return;
      }
    })
    .then(jsonData => {
      if (jsonData !== undefined) {

        if (!jsonData.response) {
          errorCallback(jsonData.error);
          return;
        }

        if (Object.keys(jsonData.response).length == 0) {
          errorCallback("Empty response; make sure user's privacy settings allow looking at their games.");
          return;
        }

        let newJsonData: UserGames = jsonData.response;

        ProcessResponse(newJsonData);

        callback(newJsonData);
      }
    });

}

function ProcessResponse(jsonData: UserGames): void {

  jsonData.games_60_plus = { games: [], num: 0, percent: "" };
  jsonData.games_60_minus = { games: [], num: 0, percent: "" };
  jsonData.games_zero = { games: [], num: 0, percent: "" };

  jsonData.playtime_forever = 0;
  jsonData.playtime_natural_language = "";

  // Sort based on (reverse) playtime first, then name

  jsonData.games.sort((gameA: SteamGame, gameB: SteamGame) =>
    gameA.playtime_forever == gameB.playtime_forever ?
      gameA.name.localeCompare(gameB.name) :
      gameB.playtime_forever - gameA.playtime_forever
  );

  jsonData.games.forEach((game: SteamGame) => {

    // Add playtime to total
    jsonData.playtime_forever += game.playtime_forever;

    // Categorize based on playtime
    if (game.playtime_forever == 0) {
      jsonData.games_zero.games.push(game);
    }
    else if (game.playtime_forever < 60) {
      jsonData.games_60_minus.games.push(game);
    }
    else {
      game.playtime_natural_language = getNaturalTime(game.playtime_forever);
      jsonData.games_60_plus.games.push(game);
    }
  });

  jsonData.playtime_natural_language = getNaturalTime(jsonData.playtime_forever);



  calculateStat(jsonData.games_60_plus, jsonData.game_count);
  calculateStat(jsonData.games_60_minus, jsonData.game_count);
  calculateStat(jsonData.games_zero, jsonData.game_count);
}

function calculateStat(gameCollection: GameCollection, gameCount: number) {
  gameCollection.num = gameCollection.games.length;
  gameCollection.percent = getPercent(gameCollection.games.length, gameCount);
}

// Time conversion to natural language (XXhYYm)
function getNaturalTime(minutes: number): string {
  let hours: number = Math.floor(minutes / 60);
  let mins: number = minutes % 60;
  return `${hours}h${mins}m`;
}