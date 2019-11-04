// const baseApiUrl = 'https://tu.indrz.com/api/v1/';
const baseApiUrl = 'https://navigatur.tuwien.ac.at/api/v1/';
// const baseApiUrl = 'http://localhost:8000/api/v1/';
export default {
  baseApiUrl,
  defaultCenterXY: [1822252.75, 6139984.70],
  // baseWmsUrl: 'https://www.indrz.com/geoserver/wms',
  baseWmsUrl: 'https://navigatur.tuwien.ac.at/geoserver/wms',
  searchUrl: baseApiUrl + 'search',
  token: 'Token 42519ebe7bada4d7a151c76832b94614ea5b198d',
  layerNamePrefix: 'floor_',
  geoServerLayerPrefix: 'indrztu:',
  defaultStartFloor: 'eg'
}
