$(function(){

  // Add team score holders
  $.each(CONFIG.teams, function(i,v){ $('<div/>', {
      id: "score-"+i,
      "data-team": i,
      "class": "score autosize",
      style: "width:"+(100/CONFIG.teams.length)+"%",
      html: "<span>0</span>"
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
  $("#questionDisplay").html("<span>"+text+"</span>")
    .textfill({maxFontPixels:0});
  $("#questionShell").hide()
    .fadeIn(CONFIG.transitionDuration);
  CAN_SCORE = true;
}

function hideQuestion() {
    $("#questionShell").fadeOut(CONFIG.transitionDuration);
    //CAN_SCORE = false;
}

function highlightTeam(teamNumber){
  $("#scores .score").removeClass("active");
  $("#scores .score").eq(teamNumber).addClass("active")
}

function updateBoard(){

}

function updateScores(scores){
  $.each(CONFIG.teams, function(i,v){
    $('#score-'+i+' span').text(scores[i]);
  })
}

function showScores(visible){
  if (visible) $("#scores").fadeIn(CONFIG.transitionDuration);
  else $("#scores").fadeOut(CONFIG.transitionDuration);
  updateScores(JSON.parse(localStorage.scores));
}

function buildRebus(game){
  $("#rebus").empty();
  $('clearQuestion').hide();

  for (var i = 0; i < CONFIG.rebusRow * CONFIG.rebusColumn; i++) {
    $('<div/>', {
        id: "rebus-"+i,
        "data-block": i,
        "class": "rebusBlock autosize",
        style: "width:"+(100/CONFIG.rebusColumn)+"%;height:"+(100/CONFIG.rebusRow)+"%",
        html: "<span>"+(i+1)+"</span>"
      }).appendTo("#rebus")
  }
  $("#rebus").css('background-image', "url('"+game.image+"')");
  $("#rebus").fadeIn(1500);
  $("#solution").html(game.solution);
  $("#correct, #incorrect, #solution").show()
}

function clearRebus(){
  $("#rebus .rebusBlock").addClass('clear');
}

function clearRebusBlock(block) {
  $("#rebus .rebusBlock").eq(block).addClass('clear');
}

function buildCategories(game){
  $("#categories").empty();
  $("#rebus").hide();
  $('#clearRebus').hide();
  $('#clearQuestion').show();

  game.doublePoints = Math.floor(Math.random() * (game.board.length * game.pointValues.length));

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
          html: "<span>"+v.category+"</span>"
        }).appendTo("#"+containerName)

    for (var idx = 0; idx < v.questions.length; ++idx)
      $('<div/>', {
            "class": "categoriesOption autosize",
            "data-column": i,
            "data-row": idx,
            "data-points": game.pointValues[idx],
            style: "width:100%;height:"+(100/(v.questions.length+1))+"%",
            html: "<span>"+game.pointValues[idx]+"</span>"
          }).appendTo("#"+containerName)
  })

  $("#categories, #correct, #incorrect, #solution").show()
}

function clearCategoriesBlock(arr) {
  $("#categoriesColumn-"+arr[0]+" .categoriesOption").eq(arr[1]).addClass('clear');
}

function doublePoints(show) {
  if(show)
    $('#doublePoints').show().textfill({maxFontPixels:0});
  else
    $('#doublePoints').hide();
}

// Handle dynamic size elements
function sizeStaticElements(){
  //$("#questionDisplay").css('padding', $("#questionDisplay").width() * CONFIG.questionPadding)
  $(".autosize").textfill({maxFontPixels:0});
}


function showIntermission(game) {
  $("#rebus, #scores, #answer, #categories").fadeOut(CONFIG.transitionDuration)
}


$(window).resize(function(){
  clearTimeout(rescaleTimeout);
  rescaleTimeout = setTimeout(sizeStaticElements, 150);
});

$(sizeStaticElements);
