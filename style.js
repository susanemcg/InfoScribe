		$(function(){
			var header_str = "";
			header_str += "<div id=\"header\">";
			header_str += 	"<div class=\"contentarea\">";
			header_str += 		"<p>";
			header_str += 			"InfoScribe";
			if(id){
				header_str += 		" | Hello, "+user_arr[id].username+"!";
			}
			header_str += 		"</p>";
			header_str += 	"</div>";
			header_str += "</div>";
			$("#wrapper").html( header_str );

			var main_str = "";
			main_str += "<div id=\"main\">";
			main_str += 	"<div class=\"contentarea\">";
			// #side
			main_str += 		'<div id="side">';
			main_str += 		'</div>';
			// #progress
			main_str += 		'<div id="progress">';
			if(id && !user_arr[id].organization){
				main_str += 	'	<div class="bar">';
				main_str += 	'		<a href="infoscriber0_dashboard.htm">1: select a project</a>';
				main_str += 	'	</div>';
				main_str += 	'	<div class="bar">';
				main_str += 	'		<a href="infoscriber1_transcribe.htm">2: transcribe</a>';
				main_str += 	'	</div>';
				main_str += 	'	<div class="bar">';
				main_str += 	'		3: brag &amp; repeat';
				main_str += 	'	</div>';
			}
			else{
				main_str += 	'	<div class="bar">';
				main_str += 	'		<a href="journalist0_dashboard.htm">monitor projects</a>';
				main_str += 	'	</div>';
				main_str += 	'	<div class="bar">';
				main_str += 	'		<a href="journalist1_start_project.htm">1: start a new project</a>';
				main_str += 	'	</div>';
				main_str += 	'	<div class="bar">';
				main_str += 	'		<a href="journalist2_select_fields.htm">2: select fields</a>';
				main_str += 	'	</div>';
			}
			if(infoscriber0_dashboard){
				main_str += 	'	<div class="button">';
				main_str += 	'		<p><a href="infoscriber1_transcribe.htm">Just give me a document already. I want to InfoScribe!</a></p>';
				main_str += 	'	</div>';
			}
			main_str += 		'</div>';
			// #content
			main_str += 		'<div id="content">';
			main_str += 		'</div>';
			//
			main_str += 	"</div>";
			main_str += "</div>";
			$("#wrapper").append( main_str );
			if(progress){
				$("#progress .bar:nth-child("+progress+")").addClass("active");
			}

			var footer_str = "";
			footer_str += "<div id=\"footer\">";
			footer_str += 	"<div class=\"contentarea\">";
			footer_str += 		"<p>";
			footer_str += 			"InfoScribe | about | contact";
			footer_str += 		"</p>";
			footer_str += 	"</div>";
			footer_str += "</div>";
			$("#wrapper").append( footer_str );
		});