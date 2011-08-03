spade.require('sproutcore');
spade.require('sproutcore-touch');
var SproutGram = SC.Application.create();
SproutGram.PhotoModel = SC.Object.extend({
  standard_res: null,
  username: null
});
SproutGram.photosController = SC.ArrayProxy.create({ content: [] });
SproutGram.PhotosView = SC.CollectionView.extend({ contentBinding: 'SproutGram.photosController'                                                });
SproutGram.PhotoView = SC.View.extend({
  scale: 1,
  translate: { x: 0, y: 0 },
  pinchChange: function(recognizer, scale) {
    this.scale = scale;
    this._applyTransforms();
  },
  panChange: function(recognizer, translation) {
    this.translate = translation;
    this._applyTransforms();
  },
  _applyTransforms: function() {
    var string = 'translate3d('+this.translate.x+'px,'+this.translate.y+'px,0)';
        string += ' scale3d('+this.scale+','+this.scale+',1)';
    this.$().css('-webkit-transform',string);
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
