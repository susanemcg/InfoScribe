(function(){

var app = angular.module('infoscribe-schema', []);



app.controller('TranscriptionController', ['$http', '$scope', '$compile', function($http, $scope, $compile){

	var transcription_session = this;

	transcription_session.documents = [];

	$scope.imageXRatio;
	$scope.imageYRatio;

	this.currentDoc = {};
	
	this.currentTranscription = {};
	this.docModel = [];
	//$scope.docModel = this.docModel;

	$scope.$watch('docModel', function() {
    	console.log("guess you just added something!");
 	 }, true);
	this.fieldOptions = [
			    { label: 'text', value: "text" },
			    { label: 'number', value: "number" },
			    { label: 'date', value: "date"}
			  	];

	this.currentData = {};



	$http.get('data/sample_docs_list.json').success(function(data){

		transcription_session.documents = data;
		transcription_session.currentDoc = data[0];

	});


	this.docScale = 1;
	this.currentHighlight = null;
	this.isDrawing = false;
	this.isPanning = false;
	this.lastPos = {"top":0, "left":0};

	this.stripPx = function(pixArg){
 		return ( Number((String(pixArg).split('px'))[0]) )
	}

	
	this.adjustScale = function(scaleNum, elem, centerX, centerY){
		
		var scaleString =  "scale("+scaleNum+","+scaleNum+")";
		var inlineStyle = "-webkit-transform:"+scaleString+"; -webkit-transform-origin: "+centerX+"px "+centerY+"px; -moz-transform:"+scaleString+"; -moz-transform-origin: "+centerX+"px "+centerY+"px; -ms-transform: "+scaleString+"; -ms-transform-origin: "+centerX+"px "+centerY+"px; -o-transform:"+scaleString+"; -o-transform-origin: "+centerX+"px "+centerY+"px; transform:"+scaleString+"; transform-origin: "+centerX+"px "+centerY+"px;"
		$(elem).attr('style', inlineStyle);
	}

	this.getOffset = function(e){
		var offsetObj = {};
		if(e.offsetX){
			offsetObj.x = e.offsetX;
			offsetObj.y = e.offsetY;
		}else{
			offsetObj.x = e.clientX - e.target.getBoundingClientRect().left;
			offsetObj.y = e.clientY - e.target.getBoundingClientRect().top;
		}
		return offsetObj;

	}

	this.zoom = function(e){
		if(this.docScale < 3){
			this.docScale += .5;
		}
		var offset = this.getOffset(e);
		this.adjustScale(this.docScale, e.currentTarget, offset.x, offset.y);
	}
	this.startPan = function(e){
		var offset = this.getOffset(e);
		this.lastPos.top = offset.y;
		this.lastPos.left = offset.x;
		this.isPanning = true;
		$('#theDoc').addClass("panning");
	}
	this.panImage = function(e){
		var offset = this.getOffset(e);
		// HACKHACKHACKHACKHACK
		var docHolder = document.getElementById("theDoc");
		styleObj = docHolder.currentStyle || getComputedStyle(docHolder,null);

		//first, get the difference between the last position, and the new position
		var topDiff = offset.y - this.lastPos.top;
		var leftDiff = offset.x -this.lastPos.left;

		//console.log(docHolder);
		//then, move the document by that much
		docHolder.style.top = this.stripPx(styleObj.top)+topDiff+"px";
		docHolder.style.left = this.stripPx(styleObj.left)+leftDiff+"px";
		//console.log(docHolder.style);

		//then update the "lastPos" variable
		this.lastPos.top = offset.y;
		this.lastPos.left = offset.x;

	}
	this.endPan = function(e){
		this.isPanning = false;
		$('#theDoc').removeClass("panning");
	}
	this.resetZoom = function(e){
		this.docScale = 1;
		// HACKHACKHACKHACKHACK
		var docHolder = document.getElementById("theDoc");		
		this.adjustScale(this.docScale, docHolder, 0, 0);	
	}

	this.handleMouseDown = function(e){
		if(!e.shiftKey){
			this.startPan(e);
		}else{
			this.beginHighlight(e);
		}
	}

	this.handleMouseMove = function(e){
		if(e.shiftKey && this.isDrawing){
			this.drawHighlight(e);
		}else if(this.isPanning){
			this.panImage(e);
		}
		return;
	}
	this.handleMouseUp = function(e){
		if(this.isDrawing){
			this.isDrawing = false;
			this.endHighlight(e);
		}else if(this.isPanning){
			this.isPanning = false;
			this.endPan(e);
		}
		return;
	}

	this.beginHighlight = function(e){
		//Strategy: for each highlight, create a *new* canvas element. This will help with
		//hooking them up to the actual data entry elements later. Also avoids annoying event
		//bubbling issues.
		$("canvas").remove();
		var theOffset = this.getOffset(e)
		this.currentData.leftOffset = Math.round(theOffset.x*$scope.imageXRatio);
		this.currentData.topOffset = Math.round(theOffset.y*$scope.imageYRatio);
		var thecanvas = document.createElement("canvas");
		$(thecanvas).attr({"width":"800px", "height":"800px"});
		$(thecanvas).css({"position":"absolute", "top":theOffset.y+"px", "left":theOffset.x+"px", "z-index": 1000});
		$(e.currentTarget).append(thecanvas);
		this.currentHighlight = thecanvas;
		this.isDrawing = true;
	}

	this.drawHighlight = function(e){
		var offset = this.getOffset(e);
		var ctx = this.currentHighlight.getContext("2d");
			ctx.strokeStyle = "#ff0000";
			ctx.clearRect(0,0,1000,1000);
			ctx.strokeRect(0,0,offset.x,offset.y);

	}
	this.endHighlight = function(e){
		this.isDrawing = false;
		if(this.currentHighlight != null){
			//remove the canvas element and replace it with a div; initialize a new form option

			/*** DON'T APPEND THE DIVS, UPDATE THE MODEL ****/

			/*
			var theDiv = $("<div>").css({"position":"absolute", "width":e.offsetX+"px", "height":e.offsetY+"px", "top":$(this.currentHighlight).css("top"), "left":$(this.currentHighlight).css("left")}); 
				theDiv.addClass("highlightRect");
			var theLabel = $("<div>").addClass("highlightLabel");
				theLabel.html(this.docModel.length + 1);
				theDiv.append(theLabel);
				$("canvas").remove();
				$(e.currentTarget).append(theDiv);

			*/
			//console.log(this.currentData);
			var theOffset = this.getOffset(e);
			this.currentData.width = theOffset.x*$scope.imageXRatio;
			this.currentData.height = theOffset.y*$scope.imageYRatio;	
			this.currentTranscription.highlight = 1;
			this.currentTranscription.isValid = 1;

			// ok going to see about appending a crop of the image; this could be useful for applying
			// some client-side OCR as a jump-start on transcription?
			// nice idea, but no dice.; OCR not good enough for this.
			// but at least the image cropping part may be useful for transcribers
			/*
			var targetDiv = $('#cropTest');
				targetDiv.append($('<canvas>').attr({id:"imageCrop", width:"400px"}));
      		var context = document.getElementById('imageCrop').getContext('2d');
     		var imageObj = new Image();

		      imageObj.onload = function() {

		      	var imgScaleX = imageObj.width/500;
		      	var imgScaleY = imageObj.height/800;

		        context.drawImage(imageObj, anchorX*imgScaleX, anchorY*imgScaleY, e.offsetX*imgScaleX, e.offsetY*imgScaleY, 0, 0, e.offsetX*imgScaleX, e.offsetY*imgScaleY);
		    
		        var string = OCRAD(context);
				alert(string);
			
		      };
		    
		      imageObj.src = transcription_session.currentDoc.doc_link;
			*/

		}
	}

	this.saveToModel = function(e){
		
		//this.currentTranscription.highlight = theDiv;
		if(this.currentTranscription.fieldName && this.currentTranscription.dataType){
		this.currentTranscription.placement = this.currentData;
		this.currentTranscription.placementStyle = { "position":"absolute", "top": this.currentData.topOffset/$scope.imageYRatio+"px", "left":this.currentData.leftOffset/$scope.imageXRatio+"px", "width":this.currentData.width/$scope.imageXRatio+"px", "height":this.currentData.height/$scope.imageYRatio+"px"};


		this.docModel.push(this.currentTranscription);
		//only remove the canvas element when the thing has been saved, otherwise
		//just let the new action override?!
		$("canvas").remove();
		//removing the reference to the canvas
		this.currentHighlight = null;

		this.currentTranscription = {};
		this.currentData = {};
		}else{

			this.currentTranscription.isValid = 0;
		}
	}

	this.deleteFromModel = function(elemIndex){
		this.docModel.splice(elemIndex, 1);
		//also need to check if this is actually
	}
	this.deleteHighlight= function(e){
		//this.docModel.splice(elemIndex, 1);
		//also need to check if this is actually
		$("canvas").remove();
		//removing the reference to the canvas
		this.currentHighlight = null;

		this.currentTranscription = {};
		this.currentData = {};
	}
	this.submitData = function(){
		console.log(angular.toJson(this.docModel, true));
		alert("Your data has been submitted!");
	}

//this is just for remembering how to force compile
	this.buildDataElement = function(){
		//I should really just show/hide this element

/*
		var theHTML =  '<div><div class="highlightLabel">'+(this.docModel.length+1)+'</div>';
			theHTML += '<span>Field name:</span><input type="text" ng-model="transcriptionCtrl.currentTranscription.fieldName" /><span>Data type: </span><select ng-model="transcriptionCtrl.currentTranscription.dataType" ng-options="opt as opt.label for opt in transcriptionCtrl.fieldOptions"></select><br/>';
			theHTML += '<button ng-click="transcriptionCtrl.saveToModel($event)">save</button>';
			theHTML += '<button ng-click="transcriptionCtrl.deleteFromModel($event)">remove</button></div>';
		var compiled = $compile(theHTML)($scope);	
		$scope.transcriptionCtrl.currentTranscription.dataType = this.fieldOptions[0];
		$("#workingHighlightHolder").append(compiled);
	*/

	}


	//set some document defaults. 
	
	$(document).keyup(function(e) {
		if (e.keyCode == 27) {
			$("canvas").remove();
		} 
	});

	$(document).on("dragstart", "img", function() {
 		return false;
	});


} ] );


/*
app.directive('modelHolder', [function() {
 return function(scope, elm, attrs) {   	
       attrs.$observe('index', function() {
                console.log("something happened");
            });
    }
}]);
*/

app.directive('docImage', [function() {
    return function(scope, elm, attrs) {
      elm.on('load', function()
      {      	
        scope.imageXRatio = this.naturalWidth/this.width;
        scope.imageYRatio = this.naturalHeight/this.height;
        scope.$apply();
      });
    };
}]);



})();