import { Zoom, Attribution, ScaleLine } from 'ol/control.js';
import Group from 'ol/layer/Group';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import { get as getProjection } from 'ol/proj.js';
import TileLayer from 'ol/layer/Tile.js';
import WMTS from 'ol/source/WMTS.js';
import TileGrid from 'ol/tilegrid/WMTS';
import SourceVector from 'ol/source/Vector';
import LayerVector from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';
import Fill from 'ol/style/Fill';
import Circle from 'ol/style/Circle';
import { getCenter } from 'ol/extent';
import View from 'ol/View';
import Map from 'ol/Map';
import { defaults as defaultInteraction } from 'ol/interaction';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import PinchZoom from 'ol/interaction/PinchZoom';
import Overlay from 'ol/Overlay';
import MapStyles from './mapStyles';
import MapHandler from './mapHandler';
import api from './api';
import indrzConfig from '~/util/indrzConfig'
import POIHandler from '~/util/POIHandler';

const initializeMap = (mapId) => {
  const view = new View({
    center: getStartCenter(),
    zoom: 15,
    maxZoom: 23
  });

  const layers = getLayers();

  const map = new Map({
    interactions: defaultInteraction().extend([
      new DragRotateAndZoom(),
      new PinchZoom({
        constrainResolution: true
      })
    ]),
    target: mapId,
    controls: getMapControls(),
    view,
    layers: layers.layerGroups
  });

  const popup = new Overlay({
    element: document.getElementById('indrz-popup'),
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    },
    zIndex: 5,
    name: 'indrzPopup'
  });

  map.addOverlay(popup);

  return {
    view, map, layers, popup
  };
};

const createWmsLayer = function (
  layerName,
  geoserverLayer,
  floorNumber,
  isVisible,
  zIndexValue
) {
  return new ImageLayer({
    source: new ImageWMS({
      url: indrzConfig.baseWmsUrl,
      params: { LAYERS: geoserverLayer, TILED: true },
      serverType: 'geoserver',
      crossOrigin: ''
    }),
    visible: isVisible,
    name: layerName,
    floorNumber: floorNumber,
    floorName: layerName.split(indrzConfig.layerNamePrefix)[1],
    type: 'floor',
    zIndex: zIndexValue,
    crossOrigin: 'anonymous'
  });
};

const createWmtsLayer = function (layerSrcName, type, isVisible, sourceName) {
  const sm = getProjection('EPSG:3857');
  const templatepng =
    '{Layer}/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}' +
    type;
  const urlsbmappng = [
    'https://maps1.wien.gv.at/basemap/' + templatepng,
    'https://maps2.wien.gv.at/basemap/' + templatepng,
    'https://maps3.wien.gv.at/basemap/' + templatepng,
    'https://maps4.wien.gv.at/basemap/' + templatepng
  ];
  const tilegrid = new TileGrid({
    origin: [-20037508.3428, 20037508.3428],
    extent: [977650, 5838030, 1913530, 6281290],
    resolutions: [
      156543.03392811998,
      78271.51696419998,
      39135.758481959994,
      19567.879241008,
      9783.939620504,
      4891.969810252,
      2445.984905126,
      1222.9924525644,
      611.4962262807999,
      305.74811314039994,
      152.87405657047998,
      76.43702828523999,
      38.21851414248,
      19.109257071295996,
      9.554628535647998,
      4.777314267823999,
      2.3886571339119995,
      1.1943285669559998,
      0.5971642834779999,
      0.29858214174039993,
      0.14929107086936
    ],
    matrixIds: [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20'
    ]
  });

  const WmtsTileSource = new WMTS({
    tilePixelRatio: 1,
    projection: sm,
    layer: layerSrcName,
    style: 'normal',
    matrixSet: 'google3857',
    urls: urlsbmappng,
    crossOrigin: 'anonymous',
    requestEncoding: /** @type {ol.source.WMTSRequestEncoding} */ ('REST'),
    tileGrid: tilegrid,
    attributions:
      '© <a href="https://www.basemap.at/' + '">Basemap.at       </a>'
  });

  const wmtsLayer = new TileLayer({
    name: layerSrcName,
    source: WmtsTileSource,
    minResolution: 0.298582141738,
    visible: isVisible,
    type: 'background'
  });
  return wmtsLayer;
}

const hideLayers = (layers) => {
  layers.forEach(layer => layer.setVisible(false));
};

const setLayerVisible = (layerName, switchableLayers, map) => {
  if (switchableLayers.length > 0) {
    const foundLayer = switchableLayers
      .find((layer) => {
        const layerProperties = layer.getProperties();
        return (layerProperties.name || layerProperties.floorName).toLowerCase() === layerName.toLowerCase();
      });
    if (foundLayer) {
      foundLayer.setVisible(true);
      map.getLayers().forEach((layer) => {
        if (layer.get('name') === 'RouteFromSearch') {
          const currentFloorName = foundLayer.getProperties().floorName;

          layer.getSource().getFeatures().forEach((feature) => {
            if (feature.getProperties().floor_name === currentFloorName) {
              feature.setStyle(MapStyles.routeActiveStyle);
            } else {
              feature.setStyle(MapStyles.routeInactiveStyle);
            }
          });
        }
      })
    }
  }
};

const activateFloor = (feature, layers, map) => {
  const floorName = feature ? feature.getProperties().floorName : '';
  const layerToActive = layers.switchableLayers.find(layer => layer.getProperties().floorName === floorName);
  if (layerToActive) {
    activateLayer(layerToActive.getProperties().name, layers.switchableLayers, map);
  }
};
const generateResultLinks = (att, searchString, featureCenter, className, floor, fid, poiIcon) => {
  fid = fid || 0;
  poiIcon = poiIcon || 0;
  let poiIconHtml = '';
  let elId = '';
  let htmlInsert = '';

  const poiId = fid;
  if (fid === 0) {
    elId = 'searchResListItem_' + att
  } else {
    elId = 'searchResListItem_' + att + '-' + poiId;
    poiIconHtml = '<img src="' + poiIcon + '" alt="POI" style="height: 25px; padding-right:5px;">';
  }

  htmlInsert = '<a href="#" onclick="showRes(' + searchString + ',' + featureCenter + ',' + poiId + ')" id="' + elId +
    '" class="list-group-item indrz-search-res" >' + className + ' <span class="badge">' + 'Floor ' + floor + '</span> </a>';

  if (poiIcon !== '') {
    htmlInsert = '<a href="#" onclick="showRes(' + searchString + ',' + featureCenter + ',' + poiId + ')" id="' + elId + '" class="list-group-item indrz-search-res" >  ' + poiIconHtml + className + ' <span class="badge">' + 'Floor ' + floor + '</span> </a>';
  }
  return htmlInsert;
};

const clearSearchResults = (map, searchLayer) => {
  /*
  search_text = "";
  if (searchLayer) {
    map.removeLayer(searchLayer);
  }
  closeIndrzPopup();
  $("#search-results-list").empty();
  $("#search-res").addClass("hide");
  $("#clearSearch").addClass("hide");
  $("#shareSearch").addClass("hide");
  $("#search-input").val('');
  $("#search-input-kiosk").val('');
  $("#searchTools").hide(); // hide div tag

  fixContentHeight();
  */
};

const image = new Icon(/** @type {olx.style.IconOptions} */ ({
  anchor: [0.5, 46],
  anchorXUnits: 'fraction',
  anchorYUnits: 'pixels',
  src: '/static/homepage/img/other.png'
}));
const styles = {
  'Point': [new Style({
    image: image
  })],
  'LineString': [new Style({
    stroke: new Stroke({
      color: '#68ff5b',
      width: 1
    })
  })],
  'MultiLineString': [new Style({
    stroke: new Stroke({
      color: '#68ff5b',
      width: 1
    })
  })],
  'MultiPoint': [new Style({
    image: image
  })],
  'MultiPolygon': [new Style({
    stroke: new Stroke({
      color: '#4ff0ff',
      width: 3
    }),
    fill: new Fill({
      color: 'rgba(38, 215, 255, 0.4)'
    })
  })],
  'Polygon': [new Style({
    stroke: new Stroke({
      color: '#4ff0ff',
      width: 3
    }),
    fill: new Fill({
      color: 'rgba(38, 215, 255, 0.4)'
    })
  })],
  'GeometryCollection': [new Style({
    stroke: new Stroke({
      color: 'magenta',
      width: 2
    }),
    fill: new Fill({
      color: 'magenta'
    }),
    image: new Circle({
      radius: 10,
      fill: null,
      stroke: new Stroke({
        color: 'magenta'
      })
    })
  })],
  'Circle': [new Style({
    stroke: new Stroke({
      color: 'red',
      width: 2
    }),
    fill: new Fill({
      color: 'rgba(255,0,0,0.2)'
    })
  })]
};

const styleFunction = (feature, resolution) => {
  const fType = feature.getGeometry().getType();
  if (fType === 'MultiPolygon') {
    return styles[feature.getGeometry().getType()];
  } else if (fType === 'MultiPoint') {
    const poiImage = new Icon(/** @type {olx.style.IconOptions} */ ({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: feature.get('icon'),
      opacity: 1
    }));
    const stylesPoi = new Style({
      image: poiImage
    });
    return stylesPoi;
  }
};

const searchThroughAPI = async (searchText) => {
  const searchUrl = `${indrzConfig.searchUrl}/${searchText}`;
  const response = await api.request({
    url: searchUrl
  });
  return response.data;
};

const searchIndrz = async (map, layers, globalPopupInfo, searchLayer, campusId, searchString, zoomLevel,
  popUpHomePage, currentPOIID,
  currentLocale, objCenterCoords, routeToValTemp,
  routeFromValTemp, activeFloorName, popup, feature) => {
  if (searchLayer) {
    map.removeLayer(searchLayer);
    clearSearchResults(map, searchLayer);
  }
  const searchSource = new SourceVector();
  const searchResult = [];
  let response = {};
  if (!feature) {
    response = await searchThroughAPI(searchString);
  } else {
    response = feature;
  }

  const geojsonFormat3 = new GeoJSON();
  const featuresSearch = geojsonFormat3.readFeatures(response, { featureProjection: 'EPSG:4326' });
  searchSource.addFeatures(featuresSearch);

  searchSource.forEachFeature(function (feature) {
    const requestedLocale = 'en';
    const featureName = feature.get('name');
    const featureExtent = feature.getGeometry().getExtent();
    const featureCenter = getCenter(featureExtent);
    let att = searchString;
    if (searchString === featureName) {
      att = searchString;
    } else {
      att = featureName;
    }
    const fullName = att;
    const featureNameGet = 'category_' + requestedLocale;
    const floor = feature.get('floor_name') ? feature.get('floor_name').toLowerCase() : '';
    const roomCat = feature.get(featureNameGet);
    const roomCode = feature.get('roomcode');
    let someThing = '';

    if (att !== roomCode) {
      someThing = ' (' + roomCode + ')'
    } else {
      someThing = ''
    }
    let featureId = '';
    let poiIconPath = '';

    if (feature.getProperties().hasOwnProperty('poi_id')) {
      featureId = feature.get('poi_id');
      poiIconPath = feature.get('icon');
      globalPopupInfo.poiId = feature.get('poi_id');
      globalPopupInfo.src = feature.get('src')
    } else {
      globalPopupInfo.poiId = 'noid';
      globalPopupInfo.src = feature.get('src')
    }
    const attributeInfo = '"' + att + '"';

    if (roomCat !== '' && typeof roomCat !== 'undefined') {
      const resultListName = fullName + ' (' + roomCat + ')';
      searchResult.push(generateResultLinks(att, attributeInfo, featureCenter, resultListName, floor, featureId, poiIconPath));
    } else if (roomCode !== '' && typeof roomCode !== 'undefined') {
      const className = fullName + someThing;
      searchResult.push(generateResultLinks(att, attributeInfo, featureCenter, className, floor, featureId, poiIconPath));
    } else {
      const className = fullName;
      searchResult.push(generateResultLinks(att, attributeInfo, featureCenter, className, floor, featureId, poiIconPath));
    }
    // console.log(htmlInsert);
    // todo: handle such jquery things
    // $('#search-results-list').append(htmlInsert);
  });

  const centerCoOrd = getCenter(searchSource.getExtent());
  let layerToActive = '';
  let floorName = '';

  if (featuresSearch.length === 1) {
    MapHandler.openIndrzPopup(
      globalPopupInfo, popUpHomePage, currentPOIID,
      currentLocale, objCenterCoords, routeToValTemp,
      routeFromValTemp, activeFloorName, popup,
      featuresSearch[0].getProperties(), centerCoOrd, featuresSearch[0]
    );
    zoomer(map.getView(), centerCoOrd, zoomLevel);
    /*
     // the following code may need later use for space
      space_id = response.features[0].properties.space_id;
      poi_id = response.features[0].properties.poi_id;
      search_text = searchString;
     */
    // active the floor of the start point
    floorName = featuresSearch[0].getProperties().floor_name ? featuresSearch[0].getProperties().floor_name.toLowerCase() : '';
    layerToActive = layers.switchableLayers.find(layer => layer.getProperties().floorName === floorName);

    activateFloor(layerToActive, layers, map);
  } else if (featuresSearch.length === 0) {
    const htmlInsert = `<p href='#' class='list - group - item indrz - search - res'> Sorry nothing found</p>`;
    console.log(htmlInsert);
    // todo: handle such jquery things
    // $('#search-results-list').append(htmlInsert);
  } else {
    const resExtent = searchSource.getExtent();
    map.getView().fit(resExtent);
    map.getView().setZoom(zoomLevel);
  }
  // fixContentHeight();

  searchLayer = new LayerVector({
    source: searchSource,
    style: styleFunction,
    title: 'SearchLayer',
    name: 'SearchLayer',
    zIndex: 999
  });
  map.getLayers().push(searchLayer);
  window.location.href = '#map';

  /*
  $('html,body').animate({
    scrollTop: $('#map').offset().top
  }, 'slow');

  $('#search-res').removeClass('hide');
  $('#clearSearch').removeClass('hide');
  $('#shareSearch').removeClass('hide');
  $('#searchTools').toggle(true); // show div tag
  */
  return {
    searchLayer,
    floorName,
    searchResult
  };
};

const zoomer = (view, coord, zoomLevel) => {
  view.animate({
    center: coord,
    duration: 2000,
    zoom: zoomLevel
  });
};

const activateLayer = (layerName, switchableLayers, map) => {
  hideLayers(switchableLayers);
  setLayerVisible(layerName, switchableLayers, map);
  POIHandler.setPoiFeatureVisibility(map, layerName);
  // if (typeof update_url == undefined) {
  // safe to use the function
  // do we need to use that
  // update_url('map');
  // } else {
  // }
};

const getMapSize = (map) => {
  const mapWidthPixels = map.getSize()[0];
  const mapHeightPixels = map.getSize()[1];
  const floors = mapWidthPixels / 200;
  const newWidth = mapWidthPixels / floors;
  const newHeight = mapHeightPixels / floors;

  return {
    'width_px': mapWidthPixels,
    'height_px': mapHeightPixels,
    'new_width': newWidth,
    'new_height': newHeight
  }
};

const calculateAspectRatioFit = (srcWidth, srcHeight, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio
  };
};

const getLayers = () => {
  // layers
  const greyBmapat = createWmtsLayer(
    'bmapgrau',
    '.png',
    true,
    'basemap.at'
  );
  const ortho30cmBmapat = createWmtsLayer(
    'bmaporthofoto30cm',
    '.jpg',
    false,
    'basemap.at'
  );
  // layer group
  const backgroundLayerGroup = new Group({
    layers: [greyBmapat, ortho30cmBmapat],
    name: 'background maps'
  });
  const poiLayerGroup = new Group({
    layers: [],
    id: 99999,
    name: 'poi group'
  });
  const campusLocationsGroup = new Group({
    layers: [],
    id: 900,
    name: 'campus locations'
  });

  return {
    baseLayers: {
      ortho30cmBmapat,
      greyBmapat
    },
    switchableLayers: [],
    layerGroups: [
      backgroundLayerGroup,
      poiLayerGroup,
      campusLocationsGroup
    ]
  }
}

const getStartCenter = () => indrzConfig.defaultCenterXY;

const getMapControls = () => {
  // controls
  const attributionControl = new Attribution({
    collapsible: false
  });
  const scaleLineControl = new ScaleLine();
  const zoomControl = new Zoom({ target: 'zoom-control' });

  return [
    attributionControl,
    scaleLineControl,
    zoomControl
  ];
};

const getWmsLayers = (floors) => {
  const wmsLayers = [];

  floors.forEach((floor, index) => {
    const floorName = floor.short_name.toLowerCase();
    const layerName = indrzConfig.layerNamePrefix + floorName;
    const layer = createWmsLayer(
      layerName,
      indrzConfig.geoServerLayerPrefix + layerName,
      floor.floor_num,
      index === 0,
      3
    );
    wmsLayers.push(layer);
  });
  const wmsFloorLayerGroup = new Group({
    layers: wmsLayers,
    name: 'wms floor maps'
  });
  return {
    layers: wmsLayers,
    layerGroup: wmsFloorLayerGroup
  }
};

const loadMapWithParams = async (mapInfo, query) => {
  const campusId = query.campus || 1;
  const zoomLevel = query.zlevel || 18;

  if (query.centerx !== 0 && query.centery !== 0 && isNaN(query.centerx) === false) {
    const view = mapInfo.map.getView();
    view.animate({ zoom: zoomLevel }, { center: [query.centerx, query.centery] });
  }
  if (query.floor) {
    mapInfo.activeFloorName = query.floor;
    activateLayer(mapInfo.activeFloorName, mapInfo.layers.switchableLayers, mapInfo.map);
    mapInfo.$emit('selectFloor', mapInfo.activeFloorName);
  }
  if (query.q && query.q.length > 3) {
    const result = await searchIndrz(mapInfo.map, mapInfo.layers, mapInfo.globalPopupInfo, mapInfo.searchLayer, campusId, query.q, zoomLevel,
      mapInfo.popUpHomePage, mapInfo.currentPOIID, mapInfo.currentLocale, mapInfo.objCenterCoords, mapInfo.routeToValTemp,
      mapInfo.routeFromValTemp, mapInfo.activeFloorName, mapInfo.popup);

    mapInfo.$root.$emit('load-search-query', query.q);

    if (result.floorName) {
      mapInfo.$emit('selectFloor', indrzConfig.layerNamePrefix + result.floorName);
    }
    mapInfo.searchLayer = result.searchLayer;
  }
  if (query['start-spaceid'] && query['end-spaceid']) {
    const startSpaceId = query['start-spaceid'];
    const endSpaceId = query['end-spaceid'];

    mapInfo.$emit('popupRouteClick', {
      path: 'from',
      data: {
        spaceid: startSpaceId,
        name: startSpaceId
      }
    });
    mapInfo.$emit('popupRouteClick', {
      path: 'to',
      data: {
        spaceid: endSpaceId,
        name: endSpaceId
      }
    });
    setTimeout(async () => {
      mapInfo.globalRouteInfo.routeUrl = await mapInfo.routeHandler.getDirections(mapInfo.map, mapInfo.layers, query['start-spaceid'], query['end-spaceid'], '0', 'spaceIdToSpaceId');
    }, 600);
  }
  if (query['poi-cat-id']) {
    mapInfo.$emit('openPoiTree', query['poi-cat-id']);
  }
  if (query['poi-id']) {
    mapInfo.$emit('openPoiTree', query['poi-id'], true);
  }
};

export default {
  initializeMap,
  getStartCenter,
  getMapControls,
  getWmsLayers,
  getLayers,
  hideLayers,
  setLayerVisible,
  activateFloor,
  activateLayer,
  searchIndrz,
  zoomer,
  getMapSize,
  calculateAspectRatioFit,
  loadMapWithParams
};
