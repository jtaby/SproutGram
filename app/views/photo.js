
var numCols = 4;
var pictureDimension = 256;
var animationDuration = 200;

SproutGram.PhotoView = SC.View.extend({
  
  itemIndexBinding: 'parentView.content.itemIndex',
  
  isZoomedIn: false,
  
  tapEnd: function() {
    console.log('tapEnd');
    if (this.get('isZoomedIn')) {
      this._resetTransforms();
    }
    else {
      this._centerPhoto();
    }
  },
  
  touchStart: function(evt) {
    console.log('touchStart');
    this.$().css('z-index',10);
    $('#curtain').css({
     zIndex: 2,
     opacity: (this.get('isZoomedIn'))? 0.8 : 0
    });
  },
  
  mouseDown: function() {
    this.touchStart();
  },
  
  mouseUp: function() {
    this.tapEnd();
  },

  pinchChange: function(recognizer) {    
    var jq = this.$();
    var newScale = recognizer.get('scale');
    var curScale = jq.css('scale');
    
    var boundedScale = Math.max(1,Math.min(1.8, curScale * newScale));
    $('#curtain').css('opacity',boundedScale-1);
    
    this.$().css('scale',function(index, value) {
      return newScale * value
    });
  },

  pinchEnd: function(recognizer) {
    console.log('pinchEnd');
    var velocity = recognizer.get('velocity');
    
    if (velocity >= 0) {
      this._centerPhoto();
    }
    else {
      this._resetTransforms();
    }
  },

  panOptions: {
    numberOfRequiredTouches: 2
  },

  panChange: function(recognizer) {
    var val = recognizer.get('translation');
  
    this.$().css({
      translateX: '%@=%@'.fmt((val.x < 0)? '-' : '+',Math.abs(val.x)),
      translateY: '%@=%@'.fmt((val.y < 0)? '-' : '+',Math.abs(val.y))
    });
  },

  _resetTransforms: function(accepted) {
    var self = this;
    var position = this._resetPosition();
    this.set('isZoomedIn',false);
    
    $('#curtain').animate({
      opacity:0
    },animationDuration);
    
    this.$().animate({
      scale: 1,
      translateX: 0,
      translateY: 0,
      top: position.top,
      left: position.left,
      width: position.width,
      height: position.height,
    }, animationDuration, function() { 
      $('#curtain').css('z-index',0);
      self.$().css('z-index',1);
    })
  },  
  
  _centerPhoto: function() {
    var self = this;
    this.set('isZoomedIn',true);
      
    $('#curtain').animate({
      opacity:0.8
    },animationDuration);
      
    this.$().animate({
      scale: 1.5,
      translateX: 0,
      translateY: 0,
      
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight
    },animationDuration)
  },
  
  willInsertElement: function() {
    this.$().css(this._resetPosition());
  },
  
  _resetPosition: function() {
    var el = this.$();
    var idx = this.get('itemIndex');
    
    var row = Math.floor(idx / numCols);
    var col = idx % numCols;
    
    return {
      top: row * pictureDimension,
      left: col * pictureDimension,
      width: pictureDimension,
      height: pictureDimension
    };
  },

  didInsertElement: function() {
    var canvas = this.$('canvas.image_canvas')[0];
    if (!canvas) return;

    var image = new Image();
    image.src = this.getPath('parentView.content.standard_res');

    image.onload = function() {
      var ctx = canvas.getContext('2d');

      ctx.drawImage(image,50,50,500,500,0,0,pictureDimension,pictureDimension);
    }
  }
});
