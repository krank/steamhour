<?php

namespace steam {

  function resolve_vanity_url($vanity_url, $apikey): string
  {
    // Construct URL for getting id from vanity url
    $url = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=$apikey&vanityurl=$vanity_url";

    // Get json data
    $json_data = \json\get_json_from($url);

    // Decode json
    $response_data = json_decode($json_data);

    // If successful return the id, otherwise exit with a JSON-formatted error
    if ($response_data->response->success == 1) {

      return $response_data->response->steamid;
    } else {
      $error_array = array('error' => "Could not resolve vanity URL $vanity_url");

      exit(\json\make_error_json($error_array));
    }
  }

  function get_owned_games(string $steam_id, int $include_free_games, string $apikey)
  {
    $url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=$apikey&include_appinfo=1&include_played_free_games=$include_free_games&steamid=$steam_id&format=json";

    $json_data = \json\get_json_from($url);

    return $json_data;
  }
}
