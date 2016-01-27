/*http://stemkoski.github.io/Three.js/Texture-Animation.html*/
function TextureAnimator( texture, tilesHoriz, tilesVert, numTiles, tileDispDuration )
{
  // note: texture passed by reference, will be updated by the update function.

  this.tilesHorizontal = tilesHoriz;
  this.tilesVertical = tilesVert;
  // how many images does this spritesheet contain?
  //  usually equals tilesHoriz * tilesVert, but not necessarily,
  //  if there at blank tiles at the bottom of the spritesheet.
  this.numberOfTiles = numTiles;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

  // how long should each image be displayed?
  this.tileDisplayDuration = tileDispDuration;

  // how long has the current image been displayed?
  this.currentDisplayTime = 0;

  // which image is currently being displayed?
  this.currentTile = 0;

  var shouldAnimateForward = true;

  this.updateWithTime = function( milliSec )
  {

    this.currentDisplayTime += milliSec;
    while ( this.currentDisplayTime > this.tileDisplayDuration ) {

      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTile += shouldAnimateForward ? 1: -1;

      if ( this.currentTile == this.numberOfTiles ||
           this.currentTile == -1 ) {
        shouldAnimateForward = !shouldAnimateForward;
        this.currentTile = shouldAnimateForward ? 1: this.numberOfTiles - 2;
      }

      var currentColumn = this.currentTile % this.tilesHorizontal;
      texture.offset.x = currentColumn / this.tilesHorizontal;

      var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
      texture.offset.y = currentRow / this.tilesVertical;

    }
  };
  
    this.update = function( action ){
        
        if (action === "idle"){
            
            if (idleFlag){
                this.currentTile = 0;
            } else {
                this.currentTile = 3;
            }
            
        }
        if (action === "punch"){
            this.currentTile = 1;
        }
        if (action === "block"){
            this.currentTile = 2;
        }
        
        //			this.currentDisplayTime -= this.tileDisplayDuration;
//			this.currentTile++;
//			if (this.currentTile == this.numberOfTiles)
//				this.currentTile = 0;
                            
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
	};
  
}


var idleFlag = false;
var timeout = setInterval(function(){
    idleFlag = idleFlag == true ? false : true; 
}, 3000);

