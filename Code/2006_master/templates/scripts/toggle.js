/*
  input: str
  output: nil
  desc: function to set markers as visible (show markers)
*/
function show(cat){
  //tick checkbox
  document.getElementById(cat + "box").checked = true;
  for (var i=0; i<map.markers[cat].length; i++){
    map.markers[cat][i].setVisible(true);
  }
}

/*
  input: str
  output: nil
  desc: function to set markers as not-visible (hide markers)
*/
function hide(cat){
  //clear checkbox
  document.getElementById(cat + "box").checked = false;
  for (var i=0; i<map.markers[cat].length; i++){
    map.markers[cat][i].setVisible(false);
  }
}

/*
  input: html checkbox, str
  output: nil
  desc: function to toggle markers accordingly depending on
        condition of checkbox
*/
function boxclick(box, cat){
  closeCurrentInfoWindow();
  if (box.checked){
    show(cat);
  }
  else {
    hide(cat);
  }
}

/*
  input: nil
  output: nil
  desc: function to close current GoogleMaps infowindow
*/
function closeCurrentInfoWindow(){
  if (infowindow != null){
    infowindow.close();
  }
}
