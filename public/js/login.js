$(function() {

    $('#login-form-link').click(function(e) {
		$("#login-form").delay(100).fadeIn(100);
 		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
	$('#register-form-link').click(function(e) {
		$("#register-form").delay(100).fadeIn(100);
 		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});

	$("#login-submit").on('touchend click', function(event) {
		event.stopPropagation();
		event.preventDefault();
		validate_login();
	});

	$("#register-submit").on('touchend click', function(event) {
		event.stopPropagation();
		event.preventDefault();
		validate_create();
	});

});



function validate_create(){
	var obj = new Object();
	var error = false;

	if(!$("#username-create").val()){
		error = true;
		$("#username-create").attr("placeholder", "Username is Required!");
	} else { 
		obj['username'] = $("#username-create").val();
	}
	
	if(!$("#password-create").val()){
		error = true;
		$("#password-create").attr("placeholder", "Password is Required!");
	} else { 
		obj['password'] = $("#password-create").val();
	}
	
	if(!$("#first-name").val()){
		error = true;
		$("#first-name").attr("placeholder", "First Name is Required!");
	} else { 
		obj['firstName'] = $("#first-name").val();
	}
	
	if(!$("#last-name").val()){
		error = true;
		$("#last-name").attr("placeholder", "Last Name is Required!");
	} else { 
		obj['lastName'] = $("#last-name").val();
	}
	
	obj['skills'] = new Array();

	if($("#cpr").is(":checked")){
		obj['skills'].push("cpr");
	}

	if($("#first-aid").is(":checked")){
		obj['skills'].push("first aid");
	}

	if($("#driver").is(":checked")){
		obj['skills'].push("driver");
	}

	console.log(obj);




	//Now we have the object, time to send it to the server
	if (!error){ 
		$.post( "https://172.20.72.2:8080/createaccount", obj, function(data){
			if (data === 'done'){
				window.location.href = "/personnel";
				//$.post("https://localhost:8080/personnel", obj['username']);		
			}
		});
		console.log("preparing to load index.html");
		//load next page	
	}	
}

function validate_login(){
	var obj = new Object();
	var error = false;

	if(!$("#username").val()){
		error = true;
		$("#username").attr("placeholder", "Invalid Username");
	} else { 
		obj['username'] = $("#username").val();
	}
	
	if(!$("#password").val()){
		error = true;
		$("#password").attr("placeholder", "Invalid Password");
	} else { 
		obj['password'] = $("#password").val();
	}

	console.log(obj);

	var string;
	if (screen.width > 480){
		string = "localhost";
	} else {
		string = "10.0.0.182";
		// string = "172.20.72.2";
	}

	//Now we have the object, time to send it to the server 

	if (!error){
		var address = "https://" + string + ":8080/validatelogin";
		$.post(address, obj, function(data){
			if (data === 'success'){
				if ($("#prevJobs").is(':checked')){
					window.location.href = "/previousJobs";
				} else {
					//window.location.href = "/personnel";
					// window.location.href = "/media";
					window.location.href = '/select';
				}
			} else if (data === 'fail'){
				alert('Incorrect username and/or password');
			}
		});
	}

}



