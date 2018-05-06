var jobs;
var convoFiles;

var address = "192.168.4.1";
/*if (screen.width > 480){
  address = "localhost";
} else {
  // address = "172.20.72.2";
  address = "192.168.4.1";
}
*/
function updateMedia(){
  $("#image-gallery").empty();
  $("#image-carousel").empty();
  //this doesn't seem to be working
  $('#accordion').empty()
  //clear video page
  $('#video-container').empty();
  var folder = $('#selected_job').val();
  console.log('folder: ' + folder)
  var obj = new Object();
  obj['folder'] = folder;
  $.post('https://' + address + ':8080/loadprevmedia', obj, function(data){
    var filenames = data.filenames;
    console.log(filenames);
    var picCount = 0;
    for(var i = 0; i < filenames.length ; i ++){
    
      if (filenames[i].endsWith('.png')){
        carouselTemplate(picCount,'https://' + address + ':8080/media_files/' + folder + '/' + filenames[i]);
        picCount++;
      } else if (filenames[i].endsWith('.webm')){
        videoTemplate('https://' + address + ':8080/media_files/' + folder + '/' + filenames[i]);
      }
    }
    
    if (picCount == 0){
      carouselTemplate(0, 'https://' + address + ':8080/js/no_media.png');
    }
  });  


  $.post('https://' + address + ':8080/loadprevconvos', obj, function(data){
    console.log('convo data')
    console.log(data.filenames.length)
    console.log(data.filenames[0])
    console.log(data.filenames[1])
    convoFiles = data.filenames;
    console.log(data.filenames)
    console.log(convoFiles)

    var src1,src2,src1details,src2details;
    var tempConvoFiles = convoFiles.slice();
    var convoCount = 0;
    console.log(tempConvoFiles)
    console.log(tempConvoFiles.length)
   
    createConversations(folder);
/*    while (convoFiles.length != 0){
      src1 = convoFiles[convoFiles.length - 1];
      convoFiles.pop();
      src1details = src1.split('_');
      for (var i = 0 ; i < convoFiles.length; i++){
        src2 = convoFiles[i];
        src2details = src2.split('_');
        if (src1details[2] == src2details[2] && src2details[0] == src1details[1] && src1details[0] == src2details[1]){
          convoFiles[i] == convoFiles[convoFiles.length - 1]
          convoFiles.pop();
          conversationTemplate(src1,src2, convoCount++)
          break;
        }
      } 
    }*/
  
  });
}

function createConversations(folder){
    var convoCount = 0;
    console.log(convoFiles);
    while (convoFiles.length != 0){
      src1 = convoFiles[convoFiles.length - 1];
      console.log(src1);
      convoFiles.pop();
      console.log(convoFiles);
      src1details = src1.split('_');
      for (var i = 0 ; i < convoFiles.length; i++){
        src2 = convoFiles[i];
        src2details = src2.split('_');
        if (src1details[2] == src2details[2] && src2details[0] == src1details[1] && src1details[0] == src2details[1]){
          convoFiles[i] == convoFiles[convoFiles.length - 1]
          convoFiles.pop();
          conversationTemplate(folder,src1,src2, convoCount++)
          break;
        }
      } 
    }
}




$(document).ready(function($) {


        
        $.get('https://' + address + ':8080/loadpreviousjobs', function(data){
          console.log(data);
          jobs = data.filenames;
          loadjobs(jobs);
          updateMedia();
          // mediaFolders = data.mediaFolders; 
          // mediaFiles = data.mediaFiles;
        });
});

function loadjobs(jobs){
        console.log(jobs)
        console.log()
        for (var i = 0 ; i < jobs.length ; i++){
          jobTemplate(jobs[i]);
        }


        $('#myCarousel').carousel({
            interval:5000
        });

        // var src1,src2,src1details,src2details;
        // var tempConvoFiles = convoFiles;
        // var convoCount = 0;
        
        // while (!tempConvoFiles.empty()){
        //   src1 = tempConvoFiles.pop()
        //   src1details = src1.split('_');
        //   for (var i = 0 ; i < tempConvoFiles.length; i++){
        //     src2 = tempConvoFiles[i];
        //     src2details = src2.split('_');
        //     if (src1details[2] == src2details[2] && src2details[0] == src1details[1] && src1details[0] == src2details[1]){
        //       tempConvoFiles[i] == tempConvoFiles[tempConvoFiles.length - 1]
        //       tempConvoFiles.pop();
        //       conversationTemplate(src1,src2, convoCount++)
        //       break;
        //     }
        //   } 
        // }

        
        //Handles the carousel thumbnails
        $('[id^=carousel-selector-]').click(function () {
            var id_selector = $(this).attr("id");
                try {
                    var id = /-(\d+)$/.exec(id_selector)[1];
                    console.log(id_selector, id);
                    jQuery('#myCarousel').carousel(parseInt(id));
                } catch (e) {
                    console.log('Regex failed!', e);
                }
        });
        // When the carousel slides, auto update the text
        $('#myCarousel').on('slid.bs.carousel', function (e) {
                 var id = $('.item.active').data('slide-number');
                $('#carousel-text').html($('#slide-content-'+id).html());
        });


}

// <li class="col-sm-3">
//     <a class="thumbnail" id="carousel-selector-0">
//         <img src="http://placehold.it/150x150&text=zero"></a>
// </li>

//carousel/gallery items: 
function carouselTemplate(item_index, src_path){ 
    var container;
    var list_item;
    if(item_index == 0){
            container = $("<div> </div>").addClass("item").addClass("active").attr("data-slide-number", item_index);
    } else { 
            container = $("<div> </div>").addClass("item").attr("data-slide-number", item_index);
    }


    //if (src_path.endsWith('.png')){
      container.append("<img src='" + src_path + "'>")
      $("#image-carousel").append(container);

      list_item = $("<li> </li>").addClass("col-sm-3");
      list_item.append("<a class='thumbnail' id='carousel-selector-" + item_index + "'> <img src='" + src_path + "'> </a>");

    // } else {
    //   var video = $("<video> </video>");//.attr('controls','');//.attr("id", type + i);
    //   video.append("<source src='" + src_path + "' type='video/webm'>");
    //   container.append(video);
    //   list_item.append("<a class='thumbnail' id='carousel-selector-" + item_index + "'> <video class='small-video'> <source src='" + src_path + "' type='video/webm'> </video> </a>");

    // }

    $("#image-gallery").append(list_item);

}

  // <div class="panel panel-default">
  //   <div class="panel-heading">
  //     <h4 class="panel-title">
  //       <a data-toggle="collapse" data-parent="#accordion" href="#collapse1">
  //       Date, Time: username1 &amp; username 2</a>
  //     </h4>
  //   </div>
  //   <div id="collapse1" class="panel-collapse collapse in">
  //     <div class="panel-body">
  //           <audio controls>
  //               <source src="horse.ogg" type="audio/ogg">
  //               
  //           </audio>
  //     </div>
  //   </div>
  // </div>
//var src1 = "sbooth_ngoodpaster_2-Aug-2018-16-54-53.wav";
//var src2 = "ngoodpaster_sbooth_2-Aug-2018-16-54-53.wav";

function conversationTemplate(folder,audio_src1, audio_src2, item_index){
    console.log(audio_src1);
    var container = $("<div> </div>").addClass("panel").addClass("panel-default");
    var panel = $("<div> </div>").addClass("panel-heading");
    
    var username = audio_src1.split('_');
    audio_src1 = 'https://' + address + ':8080/conversations/' + folder + '/' + audio_src1;
//    var src2 = 'https://' + address + ':8080/conversations/' + audio_src2;
    var date_info = username[2].split("-");

    var date = date_info[1] + " " + date_info[0] + ", " + date_info[2];
    var time = date_info[3] + ":" + date_info[4];

    var description = date + "    " + time + ": " + username[0] + " & " + username[1];
    var header = $("<h4> </h4>").addClass("panel-title");

    var link = $("<a> </a>").attr("data-toggle", "collapse").attr("data-parent", "#accordian").attr("href", "#collapse" + item_index).text(description);
    
    header.append(link);
    panel.append(header);
    container.append(panel);

    var collapse = $("<div> </div>").addClass("panel-collapse").addClass("collapse").attr("id", "collapse" + item_index);
    var body = $("<div> </div>").addClass("panel-body");
    body.append("<audio id='" + audio_src2 + "' controls> <source src='" + audio_src1 + "'</audio>");
    collapse.append(body);

    container.append(collapse);

    $("#accordion").append(container);

    document.getElementById(audio_src2).onplay = function(){
        var audio = new Audio('https://' + address + ':8080/conversations/' + folder + '/' + this.id);
	console.log("playing second audio src"); 
        audio.play();
    }

    document.getElementById(audio_src2).onpause = function(){
        var audio = new Audio('https://' + address + ':8080/conversations/' + folder + '/' + this.id );
        audio.pause();
    }
}

function videoTemplate(src){
  var container = $('<div></div>').addClass("gallery").addClass('videoInsert');
  var video = $("<video> </video>").attr('controls','');//.attr("id", type + i);
  video.append("<source src='" + src + "' type='video/webm'>");
  container.append(video);
  //var desc = $("<div></div>").addClass("desc").text(src);
  //container.append(desc);

  $('#video-container').append(container);
}


function jobTemplate(jobName){
  var details = jobName.split('-');

  var timeofday = 'am';
  if (parseInt(details[3],10) > 12){
    timeofday = 'pm';
    if (details[3] !== '12'){
      details[3] = parseInt(details[3],10) - 12;
    }
  }

  var text = details[1] + ' ' + details[0] + ', ' + details[2] + ' - ' + details[3] + ':' + details[4] + ':' + details[5] + ' ' + timeofday;
  var option = $("<option></option>").attr('id',jobName).val(jobName).text(text);

  $('#selected_job').append(option);
}

//dd-Mmm-yy-hr-min-sec
