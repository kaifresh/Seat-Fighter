/*THINK OF EACH MOVE AS A LETTER
 * 
 * 
 * Left = L
 * Right = R
 * Punch = P
 * Block = B
 * 
 * */
var NGram = function (windowSize){
    
    this.windowLen = typeof windowSize === undefined ? 5 : windowSize;  //Checking for 'undefined'
    this.windowLen = this.windowLen < 2 ? 2 : this.windowLen;            //Forcing size 2
    
    this.nGrams = {}; 
    
    this.windowStr = "";
};

NGram.prototype.recordLetter = function(letter){
    
//    console.log("recordLetter(): " + letter + ". Current window: " + this.windowStr);
    
    if (letter.length > 1){
        letter = letter.slice(-1); //http://stackoverflow.com/questions/3884632/how-to-get-the-last-character-of-a-string //HOT OFF THE PRESS
    }
    
    /*RECALL THAT YOU'RE NOT REALLY DEALING WITH JUST LETTERS IF YOU GOT ARROWS ETC...*/
        this.windowStr += letter;
    
    /*CAN SKIP ALL THE PROCESSING BELOW IF YOU'VE ONLY GOT A 1 LETTER STRING (unigram)
     * coz there aint no prefix
     * */
    if (this.windowStr.length < 2){
        return;
    } /*PREMATURE FINISHER!*/
    
    
    
    //Keep only the last 'this.windowLen' chars
    /*http://stackoverflow.com/questions/5873810/how-can-i-get-last-characters-of-a-string-using-javascript*/
    if (this.windowStr.length > this.windowLen){
        this.windowStr = this.windowStr.slice(-this.windowLen);       
    }
    
    /*Add it to the map - with all the checks n shit*/
    var prefix = this.windowStr.slice(0, this.windowLen - 1);       //Minus 1 for zero indexing
    var suffix = {str: this.windowStr.slice(-1), priority: 0};      //SUFFIX HAS PRIORITY VALUE
    
    /***ADDING THE DATA***/
    
    /*If the prefix doesn't exist currently, add it*/
    if (!this.nGrams.hasOwnProperty(prefix)){               //http://stackoverflow.com/questions/455338/how-do-i-check-if-an-object-has-a-key-in-javascript
//        console.log("** ADDING NEW PREFIX: " + prefix + " WITH SUFFIX: " + suffix.str);
        
        /*
         * nGrams is an Object with | prefix:suffix-array | key:value | pairs
         * each suffix-array contains all the suffixes. 
         * each suffix/key is in turn an object containing: 1) the string  2) its priority (i.e. number of occurences)
         * 
         * object --> array --> object --> string/priority
         */
        
        this.nGrams[prefix] = [];           //Make a new suffix array
        this.nGrams[prefix].push(suffix);   //Stre the suffix in the new array
    
    
        /*If the prefix does exist, then add another suffix to that prefix's array*/
    } else {
        
//        console.log("** This prefix (" + prefix + ") is already there, adding '" + suffix.str +  "' to its suffix array");
        
        /*IF THE SUFFIX IS ALREADY THERE TOO - dont add, just bump up its priority*/
        var alreadyThere = false;
        for (var i = 0, len = this.nGrams[prefix].length; i < len; i ++){
            
            if (this.nGrams[prefix][i].str === suffix.str){
                
                this.nGrams[prefix][i].priority++;
                alreadyThere = true;
             
                /*Sort
              * This means you can always choose suffix[0] as its the most common one.
              * Only need to sort when changing priorities. This is because All new ones just go to the back anyway.
              * SO i guess its QUEUE/FIFO to some extent too.
              */
             
           
                 this.nGrams[prefix].sort(priorityCompare);
                 
                 break; //Escape the for loop early
            }
        }
        
      
        /*If its a new suffix*/
        if (!alreadyThere){
            this.nGrams[prefix].push(suffix);   //Stre the suffix in the new array
        }
        
    }    
}

/*SORT FUNCTION*/
//http://stackoverflow.com/questions/1129216/sorting-objects-in-an-array-by-a-field-value-in-javascript
function priorityCompare(a, b){
//    console.log("SORT: " + a.priority + " VS " + b.priority);
    if (a.priority < b.priority){
        return 1;
    }
    if (a.priority > b.priority){
        return -1;
    }
    return 0;
}

NGram.prototype.whatsNext = function(print){
    
    var probeLength = this.windowLen - 1;
    var currentStr = this.windowStr;
    
    if (currentStr.length > probeLength){
        currentStr = currentStr.slice(-probeLength);
    }
    
    /*Could write this more succintly if you skipped the printing*/
    var predicted = 0;
    if (this.nGrams.hasOwnProperty(currentStr)){
        predicted = this.nGrams[currentStr][0].str;
        if (print) console.log("Current N-1 window : " + currentStr + "... Predicted next: " + predicted);
    
        
        
    } else if (print) {
       console.log("nGrammer is yet to encounter [" + currentStr + "], you're on your own -1");
    }
  
    return predicted;
};

NGram.prototype.feedbackPriority = function (prefix, suffix, priority){
    
    if (this.nGrams.hasOwnProperty(prefix)){
        for (var i = 0, len = this.nGrams[prefix].length; i < len; i++){
            if (this.nGrams[prefix][i].str === suffix){
                this.nGrams[prefix][i].priority = priority;
                

                  console.log(prefix + " : " + suffix + " priority updated to " + this.nGrams[prefix][i].priority);
                
                this.nGrams[prefix].sort(priorityCompare);

            }
        }
        
    }
    
  
    
}

NGram.prototype.printContents = function(){
    console.log("****PRINT CONTENTS ********** ___ current window: " + this.windowStr);
//    var keys = Object.keys(this.nGrams);

    for (var prefix in this.nGrams) {
        
        if (this.nGrams.hasOwnProperty(prefix)) {
            var output = "Prefix: ->" + prefix + "<-\n";
           

            var suffixArray = this.nGrams[prefix];
            for (var i = 0, len = suffixArray.length; i < len; i++){
                output += "suffixArray[" + i + "]: " + suffixArray[i].str + ". Priority: " + suffixArray[i].priority + ". "; 
            }
            console.log(output);  
        }
    }
    
}
