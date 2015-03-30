/*
  Global variables
*/
var uuid = "46ab76a3-bccd-4f29-a528-f03ba64a0589";
var device;
var socketId;

/*
  Utility Functions
*/

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

/*
  Bluetooth support functions
*/

var onConnectedCallback = function() {
  if (chrome.runtime.lastError) {
    console.log("Connection failed: " + chrome.runtime.lastError.message);
  } 
  else {
    console.log("Connected");
  }
};

function onSocketCreate(createInfo) {
  socketId = createInfo.socketId;
  if (device.uuids.indexOf(uuid) != -1) {
    chrome.bluetoothSocket.connect(createInfo.socketId, device.address, uuid, onConnectedCallback);
  }
  else {
    console.log("Device does not support CatiDialer");
  }
}

function sending(bytes_sent) {
  if (chrome.runtime.lastError) {
    failed_to_send(chrome.runtime.lastError.message);
  }
}

function failed_to_send(msg) {
  console.log("Failed to send: "+msg);
}

chrome.bluetoothSocket.onReceiveError.addListener(function(errorInfo) {
  // Cause is in errorInfo.error.
  console.log(errorInfo.errorMessage);
});
  
function initializeBluetooth() {
  
  chrome.bluetooth.getDevices(function(devices) {
    console.log("Got "+devices.length+" devices");
    for (var i = 0; i < devices.length; i++) {
      device = devices[i];
      console.log(device);
      chrome.bluetoothSocket.create(onSocketCreate);
    }
  });

}


/*
  Reports errors back from the Cati Web component to this Chrome Applicaton
*/

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
  
  initializeBluetooth();
  
  setTimeout(function() {
    console.log("Dialing");
    chrome.bluetoothSocket.send(socketId, str2ab("17070"), sending);
    setTimeout(function() {
      console.log("Hang up");
      chrome.bluetoothSocket.send(socketId, str2ab("hangup"), sending);
    }, 8000);
  }, 4000);

});

