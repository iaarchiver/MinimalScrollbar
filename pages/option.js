
// MinimalScrollbar 
// MIT Licensed, iaarchiver (c) 2013
// : pages/option.js

(function(window){

	// default options
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
				+ "https://groups.google.com"
	};

	// modifiable option list
	var optionList = [
		'autohide',
		'useCustomWS'
	];

	var autohide_option,
		useCustomWS_option;

	var SAVEDMESSAGE = 'Saved!! Need to reload tabs to apply changes',
		RESETMESSAGE = 'Restore Default Settings?';

	var to_message;

	function startup(){
		// restore all settings
		restoreSettings(function(){
			var wrapper = document.getElementsByClassName('wrapper')[0];
			wrapper.style.opacity = 1;
		});

		// autohide option
		autohide_option = document.getElementById('autohide');
		autohide_option.addEventListener('change', function(){
			saveSettings({'autohide': autohide_option.checked});
		}, false);

		// useCustomWS option
		useCustomWS_option = document.getElementById('useCustomWS');
		useCustomWS_option.addEventListener('change', function(){
			saveSettings({'useCustomWS': useCustomWS_option.checked});
		}, false);

		// reset button: // -disabled for now
		//document.getElementById('reset').addEventListener('click', resetSettings, false);
	}

	function saveSettings(settings){
		chrome.storage.sync.set(settings, function(){
			if(chrome.extension.lastError !== undefined)
				console.log('Error: saveSettings');

			sendMessage(SAVEDMESSAGE);
		});
	}

	function restoreSettings(callback){
		chrome.storage.sync.get(optionList, function(items){
			if(chrome.extension.lastError !== undefined)
				console.log('Error: restoreSettings');

			// update syncedOptions if not exists
			if (!Object.keys(items).length){
				saveSettings(defaultOptions);
				items = defaultOptions;
			}

			// restore autohide option
			autohide_option.checked = items.autohide;

			// restore useCustomWS option
			useCustomWS_option.checked = items.useCustomWS;

			callback();
		});
	}

	function resetSettings(){
		if (!window.confirm('reset?')) return false;

		chrome.storage.sync.set(defaultOptions, function(){
			if(chrome.extension.lastError !== undefined)
				console.log('Error: resetSettings');

			restoreSettings();
		});
	}

	function sendMessage(message){
		var indicator = document.getElementById('indicator');
		indicator.innerHTML = message;

		indicator.style.visibility = 'visible';
		indicator.style.opacity = 1;

		clearTimeout(to_message);

		to_message = setTimeout(function(){
			indicator.style.opacity = 0;
			indicator.style.visibility = 'hidden';
		},2500);
	}

	window.addEventListener('DOMContentLoaded', startup, false);

}) (window);
