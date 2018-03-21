var map;
var infoWindow;

// location info
var initLocation = [{
        name: "Mecca",
        coords: {
            lat: 21.3891,
            lng: 39.8579
        },
        content: "",
        marker: ""
    },
    {
        name: "Jeddah",
        coords: {
            lat: 21.2854,
            lng: 39.2376
        },
        content: "",
        marker: ""
    },
    {
        name: "Buraydah",
        coords: {
            lat: 26.3592,
            lng: 43.9818
        },
        content: "",
        marker: ""
    },
    {
        name: "Riyadh",
        coords: {
            lat: 24.7136,
            lng: 46.6753
        },
        content: "",
        marker: ""
    },
    {
        name: "Medina",
        coords: {
            lat: 24.5247,
            lng: 39.5692
        },
        content: "",
        marker: ""
    }
];



var wikiRequestTimeout = setTimeout(function() {

    swal('Oops...', 'Wikipedia Resources Could Not Be Loaded!', 'error')
}, 5000); // 5 second timeout error


// Add Marker Function
function addMarker(props) {
    // Ref: https://stackoverflow.com/questions/46259764/google-maps-wikipedia-ajax-call-for-loop-issue 
    // Ref: https://www.youtube.com/watch?v=Zxf1mnP5zcw
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + props.name + '&format=json&callback=wikiCallBack';
    $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        success: function(response) {
            var result = response[2];
            props.content = result[0];

            var marker = new google.maps.Marker({
                position: props.coords,
                map: map,
                draggable: true,
                animation: google.maps.Animation.DROP
            });

            infoWindow = new google.maps.InfoWindow({
                content: '<div class="container"> <div class="row"> <div class="col-ms-12"><h3>' + props.name + '</h3><p>' + props.content + '</p></div></div></div>'
            });

            marker.addListener('click', function() {
                infoWindow.setContent('<div class="container"> <div class="row"> <div class="col-ms-12"><h3>' + props.name + '</h3><p>' + props.content + '</p></div></div></div>');
                infoWindow.open(map, marker);
                //Ref: https://developers.google.com/maps/documentation/javascript/examples/marker-animations
                // add animation to the marker
                if (marker.getAnimation() !== null) {
                    marker.setAnimation(null);
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                }
            });

            marker.setVisible(true)
            props.marker = marker;

            clearTimeout(wikiRequestTimeout);
        }
    });
}

function initMap() {

    var options = {
        zoom: 5,
        center: {
            lat: 23.8859,
            lng: 45.0792
        }
    }
    // New map
    map = new google.maps.Map(document.getElementById('map'), options);

    // Loop through markers
    for (var i = 0; i < initLocation.length; i++) {
        // Add marker
        addMarker(initLocation[i]);
    }

}


var ViewModel = function() {
    var self = this;
    this.filter = ko.observable();
    this.locationList = ko.observableArray([]);

    initLocation.forEach(function(item) {
        self.locationList.push(item);
    });

    this.openInfo = function() {
        // open infowindow
        google.maps.event.trigger(this.marker, "click");
    }
    // Ref: https://stackoverflow.com/questions/34584181/create-live-search-with-knockout
    this.visiblePlaces = ko.computed(function() {
        return this.locationList().filter(function(location) {
            if (location.marker) {
                // Hide the marker from the map
                location.marker.setVisible(false);
            }
            if (!self.filter() || location.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {
                // Disply only this location marker in the map
                if (location.marker) {
                    location.marker.setVisible(true);
                }
                return location;
            }
        });
    }, this);
}

ko.applyBindings(new ViewModel());