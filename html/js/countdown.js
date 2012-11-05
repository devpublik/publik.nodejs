//<![CDATA[

// SET TARGET DATE HERE
var target = 'June 12, 2012';

// That's all you need to do.

/************************************************************************/
// Initial digit position for each number graphic
// 9-0
var initialPosCountdown = [-4728, -4202, -3677, -3152, -2626, -2101, -1575, -1050, -525, 0];
// 5-0 (first minute and second digit)
var initialMidPosCountdown = [-2626, -2101, -1575, -1050, -525, 0];
// 2-0 (first hour digit)
var initialSmallPosCountdown = [-1050, -525, 0];
var classNamesCountdown = [ 'heures', 'minutes', 'secondes'];
var idNamesCountdown = [ 'h', 'm', 's'];
var animationFramesCountdown = 5;
var frameShiftCountdown = 88;

//// If no number in URL (?date=1/1/11), then use default one
//target = (window.location.search == "") ? target : window.location.search.substring(6);

//// Starting numbers
//var nowCountdown = new Date().getTime();
//var endCountdown = Date.parse(target);
//// Fix if date is in past
//if (endCountdown < nowCountdown){
//	target = 'June 12, 2011';
//	endCountdown = Date.parse(target);
//}

var theDiffStringCountdown = dateFormat(new Date(), "isoTime",false);

// Increment (count one second at a time)
var incrementCountdown = 1000;
// Pace of counting in milliseconds (refresh digits every second)
var paceCountdown = 1000;

// Function that controls counting
function doCountCountdown(){
	var now = new Date();
	
	var beforeDate = now-1000;
	var y =dateFormat(now, "isoTime",false);
	var x = dateFormat(beforeDate, "isoTime",false);

	
	// For debugging
	//console.log(dateFormat(now,"isoTime"));
	digitCheckCountdown(x,y);
}

// This checks the old value vs. new value, to determine how many digits need to be animated.
function digitCheckCountdown(x,y){
	var a = x.split(':');
	var b = y.split(':');
	for (var i = 0, c = a.length; i < c; i++){
		if (a[i].length < 2) a[i] = '0' + a[i];
		if (b[i].length < 2) b[i] = '0' + b[i];
		var countA = a[i].toString().length;
		var countB = b[i].toString().length;
		if (countB < countA) removeDigitCountdown(i, countB);
		for (var j = 0; j < countB; j++){
			if (b[i].charAt(j) != a[i].charAt(j)){
				var which = idNamesCountdown[i] + j;
				animateDigitCountdown(which, a[i].charAt(j), b[i].charAt(j));
			}
		}
	}
}



// Looks in correct array to get the digit's position
function getPosCountdown(id, digit){
	if (id == 's0' || id == 'm0'){
		return initialMidPosCountdown[digit];
	}
	else if (id == 'h0'){
		return initialSmallPosCountdown[digit];
	}
	else{
		return initialPosCountdown[digit];
	}
}

// Animation function
function animateDigitCountdown(which, oldDigit, newDigit){
	var speed = 80;
	var pos = getPosCountdown(which, oldDigit);
	var newPos = getPosCountdown(which, newDigit);
	// Each animation is 5 frames long, and 103px down the background image.
	// We delay each frame according to the speed above.
	for (var k = 0; k < animationFramesCountdown; k++){
		pos -= frameShiftCountdown;
		if (k == (animationFramesCountdown - 1)){
			$("#" + which).delay(speed).animate({'background-position': '0 ' + pos + 'px'}, 0, function(){
				// At end of animation, shift position to new digit.
				$("#" + which).css({'background-position': '0 ' + newPos + 'px'}, 0);
			});
		}
		else{
			$("#" + which).delay(speed).animate({'background-position': '0 ' + pos + 'px'}, 0);
		}
	}
}

// Remove digit
function removeDigitCountdown(i,count){
	$("li#" + idNamesCountdown[i] + count).remove();
}

// Sets the correct digits on load
function initialDigitCheckCountdown(initial){
	// Creates the html
	var a = initial.split(':');
	for (var i = 0, c = a.length; i < c; i++){
		if (a[i].length < 2) a[i] = '0' + a[i];
		var count = a[i].toString().length;
		var html = '<div class="set"><ul class="' + classNamesCountdown[i] + '">';
		var bit = count;
		for (var j = 0; j < count; j++){
			bit--;
			html += '<li id="' + idNamesCountdown[i] + j + '"></li>';
			if (bit != 0 && bit != (count) && bit % 3 == 0) html += '<li class="comma"></li>';
		}
		html += '</ul>';
			//	<h2>' + classNamesCountdown[i].toUpperCase() + '</h2>';
		// If you don't like the ':' separator, remove the following line
		if (i != 2) html += '</div><div class="separator">:</div>';
		//
		$("#countdown-blog").append(html);
	}
	// Sets digits to the right number
	for (var n = 0, cn = a.length; n < cn; n++){
		count = a[n].toString().length;
		for (var m = 0; m < count; m++){
			var thisID = idNamesCountdown[n] + m;
			var thisPos = getPosCountdown(thisID, a[n].charAt(m));
			$("#" + idNamesCountdown[n] + m).css({'background-position': '0 ' + thisPos + 'px'});
		}
	}
}



//]]>