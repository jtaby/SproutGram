spade.require('sproutcore');
spade.require('sproutcore-touch');

// Create application namespace
var SproutGram = SC.Application.create();

SproutGram.PhotoModel = SC.Object.extend({
  standard_res: null,
  username: null
});

SproutGram.photosController = SC.ArrayProxy.create({ 
  content: [] 
});

SproutGram.PhotosView = SC.CollectionView.extend({ 
  contentBinding: 'SproutGram.photosController'
});

SproutGram.PhotoView = SC.View.extend({
  scale: 1,
  translateZ: 0,
  translate: { x: 0, y: 0 },
  
  touchStart: function(evt) {
    this.$().css('z-index',10);
  },
  
  touchEnd: function(evt) {
  },

  pinchStart: function(recognizer) {
    console.log("pinchstart" + this.toString());
    console.log(this.$()[0].style.cssText);
  },

  pinchChange: function(recognizer) {    
    this.$().css('scale',function(index, value) {
      return recognizer.get('scale') * value
    });
  },

  pinchEnd: function(recognizer) {
    this._resetTransforms();
    //var velocity = recognizer.get('velocity');

    //if (velocity < 0) {
      //this.$().css('WebkitTransition','-webkit-transform 0.3s ease-out');
      //this.scale = 1;
      //this.translate = {x:0,y:0};
      //this._applyTransforms();

      //var self=this;
      //window.setTimeout(function() {
        //this.$().css('WebkitTransition','');
      //}, 30);
    //}
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

  panEnd: function() {
    this._resetTransforms();
  },

  _resetTransforms: function() {
    var self = this;
    
    this.$().animate({
      scale: 1,
      translateX: 0,
      translateY: 0
    }, 300, function() { self.$().css('z-index',1); })
  },

  didInsertElement: function() {
    var canvas = this.$('canvas.image_canvas')[0];
    if (!canvas) return;

    var image = new Image();
    image.src = this.getPath('parentView.content.standard_res');

    image.onload = function() {
      var ctx = canvas.getContext('2d');

      ctx.drawImage(image,50,50,500,500,0,0,256,256);
    }
  }
});

$(document).ready(function() {

  $.ajax({
    url:'https://api.instagram.com/v1/media/popular?access_token=6668562.f59def8.29acda9c153b49448c0948359f774626',
    dataType: "jsonp",

    success:function(response){
      var images = response.data;

      for (var i=0, l=images.length; i<l; i++) {
        var image = images[i];

        SproutGram.photosController.pushObject(SproutGram.PhotoModel.create({
          standard_res: image.images.standard_resolution.url,
          username: image.user.username
        }));
      }
    }
  })
});
