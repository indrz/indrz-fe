import SourceVector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Group from 'ol/layer/Group';
import MapStyles from './mapStyles';
import indrzConfig from './indrzConfig';
import api from './api';

const fetchPoi = (catId, map, activeFloorName) => {
  api.request({
    endPoint: `poi/cat/${catId}/?format=json`
  })
    .then((response) => {
      const poiLayer = createPoilayer(response.data, catId, activeFloorName);
      map.getLayers().push(poiLayer);
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
      // poiTitle = feature.getProperties().name;
      const cssName = feature.getProperties().fk_poi_category.icon_css_name;
      if (indrzConfig.layerNamePrefix + (poiFeatureFloor).toLowerCase() === activeFloorName) {
        feature.setStyle(MapStyles.createPoiStyle(cssName, 'y', poiFeatureFloor));
      } else {
        feature.setStyle(MapStyles.createPoiStyle(cssName, 'n', poiFeatureFloor));
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

export default {
  createPoilayer,
  poiExist,
  disablePoiById,
  setPoiVisibility,
  fetchPoi
};
