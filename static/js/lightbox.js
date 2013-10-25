(function ($) {

	var stylesheet = undefined,
		container = undefined,
		opts = undefined,
		item = undefined,
		doc = undefined,
		top = undefined,
		bottom = undefined,
		left = undefined,
		right = undefined,
		pop = undefined

	$.fn.lightbox = function(action, options) {

		opts = $.extend({}, $.fn.lightbox.defaults, options);

		if(action == 'hide' && container != undefined) {
			container.fadeOut(opts.fadeOut);
			return this;
		}

		else if(action === 'show') {

			self = this.eq(0);

			if(self.length < 1) return this;

			if(stylesheet == undefined) baseStyle();

			if(opts.autoResize) autoResize();

			if(container == undefined) {
				injectHTML();
				thunder();
			}
			else container.fadeOut(opts.fadeOut, function(){thunder();});

	    	if(opts.returnXY) return item
	    	else return this;
		}

		else return this;
	};

	$.fn.lightbox.defaults = {
		fadeIn: 0, // integer. set in milliseconds.
		fadeOut: 0, // integer. set in milliseconds.
		padding: 0, // integer.
		pop: true, // add extra div with transparent background for pop. completely unstlyed. style using .lb-pop
		opacity: 0.8, // integer. set to 1 to show none of the background
		background: '#000', // string. accepts any valid background-color declaration. 
		offsetTop: 0,
		offsetBottom: 0,
		offsetRight: 0,
		offsetLeft: 0,
		returnXY: false
	}

	baseStyle = function() {
		var stylesheet = $("<style id=\"lightbox\" type=\"text/css\">" +
			"body{position:relative;}" +
			"#lb-cover-container{display:none; z-index:9998; position:absolute; width:100%; height:100%; top:0px; bottom:0px; left:0px; right:0px;}" +
			".lb-cover{position:absolute;}" +
			".lb-cover-top{top:0px;}" +
			".lb-cover-bottom{bottom:0px;}" +
			".lb-cover-left{top:0px; bottom:0px; left:0px;}" +
			".lb-cover-right{top:0px; bottom:0px; right:0px;}" +
			".lb-pop{position:absolute; background:transparent; -webkit-box-shadow:0px 0px 30px #FFF; -moz-box-shadow:0px 0px 30px #FFF; -o-box-shadow:0px 0px 30px #FFF; box-shadow:0px 0px 30px #FFF;}" +
		"</style>").prependTo("head");
	};

	injectHTML = function() {
		container = $('<div>').attr('id', 'lb-cover-container');
		top = $('<div>').attr('class', 'lb-cover lb-cover-top').appendTo(container);
		bottom = $('<div>').attr('class', 'lb-cover lb-cover-bottom').appendTo(container);
		left = $('<div>').attr('class', 'lb-cover lb-cover-left').appendTo(container);
		right = $('<div>').attr('class', 'lb-cover lb-cover-right').appendTo(container);

		if(opts.pop) pop = $('<div>').attr('class', 'lb-pop').appendTo(container);

		container.appendTo('body');
	};

	thunder = function() {
		item = self.offset();
		doc = {
			width: $(document).width(),
			height: $(document).height()
		}
		item.width = self.outerWidth() + 2*opts.padding + opts.offsetLeft + opts.offsetRight;
		item.height = self.outerHeight() + 2*opts.padding + opts.offsetTop + opts.offsetBottom;
		item.top = item.top - opts.padding - opts.offsetTop;
		item.left = item.left - opts.padding - opts.offsetLeft;

		top.css({"height": item.top, "left": item.left, "width": item.width, "background-color": opts.background, "opacity": opts.opacity});
		bottom.css({"left": item.left, "height": (doc.height-item.height-item.top), "width": item.width, "background-color": opts.background, "opacity": opts.opacity});
		left.css({"width": item.left, "background-color": opts.background, "opacity": opts.opacity})
		right.css({"width": (doc.width-item.left-item.width), "background-color": opts.background, "opacity": opts.opacity});

		if(pop != undefined) pop.css({"top": item.top, "left":item.left, "height":item.height, "width":item.width});

		container.fadeIn(opts.fadeIn);
	};

}(jQuery));