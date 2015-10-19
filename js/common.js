$(function(){

  // Add team score holders
  $.each(CONFIG.teams, function(i,v){ $('<div/>', {
      id: "score-"+i,
      "data-team": i,
      "data-sizefactor": 0.8,
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
  $("#questionShell").hide()
    .fadeIn(CONFIG.transitionDuration);
}

function hideQuestion() {
  $("#questionShell").fadeOut(CONFIG.transitionDuration);
}

function highlightTeam(teamNumber) {
  $("#scores .score").removeClass("active");
  if(teamNumber >= 0) {
    $("#scores .score").eq(teamNumber).addClass("active");
  }
}

function updateBoard(){

}

function updateScores(scores){
  $.each(CONFIG.teams, function(i,v){
    $('#score-'+i+' span.value').text(scores[i]);
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
  $('clearQuestion').hide();
  showAudience(false);

  for (var i = 0; i < CONFIG.rebusRow * CONFIG.rebusColumn; i++) {
    $('<div/>', {
        id: "rebus-"+i,
        "data-block": i,
        "data-row": Math.floor(i / CONFIG.rebusColumn),
        "data-column": i % CONFIG.rebusColumn,
        "class": "rebusBlock autosize",
        "data-sizegroup": "rebusBlock",
        "data-sizefactor": 0.5,
        style: "width:"+(100/CONFIG.rebusColumn)+"%;height:"+(100/CONFIG.rebusRow)+"%",
        html: "<span>"+(i+1)+"</span>"
      }).appendTo("#rebus")
  }
  $("#rebus").css('background-image', "url('"+game.image+"')");
  $("#rebus").fadeIn(1500);
  $("#solution").html(game.solution);
  $("#correct, #incorrect, #solution, #clearRebus").show()
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
  $('#clearRebus, #solution').hide();

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

    for (var idx = 0; idx < v.questions.length; ++idx)
      $('<div/>', {
            "class": "categoriesOption autosize",
            "data-column": i,
            "data-row": idx,
            "data-points": game.pointValues[idx],
            "data-sizegroup": "categoriesOption",
            "data-sizefactor": 0.35,
            style: "width:100%;height:"+(100/(v.questions.length+1))+"%",
            html: "<span>"+game.pointValues[idx]+"</span>"
          }).appendTo("#"+containerName)
  })

  $("#correct, #incorrect, #clearQuestion").show();
  $('#categories').fadeIn(CONFIG.transitionDuration);
}

function clearCategoriesBlock(arr) {
  $("#categoriesColumn-"+arr[0]+" .categoriesOption").eq(arr[1]).addClass('clear');
}

function showClosing() {
  $("section").fadeOut(CONFIG.transitionDuration);
  $("#final").fadeIn(CONFIG.transitionDuration);
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
  $("section").fadeOut(CONFIG.transitionDuration);
  $("#solution").hide();
  $('#intermission').empty().css('background-image', '');

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

  $('#intermission').fadeIn(CONFIG.transitionDuration);
}


function showFinalTrivia(game){
  $("section").fadeOut(CONFIG.transitionDuration);
  $("#finalTrivia").fadeIn(CONFIG.transitionDuration);

  $("#finalTimer").knob({
    'min': 0,
    'max': game.time,
    'readOnly': true,
    'width': ~~(window.innerWidth  * 0.20),
    'height': ~~(window.innerWidth * 0.20),
    'fgColor': '#FFD700',
    'bgColor': "rgba(0,0,0,0)",
    'thickness': 0.1
  });

  $("#finalTimer").parent().addClass("finalTimer");
  $("#finalTimer").val(game.time).trigger('change');
  $("#finalTimer").on('click', function(e){
    console.log('clicked')
  })

  var countdownInterval = setInterval(function(){
    var newValue = $("#finalTimer").val() - 1;
    if (newValue < 0) clearInterval(countdownInterval);
    else $("#finalTimer").val(newValue).trigger('change');
  }, 1000);

  $("#finalTriviaTitle").html('<span>'+game.title+'</span>');
  $("#finalTriviaQuestion").html('<span>'+game.question+'</span>');

  sizeStaticElements();
}


$(window).resize(function(){
  clearTimeout(rescaleTimeout);
  rescaleTimeout = setTimeout(sizeStaticElements, 100);
});

$(sizeStaticElements);
