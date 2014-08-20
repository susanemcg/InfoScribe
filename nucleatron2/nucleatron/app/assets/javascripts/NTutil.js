//Util
NT.Util.serializeForm = function(form) { //saves form as a hash
	var o = {};
	var a = form.serializeArray();
	_.each(a, function(pair) {
		if (o[this.name] != null) {
			if (!o[pair.name].push) {
				o[pair.name] = [o[pair.name]];
			}
			return o[pair.name].push(pair.value || '');
		} else {
			return o[pair.name] = pair.value || '';
		}
	});
	return o;
};

NT.Util.addCSRF = function(token) {
	var oldSync = Backbone.sync;
	return Backbone.sync = function(method, model, options) {
		options.beforeSend = function(xhr) {
			return xhr.setRequestHeader('X-CSRF-Token', token);
		};
		return oldSync(method, model, options);
	};
};

NT.Util.RenderWithPagination = function( tmpl,data ){
	var fn = JST[tmpl];
	if( fn==null ){
		throw ""+tmpl+" does not exist!";
	}
	return fn( _.extend( 
		( _.isFunction(data.toJSON) ? data.toJSON() : _.clone(data) ), 
		{
			pageLinks: function( current,length ){ //current page, length 
				var html, links, num, _i;
				//
				html = ['<ul class="pagination">'];
				//prev
				if( 1 !== length ){
					html.push( "<li class='prev "+(1===current ? 'disabled' : void 0)+"'><a>&laquo;</a></li>" );
				}
				//numbers
				links = [];
				for( num = _i = 1; (1<=length ? _i<length : _i>length); (num = 1 <= length ? ++_i : --_i) ){ //just a for loop 1~length
					links.push( "<li class='"+(num===current ? 'active' : '')+"'><a>"+num+"</a></li>" );
				}
				html.push(links.join(''));
				//next
				if( 1 !== length ){
					html.push( "<li class='next "+(length-1===current ? 'disabled' : void 0)+"'><a>&raquo;</a></li>" );
				}
				//
				html.push('</ul>');
				return html.join('');
			}
		}
	) );
};