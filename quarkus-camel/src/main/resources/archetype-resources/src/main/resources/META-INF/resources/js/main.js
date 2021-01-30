
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

function formDataToJson(formId){
    var jsonData={};
    var form = document.getElementById(formId)
    for (var i = 0; i < form.elements.length; i++) {
            var e = form.elements[i];
            jsonData[e.id] = e.value;
    }
    return JSON.stringify(jsonData);
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

    socket.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function () {
            connectSocket();
        }, 2000);
    };

    socket.onerror = function (err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        socket.close();
    };
}

function processSocketMsg(event) {
    text = event.data;
    var jsonMsg;
    try {
        jsonMsg = JSON.parse(text);
    } catch(e) {
        console.log("considered using text message..");
        jsonMsg = {
            actions: "notify",
            data: text
        }
    }

    if (jsonMsg.actions.includes("notify")){
        logMessage(JSON.stringify(jsonMsg,undefined,2));
    }

    if (jsonMsg.actions.includes("update-header")){
        updateTableHeaders(jsonMsg);
    }
    if (jsonMsg.actions.includes("append-data")){
        appendToTableBody(jsonMsg);
    }
    if (jsonMsg.data != null){
        functionalProcessing(jsonMsg)
    }
};

function functionalProcessing(jsonMsg){
    data = jsonMsg.data[0];
    // do you custom functional stuff here
    switch (data.source) {
        case "here":
            break;
        default:
          console.log("nothing todo");
      }

}

function flashAnimate(elementId){
    element = document.getElementById(elementId);
    flashAnimateRef(element);
}

function flashAnimateRef(element){
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


function insertOrUpdateTable(rawData){
    var table = document.getElementById(rawData.elementId);
    console.log("updating: " + table.id);
    // loop through the data
    for (var i = 0; i < rawData.data.length; i++) {

        row = table.rows.namedItem(rawData.data[i].id);
        if (row == null) {
            row = table.insertRow(-1);
            row.id =rawData.data[i].id;
        }
        

        for (const key in rawData.data[i]) {


            if (rawData.data[i].hasOwnProperty(key)) {

                const element = rawData.data[i][key];
                console.log(key +" "+ element);
                cell = row.cells.namedItem(key);
                if (cell == null){
                    cell = row.insertCell(-1);
                    cell.id = key;
                }
                
                if (element!=null){
                    if(typeof element == "object"){
                        cell.innerHTML=JSON.stringify(element,undefined,2);
                    }else{
                        cell.innerHTML=element;
                    }
                    if (cell.cellIndex >0 ){
                        flashAnimateRef(cell);
                    }
                }
            }
        }
        
    }
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
    flashAnimateRef(row);
}

function appendToTableBody(rawData){
    for (var i = 0; i < rawData.data.length; i++) {
        line = "<td>"+Object.values(rawData.data[i]).join("</td><td>")+"</td>";
        row = document.getElementById(rawData.elementId).insertRow(-1);
        row.innerHTML=line;
        flashAnimateRef(row);
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
    actions: ["notify","update-header", "append-data"],
    data:
        [
            {
                id:"el1",
                dateTime: "2021-01-01 11:30:21",
                header: "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
                body: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout",
                complexData :{
                    test:"abc",
                    test2:"xyz"
                }
            },
            {   id:"el2",
                dateTime: "2021-01-01 11:31:21",
                header: "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
                body: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout",
                complexData :{
                    test:"abc",
                    test2:"xyz"
                }
            }
        ]
}

var exampleEvent ={} 
exampleEvent.data = JSON.stringify(exampleData);

