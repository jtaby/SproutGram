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
    url:'https://api.instagram.com/v1/media/popular?client_id=92cf548d90fa4b98b4a5cdc5f9f70999',
    dataType: "jsonp",

    success:function(response){
      var images = response.data;

      for (var i=0, l=25; i<l; i++) {
        var image = images[i];

        var userComments = [];

        image.comments.data.forEach(function(comment) {
          userComments.push({
            text: comment.text,
            commenter: comment.from.username
          })
        });

        SproutGram.photosController.pushObject(SproutGram.PhotoModel.create({
          standard_res: image.images.standard_resolution.url,
          username: image.user.username,
          comments: userComments,
          title: (image.caption)? image.caption.text : "No title",
          itemIndex: i
        }));
      }
    }
  })
});
