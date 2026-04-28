"use strict";
(function () {
	try{
		var i, keyCode = {}, supportedKeys;   // Register Keys;
		supportedKeys = tizen.tvinputdevice.getSupportedKeys();
		for (i = 0; i < supportedKeys.length; i++) {
			keyCode[supportedKeys[i].name] = supportedKeys[i].code;
			tizen.tvinputdevice.registerKey(supportedKeys[i].name);
		}
		tizen.tvinputdevice.unregisterKey("VolumeUp");
		tizen.tvinputdevice.unregisterKey("VolumeDown");
		tizen.tvinputdevice.unregisterKey("VolumeMute");
	}catch (e) {
	}
	var tvKey = {
		N1: 49,
		N2: 50,
		N3: 51,
		N4: 52,
		N5: 53,
		N6: 54,
		N7: 55,
		N8: 56,
		N9: 57,
		N0: 48,
		PRECH: 10190,
		VOL_UP: 448,
		VOL_DOWN: 447,
		MUTE: 449,
		CH_UP: 427,
		CH_DOWN: 428,
		TOOLS: 10135,
		ENTER: 13,
		RETURN: 10009,
		INFO: 457,
		EXIT: 10182,
		UP: 38,
		DOWN: 40,
		LEFT: 37,
		RIGHT: 39,
		RED: 403,
		GREEN: 404,
		YELLOW: 405,
		BLUE: 406,
		RW: 412,
		PAUSE: 19,
		FF: 417,
		REC: 416,
		PLAY: 415,
		STOP: 413,
		PLAYPAUSE: 10252,
		MENU:10133,
		SEARCH:10255,
		MediaRewind: 412,
		MediaPause: 19,
		MediaFastForward: 417,
		MediaRecord: 416,
		MediaPlay: 415,
		MediaStop: 413,
		MediaPlayPause: 10252,
		MediaTrackPrevious: 10232,
		MediaTrackNext: 10233,
		Source: 10072,
		RETURN_LG: 461,
		ESC: 27,
		D: 68,
		E: 69,
		OK: 29443
	};
  	window.tvKey = tvKey;
})();
