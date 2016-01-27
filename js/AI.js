var ALWAYS_APPROACH_DIST = 2.5;

/****************STREETH FIGHTER AI*****************/
function handleAI(player, computer){
    
    alwaysFacePlayer(player, computer);
    whatToDo(player, computer, {debug: false, printRepeats: false});
};


/*AI CHOOSING*/
var AI_INTERVAL = 3000;
var canGoAgain = true;
var computerMoves = {};
function whatToDo(player, computer, options){
    
    /* PRE-CACHE THE POSSIBLE MOVES FOR USE W PROBABILITY PICKER
     * 
     * Partial allows you to use *functions with args* AS args   (otherwise u cant use args)
     * Bind keeps 'this' refering to the calling object when it goes into partial .....(VS 'this' now refering to the method itself) --- HUGELY IMPORTANT
     *              
     *              Refs: 
     *                http://stackoverflow.com/questions/321113/how-can-i-pre-set-arguments-in-javascript-function-call-partial-function-appli
                    http://stackoverflow.com/questions/373157/how-can-i-pass-a-reference-to-a-function-with-parameters?lq=1           
                http://javascriptissexy.com/javascript-apply-call-and-bind-methods-are-essential-for-javascript-professionals/
     * */
    if ($.isEmptyObject(computerMoves)){ //So it only runs once
        computerMoves.punch = partial(computer.attack.bind(computer), player, "punch"); //(Function, param, param) //X
        computerMoves.jump = computer.jump.bind(computer); //X
        computerMoves.bigJump = computer.compBigJumpOver.bind(computer); //X     
        computerMoves.evasiveJump = partial(computer.compEvasiveJump.bind(computer), player);//X
        computerMoves.block = computer.block.bind(computer);//X
        computerMoves.moveRight = computer.moveRight.bind(computer); //X
        computerMoves.moveLeft = computer.moveLeft.bind(computer);//X
        computerMoves.backAway = partial(computer.backAwayFromEnemy.bind(computer), player);
        computerMoves.idle = computer.idle.bind(computer);
        
    }
    //probabilityPicker(computerMoves.backAway, 1);
    /*This flag is modified by a timeout preventing the AI from doing too many moves too fast*/
    if (canGoAgain){
                       
        var APPROACH_STATUS = safeToApproach(player, computer); //Cache the value
        
        if (Math.abs(APPROACH_STATUS) === 2){ 
            $("#turnbull-name").css("color", "#FF0000");
        } else {
            $("#turnbull-name").css("color", "#FFFFFF");
        }
                       
        var noJitterProbability = calculateJitterProbabilities(computer);
        
        $("#comp-nojitter span").text(computer.noJitter);
        $("#comp-critMoves span").text( computer.nMovesInDirection);
        $("#comp-probability-left").text(noJitterProbability.left);
        $("#comp-probability-right").text(noJitterProbability.right);
        $("#comp-approachStatus span").text(APPROACH_STATUS);
        
    
         var predictedNext =  nGrammer.whatsNext();
        predictedNext = predictedNext === -1 ? 0 : predictedNext;
        //                console.log("Whats next?: " + predictedNext +  " (punch = "+ String.fromCharCode(AttackPunch)  + ")");

        
        /*SAFE TO APPROACH. -1 or 1 means outside the danger zone
         * -1 0 1 (left to right)
         * */
        if (APPROACH_STATUS === -1){ //If you're on the left move right
            probabilityPicker(computerMoves.moveLeft, noJitterProbability.left, computerMoves.idle, noJitterProbability.right);
            
        } else if (APPROACH_STATUS === 1){
            probabilityPicker(computerMoves.moveRight, noJitterProbability.right, computerMoves.idle, noJitterProbability.left);
            
            
            /*NEAR THE DANGER ZONE: but still too far away to get punched*/
        } else if (APPROACH_STATUS === 2){    
            
            probabilityPicker(computerMoves.moveRight, 0.25, computerMoves.evasiveJump, 0.01, computerMoves.block, 0.3, computerMoves.idle, 0.44);
//            computer.sprite.material.color = new THREE.Color(1, 0, 1);
            
        } else if (APPROACH_STATUS === -2){   
            probabilityPicker(computerMoves.moveLeft, 0.25, computerMoves.evasiveJump, 0.01, computerMoves.block, 0.3, computerMoves.idle, 0.44);
//            computer.sprite.material.color = new THREE.Color(1, 0, 1);
            /*TIME TO PUNCH*/
        } else {    
            
            if (closeEnoughToAttack(player, computer, atkDist.punch)){
                
                if (options.printRepeats) console.log("can go again!");
                canGoAgain = false;
                
                /*Predicting a punch (most of the time I think)*/
                if (String.fromCharCode(AttackPunch) === predictedNext){
                    if (options.debug) console.log("Attack predicted");
                    probabilityPicker(computerMoves.punch, 0.7, computerMoves.block, 0.2, computerMoves.backAway, 0.05, computerMoves.bigJump, 0.025, computerMoves.evasiveJump, 0.025);
//                    computer.sprite.material.color = new THREE.Color(0, 0, 1);
                } 
                
                /*If Being blocked
                 * 1. BIG JUMP
                 * 2. Block Also
                 * */
                else if (String.fromCharCode(Block) === predictedNext){
                    
                    if (options.debug) console.log("Block predicted");
//                    computer.sprite.material.color = new THREE.Color(1,1, 0);
                    
                    probabilityPicker(computerMoves.bigJump, 0.3, computerMoves.block, 0.3, computerMoves.punch, 0.3, computerMoves.backAway, 0.1);
                }
                
                /*If anytihng else is predicted*/
                else {
                    if (options.debug) console.log("UNDEFINED predicted");
                    probabilityPicker(computerMoves.punch, 0.7, computerMoves.block, 0.15, computerMoves.idle, 0.15);
//                    computer.sprite.material.color = new THREE.Color(0,1, 0);
                }                                
                
            }
        }
        /*Prevent the AI from making another move within AI_INVTERVAL time of another one */
        setTimeout(function(){canGoAgain = true;}, AI_INTERVAL);
    }
}

function calculateJitterProbabilities(computer){
        
    var probabilityL = 0, probabilityR = 0;
        var likely = .8;
        var unlikely = .2;
        var even = .5;
        
        /*SETTING PROBABILITIES FOR USE BELOW*/       
        /*L: If the computer has been going LEFT (negative numbers)*/
        if (computer.noJitter < 0){
            
            /*L: If the number of left moves HASNT gone past the threshhold value*/
            if (computer.noJitter > -computer.nMovesInDirection){
                probabilityL = likely; 
                probabilityR = unlikely;
            } 
            /*L: If there have been enough Left moves*/
            else if (computer.noJitter < -computer.nMovesInDirection){
                probabilityL = even; 
                probabilityR = even;
            }
            
            /*R: if computer moves right (positive numbers)*/   
        } else if (computer.noJitter > 0){
            
            /*R: If the number of R moves HASNT gone past the threshhold value*/
            if (computer.noJitter < computer.nMovesInDirection){
                probabilityL = likely; 
                probabilityR = unlikely;
            } 
            /*R: If there have been enough R moves*/
            else if (computer.noJitter > computer.nMovesInDirection){
                probabilityL = even; 
                probabilityR = even;
            }
            
        } else {
            probabilityL = even; 
            probabilityR = even;
        }
        
        
 
    return {
        left: probabilityL,
        right: probabilityR
    }
};

/***N-GRAM TIME!!***/
/*IMPORTANT: Letters are added to it in userControls.js*/
var nGrammer = new NGram(3);






/*MORE COGNIITIVE EVALUATION FUNCTIONS*/
function closeEnoughToAttack(player, computer, attackDistance){
    
    /*As the computer: if the player is on my right and at a good distance, move right*/
    if (computer.isOnMyRight(player)){
        if (computer.distanceFromMyRight(player) <= attackDistance){
            return true;
        } 
    } else {
        if (computer.distanceFromMyLeft(player) <= attackDistance){
            return true;
        } 
    }
    
    return false;
}

/*Safe To Approach Returns either -1 0 1 to indicate the direction
 * -1 = move left
 *  0 = dont move
 *  1 = move right
 * */
function safeToApproach(player, computer){
    
    /*As the computer: if the player is on my right and at a good distance, move right*/
    if (computer.isOnMyRight(player)){
        
        if (computer.distanceFromMyRight(player) > ALWAYS_APPROACH_DIST){
            return 1;
        } else if (computer.distanceFromMyRight(player) > atkDist.kick){ /*WITHIN THE ZONE BUT STILL TOO FAR TO GET HIT*/
            return 2;
        }
        
    } else {
        
        if (computer.distanceFromMyLeft(player) > ALWAYS_APPROACH_DIST){
            return -1;
        } else if (computer.distanceFromMyLeft(player) > atkDist.kick){
            return -2;
        }
    }
    
    return 0; //its punching time
}







/*BASIC ATTACKING FUNCTIONS*/
function punchPlayer(player, computer){
    
    currentAttack.distance = atkDist.punch;
    currentAttack.strength = atkStngth.punch;
    computer.genericAttack(player, currentAttack.distance, currentAttack.strength);
    computer.animateAttack(computer, "punch", 200);
    
    
}

/*BASIC MOVEMENT FUNCTIONS*/
function alwaysFacePlayer(player, computer){
    
    /*If player is to the right of the computer*/
    if (computer.isOnMyRight(player)){
        computer.faceRight();
    } else if (computer.isOnMyLeft(player)){
        computer.faceLeft();
    }
    
}

function moveTowardsPlayer(player, computer){
    
    /*If player is to the right of the computer*/
    if (computer.isOnMyLeft(player)){
        computer.moveLeft();
    } else if (computer.isOnMyRight(player)){
        computer.moveRight();
    }
    
    
}



/*****BOOLEAN CONVENIECEN METHODS****/
//function isToTheRightOf