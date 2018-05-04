$(document).ready(function($) {
 
        $('#myCarousel').carousel({
                interval: 5000
        });

        for(var i = 0; i < 10; i ++){
            if(i == 0){
                carouselTemplate(i, "http://placehold.it/470x480&text=zero");
            } else { 
                carouselTemplate(i, "http://placehold.it/470x480&text=" + i);
            }
            conversationTemplate(src1, src2, i);
        }
 
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


});

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
    container.append("<img src='" + src_path + "'>")
    $("#image-carousel").append(container);

    list_item = $("<li> </li>").addClass("col-sm-3");
    list_item.append("<a class='thumbnail' id='carousel-selector-" + item_index + "'> <img src='" + src_path + "'> </a>");

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
var src1 = "sbooth_ngoodpaster_2-Aug-2018-16-54-53.wav";
var src2 = "ngoodpaster_sbooth_2-Aug-2018-16-54-53.wav";

function conversationTemplate(audio_src1, audio_src2, item_index){
    var container = $("<div> </div>").addClass("panel").addClass("panel-default");
    var panel = $("<div> </div>").addClass("panel-heading");
    
    var username = audio_src1.split("_");
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

    $("#" + audio_src2).on("play", function(){
        var audio = new Audio(this.id);
        audio.play();
    });

    $("#" + audio_src2).on("pause", function(){
        var audio = new Audio(this.id);
        audio.pause();
    });


}




