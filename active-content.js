import $ from 'jquery'
import Util from 'bootstrap/js/dist/util'
/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): activecontent.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

const ActiveContent = (($) => {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME                = 'activecontent'
  const VERSION             = '4.0.0'
  const DATA_KEY            = 'bs-custom.activecontent'
  const EVENT_KEY           = `.${DATA_KEY}`
  const DATA_API_KEY        = '.data-api'
  const JQUERY_NO_CONFLICT  = $.fn[NAME]

  const ClassName = {}

  const Attributes = {
    CONTENTSWRAPPER: 'data-target',
    WAY: 'data-way',
    IDX: 'data-idx',
    ACTIVECLASSSETTING: 'data-active',
    INACTIVECLASSSETTING: 'data-inactive',
  }

  const Selector = {
    TOGGLER : '[data-toggle="activecontent"]',
    CONTENTSWRAPPER: `[${Attributes.CONTENTSWRAPPER}]`,
    WAY: `[${Attributes.WAY}]`,
    IDX: `[${Attributes.IDX}]`,
    ACTIVECLASSSETTING: `[${Attributes.ACTIVECLASSSETTING}]`,
    INACTIVECLASSSETTING: `[${Attributes.INACTIVECLASSSETTING}]`,
  }

  const Event = {
    CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
    CHANGED: `changed${EVENT_KEY}`,
  }

  // Object copied to each instance
  const Settings = {}
  Settings.ClassName = {
    ACTIVE: 'd-block',
    INACTIVE: 'd-none',
  }
  Settings.Selector = {
    ACTIVE: `.${Settings.ClassName.ACTIVE}`,
    INACTIVE: `.${Settings.ClassName.INACTIVE}`,
  }

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class ActiveContent {
    constructor(element) {
      this._element = element
      this._settings = Object.assign({}, Settings)
      const $e = $(this._element)
      this.$contents = $e.children()
      if ($e.is(Selector.ACTIVECLASSSETTING)) {
        this._settings.ClassName.ACTIVE = $e.attr(Attributes.ACTIVECLASSSETTING) === '' ? Settings.ClassName.ACTIVE : $e.attr(Attributes.ACTIVECLASSSETTING)
        this._settings.Selector.ACTIVE = `.${this._settings.ClassName.ACTIVE}`
      }
      if ($e.is(Selector.INACTIVECLASSSETTING)) {
        this._settings.ClassName.INACTIVE = $e.attr(Attributes.INACTIVECLASSSETTING) === '' ? Settings.ClassName.INACTIVE : $e.attr(Attributes.INACTIVECLASSSETTING)
        this._settings.Selector.INACTIVE = `.${this._settings.ClassName.INACTIVE}`
      }
    }

    // Getters

    static get VERSION() {
      return VERSION
    }

    // Public

    switch(config) {
      let nextIdx
      if (typeof config.idx !== 'undefined') {
        nextIdx = config.idx
      }
      else {
        let way = config && config.way ? parseInt(config.way) : 1
        const $actived = this.$contents.filter(this._settings.Selector.ACTIVE).first()
        let currentIdx = this.$contents.index( $actived )
        //
        nextIdx = currentIdx + way
      }
      nextIdx >= this.$contents.length && (nextIdx = 0)
      nextIdx < 0 && (nextIdx = this.$contents.length - 1)
      //
      this.$contents
        .addClass(this._settings.ClassName.INACTIVE)
        .removeClass(this._settings.ClassName.ACTIVE)
        .eq(nextIdx)
        .addClass(this._settings.ClassName.ACTIVE)
        .removeClass(this._settings.ClassName.INACTIVE)
      this._triggerChangeEvent()
    }

    // Private

    _triggerChangeEvent(element) {
      const changedEvent = $.Event(Event.CHANGED)

      $(this._element).trigger(changedEvent)
      return changedEvent
    }


    // Static
    // $(..).activecontent('on')
    // $(..).activecontent('off')
    static _jQueryInterface(config) {
      config = config || { way: 1 }
      return this.each(function () {
        const $e = $(this)
        const $wrapper = $e.is(Selector.CONTENTSWRAPPER) ? $($e.attr(Attributes.CONTENTSWRAPPER)).first() : $e

        let data = $wrapper.data(DATA_KEY)
        if (!data) {
          data = new ActiveContent($wrapper)
          $wrapper.data(DATA_KEY, data)
        }

        data.switch(config)
      })
    }

  }

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */
  $(document).on(
    Event.CLICK_DATA_API,
    Selector.TOGGLER,
    function (event) {
      // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
      if (event.currentTarget.tagName === 'A') {
        event.preventDefault()
      }
      const
        $trigger = $(this),
        config = {}
      if ($trigger.is(Selector.WAY)) {
        config.way = parseInt($trigger.attr(Attributes.WAY))
      }
      else if ($trigger.is(Selector.IDX)) {
        config.idx = parseInt($trigger.attr(Attributes.IDX))
      }
      else {
        config.way = 1
      }
      ActiveContent._jQueryInterface.call($trigger, config)
    }
  )

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME]             = ActiveContent._jQueryInterface
  $.fn[NAME].Constructor = ActiveContent
  $.fn[NAME].noConflict  = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return ActiveContent._jQueryInterface
  }

  return ActiveContent
})($)

export default ActiveContent
