
var messageHandler = function(event) {
  console.log(event.data);
  if (event.data.statusChange) {
    chrome.runtime.getBackgroundPage(function (bg) {
      bg.email = event.data.email;
    });
  }
  
  if (event.data.ajaxError) {
    var html = null;
    switch (event.data.status) {
      case 0:
        html = "<div style='font-size:200%;margin:20px;background-color:#800000;color:#ffffff;padding:6px'>Network Error<div style='background-color:#ffffff;color:#000000;padding:6px'>Sorry, there is a problem with the network.<br>Close the Interviewer Console and resolve the problem.</div></div>";
        break;
      case 500:
        html = "<div style='font-size:200%;margin:20px;background-color:#000080;color:#ffffff;padding:6px'>System Error<div style='background-color:#ffffff;color:#000000;padding:6px'>Sorry, there is a problem with the system.<br>Please report this to your interviewing manager as soon as possible.</div></div>";
        break;
      default:
        html = "<div style='font-size:200%;margin:20px;background-color:#800000;color:#ffffff;padding:6px'>Unexpected Error<div style='background-color:#ffffff;color:#000000;padding:6px'>Sorry, an unexpected error has occurred.<br>Please report this to your interviewing manager as soon as possible.</div></div>";
        break;
    }
    document.getElementById("catiWebView").contentWindow.postMessage({html: html}, "*");
  }
};

window.addEventListener('message', messageHandler, false);

webviewEl = document.getElementById("catiWebView");
webviewEl.addEventListener("contentload", function() {
  webviewEl.contentWindow.postMessage("From APP", "*");
});

