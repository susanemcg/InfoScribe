

class PageStatus
    constructor: (opts={})->
        @complete = opts.complete || false
        @empty    = opts.empty    || true

    toString: ->
        if @complete then 'complete'
        else if @empty then 'empty'
        else 'partial'


Page = Backbone.Model.extend

    completionStatus: ->
        status = new PageStatus({ complete: true })

        for value in _.values( this.get('data') )
            if ! value? || '' == value
                status.complete = false
            else
                status.empty = false

        return status





PageSet = Backbone.Collection.extend
    model: Page
    url :'/api/page_data'


    forPage: (pg)->
        this._findPage(pg) || this.push({ page: pg, document_id: @doc.id })

    pageStatusFor: (pg_num)->
        pg = this._findPage(pg_num)
        return if pg then pg.completionStatus() else new PageStatus()

    setDocument: ( @doc )->

    _findPage: (pg)->
        this.detect( (model)->
            model.get('page') == pg
        )

namespace 'NT.Data', (exports) ->
    exports.Page = Page
    exports.PageSet = PageSet
