import SourceVector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Group from 'ol/layer/Group';
import { getCenter } from 'ol/extent';
import MapStyles from './mapStyles';
import MapUtil from './map';
import MapHandler from './mapHandler';
import config from './indrzConfig';
import api from './api';

const { env } = config;
const fetchPoi = (catId, map, activeFloorName) => {
  return api.request({
    endPoint: `poi/cat/${catId}/?format=json`
  })
    .then((response) => {
      return createPoilayer(response.data, catId, activeFloorName);
    })
};

const setPoiVisibility = (poiId, map) => {
  map.getLayers().forEach(function (layer) {
    if (layer instanceof Group) {
      layer.getLayers().forEach(function (sublayer, i) {
        if (sublayer.getProperties().id === poiId) {
          if (sublayer.getVisible() === true) {
            sublayer.setVisible(false);
          } else {
            sublayer.setVisible(true);
          }
        }
      });
    }
  });
};

const disablePoiById = (poiId, map) => {
  map.getLayers().forEach(function (layer, i) {
    if (layer instanceof Group) {
      if (layer.getProperties().id === 99999) {
        layer.getLayers().forEach(function (sublayer) {
          if (sublayer.getProperties().id === poiId) {
            sublayer.setVisible(false);
          }
        });
      }
    }
  });
};

const removePoiById = (poiId, map) => {
  map.getLayers().forEach(function (layer, i) {
    if (layer instanceof Group) {
      if (layer.getProperties().id === 99999) {
        layer.getLayers().forEach(function (sublayer) {
          if (sublayer.getProperties().id === poiId) {
            sublayer.setVisible(false);
            map.removeLayer(sublayer);
          }
        });
      }
    }
  });
};

const poiExist = (poiItem, map) => {
  const poiName = typeof poiItem.name !== 'undefined' ? poiItem.name : 0;
  const poiCatId = poiItem.id;
  let isExists = false;

  map.getLayers().forEach(function (layer, i) {
    if (layer instanceof Group) {
      layer.getLayers().forEach(function (sublayer, i) {
        if (sublayer.getProperties().id === poiCatId || sublayer.getProperties().name === poiName) {
          isExists = true;
        }
      });
    }
  });

  return isExists;
};

const createPoilayer = (data, poiCatId, activeFloorName) => {
  let poiTitle = '';
  const poiSource = new SourceVector();
  const geojsonFormat3 = new GeoJSON();
  const featuresSearch = geojsonFormat3.readFeatures(data, { featureProjection: 'EPSG:4326' });
  poiSource.addFeatures(featuresSearch);

  const poiVectorLayer = new VectorLayer({
    source: poiSource,
    style: function (feature) {
      const poiFeatureFloor = feature.getProperties().floor_name;
      /*
      if (req_locale === 'de') {
        poiTitle = feature.getProperties().name_de;
      } else {
        poiTitle = feature.getProperties().name_en;
      }
      */
      poiTitle = feature.getProperties().name_en;
      const icon = feature.getProperties().icon;
      if (env.LAYER_NAME_PREFIX + (poiFeatureFloor).toLowerCase() === activeFloorName) {
        feature.setStyle(MapStyles.createPoiStyle(icon, 'y', poiFeatureFloor));
      } else {
        feature.setStyle(MapStyles.createPoiStyle(icon, 'n', poiFeatureFloor));
      }
    },

    title: poiTitle,
    name: poiTitle,
    id: poiCatId,
    active: true,
    visible: true,
    zIndex: 999
  });
  // todo we can add the following code in some map handler
  // poiLayerGroup.getLayers().push(poiVectorLayer);

  return poiVectorLayer;
};

const showSinglePoi = (poiId, globalPopupInfo, zlevel, map, popup, activeFloorName) => {
  globalPopupInfo.poiId = poiId;
  // map.getLayers().getArray()[0].getProperties()
  const poiSingleLayer = map
    .getLayers()
    .getArray()
    .filter(layer => layer.getProperties().id === poiId);
  if (poiSingleLayer && poiSingleLayer.length) {
    map.removeLayer(poiSingleLayer[0]);
  }
  let poiTitle = '';
  const poiSource = new SourceVector();

  return api.request({
    endPoint: `poi/${poiId}/?format=json`
  })
    .then((response) => {
      const geojsonFormat3 = new GeoJSON();
      const featuresSearch = geojsonFormat3.readFeatures(response.data, { featureProjection: 'EPSG:4326' });
      poiSource.addFeatures(featuresSearch);
      const centerCoord = getCenter(poiSource.getExtent());
      if (featuresSearch.length === 1) {
        const offSetPos = [0, -35];
        const poiProperties = featuresSearch[0].getProperties();
        const poiCoords = poiProperties.geometry.getCoordinates();
        poiProperties.poiId = poiId;
        MapHandler.openIndrzPopup(globalPopupInfo, null, poiId, 'en', poiCoords,
          null, null, activeFloorName, popup, poiProperties, centerCoord,
          null, offSetPos);
        MapUtil.zoomer(map.getView(), centerCoord, zlevel);

        globalPopupInfo.poiCatId = featuresSearch[0].getProperties().category;
        globalPopupInfo.poiCatShareUrl = '?poi-cat-id=' + featuresSearch[0].getProperties().category;

        const poiLayer = new VectorLayer({
          source: poiSource,
          style: function (feature, resolution) {
            const poiFeatureFloor = feature.getProperties().floor_name;
            /*
            if (req_locale === 'de') {
              poiTitle = feature.getProperties().name_de;
            } else {
              poiTitle = feature.getProperties().name || feature.getProperties().name_en;
            }
            */
            poiTitle = feature.getProperties().name || feature.getProperties().name_en;

            const cssName = feature.getProperties().category_icon_css_name;

            if (env.LAYER_NAME_PREFIX + (poiFeatureFloor).toLowerCase() === activeFloorName) {
              feature.setStyle(MapStyles.createPoiStyle(cssName, 'y', poiFeatureFloor));
            } else {
              feature.setStyle(MapStyles.createPoiStyle(cssName, 'n', poiFeatureFloor));
            }
          },

          title: poiTitle,
          name: poiTitle,
          id: poiId,
          active: true,
          visible: true,
          zIndex: 999
        });

        map.addLayer(poiLayer);
        return poiLayer;
      }
    });
};

const setPoiFeatureVisibility = (map, activeFloorName) => {
  map.getLayers().forEach(function (layer, i) {
    if (layer instanceof Group) {
      if (layer.getProperties().name === 'poi group' || layer.getProperties().name === 'POI-Gruppe') {
        layer.getLayers().forEach(function (sublayer, i) {
          sublayer.getSource().forEachFeature(function (feature, i) {
            if (env.LAYER_NAME_PREFIX + (feature.getProperties().floor_name).toLowerCase() !== activeFloorName) {
              feature.setStyle(MapStyles.setPoiStyleOnLayerSwitch(feature.getProperties().icon, false));
            } else {
              feature.setStyle(MapStyles.setPoiStyleOnLayerSwitch(feature.getProperties().icon, true));
            }
          });
        });
      }
    }
  });
};

export default {
  createPoilayer,
  poiExist,
  disablePoiById,
  removePoiById,
  setPoiVisibility,
  fetchPoi,
  showSinglePoi,
  setPoiFeatureVisibility
};
