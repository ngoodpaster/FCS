

function openNav(socket_id) {
	$("#mySidenav").css("width", "25vw");
    $("#team").css("width", "75vw");
    $(".card-title").text(socket_id);
    
    $("#callButton").unbind('click');

    $("#callButton").click(function(){
		var min = 10;
		var max = 1000;
		var num = Math.floor(Math.random() * (max - min + 1)) + min;
		memberTemplate("griffin" + num);
	});
}

function closeNav() {
    $("#mySidenav").css("width", "0");
    $("#team").css("width", "100vw");
    //document.getElementById("main").style.marginLeft= "0";
    document.body.style.backgroundColor = "white";
}

$(document).ready(function() {
	$(".btn-pref .btn").click(function () {
	    $(".btn-pref .btn").removeClass("btn-primary").addClass("btn-default");
	    // $(".tab").addClass("active"); // instead of this do the below 
	    $(this).removeClass("btn-default").addClass("btn-primary");
	});
});

$("#team").click(function(){
	closeNav();
});

function memberTemplate(user){
	// Here is where we will need the socketid. We will make the socket id into the 
	// id for each member. In addition, we will have to search the database for the
	// team member to get the relevant information for them. We can also just load all 
	// the team data from the database and store it on the client side at the beginning so we don't have 
	// to worry about making a bunch of calls to the database
	var container = $("<div> </div>").addClass("circle").addClass("member").attr("id", user.username).css("border-color", getRandomColor());
	container.append("<img src='griffin.jpg' alt='firefighter' class='headshot' >")
	var desc = $("<p> </p>").text(user.firstName);
	container.append(desc);
	$("#team").append(container);

	$("#" + user.username).click(function(){ 
		openNav(this.id);
	});
}  


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
