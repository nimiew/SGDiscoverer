/*
  input: str
  output: nil
  desc: function to update dropdown menu with selected star
*/
function updateDropdownStar(star){
  document.getElementById("filterRating").innerHTML = star;
  document.getElementById("filterRating").value = star;
  console.log("star");
}

/*
  input: str
  output: nil
  desc: function to update dropdown menu with selected search radius
*/
function updateDropdownDist(dist){
  document.getElementById("filterDistance").innerHTML = dist + "m";
  document.getElementById("filterDistance").value = dist
  console.log("dist");
}

/*
  input: str
  output: nil
  desc: Function to update dropdown menu with selected type of POI
*/
function updateDropdownType(type){
  document.getElementById("filterType").innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
  document.getElementById("filterType").value = type;
}

/*
  input: str
  output: nil
  desc: Function to update dropdown menu with selected district
*/
function updateDropdownDistrict(district){
  console.log(district);
  if (district == 'selectdistrict'){
    document.getElementById("filterDistrict").innerHTML = 'Select District';
    document.getElementById("filterDistrict").value = district;
  }
  else {
    document.getElementById("filterDistrict").innerHTML = district;
    document.getElementById("filterDistrict").value = district;
  }
}

/*
  input: nil
  output: nil
  desc: Function to get selected minimum rating
*/
function minRating(){
  star = document.getElementById("filterRating").value.split(" ")[0];
  return (star=='Any' || star=='')? '0':
  star;
}

/*
  input: nil
  output: nil
  desc: Function to get selected search radius
*/
function maxDistance(){
  dist = document.getElementById("filterDistance").value;
  return (dist=='Distance' || dist=='')? '400':
  dist;
}

/*
  input: nil
  output: nil
  desc: Function to get selected POI type
*/
function getType(){
  type = document.getElementById("filterType").value;
  return (type=='')? 'food':
  type;
}

/*
  input: nil
  output: nil
  desc: Function to selected district
*/
function getDistrict(){
  district = document.getElementById("filterDistrict").value;
  return district; //NOTE district can be ''
}
