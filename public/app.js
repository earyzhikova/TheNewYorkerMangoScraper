// Scrape articles and display them on the page

$(document).ready(function () {
  $("#btnScrape").click(function () {
    $("#wrapper").empty();
    $.get("/scrape", function (data, status) {
      data = JSON.parse(data);
      for (var i = 0; i < data.length; i++) {
        $("#wrapper").append(
          `<div class="card">
            <div class="card-header">
              <a href = "` + data[i].link + `">` + data[i].title + `</a>
              
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


  // $(document).on('click', 'button.saveArticle', function () {
  //   var article = {}
  //   article.title = $(this).parent().parent().find("a").text();
  //   article.link = $(this).parent().parent().find("a").attr("href");
  //   article.summary = $(this).parent().parent().find("p").text();


  //   $.post("/save/articles", article ,function (data, status) {


  //     data = JSON.parse(data);
  //   }, 'json');



  // });



  // // Whenever someone clicks a button
  // $(document).on("click", "#savenote", function () {
  //   // Empty the notes from the note section
  //   $("#notes").empty();
  //   // Save the id 
  //   var thisId = $(this).attr("data-id");

  //   // Now make an ajax call for the Article
  //   $.ajax({
  //       method: "POST",
  //       url: "/articles/" + thisId,
  //     })
  //     // With that done, add the note information to the page  "<?"
  //     .then(function (data) {
  //       console.log(data);
  //       // The title of the article
  //       $("#noteSection").append("<h2>" + data.title + "</h2>");
  //       // An input to enter a new title
  //       $("#noteSection").append("<input id='titleinput' name='title' >");
  //       // A textarea to add a new note body
  //       $("#noteSection").append("<textarea id='bodyinput' name='body'></textarea>");
  //       // A button to submit a new note, with the id of the article saved to it
  //       $("#noteSection").append("<button data-id='" + data._id + "' id=''>Save Note</button>");

  //       // If there's a note in the article
  //       if (data.note) {
  //         // Place the title of the note in the title input
  //         $("#titleinput").val(data.note.title);
  //         // Place the body of the note in the body textarea
  //         $("#bodyinput").val(data.note.body);
  //       }
  //     });
  // });

  // When you click the savenote button
  $(document).on("click", "#savenote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $('#idNumber').text();
    console.log(thisId);

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          title: $("#titleinput").text(),
          // Value taken from note textarea
          body: $("#bodyinput").val()
        }
      })
      // With that done
      .then(function (data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#bodyinput").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });

  


  // This function deletes from saved articles when the user clicks the button
  $(document).on('click', 'button.deleteFromSaved', function () {
    var deleteButton = this;
    var id = $(this).parent().children('.articleId').val();
      $.ajax({
        type: "DELETE",
        url: "/articles/" + id
      }).then(function (data) {
        $(deleteButton).parent().parent().parent().remove();
      }).catch(function (err) {
        // If an error occurred, send it to the client
        return res.json(err);
      });
    
    });

  $(document).on('click', 'button.articleNotes', function () {
    var articleId = $(this).parent().children('.articleId').val();
    $("#idNumber").text(articleId);
    // $.get("/articles/" + articleId, article, function (data, status) {


          // data = JSON.parse(data);
        // }, 'json');
    $("#noteSection").empty();
    console.log("about to add notes")
    $.get("/articles/" + articleId, function (data, status) {
      // console.log(data);
      // console.log(data.notes)
      data.notes.forEach(function (note){
        console.log(note.body);
        $('#noteSection').append(`
        <div class="row>
        <div class="col-12">
        <div class="card">
           <div class="card-body">`
           + note.body +
           `<button type="button" class="close deleteNote" data-dismiss="modal" aria-label="Close">
           <span aria-hidden="true">&times;</span>
           </button>
           <input type='hidden' class='noteId' value='` + note._id + `'>
           </div>
       </div></div> </div>`);

     
      });
    });
    // $('#savedNotes').text();
    $('#myModal1').modal("show");
    //   $.post("/save/articles", article ,function (data, status) {


    //     data = JSON.parse(data);
    //   }, 'json');
  });

// When user clicks the delete button for a note
$(document).on("click", ".deleteNote", function() {
  var id = $(this).parent().children('.noteId').val();
  $.ajax({
    type: "DELETE",
    url: "/delete/" + id,
  }).then(function (data) {
    // $(deleteButton).parent().parent().parent().remove();
  }).catch(function (err) {
    // If an error occurred, send it to the client
    console.log('ERROR: ' +json(err));
  });
});




  //END OF DOCUMENT READY
});