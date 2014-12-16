var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET emceats page. */
router.get('/emceats', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    
    collection.find({},{},function(e,docs){
        res.render('emceats', {
            "dblist" : docs
        });
    });
});

/* POST to DB */
router.post('/submitanswers', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var Answer1 = req.body.Answer1;
    var Answer2 = req.body.Answer2;
    var Answer3 = req.body.Answer3;

    // Set our collection
    var collection = db.get('usercollection');
    
    // Submit to the DB
    collection.update({
     pollid : Answer1},
     {$inc: {"tally": 1}},
     function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem updating the information in the database.");
        }
     });
    collection.update({
     pollid : Answer2},
     {$inc: {"tally": 1}},
     function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem updating the information in the database.");
        }
     });
    collection.update({
     pollid : Answer3},
     {$inc: {"tally": 1}},
     function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem updating the information in the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("emceats");
            // And forward to success page
            res.redirect("emceats");
        }
    });
});

/* POST to clear DB */
router.post('/cleardb', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    
    // Set our collection
    var collection = db.get('usercollection');
    //Wipe out all of the tallys
    collection.update(
        {Type: "Answer"},
        {'$set': {'tally': 0}},{multi: true},
        function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem updating the information in the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("emceats");
            // And forward to success page
            res.redirect("emceats");
        }
    });
});

/* Get the tallies. */
router.get('/gettally', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');

    //Create a GooglePlaces object to be used for the text search
    var GooglePlaces = require("googleplaces");
    var googlePlaces = new GooglePlaces(process.env.GOOGLE_PLACES_API_KEY, process.env.GOOGLE_PLACES_OUTPUT_FORMAT);
    var parameters;
    
    /**
     * Text search - https://developers.google.com/places/documentation/#TextSearchRequests
     */
    parameters = {
      query:"restaurants in dublin" // add our top 3 answers params here
    };
    googlePlaces.textSearch(parameters, function (error, response) {
      if (error) throw error;
      console.log(response.results);
    });

    //Sort and gather tally totals
    collection.find({Type: 'Answer'},{sort:{Group: 1, tally: -1}},function(e,docs){
        res.render('gettally', {
            "AnswerSort" : docs
        });
    });
    
    
    
    
});

module.exports = router;