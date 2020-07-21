xStart = 1587942.2647;
yStart = 5879651.6586;

const view = new ol.View({
  center: [xStart, yStart],
  zoom: zoom_level,
  maxZoom: 23
});

const attribution = new ol.control.Attribution({
  collapsible: false
});

const scaleLineControl = new ol.control.ScaleLine();
const map = new ol.Map({
  interactions: ol.interaction.defaults().extend([
    new ol.interaction.DragRotateAndZoom(),
    new ol.interaction.PinchZoom({
      constrainResolution: true // force zoomin to a interger zoom
    })
  ]),
  // layers: [backgroundLayers[0], backgroundLayers[1], wmsUG01, wmsE00, wmsE01, wmsE02, wmsE03],
  layers: [backgroundLayerGroup, wmsfloorLayerGroup, poiLayerGroup, campusLocationsGroup
    // new ol.layer.Group({
    //     'title': gettext('Background'),
    //     layers: [grey_bmapat, ortho30cm_bmapat
    //     ]
    // }),
    // new ol.layer.Group({
    //     title: gettext('Floor'),
    //     layers: [
    //
    //         wmsUG01, wmsE00, wmsE01, wmsE02, wmsE03, wmsE04, wmsE05, wmsE06
    //     ]
    // })
  ],
  target: 'map-block',
  controls: ol.control.defaults({ attribution: false }).extend([attribution, scaleLineControl]),
  view: view
});

// Change map height on resize
function fixContentHeight () {
  const viewHeight = $(window).height();
  const viewWidth = $(window).width();
  const $map_block = $('#map-block');

  let contentHeight = viewHeight - $('#top').outerHeight(true) - $('.navbar').outerHeight(true);
  if (viewWidth >= 990) {
    contentHeight -= $('#bottom').outerHeight(true);
    // set height for the accordion
    let sidebarTopHeight = $('#accordion > h3').outerHeight(true) + $('#search-prefetch2').outerHeight(true);
    $.each($('#routing-accordian > .panel-heading, #poi-accordian > .panel-heading'), function (key, elem) {
      sidebarTopHeight += $(elem).outerHeight(true);
    });
    const sidebarMaxHeight = contentHeight - sidebarTopHeight - 5;
    $('#directions').css('overflow', 'auto');
    $('#directions').css('max-height', sidebarMaxHeight + 'px');
    $('#indrzPoiTree').css('max-height', sidebarMaxHeight + 'px');
  }

  $map_block.height(contentHeight);
  map.updateSize();
}

$(window).resize(function () {
  fixContentHeight();
});

$(document).ready(function () {
  fixContentHeight();
  $('#directions').css('height', 'auto');
  $('#indrzPoiTree').css('height', 'auto');
});

function jsonRpcCall (url) {
  // data = '{"method": "' + methodName+ '", "id": "labla", "params": [' + parameters+ '], "jsonrpc":"2.0"}';

  jQuery.ajax({
    url: url,
    // data: JSON.stringify(data),
    // data: data,
    type: 'GET',
    dataType: 'json',
    contentType: 'application/json; charset=UTF-8',
    success: function (jsonObj) {
      callback(jsonObj.result);
    },
    error: function (e) {
      console.error('Failed to do json rpc call to ' + url);
      callback(null);
    },
    async: true,
    timeout: 7500 // 7.5 seconds
  });
}
