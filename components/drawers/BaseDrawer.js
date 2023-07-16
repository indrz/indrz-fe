export default {
  name: 'BaseDrawer',
  props: {
    drawer: {
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
    map: {
      type: Object,
      required: true,
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
        return this.drawer;
      },
      set: function (newValue) {
        this.$emit('update:drawer', newValue);
      }
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.drawerHeight = this.$parent.$el.clientHeight / 2;
    })
  },

  methods: {
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
