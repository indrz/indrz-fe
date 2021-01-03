import Vector from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { getCenter } from 'ol/extent';
import axios from 'axios';
import POIHandler from '~/util/POIHandler';
import MapUtil from '~/util/map';

const hostUrl = window.location.href;
const closeIndrzPopup = (popup, globalPopupInfo) => {
  popup.setPosition(undefined);
  for (const member in globalPopupInfo) {
    globalPopupInfo[member] = null;
  }
  popup.setPosition(undefined);
  globalPopupInfo.poiId = 'noid';
  globalPopupInfo.poiCatId = 'noid';
  globalPopupInfo.bookId = false;
  globalPopupInfo.bookCoords = false;
  globalPopupInfo.name = false;
  return false;
};

const openIndrzPopup = (
  globalPopupInfo, popUpHomePage, currentPOIID, currentLocale,
  objCenterCoords, routeToValTemp, routeFromValTemp,
  activeFloorName, popup, properties, coordinate, feature, offsetArray, layerNamePrefix) => {
  const floorName = activeFloorName.split(layerNamePrefix)[1].toUpperCase();
  const popupContent = document.getElementById('popup-content');

  for (const member in globalPopupInfo) {
    globalPopupInfo[member] = null;
  }
  feature = (typeof feature !== 'undefined' && feature !== null) ? feature : -1;
  offsetArray = (typeof offsetArray !== 'undefined' && offsetArray !== null) ? offsetArray : [0, 0];

  if (properties.hasOwnProperty('poiId')) {
    globalPopupInfo.src = 'poi';
    globalPopupInfo.poiId = properties.poiId;
  }
  if (properties.hasOwnProperty('category')) {
    globalPopupInfo.src = 'poi';
    globalPopupInfo.poiCatId = properties.category;
  }
  if (properties.hasOwnProperty('spaceid')) {
    globalPopupInfo.spaceid = properties.spaceid;
  }
  if (properties.hasOwnProperty('homepage')) {
    if (properties.homepage) {
      popUpHomePage = properties.homepage;
    }
  }
  if (properties.hasOwnProperty('src')) {
    if (properties.src) {
      globalPopupInfo.src = properties.src;
    }
  }
  if (properties.hasOwnProperty('space_type_id')) {
    if (properties.hasOwnProperty('src')) {
      if (properties.src) {
        globalPopupInfo.src = properties.src;
      } else {
        globalPopupInfo.src = 'wms';
      }
    }
    if (properties.hasOwnProperty('id')) {
      globalPopupInfo.spaceid = properties.id;
    }
    if (properties.hasOwnProperty('room_external_id')) {
      if (properties.room_external_id) {
        globalPopupInfo.external_id = properties.room_external_id;
      }
    }
  }
  if (properties.hasOwnProperty('room_code')) {
    globalPopupInfo.wmsInfo = properties.room_code;
    properties.roomcode = properties.room_code;
  }
  if (properties.hasOwnProperty('poi_id')) {
    currentPOIID = properties.poi_id;
    globalPopupInfo.poiId = properties.poi_id;
    if (properties.hasOwnProperty('category')) {
      globalPopupInfo.poiCatId = properties.category;
      if (currentLocale === 'de') {
        globalPopupInfo.poiCatName = properties.category_name_de;
      } else {
        globalPopupInfo.poiCatName = properties.category_name_en;
      }
      // globalPopupInfo.poiCatName = properties.category.cat_name;
      globalPopupInfo.poiCatShareUrl = hostUrl + '?poi-cat-id=' + globalPopupInfo.poiCatId;
    }
  } else if (feature !== -1) {
    if (globalPopupInfo.poiId === 'noid') {
      if (typeof feature !== 'string' && feature.getId()) {
        globalPopupInfo.poiId = feature.getId();
        globalPopupInfo.poiIdPopup = feature.getId();
        if (feature.get('category')) {
          globalPopupInfo.poiCatId = feature.get('category');
          if (currentLocale === 'de') {
            globalPopupInfo.poiCatName = feature.get('category_name_de');
          } else {
            globalPopupInfo.poiCatName = feature.get('category_name_en');
          }
          globalPopupInfo.poiCatShareUrl = hostUrl + '?poi-cat-id=' + globalPopupInfo.poiCatId;
        }
      }
    }
  }

  if (globalPopupInfo.poiId !== 'noid') {
    globalPopupInfo.poiCatShareUrl = 'poi-cat-id=' + globalPopupInfo.poiCatId;
  }
  objCenterCoords = coordinate;
  if (objCenterCoords || objCenterCoords !== '') {
    objCenterCoords = coordinate;
  } else {
    objCenterCoords = properties.centerGeometry.coordinates;
  }
  let titlePopup = '';
  const titleBuildingName = 'Building: ';
  const titleFloorNumber = 'Floor Name: ';
  const titleRoomcode = 'Room Number: ';
  const titleRoomCapacity = 'Capacity: ';
  const titleRoomCat = 'Category: ';
  const buildingName = getBuildingLetter(properties);
  let roomCode = null;
  let roomCat = null;
  let roomCapacity = null;

  if (properties.hasOwnProperty('capacity')) {
    if (properties.capacity) {
      roomCapacity = properties.capacity;
    }
  }

  if (properties.hasOwnProperty('category_de')) {
    if (properties.category_de) {
      if (currentLocale === 'de') {
        roomCat = properties.category_de;
      } else {
        roomCat = properties.category_en;
      }
    }
  }
  if (properties.hasOwnProperty('room_description')) {
    properties.name = properties.room_description;
  } else if (properties.hasOwnProperty('short_name')) {
    properties.name = properties.short_name;
  }
  if (properties.hasOwnProperty('room_code')) {
    properties.roomcode = properties.room_code;
  }
  titlePopup = getTitle(properties, currentLocale);
  routeToValTemp = titlePopup;
  if (properties.hasOwnProperty('centroid') === true) {
    routeToValTemp = properties.centroid;
  }
  if (typeof properties.label !== 'undefined') {
    roomCode = properties.roomcode;
  } else {
    roomCode = properties.roomcode;
  }

  const tb = '<table id="popupTable" style="user-select: text;"></table>';
  popupContent.innerHTML = '<h4 style="user-select: text;">' + titlePopup + '</h4>';
  popupContent.innerHTML += '<div><p>';
  popupContent.innerHTML += tb;

  if (properties.hasOwnProperty('campus_name')) {
    // $('#popup-links').hide();
  } else {
    // $('#popup-links').show();
    if (typeof properties.building_name !== 'undefined' && properties.building_name !== '') {
      addPoiTableRow(titleBuildingName, buildingName, 'popupBuilding');
    }
    if (properties.hasOwnProperty('shelfID')) {
      addPoiTableRow(titleBuildingName, properties.building, 'popupBuilding');
    }
    if (roomCapacity) {
      addPoiTableRow(titleRoomCapacity, roomCapacity, 'popupRoomCapacity');
    }
    if (roomCode) {
      addPoiTableRow(titleRoomcode, roomCode, 'popupRoomCode');
    }
    if (roomCat) {
      addPoiTableRow(titleRoomCat, roomCat, 'popupRoomCat');
    }
    if (properties.room_external_id) {
      addPoiTableRow('Room Code', properties.room_external_id, 'popupSpaceAks');
    }
    addPoiTableRow(titleFloorNumber, floorName, 'popupFloorNumber');
  }
  if (globalPopupInfo.roomcode) {
    routeFromValTemp = globalPopupInfo.roomcode;
  } else if (roomCode) {
    routeFromValTemp = roomCode;
  } else if (globalPopupInfo.name) {
    routeFromValTemp = globalPopupInfo.name;
  } else if (titlePopup) {
    routeFromValTemp = titlePopup;
  }
  popupContent.innerHTML += '</p></div>';
  globalPopupInfo.name = titlePopup;
  globalPopupInfo.coords = objCenterCoords;
  globalPopupInfo.floor = activeFloorName;
  globalPopupInfo.roomcode = roomCode;
  popup.setPosition(coordinate);
  popup.setOffset(offsetArray);
};

const getTitle = (properties, currentLocale) => {
  let name = '';
  let popUpRoomCode = '';

  if (properties.hasOwnProperty('room_code')) {
    if (properties.room_code) {
      popUpRoomCode = properties.room_code;
      name = properties.room_code;
    }
  }
  if (properties.hasOwnProperty('name')) {
    if (properties.name) {
      name = properties.name;
      return name;
    }
  }
  if (properties.hasOwnProperty('name_de')) {
    if (properties.name_de) {
      if (currentLocale === 'de') {
        name = properties.name_de;
        return name;
      } else {
        name = properties.name || properties.name_en;
        return name;
      }
    }
  }
  if (properties.hasOwnProperty('short_name')) {
    if (properties.short_name) {
      name = properties.short_name;
      return name;
    } else if (popUpRoomCode) {
      name = popUpRoomCode;
      return name;
    }
  }
  if (properties.hasOwnProperty('label')) {
    if (properties.label) {
      name = properties.label;
      return name;
    } else if (popUpRoomCode) {
      name = popUpRoomCode;
      return name;
    }
  }
  if (properties.hasOwnProperty('key')) {
    if (properties.key) {
      name = properties.key;
      return name;
    } else if (popUpRoomCode) {
      name = popUpRoomCode;
      return name;
    }
  }
  if (properties.hasOwnProperty('campus_name')) {
    if (properties.campus_name) {
      name = properties.campus_name;
      return name;
    } else if (popUpRoomCode) {
      name = popUpRoomCode;
      return name;
    }
  }
  if (properties.hasOwnProperty('room_external_id')) {
    if (properties.room_external_id) {
      if (!name) {
        name = properties.room_external_id;
        return name;
      }
    }
  }
  if (properties.room_code) {
    name = properties.room_code;
    return name;
  } else {
    return name;
  }
};

const getBuildingLetter = (p) => {
  let buildingLetter;
  if (p.hasOwnProperty('roomcode')) {
    if (p.roomcode) {
      buildingLetter = p.roomcode.split('.')[0];
      return buildingLetter;
    }
  } else if (p.hasOwnProperty('building_name')) {
    if (p.building_name !== null || p.building_name !== '' || typeof p.building_name !== 'undefined') {
      buildingLetter = p.building_name;
      return buildingLetter;
    }
  }
  return '';
};

const addPoiTableRow = (row1, row2, idname) => {
  const table = document.getElementById('popupTable');

  if (idname === 'popupHomepage') {
    row2 = '<a target="_blank" href="' + row2 + '">' + row2 + '</a>';
  }

  const row = table.insertRow(0);
  const cell1 = row.insertCell(0);
  const cell2 = row.insertCell(1);

  cell1.innerHTML = row1;
  cell2.innerHTML = row2;

  cell1.setAttribute('class', 'no-wrap');
  cell2.setAttribute('id', idname);
};

const getRoomInfo = (floor, layers, layerNamePrefix) => {
  const availableWmsLayers = layers.switchableLayers;
  let newel;

  availableWmsLayers.forEach(function (element) {
    if (floor.toLowerCase() === (layerNamePrefix + element.getProperties().floorName).toLowerCase()) {
      newel = element.getSource();
    }
  });
  return newel;
};

const handleShareClick = (map, globalPopupInfo, globalRouteInfo, globalSearchInfo, activeFloorName, isRouteShare) => {
  let param = '';

  if (isRouteShare) {
    param = 'route';
  } else if (globalPopupInfo.bookId) {
    param = 'bookId';
  } else if (globalSearchInfo.searchText) {
    param = 'search';
  } else if (globalPopupInfo.poiCatId) {
    param = 'poiCatId';
  } else if (globalPopupInfo.src === 'wms') {
    param = 'wmsInfo';
  }
  return updateUrl(param, map, globalPopupInfo, globalRouteInfo, globalSearchInfo, activeFloorName);
};

const updateUrl = (mode, map, globalPopupInfo, globalRouteInfo, globalSearchInfo, activeFloorName) => {
  const currentExtent2 = map.getView().calculateExtent(map.getSize());
  const currentZoom2 = map.getView().getZoom();
  const centerCrd = map.getView().getCenter();
  const centerX2 = centerCrd[0];
  const centerY2 = centerCrd[1];
  const buildingId = 1;

  let url = '/?campus=' + buildingId + '&centerx=' + centerX2 + '&centery=' + centerY2 +
    '&zlevel=' + currentZoom2 + '&floor=' + activeFloorName;

  const data = {};

  if (mode === 'route') {
    if (globalRouteInfo.routeUrl) {
      url = globalRouteInfo.routeUrl;
    } else if ((globalRouteInfo.startPoiId !== 'noid' && globalRouteInfo.endPoiId !== 'noid') || globalPopupInfo.poiId !== 'noid') {
      url = globalRouteInfo.routeUrl;
    } else if (globalPopupInfo.poiId === 'undefined' && globalPopupInfo.poiId === '' && globalPopupInfo.poiId !== 'noid') {
      url = '/?campus=' + buildingId + '&startstr=' + globalRouteInfo.startName + '&endstr=' + globalRouteInfo.endName;
    } else {
      url = '/?campus=' + buildingId + '&startstr=' + globalRouteInfo.startName + '&endstr=' + globalRouteInfo.endName;
    }
  } else if (mode === 'search') {
    if (globalPopupInfo.hasOwnProperty('external_id')) {
      if (globalPopupInfo.external_id === globalPopupInfo.name) {
        url = '/?campus=' + buildingId + '&q=' + globalPopupInfo.external_id;
      } else {
        url = '/?campus=' + buildingId + '&q=' + globalPopupInfo.name;
      }
    }
    if (globalSearchInfo.searchText) {
      url = '/?campus=' + buildingId + '&q=' + globalSearchInfo.searchText;
    } else {
      url = '/?campus=' + buildingId + '&q=' + globalPopupInfo.name;
    }
  } else if (mode === 'map') {
    url = '/?campus=' + buildingId + '&centerx=' + centerX2 + '&centery=' + centerY2 + '&zlevel=' + currentZoom2 + '&floor=' + activeFloorName;
  } else if (mode === 'bookId') {
    url = hostUrl + globalRouteInfo.routeUrl;
  } else if (mode === 'poiCatId') {
    url = location.origin + '?' + globalPopupInfo.poiCatShareUrl;
    const singlePoiUrl = location.origin + '?poi-id=' + globalPopupInfo.poiId + '&floor=' + globalPopupInfo.floor;
    return {
      type: 'poi',
      singlePoiUrl,
      poiCatUrl: url
    };
  } else if (mode === 'wmsInfo') {
    url = hostUrl + '?campus=1&q=' + globalPopupInfo.wmsInfo;
  } else {
    url = location.href;
  }

  data.extent = currentExtent2;
  data.zoom = currentZoom2;
  history.pushState(data, 'live_url_update', url);
  return location.href;
};

const handlePoiLoad = (map, activeFloorName, { removedItems, newItems, oldItems }, env) => {
  if (removedItems && removedItems.length) {
    removedItems.forEach((item) => {
      if (POIHandler.poiExist(item, map)) {
        POIHandler.disablePoiById(item.id, map);
      }
    });
  }
  if (oldItems && oldItems.length) {
    oldItems.forEach((item) => {
      POIHandler.setPoiVisibility(item, map);
    });
  }
  if (newItems && newItems.length) {
    newItems.forEach((item) => {
      if (POIHandler.poiExist(item, map)) {
        POIHandler.setPoiVisibility(item.id, map);
      } else {
        POIHandler
          .fetchPoi(item.id, map, activeFloorName, env)
          .then((poiLayer) => {
            map.getLayers().forEach((layer) => {
              if (layer.getProperties().id === 99999) {
                layer.getLayers().push(poiLayer);
              }
            });
          });
      }
    });
  }
};

const handleMapClick = (mapInfo, evt, layerNamePrefix) => {
  const pixel = evt.pixel;
  let feature = mapInfo.map.getFeaturesAtPixel(pixel);
  const features = [];

  mapInfo.map.forEachFeatureAtPixel(pixel, function (feature, layer) {
    features.push(feature);
  });
  feature = features[0];
  let coordinate = mapInfo.map.getCoordinateFromPixel(pixel);
  const properties = feature ? feature.getProperties() : null;

  if (feature) {
    const featureType = feature.getGeometry().getType().toString();

    if (featureType === 'MultiPolygon' || featureType === 'MultiPoint') {
      closeIndrzPopup(mapInfo.popup, mapInfo.globalPopupInfo);
      if (featureType === 'MultiPoint') {
        properties.poiId = feature.getId();
        properties.src = 'poi';
      }

      mapInfo.openIndrzPopup(properties, coordinate, feature);
      MapUtil.activateFloor(feature, mapInfo.layers, mapInfo.map);
    } else if (featureType === 'Point') {
      closeIndrzPopup(mapInfo.popup, mapInfo.globalPopupInfo);
      coordinate = mapInfo.map.getCoordinateFromPixel(pixel);
      properties.src = 'poi';
      if (feature.getProperties().hasOwnProperty('poi_id')) {
        properties.poiId = feature.properties.poi_id;
      }

      mapInfo.openIndrzPopup(properties, coordinate, feature);
      MapUtil.activateFloor(feature, mapInfo.layers, mapInfo.map);
    }
  } else {
    const featuresWms = mapInfo.map.getFeaturesAtPixel(pixel);
    const v = mapInfo.map.getView();
    const viewResolution = /** @type {number} */ (v.getResolution());
    const wmsSource2 = getRoomInfo(mapInfo.activeFloorName, mapInfo.layers, layerNamePrefix);
    const url = wmsSource2.getGetFeatureInfoUrl(coordinate, viewResolution, 'EPSG:3857', {
      INFO_FORMAT: 'application/json',
      FEATURE_COUNT: 50
    });

    if (url) {
      axios.get(url).then((response) => {
        mapInfo.globalPopupInfo.src = 'wms';
        const listFeatures = response.data && response.data.features ? response.data.features : [];
        const dataProperties = {};

        if (listFeatures.length > 0) {
          listFeatures.forEach(function (feature) {
            if (feature.properties.hasOwnProperty('space_type_id')) {
              if (feature.properties.hasOwnProperty('room_code') || feature.properties.hasOwnProperty('roomcode')) {
                const centroidSource = new Vector({
                  features: (new GeoJSON()).readFeatures(feature)
                });
                const centroidCoords = getCenter(centroidSource.getExtent());
                if (!dataProperties.properties) {
                  dataProperties.properties = {};
                }
                dataProperties.properties = { ...dataProperties.properties, ...feature.properties };
                dataProperties.centroid = centroidCoords;
              }
            }
          });
          dataProperties.properties.src = 'wms';
          mapInfo.openIndrzPopup(dataProperties.properties, dataProperties.centroid, featuresWms);
        }
      });
    }
  }
};

export default {
  closeIndrzPopup,
  openIndrzPopup,
  getTitle,
  getBuildingLetter,
  addPoiTableRow,
  getRoomInfo,
  handleShareClick,
  updateUrl,
  handlePoiLoad,
  handleMapClick
};
