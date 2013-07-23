
// MinimalScrollbar 
// MIT Licensed, iaarchiver (c) 2013
// : app-scrollbar.js

(function(window){

	function MinimalScrollbar(_opt){
		this.scrollbar_v = document.createElement('div');
		this.scrollbar_h = document.createElement('div');
		this.scrollrail_v = document.createElement('div');
		this.scrollrail_h = document.createElement('div');
		this.scrollbar_v.id = 'scrollbar-vertical';
		this.scrollbar_h.id = 'scrollbar-horizontal';
		this.scrollrail_v.id = 'scrollrail-vertical';
		this.scrollrail_h.id = 'scrollrail-horizontal';

		this.zoom_browser;	// browser's zoom value
		this.zoom_body;	// document.body.zoom value

		this.to;
		this.grabbedId;		// grabbing bar's id

		this.bar_v; this.bar_h;			// scrollbar size
		this.cacheY; this.cacheX;		// scrollbar pos data
		this.winHeight; this.winWidth;	// window size
		this.docHeight; this.docWidth;	// document size

		this.options = _opt
		// _opt.autohide: BOOL
		// _opt.useCustomWS: BOOL
		// _opt.rail: {size:[px], margin:[px], corner:[px]}

		this.init();
	}

	MinimalScrollbar.prototype = {

		// STARTUP FUNCS //////////////////////////////////////////////////////////

		init: function(){
			// do starutup() if DOM loaded already
			if (document.readyState != 'loading') this.startup();

			// do startup() if DOM loaded
			window.addEventListener('DOMContentLoaded',function(){this.startup();}.bind(this),false);
		},
		startup: function(){
			this.cssHack(); // solve css problems

			// add div#scrollrail-* to body
			this.scrollrail_v.appendChild(this.scrollbar_v);
			this.scrollrail_h.appendChild(this.scrollbar_h);
			document.getElementsByTagName('body')[0].appendChild(this.scrollrail_v);
			document.getElementsByTagName('body')[0].appendChild(this.scrollrail_h);

			var self = this;
			// set update event
			window.addEventListener('scroll',function(e){self.update(e);},false);
			window.addEventListener('resize',function(e){self.update(e);},false);

			// set refresh event
			window.addEventListener('DOMModified',function(e){self.refresh(e);},false);

			// set scrollbar-grabbed events
			this.scrollbar_v.addEventListener('mousedown', function(e){self.grabStart(e,this);},false);
			this.scrollbar_h.addEventListener('mousedown', function(e){self.grabStart(e,this);},false);
			this.scrollrail_v.addEventListener('mousedown', function(e){self.slipStart(e,this);},false);
			this.scrollrail_h.addEventListener('mousedown', function(e){self.slipStart(e,this);},false);
			this.scrollrail_v.addEventListener('mouseover', function(e){self.onRail(e,this);},false);
			this.scrollrail_h.addEventListener('mouseover', function(e){self.onRail(e,this);},false);
			this.scrollrail_v.addEventListener('mouseout', function(e){self.offRail(e,this);},false);
			this.scrollrail_h.addEventListener('mouseout', function(e){self.offRail(e,this);},false);
			window.addEventListener('mousemove', function(e){self.grabMove(e);},false);
			window.addEventListener('mouseup', function(e){self.grabEnd(e);},false);

			this.update();
		},

		// REFRESH FUNCS ////////////////////////////////////////////////////////

		update: function(e){
			this.refresh(e);

			// Update Bar Positions
			var scrollTop = document.body.scrollTop;
			var scrollLeft = document.body.scrollLeft;
			this.scrollbar_v.style.top = (this.winHeight*(scrollTop/this.docHeight)+this.options.rail.margin)/this.zoom_body+'px';
			this.scrollbar_h.style.left = (this.winWidth*(scrollLeft/this.docWidth)+this.options.rail.margin)/this.zoom_body+'px';
		},
		refresh: function(){
			// cancel if is hidden aleready
			if (this.isHidden()) return false;

			// add scrollrails if removed
			if (!document.getElementById('scrollrail-vertical') || !document.getElementById('scrollrail-horizontal')){
				document.getElementsByTagName('body')[0].appendChild(this.scrollrail_v);
				document.getElementsByTagName('body')[0].appendChild(this.scrollrail_h);
			}

			// set autohide feature
			if (this.options.autohide){
				this.setVisible(this.scrollbar_v);
				this.setVisible(this.scrollbar_h);
				this.setHidden(this.scrollbar_v);
				this.setHidden(this.scrollbar_h);
			}else{
				clearTimeout(this.scrollbar_v.to_autohide);
				clearTimeout(this.scrollbar_h.to_autohide);
			}

			// disabled scrollbar if oversized
			this.scrollrail_v.isActive = (window.innerHeight+1 < document.body.scrollHeight); // +1 for errors
			this.scrollrail_h.isActive = (window.innerWidth+1 < document.body.scrollWidth); // +1 for errors

			this.scrollrail_v.className = (!this.scrollrail_v.isActive)? 'disabled': '';
			this.scrollrail_h.className = (!this.scrollrail_h.isActive)? 'disabled': '';

			// get basic vars
			var wh = window.innerHeight - this.options.rail.margin * 2 - ((this.scrollrail_h.isActive)? this.options.rail.corner: 0),
				ww = window.innerWidth - this.options.rail.margin * 2 - ((this.scrollrail_v.isActive)? this.options.rail.corner: 0),
				dh = document.body.scrollHeight,
				dw = document.body.scrollWidth;

			// cancel if document size unchanged
			if (this.winHeight === wh
				&& this.winWidth === ww
				&& this.docHeight === dh
				&& this.docWidth === dw) return false;

			// refresh window/document status
			this.winHeight = wh; this.winWidth = ww;
			this.docHeight = dh; this.docWidth = dw;

			// get zoom levels
			this.zoom_browser = (window.outerWidth-2)/window.innerWidth;
			this.zoom_body = document.body.style.zoom || 1;

			/* may needs refresh() after body.style.zoom changed */
			var zoom = this.zoom_browser * this.zoom_body;

			// adjust rail size in zoom
			this.scrollrail_v.style.width = this.options.rail.size/zoom+'px';
			this.scrollrail_h.style.height = this.options.rail.size/zoom+'px';

			// adjust scrollbar-thumb's border-radius in zoom
			this.scrollbar_v.style.webkitBorderRadius = 5/zoom+'px';
			this.scrollbar_h.style.webkitBorderRadius = 5/zoom+'px';

			// calculate bar size
			this.bar_v = this.winHeight*(window.innerHeight/this.docHeight)/this.zoom_body;
			this.bar_h = this.winWidth*(window.innerWidth/this.docWidth)/this.zoom_body;

			// set bar size
			this.scrollbar_v.style.height = this.bar_v+'px';
			this.scrollbar_h.style.width = this.bar_h+'px';
		},

		// MISCELLANEOUS  ///////////////////////////////////////////////////////////

		isHidden: function(){
			var isHidden = (window.getComputedStyle(document.body, null).getPropertyValue('overflow') == 'hidden');

			// hide scrollrail-* if body.style.overflow == hidden
			this.scrollrail_v.style.display =(isHidden)?'none':'';
			this.scrollrail_h.style.display =(isHidden)?'none':'';
			return isHidden;
		},
		cssHack: function(){
			/* To Solve No Scrollbar in body overflowed */
			var computedBodyStyle = window.getComputedStyle(document.body, null);

			// body.style.height == window.innerHeight ? body.style.height == 'auto'
			if ((computedBodyStyle.getPropertyValue('overflow') == 'auto') &&
				(computedBodyStyle.getPropertyValue('height') == window.innerHeight+'px'))
				document.body.style.height = 'auto';
		},

		// FOR AUTOHIDE ///////////////////////////////////////////////////////////

		setVisible: function(_bar){

			_bar.style.visibility = 'visible';
			_bar.style.opacity = '';
			clearTimeout(_bar.to_autohide);
		},
		setHidden: function(_bar){
			if (this.grabbedId) return false;

			_bar.to_autohide = setTimeout(function(){
				_bar.style.visibility = 'hidden';
				_bar.style.opacity = 0;
			}.bind(this),2500);
		},
		
		// FOR GRAB & HOVER EVENTS ////////////////////////////////////////////////

		grabStart: function(e, caller){
			e.preventDefault();

			this.grabbedId = caller.id;

			caller.className = 'hovered';

			// cache positions
			this.cacheY = e.screenY;
			this.cacheX = e.screenX;
		},
		grabMove: function(e){
			if (!this.grabbedId) return false;

			// ignore all mouse events while grabbing
			document.body.style.pointerEvents = 'none';

			if (this.grabbedId == 'scrollbar-vertical'){
				document.body.scrollTop += (e.screenY - this.cacheY)*(this.docHeight/this.winHeight)/this.zoom_browser;
				this.cacheY = e.screenY;
			}else{
				document.body.scrollLeft += (e.screenX - this.cacheX)*(this.docWidth/this.winWidth)/this.zoom_browser;
				this.cacheX = e.screenX;
			}

			this.update();
		},
		grabEnd: function(e){
			if (!this.grabbedId) return false;

			// catch mouse events
			document.body.style.pointerEvents = 'auto';

			this.grabbedId = false;

			// reset hovered class
			this.scrollbar_v.className = '';
			this.scrollbar_h.className = '';

			if (this.options.autohide){
				this.setHidden(this.scrollbar_v);
				this.setHidden(this.scrollbar_h);
			}
		},
		slipStart: function(e, caller){ // slip bars to clicked position on rails
			if (this.grabbedId) return false;

			if (caller.id == 'scrollrail-vertical'){
				document.body.scrollTop = (e.clientY - this.bar_v/2) * this.docHeight/(this.winHeight);
			}else{
				document.body.scrollLeft = (e.clientX - this.bar_h/2) * this.docWidth/(this.winWidth);
			}

			this.update();
			this.grabStart(e, caller.childNodes[0]);
		},
		onRail: function(e, caller){
			caller.className = 'hovered';
			clearTimeout(caller.to); // cancel removing

			// setVisible() if autohide is on
			if (this.options.autohide){
				this.setVisible((caller.id == 'scrollrail-vertical')
								? this.scrollbar_v
								: this.scrollbar_h);
			}
		},
		offRail: function(e, caller){
			// delay removing .hovered
			caller.to = setTimeout(function(){
				caller.className = '';
			}.bind(this),600);

			// setHidden() if autohide is on
			if (this.options.autohide){
				this.setHidden((caller.id == 'scrollrail-vertical')
							? this.scrollbar_v
							: this.scrollbar_h);
			}
		}
	};

	window.MinimalScrollbar = MinimalScrollbar;

}) (window);
