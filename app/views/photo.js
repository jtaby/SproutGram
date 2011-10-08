
//......................................................................
// Constants

var numCols = 4;
var pictureDimension = 256;
var animationDuration = 500;
var easing = "easeOutExpo";

//......................................................................
// Utilities

jQuery.extend( jQuery.easing,
{
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
});

//......................................................................
// Main Class

SproutGram.PhotoView = SC.View.extend({
  
  itemIndexBinding: 'parentView.content.itemIndex',
  usernameBinding: 'parentView.content.username',
  titleBinding: 'parentView.content.title',
  
  isZoomedIn: false,
    
  willInsertElement: function() {
    this.$().css(this._resetPosition());
    this._hideDetails(true);
  },
    
  //.................................................................
  // Event Handlers
  
  tapEnd: function() {
    if (this.get('isZoomedIn')) {
      this._resetTransforms();
    }
    else {
      this._centerPhoto();
    }
  },

  pinchChange: function(recognizer) {    
    var newScale = recognizer.get('scale');
    var curScale = this.$().css('scale');
    
    var boundedScale = Math.max(1,Math.min(1.8, curScale * newScale));
    $('#curtain').css('opacity',boundedScale-1);
    
    this.$().css('scale',function(index, value) {
      return newScale * value
    });
  },

  pinchEnd: function(recognizer) {
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
  
  //.................................................................
  // Transforms
  
  _centerPhoto: function() {
    var self = this;
    
    this.set('isZoomedIn',true);
      
    $('#curtain').css({
      top: document.body.scrollTop,
      zIndex: 2,
      opacity: (this.get('isZoomedIn'))? 0.9 : 0
    }).animate({
      opacity:0.9
    }, animationDuration, easing);
      
    this.$().css('z-index',10).animate({
      scale: 1,
      translateX: 0,
      translateY: 0,

      top: document.body.scrollTop,
      left: 0,

      width: window.innerWidth,
      height: window.innerHeight
    }, {
      duration: animationDuration,
      easing: easing,
      complete: function() {
        window.setTimeout(function(){self._showDetails();},200);
      }
    });       
  },
  
  _hideDetails: function(instant) {
    var func = (instant === undefined)? 'animate' : 'css';

    this.$('.details').stop()[func]({
      rotateY: Math.PI
    }, 1000, "easeOutExpo");

    this.$('.comments').stop()[func]({
      rotateY: -Math.PI
    }, 1000, "easeOutExpo");
  },
  
  _showDetails: function(instant) {
    var func = (instant === undefined)? 'animate' : 'css';

    this.$('.details').stop()[func]({
      rotateY: 0
    }, 1000, "easeOutElastic");

    this.$('.comments').stop()[func]({
      rotateY: 0
    }, 1000, "easeOutElastic");
  },
  
  _resetTransforms: function(accepted) {
    var self = this;
    var position = this._resetPosition();
    this.set('isZoomedIn',false);
    
    $('#curtain').animate({
      opacity:0
    },animationDuration,easing);
    
    this._hideDetails();
    
    this.$().animate({
      scale: 1,
      translateX: 0,
      translateY: 0,
      top: position.top,
      left: position.left,
      width: position.width,
      height: position.height,
    }, {
      
      duration: animationDuration, 
      easing: easing ,
      complete: function() { 
        $('#curtain').css('z-index',0);
        self.$().css('z-index',1);
      }
    });
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
  }

});
