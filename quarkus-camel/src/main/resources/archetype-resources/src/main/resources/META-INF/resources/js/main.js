
function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("w3-include-html");
                    includeHTML();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    }
}

function backEndRequest(elementId,path,meth,msg){
    console.log(window.location.protocol + "//" + window.location.host + path);
    console.log("sending" + msg);
    fetch(window.location.protocol + "//" + window.location.host + path, {
        method: meth,
        body: msg
      })
        .then(response => response.text())
        .then(function (response) {
            console.log(response);
            if(elementId!=null){
                document.getElementById(elementId).innerHTML =  response;
            }
        })
}

function toggleResponsiveMenu(){
    var x = document.getElementById("nav");
    if (x.className === "nav") {
      x.className += " responsive";
    } else {
      x.className = "nav";
    }
}

// receiving functions 
var server = ((window.location.protocol === 'https:') ? 'wss://' : 'ws://') + window.location.hostname + ":" + window.location.port + "/websocket";
var receivedMsg = [];

var socket = new WebSocket(server);
socket.onmessage = function (event) {
    text = event.data;
    receivedMsg.unshift(text);
    console.log("received " + text);
    if (receivedMsg.length > 5) {
        receivedMsg.pop();
    }
    document.getElementById("messages").innerHTML = receivedMsg.join('<hr>');

};
