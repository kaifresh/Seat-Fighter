/***DETECTOR****/
if (!Detector.webgl) {
    
    var body = $('body');
    body.text("Sorry, your browser doesn't support WebGL!");
    body.append("<br><a href=\"http://get.webgl.org\"> Click here to get webGL poppin'</a>");
    body.css("text-align", "center");
    body.css("margin-top", "10%");
    body.css("font-size", "20px");
    
    $("#three-canvas").remove();
    $("#controls").remove();
}

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
//
//if (window.mobilecheck){
//    var body = $('body');
//    body.text('Sorry mobile user, you can only fight Malcolm on a computer.');
//     body.css("text-align", "center");
//    body.css("margin-top", "10%");//ssssssssssssssssss
//    body.css("font-size", "20px");
//    
//    body.append('<br><img src="http://www.abc.net.au/news/image/6316352-3x2-940x627.jpg" alt="Smiley face" height="100" width="100">');
//}

var w = $(document).width();
var h = $(document).height();

/**********************************Necessary THREE.JS setup things*************************************/
/*Create the renderer, set its size and add it to the page*/
var renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
var canvas = $('#three-canvas');
canvas.append(renderer.domElement);

/*Create scene/stage*/
var scene = new THREE.Scene();

var clock = new THREE.Clock();
var delta = clock.getDelta();

/**********************************CAMERA*************************************/
/*Create camera (orthographic means you dont have perspective or a 3rd dimension)*/
//var camera = new THREE.OrthographicCamera( w / - 10, w / 10, h / 10, h / - 10, 1, 1000); //Frustrum lol
var cameraZ = 5;
var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = cameraZ;

/**********************************BACKGROUND CAMERA*************************************/
//http://jeremy.assenat.free.fr/Lab/threejsbg/
// Load the background backgroundTexture
var backgroundTexture = THREE.ImageUtils.loadTexture( 'img/horbg.jpg' );
var backgroundMesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2, 2, 0),
new THREE.MeshBasicMaterial({
    map: backgroundTexture
}));

backgroundMesh .material.depthTest = false;
backgroundMesh .material.depthWrite = false;

// Create your background scene
var backgroundScene = new THREE.Scene();
var backgroundCamera = new THREE.Camera();
backgroundScene .add(backgroundCamera );
backgroundScene .add(backgroundMesh );

/**********************************OBJECTS INT HE SCENE*************************************/
var myAudio = new Audio('audio/bgmusic.mp3'); 
myAudio.volume = 0.6;
myAudio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
    
}, false);



var abbotAudio = new Audio('audio/shirtfront.mp3');
var turnbullAudio = new Audio('audio/disgusting.mp3');

turnbullAudio.volume = 0.8;

var fighters = {};
fighters.player = new Fighter("img/tony8x1.png", "abbot", "left", PLAYER_TYPE.Human, abbotAudio);
fighters.computer = new Fighter("img/turnbull8x1.png", "turnbull", "right", PLAYER_TYPE.Computer, turnbullAudio);

var scaleAmount = 2;
fighters.computer.setScale(scaleAmount, scaleAmount, 1);
fighters.player.setScale(scaleAmount,scaleAmount, 1);


/*LOAD IT HERE DISPLAY IT WITH EACH CONNECTED PUNCH*/
var flashImage = new THREE.ImageUtils.loadTexture( 'img/explosion.jpg' );
flashAniamtor = new TextureAnimator( flashImage, 4, 4, 16, 1 / 20 );

var flashGeometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
var flashMaterial = new THREE.MeshBasicMaterial( {
    map: flashImage,
    transparent: true,
    blending: THREE.AdditiveBlending
} );
flashMesh = new THREE.Mesh( flashGeometry, flashMaterial );
flashMesh.visible = false;

scene.add( flashMesh );


var GAME_OVER = false;


/**********************************THINGS THAT OCCUR DURING THE GAME*************************************/

/*Start the animation only when everything loads*/
$(window).load(function () {
    myAudio.play();
    initHPBar(fighters.player, fighters.computer);
    initEndScreen();
    
    $("#loadingScreen").remove(); //REMEMBER TO COMMENT THIS LINE OUT WHEN YOU'RE DONE
    $("#loadingScreen").fadeOut({duration: 700});
    
    fighters.player.resetPosition("left");
    fighters.computer.resetPosition("right");

    render();
    
});

$("#play-again").click(function(){
    location.reload();
});

var timestep = 1/60;
/******Rendering*******/
function render() {
    
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(backgroundScene , backgroundCamera );
    renderer.render(scene, camera);
    
    if (!GAME_OVER){
        delta = clock.getDelta();
        fighters.player.animator.update(10 * delta);
 
            handleUserMovement();
            handleAI(fighters.player, fighters.computer);
            detectHits();   
            setHPLengths($("#abbot-hp-remaining"), $("#abbot-hp-lost"), $("#turnbull-hp-remaining"), $("#turnbull-hp-lost"), fighters.player, fighters.computer);
            
            /*This is hacky shit, but I dont know how to update something like a jump w variable changes in movement*/
            fighters.player.updateUnfinishedMoves();
            fighters.computer.updateUnfinishedMoves();
        
    } else {
        var showSpeed = 1000;
        var scaler = 1.5;
        $("#end-title").show(showSpeed);
        
        if (fighters.player.health === 0){
            $("#turnbull-wins").show(showSpeed * scaler);
            $("#play-again").show(showSpeed * scaler);
        } else {
            $("#abbot-wins").show(showSpeed * scaler);
            $("#play-again").show(showSpeed * scaler);
        }
    }
    
    if (fighters.player.health === 0 || fighters.computer.health === 0 ){
        GAME_OVER = true;
    }
    
    requestAnimationFrame(render);
}



/***************GAME ENGINE/LOGIC****************/
function detectHits(){
    
    fighters.player.detectCollisions(fighters.computer);
    
}

var HEALTH_BAR_WIDTH = 40;
function initHPBar(lh, rh){
    
    /*Set everything*/
    var lhHP = {}; 
    lhHP.remaining = $("#abbot-hp-remaining");
    lhHP.lost = $("#abbot-hp-lost");
    
    var rhHP = {};
    rhHP.remaining = $("#turnbull-hp-remaining");
    rhHP.lost = $("#turnbull-hp-lost");
    
    /*Positions
     * Doing Lost from the opposite side at 60vw, means that it really is starting at 40 but extends INWARDS :)
     * */
    lhHP.remaining.css("left", "2vw");
    lhHP.lost.css("right", (98 - HEALTH_BAR_WIDTH) + "vw"); //ITS 98 because of being offset 2 from the edge
    
    rhHP.remaining.css("right", "2vw");
    rhHP.lost.css("left", (98 - HEALTH_BAR_WIDTH) + "vw"); 
    
    
    setHPLengths($("#abbot-hp-remaining"), $("#abbot-hp-lost"), $("#turnbull-hp-remaining"), $("#turnbull-hp-lost"), lh, rh);
}

function initEndScreen(){
    $("#end-title").hide();
    $("#abbot-wins").hide();
    $("#turnbull-wins").hide();
    $("#play-again").hide();
}

/*1st 4 arguemnts are references to DIVs, last two are the structs*/
function setHPLengths(lhRemaining, lhLost, rhRemaining, rhLost, lh, rh){
    
    /*Bar lengths*/ 
    var lhLengths = getHPLengths(lh.health, HEALTH_BAR_WIDTH);
    lhRemaining.css("width", lhLengths.remaining.css);
    lhLost.css("width", lhLengths.lost.css);
    
    var rhLengths = getHPLengths(rh.health, HEALTH_BAR_WIDTH);
    rhRemaining.css("width", rhLengths.remaining.css);
    rhLost.css("width", rhLengths.lost.css);   
    
    /*TODO: ANimate these*/
    //    lhRemaining.animate({
    //        width: lhLengths.remaining.css
    //    });
    //    
    //    lhLost.animate({
    //        width: lhLost.css("width") + lhLengths.lost.css
    //    });
    
}

function getHPLengths(remainingHealth, totalLength){
    
    var percentRemaining = remainingHealth/100;
    var lengths = {};
    
    lengths.remaining = {num: percentRemaining * totalLength, css: percentRemaining * totalLength + "vw"};
    lengths.lost = {num: (1- percentRemaining) * totalLength, css: (1 - percentRemaining) * totalLength + "vw"}
    
    return lengths;
}

//var bbox = new THREE.BoundingBoxHelper( fighters.computer.sprite, 0x000000 );
//bbox.update();
//scene.add( bbox );


/*SANDBOX AREA*/

//var dictionary = new NGram(2);
//
//
//dictionary.recordLetter("a");
//dictionary.recordLetter("b");
//dictionary.recordLetter("c");
//dictionary.recordLetter("d");
//dictionary.recordLetter("e");
//dictionary.recordLetter("b");
//dictionary.recordLetter("c");
//dictionary.recordLetter("b");
//dictionary.recordLetter("c");
//
//dictionary.feedbackPriority("c", "b", 2);
////dictionary.printContents();
//
//
//dictionary.whatsNext(true);

//var lol = [];
//for (var i = 100; i > 0; i--){
//    var bitch = {str: "lol", priority: Math.random() * 100};
//    lol.push(bitch);    
//    console.log(lol.last().priority);
//}
//
//lol.sort(priorityCompare);
//
//for (var i = 0, len = lol.length; i < len; i++){
//    console.log("Sorted: " + lol[i].priority);
//}