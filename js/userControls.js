
/*This is a key map (key/value pairs)
 * You set the key based on the key's ascii code and store a boolean value there
 * Then just check at that location in the map to do your controls
 * */

var up = 38;
var down = 40; 
var left = 37; 
var right = 39;
var space = 32; 
var W = 87; 
var AttackPunch = 65; 
var S = 83;
var Block = 68;

var holding = {AttackPunch: false};

var keys = {};
$(document).keydown(function(e){
        keys[e.which] = true;
        
        /*ADDING USER MOVES TO THE nGRAM */
        if (e.which === up || e.which === down ||e.which === left ||e.which === right ||e.which === space ||e.which === W ||e.which === AttackPunch ||e.which === S ||e.which === Block){
            nGrammer.recordLetter(String.fromCharCode(e.which));
        }
        
     

}).keyup(function(e){
    delete keys[e.which];
    
    if (e.which === AttackPunch){
            holding.AttackPunch = false; 
        }
    
});


/******************************************/
var tickRate = 25;
var currentAttack = { distance: 0, strength: 0 };
var handleUserMovement = function() {
    
    /*KEYBOARD INPUT*/
    /*Cannot be an else statement otherwise you can't do mulitple keypresses*/  
//    if (keys[up]) {
//        fighters.computer.jump();
//    } 
//    if (keys[down]) {
//        fighters.computer.compBigJumpOver();
//    } 
    
    if (keys[left]) {
        fighters.player.moveLeft();
    } 
    if (keys[right]) {
        fighters.player.moveRight();
     
    }
    if (keys[space]) {
        if (!fighters.player.isJumping){
            fighters.player.jump();
        }
    } 
    if (keys[W]) {
    } 
    
    if (keys[AttackPunch] && !keys[Block]) { //i.e. you can't press the block key while pressing the attack hey
        
        /*Hypochondriac double prevention of blocking while attacking*/

        if (!fighters.player.isBlocking && !holding.AttackPunch){
            fighters.player.attack(fighters.computer, "punch");
            
            /* $$ Prevents people from holding attack, you only get one punch per keypress*/
            holding.AttackPunch = true;
//            delete keys[AttackPunch];
        }  
    } 
    
    if (keys[S]) {
        fighters.computer.attack(fighters.player, "punch");
    } 
    if (keys[Block]) {
        
        if(!fighters.player.isBlocking && !fighters.player.isAttacking){
            fighters.player.block();
        }
    } 
   
 
    /**/
 
    
//  setTimeout(handleUserMovement, tickRate);
}; 
