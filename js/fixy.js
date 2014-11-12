$(function() {
        
    //Insert code here
		
    var my_location;

    getCurrentLocation();

    

	// Create Apigee client and collections
	var client = new Apigee.Client({
		orgName: 'mmitchell413',
		appName: 'fixy'
	});
	
	var reports = new Apigee.Collection({ 'client':client, 'type':'reports' });
	var users = new Apigee.Collection({ 'client':client, 'type':'users' });
	var cities = new Apigee.Collection({ 'client':client, 'type':'cities' });

	var nearbyReports = new Apigee.Collection({
		"client": client,
		"type": "reports",
		"qs": {
			"limit":20,
			"ql": "location within 150000"
		}
	})

	var appUser;



	client.getLoggedInUser(function (err, data, user){
    	if(err){
    		window.location = "#page3";
    	}else{
    		if(client.isLoggedIn()){
    			appUser = user.serialize();
    			alert(appUser.name);
    		}else{
    			window.location = "#page3";
    		}
    	}
    });

	$("#save-current-location").click(function(){
		saveLocation();
	});

	/*
		Main function for submitting report. Gets all text and images from user input
		and submits to Apigee database. 
	
		Creates initial JSON object for report.
	*/
	$("#submit-report-submit").click(function(){
		var title = $('#submit-report-title');
		var description = $('#submit-report-description');
		var priority;
		var stopSubmission = false;

		if($('#use-current-location').is(':checked')){
			alert("Use current location checked");
		}else if($('#use-saved-location').is(':checked')){
			alert("Use saved location is checked.");
		}else{
			stopSubmission = true;
		}

		if($('#low-priority').is(':checked')){
			priority = "Low";
		}else if($('#medium-priority').is(':checked')){
			priority = "Medium";
		}else if($('#high-priority').is(':checked')){
			priority = "High";
		}else{
			stopSubmission = true;
			alert("No priority selected");
		}

		if($('submit-report-title').val() == null){
			stopSubmission = true;
			alert('Title field incomplete');
		}
		
		if($('submit-report-description').val() == null){
			stopSubmission = true;
			alert('Description field incomplete');
		}

		var a = {
			"title": title.val(),
			"description": description.val(),
			"priority": priority,
			"up": 0,
			"down": 0,
			"location": null
		};

		if(!stopSubmission){
			reports.addEntity(a, function(error, response){
				if(error){
					alert("submission failed");
				}else{
					//clear values after submitting report
					title.val("");
					description.val("");
					$('label[for="low-priority"]').removeAttr("checked");
					$('label[for="medium-priority"]').removeAttr("checked");
					$('label[for="high-priority"]').removeAttr("checked");
					$('label[for="low-priority"]').removeClass('ui-btn-active');
					$('label[for="medium-priority"]').removeClass('ui-btn-active');
					$('label[for="high-priority"]').removeClass('ui-btn-active');
					$('label[for="low-priority"]').removeClass('ui-radio-on');
					$('label[for="medium-priority"]').removeClass('ui-radio-on');
					$('label[for="high-priority"]').removeClass('ui-radio-on');
					$('label[for="low-priority"]').addClass('ui-radio-off');
					$('label[for="medium-priority"]').addClass('ui-radio-off');
					$('label[for="high-priority"]').addClass('ui-radio-off');
					alert('report submitted successfully!');
				}
			});
		}else{
			alert("submission failed: form not filled out");
		}
	});
	
	//getItem(reports);

	/*
		Main function for logging user in. Binds click event to submit button of log in form,
		then executes logIn function. Refer to log in function for more details.
	*/
	$("#page3").on("click", "#login-submit", function(){
		var username = $("#login-username");
		var password = $("#login-password");

		fixyLogin(username.val(), password.val());

		username.val("");
		password.val("");
	});

	$("#new-user-page").on("click", "#new-user-submit", function(){
		registerUser();


	});

	// Disable sliders from user input for city report card page	
	$('#slider3').slider({disabled: true});
	$('#slider4').slider({disabled: true});	

	getNearbyReports();

	/*
	Main function for fetching items from Apigee server. Uses UUID to determine correct item.
	*******************************************
	collection : The Apigee collection to be searched for item
	uuid : The Apigee UUID of the item searched for

	return : JSON object of searched for item, or if item is not found, error message with item not found error. 
	*/

	function getItem(collection, uuid, err){
		collection.fetch(
			function(err, data){
				if (err){
					alert("read failed");				
				}else{
					var found = false;
					while(collection.hasNextEntity()){
						var a = collection.getNextEntity();
						if(uuid == a.get('uuid')){
							return a;
							found = true;
						}
					}
					if(!found){
						console.log("no item found");
					}
				}
			}
		);
	}

	/*
		Main function for writing items to Apigee collections.
		*******************************************
		report : JSON object created from user input

		return : Boolean illustrating whether write was a success or failure
	*/
	function writeItem(collection, writeItem){
		
	}

	function getReportLocation(report){
		
	}

	/*
		Main function for logging users in to app
		*******************************************
		No variables created

		return : boolean indicating whether login was a success or failure
	*/

	function fixyLogin(username, password){
		client.login(username, password, function(err, data, user){
			if(err){
				alert("There was a problem logging you in");
				console.log(err);
			}else{
				window.location = "#submit-report-page";
			}
		});
	}

	/*
		Main function for submitting a report to Apigee service
		*******************************************
		location : users location based on current location/saved location check
		report : JSON object of the report to be submitted

		return : boolean indicating whether submission was a success or failure
	*/
	function submitReport(){

		// check if using current or saved location and set location variable accordingly
		var location;
		if($("#use-current-location").checked()){
			location = getCurrentLocation();
		} else if ($("#use-saved-location").checked()){
			location = getSavedLocation();
		}

		// create report JSON object to be submitted
		var report = {
			// get user input from fields
			"title": $("#submit-report-title").val(),
			"description": $("#submit-report-description").val(),
			"location": $("#submit-report-title").val(),
			"image": null,
			"up": 0,
			"down": 0,
			"priority": $("#submit-report-prioriy").val()
		}
	}

	/*
		Main function for getting a users current location with Google Maps API
		*******************************************
		defaultLatLng : Location to default to if no network/geolocation support available. Defaults to Hollywood, CA
		location : User's location (Google maps LatLng object)

		return : Google maps LatLng object of current location
	*/

	function getCurrentLocation(){
		navigator.geolocation.getCurrentPosition(geoSuccess, geoFailure);

	    function geoSuccess(e) {
	        console.log(e)
	        my_location = e.coords;
	        var location = new Google.maps.LatLng(my_location.latitude, my_location.longitude);
	        return location;
	        // loadItems(); <-- loadItems now called after login
	    }

	    function geoFailure() {
	    	alert("Unable to access your geolocation");
	    }
 	}
	
 	/*
		Main function for saving a users location to Apigee server.
		*******************************************
		location : Calls getCurrentLocation() to obtain the user's current geolocation
		lat : User's geographic latitude
		long : User's geographic longitude
		savedLocation : JSON object with user's long and lat stored on Apigee server

		return : boolean indicating whether submission was success or failure
	*/
	function saveLocation(){
		var location = getCurrentLocation(),
		lat = location.latitude,
		lng = location.longitude;
		
		var savedLocation = {
			"latitude": lat,
			"longitude": lng
		}
	}

	function getSavedLocation(){
		
	}

	function getNearbyReports(){
		$("#nearby-you-list").empty();
		reports.fetch(
			function(err, data){
				if (err){
					alert("read failed");				
				}else{
					while(reports.hasNextEntity()){
						var report = reports.getNextEntity();
						$("#nearby-you-list").append(
							"<div class='report-header' data-role='collapsible'><h3>" +
							report.get('title') +
							"</h3><div data-controltype='htmlblock'><p>" +
                     		report.get('description') +
                     		"</p><ul class='report-details'><li><p><strong>Location:</strong>" +
                            report.get('location') + 
                            "</p></li></ul><div class='report-grid'><h2>Priority</h2><p>" +
                          	report.get('priority') +
                          	"</p></div><div class='report-grid'><h2>Status</h2><p>" +
                          report.get('status') + 
                          "</div></div><div data-role='fieldcontain' data-controltype='radiobuttons'><fieldset data-role='controlgroup' data-type='horizontal' data-mini='true'><input id='radio9' name='" 
                          + report.get('title') + 
                          "' value='radio1' type='radio'><label for='radio9'>Vote Up</label><input id='radio10' name='" + report.get('title') + "' value='radio6' type='radio'><label for='radio10'>Vote Down</label></fieldset></div></div>"
						)
					}
				}
			}
		);
	}

	/*
		Main function for registering a user to Apigee backend
		*******************************************

	*/

	function registerUser(){
		var username = $("#register-username").val();
		var email = $("register-email").val();
		var password = $("register-password").val();
		var passwordRepeat = $("register-password-repeat").val();

		if(password == passwordRepeat){
			var options = {
				"username":username,
				"type":"users"
			}

			client.getEntity(options, function(error, entity, data){
			    if (error) {
			        // If there's an error, it could be because the username 
			        // wasn't found. In that case, it's safe to add
			        // a user with that name.
			        // var errorMessage = data["error"];
			        // if (errorMessage == "service_resource_not_found"){
			            // Call an SDK method to create a new user with
			            // data collected from the form.
			            client.signup(username, password, email, "Matt", function (error, entity, data) {
			                if (error) {
			                    // Log or display a message.
			                    alert("Registration error");
			                } else {
			                    // Refresh the user list to include the new user.
			                    getUsers();

								fixyLogin($("register-username"), $("register-password"));

								$("register-username").val("");
								$("register-email").val("");
								$("register-password").val("");
								$("register-password-repeat").val("");


			                    alert("Registration complete");
			                }
			            });
			        // }
			    } else {
			        // Display a message because there's already a user with that username.
			    	alert("There is already a user with that username.");
			    }
			});

		}else{
			alert("Passwords do not match");
		}
	}

	function loadCity(cityName){
		$("#percent-complete-city-name").empty();
		cities.fetch(
			function(err, data){
				if(err){
					alert("city load failed");
				}else{
					while(cities.hasNextEntity()){

						var city = cities.getNextEntity();

						if(city.get('name') == cityName){
							var completed = city.get('completed');
							var totalReports = city.get('reports');
							var avgCompletionTime = city.get('avgCompletionTime');
							var percentile = city.get('percentile');
							var completedRatio = (completed / totalReports) * 100;

							// Clear out appropriate fields on city report card
							$('#city-name').empty();
							$('#percent-complete-city-name').empty();
							$('#percent-complete-percent').empty();
							$('#percentile-city-name').empty();
							$('#percentile-percent').empty();
							$('#avg-completion-time').empty();
							$('#total-completed').empty();

							// Refill appropriate fields from city object retrieved from backend
							$('#city-name').append(cityName);
							$('#percent-complete-city-name').append(cityName);
							$('#percent-complete-percent').append(completedRatio);
							$('#percentile-city-name').append(cityName);
							$('#percentile-percent').append(percentile);
							$('#avg-completion-time').append(avgCompletionTime);
							$('#total-completed').append(completed);

							// Set slider value
							$('#slider3').val(completedRatio);
							$('#slider4').val(percentile);
							$('#slider3').slider('refresh');
							$('#slider4').slider('refresh');
						}
					}
				}
			}
		)
	}

	function getUsers(){	
		var users = new Apigee.Collection({ 'client':client, 'type':'users' });
		return users;
	}

	function getCities(){
		var cities = new Apigee.Collection({ 'client':client, 'type':'cities' });
		return cities;
	}

	function getReports(){
		var reports = new Apigee.Collection({ 'client':client, 'type':'reports' });
		return reports;
	}

	getNearbyReports();
	
	loadCity("Richardson");

});
		

