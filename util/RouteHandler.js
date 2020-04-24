import SourceVector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { getCenter } from 'ol/extent';
import Point from 'ol/geom/Point';
import MultiPoint from 'ol/geom/MultiPoint';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import MapStyles from './mapStyles';
import MapUtil from './map';
import api from '~/util/api';
import indrzConfig from '~/util/indrzConfig';

let store = null;
let scope = null;
let translate = null;

const routeGo = async (map, layers, globalRouteInfo, routeType = 0) => {
  let routeUrl = '';
  const { from, to } = globalRouteInfo;

  if (from.properties.space_id && to.properties.space_id) {
    routeUrl = await getDirections(map, layers, from.properties.space_id, to.properties.space_id, '0', 'spaceIdToSpaceId');
  } else if (from.properties.poi_id && to.properties.space_id) {
    routeUrl = await getDirections(map, layers, from.properties.poi_id, to.properties.space_id, '0', 'spaceIdToPoiId');
  } else if (from.properties.poi_id && to.properties.poi_id) {
    // TODO following
    // routeToPoiFromPoi(from.poiid, to.poiid)
  }
  return routeUrl;
};

const clearRouteData = (map) => {
  // $('#RouteDescription').remove()
  const layersToRemove = [
    'RouteToBook',
    'RouteLibraryMarkers',
    'RouteMarkers',
    'RouteFromSearch'
  ];
  layersToRemove.forEach((layerName) => {
    map.getLayers().forEach(function (layer) {
      if (layer && layerName === layer.get('name')) {
        map.removeLayer(layer);
      }
    })
  });
};

const getDirections = async (map, layers, startSearchText, endSearchText, routeType, searchType) => {
  clearRouteData(map);
  const baseApiRoutingUrl = indrzConfig.baseApiUrl + 'directions/';
  let startName = '';
  let endName = '';
  let geoJsonUrl = '';
  let routeUrl = '';

  if (searchType === 'coords') {
    geoJsonUrl = baseApiRoutingUrl + startSearchText + '&' + endSearchText + '&' + routeType + '/?format=json'
  } else if (searchType === 'string') {
    geoJsonUrl = baseApiRoutingUrl + 'startstr=' + startSearchText + '&' + 'endstr=' + endSearchText + '&type=' + routeType + '/?format=json'
  } else if (searchType === 'poiToCoords') {
    geoJsonUrl = baseApiRoutingUrl + 'poi-id=' + startSearchText + '&' + 'xyz=' + endSearchText + '&reversed=' + false + '/?format=json'
  } else if (searchType === 'spaceIdToPoiId') {
    geoJsonUrl = baseApiRoutingUrl + 'space-id=' + startSearchText + '&' + 'poi-id=' + endSearchText + '&type=' + routeType + '/?format=json'
  } else if (searchType === 'spaceIdToSpaceId') {
    geoJsonUrl = baseApiRoutingUrl + 'startid=' + startSearchText + '&' + 'endid=' + endSearchText + '&type=' + routeType + '/?format=json'
  }
  const source = new SourceVector();
  let floorName = '';

  try {
    routeUrl = await api.request({
      url: geoJsonUrl
    }).then(function (response) {
      if (!response) {
        // store.commit('SET_SNACKBAR', 'test message');
        return;
      }
      response = response.data;
      const geojsonFormat = new GeoJSON();
      const features = geojsonFormat.readFeatures(response, { featureProjection: 'EPSG:4326' });
      const routeJson = JSON.stringify(response);
      const routeData = JSON.parse(routeJson);
      source.addFeatures(features);

      addMarkers(map, features, routeData.route_info);

      if (searchType === 'coords') {
        startName = routeData.route_info.start_name
        endName = routeData.route_info.end_name
      } else if (searchType === 'spaceIdToSpaceId') {
        startName = routeData.route_info.start_name;
        endName = routeData.route_info.end_name;
        routeUrl = '/?campus=1&start-spaceid=' + startSearchText + '&end-spaceid=' + endSearchText + '&type=' + routeType

        // TODO:: Show hide things
        /*
        $('#route-from').val(startName)
        $('#route-to').val(endName)
        $('#collapseRouting').collapse('show')
        $('#collapsePoi').collapse('hide')
        $('#collapseCampus').collapse('hide')
        insertRouteDescriptionText(startName, endName, routeData, true)
        */
      }
      if (routeData.route_info.mid_name !== '') {
        insertRouteDescriptionText(startName, endName, routeData, true)
      } else {
        insertRouteDescriptionText(startName, endName, routeData, false)
      }

      if (typeof (features[0]) !== 'undefined') {
        floorName = features[0].getProperties().floor_name;
        if (floorName) {
          MapUtil.activateLayer(indrzConfig.layerNamePrefix + floorName, layers.switchableLayers, map);
        }
      }
      // TODO Following to check later
      /*
      if (library_key !== 'nokey') {
        startFloor = routeLocalData.end.floor
      }
      */

      // center up the route
      const extent = source.getExtent();
      map.getView().fit(extent);
      /*
      var checkName = Number(startName[0]);

      if (checkName > 0) {
        routeUrl = '/?campus=' + building_id + '&start-xyz=' + startName + '&end-xyz=' + endName;

      } else if (typeof checkName !== 'number' && startName !== '' && endName !== '') {
        routeUrl = '/?campus=' + building_id + '&startstr=' + startName + '&endstr=' + endName + '&type=' + routeType;
      }
      */
      return routeUrl;
    })
  } catch ({ response }) {
    if ((response && response.status === 404) || (response.data.error && response.data.error === 'no geometry')) {
      setNoRouteFoundText();
    } else {
      console.log(response.data.error);
    }
  }

  const routeLayer = new VectorLayer({
    // url: geoJsonUrl,
    // format: new ol.format.GeoJSON(),
    source: source,
    style: function (feature, resolution) {
      const featureFloor = feature.getProperties().floor_name;
      if (featureFloor === floorName) {
        feature.setStyle(MapStyles.routeActiveStyle)
      } else {
        feature.setStyle(MapStyles.routeInactiveStyle)
      }
    },
    title: 'RouteFromSearch',
    name: 'RouteFromSearch',
    visible: true,
    layer_id: 20090,
    zIndex: 4
  });

  map.getLayers().push(routeLayer);
  /*
  $('#clearRoute').removeClass('hide')
  $('#shareRoute').removeClass('hide')
  $('#routeText').removeClass('hide')
  // $('#RouteDescription').removeClass('hide');

  window.location.href = '#map'

  $('html,body').animate({
      scrollTop: $('#map').offset().top
    },
    'slow')
    */
  return routeUrl;
};

const addMarkers = (map, routeFeatures, routeInfo) => {
  const markerFeatures = [];
  const lengthList = [];
  const floorList = [];
  let prevFloorNum = -99;
  let index = -1;
  const nFeatures = routeFeatures.length;
  let distance = 0;

  if (nFeatures === 0) {
    return;
  }
  // add middle icons
  for (let i = 0; i < nFeatures; i++) {
    const floorNumber = routeFeatures[i].getProperties().floor;
    if (prevFloorNum !== floorNumber) {
      floorList.push(floorNumber);
      index++;
      prevFloorNum = floorNumber;
      if (!lengthList[index]) {
        lengthList[index] = 0;
      }
    }
    lengthList[index] += routeFeatures[i].getGeometry().getLength()
  }

  index = 0;

  for (let i = 0; i < nFeatures; i++) {
    const floorNumber = routeFeatures[i].getProperties().floor;
    if (floorList[index] === floorNumber) {
      distance += routeFeatures[i].getGeometry().getLength();
    }
    if (floorList[index] === floorNumber && lengthList[index] / 2 < distance) {
      const lineExtent = routeFeatures[i].getGeometry().getExtent();
      const middleCoordinate = getCenter(lineExtent);
      const middlePoint = new Point(routeFeatures[i].getGeometry().getClosestPoint(middleCoordinate));
      const middleFeature = new Feature({
        geometry: middlePoint
      });
      // TODO create icon based on font with circle as background and number in front
      const floorNumberStyle = new Style({
        image: new Icon({
          src: '/media/route_floor_' + floorNumber + '.png'
        })
      });

      middleFeature.setStyle(floorNumberStyle);
      markerFeatures.push(middleFeature);

      index++;
      distance = 0;
    }
  }

  let mid = false;

  if (routeInfo) {
    if (routeInfo.hasOwnProperty('route_markers')) {
      const ll = routeInfo.route_markers;
      // front office marker aka mid route desitnation
      let frontOfficeGeometry = '';
      for (let i = 0; i < ll.length; i++) {
        if ('mid' in ll[i].properties) {
          mid = true;

          if (ll[i].geometry.type === 'MultiPoint') {
            frontOfficeGeometry = new MultiPoint(ll[i].geometry.coordinates)
          } else if (ll[i].geometry.type === 'Point') {
            frontOfficeGeometry = new Point(ll[i].geometry.coordinates)
          }
          const frontOfficeMarker = new Feature({
            geometry: frontOfficeGeometry
          });
          frontOfficeMarker.setStyle([MapStyles.faCircleSolidStyle, MapStyles.faFlagCheckeredStyle]);
          markerFeatures.push(frontOfficeMarker);
        }

        if ('start' in ll[i].properties) {
          let startPoint;

          if (ll[i].geometry.type === 'MultiPoint') {
            startPoint = new MultiPoint(ll[i].geometry.coordinates)
          }
          if (ll[i].geometry.type === 'Point') {
            startPoint = new Point(ll[i].geometry.coordinates)
          }
          const startMarker = new Feature({
            geometry: startPoint
          });
          startMarker.setStyle([MapStyles.faCircleSolidStyle, MapStyles.faFlagCheckeredStyle]);
          markerFeatures.push(startMarker)
        }

        if ('end' in ll[i].properties) {
          let endPoint;
          if (ll[i].geometry.type === 'MultiPoint') {
            endPoint = new MultiPoint(ll[i].geometry.coordinates)
          }
          if (ll[i].geometry.type === 'Point') {
            endPoint = new Point(ll[i].geometry.coordinates)
          }
          const endMarker = new Feature({
            geometry: endPoint
          });

          endMarker.setGeometry(endPoint);
          markerFeatures.push(endMarker);

          if (mid === true) {
            endMarker.setStyle(MapStyles.routeMarkerCStyle)
          } else {
            endMarker.setStyle([MapStyles.faFlagCheckeredStyle])
          }
        }
      }
    } else {
      const startPoint = new Point(routeFeatures[0].getGeometry().getFirstCoordinate());
      const endPoint = new Point(routeFeatures[routeFeatures.length - 1].getGeometry().getLastCoordinate());
      const startMarker = new Feature({
        geometry: startPoint
      });
      const endMarker = new Feature({
        geometry: endPoint
      });
      startMarker.setStyle([MapStyles.faCircleSolidStyle, MapStyles.faFlagCheckeredStyle]);
      endMarker.setGeometry(endPoint);
      endMarker.setStyle([MapStyles.faFlagCheckeredStyle]);
      markerFeatures.push(startMarker);
      markerFeatures.push(endMarker);
    }
  }
  const markerLayer = new VectorLayer({
    source: new SourceVector({
      features: markerFeatures
    }),
    title: 'RouteMarkers',
    name: 'RouteMarkers',
    visible: true,
    layer_id: 20020,
    zIndex: 6
  });
  map.getLayers().push(markerLayer);
};

const routeToPoiFromPoi = (startPoiId, endPoiId) => {
/*
  globalRouteInfo.startPoiId = startPoiId
  globalRouteInfo.endPoiId = endPoiId

  // http://localhost:8000/en/?start-poi-id=1049&end-poi-id=251
  globalRouteInfo.routeUrl = '?start-poi-id=' + startPoiId + '&end-poi-id=' + endPoiId

  geoJsonUrl = baseApiRoutingUrl + 'foo/start-poi-id=' + startPoiId + '&' + 'end-poi-id=' + endPoiId + '?format=json'

  if (routeLayer) {
    map.removeLayer(routeLayer)
    clearRouteDescription()

    //map.getLayers().pop();
  }

  var source = new ol.source.Vector()
  indrzApiCall(geoJsonUrl).then(function (response) {
    //console.log("response", response);
    var geojsonFormat = new ol.format.GeoJSON()
    var features = geojsonFormat.readFeatures(response,
      {featureProjection: 'EPSG:4326'})
    source.addFeatures(features)
    //
    //
    var routeJson = JSON.stringify(response)

    var routeData = JSON.parse(routeJson)

    var routeStartName = routeData.route_info.start_name
    var routeEndName = routeData.route_info.end_name
    var routeMidName = routeData.route_info.mid_name

    globalRouteInfo.startInfo = routeData.route_info.start
    globalRouteInfo.endInfo = routeData.route_info.end

    // startName = startPoiId;
    // endName = endPoiId;

    var startName = globalRouteInfo.startInfo.properties.name
    var endName = globalRouteInfo.endInfo.properties.name

    if (req_locale === 'de') {
      startName = globalRouteInfo.startInfo.properties.name_de
      endName = globalRouteInfo.endInfo.properties.name_de
    }

    globalRouteInfo.startName = startName
    globalRouteInfo.endName = endName

    var route_markers_data = routeData.route_info.route_markers
    temp_route_data.test = routeData.route_info

    if (routeData.route_info.mid_name !== '') {
      insertRouteDescriptionText(globalRouteInfo.startName, globalRouteInfo.endName, routeData, true)
    } else {
      insertRouteDescriptionText(globalRouteInfo.startName, globalRouteInfo.endName, routeData, false)
    }

    addMarkers(features, routeData.route_info)

    var start_floor = 0
    // active the floor of the start point
    if (typeof(features[0]) !== 'undefined') {
      start_floor = features[0].getProperties().floor
    }

    for (var i = 0; i < floor_layers.length; i++) {
      if (start_floor == floor_layers[i].floor_num) {
        activateLayer(i)
      }
    }

    // center up the route
    var extent = source.getExtent()
    map.getView().fit(extent)
  })

  routeLayer = new ol.layer.Vector({
    //url: geoJsonUrl,
    //format: new ol.format.GeoJSON(),
    source: source,
    style: function (feature, resolution) {
      var feature_floor = feature.getProperties().floor
      if (feature_floor == active_floor_num) {
        feature.setStyle(route_active_style)
      } else {
        feature.setStyle(route_inactive_style)
      }
    },
    title: 'RoutePoiToPoi',
    name: 'RoutePoiToPoi',
    visible: true,
    layer_id: 20070,
    zIndex: 4
  })

  map.getLayers().push(routeLayer)

  $('#clearRoute').removeClass('hide')
  $('#shareRoute').removeClass('hide')
  $('#routeText').removeClass('hide')
  $('#collapseRouting').collapse('show')
  $('#collapsePoi').collapse('hide')
  // $("#RouteDescription").removeClass("hide");

  window.location.href = '#map'

  $('html,body').animate({
      scrollTop: $('#map').offset().top
    },
    'slow')
*/
};

const setNoRouteFoundText = () => {
  const text = translate.call(scope, 'no_route_found');
  const descriptionEl = document.getElementById('route-description');
  descriptionEl.innerHTML=`<span style="color: red">${text}</span>`;
};

const insertRouteDescriptionText = (startSearchText, endSearchText, routeData, frontOffice) => {
  // $('#RouteDescription').remove();

  const ulList = '<span class="font-weight-medium list-group">Route Description</span><ul class="list-group">';

  const routeTime = routeData.route_info.walk_time;

  const minutes = Math.floor(routeTime / 60);
  const seconds = routeTime - minutes * 60;
  const mins = 'minutes';
  const secs = 'seconds';
  const walkTimeString = minutes + ' ' + mins + ' ' + Math.floor(seconds) + ' ' + secs;
  const descriptionEl = document.getElementById('route-description');
  let routeInfo = '';

  if (frontOffice) {
    if (routeData.route_info.mid_name !== '') {
      const routeMidPointName = routeData.route_info.mid_name;
      const x = 'Please first visit the ' + routeMidPointName + ' ' + 'front office';
      /*
      if (req_locale === 'de') {
        var x = gettext('Please first visit the ') + 'Front Office von ' + routeMidPointName

      } else {
        var x = gettext('Please first visit the ') + routeMidPointName + ' ' + gettext('front office')
      }
      */
      routeInfo =
        `<li class="list-group-item"><span class="font-weight-medium">Start: </span> ${startSearchText} </li>
        <li class="list-group-item"> ${x} </li>
        <li class="list-group-item"><span class="font-weight-medium">Destination: </span> ${endSearchText} </li>
        <li class="list-group-item"><span class="font-weight-medium">Aprox. distance: </span> ${routeData.route_info.route_length} m</li>
        <li class="list-group-item"><span class="font-weight-medium">Aprox. walk time: </span> ${walkTimeString}</li>`;
    } else if (startSearchText) {
      routeInfo =
        `<li class="list-group-item"><span class="font-weight-medium">Start: </span> ${startSearchText}</li>
         <li class="list-group-item"><span class="font-weight-medium">Destination: </span> ${endSearchText}</li>
         <li class="list-group-item"><span class="font-weight-medium">Aprox. distance: </span>${routeData.route_info.route_length} m</li>'
         <li class="list-group-item"><span class="font-weight-medium">Aprox. walk time: </span> ${walkTimeString}</li>`;
    } else {
      startSearchText = routeData.route_info.start_name
      endSearchText = routeData.route_info.end_name
      routeInfo =
        `<li class="list-group-item"><span class="font-weight-medium">Start: </span> ${startSearchText}</li>
        <li class="list-group-item"><span class="font-weight-medium">Destination: </span> ${endSearchText}</li>
        <li class="list-group-item"><span class="font-weight-medium">Aprox. distance: </span> ${routeData.route_info.route_length} m</li>
        <li class="list-group-item"><span class="font-weight-medium">Aprox. walk time: </span> ${walkTimeString}</li>`;
    }

    descriptionEl.innerHTML = ulList + routeInfo + '</ul>';
  }
};

export default function (_store, _$t, _scope) {
  store = _store;
  translate = _$t;
  scope = _scope;

  return {
    getDirections,
    routeGo,
    routeToPoiFromPoi,
    clearRouteData,
    insertRouteDescriptionText
  }
}
