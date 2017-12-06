var BigNumber = require('bignumber.js');
const DynTbl = (($) => {


    /**
     * ------------------------------------------------------------------------
     * Constants
     * ------------------------------------------------------------------------
     */

    const NAME = 'dyntbl'
    const DATA_KEY = 'pfz-349.dyntbl'
    const EVENT_KEY = `.${DATA_KEY}`
    const DATA_API_KEY = '.data-api'
    const JQUERY_NO_CONFLICT = $.fn[NAME]

    const Event = {
        LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
        CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
        CHANGE_DATA_API: `change${EVENT_KEY}${DATA_API_KEY}`
    }

    const TABLEATTR = 'dyntbl'
    const Attributes = {
        TABLEATTR,
        WATCHEDINPUT: `${TABLEATTR}-watch`,
        PERCENTAGEWRAPPER: `${TABLEATTR}-perc`,
        DATASTOREATTR: `data-value`,
        NEWROWINDEX: `${TABLEATTR}-newrowidx`,
        NEWCOLINDEX: `${TABLEATTR}-newcolidx`,
        EMPTYROW: `${TABLEATTR}-emptyrow`,
        EMPTYTHEADCELL: `${TABLEATTR}-emptytheadcell`,
        EMPTYCELL: `${TABLEATTR}-emptycell`
    }
    const Selector = {
            // totals
            WATCHEDINPUT: `input[${Attributes.WATCHEDINPUT}]`,
            TOTALWRAPPER: `[${Attributes.TABLEATTR}-total]`,
            PERCENTAGEWRAPPER: `[${Attributes.PERCENTAGEWRAPPER}]`,
            TOTALALLWRAPPER: `[${Attributes.TABLEATTR}-total-all]`,
            TOTALALLEXCLUDE: `[${Attributes.TABLEATTR}-total-all-exclude]`,
            DATASTOREATTR: `[${Attributes.DATASTOREATTR}]`,
            INPUTCOLWATCHED: `input[dyntbl-watch*=col]`,
            INPUTROWWATCHED: `input[dyntbl-watch*=row]`,
            // rows/col duplication
            EMPTYROW: `[${Attributes.EMPTYROW}]`,
            EMPTYTHEADCELL: `[${Attributes.EMPTYTHEADCELL}]`,
            EMPTYCELL: `[${Attributes.EMPTYCELL}]`,
            DELETEROWTRIGGER: `[${Attributes.TABLEATTR}-deleterow]`,
            ADDROWTRIGGER: `[${Attributes.TABLEATTR}-addrow]`,
            DELETECOLTRIGGER: `[${Attributes.TABLEATTR}-deletecol]`,
            ADDCOLTRIGGER: `[${Attributes.TABLEATTR}-addcol]`,
        }

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

    class DynTbl {

        constructor(element) {
            this._element = element
            this.$t = $(this._element)
            const { $thead, $tbody } = this.getElements()
            this.$emptyrow = this.$t.find(Selector.EMPTYROW)
                .detach()
                .removeAttr(Attributes.EMPTYROW),
            this.$emptycell = this.$emptyrow.find(Selector.EMPTYCELL)
                .detach()
                .removeAttr(Attributes.EMPTYCELL),
            this.$emptytheadcell = $thead.find(Selector.EMPTYTHEADCELL)
                .detach()
                .removeAttr(Attributes.EMPTYTHEADCELL)

            this.newrowindex = this.$t.attr(Attributes.NEWROWINDEX) ? parseInt(this.$t.attr(Attributes.NEWROWINDEX)) : ''
            
                this.newcolindex = this.$t.attr(Attributes.NEWCOLINDEX) ? parseInt(this.$t.attr(Attributes.NEWCOLINDEX)) : ''
                

            // what should work or not
            this.features = {
                isTotalReady : ($tbody.find(Selector.WATCHEDINPUT)
                    .length + $tbody.find(Selector.TOTALWRAPPER)
                    .length > 1),
                isDynRowReady : this.$emptyrow.length === 1,
                isDynColReady : (this.$emptycell.length === 1 || this.$emptytheadcell.length === 1)
            }

            // Add/Remove row: needs at least one addrow trigger
            if (this.$t.find(Selector.ADDROWTRIGGER).length > 0) {
                if (this.features.isDynRowReady) {
                    this.$t
                        .on(
                            Event.CLICK_DATA_API,
                            Selector.ADDROWTRIGGER,
                            (event) => this.addRow(event)
                        )
                    this.$t
                        .on(
                            Event.CLICK_DATA_API,
                            Selector.DELETEROWTRIGGER,
                            (event) => this.removeRow(event)
                        )
                }
                // something is wrong:
                else {
                    console.warn(`Table [${TABLEATTR}] with adding/removing rows must have ${Selector.EMPTYROW} for duplication`)
                }
            }

            // Add/Remove columns: needs at least one addcol trigger
            if (this.$t.find(Selector.ADDCOLTRIGGER).length > 0) {
                if (this.features.isDynColReady) {
                    // add
                    this.$t
                        .on(
                            Event.CLICK_DATA_API,
                            Selector.ADDCOLTRIGGER,
                            (event) => this.addCol(event)
                        ) 
                    // remove
                    this.$t
                        .on(
                            Event.CLICK_DATA_API,
                            Selector.DELETECOLTRIGGER,
                            (event) => this.removeCol(event)
                        )
                }
                // something is wrong:
                else {
                    console.warn(`Table [${TABLEATTR}] with adding/removing columns must have ${Selector.EMPTYCELL} and ${Selector.EMPTYTHEADCELL} for duplication`)
                }
            }

            // Totals
            if (this.features.isTotalReady) {
                this.$t
                    .on(
                        Event.CHANGE_DATA_API,
                        Selector.WATCHEDINPUT,
                        (event) => this.onInputUpdated(event)
                    ) 
                this.refreshTotals()
            }

        }

        // public  
        init(element) {
            this._element = element;
        }
        addRow() {
            const
                { $thead, $tbody } = this.getElements(),
                $newrow = this.$emptyrow.clone(),
                totcols = $thead.find('tr')
                .find('>*')
                .length
            let
                currcols = $newrow.find('>*')
                .length
                // add empty cells if needed (add/remove column table) :
            while (currcols < totcols) {
                this.insertCellInRow($newrow, this.$emptycell.clone())
                currcols++;
            }
            this.insertRowInTbody($newrow)
                // update totals if needed
            if (this.features.isTotalReady) {
                // this.refreshTotals()
            }
        }
        removeRow(event) {
            const
                $row = $(event.target).closest('tr')
            $row.remove()
            // update totals if needed
            if (this.features.isTotalReady) {
                // this.refreshTotals($tbody)
            }
        }
        addCol() {
            const { $thead, $tbody } = this.getElements()
            this.insertCellInRow($thead.find('tr'), this.$emptytheadcell.clone())
            const ins = this.insertCellInRow.bind(this), clone = this.$emptycell
            $tbody.find('tr').each(function() {
                ins($(this), clone.clone())
            })
            // update totals if needed
            if (this.features.isTotalReady) {
                this.refreshTotals()
            }
        }
        removeCol(event) {
            const
                $cell = $(event.target).closest('th'),
                $cells = $cell.closest('tr').find('>*'),
                colidx = $cells.index($cell) + 1
            this.$t.find('tr')
                .find(`>*:nth-child(${colidx})`)
                .remove()
                // update totals if needed
            if (this.features.isTotalReady) {
                this.refreshTotals()
            }
        }
        onInputUpdated(event) {
            const $input = $(event.target)
            this.updateTotals($input)
            this.refreshTotals()
        }

        // Utils
        insertRowInTbody ($row) {
            const { $thead, $tbody } = this.getElements()
            if (this.newrowindex === 0) {
                $tbody.prepend($row)
            } else if (this.newrowindex === '') {
                $tbody.append($row)
            } else {
                $tbody.find('>*')
                    .eq(this.newrowindex)
                    .before($row)
            }
        }
        insertCellInRow ($row, $cell) {
            if (this.newcolindex === 0) {
                $row.prepend($cell)
            } else if (this.newcolindex === '') {
                $row.append($cell)
            } else {
                $row.find('>*')
                    .eq(this.newcolindex)
                    .before($cell)
            }
        }

        // update total linked to [dyntbl-watch]
        // [dyntbl-watch=*row] : search and update dyntbl-total in same row
        // [dyntbl-watch=*col] : search and update dyntbl-total in same column
        updateTotals ($input) {
            const
                { $thead, $tbody } = this.getElements(),
                directions = $input.attr(Attributes.WATCHEDINPUT).split(',')

            let $cells, $cell, $allinputs, $totalcell, $perccell, sum, tot

            if (directions.indexOf('col') > -1) {

                $cells = $input.closest('tr').children()
                $cell = $input.closest('td')
                sum = new BigNumber(0)

                const
                    $trs = $tbody.find(`> tr`),
                    colidx = $cells.index($cell) + 1,
                    allinputs = []
                
                $trs.find(`>*:nth-child(${colidx})`).each( function(){ 
                    let e = $(this).find(Selector.INPUTCOLWATCHED).first() 
                    e.length > 0 && allinputs.push(e) 
                })
                $allinputs = $(allinputs)
                $totalcell = $tbody.find(`> tr > ${Selector.TOTALWRAPPER}:nth-child(${colidx})`)
                $perccell = $tbody.find(`> tr > ${Selector.PERCENTAGEWRAPPER}:nth-child(${colidx})`)

                if ($totalcell.length > 0) {
                    $.each($allinputs, function() {
                        const
                            $e = $(this),
                            v = new BigNumber($e.val())
                        if (!v.isNaN()) { sum = sum.add(v) }
                    })
                    this.setTotal($totalcell, sum)
                }
                if ($perccell.length > 0) {
                    const 
                        totcellid = $perccell.attr(Attributes.PERCENTAGEWRAPPER),
                        $totcell = $tbody.find('#' + totcellid)
                        $allinputs = $allinputs.filter(function(){ return !$(this).is('#' + totcellid)})
                    if ($totcell.is('input')) {
                        tot = new BigNumber($totcell.val())
                    } else if ($totcell.is(Selector.DATASTOREATTR)) {
                        tot = new BigNumber($totcell.attr(Attributes.DATASTOREATTR))
                    }
                    else {
                        tot = new BigNumber($totcell.html())
                    }
                    if (!isNaN(tot)) {
                        $.each($allinputs, function() {
                            const
                                $e = $(this),
                                v = new BigNumber($e.val())
                            if (v && !v.isNaN()) { sum = sum.add(v) }
                        })
                        if (!sum.isNaN()) {
                            let per = sum.div(tot).times(100)
                            this.setTotal($perccell, per, { poststring: '%'})
                        }
                    } else {
                        console.log('no total value found', $totcell)
                    }
                }
            }
            if (directions.indexOf('row') > -1) {

                const allinputs = []
                
                $cells.each( function(){ 
                    let e = $(this).find(Selector.INPUTROWWATCHED).first() 
                    e.length > 0 && allinputs.push(e) 
                })
                
                $cells = $input.closest('tr').children()
                $cell = $input.closest('td')
                $allinputs = $(allinputs)
                $totalcell = $cells.filter(Selector.TOTALWRAPPER)
                $perccell = $cells.filter(Selector.PERCENTAGEWRAPPER)
                sum = new BigNumber(0)

                if ($totalcell.length > 0) {
                    $.each($allinputs, function() {
                        const
                            $e = $(this),
                            v = new BigNumber($e.val())
                        if (!v.isNaN()) { sum = sum.add(v) }
                    })
                    this.setTotal($totalcell, sum)
                }
                
                if ($perccell.length > 0) {
                    const 
                        totcellid = $perccell.attr(Attributes.PERCENTAGEWRAPPER),
                        $totcell = $tbody.find('#' + totcellid)
                        $allinputs = $allinputs.filter(function(){ return !$(this).is('#' + totcellid)})
                    if ($totcell.is('input')) {
                        tot = new BigNumber($totcell.val())
                    } else if ($totcell.is(Selector.DATASTOREATTR)) {
                        tot = new BigNumber($totcell.attr(Attributes.DATASTOREATTR))
                    }
                    else {
                        tot = new BigNumber($totcell.html())
                    }                
                    if (!tot.isNaN()) {
                        $.each($allinputs, function() {
                            const
                                $e = $(this),
                                v = new BigNumber($e.val())
                            if (v && !v.isNaN()) { sum = sum.add(v) }
                        })
                        if (!sum.isNaN()) {
                            let per = sum.div(tot).times(100)
                            this.setTotal($perccell, per, { poststring: '%'})
                        }
                    } else {
                        console.log('no total value found', $totcell)
                    }
                }
            }
        }

        // set total content
        setTotal ($totalcell, sum, params) {
            params = params || {}
            if (sum.isNaN() || !sum.isFinite()) {
                $totalcell.html(`N/A`)
            }
            else {
                params.poststring = params.poststring || ''
                sum = sum.isInteger() ? sum.toNumber() : sum.toFixed(2)
                $totalcell.html(`${sum}${params.poststring}`)
                    .attr(Attributes.DATASTOREATTR, sum)
            }
        }

        // sums up all [dyntbl-watch] into [dyntbl-total]
        refreshTotals () {
            const 
                { $thead, $tbody } = this.getElements(),
                $inputs = $tbody.find(Selector.WATCHEDINPUT), 
                ut = this.updateTotals.bind(this)
                $inputs.each(function() {
                    ut($(this))
                })
            if ($inputs.length == 0) {
                const $totals = $tbody.find(`> tr > ${Selector.TOTALWRAPPER}`), setTotal = this.setTotal
                $totals.each(function(){
                    setTotal($(this), new BigNumber(0))
                })
            }
            this.refreshAllTotals()
        }

        // Sums up totals (after all totals have been updated)
        refreshAllTotals () {
            const
                { $thead, $tbody } = this.getElements(),
                $e = $tbody.find(Selector.TOTALALLWRAPPER)
            if ($e.length > 0) {
                // total same line
                const rowcells = $e.closest('tr')
                    .find(Selector.TOTALWRAPPER).not(Selector.TOTALALLEXCLUDE)
                if (rowcells.length > 0) {
                    let
                        sum = new BigNumber(0)
                    $.each(rowcells, function() {
                        const
                            $e = $(this),
                            v = new BigNumber($e.attr(Attributes.DATASTOREATTR))
                        if (!v.isNaN()) { sum = sum.add(v) }
                    })
                    this.setTotal($e, sum)
                } else {
                    console.warn('need to check same column cells to get total :(')
                }
            }
        }

        getElements() {
            return {
                $thead: this.$t.find('thead'),
                $tbody: this.$t.find('tbody')
            }
        }

        // static 
        static _handleLoad(instance) {
            return function(event) {
                if (event) {
                    event.preventDefault()
                }
                instance.init(this)
            }
        }

        static _handleAddRow(instance) {
            return function(event) {
                if (event) {
                    event.preventDefault()
                }

                instance.init(this)
            }
        }
         
        static _jQueryInterface(config) {
            return this.each(function () {
                const $element = $(this)
                let data       = $element.data(DATA_KEY)
        
                if (!data) {
                    data = new DynTbl(this)
                    $element.data(DATA_KEY, data)
                }

            })
        }

    }

    
    /**
     * ------------------------------------------------------------------------
     * Data Api implementation
     * ------------------------------------------------------------------------
     */

    $(window)
        .on(Event.LOAD_DATA_API, () => {
            $(`[${TABLEATTR}]`).each(function () {
                const $table = $(this)
                DynTbl._jQueryInterface.call($table, $table.data())
            })
        })
    
    

    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */

    $.fn[NAME] = DynTbl._jQueryInterface
    $.fn[NAME].Constructor = DynTbl
    $.fn[NAME].noConflict = function() {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return DynTbl._jQueryInterface
    }

    return DynTbl

})($)