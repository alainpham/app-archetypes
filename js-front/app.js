var express = require('express');
var http = require('http');
var WebSocket = require('ws');

const port = process.env.PORT || 3000;

// create server
var app = express();
var httpServer = http.createServer(app);


// serve static files
app.use("/",express.static('static'));

// add websocket
var wss = new WebSocket.Server({server: httpServer, path: "/websocket"});

// start listening
httpServer.listen(port, function(){
    console.log('Server running at http://127.0.0.1:'+port+'/');
});

app.get(encodeURI('/uiconfig').replace('$','\\$'), (request, response) => {

    config = {
        theme: 'main-dark-purple'
    };

    response.send(config);
});

app.get(encodeURI('/${svc-ping-path}').replace('$','\\$'), (request, response) => {
    response.send("pong");
});

app.post(encodeURI('/${svc-send-msg-path}').replace('$','\\$'), (request, response) => {
    var body = "";
    // we can access HTTP headers
    request.on('data', chunk => {
        body+=chunk;
    })
    request.on('end', () => {

        body = JSON.parse(body);
        console.log(body);
        wss.broadcast([body],'person',true,true,true,"upsert-data",["state-table"]);
        wss.broadcast([body],'person',true,true,true,"append-data",["log-table"]);

        response.writeHead(200);
        response.end(JSON.stringify(body));
    })
});



// expects an object
wss.broadcast =  function broadcastToView(data,type,notify,updateHeader,changeData,dataOperationType,targetTableId){
    body={};
    body.type=type;
    body.elementIds=targetTableId;
    body.actions=[];
    if (notify){
        body.actions.push('notify');
    }
    if (updateHeader){
        body.actions.push('update-header');
    }
    if (changeData){
        body.actions.push(dataOperationType);
    }
    body.data=data;
    stringBody = JSON.stringify(body);
    wss.clients.forEach(function each(client) {
        client.send(stringBody);
     });
 }