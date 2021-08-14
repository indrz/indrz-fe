import { saveAs } from 'file-saver';
import JSPDF from 'jspdf';
import MapUtil from '~/util/map';
import MapHandler from '~/util/mapHandler';
import config from '~/util/indrzConfig';

const { env } = config;

const handleZoomToHome = (mapInfo, center) => {
  mapInfo.view.animate({
    center,
    duration: 2000,
    zoom: 15
  });
};

const attachPreComposeHandler = (map) => {
  map.once('precompose', function (event) {
    event.context.fillStyle = 'white';
    event.context.fillRect(0, 0, event.context.canvas.width, event.context.canvas.height);
  });
};
const handleDownLoad = (mapInfo) => {
  attachPreComposeHandler(mapInfo.map);
  mapInfo.map.once('postcompose', function (event) {
    const canvas = event.context.canvas;
    const curDate = new Date();

    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        saveAs(blob, curDate.toLocaleDateString() + '_map.png');
      }, 'image/png');
    }
  });
  mapInfo.map.renderSync();
};

const handlePdf = (mapInfo) => {
  let maxWidth;
  let maxHeight;

  const pdfLeftMargin = 20;
  const pdfRightMargin = 20;
  const pdfTopMargin = 40;
  const pdfBottomMargin = 20;
  const map = mapInfo.map;
  const format = 'a4';
  const mapSize = MapUtil.getMapSize(map);
  const canvasMapHeight = mapSize.height_px;
  const canvasMapWidth = mapSize.width_px;
  const size = map.getSize();
  const viewResolution = map.getView().getResolution();
  const ratio = canvasMapHeight / canvasMapWidth;
  let pageOrientation = 'landscape';
  const floor = mapInfo.floors.find(floor => (env.LAYER_NAME_PREFIX + floor.floor_num) === mapInfo.activeFloorNum);
  const floorName = floor?.short_name;
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; // January is 0!

  const yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  today = dd + '.' + mm + '.' + yyyy;
  if (ratio > 1) {
    pageOrientation = 'portrait';
  }

  const mapCanvas = document.createElement('canvas');
  mapCanvas.width = mapSize.width_px;
  mapCanvas.height = mapSize.height_px;
  const mapContext = mapCanvas.getContext('2d');

  mapContext.fillStyle = 'white';
  mapContext.fillRect(0, 0, mapContext.canvas.width, mapContext.canvas.height);

  Array.prototype.forEach.call(
    document.querySelectorAll('.ol-layer canvas'),
    function (canvas) {
      if (canvas.width > 0) {
        const opacity = canvas.parentNode.style.opacity;
        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
        const transform = canvas.style.transform;
        // Get the transform parameters from the style's transform matrix
        const matrix = transform
          .match(/^matrix\(([^(]*)\)$/)[1]
          .split(',')
          .map(Number);
        // Apply the transform to the export map context
        CanvasRenderingContext2D.prototype.setTransform.apply(
          mapContext,
          matrix
        );
        mapContext.drawImage(canvas, 0, 0);
      }
    }
  );
  const pdf = new JSPDF({
    orientation: pageOrientation,
    unit: 'px',
    format
  });

  const pdfWidth = pdf.internal.pageSize.width;
  const pdfHeight = pdf.internal.pageSize.height;

  if (ratio > 1) {
    // portrait
    maxWidth = pdfWidth - pdfLeftMargin - pdfRightMargin;
    maxHeight = pdfHeight - pdfTopMargin - pdfBottomMargin;
  } else {
    maxWidth = pdfWidth - pdfLeftMargin - pdfRightMargin;
    maxHeight = pdfHeight - pdfTopMargin - pdfBottomMargin;
  }
  const x = MapUtil.calculateAspectRatioFit(canvasMapWidth, canvasMapHeight, maxWidth,
    maxHeight);
  pdf.addImage(
    mapCanvas.toDataURL('image/jpeg'),
    'JPEG',
    pdfLeftMargin,
    40,
    x.width,
    x.height
  );
  const titleXPos = maxWidth / 2 - 20;
  const titleYPos = 25;

  pdf.setFont('Arial');
  pdf.setFontSize(22);
  pdf.text('Campus', titleXPos, titleYPos);
  pdf.setFontSize(12);
  pdf.text('Stockwerk:  ' + floorName, (maxWidth / 2) - 25, titleYPos + 10);
  pdf.text(today, pdfLeftMargin, maxHeight);
  pdf.save('map.pdf');
  // Reset original map size
  map.setSize(size);
  map.getView().setResolution(viewResolution);
  document.body.style.cursor = 'auto';
};

const handleShare = (mapInfo) => {
  const url = MapHandler.updateUrl('map', mapInfo.map, mapInfo.globalPopupInfo, mapInfo.globalRouteInfo, mapInfo.globalSearchInfo, mapInfo.activeFloorNum);
  const shareOverlay = mapInfo.$refs.shareOverlay;
  if (typeof url === 'object' && url.type === 'poi') {
    shareOverlay.setPoiShareLink(url);
  } else {
    shareOverlay.setShareLink(location.href);
  }
  shareOverlay.show();
};

export default {
  handleZoomToHome,
  handleDownLoad,
  handlePdf,
  handleShare
};
