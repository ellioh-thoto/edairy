/**
 * Created by ellioh on 19/09/16.
 */
(function () {
	window.onload = function () {


		var editor;
		ContentTools.StylePalette.add([
			new ContentTools.Style('Author', 'author', ['p'])
		]);
		editor = ContentTools.EditorApp.get();
		editor.init('*[data-editable]', 'data-name');

		// Handling save notifications
		editor.addEventListener('saved', function (ev) {
			var name, payload, regions, xhr;

			// Check that something changed
			regions = ev.detail().regions;
			if (Object.keys(regions).length == 0) {
				return;
			}

			// Set the editor as busy while we save our changes
			this.busy(true);

			// Collect the contents of each region into a FormData instance
			payload = new FormData();
			payload.append('__page__', window.location.pathname);
			console.info('window.location.pathname : ' + window.location.pathname);
			for (name in regions) {
				if (regions.hasOwnProperty(name)) {
					console.info(name + ' : ' + regions[name]);
					payload.append(name, regions[name]);
				}
			}

			// Send the update content to the server to be saved
			function onStateChange(ev) {
				// Check if the request is finished
				if (ev.target.readyState == 4) {
					editor.busy(false);
					if (ev.target.status == '200') {
						// Save was successful, notify the user with a flash
						new ContentTools.FlashUI('ok');
					} else {
						// Save failed, notify the user with a flash
						new ContentTools.FlashUI('no');
					}
				}
			};

			xhr = new XMLHttpRequest();
			xhr.addEventListener('readystatechange', onStateChange);
			xhr.open('POST', 'http://localhost:5000/save-my-page');
			xhr.send(payload);
		});

		// Add support for auto-save
		editor.addEventListener('start', function (ev) {
			var _this = this;

			// Call save every 30 seconds
			function autoSave() {
				_this.save(true);
			}

			this.autoSaveTimer = setInterval(autoSave, 5 * 1000);
		});

		editor.addEventListener('stop', function (ev) {
			// Stop the autosave
			clearInterval(this.autoSaveTimer);
		});

		// init editor
		var fieldNameElement = document.getElementById('editor');
		fieldNameElement.innerHTML = "<p>Waiting upda" +
			"" +
			"te...</p>";

		//

		function reqListener(ev) {
			console.log(ev.target.responseText);
			var translations;
			if (ev.target.readyState === 4) {
				console.info('Request OK');
				fieldNameElement.innerHTML = '<p>'+ev.target.responseText+'</p>';
				return ContentEdit.LANGUAGE = 'lp';
			}
		}
		var oReq = new XMLHttpRequest();
		oReq.onload = reqListener;
		oReq.overrideMimeType('application/json');
		oReq.open("get", "http://ediary/html/monfichier.html", true);
		// oReq.open("get", "https://raw.githubusercontent.com/GetmeUK/ContentTools/master/translations/lp.json", true);
		oReq.send();


		// req = new XMLHttpRequest();
		// req.overrideMimeType('application/json');
		// req.open('GET', 'https://raw.githubusercontent.com/GetmeUK/ContentTools/master/translations/lp.json', true);
		// return req.onreadystatechange = function (ev) {
		// 	var translations;
		// 	if (ev.target.readyState === 4) {
		// 		console.info('couoc');
		// 		translations = JSON.parse(ev.target.responseText);
		// 		console.info(translations);
		// 		ContentEdit.addTranslations('lp', translations);
		// 		return ContentEdit.LANGUAGE = 'lp';
		// 	}
		// };
	}

	}).call(this);


