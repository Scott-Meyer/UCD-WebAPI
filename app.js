var express = require('express');
var _ = require('underscore');
var app = express();

app.get('/gets', function (req, res) {
    valid(req, res);
}).listen(8888);
app.post('/posts', function (req, res) {
    valid(req, res);
});
app.put('/puts', function (req, res) {
    valid(req, res);
});
app.delete('/deletes', function (req, res) {
    valid(req, res);
});
app.all('*', function (req, res) {
    invalid(req, res);
});

function valid(req, res) {
    var output = "HTTP " + req.method + " accepted. \n";
    if (_.isEmpty(req.query)) {
        output = output + "No Parameters. \n";
    }
    else {
        output = output + "Parameters: \n";
        output = output + JSON.stringify(req.query, null, 1) + "\n";
    }
    output = output + "Headers: \n";
    output = output + JSON.stringify(req.headers, null, 1) + "\n";
    res.send(output);
}
function invalid(req, res) {
    res.send('Non Valid request. \n Only requests to \'/gets\', \'/posts\', \'/puts\', \'/deletes\' are accepted.');
}

//Start Server
app.listen(3000);
console.log('Server running at 127.0.0.1:3000/');