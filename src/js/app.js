
// MinimalScrollbar 
// MIT Licensed, iaarchiver (c) 2013
// : app.js

(function(window){

	// VARS FOR INIT ////////////////////////////////////////////////////////////

	var defaultOptions = {
		autohide: true,
		useCustomWS: true,
		rail: {
			size: 12,	// [px]
			margin: 2,	// [px]
			corner: 4	// [px]
		},
		excluded: "https://chrome.google.com, "
				+ "https://mail.google.com, "
				+ "https://groups.google.com,"
				+ "mail.live.com"
	}


	// FUNC FOR INIT ////////////////////////////////////////////////////////////

	function isExcluded(_opt){
		if (!_opt.excluded) return false;

		var domains = _opt.excluded.split(/[,\n] ?/);
		for (var i = domains.length; i--;) {

			// detect complete URL match
			if (document.URL.indexOf(domains[i]) === 0) return true;
			
			// detect domain match
			if (document.location.host.indexOf(domains[i]) > -1) return true;
		}
		return false;
	}

	function isIframed(_opt){
		var _isIframed = (window != parent);
		return _isIframed;
	}

	function loadAdditionalCSS(pathToCSS){
		var linkElement = document.createElement('link');
		linkElement.rel = 'stylesheet';
		linkElement.type = 'text/css';
		linkElement.href = chrome.extension.getURL(pathToCSS);

		document.documentElement.insertBefore(linkElement);
	}

	function hideWebkitScrollbar(){
		var styleElement = document.createElement('style');
		styleElement.innerHTML =
			'html::-webkit-scrollbar{display:none !important}'+
			'body::-webkit-scrollbar{display:none !important}';

		document.documentElement.insertBefore(styleElement);
	}

	// INITIALIZE ///////////////////////////////////////////////////////////////

	(function init(){

		// get synced option data
		chrome.storage.sync.get(function(items){
			if(chrome.extension.lastError !== undefined)
				console.log('Error: restoreSettings');

			// restore option settings if exists
			var options = (Object.keys(items).length)? items: defaultOptions;

			// cancel if is excluded url
			if (isExcluded(options)) return false;

			// add CSS to disable webkit-scrollbar appearance
			if (!isIframed(options)) hideWebkitScrollbar();

			// load CSS for webkit-scrollbar if needed
			if (options.useCustomWS) loadAdditionalCSS('customWS.min.css');

			// stop before generates MS if is iframed
			if (isIframed(options)) return false;

			// Generate MinimalScrollbars
			new window.MinimalScrollbar(options);
		});

	}) ();

}) (window);
