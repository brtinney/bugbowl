$(function(){

  // Add team score holders
  $.each(CONFIG.teams, function(i,v){ $('<div/>', {
      id: "score-"+i,
      "data-team": i,
      "class": "score autosize",
      style: "width:"+(100/CONFIG.teams.length)+"%",
      html: '<div class="name">'+v+'</div><span class="value">0</span>'
    }).appendTo("#scores")
  })

    /*' \
    <div class="score autosize" id="score-'+e+'" style="width:'+(100/CONFIG.teams.length)+'%"> \
      <span>0</span> \
    </div>') });
    */
  //updateScores()

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
  })
}

function showScores(visible){
  if (visible) $("#scores").fadeIn(CONFIG.transitionDuration);
  else $("#scores").fadeOut(CONFIG.transitionDuration);
}

function showAudience(visible) {
  if (visible) $("#audience").fadeIn(CONFIG.transitionDuration);
  else $("#audience").fadeOut(CONFIG.transitionDuration);
}

function buildRebus(game){
  $("#rebus").empty();
  $('#intermission, #categories').fadeOut(CONFIG.transitionDuration);
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
  $("#categories").empty();
  $('#intermission').fadeOut(CONFIG.transitionDuration);
  $('#rebus').fadeOut(CONFIG.transitionDuration);
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
  $('#categories').css('display', 'table');
}

function clearCategoriesBlock(arr) {
  $("#categoriesColumn-"+arr[0]+" .categoriesOption").eq(arr[1]).addClass('clear');
}

function doublePoints(show) {
  if(show)
    $('#doublePoints').show().dynasize();
  else
    $('#doublePoints').hide();
}

// Handle dynamic size elements
function sizeStaticElements(){
  //$("#questionDisplay").css('padding', $("#questionDisplay").width() * CONFIG.questionPadding)
  //$(".autosize").textfill({maxFontPixels:0});
  $(".autosize:visible").dynasize();
}


function showIntermission(game) {
  $("#rebus, #scores, #answer, #categories, #solution, #audience").fadeOut(CONFIG.transitionDuration);
  $('#intermission').empty().css('background-image', '');

  if (/\.((png)|(jpg)|(jpeg)|(gif))$/i.test(game.source)) {
    $('#intermission').css('background-image', 'url('+game.source+')');
  }
  else if (/\.((swf)|(flv))$/i.test(game.source)) {
    $('#intermission').html('<embed src="'+game.source+'">');
  }
  else if (/\.((mov)|(mp4))$/i.test(game.source)) {
    $('#intermission').html('<video autoplay src="'+game.source+'">');
  }

  $('#intermission').fadeIn(CONFIG.transitionDuration);
}


$(window).resize(function(){
  clearTimeout(rescaleTimeout);
  rescaleTimeout = setTimeout(sizeStaticElements, 100);
});

$(sizeStaticElements);
