
//......................................................................
// Constants

var numCols = 4;
var pictureDimension = 256;
var animationDuration = 200;
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
  
  isZoomedIn: false,
    
  willInsertElement: function() {
    this.$().css(this._resetPosition());
    this.$('.username').css({
      rotateY: Math.PI
    });
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
  },
    
  //.................................................................
  // Event Handlers
  
  touchStart: function(evt) {
    this.$().css('z-index',10);
    $('#curtain').css({
     zIndex: 2,
     opacity: (this.get('isZoomedIn'))? 0.8 : 0
    });
  },
  
  tapEnd: function() {
    if (this.get('isZoomedIn')) {
      this._resetTransforms();
    }
    else {
      this._centerPhoto();
    }
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
      
    $('#curtain').animate({
      opacity:0.8
    }, animationDuration, easing);
      
    this.$().animate({
      scale: 1,
      translateX: 0,
      translateY: 0,
      
      top: document.body.scrollTop,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight
    }, {
      
      duration: animationDuration * 3, 
      easing: easing, 
      complete: function() {
        setTimeout(function() {
          self._showDetails()
        }, 300);
      }
      
    })
    
    // this.$('.username').animate({
    //   rotateY: 0
    // }, 400);    
  },
  
  _showDetails: function() {
    
    this.$('.username').css({
      'WebkitTransformOrigin': '0 50%'
    });

    this.$('.username').animate({
      rotateY: Math.PI
    }, 500, "easeOutElastic");
  },
  
  _resetTransforms: function(accepted) {
    var self = this;
    var position = this._resetPosition();
    this.set('isZoomedIn',false);
    
    $('#curtain').animate({
      opacity:0
    },animationDuration,easing);
    
    this.$().animate({
      scale: 1,
      translateX: 0,
      translateY: 0,
      top: position.top,
      left: position.left,
      width: position.width,
      height: position.height,
    }, animationDuration, easing, function() { 
      $('#curtain').css('z-index',0);
      self.$().css('z-index',1);
    });
    this.$('.username').css({
      rotateY: Math.PI
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
