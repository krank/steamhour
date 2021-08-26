<?php

// Function for getting json data from http resource via CURL
function get_json_from($url): string
{
    // Init curl and set some options
    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 7);
    curl_setopt($ch, CURLOPT_FAILONERROR, true);

    // Execute curl
    $data = curl_exec($ch);

    // Get HTTP response
    $http_response = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    // Check to see if there's an error
    if (curl_error($ch) != '' || $http_response >= 400) {

        // If there is, create an array full of useful info
        $error_array = array('error' => "Error getting the data",
            'curl_errno' => curl_errno($ch),
            'curl_error' => curl_error($ch),
            'http_status' => curl_getinfo($ch, CURLINFO_HTTP_CODE),
        );

        // Encode the array into json
        $data = json_encode($error_array);
    }

    // Close curl and return the data
    curl_close($ch);
    return $data;
}

function get_steamid($name, $apikey): string
{
    // Construct URL for getting id from vanity url
    $url = "http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=$apikey&vanityurl=$name";

    // Get json data
    $jsondata = get_json($url);

    // Decode json
    $response_data = json_decode($jsondata);

    // Return decoded response
    return $response_data->response;
}
