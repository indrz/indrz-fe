import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';

const routeMarkerCStyle = new Style({
  image: new Icon({
    src: '/images/route/route_marker_C.png',
    anchor: [0.5, 1]
  }),
  zIndex: 6
});

const faCircleSolidStyle = new Style({
  image: new Icon({
    src: '/images/icons/flag.png',
    anchor: [0.5, 1]
  }),
  zIndex: 6
});

const faFlagCheckeredStyle = new Style({
  image: new Icon({
    src: '/images/icons/flag-checkered.png',
    anchor: [0.5, 1]
  }),
  zIndex: 6
});

const routeActiveStyle = new Style({
  stroke: new Stroke({
    color: '#ba4682',
    width: 4
  }),
  zIndex: 6
});

const routeInactiveStyle = new Style({
  stroke: new Stroke({
    color: '#ba4682',
    width: 2,
    lineDash: [0.1, 5],
    opacity: 0.5
  }),
  zIndex: 6
});

export default {
  routeActiveStyle,
  routeInactiveStyle,
  routeMarkerCStyle,
  faCircleSolidStyle,
  faFlagCheckeredStyle
}
