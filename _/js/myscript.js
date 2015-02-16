$(window).ready(function() {
	// Обработка формы 
	var $button = $("#submit");
	var $textar = $("#msg-txt");
	var $checkboxpane = $("#checkboxpane");
	var $colorpickerbutton = $("#colorpickerbutton");
	var editpane = document.querySelector("#editpane");
	var $select = $("#fsize");
	var $relation = $("#relation");
	var $clearLocalStorageBtn = $("#clearLocalStorage");
	var $eventName = $("#evtname");
	var $eventDate = $("#date");
	var $table = $("#table-events-list");
	var $video = $("#video");
	// applying jqery UI to some of the elements
	$eventDate.datepicker();
	$button.button();
	$button.css({background: "linear-gradient(#22A7F0, #1F4788)"});
	$clearLocalStorageBtn.button();
	$clearLocalStorageBtn.css({background: "linear-gradient(#F7CA18, #F9690E)"});
	$checkboxpane.buttonset();
	$colorpickerbutton.button();
	$select.selectmenu({width: 100});
	$relation.buttonset();

	var currentStyle = {}; // here we store our current style for text area
	var events = [];

	function formEventsTable(){
		events = getEventsFromLocalStorage();

		// building events table
		var $list = $("#list-placeholder").empty();
		var $table = $("<table>", { id: "table-events-list" });
		$table.append("<tr><th>Event Name</th><th>Event Date</th></tr>");
		for(var i = 0; i < events.length; i++) {
			var $tr = $('<tr>');
			$tr.data("id", events[i].id);
			$tr.append("<td>" + events[i].eventName + "</td>");
			$tr.append("<td>" + events[i].eventDate + "</td>");
			$table.append($tr);
		}
		$list.append($table);
		$table.find("tr:not(:first-child)").on("click", function() {
			window.location.hash = "#event/" + $(this).data("id");
		})
	}

	function formEventView(id) {
		events = getEventsFromLocalStorage();

		var element = findElementInArrById(events, id);
		if(!element)
		{
			$(".page").hide();
			$("#page404").show();
			return;
		}

		$("#ename").html(element.eventName);
		$("#edate").html(element.eventDate);
		$("#edescr").html(element.description.text).attr("style", objToStyle(element.description.style));
		$("#erelation").html(element.relation);
		$("#eid").html(element.id);
		var latlng = new google.maps.LatLng(element.map.lat, element.map.lng);
		viewMarker.setPosition(latlng);
		viewMap.setCenter(latlng);

		// video links handling
		if(element.video){
			var link = element.video;
			var pattern = /v=(.{11})/g;
			var videoid = pattern.exec(link)[1];
			$("#evideo").html('<iframe width="420" height="300" src="https://www.youtube.com/embed/'+videoid+'" frameborder="0" allowfullscreen></iframe>');
		}
		
	}

	function showAllEventsOnMap() {
		events = getEventsFromLocalStorage();

		var markers = [];
		for (var i = 0; i < events.length; i++) {
			markers.push(
				new google.maps.Marker({
					position: new google.maps.LatLng(events[i].map.lat, events[i].map.lng) ,
					map: placesMap,
					title: events[i].eventName
				})
			);
		};

		var bounds = new google.maps.LatLngBounds();
		for(i = 0; i < markers.length; i++)
		 	bounds.extend(markers[i].getPosition());
		placesMap.fitBounds(bounds);
	}

	function findElementInArrById(events, id) {
		for (var i = 0; i < events.length; i++)
			if(events[i].id == id)
				return events[i];
		return undefined;
	}

	function getEventsFromLocalStorage(){
		var eventsAsString = localStorage.getItem('events');
		return events = eventsAsString ? JSON.parse(eventsAsString) : [];
	}

	function saveEvent() {
		events = getEventsFromLocalStorage();

		var event = {
			id: getId(),
			eventName: $eventName.val(),
			eventDate: $eventDate.val(),
			relation: $('input[name=relation]:checked').val(),
			description: {
				style: currentStyle,
				text: $textar.val()
			},
			map: {
				lat: editMarker.getPosition().lat(),
				lng: editMarker.getPosition().lng()
			},
			video: $video.val()
		};
		events.push(event);
		localStorage.setItem('events', JSON.stringify(events));
	}

	function getId() {
		var idAsString = localStorage.getItem('lastId');
		var id = idAsString ? parseInt(idAsString) + 1 : 1;
		localStorage.setItem('lastId', id);
		return id;
	}

	$button.on("click", function(){
		publishEvent();
	});

	function objToStyle(obj) {
		var result = '';
		for (var i in obj) result += i + ': ' + obj[i] + ';';
		return result;
	}

	function publishEvent() {
		saveEvent();
		$eventName.val('');
		$eventDate.val('');
		$textar.val('');
		$video.val('');
		$checkboxpane.find("input").removeAttr("checked").button("refresh");
		$relation.find("input").removeAttr('checked').button("refresh");
		showSuccessNotification();
	};

	function showSuccessNotification(){
		var $header = $("#header");
		var $successDiv = $("<div>", { id: "success-message"});	
		$successDiv.text("Event was saved successfully!!");
		$header.append($successDiv);
		$successDiv.fadeOut(4000);
	}

	$checkboxpane.on("click", function(ev){
		switch(ev.target.value){
			case 'bold':
				if(ev.target.checked)
					currentStyle['font-weight'] = 'bold';
				else
					delete currentStyle['font-weight'];
				break;
			case 'italic':
				if(ev.target.checked)
					currentStyle["font-style"] = "italic";
				else
					delete currentStyle["font-style"];
				break;
			case 'underline':
				if(ev.target.checked)
					currentStyle["text-decoration"] = "underline";
				else
					delete currentStyle["text-decoration"];
				break;
			default : 
				break;
		}
		$textar.attr("style", objToStyle(currentStyle));
	});

	colorpickerbutton.addEventListener("click", function(ev){
		var wrapper = document.querySelector("#wrapper");
		if(wrapper.style.display == "block") {
			var colorElement = document.querySelector('input[name="color"]:checked');
			currentStyle.color = colorElement.value;
			$textar.attr("style", objToStyle(currentStyle));
			wrapper.style.display = "none";
		} else {
			wrapper.style.display = "block";
		}
	});

	$select.on("selectmenuchange", function(ev){
		currentStyle["font-size"] = ev.target.value;
		$textar.attr("style", objToStyle(currentStyle));
	});

	$clearLocalStorageBtn.on("click", function(ev){
		localStorage.clear();
	});

	$(window).on("hashchange", function(){
		router.changeState(window.location.hash);
	});

	// Router
	function Router(){
		var routesCollection = [];
		this.addRoute = function(hash, callback){
			if(typeof(hash) !== "string" || typeof(callback) !== "function"){
				throw new TypeError("hello! there's something wrong with the hash, check it!");
			}
			routesCollection.push({
				hash: hash,
				callback: callback
			});
		};

		this.onHashChanged = function (hash) {
			$('ul>li>a').removeClass('highlight');
			$('ul>li>a[href="' + hash + '"]').addClass('highlight');
		}

		this.changeState = function(hash) {
			if(hash.length == 0)
				hash = "#list";

			this.onHashChanged(hash);

			hash = hash.substr(1); // remove #
			$(".page").hide();
			for (var i = 0; i < routesCollection.length; i++) {
				if(hash.indexOf(routesCollection[i].hash) == 0) {
					var params = undefined;
					var slashIndex = hash.indexOf('/');
					if(slashIndex >= 0)
						params = hash.substr(slashIndex + 1);
					$("#"+routesCollection[i].hash+".page").show();
					routesCollection[i].callback(params);
					window.scrollTo(0, 0);
					return;
				}
			}

			$("#page404").show();
		}
	}

	var router = new Router();

	//adding routes for Router
	router.addRoute("event-add", function() {
		google.maps.event.trigger(editMap, "resize");
	});

	router.addRoute("list", function() {
		formEventsTable();
	});

	router.addRoute("event", function(params) {
		formEventView(parseInt(params));
		google.maps.event.trigger(viewMap, "resize");
	});

	router.addRoute("places", function() {
		google.maps.event.trigger(placesMap, "resize");
		showAllEventsOnMap();
	});

	initMaps();
	
	router.changeState(window.location.hash);

	var editMap;
	var editMarker;

	var viewMap;
	var viewMarker;

	var placesMap;

	function initMaps() {
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
		placesMap = initializeMap("places_map", myLatLng);
	}

	function initializeMap(mapid, myLatLng) {
		var mapOptions = {
		  center: myLatLng,
		  zoom: 15,
		  mapTypeId: google.maps.MapTypeId.HYBRID
		};

		return new google.maps.Map(document.getElementById(mapid), mapOptions);
	}
});

