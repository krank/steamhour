<?php

include_once "settings.php";

// Declare this page to be a JSON document
header('Content-type: application/json');


// Function for getting json data from http resource via CURL
function get_json($url) {
    
    // Init curl and set some options
	$ch = curl_init();
	
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 7);
    curl_setopt($ch, CURLOPT_FAILONERROR,true);
    
    // Set url to get
    curl_setopt($ch, CURLOPT_URL, $url);
    
    // Execute curl
	$data = curl_exec($ch);
    
    // Check to see if there's an error
    if (curl_errno($ch) != 0) {
        
        // If there is, create an array full of useful info
        
        $error_array = array('error' => "Error getting the data",
                             'curl_errno' => curl_errno($ch),
                             'curl_error' => curl_error($ch),
                             'http_status' => curl_getinfo($ch, CURLINFO_HTTP_CODE)
                            );
        
        // Encode the array into json
        $data = json_encode($error_array);
    }

    // Close curl and return the data
	curl_close($ch);
	return $data;
}

function get_steamid($name, $apikey) {
    
    // Construct URL for getting id from vanity url
    $url = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=$apikey&vanityurl=$name";
    
    // Get json data
    $jsondata = get_json($url);
    
    // Decode json
    $response_data = json_decode($jsondata);
    
    // Return decoded response
    return $response_data->response;
    
}


if(isset($_POST["steamid"]) && strlen($_POST["steamid"]) > 0){
    
    // Get Steam-id from post
    $steamid = $_POST["steamid"];

    // If Steam-id isn't numerical try to get numerical steam-id by treating
    // the id as a vanity url.
    if (!ctype_digit($steamid)) {

        // Try to get the id
        $userinfo = get_steamid($steamid, $APIKEY);

        // if the request was successful, set the steam id
        if ($userinfo->success == "1") {

            $steamid = $userinfo->steamid;

        // If it was not, generate an error and insert it into the jsondata in 
        // place of the game list.
        } else {
            $error_array = array('error' => "Non-numerical characters detected. Unable to find a steamid connected to that nickname/vanity url");
            $jsondata = json_encode($error_array);
        }

    }

    // If the steam-id is numerical, attempt to get the list of games
    if (ctype_digit($steamid)) {
        
        // Determine wether or not to include free games
        $includefreegames = 0;
        if (isset($_POST["includefreegames"]) && $_POST["includefreegames"] == "on") {
            $includefreegames = 1;
        }
        
        // Construct the URL
        $url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=$APIKEY&include_appinfo=1&include_played_free_games=$includefreegames&steamid=$steamid&format=json";

        // Get the data from the Steam API
        $jsondata = get_json($url);

    }

    // Output the data
    echo $jsondata;
    
} else {
    // If id wasn't specified or was empty, create and encode an error array.
    $error_array = array('error' => "No steam id specified");
    echo json_encode($error_array);
}

exit();

?>