model = Backbone.Model.extend
    initialize: ->

collection = Backbone.Collection.extend
    model: model
    url: '/api/documents'

    initialize:(models,options) ->
        @form = options.form if options?


    createFromDCloud: ( doc )->
        console.log("createFromDCloud")
        this.create( {
            canonical_id: doc.id
            form_id: @form.id
            title: doc.title
            thumbnail_url: doc.resources.thumbnail
        } )



namespace 'NT.Data', (exports) ->
    exports.Document = model
    exports.DocumentSet = collection
