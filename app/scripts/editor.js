/**
 * Created by ellioh on 19/09/16.
 */
(function () {
	window.onload = function () {

		var fieldNameElement = document.getElementById('editor');
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
			var title = document.getElementById("ediary-title").textContent;
			var filename = document.getElementById("ediary-filename").textContent;
			payload.append('__title__', title);
			payload.append('__filename__', filename);
			console.info('title : ' + title);
			console.info('filename : ' + filename);
			for (name in regions) {
				if (regions.hasOwnProperty(name)) {
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
			xhr.open('POST', 'http://ediary:8080/save-my-page');
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

		fieldNameElement.innerHTML = "<p>Le bonheur devrait être déjà là... :/</p>";

		function reqListener(ev) {
			console.log(ev.target.responseText);
			if (ev.target.readyState === 4) {
				console.info('Request OK');
				fieldNameElement.innerHTML = '<p>'+ev.target.responseText+'</p>';
			}
		}
		var oReq = new XMLHttpRequest();
		oReq.onload = reqListener;
		oReq.overrideMimeType('application/json');
		oReq.open("get", "http://ediary/html/monfichier.html", true);
		oReq.send();
	}

	}).call(this);


