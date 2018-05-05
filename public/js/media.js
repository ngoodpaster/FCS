var address;
if (screen.width > 480){
  address = "localhost";
} else {
  // address = "172.20.72.2";
  address = "192.168.4.1";
}

var imageCapture;
var stream;
var mediaRecorder;
var recordedChunks;
var options;
var currBlob;
var blobCount = 0;
var endFolder;

$(document).ready(function(){
  loadMedia();
});

//Getting user media

navigator.mediaDevices.getUserMedia({video: true, audio:true})
  .then(gotMedia)
  .catch(error => console.error('getUserMedia() error:', error));

function gotMedia(mediaStream) {
  stream = mediaStream;
  document.querySelector('video').srcObject = mediaStream;
  //create the image capture object 
  const mediaStreamTrack = mediaStream.getVideoTracks()[0];
  imageCapture = new ImageCapture(mediaStreamTrack);
  console.log(imageCapture);
}


//Image capture code 

$("#capture-photo-button").click(capturePhoto);

function capturePhoto(){
	//console.log("display value:" + $("#capture").attr('display'))
	if($("#capture").css('display') == 'none'){
		$("#view").css('display', 'none');
		$("#capture").css('display', 'block');
	} else { 
		capture();
	}
}

var blobToBase64 = function(blob, cb) {
  var reader = new FileReader();
  reader.onload = function() {
    var dataUrl = reader.result;
    var base64 = dataUrl.split(',')[1];
    cb(base64);
  };
  reader.readAsDataURL(blob);
};

function capture(){
  //var blob = imageCapture.takePhoto();

	imageCapture.takePhoto()
	  .then(function(blob){
      console.log(blob);
      currBlob = blob;
      console.log('blob size (in bytes)')

      console.log(currBlob.size)

      blobToBase64(blob, function(base64){ // encode
        var update = {'blob': base64};
        $.post('https://' + address + ':8080/storeimage', update,  function(data){
            console.log("success");
            loadMedia();
        });
      });  
    }).catch(error => console.error('takePhoto() error:', error));

}

function loadMedia(){

  $("#photo-gallery").empty();

  console.log('loading');

  $.get('https://' + address + ':8080/loadmedia', function(data){
    console.log(data);
    console.log("size " + data.size);
    console.log("len " + data.length);
    var filenames = data.filenames;
    endFolder = data.endFolder;
    //var blob = b64toBlob(data, 'image/jpeg');
    //var blob = new Blob([data], {type: 'image/png'})
    //var blobUrl = URL.createObjectURL(blob);
    
    for (var i = 0 ; i < filenames.length ; i++){
      console.log("hello")  
      galleryTemplate(filenames[i],i);//blob, blobCount++);
    }

 });
}

// function b64toBlob(b64Data, contentType, sliceSize) {
//   contentType = contentType || '';
//   sliceSize = sliceSize || 512;
  
//   //b64Data = window.btoa(unescape(encodeURIComponent( b64Data )));
//   //var byteCharacters = decodeURIComponent(escape(window.atob(b64Data)));
//   b64Data = btoa(b64Data)
//   var byteCharacters = window.atob(b64Data);
//   var byteArrays = [];

//   for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
//     var slice = byteCharacters.slice(offset, offset + sliceSize);

//     var byteNumbers = new Array(slice.length);
//     for (var i = 0; i < slice.length; i++) {
//       byteNumbers[i] = slice.charCodeAt(i);
//     }

//     var byteArray = new Uint8Array(byteNumbers);

//     byteArrays.push(byteArray);
//   }
//   var blob = new Blob([byteArrays], {type: 'image/png'});
//   console.log(blob.size)
//   console.log(blob)
//   return blob;
// }

// function generateBlob(blob){
//   console.log(blob);
//   currBlob = blob;
//   console.log(currBlob)
//   $.post("https://" + address + ":8080/storemedia", currBlob, function(data){
//       if (data === 'done'){
//         console.log('success');
//         loadMedia();
//         return createImageBitmap(blob);
//       }  
//   });
// }

// function response(blobArray) {
//   $('#photo-gallery').empty();
//   for (var i = 0 ; i < blobArray.size ; i++){
//     console.log(blobArray[i]);
//     //var byteCharacters = atob(b64Data);


//     galleryTemplate(blobArray[i], i);
//   }
// }

function galleryTemplate(filename, i){
  console.log("generating template");
  // create the imageUrl from the blob 

  // var urlCreator = window.URL || window.webkitURL;
  // var imageUrl = urlCreator.createObjectURL(blob);
  // console.log(imageUrl)
  //document.querySelector("#image").src = imageUrl;

  // create the container to hold the image 
  var type;
  var container = $("<div> </div>").addClass("galleryItem").attr("id", 'item' + i);;
  if (filename.endsWith('.png')){
    type = 'image';
    // set source to be the filename from server
    container.append("<img class='galleryImg' src='https://" + address + ":8080/media_files/" + endFolder + '/' + filename + "'/>");
  } else {
    type = 'video';
    // set source to be the filename from server
    var video = $("<video> </video>").addClass("galleryImg").attr("id", type + i).attr('controls','');
    video.append("<source src='https://" + address + ":8080/media_files/" + endFolder + '/' + filename + "' type='video/webm'>");
    container.append(video);
    //container.append("<source src='https://" + address + ":8080/media/" + filename + "' type='video/mp4'>");
    //container.append("<source src='https://" + address + ":8080/media/" + filename + "' type='video/ogg'>");
  }
  // append the new photo to the photo gallery
  $("#photo-gallery").append(container);
}

// function drawCanvas(canvas, img) {
//   //console.log("This is the canvas object: " + canvas.width);
//   canvas.width = getComputedStyle(canvas).width.split('px')[0];
//   canvas.height = getComputedStyle(canvas).height.split('px')[0];
//   let ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
//   let x = (canvas.width - img.width * ratio) / 2;
//   let y = (canvas.height - img.height * ratio) / 2;
//   canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
//   canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
//       x, y, img.width * ratio, img.height * ratio);
// }

//Video capture code 

let shouldStop = false;
let stopped = true;


$("#capture-video-button").click(captureVideo);

function captureVideo(){
	if(stopped == false){
		shouldStop = true;
	} else if (stopped == true){
		$( "#capture-video-button > span" ).removeClass( "glyphicon-facetime-video" ).addClass( "glyphicon-stop" );
		//stopped = false;
		handleSuccess(stream);
	}
}

function handleSuccess(stream) {
    options = {mimeType: 'video/webm'};
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, options);
    console.log("im in here! handle success" + stream);
    shouldStop = false; 

    mediaRecorder.ondataavailable = function(e) {
      if (e.data.size > 0) {
      	console.log("data!");
        recordedChunks.push(e.data);
      }
      if(shouldStop === true && stopped === false) {
        mediaRecorder.stop();
        stopped = true;
      }
    };

    mediaRecorder.onstop = function(e) {
      var video_blob = new Blob(recordedChunks, {type: 'video/webm'});

      blobToBase64(video_blob, function(base64){ // encode
        var update = {'blob': base64};
        $.post('https://' + address + ':8080/storevideo', update,  function(data){
          console.log("success");
          loadMedia();
        });
      });  


      console.log(video_blob);
      $( "#capture-video-button > span" ).removeClass( "glyphicon-stop" ).addClass( "glyphicon-facetime-video" );
      stopped = true;
    };

    mediaRecorder.onstart = function(e){
    	stopped = false;
    }

    console.log(mediaRecorder);
    mediaRecorder.start(20);
    
  };

function closeCamera(){
	$("#capture").css("display", "none");
	$("#view").css("display", "block");
	$("#close-button").css("display", "none");
	$('#capture-video-button').unbind('click');
	$('#capture-photo-button').unbind('click');
	$("#capture-video-button").click(openCamera);
	$("#capture-photo-button").click(openCamera);
}

function openCamera(){
	$("#view").css("display", "none");
	$("#capture").css("display", "block");
	$("#close-button").css("display", "block");
	$('#capture-video-button').unbind('click');
	$('#capture-photo-button').unbind('click');
	$("#capture-video-button").click(captureVideo);
	$("#capture-photo-button").click(capturePhoto);
}

