/**
 * Created by ellioh on 19/09/16.
 */

var editorNode = document.getElementById('editor');
var editorTitleNode = document.getElementById('editor-title');


(function () {
	window.onload = loadPage;

	document.getElementById('newNoteButton').onclick = function () {
		document.getElementById('newNoteButton').className = "hide";
		document.getElementById('myform').className = "";
		document.getElementsByClassName('ct-app').item(0).className = "ct-app hide";
	};

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


function createNote() {
	var newTitle = document.getElementById("myform").elements['newfile'].value;
	// alert("pass : " +newTitle);

	var form = document.getElementById('myform');

	form.className = "hide";


	// editorNode.innerHTML ='<div id="ediary-filename">'+newTitle+'</div>'+
	// '<div id="ediary-title">'+newTitle+'</div>';

	editorNode.innerHTML = '<h1>' + newTitle + '</h1><p></p>';
	editorTitleNode.innerHTML=newTitle;

	document.getElementById('newNoteButton').className = "";

	document.getElementsByClassName('ct-app').item(0).className = "ct-app";

	document.location = "http://ediary/sample.html#note/"+encodeURIComponent(newTitle);
	document.getElementById("myform").elements['newfile'].value = "";
}

function loadPage() {

	var editor;
	var menu  = document.getElementById('noteslist') ;
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
		// var title = document.getElementById("ediary-title").textContent;
		title = document.getElementById("editor").getElementsByTagName("h1")[0].textContent;

		// var filename = document.getElementById("ediary-filename").textContent;
		// var filename = document.getElementById("ediary-filename").textContent;
		var filename = title;
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
		}

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

	function loadPageListener(ev) {
		if (ev.target.readyState === 4) {
			var content = ev.target.responseText;
			console.info('Request OK');
			console.log('ev.target.responseText: ' + ev.target.responseText);

			var newContent = content.replaceAll("div", "p"); // clean div to avoid editor fail

			// TODO : USE REG EXP
			//var newContent = content.replaceAll("<strike>", "<del>"); // clean div to avoid editor fail

			console.info('newContent: '+ newContent);
			editorNode.innerHTML =  newContent;
			// titleNode = document.getElementById("ediary-title");
			titleNode = document.getElementById("editor").getElementsByTagName("h1")[0];
			if (titleNode != null) {
				editorTitleNode.innerHTML = titleNode.innerHTML;
				console.info('Editor Title : ' + titleNode.innerHTML);
			}

		}
	}

	var oReq = new XMLHttpRequest();
	oReq.onload = loadPageListener;
	// oReq.overrideMimeType('application/json');
	// var note = decodeURIComponent(window.location.hash.substring(1).split('/')[1]);
	// console.info('PARAMS.note : '+ PARAMS.note	);
	console.info('note : ' + note);
	oReq.open("get", "http://ediary/html/" + note + ".html", true);
	oReq.send();


	function loadNotesListListener(ev) {// Send the update content to the server to be saved
		function onStateChange(ev) {
			// Check if the request is finished
			if (ev.target.readyState == 4) {
				var noteslistArray = JSON.parse(ev.target.responseText);
				console.info('notelist content : '+ noteslistArray);
				console.info('LENGHT : '+noteslistArray.length);
				for (var i = 0; i < noteslistArray.length; i++) {
					menuItem = document.createElement('div');
					menuItem.textContent= noteslistArray[i].filename.replaceAll(".html", "");
					menu.appendChild(menuItem);
				}
			}
		}

		xhr = new XMLHttpRequest();
		xhr.addEventListener('readystatechange', onStateChange);
		xhr.open('GET', 'http://ediary/noteslist.php');
		xhr.send();

		function onMenuItemClick() {

		}

	}


	var oReq2 = new XMLHttpRequest();
	oReq2.onload = loadNotesListListener;
	var note = decodeURIComponent(window.location.hash.substring(1).split('/')[1]);
	// console.info('PARAMS.note : '+ PARAMS.note	);
	console.info('note : ' + note);
	oReq2.open("get", "http://ediary/html/" + note + ".html", true);
	oReq2.send();

}

String.prototype.replaceAll = function (search, replacement) {
	var target = this;
	return target.split(search).join(replacement);
};