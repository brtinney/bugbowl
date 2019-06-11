$(function(){

  // Add team score holders
  $.each(CONFIG.teams, function(i,v){ $('<div/>', {
      id: "score-"+i,
      "data-team": i,
      "data-sizefactor": 0.65,
      "class": "score autosize",
      style: "width:"+(100/CONFIG.teams.length)+"%",
      html: '<div class="name">'+v+'</div><span class="value">0</span>'
    }).appendTo("#scores")
  });

  $('title').text($('title').text() + ' ' + YEAR);

});

var rescaleTimeout = null;
var animTimer = 0;
var zoomLevel = 1;

function run() {
  $("#next-round").show();
  $('#timeout').hide();
  $('#doubleCounter').hide();
}

function renderQuestion(text) {
  $("#questionShell").show();
  $("#questionDisplay").html("<span>"+text+"</span>").dynasize();
  $("#questionShell").velocity("transition.expandIn", CONFIG.transitionDuration);
  $("#timesup, #clearQuestion, #correct, #incorrect").show();
  $("#clearRebus").prop("disabled", true);
}

function hideQuestion() {
  $("#questionShell").velocity("transition.expandOut", CONFIG.transitionDuration);
  $("#timesup, #clearQuestion, #correct, #incorrect").hide();
  $("#clearRebus").prop("disabled", false);
}

function highlightTeam(teamNumber) {
  $("#scores .score").removeClass("active");
  if(teamNumber >= 0) {
    $("#scores .score").eq(teamNumber).addClass("active");
  }
}


function updateScores(scores){
  $.each(CONFIG.teams, function(i,v){
    var existingValue = parseInt($('#score-'+i+' span.value').text(), 10);
    if (existingValue !== scores[i]) {
      $('#score-'+i+' span.value')
        .velocity('transition.expandOut', {
          duration: 150,
          complete: function(){$(this).text(scores[i])}})
        .velocity('transition.expandIn', 150)
    }
    $('#overridePoints-'+i).val(scores[i]);
  })
}

function showScores(visible){
  if (visible) $("#scores").fadeIn(CONFIG.transitionDuration);
  else $("#scores").fadeOut(CONFIG.transitionDuration);
}

function showAudience(visible) {
  if (visible) $("#audience").css({'opacity': 0, 'display': 'table'}).animate({'opacity': 1}, CONFIG.transitionDuration);
  else $("#audience").fadeOut(CONFIG.transitionDuration);
}

function buildRebus(game){
  $("#rebus").empty();
  $("#rebus").css('background-image', "none");
  $("section").fadeOut(CONFIG.transitionDuration);

  // Update controls
  $("#controls button").not("#openMenu").hide();
  $("#clearRebus, #solution").show();
  $("#clearRebus").prop("disabled", false);
  showAudience(false);

  for (var i = 0; i < CONFIG.rebusRow * CONFIG.rebusColumn; i++) {
    var col = i % CONFIG.rebusColumn;
    var row = Math.floor(i / CONFIG.rebusColumn);
    var a = $('<div/>', {
        id: "rebus-"+i,
        "data-block": i,
        "data-row": Math.floor(i / CONFIG.rebusColumn),
        "data-column": i % CONFIG.rebusColumn,
        "class": "rebusBlock autosize",
        "data-sizegroup": "rebusBlock",
        "data-sizefactor": 0.5,
        style: "width:"+(100/CONFIG.rebusColumn)+"%;height:"+(100/CONFIG.rebusRow)+"%",
        html: "<span>"+(i+1)+"</span>"
      });
    if(game.blocks[col][row].hidden !== undefined)
    {
      a.addClass('clear');
    }
    a.appendTo("#rebus");
  }

  $("#rebus").fadeIn();
  $("#solution").html(game.solution);

  if(game.active_question !== undefined) {
    renderQuestion(game.active_question.question);
    if($('#answerDisplay').length > 0) { renderAnswer(game.active_question.answer); } // Will only work on server
  }

  $(".rebusBlock").velocity("transition.expandIn", {
    display: 'table',
    stagger: 65,
    duration: 400,
    complete: function(){ $("#rebus").css('background-image', "url('"+game.image+"')"); }
  });
}

function clearRebus(){
  $("#rebus .rebusBlock").addClass('clear');
}

function clearRebusBlock(block) {
  $("#rebus .rebusBlock").eq(block).addClass('clear');
}

function buildCategories(game){
  $("section, #solution").fadeOut(CONFIG.transitionDuration);
  $("#categories").empty();
  showAudience(false);

  // Update controls
  $("#controls button").not("#openMenu").hide();

  $.each(game.board, function(i,v){
    // Create the container for the category
    var containerName = "categoriesColumn-"+i;
    $('<div/>', {
        id: containerName,
        "class": "categoriesColumn",
        style: "width:"+(100/game.board.length)+"%;height:100%"
      }).appendTo("#categories")

    $('<div/>', {
          "class": "categoriesHeader autosize",
          style: "width:100%;height:"+(100/(v.questions.length+1))+"%",
          html: "<span>"+v.category+"</span>",
          "data-sizegroup": "categoriesHeader",
          "data-sizefactor": .9
        }).appendTo("#"+containerName)

    for (var idx = 0; idx < v.questions.length; ++idx) {
      var col = i;
      var row = idx;
      var a = $('<div/>', {
            "id": "categories-"+i+"-"+idx,
            "class": "categoriesOption autosize",
            "data-column": i,
            "data-row": idx,
            "data-points": game.pointValues[idx],
            "data-sizegroup": "categoriesOption",
            "data-sizefactor": 0.35,
            style: "width:100%;height:"+(100/(v.questions.length+1))+"%",
            html: "<span>"+game.pointValues[idx]+"</span>"
          });

      if(game.blocks[col][row].hidden !== undefined)
      {
        a.addClass('clear');
      }
      a.appendTo("#"+containerName);
    }
  });

  $('#categories').fadeIn(CONFIG.transitionDuration);

  if(game.active_question !== undefined) {
    renderQuestion(game.active_question.question);
    if($('#answerDisplay').length > 0) { renderAnswer(game.active_question.answer); } // Will only work on server
  }

  var blockDelay = 50;
  var questionsPerCategory = game.board[0].questions.length;

  $(".categoriesHeader").velocity("transition.fadeIn", {
    display: 'table',
    stagger: blockDelay * questionsPerCategory,
    duration: 350
  });

  $(".categoriesOption").velocity("transition.fadeIn", {
    display: 'table',
    stagger: blockDelay,
    duration: 350
  });
}

function clearCategoriesBlock(arr) {
  $("#categoriesColumn-"+arr[0]+" .categoriesOption").eq(arr[1]).addClass('clear');
}

function showClosing(scores) {

  // Update Interface
  $("section").fadeOut(CONFIG.transitionDuration);
  $("#final").fadeIn(CONFIG.transitionDuration);

  // Update controls
  $("#controls button").not("#openMenu").hide();

  // Rank the teams
  ranked = [];
  for (var i in scores) ranked.push({name: CONFIG.teams[i], score: scores[i]});
  ranked = ranked.sort(function(a,b){ return b.score - a.score; });

  // Add scores to UI
  $.each(ranked, function(i,v){ $('<div/>', {
      "data-sizefactor": 0.65,
      "class": "finalBlock",
      style: "height:"+(100/CONFIG.teams.length)+"%",
      html:
        '<div class="teamName autosize" data-sizegroup="teamName" data-sizefactor="0.9"><span>'
          +v.name+
        '</span></div>'+
        '<div class="finalScore autosize" data-sizegroup="finalScore" data-sizefactor="0.7"><span>'
          +v.score+
        '</span><div>'
    }).appendTo("#finalScores")
  })

  sizeStaticElements();

  if (typeof FIREWORKS !== 'undefined')
    FIREWORKS.start();
}

function doublePoints(show) {
  if(show)
    $('#doublePoints').css('display', 'table').dynasize();
  else
    $('#doublePoints').hide();
}

// Handle dynamic size elements
function sizeStaticElements(){
  $(".autosize:visible").dynasize();
}

function showIntermission(game) {

  // Update section display
  $("section").fadeOut(CONFIG.transitionDuration);
  $("#solution").hide();
  $('#intermission').empty().css('background-image', '');

  // Update controls
  $("#controls button").not("#openMenu").hide();

  if (/\.((png)|(jpg)|(jpeg)|(gif)|(svg))$/i.test(game.source)) {
    $('#intermission').css({'background-image': 'url('+game.source+')',
                            'display': 'none'});
  }
  else if (/\.((swf)|(flv))$/i.test(game.source)) {
    $('#intermission').css({'display': 'none'}).html('<embed src="'+game.source+'">');
  }
  else if (/\.((mov)|(mp4))$/i.test(game.source)) {
    $('#intermission').css({'display': 'none'}).html('<video autoplay' + (game.loop ? ' loop muted' : '') + ' src="'+game.source+'">');
    if(game.loop && $('#intermission video').length) {
      //$('#intermission video')[0].play();
    }
  }

  if(game.text) {
    $('#intermission').data('sizefactor', game.sizefactor || '0.3');
    $('#intermission').append('<span style="position: absolute; z-index: 2; top: 0;">'+game.text+'</span>').dynasize();
    if(game.style) {
      $('#intermission span').css(game.style);
    }
  }

  $('#intermission').velocity('transition.slideRightIn', 500);
}

function showWhatIsThis(game) {
  animTimer = game.timer;
  zoomLevel = game.zoom;

  // Update section display
  $("section").fadeOut(CONFIG.transitionDuration);
  $('#intermission').empty().css('background-image', '');

  // Update controls
  $("#controls button").not("#openMenu").hide();

  if (/\.((png)|(jpg)|(jpeg)|(gif)|(svg))$/i.test(game.source)) {
    $('#intermission').css({'background-image': 'url('+game.source+')',
                            'display': 'none'});
  }
  else if (/\.((swf)|(flv))$/i.test(game.source)) {
    $('#intermission').css({'display': 'none'}).html('<embed src="'+game.source+'">');
  }
  else if (/\.((mov)|(mp4))$/i.test(game.source)) {
    $('#intermission').css({'display': 'none'}).html('<video autoplay' + (game.loop ? ' loop muted' : '') + ' src="'+game.source+'">');
    if(game.loop && $('#intermission video').length) {
      //$('#intermission video')[0].play();
    }
  }

  if(game.text) {
    $('#intermission').data('sizefactor', game.sizefactor || '0.3');
    $('#intermission').append('<span style="position: absolute; z-index: 2; top: 0;">'+game.text+'</span>').dynasize();
    if(game.style) {
      $('#intermission span').css(game.style);
    }
  }

  //$('#intermission').velocity('transition.slideRightIn', 500);
}

function startTransition(game) {
  $('#intermission').css('transform', 'scale(' + zoomLevel + ')');
  $('#intermission').show().velocity({
    scale: [1, zoomLevel]
  }, {
    easing: 'easeOut',
    duration: animTimer,
    progress: function(elements, complete, remaining, start, tweenValue) {
      animTimer = remaining;
      zoomLevel = tweenValue;
    },
    complete: function() {
      animTimer = game.timer;
      sendCommand('transitionComplete');
    }
  });
}

function transitionComplete() {
  $('#startTransition').show();
  $('#stopTransition').hide();
}

function stopTransition() {
  $('#intermission').velocity("stop");
}

function buildFinalTrivia(game){
    // Pause any skipped intermissions
    $("video").each(function(){ $(this).get(0).pause(); });

  // Update section display
  $("section").fadeOut(CONFIG.transitionDuration);
  $("#finalTrivia, #scores").fadeIn(CONFIG.transitionDuration);

  // Update controls
  $("#controls button").not("#openMenu").hide();
  $("#startFinalTimer, #revealTrivia, #revealLightning").show().prop('disabled', false);
  $("#startFinalTimer, #revealLightning").prop('disabled', true);

  // Construct countdown timer widget
  $("#finalTimer").knob({
    'min': 0,
    'max': game.time,
    'readOnly': true,
    'width': ~~(window.innerWidth  * 0.20),
    'height': ~~(window.innerWidth * 0.20),
    'fgColor': '#F4D28A',
    'bgColor': "rgba(0,0,0,0)",
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

  $("#finalTimer").parent().addClass("finalTimer").hide();
  $("#finalTimer").val(game.time).trigger('change');

  // Create text strings
  $("#finalTriviaTitle").html('<span>'+game.title+'</span>');
  $("#finalTriviaQuestion").html('<span>'+game.question+'</span>').hide();
  $("#solution").html("<span>"+game.answer+"</span>").hide();

  $("#lightningTitle").html('<span>'+game.lightingTitle+'</span>').hide();
  $("#lightningQuestion").html('<span>'+game.lightningQuestion+'</span>').hide();

  sizeStaticElements();
  $("#finalTriviaTitle").velocity('transition.slideUpIn', {
    display: 'table',
    duration: CONFIG.transitionDuration
  });

}

function revealFinalTrivia() {
  // Update controls
  $("#revealTrivia").prop("disabled", true);
  $("#startFinalTimer").prop('disabled', false);
  $("#scores").velocity("transition.slideUpOut", 250);;

  // Update UI
  $('#finalTriviaQuestion').show().velocity('transition.slideUpIn', { display: 'table' });
  $("#solution").show();

  sizeStaticElements();
}

function revealLightning() {
  $("#startFinalTimer, #revealTrivia, #revealLightning").prop('disabled', true);
  $("#finalTriviaTitle, #finalTriviaQuestion").velocity('transition.slideUpOut', {
      duration: 250,
      complete: function(){
        $("#lightningTitle, #lightningQuestion").show();
        sizeStaticElements();
        $("#lightningTitle, #lightningQuestion").velocity('transition.slideUpIn', { display: 'table' });
      }
  });
}

function beginFinalTriviaTimer() {
  // Update Controls
  $("#startFinalTimer").prop("disabled", true);
  $(".finalTimer").velocity('transition.expandIn');
  $("#revealLightning").prop('disabled', false);

  // Begin countdown
  var countdownInterval = setInterval(function(){
    var newValue = $("#finalTimer").val() - 1;
    if (newValue < 0) {
      clearInterval(countdownInterval);
      $(".finalTimer").velocity('transition.expandOut');
      setTimeout(function(){ if (window['showModal']) showModal(); }, 1000);
    }
    else $("#finalTimer").val(newValue).trigger('change');
  }, 1000);

  // Song playback handled in server.js
}


$(window).resize(function(){
  clearTimeout(rescaleTimeout);
  rescaleTimeout = setTimeout(sizeStaticElements, 100);
});

$(sizeStaticElements);
