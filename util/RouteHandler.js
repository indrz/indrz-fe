import SourceVector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import api from '~/util/api';
import indrzConfig from '~/util/indrzConfig';

const routeGo = (map, globalRouteInfo, routeType = 0) => {
  let routeUrl = '';
  const { from, to } = globalRouteInfo;
  if (from.properties.spaceid && to.properties.spaceid) {
    routeUrl = getDirections(map, from.properties.spaceid, to.properties.spaceid, '0', 'spaceIdToSpaceId');
  } else if (from.properties.poiid && to.properties.spaceid) {
    routeUrl = getDirections(map, from.properties.poiid, to.properties.spaceid, '0', 'spaceIdToPoiId');
  } else if (from.properties.poiid && to.properties.poiid) {
    // TODO following
    // routeToPoiFromPoi(from.poiid, to.poiid)
  }
  return routeUrl;
};

const getDirections = (map, startSearchText, endSearchText, routeType, searchType) => {
  // TODO: Clear the route first
  // clearRouteData()
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

  api.request({
    url: geoJsonUrl
  }).then(function (response) {
    response = response.data;
    const geojsonFormat = new GeoJSON();
    const features = geojsonFormat.readFeatures(response, { featureProjection: 'EPSG:4326' });
    const routeJson = JSON.stringify(response);
    const routeData = JSON.parse(routeJson);
    source.addFeatures(features);

    if (routeData.route_info.mid_name !== '') {
      // TODO following
      // insertRouteDescriptionText(globalRouteInfo.startName, globalRouteInfo.endName, routeData, true)
    } else {
      // TODO following
      // insertRouteDescriptionText(globalRouteInfo.startName, globalRouteInfo.endName, routeData, false)
    }
    // TODO following
    // addMarkers(features, routeData.route_info)

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

    let startFloor = 0;
    if (typeof (features[0]) !== 'undefined') {
      startFloor = features[0].getProperties().floor;
      // activate it
    }
    console.log(startName);
    console.log(endName);
    console.log(startFloor);
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

  const routeLayer = new VectorLayer({
    // url: geoJsonUrl,
    // format: new ol.format.GeoJSON(),
    source: source,
    style: function (feature, resolution) {
      // TODO: fix following later
      /*
      var featureFloor = feature.getProperties().floor;
      if (featureFloor == active_floor_num) {
        feature.setStyle(route_active_style)
      } else {
        feature.setStyle(route_inactive_style)
      }
      */
    },
    title: 'RouteFromSearch',
    name: 'RouteFromSearch',
    visible: true,
    layer_id: 20090,
    zIndex: 4
  });

  map.getLayers().push(routeLayer)
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
};

export default {
  getDirections,
  routeGo
}
