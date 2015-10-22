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
  })

});

var rescaleTimeout = null;

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

  $("#rebus").css('background-image', "url('"+game.image+"')");
  $("#rebus").fadeIn(1500);
  $("#solution").html(game.solution);

  if(game.active_question !== undefined) {
    renderQuestion(game.active_question.question);
    if($('#answerDisplay').length > 0) { renderAnswer(game.active_question.answer); } // Will only work on server
  }

  $("#rebusBlock").velocity("transition.slideUpIn", 250);;

}

function clearRebus(){
  $("#rebus .rebusBlock").addClass('clear');
}

function clearRebusBlock(block) {
  $("#rebus .rebusBlock").eq(block).addClass('clear');
}

function buildCategories(game){
  $("section").fadeOut(CONFIG.transitionDuration);
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
}

function clearCategoriesBlock(arr) {
  $("#categoriesColumn-"+arr[0]+" .categoriesOption").eq(arr[1]).addClass('clear');
}

function showClosing() {
  $("section").fadeOut(CONFIG.transitionDuration);
  $("#final").fadeIn(CONFIG.transitionDuration);

  // Update controls
  $("#controls button").not("#openMenu").hide();
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
    $('#intermission').css('background-image', 'url('+game.source+')');
  }
  else if (/\.((swf)|(flv))$/i.test(game.source)) {
    $('#intermission').html('<embed src="'+game.source+'">');
  }
  else if (/\.((mov)|(mp4))$/i.test(game.source)) {
    $('#intermission').html('<video autoplay src="'+game.source+'">');
  }

  if(game.text) {
    $('#intermission').data('sizefactor', '0.3');
    $('#intermission').html('<span>'+game.text+'</span>').dynasize();
  }

  $('#intermission').velocity('transition.slideRightIn', 500);
}


function buildFinalTrivia(game){

  // Update section display
  $("section").fadeOut(CONFIG.transitionDuration);
  $("#finalTrivia, #scores").fadeIn(CONFIG.transitionDuration);

  // Update controls
  $("#controls button").not("#openMenu").hide();
  $("#startFinalTimer, #revealTrivia").show().prop('disabled', false);
  $("#startFinalTimer").prop('disabled', true);

  // Construct countdown timer widget
  $("#finalTimer").knob({
    'min': 0,
    'max': game.time,
    'readOnly': true,
    'width': ~~(window.innerWidth  * 0.20),
    'height': ~~(window.innerWidth * 0.20),
    'fgColor': '#FFD700',
    'bgColor': "rgba(0,0,0,0)",
    'thickness': 0.1,
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

  sizeStaticElements();
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

function beginFinalTriviaTimer() {
  // Update Controls
  $("#startFinalTimer").prop("disabled", true);
  $(".finalTimer").velocity('transition.expandIn');

  // Begin countdown
  var countdownInterval = setInterval(function(){
    var newValue = $("#finalTimer").val() - 1;
    if (newValue < 0) {
      clearInterval(countdownInterval);
      $(".finalTimer").velocity('transition.expandOut');
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
