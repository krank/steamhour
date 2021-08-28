<?php

namespace json {
  // Function for creating error-JSON
  function make_error_json($error_array): string
  {
    if (!is_array($error_array)) {
      $error_array = array("error" => "Error error. Error was erroneous. This is weird.");
    }

    if (!array_key_exists("error", $error_array)) {
      $error_array["error"] = "Weird error. There should be some description here, but there isn't.";
    }

    return json_encode($error_array);
  }

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
    if (curl_error($ch) != "" || $http_response >= 400) {

      // If there is, create an array full of useful info
      $error_array = array(
        'error' => "Error getting the data",
        "curl_errno" => curl_errno($ch),
        "curl_error" => curl_error($ch),
        "http_status" => curl_getinfo($ch, CURLINFO_HTTP_CODE),
      );

      // Exit with a JSON-formatted error
      exit(make_error_json($error_array));
    }

    // Close curl and return the data
    curl_close($ch);

    return $data;
  }
}

?>