import SourceVector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import MapStyles from './mapStyles';
import indrzConfig from './indrzConfig';

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
  createPoilayer
};
