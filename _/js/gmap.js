/*var editMap;
var editMarker;

var viewMap;
var viewMarker;

window.onload = function () {
	var myLatLng = new google.maps.LatLng(49.996505, 36.245621);
	editMap = initializeMap("map_canvas", myLatLng);
	editMarker = new google.maps.Marker({
    	  draggable: true,
	      position: myLatLng,
	      map: editMap,
	      title: 'Hello World!'
	});
	viewMap = initializeMap("emap", myLatLng);
	viewMarker = new google.maps.Marker({
	      position: myLatLng,
	      map: viewMap,
	      title: 'Hello World!'
	});
}

function initializeMap(mapid, myLatLng) {
	var mapOptions = {
	  center: myLatLng,
	  zoom: 15,
	  mapTypeId: google.maps.MapTypeId.HYBRID
	};

	return new google.maps.Map(document.getElementById(mapid), mapOptions);
}
*/