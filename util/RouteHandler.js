import SourceVector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { getCenter } from 'ol/extent';
import Point from 'ol/geom/Point';
import MultiPoint from 'ol/geom/MultiPoint';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Circle, Text, Fill } from 'ol/style';
import MapStyles from './mapStyles';
import MapUtil from './map';
import api from '~/util/api';
import config from '~/util/indrzConfig';

const { env } = config;

// let store = null;
let scope = null;
let translate = null;

const routeGo = async (mapInfo, layers, globalRouteInfo, routeType = 0, env) => {
  let routeUrl = '';
  const { from, to } = globalRouteInfo;

  if (from.properties.space_id && to.properties.space_id && !to.properties.poiId) {
    routeUrl = await getDirections(
      mapInfo,
      layers,
      from.properties.space_id,
      from.properties.floor_num,
      to.properties.space_id,
      to.properties.floor_num,
      '0',
      'spaceIdToSpaceId',
      to.properties.frontoffice?.space_id,
      env.locale
    );
  } else if (from.properties.poiId && to.properties.poiId) {
    routeUrl = await getDirections(
      mapInfo,
      layers,
      from.properties.poiId,
      from.properties.floor_num,
      to.properties.poiId,
      to.properties.floor_num,
      '0',
      'poiIdToPoiId',
      null,
      env.locale
    );
  } else if (
    (from.properties.poiId && to.properties.space_id) ||
    (from.properties.space_id && to.properties.poiId)
  ) {
    routeUrl = await getDirections(
      mapInfo,
      layers,
      (from.properties.space_id || to.properties.space_id),
      from.properties.floor_num,
      (from.properties.poiId || to.properties.poiId),
      to.properties.floor_num,
      '0',
      'spaceIdToPoiId',
      null,
      env.locale
    );
  } else if (
    (from.properties.coords && to.properties.poiId) ||
    (from.properties.poiId && to.properties.coords)
  ) {
    routeUrl = await getDirections(
      mapInfo,
      layers,
      (from.properties.poiId || to.properties.poiId),
      null,
      (from.properties.coords || to.properties.coords),
      (from.properties.coords ? from.properties.floor_num : to.properties.floor_num),
      '0',
      'poiToCoords',
      null,
      env.locale
    );
  } else if (from.properties.coords && to.properties.coords) {
    routeUrl = await getDirections(
      mapInfo,
      layers,
      from.properties.coords,
      from.properties.floor_num,
      to.properties.coords,
      to.properties.floor_num,
      '0',
      'coords',
      null,
      env.locale
    );
  }
  return routeUrl;
};

const clearRouteData = (map, includeAllLayers = false) => {
  const optionalLayers = [
    'RouteFromPoiToPoi'
  ];
  const defaultLayers = [
    'RouteToBook',
    'RouteLibraryMarkers',
    'RouteMarkers',
    'RouteFromSearch'
  ];
  const layerNamesToRemove = includeAllLayers ? defaultLayers.concat(optionalLayers) : defaultLayers;

  const layersToRemove = [];

  map.getLayers().forEach(function (layer) {
    if (layerNamesToRemove.includes(layer.get('name'))) {
      layersToRemove.push(layer);
    }
  });

  layersToRemove.forEach((layer) => {
    map.removeLayer(layer);
  });
};

const getNearestEntrance = async (globalPopupInfo) => {
  const url = `${env.BASE_API_URL}directions/near/coords=${globalPopupInfo.coords.join(',')}&floor=${globalPopupInfo.floor_num}&poiCatId=${env.NEAREST_ENTRANCE_POIID}/?format=json`;

  try {
    return await api.request({
      url
    }).then(function (response) {
      return Object.assign({ ...response.data, poiId: response.data.id });
    });
  } catch (err) {
    console.log(err);
  }
};

const getNearestMetro = async (globalPopupInfo) => {
  const url = `${env.BASE_API_URL}directions/near/coords=${globalPopupInfo.coords.join(',')}&floor=${globalPopupInfo.floor_num}&poiCatId=${env.NEAREST_METRO_POIID}/?format=json`;

  try {
    return await api.request({
      url
    }).then(function (response) {
      return Object.assign({ ...response.data, poiId: response.data.id });
    });
  } catch (err) {
    console.log(err);
  }
};

const getNearestDefi = async (globalPopupInfo) => {
  const url = `${env.BASE_API_URL}directions/near/coords=${globalPopupInfo.coords.join(',')}&floor=${globalPopupInfo.floor_num}&poiCatId=${env.NEAREST_DEFI_POIID}/?format=json`;

  try {
    return await api.request({
      url
    }).then(function (response) {
      return Object.assign({ ...response.data, poiId: response.data.id });
    });
  } catch (err) {
    console.log(err);
  }
};

const getDirections = async (mapInfo, layers, startSearchText, startFloor, endSearchText, endFloor, routeType, searchType, foid, locale) => {
  const map = mapInfo.map;
  clearRouteData(map);
  const baseApiRoutingUrl = env.BASE_API_URL + 'directions/';
  let startName = '';
  let endName = '';
  let geoJsonUrl = '';
  let routeUrl = '';

  switch (searchType) {
    case 'coords':
      geoJsonUrl = `${baseApiRoutingUrl}${startSearchText.join(',')},${startFloor}&${endSearchText.join(',')},${endFloor}&${routeType}&reversed=false`;
      break;
    case 'string':
      geoJsonUrl = baseApiRoutingUrl + 'startstr=' + startSearchText + '&' + 'endstr=' + endSearchText + '&type=' + routeType;
      break;
    case 'poiToCoords':
      geoJsonUrl = baseApiRoutingUrl + 'poi-id=' + startSearchText + '&' + 'xyz=' + endSearchText + '&floor=' + endFloor + '&reversed=' + false;
      break;
    case 'spaceIdToPoiId':
      geoJsonUrl = baseApiRoutingUrl + 'space-id=' + startSearchText + '&' + 'poi-id=' + endSearchText + '&type=' + routeType;
      break;
    case 'spaceIdToSpaceId':
      geoJsonUrl = baseApiRoutingUrl + 'startid=' + startSearchText + '&' + 'endid=' + endSearchText + '&type=' + routeType;
      if (foid) {
        geoJsonUrl += '&foid=' + foid;
      }
      break;
    case 'poiIdToPoiId':
      geoJsonUrl = baseApiRoutingUrl + 'start-poi-id=' + startSearchText + '&' + 'end-poi-id=' + endSearchText;
      break;
    default:
      break;
  }

  const source = new SourceVector();
  let floorName = '';
  let floorNum = '';

  try {
    return await api.request({
      url: geoJsonUrl
    }, env).then(function (response) {
      if (!response) {
        // store.commit('SET_SNACKBAR', 'test message');
        return;
      }
      response = response.data;
      const geojsonFormat = new GeoJSON();
      const features = geojsonFormat.readFeatures(response, { featureProjection: 'EPSG:4326' });
      const routeJson = JSON.stringify(response);
      const routeData = JSON.parse(routeJson);
      const { route_info: routeInfo } = routeData;
      source.addFeatures(features);

      addMarkers(map, features, routeInfo);

      const frontOffice = mapInfo.globalRouteInfo.to.properties.frontoffice;

      if (frontOffice) {
        routeData.frontOffice = frontOffice;
      }

      if (routeInfo) {
        const { start, end } = routeInfo;

        startName = start ? start.properties['name_' + locale] : routeInfo.start_name;
        endName = start ? end.properties['name_' + locale] : routeInfo.end_name;

        if (searchType === 'coords') {
          routeUrl = `?start-xy=${startSearchText.join(',')},${startFloor}&end-xy=${endSearchText.join(',')},${endFloor}`;
        } else if (searchType === 'poiToCoords') {
          routeUrl = '?start-poi-id=' + routeInfo.start.id + `&end-xy=${endSearchText.join(',')},${endFloor}`;
        } else if (searchType === 'poiIdToPoiId') {
          routeUrl = '?start-poi-id=' + routeInfo.start.id + '&end-poi-id=' + routeInfo.end.id;
        } else if (searchType === 'spaceIdToPoiId') {
          routeUrl = '?start-spaceid=' + startSearchText + '&end-poi-id=' + endSearchText;
        } else if (searchType === 'spaceIdToSpaceId') {
          routeUrl = '?start-spaceid=' + startSearchText + '&end-spaceid=' + endSearchText + '&type=' + routeType;
          if (foid) {
            routeUrl += '&foid=' + foid;
          }
        }

        insertRouteDescriptionText(startName, endName, routeData);
        if (startName && endName) {
          mapInfo.$root.$emit('updateRouteFields', {
            fromData: {
              name: startName
            },
            toData: {
              name: endName
            }
          });
        }
      }

      if (typeof (features[0]) !== 'undefined') {
        floorNum = features[0].getProperties().floor;
        floorName = mapInfo.getFloorName({ floor_num: floorNum });

        if (floorName) {
          mapInfo.$emit('selectFloor', features[0].getProperties().floor);
          MapUtil.activateLayer(env.LAYER_NAME_PREFIX + floorName, layers.switchableLayers, map);
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
    });
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
      const featureFloor = Number(feature.getProperties().floor).toFixed(1);
      if (featureFloor === Number(floorNum).toFixed(1)) {
        feature.setStyle(MapStyles.routeActiveStyle);
      } else {
        feature.setStyle(MapStyles.routeInactiveStyle);
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
  const fontColor = '#158afc';
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
    lengthList[index] += routeFeatures[i].getGeometry().getLength();
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

      const floorNumberStyle = new Style({
        image: new Circle({
          radius: 12,
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.8)'
          }),
          stroke: new Stroke({
            color: 'rgb(21,138,252, 0.8)',
            width: 3
          })
        }),
        text: new Text({
          font: '18px sans-serif',
          text: floorNumber.toString(),
          fill: new Fill({
            color: fontColor
          }),
          stroke: new Stroke({
            color: fontColor,
            width: 1
          })
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
            frontOfficeGeometry = new MultiPoint(ll[i].geometry.coordinates);
          } else if (ll[i].geometry.type === 'Point') {
            frontOfficeGeometry = new Point(ll[i].geometry.coordinates);
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
            startPoint = new MultiPoint(ll[i].geometry.coordinates);
          }
          if (ll[i].geometry.type === 'Point') {
            startPoint = new Point(ll[i].geometry.coordinates);
          }
          const startMarker = new Feature({
            geometry: startPoint
          });
          startMarker.setStyle([MapStyles.faCircleSolidStyle]);
          markerFeatures.push(startMarker);
        }

        if ('end' in ll[i].properties) {
          let endPoint;
          if (ll[i].geometry.type === 'MultiPoint') {
            endPoint = new MultiPoint(ll[i].geometry.coordinates);
          }
          if (ll[i].geometry.type === 'Point') {
            endPoint = new Point(ll[i].geometry.coordinates);
          }
          const endMarker = new Feature({
            geometry: endPoint
          });

          endMarker.setGeometry(endPoint);
          markerFeatures.push(endMarker);

          if (mid === true) {
            endMarker.setStyle(MapStyles.routeMarkerCStyle);
          } else {
            endMarker.setStyle([MapStyles.faFlagCheckeredStyle]);
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
  descriptionEl.innerHTML = `<span style="color: red">${text}</span>`;
};

const insertRouteDescriptionText = (startSearchText, endSearchText, routeData) => {
  const ulList = '<span class="font-weight-medium list-group">Route Description</span><ul class="list-group">';
  const routeTime = routeData.route_info.walk_time;
  const minutes = Math.floor(routeTime / 60);
  const seconds = routeTime - minutes * 60;
  const mins = 'minutes';
  const secs = 'seconds';
  const walkTimeString = minutes + ' ' + mins + ' ' + Math.floor(seconds) + ' ' + secs;
  const descriptionEl = document.getElementById('route-description');
  let routeInfo = '';
  let frontOfficeTemplate = '';

  if (routeData.frontOffice) {
    const { name, room_code: roomCode } = routeData.frontOffice;
    frontOfficeTemplate = `Please first visit the ${name}, ${roomCode} front office`;
  } else if (!startSearchText) {
    startSearchText = routeData.route_info.start_name;
    endSearchText = routeData.route_info.end_name;
  }
  routeInfo = `
  ${MapUtil.getRouteDescriptionListItem('Start', startSearchText)}
  ${MapUtil.getRouteDescriptionListItem('', frontOfficeTemplate)}
  ${MapUtil.getRouteDescriptionListItem('Destination', endSearchText)}
  ${MapUtil.getRouteDescriptionListItem('Aprox. distance', routeData.route_info.route_length ? routeData.route_info.route_length + ' m' : '')}
  ${MapUtil.getRouteDescriptionListItem('Aprox. walk time', walkTimeString)}`;

  descriptionEl.innerHTML = ulList + routeInfo + '</ul>';
};

export default function (_store, _$t, _scope) {
  translate = _$t;
  scope = _scope;

  return {
    getDirections,
    getNearestEntrance,
    getNearestMetro,
    getNearestDefi,
    routeGo,
    routeToPoiFromPoi,
    clearRouteData,
    insertRouteDescriptionText
  };
}
