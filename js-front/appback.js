var http = require('http');
var fs = require('fs');
var path = require('path');
var WebSocket = require('ws');

var server = http.createServer(route).listen(3000);
var wss = new WebSocket.Server({server: server, path: "/websocket"})


// expects an object
wss.broadcast = function broadcast(type,msg) {
    body={};
    body.type=type;
    body.actions=['notify','update-header','upsert-data'];
    body.elementIds=['state-table'];
    body.data=msg;
    stringBody = JSON.stringify(body);
    wss.clients.forEach(function each(client) {
        client.send(stringBody);
     });
 };

// routing through services
function route (request,response) {
    switch (decodeURI(request.url)) {
        case '/${svc-ping-path}':
            ping(request,response);
            break;
        case '/${svc-send-msg-path}':
            sendMessage(request,response);
            break;
        default:
            staticServer(request,response);
    }
}

function sendMessage(request,response){
    var body = "";
    // we can access HTTP headers
    request.on('data', chunk => {
        body+=chunk;
    })
    request.on('end', () => {

        body = JSON.parse(body);

        wss.broadcast('person',[body]);
        response.writeHead(200);
        response.end(JSON.stringify(body));
    })


}

function ping(request,response){
    console.log("pong");
    response.writeHead(200);
    response.end("pong");
}

// static file server as default
function staticServer(request, response) {

    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
        case '.woff2':
            contentType = 'font/woff2';
            break;
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end(); 
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

}

console.log('Server running at http://127.0.0.1:3000/');