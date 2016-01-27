/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

//http://stackoverflow.com/questions/9050345/selecting-last-element-in-javascript-array
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

window.performance = window.performance || {};

performance.now = (function() {
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         function() { return new Date().getTime(); };
})();


/*******PROBABIILTY EVALUATION FUNCTION*******/
/*Supply arguments in choice/probability pairs, (c1, p1, c2, p2...)*/
function probabilityPicker(){
//    console.log("Welcome to the probability picker");

    /*Cache the length as you'll use it alot */
    var argLength = arguments.length;
    
    if ( argLength % 2 !== 0){
        console.error("Probability picker error: there weren't a matching number of probabilities and options");
        return;
    }
    
    /*Check probabilities sum to 1*/
    var total = 0.0;
    for (var i = 1; i < argLength; i+=2){
        total += arguments[i];
    }
    /*Adding doubles is fucked and someimtes you get 0.9999 instead of 1*/
    if (total < 0.99995 ||  total >  1){
        console.error("Probability picker error: probabilities dont sum to 1 (" + total + ")");
        return;
    }
    
    /*Update the probabilities so they sit in contiguous portions of 1.0*/
    var accumulator = 0.0;
    for (var i = 1; i < argLength; i+= 2){
        
        /*Store the original base probability*/
        var temp = arguments[i];
        
        /*Then update the probability with the accumulator*/
        arguments[i] += accumulator;
        
        /*Then update the accumulator*/
        accumulator += temp;
    }
    
    /*Cache a random value*/
    var rand = Math.random();
    
    /*EXECUTE THE MOVE WHOSE PROBABILITY BRACKET rand SITS IN*/
    for (var i = 1; i < argLength; i+= 2){
        if (rand < arguments[i]){
            
            arguments[i-1](); //execute a command with arguments
            return; //HUGELY IMPORTANT
        }
    }
}

/*Partial function allows you to give functions with arguemnts to the probability picker
 * 
 * SOMETHING MIND BENDINGLY IMPORTANT WHEN USING THIS WITH CLASS METHODS
 * use **BIND**
 * .bind(what-this-refers-to) is so imporatnt because otherwise partial changes the scope of this,
 * and 'this' will no longer refer to the object that called it.        I think 'this' now refers to just the method itself.
 * 
 * If you use 'bind()' then you can you ensure that 
 * 
 * 
 * */
function partial(func /*, 0..n args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var allArguments = args.concat(Array.prototype.slice.call(arguments));
    return func.apply(this, allArguments);
  };
}

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// SANDBOX! //////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
function bye(){
    console.log("bye baby");
}
function hi(string){
    console.log("hi, " + string);
}

var fr = partial(hi, "kai");

probabilityPicker(bye, 0.5, fr, 0.5);




/** THREE JS UTILS ***/ /** THREE JS UTILS ***/ /** THREE JS UTILS ***/ /** THREE JS UTILS ***/
/** THREE JS UTILS ***/ /** THREE JS UTILS ***/ /** THREE JS UTILS ***/ /** THREE JS UTILS ***/
/** THREE JS UTILS ***/ /** THREE JS UTILS ***/ /** THREE JS UTILS ***/ /** THREE JS UTILS ***/

function cartX(screenX, screen_width){
    return screenX - screen_width/2;
}

function cartY(screenY, screen_height){
   return screenY - screen_height/2;
}

function screenToWorld(event, camera){
    
    var vector = new THREE.Vector3();
    
    vector.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
    - ( event.clientY / window.innerHeight ) * 2 + 1,
    0.5 );
    
    //vector.unproject( camera );
    
    var dir = vector.sub( camera.position ).normalize();
    
    var distance = - camera.position.z / dir.z;
    
    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
    return pos;
}

function generateTexture() {

	var size = 512;

	// create canvas
	canvas = document.createElement( 'canvas' );
	canvas.width = size;
	canvas.height = size;

	// get context
	var context = canvas.getContext( '2d' );

	// draw gradient
	context.rect( 0, 0, size, size );
	var gradient = context.createLinearGradient( 0, 0, size, size );
	gradient.addColorStop(0, '#ffffff'); // White 
	gradient.addColorStop(1, 'transparent'); // dark blue
	context.fillStyle = gradient;
	context.fill();

	return canvas;

}
