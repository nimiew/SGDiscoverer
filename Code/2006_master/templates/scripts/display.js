//do await to put image
async function putImage(nameString,card){
  var abc=await ajaxPic(nameString,card);
  return 0;
}

/*
  input: string, div element
  output: int
  desc: function to grab image to display on cards in POI listview
*/
function ajaxPic(nameString,card){
  var urlString = "/putPic?pointname="+nameString;
  $.ajax({
         url: urlString,
         method: "GET",
         dataType: "json",
         data: {},
         complete: function(xhr, status) {},//not impt
         success: function(data, status, xhr) {
             var urlImage = data.results;
             //console.log(urlImage);
             var image = document.createElement('img');
             image.className="card-img-top";
             image.src = urlImage;
             image.alt="Not Available";
             image.style.height="150";
             image.style.width="100%";
             card.appendChild(image);
         }
    });
  return 0;
}

/*
  input: JSON Object
  output: nil
  desc: function to dynamically add a HTML element onto page
*/
function addElement(parentId, elementTag, elementId, elementClass) {
    // Adds an element to the document
    var p = document.getElementById(parentId);
    var newElement = document.createElement(elementTag);
    newElement.setAttribute('id', elementId);
    newElement.setAttribute('class', elementClass);
    p.appendChild(newElement);
}

/*
  input: string
  output: nil
  desc: function to dynamically remove a HTML element from page
*/
function removeElement(elementId) {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

/*
  input: nil
  output: nil
  desc: function to clear the cards (listview or discount cards on deals page)
        when required, e.g. when data should be refreshed during a new search, etc.
*/
function clearDisplay(){
  removeElement("cardRow");
  addElement("parentmaincontainer", "div", "cardRow", "row");
  if($("#sortratingbutton").parent().length){
    $("#sortratingbutton").remove();
  }
  if($("#sortdistbutton").parent().length){
    $("#sortdistbutton").remove();
  }
}

/*
  input: array of GoogleMaps markers
  output: nil
  desc: function to handle and display POIs returned from search
        into cards
*/
function listDisplay(points) {
  //if user has not loaded any points
  if (map.currentPOIurl == '' || points.length == 0){
    return;
  }
  var add_sort = document.getElementById('addsort')
  var sort_dist_button = document.createElement("button");
  sort_dist_button.textContent = "Sort By Distance";
  sort_dist_button.id = "sortdistbutton";
  sort_dist_button.className = "btn btn-outline-secondary";
  var sort_rating_button = document.createElement("button");
  sort_rating_button.textContent = "Sort By Rating";
  sort_rating_button.id = "sortratingbutton";
  sort_rating_button.className = "btn btn-outline-secondary";
  add_sort.appendChild(sort_dist_button);
  add_sort.appendChild(sort_rating_button);

  var row = document.getElementById('cardRow');

  for (let i=0; i<points.length; i++){

    var col = document.createElement('div');
    col.className = 'column card'; //<div class='column card'>

    putImage(points[i]['name'] , col);

    var myArticle = document.createElement('a');
    myArticle.className = "card-body column-img";

    //poi name
    var name = document.createElement('h6');

    //poi rating
    var rating = document.createElement('h6');

    //poi address
    var address = document.createElement('p');
    address.className = "card-subtitle mb-2 text-muted font-small";

    //poi favourite
    var account_control = document.getElementById("account_control");
    var username = account_control.getAttribute("data-username");
    if(username!==''){
      var favourite = document.createElement('i');
      favourite.className = 'fas fa-heart';
      favourite.id = points[i]['place_id'];
      var favourites = account_control.getAttribute("data-favourites");
      var status = account_control.getAttribute("data-status");
    }

    if(username && favourites.includes(favourite.id)){
      console.log("will this ever run");
      favourite.style.color='red';
    }

    //poi type
    var type = document.createElement('p');

    //poi info
    name.textContent = points[i]['name'];
    rating.textContent = points[i]['rating'];
    address.textContent = points[i]['address'];
    type.textContent = "Type: " + points[i]['type'].charAt(0).toUpperCase() + points[i]['type'].slice(1);

    /*
      input: nil
      output: nil
      desc: function to toggle the colour of heart icon used to indicate
            if POI is favourited or not
    */
    function changecolor(){
      if(this.style.color=='red'){
        this.style.color='black';
        favourite = 'N';
        id = this.id;
        urlString = "/storefavourite?username=" + username + "&id=" + id + "&favourite=" + favourite;
        let temp = account_control.getAttribute("data-favourites").split(',');
        temp.push(favourite);
        temp = Array.from(new Set(temp));
        temp = temp.join();
        temp = temp.replace(/(^,)|(,$)/g, "")
        account_control.setAttribute("data-favourites", temp);
        $.ajax({
          url: urlString,
          method: "GET",
          dataType: "json",
          data: {},
          complete: function(xhr, status) {},
          success: function(data, status, xhr) {
            console.log("UNFAVOURITE");
          }
        });
      }
      else{
        this.style.color='red';
        favourite = 'Y';
        id = this.id;
        urlString = "/storefavourite?username=" + username + "&id=" + id + "&favourite=" + favourite;

        $.ajax({
          url: urlString,
          method: "GET",
          dataType: "json",
          data: {},
          complete: function(xhr, status) {},
          success: function(data, status, xhr) {
            console.log("FAVOURITE");
          }
        });
      }
    }

    if (username){
      //assign function
      favourite.onclick=changecolor;
    }
    myArticle.appendChild(name);
    myArticle.appendChild(rating);
    myArticle.appendChild(address);
    myArticle.appendChild(type);

    if(username){
      myArticle.appendChild(favourite)
    };
    col.appendChild(myArticle);
    row.appendChild(col);
  }

  /*
    Function triggered upon clicking "Sort by Rating" button
  */
  $("#sortratingbutton").click(function() {
    removeElement("cardRow");
    addElement("parentmaincontainer", "div", "cardRow", "row");
    rating_list= [];
    for(let i=0; i<points.length; i++){
      rating_list.push(points[i]['rating']);
    }
    sortWithIndeces(rating_list, true);
    sorted_indeces = rating_list.sortIndices;
    var row = document.getElementById('cardRow');
    for (let i=0; i<sorted_indeces.length; i++){
      var col = document.createElement('div');
      col.className = 'column card'; //<div class='column card'>
      putImage(points[sorted_indeces[i]]['name'] , col);

      var myArticle = document.createElement('a');
      myArticle.className = "card-body column-img";
      //poi name
      var name = document.createElement('h6');
      //poi rating
      var rating = document.createElement('h6');
      //poi address
      var address = document.createElement('p');
      address.className = "card-subtitle mb-2 text-muted font-small";
      //poi type
      var type = document.createElement('p');
      var account_control = document.getElementById("account_control");
      var username = account_control.getAttribute("data-username");
      if(username!==''){
        var favourite = document.createElement('i');
        favourite.className = 'fas fa-heart';
        favourite.id = points[i]['place_id'];
        var favourites = account_control.getAttribute("data-favourites");
        var status = account_control.getAttribute("data-status");
      }

      if(username && favourites.includes(favourite.id)){
        console.log("will this ever run");
        favourite.style.color='red';
      }

      //poi info
      name.textContent = points[sorted_indeces[i]]['name'];
      rating.textContent = points[sorted_indeces[i]]['rating'];
      address.textContent = points[sorted_indeces[i]]['address'];
      type.textContent = "Type: " + points[sorted_indeces[i]]['type'].charAt(0).toUpperCase() + points[sorted_indeces[i]]['type'].slice(1);

      /*
        input: nil
        output: nil
        desc: function to toggle the colour of heart icon used to indicate
              if POI is favourited or not
      */
      function changecolor(){
        if(this.style.color=='red'){
          this.style.color='black';
          favourite = 'N';
          id = this.id;
          urlString = "/storefavourite?username=" + username + "&id=" + id + "&favourite=" + favourite;
          $.ajax({
            url: urlString,
            method: "GET",
            dataType: "json",
            data: {},
            complete: function(xhr, status) {},
            success: function(data, status, xhr) {
              console.log("UNFAVOURITE");
            }
          });
        }

        else{
          this.style.color='red';
          favourite = 'Y';
          id = this.id;
          urlString = "/storefavourite?username=" + username + "&id=" + id + "&favourite=" + favourite;
          let temp = account_control.getAttribute("data-favourites").split(',');
          temp.splice(temp.indexOf(favourite),1);
          temp = Array.from(new Set(temp));
          temp = temp.join();
          temp = temp.replace(/(^,)|(,$)/g, "")
          account_control.setAttribute("data-favourites", temp);

          $.ajax({
            url: urlString,
            method: "GET",
            dataType: "json",
            data: {},
            complete: function(xhr, status) {},
            success: function(data, status, xhr) {
              console.log("FAVOURITE");
            }
          });
        }
      }

      if(username){
        //assign function
        favourite.onclick=changecolor;
      }
      myArticle.appendChild(name);
      myArticle.appendChild(rating);
      myArticle.appendChild(address);
      myArticle.appendChild(type);
      if(username) myArticle.appendChild(favourite);
      col.appendChild(myArticle);
      row.appendChild(col);
    }
  })

  /*
    Function triggered upon clicking "Sort by Distance" button
  */
  $("#sortdistbutton").click(function() {
    var address = prompt("Enter your starting location: e.g. Anchorvale Road Blk 317D");
    if (address == null){
      return;
    }
    var mode;
    while (!(mode=="driving"||mode=="walking"||mode=="transit")){
      mode = prompt("Please type \"driving\", \"walking\", \"transit\"");
      if (mode == null){
        return;
      }
    }
    removeElement("cardRow");
    addElement("parentmaincontainer", "div", "cardRow", "row");
    latlon_list= [];
    for (let i=0; i<points.length; i++){
      latlon_list.push(points[i]['latlongs'][0].join());
    }

    send_data = JSON.stringify({ 'latlon_list': latlon_list , 'mode': mode, 'address':address});
    urlString = "/getdist";
    $.ajax({
      url: urlString,
      method: "POST",
      dataType: "json",
      contentType: "application/json",
      data: send_data,
      complete: function(xhr, status) {},
      success: function(data, status, xhr) {
        console.log(data);
        var distance_list = [];
        for(let i=0; i<data['results'].length; i++){
            distance_list.push(data['results'][i]['distance']);
        }
        sortWithIndeces(distance_list, false);
        sorted_indeces = distance_list.sortIndices;
        var row = document.getElementById('cardRow');
        for (let i=0; i<sorted_indeces.length; i++){
          var col = document.createElement('div');
          col.className = 'column card'; //<div class='column card'>
          putImage(points[sorted_indeces[i]]['name'] , col);
          var myArticle = document.createElement('a');
          myArticle.className = "card-body column-img";
          var name = document.createElement('h6');
          var rating = document.createElement('h6');
          var address = document.createElement('p');
          address.className = "card-subtitle mb-2 text-muted font-small";
          var type = document.createElement('p');
          var distance = document.createElement('p');
          var account_control = document.getElementById("account_control");
          var username = account_control.getAttribute("data-username");
          if(username!==''){
            var favourite = document.createElement('i');
            favourite.className = 'fas fa-heart';
            favourite.id = points[i]['place_id'];
            var favourites = account_control.getAttribute("data-favourites");
            var status = account_control.getAttribute("data-status");
          }
          name.textContent = points[sorted_indeces[i]]['name'];
          rating.textContent = points[sorted_indeces[i]]['rating'];
          address.textContent = points[sorted_indeces[i]]['address'];
          distance.textContent = "Distance from your input start point: " + distance_list[i] + "m"
          type.textContent = "Type: " + points[sorted_indeces[i]]['type'].charAt(0).toUpperCase() + points[sorted_indeces[i]]['type'].slice(1);
          if(username && favourites.includes(favourite.id)){
            console.log("will this ever run");
            favourite.style.color='red';
          }

          /*
            input: nil
            output: nil
            desc: function to toggle the colour of heart icon used to indicate
                  if POI is favourited or not
          */
          function changecolor(){
            if(this.style.color=='red'){
              this.style.color='black';
              favourite = 'N';
              id = this.id;
              urlString = "/storefavourite?username=" + username + "&id=" + id + "&favourite=" + favourite;
              $.ajax({
                url: urlString,
                method: "GET",
                dataType: "json",
                data: {},
                complete: function(xhr, status) {},
                success: function(data, status, xhr) {
                  console.log("UNFAVOURITE");
                }
              });
            }
            else{
              this.style.color='red';
              favourite = 'Y';
              id = this.id;
              urlString = "/storefavourite?username=" + username + "&id=" + id + "&favourite=" + favourite;
              $.ajax({
                url: urlString,
                method: "GET",
                dataType: "json",
                data: {},
                complete: function(xhr, status) {},
                success: function(data, status, xhr) {
                  console.log("FAVOURITE");
                }
              });
            }
          }
          if(username){
            //assign function
            favourite.onclick=changecolor;
          }
          myArticle.appendChild(name);
          myArticle.appendChild(rating);
          myArticle.appendChild(address);
          myArticle.appendChild(type);
          myArticle.appendChild(distance);
          if(username) myArticle.appendChild(favourite);
          col.appendChild(myArticle);
          row.appendChild(col);
        }
      }
    });
  })
}
