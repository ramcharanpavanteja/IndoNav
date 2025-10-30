let map;

        const stations = [
            "Anantapur", "Anaparti", "Macherla", "Kadapa", "Vijayawada",
            "Guntur", "Visakhapatnam", "Eluru", "Kakinada", "Tirupati", "Narsapuram"
        ];
        
        function filterStations() {
            const input = document.getElementById('stationSearch').value.toLowerCase();
            const suggestionsBox = document.getElementById('suggestions');
            suggestionsBox.innerHTML = '';
        
            if (input.length === 0) {
                suggestionsBox.style.display = 'none'; // Hide suggestions if input is empty
                return;
            }
        
            // Filter stations based on input
            const filteredStations = stations.filter(station =>
                station.toLowerCase().includes(input)
            );
        
            if (filteredStations.length > 0) {
                suggestionsBox.style.display = 'block'; // Show suggestions container
                filteredStations.forEach(station => {
                    const suggestionDiv = document.createElement('div');
                    suggestionDiv.textContent = station;
                    suggestionDiv.classList.add('suggestion-item');
                    suggestionDiv.addEventListener('click', function() {
                        selectStation(station);
                    });
                    suggestionsBox.appendChild(suggestionDiv);
                });
            } else {
                suggestionsBox.style.display = 'none'; // Hide suggestions if no matches
            }
        }
        
        function selectStation(station) {
            document.getElementById('stationSearch').value = station;
            document.getElementById('suggestions').innerHTML = '';
            document.getElementById('suggestions').style.display = 'none';
        
            // Update the map and image based on the selected station
            document.getElementById('stationForm').dispatchEvent(new Event('submit'));
        }
        
        document.getElementById('stationForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const stationName = document.getElementById('stationSearch').value;
        
            // Assuming the geojson files are located in a folder 'geojson_files'
            const geojsonFilePath = `/geojson_files/${stationName}.geojson`;
            console.log(geojsonFilePath);
            fetch(geojsonFilePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('GeoJSON file not found');
                }
                return response.json();
            })
            .then(data => {
                // Use Folium map rendering logic here
                displayMap(data);
            })
            .catch(error => {
                console.error('Error fetching the GeoJSON file:', error);
                alert('Station not found. Please enter a valid station name.');
            });
        });
        
         
        
        function displayMap(geojsonData) {

        
            if (!geojsonData || !geojsonData.features || !geojsonData.features[0] || !geojsonData.features[0].geometry || !geojsonData.features[0].geometry.coordinates) {
                console.error('Invalid GeoJSON data:', geojsonData);
                alert('Invalid GeoJSON data. Please check the file.');
                return;
            }
        

            const navigatorMap = window.stationNavigator.map;
            if (!navigatorMap) {
                console.error('Map i    nstance is not initialized.');
                alert('Map instance is not initialized. Please check the map initialization.');
                return;
            }
        
            // Add tile layer to the map
            navigatorMap.eachLayer(layer => {
                if (layer.options && !layer._url) {
                    navigatorMap.removeLayer(layer);
                }
            });
                
            // Add tile layer to the map (using OpenStreetMap tiles)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxNativeZoom:18,
                maxZoom:20
            }).addTo(navigatorMap);
        
            const iconMap = {
                'Platform 1': '/icons/Platform1.png',
                'Platform 2': '/icons/Platform2.png',
                'Platform 3': '/icons/Platform3.png',
                'Ticket Counter': '/icons/ticket-counter.png'   
             }
        
        
            // Define the style for areas and borders (for polygons)
            function style(feature) {
                return {
                    color: 'darkcyan',  // Border color
                    weight: 1,          // Border thickness
                    fillColor: '#f1ece1',  // Area fill color
                    fillOpacity: 1      // Transparency
                };
            }
        
        try{
            L.geoJson(geojsonData, {
                // Style the polygons/lines
                style: style,
                // Add markers for the starting latitude and longitude of each area
                onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.place) {
                        const locName = feature.properties.place;
                        const locCoords = feature.geometry.coordinates[0][0];
                        if (!locCoords || locCoords.length < 2) {
                            console.error('Invalid coordinates in GeoJSON feature:', feature);
                            return;
                        }
                        let customIcon;
                        if (locName in iconMap) {
                            customIcon = L.icon({
                                iconUrl: iconMap[locName],
                                iconSize: [25, 25]  // Adjust size as needed
                            });
                        } else {
                            customIcon = L.divIcon({ className: 'gray-icon' });  // Default icon
                        }
                        L.marker([locCoords[1], locCoords[0]], { icon: customIcon })
                                .addTo(navigatorMap)
                                .bindPopup(locName)  // Popup with location name
                                .bindTooltip(locName); // Tooltip with location name on hover
                        }
                }
            }).addTo(navigatorMap);
        } catch (error) {
            console.error('Error adding GeoJSON data to the map:', error);
            alert('Error adding GeoJSON data to the map.');
        }
    }
         class Navigator {
                    constructor() {
                        const mapContainer = document.getElementById('map');
        
                if (!mapContainer) {
                    console.error('Map container element not found in Navigator.');
                    return;
                }
        
                // Check if the map instance exists and properly destroy it
                if (map) {
                    map.off();
                    map.remove();
                    map = null;
                }
        
                // Clear the inner HTML of the map container to fully reset it
                mapContainer.innerHTML = "";
                        this.geoResources = {};
                        this.stationLocation = [16.4442, 81.6998]; // Coordinates of Narsapuram Station
                        this.position = null;
                        this.destination = null;
        
                        // Manually populate geoResources (this should map to actual GeoJSON files)
                        this.geoResources = {
                             't2p1': 't2p1.geojson',
                            't2p2': 't2p2.geojson',
                            '1':'Narsapuram.geojson',
                            '2':'Narsapuram.geojson'
                        };
        
        
                        // Initialize map
                        this.map = L.map('map').setView(this.stationLocation, 17);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; OpenStreetMap contributors',
                            maxNativeZoom:18,
                            maxZoom:20
                        }).addTo(this.map);
        
                        // Draw the initial map
                        this.redrawMap();
                    }
        
                        changeDestination() {
                        const destValue = document.getElementById("destination").value;
        
                        if (destValue) {
                            this.destination = destValue;
                        } else {
                            this.destination = null;
                        }
                        this.checkAndRedraw();
        
                    }
                    
        
                    changeStartPoint() {
                        const sourceValue = document.getElementById("source").value;
                        if (sourceValue) {
                            this.position = sourceValue;
                        } else {
                            this.position = null;
                        }
                        this.checkAndRedraw();
                    }
        
                    checkAndRedraw() {
                        // Only redraw if both source and destination are selected
                        if (this.position && this.destination) {
                            this.redrawMap();
                        }
                    }
        
                    drawPathWay() {
                        const searchString = this.position + this.destination;
                        console.log(searchString);
                        const geoJsonPath = this.geoResources[searchString];
        
                        if (geoJsonPath) {
                            fetch(geoJsonPath)
                                .then(response => response.json())
                                .then(data => {
                                    let pathCoordinates = data.features[0].geometry.coordinates;
        
                                    // Switch the latitude and longitude positions
                                    pathCoordinates = pathCoordinates.map(this.switchPosition);
                                    // Create Ant Path using the correct method
                                    const antPath = L.polyline(pathCoordinates, {
                                        delay: 300,
                                        dashArray: [10, 20],
                                        weight: 2,
                                        color: "blue",
                                        pulseColor: "cyan"
                                    });
        
                                    // Add the path to the map
                                    antPath.addTo(this.map);
                                })
                                .catch(error => console.error('Error loading GeoJSON:', error));
                        } else {
                            console.error('GeoJSON file not found for search string:', searchString);
                        }
                    }
                    drawBuilding() {
            const geoJsonFile = this.geoResources[this.destination];
        
            if (geoJsonFile) {
                fetch(geoJsonFile)
                    .then(response => response.json())
                    .then(data => {
                        console.log("GeoJSON data:", data);  // Check GeoJSON structure
                        const iconMap = {
                'Platform 1': '/icons/Platform1.png',
                'Platform 2': '/icons/Platform2.png',
                'Platform 3': '/icons/Platform3.png',
                'Ticket Counter': '/icons/ticket-counter.png'   
             }
                        // Define the style for areas and borders (for polygons)
                        function style(feature) {
                            return {
                                color: 'darkcyan',  // Border color
                                weight: 1,          // Border thickness
                                fillColor: '#f1ece1',  // Area fill color
                                fillOpacity: 1      // Transparency
                            };
                        }
        
                        // Add the GeoJSON data to the map with styling and markers
                        L.geoJson(data, {
                            style: style,
                            onEachFeature: (feature, layer) => {
                                if (feature.properties && feature.properties.place) {
                                    const locName = feature.properties.place;
                                    const locCoords = feature.geometry.coordinates[0][0];
        
                                    let customIcon;
                                    if (locName in iconMap) {
                                        customIcon = L.icon({
                                            iconUrl: iconMap[locName],
                                            iconSize: [25, 25]  // Adjust size as needed
                                        });
                                    } else {
                                        customIcon = L.divIcon({ className: 'gray-icon' });  // Default icon
                                    }
        
                                    // Add marker to the map
                                    L.marker([locCoords[1], locCoords[0]], { icon: customIcon })
                                        .addTo(this.map)
                                        .bindPopup(locName)  // Popup with location name
                                        .bindTooltip(locName); // Tooltip with location name on hover
                                }
                            }
                        }).addTo(this.map);
                    })
                    .catch(error => console.error('Error loading building GeoJSON:', error));
            }
        }
        
                    redrawMap() {
                        // Clear the existing map layers before redrawing
                        this.map.eachLayer(layer => {
                            if (layer.options && !layer._url) {
                                this.map.removeLayer(layer);
                            }
                        });
        
                        // Redraw path and building
                        this.drawBuilding();
                        this.drawPathWay();
                       
                    }
        
                    switchPosition(coordinate) {
                        return [coordinate[1], coordinate[0]];
                    }
                }
        
                // Initialize the navigator object on window load
                window.onload = function () {
                    // Ensure map container is available
                    if (document.getElementById('map')) {
                        window.stationNavigator = new Navigator();
                    } else {
                        console.error('Map container not found on window load.');
                    }
                };
