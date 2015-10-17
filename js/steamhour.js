/*jslint browser: true*/
/*global  $*/

var sixtyplus,
    lessthansixty,
    zerominutes;

/* ----------------------------------------------------------------------------
 * UTILITY FUNCTIONS
 */
function minutesToHours(minutes) {
    'use strict';
    return "(" +
        Math.floor(minutes / 60) + "h" +
        minutes % 60 + "m)";
}

function getPercent(num, data) {
    'use strict';
    
    /* Return the ratio between the given number and the total amout of games
    in data set, expressed as a percentage */
    return (num / data.response.game_count * 100).toFixed(2);
}

function displayError(errorText) {
    'use strict';

    $(".errortext").text(errorText);
    $(".error").addClass("fadeIn");

}

/* ----------------------------------------------------------------------------
 * GAME DATA HANDLING
 */
function insertGameData(targetElement, gameList) {
    'use strict';

    var i,
        gameProto,
        gameElement,
        gameData,
        iconUrl;

    // Create prototype game element

    $(targetElement).find(".game").remove();

    gameProto = $('<div class="game">' +
        '<img class="gameicon">' +
        '<p class="gametitle"></p>' +
        '<p class="gametime"></p>' +
        '<p class="gametime_hrs"></p>' +
        '</div>');


    // use prototype to create list of games
    for (i = 0; i < gameList.length; i += 1) {
        gameElement = gameProto.clone();
        gameData = gameList[i];


        // Generate icon URL
        if (gameData.img_icon_url !== "") {
            iconUrl = "http://media.steampowered.com/steamcommunity/public/images/apps/" +
                gameData.appid + "/" +
                gameData.img_icon_url + ".jpg";
        } else {
            iconUrl = "images/no_icon.png";
        }



        // Insert game data
        gameElement.find(".gameicon").attr("src", iconUrl).attr("alt", gameData.name);
        gameElement.find(".gametitle").text(gameData.name);

        if (gameData.playtime_forever > 0) {
            gameElement.find(".gametime").text(gameData.playtime_forever + " minutes");
            if (gameData.playtime_forever > 60) {
                gameElement.find(".gametime_hrs").text(
                    minutesToHours(gameData.playtime_forever)
                );
            }
        }

        // Insert the element
        gameElement.appendTo(targetElement);

    }
}

/* ----------------------------------------------------------------------------
 * SORTING FUNCTIONS
 */

function sortGames(gameList, sorterElement, sorterFunction, containerElement, forcedReverse) {
    'use strict';

    gameList = gameList.sort(sorterFunction);

    $(sorterElement).siblings().removeClass('reverse');

    if ($(sorterElement).hasClass("reverse") || forcedReverse) {
        gameList = gameList.reverse();
        $(sorterElement).removeClass("reverse");
    } else {
        $(sorterElement).addClass("reverse");
    }

    insertGameData(containerElement, gameList);

    return gameList;

}

function sortGameAlpha(gameA, gameB) {
    'use strict';

    if (gameA.name.toLowerCase() > gameB.name.toLowerCase()) {
        return 1;
    }
    if (gameA.name.toLowerCase() < gameB.name.toLowerCase()) {
        return -1;
    }
    // a must be equal to b
    return 0;
}

function sortGameTime(gameA, gameB) {
    'use strict';

    // If play times are equal, use game names as keys)
    if (gameA.playtime_forever === gameB.playtime_forever) {
        return sortGameAlpha(gameA, gameB);
    }

    return (gameA.playtime_forever - gameB.playtime_forever);
}


/* ----------------------------------------------------------------------------
 * MAIN CODE
 */

$(document).ready(function () {
    'use strict';

    var i, query, vars, pair, steamid, freegames;

    $('form.steamid').submit(function (e) {

        // Prevent normal form things
        e.preventDefault();

        // Display the loading spinner
        //$(".loading").fadeIn();
        
        $(".loading").fadeIn();

        $(".error").fadeOut();
        $(".summary").slideUp();
        $(".column").slideUp();


        var steamstr = $(this).serialize();

        //Change the URL
        history.pushState(null, null, "?" + steamstr);


        // Create and execute the ajax call
        $.ajax({
            type: 'POST',
            cache: false,
            url: 'getgamelist.php',
            dataType: 'json',
            data: steamstr,
            success: function (data) {

                var errorText,
                    totalminutes;

                $(".loading").slideUp(1000);

                if (data.hasOwnProperty("error")) {

                    errorText = data.error;

                    if (data.hasOwnProperty("curl_error")) {
                        errorText += " (" + data.curl_error + ")";
                    }

                    displayError(errorText);

                    return; // Early return
                }

                if (Object.keys(data.response).length === 0) {
                    displayError("User's profile is likely marked as private and cannot be retrieved.");
                    return;
                }

                if (data.response.game_count === 0) {
                    displayError("User either owns no games or has their profile marked as private.");
                    return;
                }


                // Add all games' minutes together
                totalminutes = 0;

                // Make list of games with play time of >= 60
                sixtyplus = data.response.games.filter(function (game) {

                    // Hijack this loop to calculate total playtime
                    totalminutes += game.playtime_forever;

                    // Return only games with playtime of >=60
                    return game.playtime_forever >= 60;

                });


                // Make list of games with play time of >0 but <60                
                lessthansixty = data.response.games.filter(function (game) {
                    return game.playtime_forever > 0 && game.playtime_forever < 60;
                });

                // Make list of games with zero play time
                zerominutes = data.response.games.filter(function (game) {
                    return game.playtime_forever === 0;
                });



                // Set numerics
                $('.games.num').text(data.response.game_count);
                $('.sixtyplus.num').text(sixtyplus.length);
                $('.lessthansixty.num').text(lessthansixty.length);
                $('.zerominutes.num').text(zerominutes.length);

                // Set total minutes
                $('.total_minutes').text(totalminutes + " " + minutesToHours(totalminutes));

                // Set percentages
                $('.sixtyplus.percent').text(getPercent(sixtyplus.length, data));
                $('.lessthansixty.percent').text(getPercent(lessthansixty.length, data));
                $('.zerominutes.percent').text(getPercent(zerominutes.length, data));

                // Sort and show games
                sixtyplus = sortGames(sixtyplus, $(".sixtyplus.games .sorters a.bytime"), sortGameTime, '.sixtyplus.games', true);
                lessthansixty = sortGames(lessthansixty, $(".lessthansixty.games .sorters a.bytime"), sortGameTime, '.lessthansixty.games', true);
                zerominutes = sortGames(zerominutes, $(".zerominutes.games .sorters a.byname"), sortGameAlpha, '.zerominutes.games', true);




                $(".summary").slideDown();
                $(".column").slideDown();

            },
            error: function (data, text, error) {
                displayError("was error: " + text + error);
            }
        });
    });

    // Set up sorter links

    $(".sixtyplus.games .sorters a.byname").click(function (e) {
        e.preventDefault();

        sixtyplus = sortGames(sixtyplus, this, sortGameAlpha, '.sixtyplus.games');

    });

    $(".sixtyplus.games .sorters a.bytime").click(function (e) {
        e.preventDefault();

        sixtyplus = sortGames(sixtyplus, this, sortGameTime, '.sixtyplus.games');

    });

    $(".lessthansixty.games .sorters a.byname").click(function (e) {
        e.preventDefault();

        lessthansixty = sortGames(lessthansixty, this, sortGameAlpha, '.lessthansixty.games');

    });

    $(".lessthansixty.games .sorters a.bytime").click(function (e) {
        e.preventDefault();

        lessthansixty = sortGames(lessthansixty, this, sortGameTime, '.lessthansixty.games');

    });

    $(".zerominutes.games .sorters a.byname").click(function (e) {
        e.preventDefault();

        zerominutes = sortGames(zerominutes, this, sortGameAlpha, '.zerominutes.games');

    });



    // See if steamid has been requested by the URL

    query = window.location.search.substring(1);

    vars = query.split("&");

    for (i = 0; i < vars.length; i += 1) {
        pair = vars[i].split("=");

        switch (decodeURIComponent(pair[0]).toLowerCase()) {

        case "steamid":
            steamid = decodeURIComponent(pair[1]);
            break;
        case "includefreegames":
            $('#freegames').prop('checked', decodeURIComponent(pair[1]));
            break;
        }
    }
    
    if (steamid) {
        $("#steamid").attr("value", steamid);
        $('form.steamid').submit();
    }


});