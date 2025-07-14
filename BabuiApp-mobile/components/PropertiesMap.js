import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const { height } = Dimensions.get('window');

export default function PropertiesMap({ properties, onSelect, selectedPropertyId }) {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Send properties to the map
  useEffect(() => {
    if (webViewRef.current && properties) {
      const message = JSON.stringify({
        type: 'updateProperties',
        properties: properties
      });
      webViewRef.current.postMessage(message);
    }
  }, [properties]);

  // Update selected property
  useEffect(() => {
    if (webViewRef.current && selectedPropertyId !== undefined) {
      const message = JSON.stringify({
        type: 'setSelectedProperty',
        propertyId: selectedPropertyId
      });
      webViewRef.current.postMessage(message);
    }
  }, [selectedPropertyId]);

  // Handle messages from WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'propertySelected' && onSelect) {
        onSelect(data.propertyId);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Handle WebView load
  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  // HTML content for the map
  const mapHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BabuiApp Map</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@8.2.0/ol.css" type="text/css">
        <script src="https://cdn.jsdelivr.net/npm/ol@8.2.0/dist/ol.js"></script>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #map {
                width: 100%;
                height: 100vh;
                position: relative;
            }
            .property-popup {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                padding: 12px;
                max-width: 250px;
                font-size: 14px;
            }
            .property-title {
                font-weight: bold;
                color: #FF9800;
                margin-bottom: 4px;
            }
            .property-price {
                color: #4CAF50;
                font-weight: bold;
                margin-bottom: 4px;
            }
            .property-location {
                color: #757575;
                font-size: 12px;
            }
            .map-controls {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 1000;
            }
            .control-btn {
                background: white;
                border: none;
                border-radius: 4px;
                padding: 8px;
                margin: 2px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                cursor: pointer;
            }
            .control-btn:hover {
                background: #f5f5f5;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div class="map-controls">
            <button class="control-btn" onclick="resetView()">🏠</button>
            <button class="control-btn" onclick="toggleFullscreen()">⛶</button>
        </div>

        <script>
            let map;
            let properties = [];
            let selectedPropertyId = null;
            let popup = null;
            let vectorSource;
            let vectorLayer;

            // Initialize map
            function initMap() {
                // Create vector source for properties
                vectorSource = new ol.source.Vector();
                
                // Create vector layer
                vectorLayer = new ol.layer.Vector({
                    source: vectorSource,
                    style: function(feature) {
                        const isSelected = feature.get('id') === selectedPropertyId;
                        return new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: isSelected ? 12 : 8,
                                fill: new ol.style.Fill({
                                    color: isSelected ? '#FF9800' : '#4CAF50'
                                }),
                                stroke: new ol.style.Stroke({
                                    color: 'white',
                                    width: 2
                                })
                            })
                        });
                    }
                });

                // Create map
                map = new ol.Map({
                    target: 'map',
                    layers: [
                        new ol.layer.Tile({
                            source: new ol.source.OSM()
                        }),
                        vectorLayer
                    ],
                    view: new ol.View({
                        center: ol.proj.fromLonLat([90.3563, 23.685]), // Bangladesh center
                        zoom: 8
                    }),
                    controls: ol.control.defaults().extend([
                        new ol.control.ScaleLine(),
                        new ol.control.ZoomSlider()
                    ])
                });

                // Add click handler
                map.on('click', function(evt) {
                    const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                        return feature;
                    });
                    
                    if (feature) {
                        const property = feature.get('property');
                        showPropertyPopup(property, evt.coordinate);
                        
                        // Send message to React Native
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'propertySelected',
                                propertyId: property.id
                            }));
                        }
                    } else {
                        hidePropertyPopup();
                    }
                });

                // Add hover effect
                map.on('pointermove', function(evt) {
                    const pixel = map.getEventPixel(evt.originalEvent);
                    const hit = map.hasFeatureAtPixel(pixel);
                    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
                });
            }

            // Update properties on the map
            function updateProperties(newProperties) {
                properties = newProperties || [];
                vectorSource.clear();
                
                properties.forEach(property => {
                    if (property.location && property.location.coordinates) {
                        const feature = new ol.Feature({
                            geometry: new ol.geom.Point(
                                ol.proj.fromLonLat([
                                    property.location.coordinates.lng || 90.3563,
                                    property.location.coordinates.lat || 23.685
                                ])
                            ),
                            id: property.id,
                            property: property
                        });
                        vectorSource.addFeature(feature);
                    }
                });
            }

            // Show property popup
            function showPropertyPopup(property, coordinate) {
                if (popup) {
                    map.getOverlays().remove(popup);
                }
                
                const content = \`
                    <div class="property-popup">
                        <div class="property-title">\${property.title || 'Property'}</div>
                        <div class="property-price">৳\${property.price ? property.price.toLocaleString() : '0'}</div>
                        <div class="property-location">\${property.location?.area || 'Location'}, \${property.location?.city || 'City'}</div>
                    </div>
                \`;
                
                const element = document.createElement('div');
                element.innerHTML = content;
                
                popup = new ol.Overlay({
                    element: element,
                    positioning: 'bottom-center',
                    stopEvent: false,
                    offset: [0, -10]
                });
                
                popup.setPosition(coordinate);
                map.addOverlay(popup);
            }

            // Hide property popup
            function hidePropertyPopup() {
                if (popup) {
                    map.getOverlays().remove(popup);
                    popup = null;
                }
            }

            // Reset view to Bangladesh
            function resetView() {
                map.getView().animate({
                    center: ol.proj.fromLonLat([90.3563, 23.685]),
                    zoom: 8,
                    duration: 1000
                });
            }

            // Toggle fullscreen
            function toggleFullscreen() {
                const mapElement = document.getElementById('map');
                if (!document.fullscreenElement) {
                    mapElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }

            // Set selected property
            function setSelectedProperty(propertyId) {
                selectedPropertyId = propertyId;
                vectorLayer.changed(); // Trigger style update
            }

            // Handle messages from React Native
            function handleMessage(message) {
                try {
                    const data = JSON.parse(message);
                    switch (data.type) {
                        case 'updateProperties':
                            updateProperties(data.properties);
                            break;
                        case 'setSelectedProperty':
                            setSelectedProperty(data.propertyId);
                            break;
                        case 'resetView':
                            resetView();
                            break;
                    }
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            }

            // Initialize map when page loads
            window.addEventListener('load', function() {
                initMap();
                
                // Listen for messages from React Native
                window.addEventListener('message', function(event) {
                    handleMessage(event.data);
                });
            });

            // Expose functions to React Native
            window.mapFunctions = {
                updateProperties,
                setSelectedProperty,
                resetView
            };
        </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9800" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: height * 0.5,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    zIndex: 1,
  },
}); 