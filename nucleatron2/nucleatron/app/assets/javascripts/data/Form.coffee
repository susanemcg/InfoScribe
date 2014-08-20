model = Backbone.Model.extend
    url: '/api/forms'
    initialize: ->


    documents: ->
        unless @docs?
            @docs = new NT.Data.DocumentSet( this.get('documents'), {form:this} )
        @docs


    toJSON: ->
        _.extend( Backbone.Model.prototype.toJSON.apply(this,arguments), {
            'documents': this.documents().toJSON()
        })


collection = Backbone.Collection.extend
    model: model
    url: '/api/forms'


namespace 'NT.Data', (exports) ->
    exports.Form = model
    exports.FormSet = collection
