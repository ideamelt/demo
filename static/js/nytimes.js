/* Initialize */

var melt = window.melt || {};

melt.wtActive = false;

IdeaMelt.init({
	"api_key": "im.stocial"
});












(function() {
    if (typeof window.janrain !== 'object') window.janrain = {};
    if (typeof window.janrain.settings !== 'object') window.janrain.settings = {};
    
	janrain.settings.custom = true;
	janrain.settings.tokenAction='event';

    function isReady() { janrain.ready = true; };
    if (document.addEventListener) {
      document.addEventListener("DOMContentLoaded", isReady, false);
    } else {
      window.attachEvent('onload', isReady);
    }

    var e = document.createElement('script');
    e.type = 'text/javascript';
    e.id = 'janrainAuthWidget';

    if (document.location.protocol === 'https:') {
      e.src = 'https://rpxnow.com/js/lib/fuseconcepts/engage.js';
    } else {
      e.src = 'http://widget-cdn.rpxnow.com/js/lib/fuseconcepts/engage.js';
    }

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(e, s);
})();


melt.auth = {};

melt.auth.init = function() {	
	janrainWidgetOnload = function() {
		janrain.events.onProviderLoginToken.addHandler(function(response) {
			melt.auth.sendToken(response)
		});
	}
}

melt.auth.sendToken = function(response) {
	$.ajax({
		type: "POST",
		url: "http://ideamelt.com/api/auth",
		data: {
			token: response.token,
			channel: Backplane.getChannelID()
		},
		success: function(response) {
			melt.auth.success(response);
		},
		error: function(response) {
			melt.auth.error(response);
		}
	});
}

melt.auth.triggerFlow = function(provider) {
	if(melt.wtActive) $('.imWTGuest').addClass('imWTActive');
	$('.melt-ss-cta').text('Logging in...');
	$('.melt-ss-provider').addClass('ss-disabled');
	janrain.engage.signin.triggerFlow(provider);
}

melt.auth.success = function(response) {
	Backplane.expectMessages(["identity/ack"]);
	console.log(response);
}

melt.auth.error = function(response) {
	console.log(response);
	melt.auth.render(true);
}

melt.auth.render = function(show) {
	if(show) {
		//show login controls
	 	$('.melt-ss-cta').text('Single Sign-In');
		$('.melt-ss-provider').removeClass('ss-disabled');
		$('.melt-ss-container').show();
	}
	else {
		//hide login controls
		$('.melt-ss-container').hide();
	}
}













Echo.Loader.initEnvironment(function() {

	Backplane.init({
		"serverBaseURL": "http://api.echoenabled.com/v1",
		"busName": 'fuseconcepts'
	});

	Echo.Events.subscribe({
	    "topic": "Echo.UserSession.onInit",
	    "handler": function(topic, data) {
	    	if(Echo.UserSession.data.identities.length != 0 && Echo.UserSession.data.identities[0].identityUrl == 'http://ideamelt.com/user/guest' && !melt.wtActive) {
	    		Echo.UserSession.logout();
	    	}
	    	else if(Echo.UserSession.data.identities.length != 0) { 
	   			melt.go = true;
    			melt.auth.render(false);
    			melt.getFriends('following', true);
    			melt.getFriends('followers', true);
	    	}
	    	else if (Echo.UserSession.data.identities.length == 0) { 
	    		melt.go = false;
	    		melt.auth.render(true);
	    		melt.resetState();
	    		melt.injectDefaultUsers();
	    	}
	    }
	});

	$(function() {

		Echo.Loader.initApplication({
			"script": "http://cdn.echoenabled.com/sdk/v3/identityserver.pack.js",
			"component": "Echo.IdentityServer.Controls.Auth",
			"config": {
				"target": document.getElementById("echo-auth"),
				"appkey": 'dev.fuseconcepts',
				"cdnBaseURL": {"sdk": "http://cdn.echoenabled.com/sdk/v3"},
				'ready': function() {
					melt.echoAuth = this;
				}
			}
		});

		Echo.Loader.initApplication({
			'script': 'http://ideamelt.com/static/apps/3.0/im.socialstream.js',
			'component': 'IdeaMelt.Apps.SocialStream',
			'config': {
				"target": document.getElementById("stream"),
				"appkey": 'dev.fuseconcepts',
				"imAppkey": 'im.stocial',
				"baseDomain": 'http://stocial.com',
				"namespace": 'ideamelt',
				"personalize": false,
				"userUrls": false,
				"aggregator": true,
				"autoLikeNotifs": true,
				"autoReplyNotifs": true,
				'ready': function() {
					melt.stream = this;
				}
			}
		});

		Echo.Loader.initApplication({
			'script': 'http://ideamelt.com/static/apps/3.0/im.socialstream.js',
			'component': 'IdeaMelt.Apps.SocialStream',
			'config': {
				"target": document.getElementById("ticker"),
				"appkey": 'dev.fuseconcepts',
				"imAppkey": 'im.stocial',
				"namespace": 'ideamelt',
				"baseDomain": 'http://stocial.com',
				"personalize": false,
				"userUrls": false,
				"aggregator": false,
				"compact" : true,
				'ready': function() {
					melt.ticker = this;
				}
			}
		});

		Echo.Loader.initApplication({
			'script': 'http://ideamelt.com/static/apps/3.0/im.thenotifier.js',
			'component': 'IdeaMelt.Apps.TheNotifier',
			'config': {
				"target": document.getElementById("notifier"),
				"appkey": 'dev.fuseconcepts',
				"imAppkey": 'im.stocial',
				"baseDomain": 'http://stocial.com',
				'ready': function() {
					melt.notifier = this;
				}
			}
		});

		melt.userProfile = new IdeaMelt.Apps.UserProfile({
			targets: {
				stream: document.getElementById('imUserStream'),
				title: document.getElementById('imUserTitle'),
				avatar: document.getElementById('imUserAvatar'),
				followers: document.getElementById('imUserFollowers'),
				followees: document.getElementById('imUserFollowees'),
			},
			appkey: 'dev.fuseconcepts',
			imAppkey: 'im.stocial',
			baseDomain: 'http://stocial.com',
			userUrl: false,
			namespace: 'ideamelt'
		});

	});
});





























melt.disableLinks = function() {
	//NAV
	$('.nav.column a').attr('href', 'javascript:void(0)');

	//FOOTER
	$('.pageFooter a').attr('href', 'javascript:void(0)');

	//SECTIONHEADER
	$('.sectionHeaderHome a').attr('href', 'javascript:void(0)');

	//KICKER
	$('.kicker a').attr('href', 'javascript:void(0)');
};

melt.createStory = function(url, action) {
	var options = {
		user_url: Echo.UserSession.get('identityUrl'),
		action_type: action,
		object_type: "article",
		object_url: url
	}
	var success = function(result) {
		console.log(result);
	}
	var fail = function(result) {
		console.log(result);
	}
	IdeaMelt.send('StoryCreate', options, success, fail)
}

melt.contentButtons = function(link) {
	$('#imContentHeader .imHeaderButton').each(function() {
		$(this).data('link', link);
	})
}

melt.getContentLink = function(link) {
	var url = 'http://ideamelt.com/api/getpage?link=' + link + ' #article';
	$('#imContentBody').load(url, function(a, b){
		if(b === "success") {
			melt.createStory(link, "read");
			melt.cleanseContent();
			melt.toggleModal('Content');
			melt.initComments(link);
			melt.contentButtons(link);
			$('#imContentHeader .imHeaderButton').removeClass('imButtonDisabled');
		}
	});
}

melt.cleanseContent = function() {
	$('#imContentBody a').attr('href', 'javascript:void(0)');
	$('#imContentBody #article .columnGroup').each(function() {
		if(!$(this).hasClass('first')) $(this).remove();
	})
}

melt.transformLinks = function() {
	$('.wideB.module, #cColumnTopSpanRegion').on('click', 'a', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var link = $(this).attr('href');
		melt.getContentLink(link.substr(0, link.lastIndexOf('?')) + '?pagewanted=all')	
	});
};

melt.toggleModal = function (name) {
	if(name == "User") var opposite = "Content";
	else if(name == "Content") var opposite = "User";
	var element = '#im' + name + 'Modal';
	var $modal = $(element);
	if($modal.hasClass('hidden')) {
		$modal.removeClass('hidden');
	}
	var element = '#im' + opposite + 'Modal';
	var $modal = $(element);
	if(!$modal.hasClass('hidden')) {
		$modal.addClass('hidden');
	}
}

melt.closeModal = function (name) {
	var element = '#im' + name + 'Modal';
	var $modal = $(element);
	if(!$modal.hasClass('hidden')) {
		$modal.addClass('hidden');
	}
}

melt.getFriends = function(type, render) {
	// type can be either followers or following

	type = type.toLowerCase();
	if (melt.friends == undefined) {melt.friends = {};}
	if (melt.friends.urls == undefined) {melt.friends.urls = {};}

	var options = {'user_url' : Echo.UserSession.get('identityUrl')}
	var success = function(response) {
		melt.friends[type] = response[type + '_list'];
		melt.friendsToList(type);
		if(render) melt.renderFriends(type);
	}
	IdeaMelt.send('User' + type.charAt(0).toUpperCase() + type.slice(1), options, success);
}

melt.friendsToList = function(type) {
	melt.friends.urls[type] = [];
	$.each(melt.friends[type], function(index, item) {
		melt.friends.urls[type].push(item.url);
	});
}

melt.renderFriends = function(type) {
	// type can be either followers or following

	type = type.toLowerCase();
	var tmp = $('<div>')
	$.each(melt.friends[type], function(i) {
		if(i % 5 == 0) {tmp.append('<div class="imFriendsRow clearfix"></div>');}
		tmp.find('.imFriendsRow:last-child').append(
			'<a class="ideamelt imFriendsItem" data-title="' + melt.friends[type][i].title + '" data-url="' + melt.friends[type][i].url + '">' + 
				'<img class="imFriendsAvatar" src="' + melt.friends[type][i].avatar + '"/>' +
				'<div class="imFriendsName">' + melt.friends[type][i].title + '</div>' +
			'</a>'
		);
	});
	$('#' + type).empty().append(tmp);

	melt.injectDefaultUsers();
}

melt.toggleFriends = function(id) {
	$('#imFriendsSwitch .imSwitchButton').removeClass('active');
	$('#imFriendsSwitch [data-switch="' + id + '"]').addClass('active');
	$('.imFriendsBox').hide(0);
	$('#' + id).show(0);
};

melt.toggleStream = function(id) {
	$('#imStreamSwitch .imSwitchButton').removeClass('active');
	$('#imStreamSwitch [data-switch="' + id + '"]').addClass('active');
	if (id == 'fg') {
		melt.stream.config.set('userUrls', melt.friends.urls.following);
	}
	else if (id == 'eo') {
		melt.stream.config.set('userUrls',[]);
	}
	else console.log('toggleStream error');
	melt.stream.refresh();
}

melt.getUserModal = function(title, url) {
	melt.userProfile.changeUser(url);
	$('#imUserHeader .imHeaderButton').data('url', url).data('title', title);
	melt.checkRelationship(url);
	melt.toggleUserSwitch('imUserStream');
	melt.toggleModal('User');
}

melt.toggleUserSwitch = function(id) {
	$('#imUserSwitch .imSwitchButton').removeClass('active');
	$('#imUserSwitch [data-switch="' + id + '"]').addClass('active');
	$('.imUserSwitchBox').hide(0);
	$('#' + id).show(0);
}

melt.checkRelationship = function(url) {
	var button = $('#imUserHeader .imHeaderButton');
	button.addClass('imButtonDisabled');
	if(!melt.go) {button.text('Log in to follow ' + button.data('title')).addClass('imButtonLoggedOut');}
	else {
		if($.inArray(url, melt.friends.urls.following) > -1) button.text('Unfollow');
		else button.text('Follow');
		button.removeClass('imButtonDisabled');
	}
}

melt.followUser = function(url) {
	var options = {'user_url': url}
	var success = function(response) {melt.updateFriendsObject(response.user);}
	IdeaMelt.send('UserExists', options, success);
}

melt.updateFriendsObject = function(user) {
	if($.inArray(user.url, melt.friends.urls.following) > -1) {
		var tmp = [];
		$.each(melt.friends.following, function(index, item) {
			if(user.url != item.url) tmp.push(item);
		})
		melt.friends.following = tmp;
	}
	else {
		melt.friends.following.push(user);
		melt.sendFollowNotifExternal(user.url);
		melt.sendFollowNotifInternal(user.url);
	}
	melt.friendsToList('following');
	melt.renderFriends('following');
	melt.checkRelationship(user.url);
	melt.updateServerFollow(user);
	
	if($('.imSwitchButton[data-switch="fg"]').hasClass('active')) {
		melt.stream.config.set('userUrls', melt.friends.urls.following);
		melt.stream.refresh();
	}
}

melt.updateServerFollow = function(user) {
	var options = {
		'user_url': Echo.UserSession.get('identityUrl'),
		'user_to_follow': user.url
	}
	IdeaMelt.send('UserFollow', options);
}

melt.sendFollowNotifExternal = function(url) {
	var options = {
		'from_user_url' : Echo.UserSession.get('identityUrl'),
		'to_user_url' : url,
		'content' : Echo.UserSession.get('name') + ' followed you'
	}
	IdeaMelt.send('NotificationsSend', options);
}

melt.sendFollowNotifInternal = function(url) {
	var options = {
		'from_user_url' : url,
		'to_user_url' : Echo.UserSession.get('identityUrl'),
		'content' : 'You just followed me!'
	}
	IdeaMelt.send('NotificationsSend', options);
}

melt.streamUserClickHandler = function() {
	$('#stream, #ticker').on('click','.echo-streamserver-controls-stream-item-plugin-IdeaMeltStreamFull-im-story-container .imstoryactor', function(e) {
    	var $this = $(this);
		e.preventDefault();
		e.stopPropagation();
		var title = $this.text();
		var url = $this.attr('href');
		melt.getUserModal(title, url);
	});
}

melt.sanitizeNotifierLinks = function() {
	$('#notifier').on('click', '.echo-streamserver-controls-stream-item-text a', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var link = $(this).attr('href');
		var text = $(this).text();
		if(text == "article") melt.getContentLink(link);
		else melt.getUserModal(text, link);
		melt.notifier.view.get('notifyStreamFrame').fadeOut(400);
		melt.notifier.view.get('notifyButton').removeClass('ideamelt-apps-thenotifier-notifyButtonSelected');
	})
}

melt.users = [
	{
		avatar: "http://www.ideamelt.com/static/ideamelt/img/avatars/ruth-48.png",
		title: "Babe Ruth",
		url: "http://en.wikipedia.org/wiki/Babe_Ruth"
	},
	{
		avatar: "http://ideamelt.com/static/ideamelt/img/pb-demo/barack.jpg",
		title: "Barack Obama",
		url: "http://en.wikipedia.org/wiki/Barack_obama"
	},
	{
		avatar: "http://ideamelt.com/static/ideamelt/img/pb-demo/oprah.jpg",
		title: "Oprah Winfrey",
		url: "http://en.wikipedia.org/wiki/Oprah_Winfrey"
	},
	{
		avatar: "http://ideamelt.com/static/ideamelt/img/pb-demo/george.jpg",
		title: "George Clooney",
		url: "http://en.wikipedia.org/wiki/George_Clooney"
	},
	{
		avatar: "http://ideamelt.com/static/ideamelt/img/pb-demo/lionel.jpg",
		title: "Lionel Messi",
		url: "http://en.wikipedia.org/wiki/Lionel_Messi"
	},
	{
		avatar: "http://ideamelt.com/static/ideamelt/img/pb-demo/adele.jpg",
		title: "Adele",
		url: "http://en.wikipedia.org/wiki/Adele_(singer)"
	},
	{
		avatar: "http://ideamelt.com/static/ideamelt/img/pb-demo/warren.jpg",
		title: "Warren Buffett",
		url: "http://en.wikipedia.org/wiki/Warren_Buffett"
	},
	{
		avatar: "http://ideamelt.com/static/ideamelt/img/pb-demo/mark.jpg",
		title: "Mark Zuckerberg",
		url: "http://en.wikipedia.org/wiki/Mark_Zuckerberg"
	},
	{
		avatar: "http://www.ideamelt.com/static/ideamelt/img/avatars/gaga-48.png",
		title: "Lady Gaga",
		url: "http://en.wikipedia.org/wiki/Lady_gaga"
	}
]

melt.injectDefaultUsers = function() {
	var target = $('#defaultUsers');
	target.empty();
	if(!melt.go) {
		target.append('<div class="imFollowPrompt">Hey, you\'re not logged in.<br>Sign up to follow people! </div>');
		melt.friends = {urls: {following: []}}
	}
	if(melt.go && (melt.friends.urls.following == undefined || melt.friends.urls.following.length == 0)) {
		target.append('<div class="imFollowPrompt">Hey, you\'re not following anyone.<br>Click on someone and follow them! </div>');
	} 
	target.append('<div class="imPeopleTFHeader">PEOPLE TO FOLLOW</div>');
	var tmp = $('<div>').attr('class', 'imFriendsRow clearfix imPeopleTFRow');
	var count = 0;
	$.each(melt.users, function(index, item) {
		if(count == 5) return false;
		else if($.inArray(item.url, melt.friends.urls.following) == -1) {
			tmp.append(
				'<a class="ideamelt imFriendsItem" data-title="' + item.title + '" data-url="' + item.url + '">' + 
					'<img class="imFriendsAvatar" src="' + item.avatar + '"/>' +
					'<div class="imFriendsName">' + item.title + '</div>' +
				'</a>');
			count++;
		};
	});
	if(count > 0) target.append(tmp).show(0);
	else target.hide(0);
}

melt.initComments = function(link) {
	$('#imContentModal').append($('<div>').attr('class', 'ideamelt imModalComments').attr('id', 'imContentComments'));

	Echo.Loader.initApplication({
		"script": "http://cdn.realtidbits.com/libs/v3/comments/comments.min.js",
		"component": "RTB.Apps.Comments",
		"config": {
			"cssURL": "http://cdn.realtidbits.com/libs/v3/comments/comments.min.css",
			"targetURL": "http://stocial.com/" + link,
			"target": document.getElementById("imContentComments"), 	
			"appkey": "dev.fuseconcepts",
			"ready": function() {
				melt.comments = this;
				// IdeaMelt.EventHooks.RTBComments.notifications(this, true, true);
				// IdeaMelt.EventHooks.RTBComments.stories(this, 'article', article);
			},
			"settings": {
				"tabs": {
					"social": false,
					"community": false
				},
				"tokbox": {"enabled": false},
				"topComments": {
					"enabled": false
				},
				"auth": {"loginButton": false},
				"emailSubscribe": {"enabled": false},
				"pageLike": {"enabled": false},
				"sharing": {"enabled": false},
				"viewport": {"enabled": false}
			}
		}
	});
}

melt.destroyComments = function() {
	$('#imContentModal .imModalComments').remove();
	melt.comments.destroy();
	melt.comments = undefined;
}

melt.resetState = function() {
	melt.friends = {};
	$('.imFriendsBox').empty();
}

melt.forceLogin = function() {
	Backplane.expectMessages(["identity/ack"]);
	$.post('http://ideamelt.com/api/force', {channel: Backplane.getChannelID()});
}























































melt.diStart = function() {
	melt.wtActive = false;
	if(melt.go && Echo.UserSession.get('identityUrl') == 'http://ideamelt.com/user/guest') Echo.UserSession.logout();
	$('.imOverlay').fadeOut(400);
	$('.imWTButton').fadeIn(400);
};

melt.wtStart = function() {
	melt.wtActive = true;
	$('.imOModal').fadeOut(400, function() {
		$('.imWTEnd').fadeIn();
		$('.imWTButton').fadeOut(400);
		$.scrollTo(0, 400);
		melt.wtShow(0);
		$('.imOverlay').hide();
	});
};

melt.wtShow = function(stage, fade) {
	melt.wtCurrent = stage;

	if(fade == undefined || fade) $('.imWTBox').fadeOut();

	if(stage == 0) {
		if(melt.go && Echo.UserSession.get('identityUrl') != 'http://ideamelt.com/user/guest') {
			melt.wtShow(1);
			return;
		}
		else {
			$.scrollTo(0, 400);
			$('.melt-ss-container').lightbox('show', {padding:5});
			$('#lb-cover-container').addClass('allow-clicks');
			var interval = window.setInterval(function() {
				if(melt.go) {
					window.clearInterval(interval);
					melt.wtShow(1);
					melt.wtOneReset();
					return;
				}
			}, 400);
		}
	}

	if(stage == 1) {
		$.scrollTo(0, 400);
		$('#toolbar').lightbox('show', {offsetRight: -750, offsetLeft: -40});
	}

	if(stage == 2) {
		$.scrollTo(0, 400);
		$('#notifier').lightbox('show', {padding: 10, offsetBottom: 355, offsetRight:266});
		melt.notifier.domEvents('remove');
		$('.ideamelt-apps-thenotifier-notifyStreamFrame').show();
		$('.ideamelt-apps-thenotifier-notifyButton').addClass('ideamelt-apps-thenotifier-notifyButtonSelected');
	}
	else {
		melt.notifier.domEvents();
		$('.ideamelt-apps-thenotifier-notifyStreamFrame').hide();
		$('.ideamelt-apps-thenotifier-notifyButton').removeClass('ideamelt-apps-thenotifier-notifyButtonSelected');
	}

	if(stage == 3) {
		$.scrollTo(600, 400);
		$('.imTickerContainer').lightbox('show');
	}

	if(stage == 4) {
		$.scrollTo(232, 400);
		$('.abColumn').animate({opacity: 0})
		melt.getContentLink('http://www.nytimes.com/2013/04/12/arts/design/claes-oldenburg-is-subject-of-2-shows-at-moma.html?pagewanted=all');
		$('.baseLayout').lightbox('show', {offsetRight: -352});
	}

	if(stage == 5) {
		$.scrollTo(232, 400);
		$('.imTickerContainer .echo-streamserver-controls-stream-item-content:eq(0)').lightbox('show', {offsetLeft: 10, offsetRight:10});
		$('.imWT5').css({top: $('.imTickerContainer .echo-streamserver-controls-stream-item-content:eq(0)').offset().top - 60})
	}

	if(stage == 6) {
		$.scrollTo(232, 400);
		melt.wtAddFollow();
		$('.imFriendsLightbox').lightbox('show', {padding: 10, offsetBottom:10});
	}

	if(stage == 7) {
		$.scrollTo(232, 400);
		melt.getUserModal("George Clooney", "http://en.wikipedia.org/wiki/George_Clooney");
		$('.baseLayout').lightbox('show', {offsetRight: -352});
	}

	if(stage < 4 || stage > 7) {
		melt.closeModal('Content');
		melt.closeModal('User');
		$('.abColumn').animate({opacity: 1});
	}

	if(stage == 8) {
		$.scrollTo(700, 400);
		melt.toggleStream('fg');
		$('.imStreamContainer').lightbox('show', {offsetTop: 60, padding:5});
	}

	if(stage == 9) {
		$.scrollTo(0, 400);
		$('#shell').lightbox('show');
		if(Echo.UserSession.get('identityUrl') == 'http://ideamelt.com/user/guest') Echo.UserSession.logout();
	}

	$('.imWT' + stage).fadeIn();
}

melt.wtNext = function() {
	melt.wtShow(melt.wtCurrent + 1);
}

melt.wtClose = function() {
	melt.wtActive = false;
	if(melt.go && Echo.UserSession.get('identityUrl') == 'http://ideamelt.com/user/guest') Echo.UserSession.logout();
	$('.imWTEnd').fadeOut();
	$('.imWTBox').fadeOut();
	$('body').lightbox('hide', {fadeOut:400});
	$('.imWTButton').fadeIn();
}

melt.wtGuest = function() {
	melt.forceLogin();
	$('.imWTGuest').addClass('imWTActive');
	$('#lb-cover-container').removeClass('allow-clicks');
	$('.melt-ss-cta').text('Logging in...');
	$('.melt-ss-provider').addClass('ss-disabled');
}

melt.wtOneReset = function() {
	$('#lb-cover-container').removeClass('allow-clicks');
	$('.imWTGuest').removeClass('imWTActive imWTDisabled').text('or continue as Guest');
}

melt.wtAddFollow = function() {
	if(melt.friends.following < 4) {
		melt.followUser(melt.users[Math.floor(Math.random()*melt.users.length)].url);
	}

	var topics = [
		'http://ideamelt.com/topic/politics',
		'http://ideamelt.com/topic/autos',
		'http://ideamelt.com/topic/tech',
	]
	if(Echo.UserSession.get('identityUrl') != 'http://ideamelt.com/user/guest') {
		melt.followUser(topics[Math.floor(Math.random()*topics.length)]);
	}

}












































$(document).ready(function() {

	melt.auth.init();

	melt.disableLinks();
	melt.transformLinks();
	melt.sanitizeNotifierLinks();
	melt.streamUserClickHandler();

	$('#imFriendsSwitch .imSwitchButton').on('click', function() {
		melt.toggleFriends($(this).data('switch'));
	});

	$('#imStreamSwitch .imSwitchButton').on('click', function() {
		melt.toggleStream($(this).data('switch'));
	});

	$('#imUserSwitch .imSwitchButton').on('click', function() {
		melt.toggleUserSwitch($(this).data('switch'));
	});

	$('.imModalHeader .imCloseModal').on('click', function(e) {
		e.preventDefault();
		melt.closeModal($(this).data('close'));
		if($(this).data('close') == 'Content') melt.destroyComments();
	});

	$('#imUserHeader .imHeaderButton').on('click', function() {
		melt.followUser($(this).data('url'));
	});

	$('.imMainContainer').on('click', '.imFriendsItem', function() {
		melt.getUserModal($(this).data('title'), $(this).data('url'));
	});

	$('#imContentHeader').on('click', '.imHeaderButton', function() {
		$(this).addClass('imButtonDisabled');
		melt.createStory($(this).data('link'), $(this).data('action'));
	});

	$('#imProfile').on('click', '.echo-identityserver-controls-auth-avatar, .echo-identityserver-controls-auth-name', function() {
		melt.getUserModal(Echo.UserSession.get('name'), Echo.UserSession.get('identityUrl'));
	});

});


































	









