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
  var _REBUS_QUESTIONS;
  var _REBUS_INDEX;
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
      _REBUS_QUESTIONS = JSON.parse(localStorage.rebusQuestions);
      _REBUS_INDEX = JSON.parse(localStorage.rebusIndex);
      _BID = JSON.parse(localStorage.bid);
      _WAGERS = JSON.parse(localStorage.wagers);
    // Make a fresh game state
    } else {
      console.log('[INFO] Creating new game state')
      _POINTS = Array(CONFIG.teams.length).fill(0);
      _TEAM = 0;
      _ROUND = 0;
      _GAMES = $.extend(true, {}, games);
      _REBUS_QUESTIONS = null;
      _REBUS_INDEX = 0;
      _BID = 0;
      _WAGERS = Array(CONFIG.teams.length).fill(0);
      localStorage.points = JSON.stringify(_POINTS);
      localStorage.team = JSON.stringify(_TEAM);
      localStorage.round = JSON.stringify(_ROUND);
      localStorage.games = JSON.stringify(_GAMES);
      localStorage.rebusQuestions = JSON.stringify(_REBUS_QUESTIONS);
      localStorage.rebusIndex = JSON.stringify(_REBUS_INDEX);
      localStorage.bid = JSON.stringify(_BID);
      localStorage.wagers = JSON.stringify(_WAGERS);
    }
  };

  GameState.prototype.getTeam = function() { return _TEAM; };
  GameState.prototype.getRound = function() { return _ROUND; };
  GameState.prototype.getPoints = function() { return _POINTS; };
  GameState.prototype.getGames = function() { return _GAMES; };
  GameState.prototype.getRebusQuestions = function() { return _REBUS_QUESTIONS; };
  GameState.prototype.getRebusIndex = function() { return _REBUS_INDEX; };
  GameState.prototype.getDoublePointsBid = function() { return _BID; };
  GameState.prototype.getWagers = function() { return _WAGERS; };

  GameState.prototype.setTeam = function(team) { _TEAM = team; localStorage.team = JSON.stringify(_TEAM); };
  GameState.prototype.setRound = function(round) { _ROUND = round; localStorage.round = JSON.stringify(_ROUND); };
  GameState.prototype.setPoints = function(points) { _POINTS = points; localStorage.points = JSON.stringify(_POINTS); };
  GameState.prototype.setGames = function(games) { _GAMES = games; localStorage.games = JSON.stringify(_GAMES); };
  GameState.prototype.setRebusQuestions = function(questions) { _REBUS_QUESTIONS = questions; localStorage.rebusQuestions = JSON.stringify(_REBUS_QUESTIONS); };
  GameState.prototype.setRebusIndex = function(index) { _REBUS_INDEX = index; localStorage.rebusIndex = JSON.stringify(_REBUS_INDEX); };
  GameState.prototype.setDoublePointsBid = function(bid) { _BID = bid; localStorage.bid = JSON.stringify(_BID); };
  GameState.prototype.setWagers = function(wagers) { _WAGERS = wagers; localStorage.wagers = JSON.stringify(_WAGERS); };

  GameState.prototype.hideBlock = function() {
    _ACTIVE_GAME.blocks[_ACTIVE_GAME.active_cell.column][_ACTIVE_GAME.active_cell.row].hidden = true;
    this.setGames(_GAMES); // Pass by reference will include changes
  };

  GameState.prototype.hideQuestion = function() {
    if(_ACTIVE_GAME.indices !== undefined) {
      _ACTIVE_GAME.indices[_ACTIVE_GAME.active_cell.column] += 1;
    }
    else {
      this.setRebusIndex(_REBUS_INDEX+1);
    }
    _ACTIVE_GAME.index += 1;

    delete _ACTIVE_GAME.active_question;
    delete _ACTIVE_GAME.active_cell;

    this.setGames(_GAMES); // Pass by reference will include changes
  }

  GameState.prototype.getGame = function(index) {
    return _GAMES[index];
  }

  GameState.prototype.getActiveCell = function() {
    return _ACTIVE_GAME.active_cell;
  }

  GameState.prototype.getActiveGame = function() {
    return _ACTIVE_GAME;
  }

  GameState.prototype.prepareGame = function(index) {
    _ACTIVE_GAME = _GAMES[index];

    if(_ACTIVE_GAME.type == "rebus")
    {
      if(_REBUS_QUESTIONS === null) {
        this.setRebusQuestions($.extend(true, {}, _ACTIVE_GAME.questions));
      }
      this.setTeam(losingTeam()); // This could cause a change in the team on reload
      if(_ACTIVE_GAME.active_cell !== undefined) {
        CAN_SCORE = true;
      }
    }
    else if(_ACTIVE_GAME.type == "categories")
    {
      this.setTeam(-1); // This could cause a change in team buzzed in on reload
    }

    return _ACTIVE_GAME;
  }

  GameState.prototype.getNewQuestion = function(block, categoryIndex) {
    var questions;
    var i;
    if (categoryIndex !== undefined) {
      questions = _ACTIVE_GAME.board[categoryIndex].questions;
      i = _ACTIVE_GAME.indices[categoryIndex];
    }
    else {
      questions = _REBUS_QUESTIONS;
      i = _REBUS_INDEX;
    }

    if(questions[i] === undefined) { alert('Error: Ran out of questions?'); }

    _ACTIVE_GAME.active_question = $.extend(true, {}, questions[i]);
    _ACTIVE_GAME.active_cell = {'column': block.data('column'), 'row': block.data('row'), 'points': block.data('points'), 'block': block.data('block')};

    this.setGames(_GAMES); // Pass by reference will include changes

    return _ACTIVE_GAME.active_question;
  };

  GameState.prototype.doublePoints = function() {
    return _ACTIVE_GAME.index == _ACTIVE_GAME.double_points;
  }

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
    $('#timeout').hide();
    $('#doubleCounter').hide();
  }

  else if (game.type == 'categories') {
    game = gameState.prepareGame(index);
    sendCommand('buildCategories', game);
    sendCommand('showScores', true);
    sendCommand('sizeStaticElements');
    $('#timeout').show();
    updateDoubleCounter(game);
  }

  else if (game.type == 'intermission') {
    sendCommand('showIntermission', game);
    $('#timeout').hide();
    $('#doubleCounter').hide();
  }

  else if (game.type == 'final_trivia') {
    sendCommand('buildFinalTrivia', game)
    $('#timeout').hide();
    $('#doubleCounter').hide();
  }

  else if (game.type == 'closing') {
    sendCommand('showClosing', gameState.getPoints());
    $('#timeout').hide();
    $('#doubleCounter').hide();
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
var timesupSound = new Audio('assets/timefast.mp3');
var finalSong = new Audio("assets/FinalCowbell.mp3");
var timer;

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
  });

  $('#timeout-input').knob({
    'max': 10,
    'readOnly': true,
    'width': 40,
    'height': 40,
    'fgColor': '#F4D28A',
    'thickness': 0.2,
    draw : function() {
      this.cursorExt = 0.3;

      var a = this.arc(this.cv)  // Arc
          , pa                   // Previous arc
          , r = 1;

      this.g.lineWidth = this.lineWidth;

      if (this.o.displayPrevious) {
          pa = this.arc(this.v);
          this.g.beginPath();
          this.g.strokeStyle = this.pColor;
          this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, pa.s, pa.e, pa.d);
          this.g.stroke();
      }

      this.g.beginPath();
      this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
      this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, a.s, a.e, a.d);
      this.g.stroke();

      this.g.lineWidth = 2;
      this.g.beginPath();
      this.g.strokeStyle = this.o.fgColor;
      this.g.arc( this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
      this.g.stroke();

      return false;
    }
  });

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
  clearTimeout(timer);

  if (game.type == "rebus") {
    var cell = gameState.getActiveCell();
    gameState.hideBlock();
    sendCommand('clearRebusBlock', cell.block);
    updatePoints(gameState.getTeam(), game.points);
    //nextTeam();
    gameState.hideQuestion();
  }
  else if (game.type == "categories") {
    var cell = gameState.getActiveCell();
    var pts = gameState.getActiveCell().points;
    if (gameState.doublePoints()) {
      pts = gameState.getDoublePointsBid();
    }
    gameState.hideBlock();
    sendCommand('clearCategoriesBlock', [cell.column, cell.row]);
    updatePoints(gameState.getTeam(), pts);
    gameState.setTeam(-1);
    sendCommand('highlightTeam', -1);
    gameState.hideQuestion();
    updateDoubleCounter(gameState.getActiveGame());
  }

  CAN_SCORE = false;
}

function incorrect() {
  if (!CAN_SCORE) return;
  var game = GAMES[gameState.getRound()];

  // Audience short-circuit
  if (game.type == "rebus" && game.points == 0) { return; }

  if (game.type == "rebus") {
    sendCommand('hideQuestion');
    gameState.hideQuestion();
    nextTeam();
  }
  else if (game.type == "categories") {
    var pts = gameState.getActiveCell().points;
    if (gameState.doublePoints()) {
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

  return parseInt(losing, 10);
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
  $('#timeout-input').val(10).trigger('change');
  timer = setInterval(function() {
    if($('#timeout-input').val() <= 0) { clearInterval(timer); return; }
    $('#timeout-input').val($('#timeout-input').val()-1).trigger('change');
  }, 1000);
}

function showModal() {
  $('.blurrable').addClass('blurred');
  $("#overlay").velocity('fadeIn', 250);
  $("#scoreModal").velocity("transition.slideUpIn", 250);;
}
function closeModal() {
  $("#scoreModal").velocity("transition.slideDownOut", 250);;
  $("#overlay").velocity('fadeOut', 250);
  $(".blurrable").removeClass('blurred');
}

function updateDoubleCounter(game) {
  var d = (parseInt(game.double_points) + 1) - parseInt(game.index);
  if(d <= 0) {
    $('#doubleCounter').hide();
  }
  else if(d > 1) {
    $('#doubleCounter').html('Double Points in <strong>'+d+'</strong> questions').show();
  }
  else {
    $('#doubleCounter').html('Double Points <strong>next question</strong>').show();
  }
}

function getWager(){
  while(true) {
    var wager = prompt("Enter team wager:", "");
    if (wager != null && parseInt(wager, 10) > 0) return parseInt(wager, 10);
  }
}

$(function() {

    // Rebus Solved
    $("#clearRebus").on("click", function(e){
      $("#clearRebus").prop("disabled", true);
      var game = GAMES[gameState.getRound()];
      sendCommand('clearRebus');
      updatePoints(gameState.getTeam(), game.boardClearPoints)
    });

    $('#clearQuestion').on('click', function(e) {
      var cell = gameState.getActiveCell();
      sendCommand('hideQuestion');
      clearTimeout(timer);
      gameState.hideBlock();
      sendCommand('clearCategoriesBlock', [cell.column, cell.row]);
      gameState.hideQuestion();
      updateDoubleCounter(gameState.getActiveGame());
    });

    $('#timesup').on('click', function() {
      timesupSound.play();
    });

    $(window).keydown(function(e) {
      if(e.target.nodeName == 'INPUT') { e.keyCode = Infinity; } // For wagers

      // Team Selection (via keyboard)
      var team = e.keyCode - 49; // Offset ASCII, '1' = 0, '2' = 1
      if (team >= 0 && team < CONFIG.teams.length) {
        gameState.setTeam(team);
        sendCommand('highlightTeam', gameState.getTeam());
        if(gameState.getActiveCell() !== undefined) { CAN_SCORE = true; }
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
        if(gameState.getActiveCell() !== undefined) { CAN_SCORE = true; }
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
      if(gameState.getActiveCell() !== undefined) { CAN_SCORE = true; }
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

    $("#correct").on("click", correct);
    $("#incorrect").on("click", incorrect);

    $("#rebus").on("click", '.rebusBlock', function(e) {
      var question = gameState.getNewQuestion($(this));
      CAN_SCORE = true;
      sendCommand('renderQuestion', question.question);
      renderAnswer(question.answer);
    });

    $("#categories").on("click", '.categoriesOption', function(e) {
      if(gameState.getTeam() >= 0) { CAN_SCORE = true; }
      var game = GAMES[gameState.getRound()];
      var question = gameState.getNewQuestion($(this), $(this).data('column'));
      if (gameState.doublePoints()) {
        sendCommand('doublePoints', true);
        doublePointsSound.play();

        // Delay to allow doublePoints to propagate
        setTimeout(function(){
          gameState.setDoublePointsBid(getWager());
          sendCommand('doublePoints', false);
        }, 750);
      }

      sendCommand('renderQuestion', question.question);
      renderAnswer(question.answer);
    });

    $('#doublePoints').on('click', function(e) {
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

    // ====================
    // FINAL TRIVIA
    // ====================

    $("#revealTrivia").on("click", function(e){ sendCommand('revealFinalTrivia'); });
    $("#revealLightning").on("click", function(e){ sendCommand('revealLightning'); });

    $("#startFinalTimer").on("click", function(e){
      sendCommand('beginFinalTriviaTimer');
      finalSong.play();
    });


    $('#timeout').on('click', function() {
      clearTimeout(timer);
    });
});
