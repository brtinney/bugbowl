STORAGE_VALID = true

// Checks the defined game for accuracy
$(function(){

  var errors = [];
  var callbacksPending = 0;

  function verifyAsset(url, game) {
    callbacksPending++;
    var img = new Image();
    img.onerror = function(e){ callbacksPending--; errors.push(game.name + ' not found on disk') };
    img.onload = function(e) { callbacksPending--; }
    img.src = url;
  }

  function validateRebus(game) {
    if (!game.image) errors.push(game.name + ' missing background image')
    if (!game.solution) errors.push(game.name + ' missing solution')
    verifyAsset(game.image, game);
  }

  function validateIntermission(game) {

  }

  function validateCategories(game) {

  }

  function validateFinalTrivia(game) {

  }

  function validateClosing(game) {

  }

  function validateStoredState() {
    var vars = ['points', 'team', 'round', 'games', 'rebusQuestions', 'rebusIndex', 'bid', 'wagers'];
    var valid = true;
    for (var i in vars) {
      if (localStorage.length && !localStorage[vars[i]]) {
        errors.push('Saved state missing required variable: ' + vars[i]);
        valid = false;
      }
    }
    STORAGE_VALID = localStorage.length == vars.length && valid;
  }

  // Check for environment requirements
  if (!localStorage.getItem) errors.push('LocalStorage unavailable')

  // Check for existance of top level objects
  if (!GAMES || !Array.isArray(GAMES)) errors.push('No games defined')
  if (!CONFIG) errors.push('Global configuration object not defined')
  validateStoredState();

  // Perform game specific vlaidations
  for (var i = 0; i < GAMES.length; ++i) {
    if (GAMES[i].type == "rebus") validateRebus(GAMES[i]);
    else if (GAMES[i].type == "intermission") validateIntermission(GAMES[i]);
    else if (GAMES[i].type == "categories") validateCategories(GAMES[i]);
    else if (GAMES[i].type == "final_trivia") validateFinalTrivia(GAMES[i]);
    else if (GAMES[i].type == "closing") validateClosing(GAMES[i]);
    else errors.push('Unknown game type defined: ' + GAMES[i].type);
  }

  // Validate configuration object
  if (!CONFIG.teams || !Array.isArray(CONFIG.teams) || !CONFIG.teams.length) errors.push('No teams defined')
  if (!CONFIG.rebusRow) errors.push('Number of rebus rows not defined')
  if (!CONFIG.rebusColumn) errors.push('Number of rebus columns not defined')

  // teams exist
  if (errors.length)
    alert("Errors were encountered in the game file: \n - " + errors.join("\n - "));

});
