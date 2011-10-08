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
          username: image.user.username,
          title: (image.caption)? image.caption.text : "",
          itemIndex: i
        }));
      }
    }
  })
});
