var express = require('express');
var usergrid = require('usergrid');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
var client = new usergrid.client({
    orgName:'flyingpenguin',
    appName:'sandbox'
});

app.get('/movie', function(req, res) {
    function stripResult (movie) {
        return {
            "title":movie._data.title,
            "year":movie._data.year,
            "actors":movie._data.actors
        };
    }
    var query = "select * where title='"+ req.query.title +"'";
    var properties = {
        type:"movies",
        qs:{ql:query}
    };
    client.createCollection(properties, function (error, result) {
        if (error) {
            res.status(500);
            res.send("Error: " + error);
        } else {
            if(result.hasNextEntity()) {
                res.send(stripResult(result.getNextEntity()));
            } else {
                res.status(404);
                res.send("no such movie found");
            }
        }
    });
});

app.get('/movies', function(req, res) {
    var properties = {
        type:"movies",
        qs:{ql:'order by uuid'}
    };
    client.createCollection(properties, function (error, result) {
        function stripResult(movielist) {
            return {
                "movies":movielist
            };
        }
        if (error) {
            res.status(500);
            res.send("Error");
        } else {
            var movies = [];
            while(result.hasNextEntity()) {
                var movie = result.getNextEntity();
                movies.push(movie.get('title'));
            }
            res.send(stripResult(movies));
        }
    });
});
app.delete('/movie', function(req, res) {
    var properties = {
        type: "movies",
        name: req.query.title
    };
    client.getEntity(properties, function (error, result) {
        if (error) {
            res.status(500);
            res.send("Error");
        } else {
            result.destroy(function (error, result) {
                if (error) {
                    res.status(404);
                    res.send("Delete Failed");
                } else {
                    res.send("Deleted Movie");
                }
            });
        }
    });
});

app.put('/movie', function(req, res) {

    if (!('title' in req.body) && !('name' in req.body)) {
        res.status(400);
        res.send("You must send the field: title");
        return;
    } else if (!('title' in req.body)) {
        req.body.title = req.body.name;
    } else if (!('name' in req.body)) {
        req.body.name = req.body.title;
    }
    if (!('year' in req.body)) {
        res.status(400);
        res.send("You must include the 'year' field");
        return;
    }
    if (!('actors' in req.body)) {
        res.status(400);
        res.send("You must inslude actors");
        return;
    }

    var properties = {
        type:'movies',
        name:req.query.title
    };

    client.createEntity(properties, function (error, result) {
        if (error) {
            res.status(500);
            res.send("Error adding");
        } else {
            result.set(req.body);
            result.save(function(error, errmsg) {
                if (error) {
                    res.send(errmsg);
                } else {
                    res.status(400);
                    res.send("Success");
                }
            });
        }
    });

});

app.listen(3000);