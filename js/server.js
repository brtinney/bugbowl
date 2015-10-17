// Ask if we want to reset game state
//if (confirm("Press a button!")) {
//} else { // delete
//}

// State variables

var GameState = (function() {
  var _ROUND;
  var _TEAM;
  var _POINTS;
  var _BOARD;
  var _ACTIVE_QUESTION;
  var _QUESTIONS;
  var _INDEX;
  var _DOUBLE;
  var _BID; // Double Points
  var _WAGERS; // Final Trivia

  function GameState(reload) {

    // Load previous game state from localstorage
    //if (confirm("Do you want to use existing game state?")) {
    if (reload && STORAGE_VALID) {
      console.log('[INFO] Restoring existing game state')
      _POINTS = JSON.parse(localStorage.points);
      _TEAM = JSON.parse(localStorage.team);
      _ROUND = JSON.parse(localStorage.round);
      _BOARD = JSON.parse(localStorage.board);
      _ACTIVE_QUESTION = JSON.parse(localStorage.active_question);
      _QUESTIONS = JSON.parse(localStorage.questions);
      _INDEX = JSON.parse(localStorage.index);
      _DOUBLE = JSON.parse(localStorage.double);
      _BID = JSON.parse(localStorage.bid);
      _WAGERS = JSON.parse(localStorage.wagers);
    // Make a fresh game state
    } else {
      console.log('[INFO] Creating new game state')
      _POINTS = Array(CONFIG.teams.length).fill(0);
      _TEAM = 0;
      _ROUND = 0;
      _BOARD = null;
      _ACTIVE_QUESTION = null;
      _QUESTIONS = null;
      _INDEX = -1;
      _DOUBLE = -1;
      _BID = 0;
      _WAGERS = Array(CONFIG.teams.length).fill(0);
      localStorage.points = JSON.stringify(_POINTS);
      localStorage.team = JSON.stringify(_TEAM);
      localStorage.round = JSON.stringify(_ROUND);
      localStorage.board = JSON.stringify(_BOARD);
      localStorage.active_question = JSON.stringify(_ACTIVE_QUESTION);
      localStorage.questions = JSON.stringify(_QUESTIONS);
      localStorage.index = JSON.stringify(_INDEX);
      localStorage.double = JSON.stringify(_DOUBLE);
      localStorage.bid = JSON.stringify(_BID);
      localStorage.wagers = JSON.stringify(_WAGERS);
    }
  };

  GameState.prototype.getTeam = function() { return _TEAM; };
  GameState.prototype.getRound = function() { return _ROUND; };
  GameState.prototype.getPoints = function() { return _POINTS; };
  GameState.prototype.getBoard = function() { return _BOARD; };
  GameState.prototype.getActiveQuestion = function() { return _ACTIVE_QUESTION; };
  GameState.prototype.getQuestions = function() { return _QUESTIONS; };
  GameState.prototype.getQuestionIndex = function() { return _INDEX; };
  GameState.prototype.getDoublePointsIndex = function() { return _DOUBLE; };
  GameState.prototype.getDoublePointsBid = function() { return _BID; };
  GameState.prototype.getWagers = function() { return _WAGERS; };

  GameState.prototype.setTeam = function(team) { _TEAM = team; localStorage.team = JSON.stringify(_TEAM); };
  GameState.prototype.setRound = function(round) { _ROUND = round; localStorage.round = JSON.stringify(_ROUND); };
  GameState.prototype.setPoints = function(points) { _POINTS = points; localStorage.points = JSON.stringify(_POINTS); };
  GameState.prototype.setBoard = function(board) { _BOARD = board; localStorage.board = JSON.stringify(_BOARD); };
  GameState.prototype.setActiveQuestion = function(active_question) { _ACTIVE_QUESTION = active_question; localStorage.active_question = JSON.stringify(_ACTIVE_QUESTION); };
  GameState.prototype.setQuestions = function(questions) { _QUESTIONS = questions; localStorage.questions = JSON.stringify(_QUESTIONS); };
  GameState.prototype.setQuestionIndex = function(index) { _INDEX = index; localStorage.index = JSON.stringify(_INDEX); };
  GameState.prototype.setDoublePointsIndex = function(double) { _DOUBLE = double; localStorage.double = JSON.stringify(_DOUBLE); };
  GameState.prototype.setDoublePointsBid = function(bid) { _BID = bid; localStorage.bid = JSON.stringify(_BID); };
  GameState.prototype.setWagers = function(wagers) { _WAGERS = wagers; localStorage.wagers = JSON.stringify(_WAGERS); };

  GameState.prototype.removeBlock = function(col, row) {
    _BOARD[col][row].hidden = true;
    this.setBoard(_BOARD);
  };

  GameState.prototype.getNewQuestion = function(categoryIndex) {
    var questions = this.getQuestions();
    if (categoryIndex !== undefined) {
      questions = questions[categoryIndex].questions;
      gameState.setQuestionIndex(gameState.getQuestionIndex()+1);
    }
    var i = Math.floor(Math.random() * questions.length);
    this.setActiveQuestion(questions[i]);
    questions.splice(i,1);
    this.setQuestions(_QUESTIONS);

    return _ACTIVE_QUESTION;
  };

  GameState.prototype.updatePoints = function(team, points) {
    _POINTS[team] += points;
    this.setPoints(_POINTS);

    return _POINTS;
  }

  return GameState;
})();

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
    gameState.setBoard(Array(CONFIG.rebusColumn).fill(Array(CONFIG.rebusRow).fill({})));
    gameState.setQuestions(game.questions);
    sendCommand('buildRebus', game);
    if(game.points > 0) {
      sendCommand('showScores', true);
    }
    else {
      sendCommand('showAudience', true);
      sendCommand('showScores', false);
    }
    sendCommand('sizeStaticElements');
  }

  else if (game.type == 'categories') {
    gameState.setBoard(Array(game.board.length).fill(Array(game.pointValues.length).fill({})));
    gameState.setQuestions(game.board);
    gameState.setQuestionIndex(-1);
    gameState.setDoublePointsIndex(Math.floor(Math.random() * (game.board.length * game.pointValues.length)));
    sendCommand('showScores', true);
    sendCommand('buildCategories', game);
    sendCommand('sizeStaticElements');
  }

  else if (game.type == 'intermission') {
    sendCommand('showIntermission', game);
  }

  else if (game.type == 'final_trivia') {

  }

  else if (game.type == 'closing') {
    sendCommand('closing')
  }

  else {
    alert('[ERROR] Unknown game type requested: ' + game.type)
  }
}



// Reference to the client window
var clientScreen = window.open("client.html", getWinName("client.html"), "toolbar=0,location=0,menubar=0")
if (!clientScreen) alert("ERROR: Pop-up blocker seems to be enabled. Please allow popups for the client")
var gameState;
var CAN_SCORE = false;

function initialize() {
  gameState = new GameState(true);

  $.each(GAMES, function(i,v){ $('<option/>', {
      value: i,
      html: v.name
    }).appendTo("#rounds")
  })

  sendCommand('highlightTeam', gameState.getTeam());
  sendCommand('updateScores', gameState.getPoints());
}

// Allow client to initialize
setTimeout(function(){
  sendCommand('initialize');
  $('#rounds').val(gameState.getRound()).trigger('change');
}, 150);



// Action Handlers

function updatePoints(team, points) {
  sendCommand('updateScores', gameState.updatePoints(team, points));
}

function correct() {
  if (!CAN_SCORE) return;
  var game = GAMES[gameState.getRound()];
  sendCommand('hideQuestion');
  gameState.setActiveQuestion(null);

  if (game.type == "rebus") {
    gameState.removeBlock(ACTIVE_CELL.data('column'), ACTIVE_CELL.data('row'));
    sendCommand('clearRebusBlock', ACTIVE_CELL.data('block'));
    updatePoints(gameState.getTeam(), game.points);
    //nextTeam();
  }
  else if (game.type == "categories") {
    var pts = ACTIVE_CELL.data('points');
    if (gameState.getQuestionIndex() == gameState.getDoublePointsIndex()) {
      pts = gameState.getDoublePointsBid();
    }
    gameState.removeBlock(ACTIVE_CELL.data('column'), ACTIVE_CELL.data('row'));
    sendCommand('clearCategoriesBlock', [ACTIVE_CELL.data('column'), ACTIVE_CELL.data('row')]);
    updatePoints(gameState.getTeam(), pts);
    gameState.setTeam(-1);
    sendCommand('highlightTeam', -1);
  }
  ACTIVE_CELL = null;
  CAN_SCORE = false;
}

function incorrect() {
  if (!CAN_SCORE) return;
  var game = GAMES[gameState.getRound()];

  if (game.type == "rebus") {
    sendCommand('hideQuestion');
    gameState.setActiveQuestion(null);
    ACTIVE_CELL = null;
    nextTeam();
  }
  else if (game.type == "categories") {
    var pts = ACTIVE_CELL.data('points');
    if (gameState.getQuestionIndex() == gameState.getDoublePointsIndex()) {
      pts = gameState.getDoublePointsBid();
    }
    sendCommand('categoriesIncorrect');
    updatePoints(gameState.getTeam(), -pts);
    gameState.setTeam(-1);
    sendCommand('highlightTeam', -1);
  }
  CAN_SCORE = false;
}

function losingTeam() {
  var scores = gameState.getPoints();
  var min = Infinity;
  var losing = 0;

  for(var i in scores) {
    if(scores[i] < min) {
      losing = i;
      min = scores[i];
    }
  }

  return losing;
}

function nextTeam() {
  var team = gameState.getTeam();
  if(team+1 == CONFIG.teams.length) {
    team = 0;
  }
  else {
    team += 1;
  }

  gameState.setTeam(team);
  sendCommand('highlightTeam', gameState.getTeam());
}

function renderAnswer(answer) {
  $("#answerDisplay").html("<span>"+answer+"</span>")
    .textfill({maxFontPixels:0});
}

function showModal() {
  $('.blurrable').addClass('blurred');
  $("#overlay").fadeIn();
}
function closeModal() {
  $("#overlay").fadeOut();
  $(".blurrable").removeClass('blurred');
}


$(function() {

    // Rebus Solved
    $("#clearRebus").on("click", function(e){
      var game = GAMES[gameState.getRound()];
      sendCommand('clearRebus');
      updatePoints(gameState.getTeam(), game.boardClearPoints)
    });

    $('#clearQuestion').on('click', function(e) {
      sendCommand('hideQuestion');
      gameState.removeBlock(ACTIVE_CELL.data('column'), ACTIVE_CELL.data('row'));
      sendCommand('clearCategoriesBlock', [ACTIVE_CELL.data('column'), ACTIVE_CELL.data('row')]);
      gameState.setActiveQuestion(null);
      ACTIVE_CELL = null;
    });

    $('#wager button').on('click', function(e) {
      var bid = parseInt($('#wager input').val());
      if(bid > 0) {
        gameState.setDoublePointsBid(bid);
        $('#wager').hide();
      }
      else {
        alert('Invalid wager');
      }
    });

    $(window).keydown(function(e) {
      if(e.target.nodeName == 'INPUT') { e.keyCode = Infinity; } // For wagers

      // Team Selection (via keyboard)
      var team = e.keyCode - 49; // Offset ASCII, '1' = 0, '2' = 1
      if (team >= 0 && team < CONFIG.teams.length) {
        gameState.setTeam(team);
        sendCommand('highlightTeam', gameState.getTeam());
        if(ACTIVE_CELL !== undefined && ACTIVE_CELL !== null) { CAN_SCORE = true; }
      }

      if (e.keyCode == 77) { // m
        showModal();
      }

      if (e.keyCode == 78) { // n
        nextTeam();
        if(ACTIVE_CELL !== undefined && ACTIVE_CELL !== null) { CAN_SCORE = true; }
      }

      // Incorrect answer (Escape)
      if (e.keyCode == 27) {
        // Override when modal visible
        if ($("#overlay:visible").length) {
          closeModal();
        }
        else {
          incorrect();
        }
      }

      if (e.keyCode == 13) {
        correct();
      }
    });

    // Team Selection (via mouse)
    $("#scores").on("click", ".score", function(e){
      gameState.setTeam($(this).data('team'));
      sendCommand('highlightTeam', gameState.getTeam());
    });

    $("#openMenu").on("click", function(e){
      showModal();
    });

    //$("#correct").on("click", function(e){ sendCommand('clearRebusBlock', ACTIVE_CELL); });
    //$("#incorrect").on("click", function(e){ sendCommand('rebusIncorrect'); });
    $("#correct").on("click", correct);
    $("#incorrect").on("click", incorrect);

    $("#rebus").on("click", '.rebusBlock', function(e) {
      var question;
      if(gameState.getActiveQuestion() !== null) {
        question = gameState.getActiveQuestion();
      }
      else {
        question = gameState.getNewQuestion();
      }
      CAN_SCORE = true;
      ACTIVE_CELL = $(this);
      sendCommand('renderQuestion', question.question);
      renderAnswer(question.answer);
    });

    $("#categories").on("click", '.categoriesOption', function(e) {
      if(gameState.getTeam() >= 0) { CAN_SCORE = true; }
      var game = GAMES[gameState.getRound()];
      var question;
      if(gameState.getActiveQuestion() !== null) {
        question = gameState.getActiveQuestion();
      }
      else {
        question = gameState.getNewQuestion($(this).data('column'));
      }
      if (gameState.getQuestionIndex() == gameState.getDoublePointsIndex()) {
        sendCommand('doublePoints', true);
        $('#wager').show();
      }
      else {
        $('#wager').hide();
      }
      ACTIVE_CELL = $(this);

      sendCommand('renderQuestion', question.question);
      renderAnswer(question.answer);
    });

    $('#doublePoints').on('click', function(e) {
      if($('#wager').css('display') == 'block') { return; } // Short circuit accidental click
      sendCommand('doublePoints', false);
    });

    $("#rounds").on("change", function(e){
      gameState.setRound(parseInt($(this).val()));
      runGame(GAMES[parseInt($(this).val())]);
      gameState.setQuestionIndex(0);
      gameState.setTeam(losingTeam());
      sendCommand('highlightTeam', gameState.getTeam());
    });

    $('#next-round').on("click", function(e) {
      var round = gameState.getRound();
      $('#rounds').val(round+1).trigger('change');
    });

    $("#destroyState").on("click", function(e){
      if (confirm("Are you sure you want to delete the existing game state?  This will reload the game.")) {
        localStorage.clear();
        location.reload();
      }
    });
});
