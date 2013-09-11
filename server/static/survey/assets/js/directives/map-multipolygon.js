angular.module('askApp')
    .directive('map', function() {
        return {
            template: '<div class="map" style="height: 400px"></div>',
            restrict: 'EA',
            replace: true,
            transclude: true,
            scope: {
                question: "=question" //scope.question.geojson, scope.question.zoom, etc
            },
            link: function(scope, element, attrs) {
                if (scope.question.answer) {

                    //debugger;
                } else {
                    scope.question.answer = [];
                }
                var $el = element[0];

                // Layer init
                var nautical = L.tileLayer.wms("http://egisws02.nos.noaa.gov/ArcGIS/services/RNC/NOAA_RNC/ImageServer/WMSServer", {
                    format: 'img/png',
                    transparent: true,
                    layers: null,
                    attribution: "NOAA Nautical Charts"
                });

                var bing = new L.BingLayer("Av8HukehDaAvlflJLwOefJIyuZsNEtjCOnUB_NtSTCwKYfxzEMrxlKfL1IN7kAJF", {
                    type: "AerialWithLabels"
                });

                // Map init
                var initPoint = new L.LatLng(18.35, -64.85);
                var map = new L.Map($el, {
                    inertia: false
                }).addLayer(bing).setView(initPoint, 11);

                map.attributionControl.setPrefix('');
                map.zoomControl.options.position = 'bottomleft';

                map.on('zoomend', function(e) {
                    //debugger;
                    //console.log('zoom: ' + e.target._zoom);
                    if (e.target._zoom < 10) {
                        $('.leaflet-label').hide();
                    } else {
                        $('.leaflet-label').show();
                        $('.leaflet-label').removeClass('leaflet-label-right');
                    }
                });

                // Layer picker init
                var baseMaps = { "Satellite": bing, "Nautical Charts": nautical };
                var options = { position: 'bottomleft' };
                L.control.layers(baseMaps, null, options).addTo(map);

                var layerClick = function(layer) {
                    var id = layer.feature.properties.ID;
                    if (layer.options.fillOpacity === 0) {                                  
                        layer.setStyle( {
                            fillOpacity: .8
                        });
                        scope.question.answer.push(id);
                    } else {
                        layer.setStyle( {
                            fillOpacity: 0
                        });
                        scope.question.answer = _.without(scope.question.answer, id);
                    }
                    //console.log(scope.question.answer);
                }
                
                var labelLayer = L.tileLayer('/static/survey/data/USVI_Fishing_Grid.mbtiles', {
                    minZoom: 11,
                    maxZoom: 12
                });
                labelLayer.addTo(map);

                var geojsonLayer = L.geoJson(JSON.parse(scope.question.geojson), 
                    {
                        style: function(feature) {
                            return {
                                "color": "#E6D845",
                                "weight": 3,
                                "opacity": 0.6,
                                "fillOpacity": 0.0,
                                "icon": new L.DivIcon({
                                    className: 'label',
                                    iconSize: new L.Point(40, 20),
                                    iconAnchor: new L.Point(20, 20),
                                    popupAnchor: new L.Point(0, -20),
                                    html: '<div class="content-label">'+ feature.properties.ET_ID +'</div>'
                                })
                            };
                        },
                        onEachFeature: function(feature, layer) {
                            if ( _.indexOf( scope.question.answer, layer.feature.properties.ID ) !== -1 ) {
                                layer.setStyle( {
                                    fillOpacity: .8
                                });
                            }
                            layer.on("click", function (e) {
                                layerClick(layer);
                            });

                            // var label = new L.Label( {
                            //     offset: [-20, -15],
                            //     clickable: true,
                            //     opacity: .8
                            // });
                            // label.setContent(layer.feature.properties.ET_ID.toString());
                            // //label.setLatLng(layer.getBounds().getCenter());
                            // //console.log(layer.feature.properties.centroid_y + ', ' + layer.feature.properties.centroid_x);

                            // label.setLatLng(L.latLng(layer.feature.properties.centroid_y, layer.feature.properties.centroid_x));
                            // //label.setLatLng(new L.LatLng(17.5, -65.7)); 
                            // map.showLabel(label);

                            // label.on("click", function (e) {
                            //     layerClick(layer);
                            // });
                        }
                    }
                );

                geojsonLayer.addTo(map);
                $('.leaflet-label').removeClass('leaflet-label-right');

            }
        }
    });