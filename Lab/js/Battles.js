/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
   var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
    })
   .addTo(map);
    
    var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
      })
   .addTo(map);

    //call getData function
    getData(map);
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

 //function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
    
    console.log(attribute);

    //create marker options
    var options = {
        fillColor: "#ff1155",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    
    

    //build popup content string
    var panelContent = "<p><b>Battle:</b> " + feature.properties.Battle + "</p>"
    + "<p><b>Date:</b> " + feature.properties.Date + "</p>"
    + "<p><b>Importance:</b> " + feature.properties.Importance + "</p>"
    + "<p><b>Importance_1900_to_Present:</b> " + feature.properties.Importance_1900_to_Present + "</p>"
    + "<p><b>Importance_500BC_to_0:</b> " + feature.properties.Importance_500BC_to_0 + "</p>"
    + "<p><b>Importance_0_to_1100:</b> " + feature.properties.Importance_0_to_1100 + "</p>"
    + "<p><b>Importance_1100_to_1600:</b> " + feature.properties.Importance_1100_to_1600 + "</p>"
    + "<p><b>Importance_1600_to_1900:</b> " + feature.properties.Importance_1600_to_1900 + "</p>"
    
    
    var popupContent = feature.properties.Battle;

    //Example 2.1 line 27...bind the popup to the circle marker
    layer.bindPopup(panelContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });

    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        Click: function(){
            $("#panel").html(popupContent);
        }
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function createSequenceControls(map){
    //create range input element (slider)
    //Example 3.3 line 1...create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
       //below Example 3.4...add skip buttons
    $('#panel').append('<button class="skip" id="reverse">Back</button>');
    $('#panel').append('<button class="skip" id="forward">Next</button>');
    
    //Below Example 3.6 in createSequenceControls()
    //Step 5: click listener for buttons
    //Example 3.12 line 2...Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
    });
    
    //Example 3.12 line 7...Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //sequence
    });

    //set slider attributes
    $('.range-slider').attr({
        max: 4,
        min: 0,
        value: 0,
        step: 1
    })
};



//Above Example 3.8...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Importance_rating") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        //Example 3.16 line 4
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>Battle:</b> " + props.Battle + "</p>";
            + "<p><b>Date:</b> " + props.Date + "</p>"
            + "<p><b>Importance:</b> " + props.Importance + "</p>"
            + "<p><b>Importance_1900_to_Present:</b> " + props.Importance_1900_to_Present + "</p>"
            + "<p><b>Importance_500BC_to_0:</b> " + props.Importance_500BC_to_0 + "</p>"
            + "<p><b>Importance_0_to_1100:</b> " + props.Importance_0_to_1100 + "</p>"
            + "<p><b>Importance_1100_to_1600:</b> " + props.Importance_1100_to_1600 + "</p>"
            + "<p><b>Importance_1600_to_1900:</b> " + props.Importance_1600_to_1900 + "</p>"
            

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
                            };
            });
        };

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/Battles.geojson", {
        dataType: "json",
        success: function(response){
             //create an attributes array
            var attributes = processData(response);
            
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            createSequenceControls(map,attributes);
            
        }
    });
};

$(document).ready(createMap);