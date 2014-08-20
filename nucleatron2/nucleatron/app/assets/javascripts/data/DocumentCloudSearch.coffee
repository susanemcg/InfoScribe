model = Backbone.Model.extend
    initialize: ->

Documents = Backbone.Collection.extend
    model: model



Search = Backbone.Model.extend

    url: ->
        "https://#{NT.Data.HOST}/api/search.json"

    initialize: ( opts )->
        @user = opts.user
        @per_page = opts.per_page || 4;
        this.setPage(1)

    documents: ->
        new Documents( this.get('documents') )

    # N.B.  Even though it would be more intuitive,
    # page indexes start at "1", not "0".
    # Both DocumentCloud API and our UI refer to them that way
    setPage: (page)->
        me = this
        this.fetch({
            dataType: 'jsonp'
            data: {
                q: "account: #{@user.id} access: public"
                page: page,
                per_page: @per_page
            }
            success: (search,data)->
                me.page = page
                me.totalSize = data.total
                me.trigger('pageload', me )
            error: (er)->
                me.trigger('error',me)
        })

    currentPage: ->
        @page

    pageCount: ->
        Math.round(this.get('total') / @per_page);



namespace 'NT.Data', (exports) ->
#    exports.DocumentCloudDocument = model

    exports.DocumentCloudSearch = Search
