const IconSwitcher = (($) => {   
    
      /**
       * ------------------------------------------------------------------------
       * Constants
       * ------------------------------------------------------------------------
       */
    
      const NAME                = 'iconswitcher'
      const DATA_KEY            = 'pfz-349.iconswitcher'
      const EVENT_KEY           = `.${DATA_KEY}`
      const DATA_API_KEY        = '.data-api'
      const JQUERY_NO_CONFLICT  = $.fn[NAME]
  
      const Event = {
        CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}`
      }
  
      const Attributes = {
          COMPONENT: 'icons-switcher',
          DATA: 'data-val',
          DATAMAX: 'data-valmax'
      }
      const Selectors = {
          DATA: `[${Attributes.DATA}]`,
          COMPONENT: `[${Attributes.COMPONENT}]`
      }  
    
      const ClassNames = {
          ACTIVE: 'active'
      }
    
    
      /**
       * ------------------------------------------------------------------------
       * Class Definition
       * ------------------------------------------------------------------------
       */
    
      class IconSwitcher {
    
        constructor(element) {
          this._element = element
        }

        toggle(element){
            element = element || this._element
            const $e = $(element).is(Selectors.COMPONENT) ? $(element) : $(element).closest(Selectors.COMPONENT)
            const $icons = $e.find('.icons').children()
            const $input = $e.find('input')

            let val, valmax
            if ($e.is(Selectors.DATA)) {
                val = parseInt($e.attr(Attributes.DATA))
                valmax = parseInt($e.attr(Attributes.DATAMAX))
            }
            else {
                val = parseInt($input.val())
                valmax = $icons.length - 1
                $e.attr(Attributes.DATAMAX, valmax)
            }
            // update value
            val = val < valmax ? val+1 : 0
            $e.attr(Attributes.DATA, val)
            $input.val(val)
            $icons
                .removeClass(ClassNames.ACTIVE)
                .eq(val)
                .addClass(ClassNames.ACTIVE)
        }


        static _jQueryInterface(config) {
            return this.each(function () {
              const $element = $(this)
              let data       = $element.data(DATA_KEY)
      
              if (!data) {
                data = new IconSwitcher(this)
                $element.data(DATA_KEY, data)
              }      
  
              if (config === 'close') {
                data[config](this)
              }
            })
        }
    
        static _handleToggle(instance) {
            return function (event) {
            if (event) {
                event.preventDefault()
            }

            instance.toggle(this)
            }
        }

    }

   /**
     * ------------------------------------------------------------------------
     * Data Api implementation
     * ------------------------------------------------------------------------
     */

    $(document).on(
        Event.CLICK_DATA_API,
        Selectors.COMPONENT, 
        IconSwitcher._handleToggle(new IconSwitcher())
    )
    
    
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */

    $.fn[NAME]             = IconSwitcher._jQueryInterface
    $.fn[NAME].Constructor = IconSwitcher
    $.fn[NAME].noConflict  = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return IconSwitcher._jQueryInterface
    }

    return IconSwitcher

})($)
    
export default IconSwitcher
    