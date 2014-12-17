
var express = require('express');
var router = express.Router();

function getMax(array){
    var max=0;
    var answer=[];
    for(var i=0; i<3; i++)
    {
        if(array[i].tally > max) 
        {
            max = array[i].tally;
            answer = array[i];
        }
    }
    return(answer);
}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET Maps Page. */
router.get('/maps', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    var Answer1List = [];
    var Answer2List = [];
    var Answer3List = [];
    var Answer1 = [];
    var Answer2 = [];
    var Answer3 = [];
    var AnswerList = [];
    
    collection.find({Type: 'Answer'},{sort:{Group: 1, tally: -1}},function(e,docs){
        //set environment variables
       
        
        for(var i=0; i<9; i++)
        {
            if(docs[i].Group == 1)
            {
                Answer1List.push(docs[i]);
            }
            if(docs[i].Group == 2)
            {
                Answer2List.push(docs[i]); 
            }
            if(docs[i].Group == 3)
            {
                Answer3List.push(docs[i]); 
            }
            
        }
        
        Answer1 =  getMax(Answer1List);
        Answer2 =  getMax(Answer2List);
        Answer3 =  getMax(Answer3List);
        res.render('maps',  
            {title: 'Google Maps', AnswerSort : AnswerList.concat(Answer1, Answer2, Answer3)
        });
            
    });
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
    var Answer1List = [];
    var Answer2List = [];
    var Answer3List = [];
    var Answer1 = [];
    var Answer2 = [];
    var Answer3 = [];
    var AnswerList = [];

    //Create a GooglePlaces object to be used for the text search
    //var GooglePlaces = require("googleplaces");
    //var googlePlaces = new GooglePlaces(process.env.GOOGLE_PLACES_API_KEY, process.env.GOOGLE_PLACES_OUTPUT_FORMAT);
    //var parameters;
    
    
    /**
     * Text search - https://developers.google.com/places/documentation/#TextSearchRequests
     */
    /*parameters = {
      query:"restaurants in dublin" // add our top 3 answers params here
    };
    googlePlaces.textSearch(parameters, function (error, response) {
      if (error) throw error;
      console.log(response.results);
    });*/

    //Sort and gather tally totals. When the Google Places API call is up, we'll remove this sort and just render 
    //gettally with docs set to 
    collection.find({Type: 'Answer'},{sort:{Group: 1, tally: -1}},function(e,docs){
        //set environment variables
       
        
        for(var i=0; i<9; i++)
        {
            if(docs[i].Group == 1)
            {
                Answer1List.push(docs[i]);
            }
            if(docs[i].Group == 2)
            {
                Answer2List.push(docs[i]); 
            }
            if(docs[i].Group == 3)
            {
                Answer3List.push(docs[i]); 
            }
            
        }
        
        Answer1 =  getMax(Answer1List);
        Answer2 =  getMax(Answer2List);
        Answer3 =  getMax(Answer3List);
        
        
        var GooglePlaces = require("googleplaces");
        var googlePlaces = new GooglePlaces("AIzaSyC3UPlqEMvxkElc_Y3B6CLb_vObtHZWEcY", "json");
        var parameters =[];
        
       // https://maps.googleapis.com/maps/api/place/textsearch/xml?query=restaurants+in+Sydney&key=AIzaSyC3UPlqEMvxkElc_Y3B6CLb_vObtHZWEcY
        
        //var GooglePlaces = require('googleplaces');

       // var places = new GooglePlaces('AIzaSyC3UPlqEMvxkElc_Y3B6CLb_vObtHZWEcY');
      
        parameters = {
        //The first most voted on answer for question 1 
        query: Answer1.desc,
        //The most voted on answer for question 2 
        maxprice: Answer2.GoogleID,
        //The third most voted on answer for question 3
        radius: Answer3.GoogleID,
        // add our top 3 answers params here
        location: [35.921937, -78.881396]
        };
        var ourResponse = [];
        
        googlePlaces.textSearch(parameters, function (error, response) {
          if (error) throw error;
            console.log(response.results);
            ourResponse = response.results;
            res.render('gettally', {
            "response"   : ourResponse,
            "AnswerSort" : AnswerList.concat(Answer1, Answer2, Answer3)
          });
            
        });
        
    });
});

module.exports = router;