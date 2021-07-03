// Requirements
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer(function(req, res) {

    if (req.method === "POST") {
        let data = '';
        req.on('data', function(chunk) {
            data += chunk;
        })
        req.on('end', function() {
            console.log("SyncDataItem.sync data: ", JSON.parse(data)); // Get SyncDataItem.sync data
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/json');
            res.end(JSON.stringify({
                status: true,
                message: "Success"
            }));
        });
    } else {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/json');
        res.end(JSON.stringify({
            status: false,
            message: "Not allowed"
        }));
    }

});

server.listen(port, hostname, function() {
  console.log(`Server running at http://${hostname}:${port}/`);
});