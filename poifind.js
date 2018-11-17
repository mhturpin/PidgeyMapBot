var fs = require('fs');

var mapdata = [];
var poiTypes = [];

function matchName(name, poiType) {
  // Quote metacharacters
  name = name.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
  name = name.replace('*','.*');

  var re = new RegExp(name, 'i');
  return function(el) {
    if (poiType && poiType!=el[1]) {
      return false;
    }
    if (!name){
      return false;
    }
    return re.test(el[0])
  }
}

function getByNumber(id) {
  return mapdata.filter(num => num[4]==id);
}

function loadPois(file) {
  mapdata = JSON.parse(fs.readFileSync(file, 'utf8'));

  var j;
  for(j = 0; j < mapdata.length; j++) {
    if (!poiTypes.includes(mapdata[j][1])){
      poiTypes.push(mapdata[j][1]);
    }
  }
}

function updatePoi(num, type) {
  for (var i = 0; i < mapdata.length; i++) {
    if (mapdata[i][4] == num) {
      mapdata[i][1] = type
    }
  }

  fs.writeFile('poi_with_num.json', JSON.stringify(mapdata, null, 2), function(err, data){
    if (err) console.log(err);
  });
}

function find(name, poiType) {
  return mapdata.filter(matchName(name, poiType));
}

// Return single match if any
function singleMatch(mapres, name, poiType, returnExact = false) {

  // Single match
  if(mapres.length == 1) {
    return mapres[0];
  }

  // If exact match, return only this match
  if(returnExact) {
    var exactMatches=[]
    mapres.forEach(el => {
      if(name.toLowerCase()==el[0].trim().toLowerCase()) {
        exactMatches.push(el);
      }
    });
    if(exactMatches.length == 1) {
      return exactMatches[0];
    }
  }
}

function listResults(mapres) {
  var res = [];
  mapres.forEach(el => {
    res.push("" + el[1]+": "+el[0] + " _"+el[4]+"_")
  });
  return res;
}

function isPoiType(str) {
  return poiTypes.includes(str);
}

module.exports = {
  loadPois: loadPois,
  listResults: listResults,
  singleMatch:singleMatch,
  getByNumber:getByNumber,
  isPoiType:isPoiType,
  find: find
}
