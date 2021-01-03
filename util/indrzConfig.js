const baseUrl = 'https://example.com';
const baseApiUrl = baseUrl + '/api/v1/'

export default {
  baseApiUrl,
  defaultCenterXY: [1823820.8003225543, 6138685.150457315], // demo
  baseWmsUrl: 'https://example.com/geoserver/wms',
  searchUrl: baseApiUrl + 'search',
  token: 'Token abc123', // demo
  layerNamePrefix: 'floor_', // demo
  geoServerLayerPrefix: 'indrz:', // demo
  defaultStartFloor: 'EG' // demo
}
