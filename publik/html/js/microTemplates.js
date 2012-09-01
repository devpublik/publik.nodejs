// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
  
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
      
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
    
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();

String.prototype.trim = function(){return 	(this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, ""))};

String.prototype.startsWith = function(str) {return (this.match("^"+str)==str)};


$(document).ready(function(){
	$("body").append("<div id=\"templates\" ></div>");
	$.get("/templates.html",function(data){
		$("#templates").html(data );
		
		$(".jstemp").each(function(){
			var emplacement =$("#"+this.id.replace("Template",""));
			if(emplacement.length > 0){
				emplacement.html($(this).html());
			}
		});
		
		// Gestion du menu.
		$("#menu").css("height","800px").css("display","inline");
		var path =  window.location.href;
		$(".lienMenuPrincipal").each(function(){
			var tmpPath = $(this).children("a")[0].href;
			
			if(!path.startsWith(tmpPath)){
				$(this).removeClass("active");
			}
		});
		
		
		$.get(
			 "/services",{action:"news"},function( html ) {
				 console.log(html);
			  var items =	$(html).find("item");
				if(items.length> 0){
					$title = $(items[0]).find("title");
					$("#newsFeed").html($title.text());
				}
			},"xml");
	});
	
});