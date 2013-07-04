
// MinimalScrollbar 
// MIT Licensed, iaarchiver (c) 2013
// : app-addDOMModifiedEvent.js

(function(window){

	function addDOMModifiedEvent() {

		this.event;
	
		this.isMuted;		// isMuted ? WAIT_STATE : READY_STATE
		this.to_queue;		// Queue TimeOut ID
		this.to_mute;		// Mute TimeOut ID
		this.interval = 300; // [ms] Queue/Mute TimeOut Interval

		this.init();
	}

	addDOMModifiedEvent.prototype = {

		init: function(){

			// create new event handler 'DOMModified'
			this.event = document.createEvent('Event');
			this.event.initEvent('DOMModified',true,true);

			// set READY_STATE
			this.isMuted = false;

			// set dispatch functions
			window.addEventListener('DOMNodeInserted',function(e){this.dispatch_with_mute(e);}.bind(this),false);
			window.addEventListener('DOMNodeRemoved',function(e){this.dispatch_with_mute(e);}.bind(this),false);
		},

		dispatch_with_mute: function(e){

			if (this.isMuted){
				// if WAIT_STATE

				clearTimeout(this.to_queue);
				this.to_queue = setTimeout(function(){this.dispatch_with_timer();}.bind(this), this.interval);
			}else{
				// if READY_STATE

				this.dispatch_with_timer();
			}
		},

		dispatch_with_timer: function(e){

			window.dispatchEvent(this.event);

			// set WAIT_STATE
			this.isMuted = true;
			
			// reset READY_STATE in this.interval [ms]
			clearTimeout(this.to_mute);
			this.to_mute = setTimeout(function(){
				this.isMuted = false;
			}.bind(this), this.interval);
		}
	};

	new addDOMModifiedEvent();

})(window);
