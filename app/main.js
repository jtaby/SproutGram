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

  pinchStart: function(recognizer) {
    console.log("pinchstart" + this.toString());
    this.$().css('z-index',10);
    console.log(this.$()[0].style.cssText);
  },

  pinchChange: function(recognizer) {
    this.scale = recognizer.get('scale');
    this._applyTransforms();
    return false;
  },

  pinchEnd: function(recognizer) {
    this._resetTransforms();
    //var velocity = recognizer.get('velocity');

    //if (velocity < 0) {
      //this.$().css('WebkitTransition','-webkit-transform 0.3s ease-out');
      //this.scale = 1;
      //this.translate = {x:0,y:0};
      //this._applyTransforms();
      //this.$().css('z-index',0);

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
    this.translate = recognizer.get('translation');
    this._applyTransforms();
    return false;
  },

  panEnd: function() {
    this._resetTransforms();
  },

  tapEnd: function(recognizer) {
    this.translateZ = 40;
    this._applyTransforms();
  },

  _resetTransforms: function() {
    if (this._isResetting) return;
    this._isResetting = true;
    this.$().css('WebkitTransition','-webkit-transform 0.3s ease-out');
    this.scale = 1;
    this.translate = {x:0,y:0};
    this._applyTransforms();

    var self=this;
    console.log("beforend" + this.toString());
    this.$().bind('webkitTransitionEnd', function( event ) { 
      console.log("afterend" + self.toString());
      self.$().css('z-index',1);
      self.$().css('WebkitTransition','');
      console.log(self.$()[0].style.cssText);
      self._isResetting = false;
    });
  },

  _applyTransforms: function() {
    var string = 'translate3d('+this.translate.x+'px,'+this.translate.y+'px,'+this.translateZ+'px)';
        string += ' scale3d('+this.scale+','+this.scale+',1)';
    this.$().css('-webkit-transform',string);
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
