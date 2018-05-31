// Scrape articles and display them on the page

$(document).ready(function () {
  $("#btnScrape").click(function () {
    $.get("/scrape", function (data, status) {
      data = JSON.parse(data);
      for (var i = 0; i < data.length; i++) {
        $("#wrapper").append(
          `<div class="card">
            <div class="card-header">
              <a href = "` + data[i].link + `">` + data[i].title + `</a>
              <button type="button" class="btn btn-secondary btn-lg float-right saveArticle">Save article</button>
            </div>
            <div class="card-body">
              <blockquote class="blockquote mb-0">
                <p>` + data[i].summary + `</p>              
              </blockquote>
            </div>
          </div>
          <br>`);
      }

      // display number of articles in modal
      $("#articleQuantity").text(data.length);
      $('#myModal').modal("show")
    });
  });

  
  $(document).on('click', 'button.saveArticle', function () {
    var article = {}
    article.title = $(this).parent().parent().find("a").text();
    article.link = $(this).parent().parent().find("a").attr("href");
    article.summary = $(this).parent().parent().find("p").text();


    $.post("/save/articles", article ,function (data, status) {


      data = JSON.parse(data);
    }, 'json');
   
  

  });

  

  // Whenever someone clicks a p tag
  $(document).on("click", "p", function () {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
      })
      // With that done, add the note information to the page  "<?"
      .then(function (data) {
        console.log(data);
        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });

  // When you click the savenote button
  $(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // Value taken from title input
          title: $("#titleinput").val(),
          // Value taken from note textarea
          body: $("#bodyinput").val()
        }
      })
      // With that done
      .then(function (data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });

  {
    /* <button type="button" class="btn btn-secondary btn-lg float-right" id="saveArticle">Article Notes</button>
              <button type="button" class="btn btn-secondary btn-lg float-right" id="saveArticle">Delete from Saved</button> */
  }

  //END OF DOCUMENT READY
});