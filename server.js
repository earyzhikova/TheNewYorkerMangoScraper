// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

// Require all models
var db = require("./models/index");

// Initialize Express
var app = express();

app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: true
}));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// // Database configuration
// var databaseUrl = "scraper";
// var collections = ["scrapedData"];

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newyorker";
var PORT = process.env.PORT || 3000;
// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Main route 
app.get("/", function (req, res) {
  // db.Article.find({}).then(function (dbArticle) {
  // console.log(dbArticle);
  // });
  var hdbObject = {
    // articles: dbArticle

  };
  res.render("index", hdbObject);
});

// A route for saved article page

app.get("/saved", function (req, res) {
  db.Article.find({}).then(function (dbArticle) {
    var hdbObject = {
      articles: dbArticle

    };
    res.render("saved", hdbObject);
  });
});

// // route for saving articles to DB

// app.post("/save/articles", function (req, res) {
//   var articleToSave = req.body;

//   db.Article.find({}).then(function (dbArticle) {
//     var alreadyExists = false;
//     for (i = 0; i < dbArticle.length; i++) {
//       if (articleToSave.title == dbArticle[i].title) {
//         alreadyExists = true;
//       }
//     }

//     if (alreadyExists == false) {
//       // Save an empty result object
//       var result = {};

//       // Add the text and href of every link, and save them as properties of the result object
//       result.title = articleToSave.title;
//       result.link = articleToSave.link;
//       result.summary = articleToSave.summary;

//       // Create a new Article using the `result` object built from scraping
//       db.Article.create(result)
//         .then(function (dbArticle) {
//           // View the added result in the console
//           console.log(dbArticle);
//         })
//         .catch(function (err) {
//           // If an error occurred, send it to the client
//           return res.json(err);
//         });
//     };


//   });
// });
// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
  // db.Article.find({}).then(function (dbArticle) {
  // Make a request for the news section 
  request("https://www.newyorker.com/news", function (error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $("div[class^='LatestSection__listContainer']").each(function (i, element) {

      var result = [];
      //get each card and do something for each
      $(element).children("div[class^='Card__theLatest']").each(function (i, articleElement) {

        // Save the text and href of each link enclosed in the current element
        var title = $(articleElement).find("[class^='Card__hed']").text();
        // console.log(title);
        var link = "https://www.newyorker.com" + $(articleElement).find("[class^='Card__content']").children("a").attr("href");
        // console.log(link);
        var summary = $(articleElement).find("[class^='Card__dek___']").text();
         console.log($(articleElement).find("[class^='Card__dek___']").text());
        article = {};
        article.title = title;
        article.link = link;
        article.summary = summary;
        result.push(article);

      });
      db.Article.find({}).then(function (dbArticle) {
        for (j = 0; j < result.length; j++) {
          var alreadyExists = false;
          for (i = 0; i < dbArticle.length; i++) {

            if (result[j].title == dbArticle[i].title) {
              alreadyExists = true;
            }
          }

          if (alreadyExists == false) {

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result[j])
              .then(function (dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
              })
              .catch(function (err) {
                // If an error occurred, send it to the client
                return res.json(err);
              });
          };
        }
        res.json(JSON.stringify(result));
      });
    });

  });

});

 // Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("notes")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      // console.log('dbArticle: ' + dbArticle);
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

  // db.ArticlefindOne({
  //     _id: req.params.id
  //   })
  //   // ..and populate all of the notes associated with it
  //   .populate("note")
  //   .then(function (dbArticle) {
  //     // If we were able to successfully find an Article with the given id, send it back to the client
  //     res.json(dbArticle);
  //   })
  //   .catch(function (err) {
  //     // If an error occurred, send it to the client
  //     res.json(err);
  //   });
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function (req, res) {
//   // Create a new note and pass the req.body to the entry
//   console.log(req.body);

//   db.Note.create(req.body)
//     .then(function (dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       // return db.Note.findOneAndUpdate({
//       //   _id: req.params.id
//       // }, {
//       //   note: dbNote._id
//       // }, {
//       //   new: true
//       // });
//     })
//     .then(function (dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function (err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: { notes: dbNote._id }}, { new: true })
      .then(function(dbArticle) {
        // res.json({'result': 'no error'});
        // If we were able to successfully update an Article, send it back to the client
        // console.log('dbArticle: ' + dbArticle);
        
      })
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for removing an Article
app.delete("/articles/:id", function (req, res) {
  // Create a new article and pass the req.body to the entry
  db.Article.remove({"_id" : req.params.id})
    .then(function (dbArticle) {
     
      res.json({"result" : "success"})
    })
    .catch(function (err) {
  //     // If an error occurred, send it to the client
      res.json(err);
    });
});

// Delete One Note from the DB
app.delete("/delete/:id", function(req, res) {

  // Remove a note using the objectID
  db.Note.remove({"_id" : req.params.id},
    function(error, removed) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        console.log(removed);
        res.send(removed);
      }
    }
  );
});



// Listen on port 3000
app.listen(PORT, function () {
  console.log("App running on port 3000!");
});