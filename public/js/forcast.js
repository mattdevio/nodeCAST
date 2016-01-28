$(document).ready(function(){

	// Focus Address field on load
	$('#address').focus();

	$('#address').keydown(function(){
		$('form p.alert').css('display', 'none');
		$('form p.alert').html("**Address input required**");
	});

	$('form.address').submit(function(e){
		e.preventDefault();

		if ( $('#address').val().trim() === "" ){
			$('form p.alert').css('display', 'block');
			$('#address').focus();
			return;
		}
		$.post('/address', {'address': $('#address').val()}, writeForecast);
		this.reset();
	});

});

function writeForecast(results){

	if (typeof results === "string"){
		$('form p.alert').html(results);
		$('form p.alert').css('display', 'block');
	} else if (typeof results === "object") {
		// Hide the form element since its no longer needed
		$('div.note').slideUp(200);
		// Move page up so it all fits on screen
		$('header').animate({'margin-top': "-20px"}, 200);

		// Set current
		$('#results h3').html( results.full_address );
		$('.right-now table tbody tr:nth-child(1) td:nth-child(2)').html( results.current.temp );
		$('.right-now table tbody tr:nth-child(2) td:nth-child(2)').html( results.current.feels );
		$('.summary span').html( results.current.summary );
		$('.humidity span').html( humid(results.current.humidity) );

		// Set 5 Day Forcast
		for( i=0; i<5; i++ ){
			var myDate = datemaker(results.daily[i].time);
			var myHigh = Math.round(results.daily[i].max);
			var myLow = Math.round(results.daily[i].min);
			var mySum = results.daily[i].summary;
			$('.five-day .day:nth-child('+(i+2)+') div:nth-child(1)').html(myDate);
			$('.five-day .day:nth-child('+(i+2)+') div:nth-child(2)').html("High of " + myHigh);
			$('.five-day .day:nth-child('+(i+2)+') div:nth-child(3)').html("Low of " + myLow);
			$('.five-day .day:nth-child('+(i+2)+') div:nth-child(4)').html(mySum);
		}

		// Now that all content is set, diesplay it
		$('#results').slideDown(200);
	}
}


function humid(value){
	return Math.round(value*100).toString() + "% Humidity";
}

function datemaker(date){
	var myDate = new Date(date);
	var dateString = "";
	dateString += myDate.getFullYear() + "/";
	dateString += (myDate.getMonth() + 1) + "/";
	dateString += myDate.getDate();
	return dateString;
}
