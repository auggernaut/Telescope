// Template.post_edit.preserve(['#title', '#url', '#editor', '#sticky']);

// Template.post_edit.preserve({
//   // 'input[id]': function (node) { return node.id; }
//    '[name]': function(node) { return node.getAttribute('name');}
// });

Template.post_edit.created = function () {
    post = Posts.findOne(this.data.postId);
}

Template.post_edit.helpers({
    post: function () {
        return Posts.findOne(this.postId);
    },
    created: function () {
        return moment(this.createdAt).format("MMMM Do, h:mm:ss a");
    },
    categories: function () {
        var post = this;
        return Categories.find().map(function (category) {
            category.checked = _.contains(_.pluck(post.categories, '_id'), category._id) ? 'checked' : '';
            return category;
        });
    },
    categoriesEnabled: function () {
        return Categories.find().count();
    },
    isApproved: function () {
        return this.status == STATUS_APPROVED;
    },
    isSticky: function () {
        return this.sticky ? 'checked' : '';
    },
    isSelected: function () {
        return post && this._id == post.userId ? 'selected' : '';
    },
    submittedDate: function () {
        return moment(this.submitted).format("MM/DD/YYYY");
    },
    submittedTime: function () {
        return moment(this.submitted).format("HH:mm");
    },
    users: function () {
        return Meteor.users.find().fetch();
    },
    userName: function () {
        return getDisplayName(this);
    },
    hasStatusPending: function () {
        return this.status == STATUS_PENDING ? 'checked' : '';
    },
    hasStatusApproved: function () {
        return this.status == STATUS_APPROVED ? 'checked' : '';
    },
    hasStatusRejected: function () {
        return this.status == STATUS_REJECTED ? 'checked' : '';
    },
    shorten: function () {
        return !!getSetting('bitlyToken');
    }
});

Template.post_edit.rendered = function () {
    if (post && !this.editor) {

        this.editor = new EpicEditor(EpicEditorOptions).load();
        this.editor.importFile('editor', post.body);

        $('#submitted_date').datepicker();

    }

    $("#postUser").selectToAutocomplete();

}

Template.post_edit.events({
    'click input[type=submit]': function (e, instance) {
        var post = this;
        var categories = [];
        var url = $('#url').val();
        var shortUrl = $('#short-url').val();
        var status = parseInt($('input[name=status]:checked').val());
        var image1 = $('#image1').val();
        var image2 = $('#image2').val();
        var image3 = $('#image3').val();
        var image4 = $('#image4').val();
        var image5 = $('#image5').val();
        var caption1 = $('#caption1').val();
        var caption2 = $('#caption2').val();
        var caption3 = $('#caption3').val();
        var caption4 = $('#caption4').val();
        var caption5 = $('#caption5').val();

        e.preventDefault();
        if (!Meteor.user()) {
            throwError('You must be logged in.');
            return false;
        }

        $('input[name=category]:checked').each(function () {
            var categoryId = $(this).val();
            if (category = Categories.findOne(categoryId))
                categories.push(category);
        });

        var properties = {
            headline: $('#title').val(),
            shortUrl: shortUrl,
            body: instance.editor.exportFile(),
            categories: categories,
            image1: image1,
            image2: image2,
            image3: image3,
            image4: image4,
            image5: image5,
            caption1: caption1,
            caption2: caption2,
            caption3: caption3,
            caption4: caption4,
            caption5: caption5
        };

        if (url) {
            properties.url = (url.substring(0, 7) == "http://" || url.substring(0, 8) == "https://") ? url : "http://" + url;
        }

        if (isAdmin(Meteor.user())) {
            if (status == STATUS_APPROVED) {
                if (!post.submitted) {
                    // this is the first time we are approving the post
                    properties.submitted = new Date().getTime();
                } else if ($('#submitted_date').exists()) {
                    properties.submitted = parseInt(moment($('#submitted_date').val() + $('#submitted_time').val(), "MM/DD/YYYY HH:mm").valueOf());
                }
            }
            adminProperties = {
                sticky: !!$('#sticky').attr('checked'),
                userId: $('#postUser').val(),
                status: status,
            };
            properties = _.extend(properties, adminProperties);
        }

        Posts.update(post._id, {
            $set: properties
        }, function (error) {
            if (error) {
                console.log(error);
                throwError(error.reason);
            } else {
                trackEvent("edit post", {'postId': post._id});
                Router.go("/posts/" + post._id);
            }
        });
    },
    'click .delete-link': function (e) {
        var post = this;

        e.preventDefault();

        if (confirm("Are you sure?")) {
            Meteor.call("deletePostById", post._id, function (error) {
                if (error) {
                    console.log(error);
                    throwError(error.reason);
                } else {
                    Router.go("/posts/deleted");
                }
            });
        }
    }
});