User = Backbone.Model.extend
    initialize: ->
        this.set( window.UserData )


    documentCloudDocuments: ->
        @dc_documents || ( @dc_documents = new NT.Data.DocumentCloudSearch({ user: this.get('dc_account') }) )


namespace 'NT.Data', (exports) ->
    exports.CurrentUser = new User(window.UserData)
