
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

// global app vars
var server;
var socket;
var receivedMsg = [];

function connectSocket(){
    // receiving functions 
    server = ((window.location.protocol === 'https:') ? 'wss://' : 'ws://') + window.location.hostname + ":" + window.location.port + "/websocket";
    socket = new WebSocket(server);

    socket.onmessage = processSocketMsg;

}

function processSocketMsg(event) {
    text = event.data;
    var jsonMsg;
    try {
        jsonMsg = JSON.parse(text);
    } catch(e) {
        console.log("considered using text message..");
        jsonMsg = {
            actions: "preview",
            data: text
        }
    }

    if (jsonMsg.actions.includes("preview")){
        logMessage(JSON.stringify(jsonMsg,undefined,2));
    }

    if (jsonMsg.actions.includes("update-header")){
        updateTableHeaders(jsonMsg);
    }
    if (jsonMsg.actions.includes("append-data")){
        appendToTableBody(jsonMsg);
    }
};

function flashAnimate(elementId){
    element = document.getElementById(elementId);
    element.classList.remove("flash-animation");
    void element.offsetWidth;
    element.classList.add("flash-animation");
}

function logMessage(msg){
    const currentDate = new Date();
    msg = currentDate + "\n" + msg;
    document.getElementById("messages").innerHTML = msg
    flashAnimate("messages");
}

// expects array of elements with flat key value
function updateTableHeaders(rawData){
    line = "<th>"+Object.keys(rawData.data[0]).join("</th><th>")+"</th>";
    console.log(line);
    row = document.getElementById(rawData.elementId + "-header");
    // header does not exist
    if (row == null){
        row = document.getElementById(rawData.elementId).insertRow(0);
        row.id = rawData.elementId + "-header";
    }
    row.innerHTML=line;
}

function appendToTableBody(rawData){
    for (var i = 0; i < rawData.data.length; i++) {
        line = "<td>"+Object.values(rawData.data[i]).join("</td><td>")+"</td>";
        row = document.getElementById(rawData.elementId).insertRow(-1);
        row.innerHTML=line;
    }

}

function clearTable(tableId){
    document.getElementById(tableId).innerHTML="";
}

// Initial steps on page load
includeHTML();
connectSocket();


// testing
var exampleData = {};
exampleData =
{
    elementId: "log-table",
    actions: ["preview","update-header", "append-data"],
    data:
        [
            {
                dateTime: "2021-01-01 11:30:21",
                header: "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
                body: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout"
            },
            {
                dateTime: "2021-01-01 11:31:21",
                header: "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
                body: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout"
            }
        ]
}

var exampleEvent ={} 
exampleEvent.data = JSON.stringify(exampleData);

