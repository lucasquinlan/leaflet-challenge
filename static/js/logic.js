// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});



// Function to determine marker color by depth
function getColor(depth){
    if (depth < 10) return "green";
    else if (depth < 30) return "greenyellow";
    else if (depth < 50) return "yellow";
    else if (depth < 70) return "orange";
    else if (depth < 90) return "orangered";
    else return "red";
};  



// Function to define map features
function createFeatures(earthquakeData) {
    
    // Add popup with description.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</h3><hr><p>Depth: ${feature.geometry.coordinates[2]}`);
    };

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature.properties.mag*2.5,
                color: "black",
                fillColor: getColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                opacity: 1,
                weight: 1
            });
        }
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}




// Function to create map
function createMap(earthquakes) {
    
    // Create the base layer.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create a baseMaps object.
    let baseMaps = {
        "Street Map": street
    };
    
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
    });

    // Create a layer control.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create a legend and add it to the map.
    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let depthRanges = [-10, 10, 30, 50, 70, 90];
        let labels = [];
 
        for (let i = 0; i < depthRanges.length; i++) {
            div.innerHTML += '<i style="background:' + getColor(depthRanges[i] + 1) + '"></i> ' +
            depthRanges[i] + (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + '<br>' : '+');
            
        }
 
        div.innerHTML += '<br>' + labels.join('<br>');
        return div;
    };
    
    legend.addTo(myMap);
}