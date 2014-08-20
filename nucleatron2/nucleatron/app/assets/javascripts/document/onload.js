
			//Router
			NT.Router = Backbone.Router.extend( {
				//routes
				routes:{
					""       :"index",
					"page:id":"pagechange"
				},
				//+
				changeURL: function( page,triggerornot ){
					if( triggerornot==null ) {
						triggerornot = false;
					}
					return this.navigate( "page"+page,{ trigger:triggerornot } );
				}
			} );

			//Model
			// response
			var completion_status = (function(){ //completion_status class (completion status of a response)
				function completion_status( opts ){
					if( opts==null ) {
						opts = {};
					}
					this.complete = ( (opts.complete!=null)? (opts.complete) : (false) );
					this.empty    = ( (opts.empty   !=null)? (opts.empty)    : (true) );
				}
				completion_status.prototype.toString = function(){
					// complete:false,empty:true  => empty
					// complete:false,empty:false => partial
					// complete:true ,empty:false => complete
					// complete:true ,empty:true  => complete
					if( this.complete ){
						return 'complete';
					}
					else if( this.empty ){
						return 'empty';
					}
					else{
						return 'partial';
					}
				};
				return completion_status;
			})();
			NT.Model.Response = Backbone.Model.extend( {} );
			NT.Model.ResponseCollection = Backbone.Collection.extend( {
				model: NT.Model.Response,
				url:'/api/responses',
				//+
				setDocument: function( doc ){
					this.doc = doc;
				},
				find_response_w_page: function( page ){  // detect(underscore): for model(response) in this(response_coll), return the first model whose model.get('page')===page
					return this.detect( function( model ){ return model.get('page')===page; } );
				},
				find_or_add_response_w_page: function( page ){  // find||add a model(response) with model.get('page')===page
					return this.find_response_w_page( page ) || this.push( { page:page,document_id:this.doc.id } );
				},
				input_count_for_page: function(){
					arr = []
					//if the number of values are what we need
					for( var i=1; i<test.length; i++){
						if( test[i].page==page ){
							var input_count = test[i].inputs.length;
							break;
						}
					}
					return arr;
				},
				completion_status_for_response_w_page: function( page ){
					//if the Response model with the page exists
					var temp = this.find_response_w_page( page );
					if( temp ){
						//AND if the array of response values is not [] //it sometimes happens
						var response_value_arr = _.values( temp.get('data') ); //essentially, the "responses" table's "data" field
						if( response_value_arr.length!=0 ){
							//store the length
							var input_count = response_value_arr.length;
							//array of response values, null and "" spliced out
							for( var i=0; i<response_value_arr.length; i++ ){
								////////what if a value is actually empty in the doument? will never be "complete"; document will get assigned again
								if ( response_value_arr[i]==null || response_value_arr[i].trim()==="" ){
									response_value_arr.splice( i,1 );
									i--;
								}
							}
							//if the number of values are what we need
							if( response_value_arr.length==input_count ){
								return new completion_status( { complete:true,empty:false } ); //complete
							}
							//if the number of values aren't there yet, but it isn't 0
							else if( response_value_arr.length ){
								return new completion_status( { complete:false,empty:false } ); //partial
							}
						}
					}
					//otherwise
					return new completion_status(); //empty
				}
			} );

			//View
			// breadcrumbs
			NT.View.Breadcrumbs = Backbone.View.extend( {
				//initialize
				initialize: function( options ){
					this.response_coll = options.response_coll
					this.doc           = options.doc
				},
				//render
				render: function() {
					this.$('.page-status').html( window.JST["document/breadcrumbs"]( {
						page_arra: this.doc.get('pages_with_forms'),
						response_coll: this.response_coll,
						currentpage: this.currentpage,
						inputs: this.getInputs()
					} ) );
					return this;
				},
				//events
				events: {
					'change input,textarea': 'update_breadcrumbs',
					'focus input,textarea': 'onFocus',
					'blur input,textarea': 'onBlur',
					'click table.inputs td': 'focusInput',
					'click table.pages td': 'changePage'
				},
				update_breadcrumbs: function(){ //solves the problem where you have to click twice to get to a new page
					var me = this; //_.delay has scope issues; this solves it
					_.delay( function(){ me.render(); },100 );
				},
				onFocus: function(ev) {
					var selected = _.indexOf( this.getInputs(),ev.target );
					return this.$( '.inputs td' ).each( function( index,td ){
						return $(td).toggleClass( 'focused',selected===index );
					});
				},
				onBlur: function(ev) {
					return this.$( '.inputs td').each( function( index,td ){
						return $(td).removeClass( 'focused' );
					});
				},
				focusInput: function(ev) {
					var index = $(ev.target).index();
					return $( this.$('input,textarea').not(':checkbox')[index] ).focus().select();
				},
				changePage: function(ev) {
					var pg = this.doc.get('pages_with_forms')[$(ev.target).index()];
					return therouter.changeURL( pg,true );
				},
				//+
				redraw: function( el,currentpage ) {
					this.currentpage = currentpage;
					this.undelegateEvents();
					this.setElement(el);
					return this.render();
				},
				getInputs: function() { //////////////
					return this.$('input,textarea').not(':checkbox'); //you can't focus a checkbox
				}
			} );
			// form
			NT.View.Form = Backbone.View.extend( {
				//initialize
				initialize: function( options ){
					_.bindAll( this,'changePage','onViewerPageChange','resize' );
					this.doc = options.doc;
					this.viewer = options.viewer;
					this.response_coll = new NT.Model.ResponseCollection( window.response_coll );
					this.response_coll.setDocument( this.doc );
					this.breadcrumbs = new NT.View.Breadcrumbs( {
						//initialize options
						response_coll: this.response_coll,
						doc: this.doc
					} );
					this.currentpage = 1;
					//changing pages
					therouter.on( 'route:pagechange',this.changePage );
					this.viewer.api.onPageChange( _.debounce( this.onViewerPageChange,100 ) ); //_.debounce(): only call that function every 100 milliseconds
					return this;
				},
				changePage: function( page ){
					this.viewer.api.setCurrentPage( page );
				},
				onViewerPageChange: function(){
					therouter.changeURL( this.viewer.api.currentPage() );
					this.saveCurrentPage();
					this.render();
				},
				//render
				render: function(){ //////////////
					var data, jst, pg_data;
					this.currentpage = this.viewer.api.currentPage();
					this.$el.html( window.JST[ "document/container" ]( this.viewer ) );
					jst = window.JST[ "forms/"+this.doc.get('form_directory')+"/p"+this.currentpage ];
					if( _.isFunction(jst) ){
						pg_data = this.response_coll.find_or_add_response_w_page( this.currentpage );
						data = _.extend( { data:{} }, pg_data.toJSON() );
						this.$('form').html( jst(data) );
					}
					this.breadcrumbs.redraw( this.el, this.currentpage );
					this.resize();
					return this;
				},
				//events
				events: {
					'click button.save': 'saveData'
				},
				saveData: function() { ////////////// THIS SHOULD SAVE RESPONSES WHY IS IT NOT SAVING RESPONSES
						this.saveCurrentPage();
						return this.response_coll.each( function(page) {
						                                	if (page.hasChanged()) {
						                                		return page.save();
						                                	}
						                                }
						);
				},
				//+
				saveCurrentPage: function(){
					var response_coll = this.response_coll.find_or_add_response_w_page( this.currentpage ); //////////////
					response_coll.set( { data: NT.Util.serializeForm( this.$('form') ) }, { silent:true } );
				},
				resize: function() {
					return this.$('form').height( $(window).height()-150 );
				}
			} );



			//afterLoad: setupform; set up the sidebar with the form and breadcrums
			var setupform = function( viewer ) {
				doc  = new NT.Model.Document( window.form );
				form = new NT.View.Form( {
						el: $('#form_container'),
						//initialize options
						viewer: viewer,
						doc: doc
				} );
				$(window).resize( form.resize );
				document.title = viewer.api.getTitle()
				form.render();
				//feedback//
				console.log( "form loaded" );
			};
			//1.replaceDCViewerHistory
			DV.History = (function() {
				function DummyDCHistory() {}
				DummyDCHistory.prototype.register = function() {};
				DummyDCHistory.prototype.loadURL = function() {};
				return DummyDCHistory;
			})();
			//2.embed the document viewer
			DV.load( "https://"+NT.HOST+"/documents/"+window.form.canonical_key+".js", 
				{
					sidebar: false, //documentcloud viewer's sidebar
					text: false, //search bar
					pdf: false, //download link
					container: "#embeded_document",
					afterLoad: setupform //what to do after the viewer is loaded
				}
			);
			//
			NT.Util.addCSRF( $("meta[name='csrf-token']").attr('content') )
			//router
			var therouter = new NT.Router();
			Backbone.history.start();
			//feedback//
			console.log( "viewer loaded" );
			////////////// $(document).ready NT.onDocumentReady //$(document).ready( function(){ });