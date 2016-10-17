/**
 * Created by ellioh on 19/09/16.
 */
(function () {
	window.onload = function () {

		var editorNode = document.getElementById('editor');
		var editorTitleNode = document.getElementById('editor-title');
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
			xhr.open('POST', 'http://ediary/save.php');
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

		editorNode.innerHTML = "<p>Le bonheur devrait être déjà là... :/</p>";

		function reqListener(ev) {
			if (ev.target.readyState === 4) {
				var content = ev.target.responseText;
				console.info('Request OK');
				console.log('ev.target.responseText: '+ ev.target.responseText);

				editorNode.innerHTML = '<p>'+ content +'</p>';
				titleNode =document.getElementById("ediary-title");
				if (titleNode != null) {
					editorTitleNode.innerHTML = document.getElementById("ediary-title").innerHTML;
					console.info('Editor Title : ' + document.getElementById("ediary-title").innerHTML);

				}

			}
		}
		var oReq = new XMLHttpRequest();
		oReq.onload = reqListener;
		// oReq.overrideMimeType('application/json');
		console.info('PARAMS.note : '+ PARAMS.note	);
		oReq.open("get", "http://ediary/html/" + PARAMS.note + ".html", true);
		oReq.send();
	}

	}).call(this);


var PARAMS = function () {
	// This function is anonymous, is executed immediately and
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
}();