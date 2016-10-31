//$(function(){

  var serverWindow = null;

  // Issues a command to the server window
  function sendCommand(cmd, data) {
    serverWindow.postMessage({cmd: cmd, data: data}, "*")
  }

  function receiveCommand(event)
  {
    var cmd = event.data.cmd;
    if (cmd == "initialize") {
      serverWindow = event.source;
      return;
    }
    if (window[cmd]) {
      window[cmd](event.data.content)
    }
  }

  window.addEventListener("message", receiveCommand, false);

//});
