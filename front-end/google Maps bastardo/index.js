  var circle, polygon, map;
  var currentGeometry = "circle";
  var DEFAULT_RADIUS = 15 * 1000;

  function initMap() {
    var startLoc = new google.maps.LatLng(41.89663574263758, 12.575416737500076);
    

    map = new google.maps.Map(document.getElementById("map"), {
      center: startLoc,
      zoom: 10
    });

    var input = document.getElementById("pac-input");
    var output = document.getElementById("output-container");
    var shapeInput = document.getElementById("shape-input");
    infoWindow = new google.maps.InfoWindow();
    const locationButton = document.createElement("button");
    locationButton.textContent = "Trova la tua posizione";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    // setup cerchio
    google.maps.event.addListenerOnce(map, "idle", function() {
      circle = new google.maps.Circle({
          strokeColor: "#3DC371",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#3DC371",
          fillOpacity: 0.35,
          map: map,
          center: startLoc,
          radius: DEFAULT_RADIUS,
          editable: true
        });

      google.maps.event.addListener(circle, "radius_changed", outputGeometry);
      google.maps.event.addListener(circle, "center_changed", outputGeometry);

      outputGeometry();
    });

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(output);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(shapeInput);

    var autocomplete = new google.maps.places.Autocomplete(input, { types: ["geocode"] });
    autocomplete.bindTo("bounds", map);
    autocomplete.addListener("place_changed", function() {
      autocompletePlaceChanged(autocomplete.getPlace());
    });

    google.maps.event.addDomListener(shapeInput, "click", shapeInputClick);

    new Clipboard(".copybtn");



  locationButton.addEventListener("click", () => {
   
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(pos["lat"],pos["lng"]);
          infoWindow.setPosition(pos);
          infoWindow.setContent("Ti trovi nei paraggi.");
          infoWindow.open(map);
          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // il browser non supporta la geolocalizzazione
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  }

  // invocazione initMap
  window.initMap = initMap;

  function outputGeometry() {
    var geo;

    if (currentGeometry === "circle") {
      var center = circle.getCenter();
      geo = {
        lat: center.lat(),
        lng: center.lng(),
        radinanti_km: Math.round(circle.getRadius() / 1000)
      };
    } 
    document.getElementById("pos-output").innerHTML = `"geo": ${JSON.stringify(geo, 0, 2)}`;
  }

function shapeInputClick(mouseEvent) {
  var clickedOption = mouseEvent.target;
  if (clickedOption.className.indexOf("selected") !== -1) {
    // option already selected
    return;
    }
    // deseleziona tutto
  var shapeOptions = document.getElementsByClassName("shape-option");
  for (var i = 0; i < shapeOptions.length; i++) {
    shapeOptions[i].className = shapeOptions[i].className.replace("selected", "").trim();
  }
    // select
  clickedOption.className += " selected";
  currentGeometry = mouseEvent.target.getAttribute("data-geo-type");
  outputGeometry();
}


function setCurrentPosition(latit,longit) {
    var center = new google.maps.LatLng(latit, longit);
    map.setCenter(center);
    map.setZoom(10);
    circle.setCenter(center);
    circle.setRadius(DEFAULT_RADIUS);
    outputGeometry();
  }