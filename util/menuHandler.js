import { saveAs } from 'file-saver';
import JSPDF from 'jspdf';
import MapUtil from '~/util/map';
import MapHandler from '~/util/mapHandler';

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
  const map = mapInfo.map;
  const activeFloorNum = mapInfo.activeFloorNum;

  attachPreComposeHandler(map);
  mapInfo.map.once('postcompose', function (event) {
    const canvas = event.context.canvas;
    const mapSize = MapUtil.getMapSize(map);
    const canvasMapHeight = mapSize.height_px;
    const canvasMapWidth = mapSize.width_px;

    const ratio = canvasMapHeight / canvasMapWidth;

    let pageOrientation = 'landscape';

    if (ratio > 1) {
      pageOrientation = 'portrait';
    }

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
    const todayFileName = yyyy + '-' + mm + '-' + dd;

    if (canvas.toBlob) {
      canvas.toBlob(
        function (blob) {
          const doc = new JSPDF({
            orientation: pageOrientation,
            unit: 'px',
            format: 'a4'
          });

          const pdfWidth = doc.internal.pageSize.width;
          const pdfHeight = doc.internal.pageSize.height;

          let maxWidth;
          let maxHeight;

          const pdfLeftMargin = 20;
          const pdfRightMargin = 20;
          const pdfTopMargin = 40;
          const pdfBottomMargin = 20;

          if (ratio > 1) {
            // portrait
            maxWidth = pdfWidth - pdfLeftMargin - pdfRightMargin;
            maxHeight = pdfHeight - pdfTopMargin - pdfBottomMargin;
          } else {
            maxWidth = pdfWidth - pdfLeftMargin - pdfRightMargin;
            maxHeight = pdfHeight - pdfTopMargin - pdfBottomMargin;
          }
          const pdfMapWidth = pdfWidth - (pdfLeftMargin + pdfRightMargin);
          const titleXPos = pdfMapWidth / 2.4;
          const titleYPos = 25;

          doc.setFont('Arial');

          doc.setFontSize(22);

          doc.text('TU Campus', titleXPos, titleYPos);
          doc.setFontSize(12);

          const x = MapUtil.calculateAspectRatioFit(canvasMapWidth, canvasMapHeight, maxWidth,
            maxHeight);

          const reader = new window.FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function () {
            const base64data = reader.result;
            if (ratio > 1) {
              const pdfLeftMargin = (pdfWidth - x.width) / 2;
              debugger;
              // todo: need to handle here to load floor name
              doc.text('Stockwerk:  ' + activeFloorNum, 208, titleYPos + 10);
              doc.addImage(base64data, 'PNG', pdfLeftMargin, 40, x.width, x
                .height);
              doc.text(today, 20, 617);
            } else {
              const pdfLeftMargin = (pdfWidth - x.width) / 2;
              debugger;
              // todo: need to handle here to load floor name
              doc.text('Stockwerk:  ' + activeFloorNum, 300, titleYPos + 10);
              doc.addImage(base64data, 'PNG', pdfLeftMargin, 40, x.width, x
                .height);
              doc.text(today, 20, 420);
            }
            doc.save(todayFileName + '-TU.pdf');
          };
        },
        'image/jpeg'
      );
    }
  });
  mapInfo.map.renderSync();
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
