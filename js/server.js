// Ask if we want to reset game state
//if (confirm("Press a button!")) {
//} else { // delete
//}

// State variables
ACTIVE_TEAM = null; // 1 indexed
ROUND = 0;
POINTS = null;
ACTIVE_CELL = null;

CAN_SCORE = false;

// Identifies a previously existing client window
function getWinName(url){
  return "win" + url.replace(/[^A-Za-z0-9\-\_]*/g,"");
}

// Issues a command to the client window
function sendCommand(cmd, data) {
  if (window[cmd]) window[cmd](data)
  clientScreen.postMessage({cmd: cmd, content: data}, "*")
}

function runGame(game) {
  if (game.type == 'rebus') {
    sendCommand('showScores', true);
    sendCommand('buildRebus', game);
    sendCommand('sizeStaticElements');
  }

  else if (game.type == 'intermission') {
    sendCommand('showIntermission', game);
  }

  else {
    alert('[ERROR] Unknown game type requested: ' + game.type)
  }

  // TODO: update the value of the game mode select
  //$("#rounds").val();
}



// Reference to the client window
var clientScreen = window.open("client.html", getWinName("client.html"), "toolbar=0,location=0,menubar=0")
if (!clientScreen) alert("ERROR: Pop-up blocker seems to be enabled. Please allow popups for the client")

function initialize() {
  localStorage.scores = JSON.stringify(Array.apply(null, Array(CONFIG.teams.length)).map(Number.prototype.valueOf,0));
  $.each(GAMES, function(i,v){ $('<option/>', {
      value: i,
      html: v.name
    }).appendTo("#rounds")
  })
}

// Allow client to initialize
setTimeout(function(){
  sendCommand('initialize');
  runGame(GAMES[ROUND]);

}, 150);



// Action Handlers

function updatePoints(team, points) {
  var scores = JSON.parse(localStorage.scores);
  scores[team] += points;
  localStorage.scores = JSON.stringify(scores);
  sendCommand('updateScores', scores)
}

function correct(){
  //if (!CAN_SCORE) alert('score fault'); return;
  var game = GAMES[ROUND];
  sendCommand('hideQuestion')

  if (game.type == "rebus") {
    sendCommand('clearRebusBlock', ACTIVE_CELL);
    updatePoints(ACTIVE_TEAM, game.points);
  }
}

function incorrect(){
  //if (!CAN_SCORE) alert('score fault'); return;
  var game = GAMES[ROUND];
  sendCommand('hideQuestion')

  if (game.type == "rebus") {
    sendCommand('rebusIncorrect')
    updatePoints(ACTIVE_TEAM, -game.points);
  }

}

// Rebus Solved
$("#clearRebus").on("click", function(e){
    sendCommand('clearRebus');
    updatePoints(ACTIVE_TEAM, POINTS)
});

$(window).keydown(function(e) {

  // Team Selection (via keyboard)
  var team = e.keyCode - 49; // Offset ASCII, '1' = 0, '2' = 1
  if (team >= 0 && team < CONFIG.teams.length) {
    ACTIVE_TEAM = team;
    sendCommand('highlightTeam', ACTIVE_TEAM)
  }

  // Incorrect answer (Escape)
  if (e.keyCode == 27) {
    incorrect();
  }

  if (e.keyCode == 13) {
    correct();
  }
});

// Team Selection (via mouse)
$("#scores").on("click", ".score", function(e){
  ACTIVE_TEAM = $(this).data('team')
  sendCommand('highlightTeam', ACTIVE_TEAM)
});

//$("#correct").on("click", function(e){ sendCommand('clearRebusBlock', ACTIVE_CELL); });
//$("#incorrect").on("click", function(e){ sendCommand('rebusIncorrect'); });
$("#correct").on("click", correct);
$("#incorrect").on("click", incorrect);

$("#rebus").on("click", '.rebusBlock', function(e){
  ACTIVE_CELL = $(this).data('block');
  sendCommand('renderQuestion', "This is a nice long question to which we would like the answer.  How about a few more characters?");
  //sendCommand('clearRebusBlock', ACTIVE_CELL);
});

$("#rounds").on("change", function(e){
  console.log($(this).val())
  runGame(GAMES[$(this).val()])
});
