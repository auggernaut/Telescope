serveJSON = function() {

  var results = {
      title: getSetting('title'),
      description: getSetting('tagline'),
      site_url: Meteor.absoluteUrl()
  };

    results.items = [];

    Posts.find({status: STATUS_APPROVED}, {sort: {submitted: -1}, limit: 200}).forEach(function(post) {

        results.items.push( {
            title: post.headline,
            description: post.body+'</br></br> <a href="'+getPostUrl(post._id)+'">Comments</a>',
            author: post.author,
            date: post.submitted,
            url: (post.url ? getOutgoingUrl(post.url) : getPostUrl(post._id)),
            guid: post._id,
            image1: post.image1,
            caption1: post.caption1,
            image2: post.image2,
            caption2: post.caption2,
            image3: post.image3,
            caption3: post.caption3
        });

    });

  
  return JSON.stringify(results, null, 2);;
}
