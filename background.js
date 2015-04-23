/**
 * Listens for the app launching, then creates the window.
 *
 * @see http://developer.chrome.com/apps/app.runtime.html
 * @see http://developer.chrome.com/apps/app.window.html
 */
var webview;
var callback;
var email;
var socketId = null;

function logout(cb) {
  console.log("Logout callback");
  callback = cb;
}

chrome.app.runtime.onLaunched.addListener(function(launchData) {
  var screenWidth = screen.availWidth;
  var screenHeight = screen.availHeight;
  var targetOrigin = "http://cati.kwest.co/pair";
  chrome.app.window.create(
    'index.html',
    {
      id: 'mainWindowCATI',
      innerBounds: {
        left: 0,
        top: 0
      },
      state: "maximized",
      resizable: true
    },
    function(win) {
      win.maximize();
      win.contentWindow.addEventListener("load", function(){
        webview = win.contentWindow.document.getElementById("catiWebView");
        webview.src = targetOrigin;
        webview.addEventListener("loadstop", function(){
          win.contentWindow.document.addEventListener("message", function() {
            console.log("Window Msg ");
          });
        });
      });
    }
  );
});

chrome.runtime.onSuspend.addListener(function() {
  // Close the socket if closing
  if (socketId) {
    chrome.bluetoothSocket.disconnect(socketId);
  }
  
  // Tell the system we are closing the app
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "http://cati.kwest.co/closing?email="+email);
  xmlhttp.send();
});


