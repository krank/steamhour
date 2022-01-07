!function r(o,a,s){function u(t,e){if(!a[t]){if(!o[t]){var n="function"==typeof require&&require;if(!e&&n)return n(t,!0);if(m)return m(t,!0);throw(n=new Error("Cannot find module '"+t+"'")).code="MODULE_NOT_FOUND",n}n=a[t]={exports:{}},o[t][0].call(n.exports,function(e){return u(o[t][1][e]||e)},n,n.exports,r,o,a,s)}return a[t].exports}for(var m="function"==typeof require&&require,e=0;e<s.length;e++)u(s[e]);return u}({1:[function(e,t,n){"use strict";function a(e,t){e.num=e.games.length,e.percent=(e.games.length/t*100).toFixed(2)}n.__esModule=!0,n.MakeRequest=void 0,n.MakeRequest=function(e,t,n,o){e="./php/getgamelist.php?steamid="+e,t&&(e+="&includefreegames=on"),fetch(e).then(function(e){return e.json()}).then(function(e){var t,r;console.log(e),e.response?0!=Object.keys(e.response).length?(t=e.response,(r=t).games_60_plus={games:[],num:0,percent:""},r.games_60_minus={games:[],num:0,percent:""},r.games_zero={games:[],num:0,percent:""},r.games.sort(function(e,t){return e.playtime_forever==t.playtime_forever?e.name.localeCompare(t.name):t.playtime_forever-e.playtime_forever}),r.games.forEach(function(e){var t,n;0==e.playtime_forever?r.games_zero.games.push(e):e.playtime_forever<60?r.games_60_minus.games.push(e):(t=Math.floor(e.playtime_forever/60),n=e.playtime_forever%60,e.playtime_natural_language=t+"h"+n+"m",r.games_60_plus.games.push(e))}),r.stats={total_number_of_games:r.game_count,total_number_of_minutes_played:0},a(r.games_60_plus,r.game_count),a(r.games_60_minus,r.game_count),a(r.games_zero,r.game_count),n(t)):o("Empty response; make sure user's privacy settings allow looking at their games."):o(e.error)})}},{}],2:[function(e,t,n){"use strict";n.__esModule=!0,n.setup=void 0;var r=e("./SteamHour");function o(e,t){document.querySelector("section.games").innerHTML="",document.querySelector("section.summary").classList.remove("active"),document.querySelector("section.error").classList.remove("active"),a(!0),r.MakeRequest(e,t,s,u)}function a(e){e?document.querySelector("section.loading").classList.add("active"):document.querySelector("section.loading").classList.remove("active")}function s(e){a(!1),n=e,document.querySelector("section.summary span.games_num").textContent=n.stats.total_number_of_games.toString(),document.querySelector("section.summary span.total_minutes").textContent=n.stats.total_number_of_minutes_played.toString(),m("sixtyplus",n.games_60_plus),m("lessthansixty",n.games_60_minus),m("zerominutes",n.games_zero);var t=i("60+ minutes",e.games_60_plus),n=i("1–59 minutes",e.games_60_minus),e=i("0 minutes",e.games_zero);document.querySelector("section.games").appendChild(t),document.querySelector("section.games").appendChild(n),document.querySelector("section.games").appendChild(e),document.querySelector("section.summary").classList.add("active")}function u(e){a(!1),document.querySelector("section.error p").textContent=e,document.querySelector("section.error").classList.add("active")}function m(e,t){document.querySelector("section.summary span."+e+".num").textContent=t.num.toString(),document.querySelector("section.summary span."+e+".percent").textContent=t.percent}function i(e,t){var n=document.querySelector("template.column"),n=document.importNode(n,!0).content;n.querySelector("h2").textContent=e,n.querySelector("span.num").textContent=t.num.toString(),n.querySelector("span.percent").textContent=t.percent;var r=n.querySelector("section.gamelist");return t.games.forEach(function(e){e=function(e){console.log(e);var t=document.querySelector("template.game"),n=document.importNode(t,!0).content;n.querySelector("h3").textContent=e.name,n.querySelector("img.gameicon").setAttribute("src","http://media.steampowered.com/steamcommunity/public/images/apps/"+e.appid+"/"+e.img_icon_url+".jpg");var r=n.querySelector(".gametime"),t=n.querySelector(".gametime_hrs");0<e.playtime_forever?r.textContent=e.playtime_forever.toString()+" minutes":r.remove();60<=e.playtime_forever?t.textContent=e.playtime_natural_language:t.remove();return n}(e);r.appendChild(e)}),n}n.setup=function(){var e,t=document.querySelector("form.steamid"),n=(e=new URL(window.location.toString())).searchParams.get("steamid"),r=null!=e.searchParams.get("includefreegames");null!=n&&0<n.length&&o(n,r),e=t,r=r,null==(n=n)&&!r||(e.querySelector("input[name=steamid]").value=n,e.querySelector("input[name=includefreegames]").checked=r),t.addEventListener("submit",function(e){e.preventDefault();var t=new FormData(e.target),n=t.get("steamid"),e="on"===t.get("includefreegames");o(n,e);t=new URL(window.location.toString());t.searchParams.set("steamid",n),t.searchParams.delete("includefreegames"),e&&t.searchParams.append("includefreegames","on"),window.history.pushState(null,null,t.toString())})}},{"./SteamHour":1}],3:[function(e,t,n){"use strict";n.__esModule=!0,e("./SteamHourUI").setup()},{"./SteamHourUI":2}]},{},[3]);
//# sourceMappingURL=bundle.js.map
