$(function(){

  // Sanity check configuration file
  if (!localStorage.getItem) alert("ERROR: LocalStorage unavailable")
  if (CONFIG.teams.length < 2) alert("ERROR: Too few teams defined in config");
  if (CONFIG.pointValues.length < 2) alert("ERROR: Too few jeopardy point values defined in config");

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

// Handle dynamic size elements
function sizeStaticElements(){
  //$("#questionDisplay").css('padding', $("#questionDisplay").width() * CONFIG.questionPadding)
  $(".autosize").textfill({maxFontPixels:0});
}


function showIntermission(game) {
  $("#rebus, #scores, #answer").fadeOut(CONFIG.transitionDuration)
}


$(window).resize(function(){
  clearTimeout(rescaleTimeout);
  rescaleTimeout = setTimeout(sizeStaticElements, 150);
});

$(sizeStaticElements);

// TODO: implement team selection via number keys
