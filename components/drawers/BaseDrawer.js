export default {
  name: 'BaseDrawer',
  props: {
    navigation: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
    show: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
    data: {
      type: Object,
      default: function () {
        return {
          name: ''
        }
      }
    },
    baseMap: {
      type: Object,
      required: false,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      dragHandle: null,
      drawerHeight: 0
    }
  },
  computed: {
    shouldShowDrawer: {
      get: function () {
        return this.show;
      },
      set: function (value) {
        this.$emit('update:show', value)
      }
    },
    mainDrawer: {
      get: function () {
        return this.navigation;
      },
      set: function (newValue) {
        this.$emit('update:drawer', newValue);
      }
    },
    isMobile () {
      return this.$vuetify.breakpoint.mobile;
    }
  },

  mounted () {
    this.$nextTick(() =>
      this.setHeight()
    )
    window.onresize = () => {
      this.setHeight();
    };
  },

  methods: {
    setHeight () {
      const height = this.$parent.$el.clientHeight;
      this.drawerHeight = this.isMobile ? height / 2 : height;
    },
    onTransitionEnd () {
      this.$refs.drawer.$el.style.transition = ''
    },
    startDrag (event) {
      event.preventDefault()
      this.$refs.drawer.$el.style.transition = 'none'
      this.dragHandle = event.target
      const initialHeight = this.drawerHeight
      const startY = event.clientY

      const drag = (event) => {
        if (event.buttons === 0) {
          stopDrag()
          return
        }
        const deltaY = startY - event.clientY
        this.drawerHeight = initialHeight + deltaY
      }

      const stopDrag = () => {
        window.removeEventListener('mousemove', drag)
        window.removeEventListener('mouseup', stopDrag)
        this.dragHandle = null
      }

      window.addEventListener('mousemove', drag)
      window.addEventListener('mouseup', stopDrag)
    }
  }
};
