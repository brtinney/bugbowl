// Ask if we want to reset game state
//if (confirm("Press a button!")) {
//} else { // delete
//}

// State variables

var GameState = (function() {
  var _ROUND;
  var _TEAM;
  var _POINTS;
  var _GAMES;
  var _QUESTIONS;
  var _INDEX;
  var _DOUBLE;
  var _BID; // Double Points
  var _WAGERS; // Final Trivia

  function GameState(games, reload) {

    // Load previous game state from localstorage
    //if (confirm("Do you want to use existing game state?")) {
    if (reload && STORAGE_VALID) {
      console.log('[INFO] Restoring existing game state')
      _POINTS = JSON.parse(localStorage.points);
      _TEAM = JSON.parse(localStorage.team);
      _ROUND = JSON.parse(localStorage.round);
      _GAMES = JSON.parse(localStorage.games);
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
      _GAMES = $.extend(true, {}, games);
      _QUESTIONS = null;
      _INDEX = -1;
      _DOUBLE = -1;
      _BID = 0;
      _WAGERS = Array(CONFIG.teams.length).fill(0);
      localStorage.points = JSON.stringify(_POINTS);
      localStorage.team = JSON.stringify(_TEAM);
      localStorage.round = JSON.stringify(_ROUND);
      localStorage.games = JSON.stringify(_GAMES);
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
  GameState.prototype.getGames = function() { return _GAMES; };
  GameState.prototype.getQuestions = function() { return _QUESTIONS; };
  GameState.prototype.getQuestionIndex = function() { return _INDEX; };
  GameState.prototype.getDoublePointsIndex = function() { return _DOUBLE; };
  GameState.prototype.getDoublePointsBid = function() { return _BID; };
  GameState.prototype.getWagers = function() { return _WAGERS; };

  GameState.prototype.setTeam = function(team) { _TEAM = team; localStorage.team = JSON.stringify(_TEAM); };
  GameState.prototype.setRound = function(round) { _ROUND = round; localStorage.round = JSON.stringify(_ROUND); };
  GameState.prototype.setPoints = function(points) { _POINTS = points; localStorage.points = JSON.stringify(_POINTS); };
  GameState.prototype.setGames = function(games) { _GAMES = games; localStorage.games = JSON.stringify(_GAMES); };
  GameState.prototype.setQuestions = function(questions) { _QUESTIONS = questions; localStorage.questions = JSON.stringify(_QUESTIONS); };
  GameState.prototype.setQuestionIndex = function(index) { _INDEX = index; localStorage.index = JSON.stringify(_INDEX); };
  GameState.prototype.setDoublePointsIndex = function(double) { _DOUBLE = double; localStorage.double = JSON.stringify(_DOUBLE); };
  GameState.prototype.setDoublePointsBid = function(bid) { _BID = bid; localStorage.bid = JSON.stringify(_BID); };
  GameState.prototype.setWagers = function(wagers) { _WAGERS = wagers; localStorage.wagers = JSON.stringify(_WAGERS); };

  GameState.prototype.hideBlock = function(col, row) {
    _ACTIVE_GAME.blocks[col][row].hidden = true;
    delete _ACTIVE_GAME.active_question;
    this.setGames(_GAMES); // Pass by reference will include changes
  };

  GameState.prototype.hideQuestion = function() {
    delete _ACTIVE_GAME.active_question;
  }

  GameState.prototype.getGame = function(index) {
    return _GAMES[index];
  }

  GameState.prototype.prepareGame = function(index) {
    _ACTIVE_GAME = _GAMES[index];

    if(_ACTIVE_GAME.type == "rebus")
    {
      this.setQuestions(_ACTIVE_GAME.questions);
      this.setTeam(losingTeam());
    }
    else if(_ACTIVE_GAME.type == "categories")
    {
      this.setQuestions(_ACTIVE_GAME.board);
      this.setQuestionIndex(-1);
      this.setTeam(-1);
      this.setDoublePointsIndex(Math.floor(Math.random() * (_ACTIVE_GAME.board.length * _ACTIVE_GAME.pointValues.length)));
    }

    return _ACTIVE_GAME;
  }

  GameState.prototype.getNewQuestion = function(categoryIndex) {
    var questions = this.getQuestions();
    if (categoryIndex !== undefined) {
      questions = questions[categoryIndex].questions;
      gameState.setQuestionIndex(gameState.getQuestionIndex()+1);
    }
    var i = Math.floor(Math.random() * questions.length);
    _ACTIVE_GAME.active_question = $.extend(true, {}, questions[i]);
    questions.splice(i,1);
    this.setQuestions(_QUESTIONS);
    this.setGames(_GAMES); // Pass by reference will include changes

    return _ACTIVE_GAME.active_question;
  };

  GameState.prototype.updatePoints = function(team, delta) {
    _POINTS[team] += delta;
    this.setPoints(_POINTS);
    return _POINTS;
  }

  GameState.prototype.replacePoints = function(team, absolute) {
    _POINTS[team] = absolute;
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

function runGame(index) {
  var game = gameState.getGame(index);

  if (game.type == 'rebus') {
    game = gameState.prepareGame(index);
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
    game = gameState.prepareGame(index);
    sendCommand('buildCategories', game);
    sendCommand('showScores', true);
    sendCommand('sizeStaticElements');
  }

  else if (game.type == 'intermission') {
    sendCommand('showIntermission', game);
  }

  else if (game.type == 'final_trivia') {
    sendCommand('showFinalTrivia', game)
  }

  else if (game.type == 'closing') {
    sendCommand('showClosing')
  }

  else {
    alert('[ERROR] Unknown game type requested: ' + game.type)
  }
}



// Reference to the client window
var clientScreen = window.open("client.html", getWinName("client.html"), "toolbar=0,location=0,menubar=0")
if (!clientScreen) alert("ERROR: Pop-up blocker seems to be enabled. Please allow popups for the client")
//window.onunload = window.onbeforeunload = function() { clientScreen.close(); }
var gameState;
var CAN_SCORE = false;
var doublePointsSound = new Audio('assets/DoublePoints.m4a');

function initialize() {
  gameState = new GameState(GAMES, true);

  $.each(GAMES, function(i,v){ $('<option/>', {
      value: i,
      html: v.name,
      class: v.type
    }).appendTo("#rounds")
  })

  $.each(CONFIG.teams, function(i,v){
    $("#scores_names").append('<td width="'+(100/CONFIG.teams.length)+'%">'+v+'</td>');
    $("#scores_values").append('<td><input type="number" id="overridePoints-'+i+'" data-team="'+i+'" class="overridePoints" /></td>')
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
  gameState.hideQuestion();

  if (game.type == "rebus") {
    gameState.hideBlock(ACTIVE_CELL.data('column'), ACTIVE_CELL.data('row'));
    sendCommand('clearRebusBlock', ACTIVE_CELL.data('block'));
    updatePoints(gameState.getTeam(), game.points);
    //nextTeam();
  }
  else if (game.type == "categories") {
    var pts = ACTIVE_CELL.data('points');
    if (gameState.getQuestionIndex() == gameState.getDoublePointsIndex()) {
      pts = gameState.getDoublePointsBid();
    }
    gameState.hideBlock(ACTIVE_CELL.data('column'), ACTIVE_CELL.data('row'));
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
    gameState.hideQuestion();
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

  return parseInt(losing);
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
  $("#answerDisplay").html("<span>"+answer+"</span>").dynasize();
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
      gameState.hideBlock(ACTIVE_CELL.data('column'), ACTIVE_CELL.data('row'));
      sendCommand('clearCategoriesBlock', [ACTIVE_CELL.data('column'), ACTIVE_CELL.data('row')]);
      gameState.hideQuestion();
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
        if ($("#overlay:visible").length) {
          closeModal();
        }
        else {
          showModal();
        }
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
      gameState.setTeam(parseInt($(this).data('team')));
      if(ACTIVE_CELL !== undefined && ACTIVE_CELL !== null) { CAN_SCORE = true; }
      sendCommand('highlightTeam', gameState.getTeam());
    });

    $("#openMenu").on("click", showModal);

    /*
    // TODO: Re-enable context menu bind when we don't need to inspect things
    $(document).bind("contextmenu",function(e){
      showModal();
      return false;
   });
   */

    //$("#correct").on("click", function(e){ sendCommand('clearRebusBlock', ACTIVE_CELL); });
    //$("#incorrect").on("click", function(e){ sendCommand('rebusIncorrect'); });
    $("#correct").on("click", correct);
    $("#incorrect").on("click", incorrect);

    $("#rebus").on("click", '.rebusBlock', function(e) {
      var question = gameState.getNewQuestion();
      CAN_SCORE = true;
      ACTIVE_CELL = $(this);
      sendCommand('renderQuestion', question.question);
      renderAnswer(question.answer);
    });

    $("#categories").on("click", '.categoriesOption', function(e) {
      if(gameState.getTeam() >= 0) { CAN_SCORE = true; }
      var game = GAMES[gameState.getRound()];
      var question = gameState.getNewQuestion($(this).data('column'));
      if (gameState.getQuestionIndex() == gameState.getDoublePointsIndex()) {
        sendCommand('doublePoints', true);
        doublePointsSound.play();
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
      closeModal();
      var i = parseInt($(this).val());
      gameState.setRound(i);
      runGame(i);
      sendCommand('highlightTeam', gameState.getTeam());
      if(gameState.getGame(i+1) === undefined) { $('#next-round').hide(); }
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

    $("#overrideScores").on("click", function(e){
      $.each($(".overridePoints"), function(i, el){
        gameState.replacePoints($(el).data('team'), parseInt($(el).val(), 10))
      });
      sendCommand('updateScores', gameState.getPoints());
      closeModal();
    });
});
