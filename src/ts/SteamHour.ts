export interface UserGames {
  game_count: number;
  games: SteamGame[];
  stats?: Stats;
  games60Plus?: SteamGame[];
  games60Minus?: SteamGame[];
  gamesZero?: SteamGame[];
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
}

export interface Stats {
  totalNumberOfGames: number,
  totalNumberOfMinutesPlayed: number,

  games60PlusNum: number,
  games60MinusNum: number,
  gamesZeroNum: number,

  games60PlusPercent: string,
  games60MinusPercent: string,
  gamesZeroPercent: string
}

function getPercent(fraction: number, whole: number): string {
  return (fraction / whole * 100).toFixed(2);
}

export function MakeRequest(steamId: string, includeFreeGames: boolean, callback: (jsonData: UserGames) => void, errorCallback: (error: string) => void) {

  let requestUrl = `./php/getgamelist.php?steamid=${steamId}`;

  if (includeFreeGames)
  {
    requestUrl += "&includefreegames=on";
  }

  // Make request
  fetch(requestUrl)
    .then(response => response.json())
    .then(jsonData => {

      console.log(jsonData);

      if (!jsonData.response)
      {
        errorCallback(jsonData.error);
        return;
      }

      if (Object.keys(jsonData.response).length == 0)
      {
        errorCallback("Empty response; make sure user's privacy settings allow looking at their games.");
        return;
      }

      let newJsonData: UserGames = jsonData.response;
      
      // console.log(newJsonData);
      ProcessResponse(newJsonData);

      callback(newJsonData);
    });

}

function ProcessResponse(jsonData: UserGames): void {

  if (!jsonData.games60Plus) jsonData.games60Plus = [];
  if (!jsonData.games60Minus) jsonData.games60Minus = [];
  if (!jsonData.gamesZero) jsonData.gamesZero = [];

  jsonData.games.forEach((game: SteamGame) => {
    if (game.playtime_forever == 0) {
      jsonData.gamesZero.push(game);
    }
    else if (game.playtime_forever < 60) {
      jsonData.games60Minus.push(game);
    }
    else {
      jsonData.games60Plus.push(game);
    }
  });

  calculateStats(jsonData);
}

function calculateStats(jsonData: UserGames): void {

  jsonData.stats = {
    totalNumberOfGames: jsonData.game_count,
    totalNumberOfMinutesPlayed: 0,

    games60PlusNum: jsonData.games60Plus.length,
    games60MinusNum: jsonData.games60Minus.length,
    gamesZeroNum: jsonData.gamesZero.length,

    games60PlusPercent: getPercent(jsonData.games60Plus.length, jsonData.game_count),
    games60MinusPercent: getPercent(jsonData.games60Minus.length, jsonData.game_count),
    gamesZeroPercent: getPercent(jsonData.gamesZero.length, jsonData.game_count)
  }
}