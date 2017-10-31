const EditableList = (($) => {
  
  
    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */
  
    const NAME                = 'editablelist'
    const DATA_KEY            = 'pfz-349.editablelist'
    const EVENT_KEY           = `.${DATA_KEY}`
    const DATA_API_KEY        = '.data-api'
    const JQUERY_NO_CONFLICT  = $.fn[NAME]

    const Event = {
      CLICK_DATA_API : `click${EVENT_KEY}${DATA_API_KEY}`
    }

    const Attributes = {
      EMPTY_ITEM : 'editable-list-empty'
    }
    const Selector = {
      DATA_TOGGLE : '[data-toggle="editable-list"]',
      DATA_ADD : '[data-add="editable-list"]',
      DATA_REMOVE : '[data-remove="editable-list"]',
      EMPTY_ITEM : `[${Attributes.EMPTY_ITEM}]`,
      CONTENT : '.editable-list__content',
      FIELD : '.editable-list__field .form-control',
    }

  
    const ClassName = {
      PARENT : 'editable-list',
      ON : 'on'
    }
  
  
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */
  
    class EditableList {
  
      constructor(element) {
        this._element = element
      }
    
  
      // public  
      toggle(element) {
        element = element || this._element
  
        const 
          $rootElement = $(element).closest(`.${ClassName.PARENT}`),
          $field = $rootElement.find(Selector.FIELD),
          $content = $rootElement.find(Selector.CONTENT)
          
        if ($rootElement.is(`.${ClassName.ON}`)) {
          const val = $field.val().trim()
          if (val.length > 0) {
            $content.html(val)
          }
          else {
            this._removeElement($rootElement[0])
          }
        }
        else {
          const h = $content.height();
          $field.val($content.html()).height(h)
        }

        $rootElement.toggleClass(ClassName.ON)
      }

      add(element) {
        element = element || this._element
        
        const 
          rootElementId = $(element).attr('data-target'),
          $targetElement = $(`#${rootElementId}`),
          $empty = $targetElement.find(Selector.EMPTY_ITEM).first(),
          $copy = $empty.clone()
        
        $copy.removeAttr(Attributes.EMPTY_ITEM).addClass(ClassName.ON)
        $targetElement.append($copy)
      }

      remove(element) {
        element = element || this._element
        
        const 
          $rootElement = $(element).closest(`.${ClassName.PARENT}`)

        this._removeElement($rootElement[0])
      }
  
      dispose() {
        $.removeData(this._element, DATA_KEY)
        this._element = null
      }
  
  
      // private   
  
      _removeElement(element) {
        this._destroyElement(element)  
      }
  
      _destroyElement(element) {
        $(element)
          .detach()
          .trigger(Event.CLOSED)
          .remove()
      }
  
  
      // static
  
      static _jQueryInterface(config) {
        return this.each(function () {
          const $element = $(this)
          let data       = $element.data(DATA_KEY)
  
          if (!data) {
            data = new EditableList(this)
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
      
      static _handleAdd(instance) {
        return function (event) {
          if (event) {
            event.preventDefault()
          }
  
          instance.add(this)
        }
      }
            
      static _handleRemove(instance) {
        return function (event) {
          if (event) {
            event.preventDefault()
          }
  
          instance.remove(this)
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
      Selector.DATA_TOGGLE,
      EditableList._handleToggle(new EditableList())
    )
    $(document).on(
      Event.CLICK_DATA_API,
      Selector.DATA_ADD,
      EditableList._handleAdd(new EditableList())
    )
    $(document).on(
      Event.CLICK_DATA_API,
      Selector.DATA_REMOVE,
      EditableList._handleRemove(new EditableList())
    )
  
  
    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */
  
    $.fn[NAME]             = EditableList._jQueryInterface
    $.fn[NAME].Constructor = EditableList
    $.fn[NAME].noConflict  = function () {
      $.fn[NAME] = JQUERY_NO_CONFLICT
      return EditableList._jQueryInterface
    }
  
    return EditableList
  
  })($)
  
  export default EditableList
  