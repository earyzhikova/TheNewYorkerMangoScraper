// Dependencies
var express = require("express");
var mongoose = require("mongoose");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');

// Initialize Express
var app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));



// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
// app.get("/all", function(req, res) {
//   // Find all results from the scrapedData collection in the db
//   db.scrapedData.find({}, function(error, found) {
//     // Throw any errors to the console
//     if (error) {
//       console.log(error);
//     }
//     // If there are no errors, send the data to the browser as json
//     else {
//       res.json(found);
//     }
//   });
// });

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
  // Make a request for the news section of `ycombinator`
  request("https://www.newyorker.com/news", function (error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $("div[class^='LatestSection__listContainer']").each(function (i, element) {

      //get each card and do something for each
      $(element).children("div[class^='Card__theLatest']").each(function (i, articleElement) {

        // Save the text and href of each link enclosed in the current element
        var title = $(articleElement).find("[class^='Card__hed']").text();
        console.log(title);
        var link = $(articleElement).children("h1").attr("href");
        var article = $(element).children("h2").text();
        // If this found element had both a title and a link
        if (title && link && article) {
          // Insert the data in the scrapedData db
          db.scrapedData.insert({
            title: title,
            link: link,
            article: article
          },
            function (err, inserted) {
              if (err) {
                // Log the error if one is encountered during the query
                console.log(err);
              }
              else {
                // Otherwise, log the inserted data
                console.log(inserted);
              }
            });
        }
      });
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function () {
  console.log("App running on port 3000!");
});