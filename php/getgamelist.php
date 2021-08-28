<?php

include_once "settings.php";
include_once "steam.php";
include_once "json.php";


/**
 * INITIAL SETUP
 */

 // Set variables from the HTTP request
$steam_id = $_REQUEST["steamid"];
$include_free_games = $_REQUEST["includefreegames"];

// Declare this page to be a JSON document
header('Content-type: application/json');

/**
 * STEAM ID CHECKING
 */

// Check if steam id was provided
if (!$steam_id) {
  $error_array = array('error' => "No steam ID or vanity URL provided.");
  exit(json\make_error_json($error_array));
}

// Check if given steam id was numeric
if (!ctype_digit($steam_id)) {

  // Assume the id provided was a vanity URL
  $vanity = $steam_id;

  // Attempt to resolve the vanity URL
  $result = steam\resolve_vanity_url($vanity, $APIKEY);

  if (strlen($result) == 0) {
    $error_array = array('error' => "Schrödinger's error. The attempt to resolve the vanity URL $vanity reported successful, but we got a zero-length result. Weird.");
    exit(json\make_error_json($error_array));
  } else {
    $steam_id = $result;
  }
}

// Just to be absolutely sure.
if (!ctype_digit($steam_id)) {
  $error_array = array('error' => "Shrödinger's error. The vanity URL was resolved (otherwise this bit wouldn't be executed), but still it wasn't, as the steam id variable still does not consist of numbers.");
  exit(json\make_error_json($error_array));
}

/**
 * CHECKING IF FREE GAMES SHOULD BE INCLUDED
 */

$include_free_games = $include_free_games == "on" ? 1 : 0;

/**
 * GET & OUTPUT THE GAMES LIST
 */

$result = steam\get_owned_games($steam_id, $include_free_games, $APIKEY);
print($result);