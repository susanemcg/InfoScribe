//Model

//DOCUMENT
NT.Model.Document = Backbone.Model.extend({});
NT.Model.DocumentCollection = Backbone.Collection.extend( {
	model:NT.Model.Document,
	url:'api/documents',
	//initialize
	initialize: function( models,opts ) {
		if( opts!=null ){
			return this.form = opts.form;
		}
	},
	//+
	createFromDC: function( doc ){
		return this.create({
			canonical_key:doc.id,
			form_id:this.form.id,
			title:doc.title,
			thumbnail_url:doc.resources.thumbnail
		});
	}
} );