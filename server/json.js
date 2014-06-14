serveJSON = function() {

  var results = {
      title: getSetting('title'),
      description: getSetting('tagline'),
      site_url: Meteor.absoluteUrl()
  };

    results.sets = [];

    Posts.find({status: STATUS_APPROVED}, {sort: {submitted: -1}, limit: 200}).forEach(function(post) {

        results.sets.push( {
            title: post.headline,
            description: post.body,
            author: post.author,
            date: post.submitted,
            url: (post.url ? getOutgoingUrl(post.url) : getPostUrl(post._id)),
            guid: post._id,
            image1: post.image1,
            caption1: post.caption1,
            image2: post.image2,
            caption2: post.caption2,
            image3: post.image3,
            caption3: post.caption3,
            image4: post.image4,
            caption4: post.caption4,
            image5: post.image5,
            caption5: post.caption5
        });

    });

  
  return JSON.stringify(results, null, 2);;
}
