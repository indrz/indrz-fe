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
import MapHandler from './mapHandler';
import api from './api';
import indrzConfig from '~/util/indrzConfig'

const createWmsLayer = function (
  layerName,
  geoserverLayer,
  floorNumber,
  isVisible,
  zIndexValue
) {
  return new ImageLayer({
    source: new ImageWMS({
      url: indrzConfig.indrz.baseWmsUrl,
      params: { LAYERS: geoserverLayer, TILED: true },
      serverType: 'geoserver',
      crossOrigin: ''
    }),
    visible: isVisible,
    name: layerName,
    floor_num: floorNumber,
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

const setLayerVisible = (layerNum, switchableLayers) => {
  if (switchableLayers.length > 0) {
    switchableLayers[layerNum].setVisible(true);
  }
};

const activateFloor = (feature, layers) => {
  let floor = feature.getProperties().floor_num;
  for (let i = 0; i < layers.switchableLayers.length; i++) {
    if (typeof floor === 'number') {
      floor = floor.toString();
    }
    if (floor === layers.switchableLayers[i].getProperties().floor_num) {
      activateLayer(i, layers.switchableLayers);
    }
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

const searchIndrz = (map, layers, globalPopupInfo, searchLayer, campusId, searchString, zoomLevel,
  popUpHomePage, currentPOIID,
  currentLocale, objCenterCoords, routeToValTemp,
  routeFromValTemp, activeFloorNum, popup) => {
  const searchUrl = indrzConfig.indrz.searchUrl + searchString + '?format=json';

  if (searchLayer) {
    map.removeLayer(searchLayer);
    clearSearchResults(map, searchLayer);
  }

  const searchSource = new SourceVector();

  api.request({
    url: searchUrl
  }).then(function (response) {
    const geojsonFormat3 = new GeoJSON();
    const featuresSearch = geojsonFormat3.readFeatures(response.data, { featureProjection: 'EPSG:4326' });
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
      const floor = feature.get('floor_num');
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
      let htmlInsert = '';

      if (roomCat !== '' && typeof roomCat !== 'undefined') {
        const resultListName = fullName + ' (' + roomCat + ')';
        htmlInsert = generateResultLinks(att, attributeInfo, featureCenter, resultListName, floor, featureId, poiIconPath)
      } else if (roomCode !== '' && typeof roomCode !== 'undefined') {
        const className = fullName + someThing;
        htmlInsert = generateResultLinks(att, attributeInfo, featureCenter, className, floor, featureId, poiIconPath)
      } else {
        const className = fullName;
        htmlInsert = generateResultLinks(att, attributeInfo, featureCenter, className, floor, featureId, poiIconPath)
      }
      console.log(htmlInsert)
      // todo: handle such jquery things
      // $('#search-results-list').append(htmlInsert);
    });

    const centerCoOrd = getCenter(searchSource.getExtent());

    if (featuresSearch.length === 1) {
      MapHandler.openIndrzPopup(
        globalPopupInfo, popUpHomePage, currentPOIID,
        currentLocale, objCenterCoords, routeToValTemp,
        routeFromValTemp, activeFloorNum, popup,
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
      activateFloor(featuresSearch[0], layers);
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
  });
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
  return searchLayer;
};

const zoomer = (view, coord, zoomLevel) => {
  view.animate({
    center: coord,
    duration: 2000,
    zoom: zoomLevel
  });
};

const activateLayer = (layerNum, switchableLayers) => {
  hideLayers(switchableLayers);
  setLayerVisible(layerNum, switchableLayers);
  // if (typeof update_url == undefined) {
  // safe to use the function
  // do we need to use that
  // update_url('map');
  // } else {
  // }
};

export default {

  getStartCenter: () => indrzConfig.indrz.defaultCenterXY,

  getMapControls: () => {
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
  },

  getLayers: () => {
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
    const wmsE00 = createWmsLayer('floor_eg', 'indrztu:floor_eg', '0', 'true', 3);
    const wmsE01 = createWmsLayer('floor_01', 'indrztu:floor_01', '1', 'false', 3);
    const wmsE02 = createWmsLayer('floor_02', 'indrztu:floor_02', '2', 'false', 3);
    const wmsE03 = createWmsLayer('floor_03', 'indrztu:floor_03', '3', 'false', 3);

    // layer group
    const backgroundLayerGroup = new Group({
      layers: [greyBmapat, ortho30cmBmapat],
      name: 'background maps'
    });
    const wmsfloorLayerGroup = new Group({
      layers: [wmsE00, wmsE01, wmsE02, wmsE03],
      name: 'wms floor maps'
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
      switchableLayers: [wmsE00, wmsE01, wmsE02, wmsE03],
      layerGroups: [
        backgroundLayerGroup,
        wmsfloorLayerGroup,
        poiLayerGroup,
        campusLocationsGroup
      ]
    }
  },

  hideLayers,
  setLayerVisible,
  activateFloor,
  activateLayer,
  searchIndrz
};
