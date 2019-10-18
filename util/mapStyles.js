import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';

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
  routeInactiveStyle
}
