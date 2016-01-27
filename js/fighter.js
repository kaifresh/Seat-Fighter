var fightHeight = -2; //SET ME TO SCREEN COORDIANTES (screen 2 cart util)
var leftFighter = -4;
var rightFighter = 4;

var MOVE_AMOUNT = 3;
var OVERLAP_OFFSET = 0.5;
var MOVES_INTERVAL = 300;

var PLAYER_TYPE = {Human: 0, Computer: 1};

var atkStngth = {
    punch: 3 
};

var atkDist = {
    punch: 0.5,
    kick: 0.6
};
var possibleMoves = {
    punch: "p",
    bigJump: "l", //leapsssss
    evasiveJump: "e",
    block: "b",
    moveRight: "r",
    moveLeft: "l",
    backAway: "a",
    idle: "i"
};

var Fighter = function (spritePath, name, side, playerType, attackAudio){
    
    this.attackAudio = attackAudio;
    
//    var audio = new Audio('audio_file.mp3');
//audio.play();
    
    /*http://stemkoski.github.io/Three.js/Texture-Animation.html*/
    
    /*Creating the image*/    
    var map = THREE.ImageUtils.loadTexture( spritePath ); 
    this.animator = new TextureAnimator(map, 1, 4, 4, 10); //bottom to top: 0 - idle, 1 - punch, 2 - kick
    var material = new THREE.MeshBasicMaterial( { map: map, side:THREE.DoubleSide, transparent: true} );
    var geometry = new THREE.PlaneGeometry(1, 2);
    this.sprite = new THREE.Mesh(geometry, material);
    
    
    /*Positioning on the screen (x, y, z)*/
    this.sprite.position.y = fightHeight;
    this.sprite.position.z = 0;
    
    if (side === "left"){
        this.sprite.position.x = leftFighter;
    } else {
        this.sprite.position.x = rightFighter;
    }
    
    /*Adding to scene*/
    if (scene !== null){
        scene.add(this.sprite);
    } else {
        console.error("SCENE NOT DEFINED!");
    }
    
    /********* IN GAME STUFF ************/
    
    /*Player data*/
    this.playerType = playerType;
    this.health = 100; 
    this.special = 0;
    
    this.name = this.sprite.name = name;
    
    /*ORIENTATION, MOVEMENT & COLLISION DETECTION*/
    this.isFacingLeft = true;
    this.canMoveLeft = true;
    this.canMoveRight = true;
    
    /*overlaps*/
    this.isCorrectingOverlap = false;
    this.overlapAmount = 0;
    this.overlapIterator = this.overlapAmount;
    
    /*JUMPING*/
    this.isJumping = false;
    this.isBigJumping = false;
    this.isEvasiveJumping = false;
    this.jumpIterator = 40;
    this.jumpVerts = [];
    this.getJumpCurve();
    this.preJumpPos = 0.0;
    
    /*NON-SPECIFIC ATTACKS*/
    this.isAttacking = false;
    this.attackTime = 10;
    this.attackIterator = this.attackTime;
    
    /*BLOCKING*/
    this.isBlocking = false;
    
    /*COMPUTER MOVEMENT SMOOTHING*/
    this.recentMoves = "";
    this.nRecent = 5;
    this.nMovesInDirection = 5;
    this.noJitter = 0;
};

Fighter.prototype.resetPosition = function(side){
    if (side === "left"){
        this.sprite.position.x = leftFighter;
    } else {
        this.sprite.position.x = rightFighter;
    }
}


Fighter.prototype.setScale = function(x, y, z){
    
    this.sprite.scale.set( x, y, z );
};



/**FUNDAMENTAL SHIT**/
Fighter.prototype.moveLeft = function(){ 
    
    this.stopCompJitters("left");
    
    
    if (!this.isCorrectingOverlap && !this.isEvasiveJumping){
        if (this.canMoveLeft || this.isJumping){
            this.sprite.position.x -= MOVE_AMOUNT * delta;
            this.sprite.rotation.y = Math.PI;
            
            this.sprite.position.z = 0;   
            
            this.isFacingLeft = true;
        }   
    }
    
    
};

Fighter.prototype.moveRight = function(){
    
    this.stopCompJitters("right");
    
    if (!this.isCorrectingOverlap && !this.isEvasiveJumping){
        if (this.canMoveRight || this.isJumping){
            this.sprite.position.x += MOVE_AMOUNT * delta;
            this.sprite.rotation.y = 0;
            this.sprite.position.z = 0;    
            
            this.isFacingLeft = false;
        }  
    }
    
};

Fighter.prototype.faceLeft = function(){
    
    this.stopCompJitters("left"); 
    
    if (!this.isCorrectingOverlap && !this.isJumping && !this.isEvasiveJumping){
        this.sprite.rotation.y = Math.PI;
        this.isFacingLeft = true;
    }
};

Fighter.prototype.faceRight = function(){
    
    this.stopCompJitters("right");    
    
    if (!this.isCorrectingOverlap && !this.isJumping && !this.isEvasiveJumping){
        this.sprite.rotation.y = 0;
        this.isFacingLeft = false;
    }
};

/*Wrapper for the two methods below it*/
Fighter.prototype.backAwayFromEnemy = function(enemy){
    /*If player is to the right of the computer*/
    if (this.isOnMyLeft(enemy)){
        this.stopCompJitters("right");        
        this.backAwayRight();
    } else if (this.isOnMyRight(enemy)){
        this.stopCompJitters("left");
        this.backAwayLeft();
    }
    
};

/*Moving left but facing right*/
Fighter.prototype.backAwayLeft = function(){
    if (!this.isCorrectingOverlap){
        if (this.canMoveLeft || this.isJumping){
            this.sprite.position.x -= MOVE_AMOUNT * delta;
            this.sprite.rotation.y = 0;
            
            this.sprite.position.z = 0;   
            
            this.isFacingLeft = true;
        }   
    }
};

/*Move left, face right*/
Fighter.prototype.backAwayRight = function(){
    if (!this.isCorrectingOverlap){
        if (this.canMoveLeft || this.isJumping){
            this.sprite.position.x += MOVE_AMOUNT * delta;
            this.sprite.rotation.y = Math.PI;
            
            this.sprite.position.z = 0;   
            
            this.isFacingLeft = true;
        }   
    }
    
};

Fighter.prototype.idle = function(){
    
    /*Animate something funny*/
    
};

/*ACTIONS!!!!!
 * 
 * MASSIVE NB: The way I've written these action methods is that they facilitate 
 * the start, middle and end of the punch with each subsequent call. So in other
 * words, to get the full action, the move needs to be called N number of times.
 * There is an iterator that counts down and, when it hits 0 then it no longer needs to be called.
 * 
 * In other words, you can use IF statements about the state of the iterator to see if you need to keep calling.
 * 
 * Where does the calling occur? Well this might seem a bit messy but in the 
 * userControls section.
 * 
 * */

/*JUMPING*/

Fighter.prototype.getJumpCurve = function () {
    
    /*TO DO: NEED A BETTER CURVE FUNCTION*/
    var curve = new THREE.EllipseCurve(
            0,  0,            // ax, aY
    0.25, 4,           // xRadius, yRadius
    0,   Math.PI,  // aStartAngle, aEndAngle
    false             // aClockwise
            );
    this.jumpVerts = curve.getPoints( this.jumpIterator ); //100 points
    
    //    for (var i = 0; i< this.jumpVerts.length; i++){
    //        console.log(this.jumpVerts[i].y);
    //    }
}
var JUMP_X_BOOST = 0.05;

Fighter.prototype.jump = function (extraX, extraY){
    
    extraX = (extraX === undefined) ? 0 : extraX;
    extraY = (extraY === undefined) ? 0 : extraY;
    
    /*Conditions for the start of a jump*/
    if (!this.isJumping){
        this.getJumpCurve();
        
        this.isJumping = true;
        
        this.preJumpPos = this.sprite.position.y;  /*CUT ALL THE BULLSHIT WITH 32BIT FLOATING POINT INACCURACY ...THANKS!*/
        
        /*Conditions for a continuing jump*/
    } else {
        
        if (this.jumpIterator > 0){
            
            /*You're only jumping the differnce between each point in the curve*/
            var deltaJump = this.jumpVerts[this.jumpVerts.length - this.jumpIterator].y - this.jumpVerts[this.jumpVerts.length - this.jumpIterator - 1].y;
            extraY *= deltaJump <= 0 ? -1 : 1; //Which way to boost the Y
            this.sprite.position.y += deltaJump + extraY;
            if (!this.isFacingLeft){
                this.sprite.position.x += JUMP_X_BOOST + extraX;
            } else {
                this.sprite.position.x -= JUMP_X_BOOST  + extraX;
            }
            
        } else {
            
            /*When adding deltas to position.y, you start losing .000000000001 to fuckign 32bit float decimals            
             * SO just reset the position to its OG. This is just a small (hacky) amount and wil not be a noticable increase in speed at the end
             * */
            this.sprite.position.y = this.preJumpPos;
            
            /*When the jump is complete*/
            this.isJumping = this.isBigJumping = this.isEvasiveJumping = false;
            this.jumpIterator = this.jumpVerts.length;   
        }
        
        /*IT MUST BE HERE BECAUSE OTHERWISE THE JUMPS GO THE WRONG WAY*/
        this.jumpIterator--;
    }
};


/****************COMPUTER ONLY JUMPS*******************/

Fighter.prototype.compEvasiveJump = function(enemy){
    if (!this.isJumping){
        this.isEvasiveJumping;
        if (this.isOnMyLeft(enemy)){
            this.moveRight();
            this.jump();
            
        } else if (this.isOnMyRight(enemy)){
            this.moveLeft();
            this.jump();
        }
    }
};

var ENOUGH_TO_CLEAR = .07; /*Recall that this is added to every stage of the iteration so for 40 loops, you get 4*/
Fighter.prototype.compBigJumpOver = function(){
    this.isBigJumping = true;
    this.jump(ENOUGH_TO_CLEAR, ENOUGH_TO_CLEAR);
};
/****************END COMPUTER ONLY MOVES*******************/


/*ATTACK ++ BLOCKING CODE*/
Fighter.prototype.attack = function (enemy, attackType){
    if (attackType === "punch"){
        //        console.log("PUNCH");
        this.genericAttack(enemy, atkDist.punch, atkStngth.punch);
        this.animateAttack(enemy, "punch", 200);
    }
};

Fighter.prototype.genericAttack = function(enemy, attackDistance, attackStrength){
    
    
    
    /*Initiating the punch*/
    if (!this.isAttacking && this.didWeTouch(enemy, attackDistance)){
        
        this.attackAudio.play();
        
        this.isAttacking = true;
        
        var howRed = enemy.health/100;
        enemy.sprite.material.color = new THREE.Color(1, howRed, howRed);         
        
        /*Prevents enemy strength dropping below 0*/
        var calculatedAttackStrength = enemy.health - attackStrength >= 0 ? attackStrength : enemy.health;
        
        /*BLOCKING HANDLER*/
        if (enemy.isBlocking){
            
            enemy.health -= calculatedAttackStrength * BLOCK_REDUCE_ATTACK;
            
        } else {
            
            enemy.health -= calculatedAttackStrength; 
        }
        
        
        
        //            console.log(enemy.name +" health down to " + enemy.health );
        /*Ending the punch: cant do it immediately coz then you would wipe off cunts health like *THTATAHTHT**/
        canAttackAgainIn(this, enemy, MOVES_INTERVAL);
    }   
};
function canAttackAgainIn(fighter, enemy, duration){
    setTimeout(function(){
        /*REset the enemy colour*/
        enemy.sprite.material.color = new THREE.Color("rgb(255,255,255)"); 
        fighter.isAttacking = false;
    }, duration);
};


/*BLOCKING - doesn't need to do anything, just block and attacks will pick it up*/
var BLOCK_DURATION = 200; //200msec
var BLOCK_REDUCE_ATTACK = 0.02;
Fighter.prototype.block = function(){
    /*Without this IF statement, the block doens't come back after the first tiemout >>>> :(*/
    if (!this.isBlocking){
        //            console.log("block() called by " + this.name);
        
        this.isBlocking = true;
        unBlockAfter(this, BLOCK_DURATION);
    }
    
};
/*Once again haunted by scope issues and 'this' */
function unBlockAfter(fighter, duration){
    setTimeout(function(){
        fighter.isBlocking = false;
    }, duration);
};

function chill(){
var idleChill = setInterval(function(){
    this.animator.update("idle");
}, 500);
}


/*****************UPDATE!*****************/
/*****************UPDATE!*****************/
/*****************UPDATE!*****************/

Fighter.prototype.updateUnfinishedMoves = function(){
    
    if (this.isBigJumping){
        this.jump(ENOUGH_TO_CLEAR, ENOUGH_TO_CLEAR/2);
    } else if (this.isJumping){
        this.jump();
    }
    
    
};
/************ANIMATIONS************/
/************ANIMATIONS************/
/************ANIMATIONS************/

Fighter.prototype.animateAttack = function (enemy, attackString, duration){
    
    /*Go to the punch sprite tile*/
    this.animator.update(attackString);
    
    if (this.isAttacking){
        var bb = this.getBoxes(enemy);
        var x, y;
        
        if (this.isFacingLeft){
            x = bb.player.min.x;
            y = this.sprite.position.y;
        } else {
            x = bb.player.max.x;
            y = this.sprite.position.y;
        }
        
        flashMesh.visible = true;
        var ID = setInterval(function(){animateExplosion(x, y, 100)}, 100);
    }
    
    returnToIdle(this, duration * 2, ID);
};
/*I'm no good iwht THIS */
function returnToIdle(fighter, duration, ID){
    /*Return to the idle sprite tile*/
    setTimeout(function(){ 
        fighter.animator.update("idle"); 
        clearInterval(ID);
        flashMesh.visible = false;
    }, duration);
}

function animateExplosion (x, y, deltaMili){
    flashMesh.position.x = x;
    flashMesh.position.y = y;
    
    flashAniamtor.updateWithTime(deltaMili);
}



/******************COLLISIONS & OVERLAPS ************************/
/******************COLLISIONS & OVERLAPS ************************/
/******************COLLISIONS & OVERLAPS ************************/

/*No raycasting here, i'm pretty ashamed*/
Fighter.prototype.detectCollisions = function (enemy){
    
    if (this.didWeTouch(enemy, 0)){
        //        this.sprite.material.color = new THREE.Color("rgb(100,0,200)");   
        //        enemy.sprite.material.color = new THREE.Color("rgb(100,200,0)");         
        
        /*IMPORTANT BIT - Prevent movement int he apporpriate direction*/
        if (this.isFacingLeft){
            if (this.isOnMyLeft(enemy)){
                this.canMoveLeft = false;
            }
            
        } else {
            if (this.isOnMyRight(enemy)){
                this.canMoveRight = false;
            }
        }
        
    } else {
        this.sprite.material.color = new THREE.Color("rgb(255,255,255)");       
        enemy.sprite.material.color = new THREE.Color("rgb(255,255,255)");       
    }
    this.correctMovementBlocks(enemy); 
    
    /*CHECK FOR OVERLAPS*/
    if ((this.doWeOverlap(enemy, OVERLAP_OFFSET) || this.isCorrectingOverlap)){
        //        console.log("!@#$%^&*((*&^%$# OVERLAP" );
        this.correctOverlaps(enemy);
    }
    
};

Fighter.prototype.correctMovementBlocks = function (enemy){
    if (this.isFacingLeft || this.isJumping){
        this.canMoveRight = true;
    }
    
    if (!this.isFacingLeft || this.isJumping){
        this.canMoveLeft = true;
    }
};

Fighter.prototype.correctOverlaps = function(enemy){
    
    //    console.log("****** OVERLAP CORRECTOR*****");
    
    var bb = this.getBoxes(enemy);
    
    var correctionSpeed = 0.05;
    
    /*On first detection of overlap*/
    if (!this.isCorrectingOverlap){
        
        //        console.log("GET OVERLAP AMOUNT");
        
        /*Get the overlap amount: 1. remember it and 2. copy it to the iterator*/
        if (this.isFacingLeft){
            this.overlapAmount = bb.enemy.max.x - bb.player.min.x;
            this.overlapIterator = this.overlapAmount;
        } else {
            
            this.overlapAmount = bb.player.max.x - bb.enemy.min.x;
            this.overlapIterator = this.overlapAmount;
        }
        
        /*Change the flag so you go into the "doing" phase*/
        this.isCorrectingOverlap = true;
        
    } else {
        
        
        /*Wihle you are still reducing the overlap*/
        if (this.overlapIterator > 0){
            
            if (this.isFacingLeft){
                
                this.overlapIterator -= this.overlapAmount * correctionSpeed;
                enemy.sprite.position.x -= this.overlapAmount * correctionSpeed;
                
            } else {
                this.overlapIterator -= this.overlapAmount * correctionSpeed;
                enemy.sprite.position.x += this.overlapAmount * correctionSpeed;
            }
            
        } else {    
            /*When youa re done*/
            this.isCorrectingOverlap = false;
        }
        
        
    }
    
};

/************UTILS************/
/************UTILS************/
/************UTILS************/

Fighter.prototype.didWeTouch = function (enemy, _atkDist){
    
    var bb = this.getBoxes(enemy);
    
    if (this.isFacingLeft){
        /*Check for being on the RIGHT side of the opponent (on the left is guaranteed no hit)*/
        if (bb.player.min.x - _atkDist < bb.enemy.max.x && bb.player.max.x > bb.enemy.min.x){
            return true;
        } 
        
    } else {
        
        /*Check for being on the LEFT side of the opponent (on the right is guaranteed no hit)*/
        if (bb.player.max.x + _atkDist > bb.enemy.min.x && bb.player.min.x < bb.enemy.max.x){
            return true;
        } 
    }
    
    return false; 
};

Fighter.prototype.doWeOverlap = function (enemy, _offset){
    
    var bb = this.getBoxes(enemy);
    /*OVERLAP: Each side of the player rect is straddling the nearest side of the enemy rect */
    
    /*Dont bother checking for overlap until you've landed*/
    if (!this.isJumping){
        
        
        if (this.isFacingLeft){
            if (bb.player.min.x < bb.enemy.max.x - _offset && bb.player.max.x >= bb.enemy.max.x){
                return true;
            } 
            
        } else {
            
            if (bb.player.max.x > bb.enemy.min.x + _offset && bb.player.min.x <= bb.enemy.min.x){
                return true;
            } 
        }
        
    }   
    return false; 
};


Fighter.prototype.isOnMyRight = function(enemy){
    var bb = this.getBoxes(enemy);
    return bb.player.max.x < bb.enemy.min.x;
};

Fighter.prototype.isOnMyLeft = function(enemy){
    var bb = this.getBoxes(enemy);  
    return bb.player.min.x > bb.enemy.max.x;
};

Fighter.prototype.distanceFromMyRight = function(enemy){
    
    var bb = this.getBoxes(enemy);
    
    /* RIGHT IS ALWAYS THE ~MAX~ SIDE
     * Fairly safe to assume this would only be called with an enemy to your right, 
     * so we check its LEFT/MIN!!! side
     * */
    return bb.enemy.min.x - bb.player.max.x;
};

Fighter.prototype.distanceFromMyLeft = function(enemy){
    
    var bb = this.getBoxes(enemy);
    return bb.player.min.x - bb.enemy.max.x;
};

/*To end the speculation: getBoxes returns WORLD COORDINATES. 
 * So even if you rotate a sprite, it doesn't matter. minX is always teh LEFT of the screen.*/
Fighter.prototype.getBoxes = function(enemy){
    var enemyBB = new THREE.Box3();
    var playerBB = new THREE.Box3();
    
    enemyBB.setFromObject( enemy.sprite );
    playerBB.setFromObject ( this.sprite );
    
    var bb = {};
    
    bb.enemy = enemyBB;
    bb.player = playerBB;
    
    return bb;
};



Fighter.prototype.listStates = function(){
    var states = "isFacingLeft: " + this.isFacingLeft + "\n" +
            "isCorrectingOverlap: " + this.isCorrectingOverlap + "\n" +
            "isJumping: " + this.isJumping + "\n" +
            "isBigJumping: " + this.isBigJumping + "\n" +
            "isAttacking: " + this.isAttacking + "\n" +
            "isBlocking: " +  this.isBlocking + "\n";
    
    console.log(states);
};

Fighter.prototype.stopCompJitters = function(direction){
        
    //LEFT VERSION
    /*L 0 R --> -1 0 1*/
    if (this.playerType === PLAYER_TYPE.Computer){
        
        if (direction === "left"){
          
          
          
            /*<=0 means already moving left -- mean keep moving left
             * 
             * -1 mean you were previuosly moving right, now reset to a single left move
             * */
          
            this.noJitter = this.noJitter < 0 ? this.noJitter-- : -1;

//            console.log("no jitter left move!: " + this.noJitter);
          
        } else if (direction === "right"){
          
            
            
           /* >=0 means already movign right, so move right
            * 
            * If its less than zero, you've been moving left, so reset the counter to a single right move
            * */
            this.noJitter = this.noJitter > 0 ? this.noJitter++ : 1;            
            
//            console.log("no jitter right move!" + this.noJitter);
        }
    }
    
};


///////////////////////////////////////////////////////////////////////////////////////////////////
//Fighter.prototype.jump = function (extraX, extraY){
//    
//    extraX = (extraX === undefined) ? 0 : extraX;
//    extraY = (extraY === undefined) ? 0 : extraY;
//    
//    /*Conditions for the start of a jump*/
//    if (!this.isJumping){
//        this.getJumpCurve();
//        
//        this.isJumping = true;
//        asyncJump(this, extraX, extraY);
//    }   
//}
////
//var JUMP_INTERVAL = 10;
//var TIME_STEP = 60;
//function asyncJump(fighter, extraX, extraY){
//   
//    var then = $.now();
//    
//    var jumpID = setInterval(function(){
//        
//           
//        /*IN A SINGLE ITERATION: You're only jumping the differnce between each point in the curve*/
//        var deltaJump = fighter.jumpVerts[fighter.jumpVerts.length - fighter.jumpIterator].y - fighter.jumpVerts[fighter.jumpVerts.length - fighter.jumpIterator - 1].y;
//            
//        /*Handle DELTA TIME HERE*/
//        var deltaTime = $.now() - then;
//                then = $.now();
//
//        console.log("Delta time: " + deltaTime);
//                     
//        deltaTime /= TIME_STEP; //Delta time by itself its too hardcode
//            
//        extraY = deltaJump < 0 ? -extraY : extraY; //Which way to boost the Y
//
//        fighter.sprite.position.y += (deltaJump + extraY) * deltaTime ;
//        if (!fighter.isFacingLeft){
//            fighter.sprite.position.x += (JUMP_X_BOOST + extraX) * deltaTime;
//        } else {
//            fighter.sprite.position.x -= (JUMP_X_BOOST + extraX) * deltaTime;
//        }
//            
//        fighter.jumpIterator--;
//          
//        
//        /*END THE JUMP*/
//        if (fighter.jumpIterator <= 0){
//            //            alert("JUMP ENDED... LENGTH: " + fighter.jumpVerts.length);
//            clearInterval(jumpID);
//            fighter.isJumping = false;
//            fighter.jumpIterator = fighter.jumpVerts.length;
//        }
//        
//    }, 0);
//}
//
//
//
//
//
//
//
//
//
//
//
//
//
//Fighter.prototype.addConsecutiveMove = function(move){
//    
//    this.recentMoves += move;
//    
//    if (this.recentMoves.length >= this.nRecent){                   //Catches the first few 
//        this.recentMoves = this.recentMoves.slice(-this.nRecent);   
//    }
//};
//
//Fighter.prototype.preventConsecutive = function(moveToPrevent, consecutive){
//    
//    if (moveToPrevent === undefined){
//        console.error("RequireConsecutive Error: move is undefined!!");
//        return;
//    }
//    
//    if (consecutive > this.nRecent){
//        consecutive = this.nRecent;
//    }
//    
//    
//    /*Go through the window*/
//    for (var i = 0, len = this.recentMoves.length; i < len; i++){
//        if (this.recentMoves[i] === moveToPrevent){ //http://stackoverflow.com/questions/5943726/string-charatx-or-stringx
//            return false;
//        }
//    }
//    
//    return true; 
//};
//
//
//
//////////////////////////////////////////////////////////////////////////////////////////