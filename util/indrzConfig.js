const baseUrl = 'https://tuw-maps.tuwien.ac.at';
const baseApiUrl = baseUrl + '/api/v1/'

export default {
  baseApiUrl,
  defaultCenterXY: [1823820.8003225543,6138685.150457315], // TU
  baseWmsUrl: 'https://tuw-maps.tuwien.ac.at/geoserver/wms',
  searchUrl: baseApiUrl + 'search',
  token: 'Token 42519ebe7bada4d7a151c76832b94614ea5b198d', // TU
  layerNamePrefix: 'floor_', // TU
  geoServerLayerPrefix: 'indrztu:', // TU
  defaultStartFloor: 'eg' // TU
}
