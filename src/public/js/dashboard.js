// enable folder clicking

function main(){

	// get all of the folders
	// make each one of them clickable through AJAX
	const folders = document.getElementsByClassName("folder");
	folders.forEach(function(folder){
		folder.addEventListener('click', function(){
			const folderId = folder.id;
			let url;
			if (process.env.NODE_ENV === 'PRODUCTION') {
				url = "http://linserv1.cims.nyu.edu:18657/folders/" + folderId;
			} else {
				url = "http://localhost:3000/folders/" + folderId;
			}

			// to do: figure out how to display the folder after its clicked (redirect, show on same page, etc)
		});
	});

	/*

	const url = 'http://localhost:3000/questions/';
	const req = new XMLHttpRequest();
	req.open('POST', url, true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			const obj = JSON.parse(req.responseText);
			addQuestionObj(obj);
		}
	});

	const bodyVar = "title=" + qText;
	req.send(bodyVar);

	// read in all current questions and print them
	const url = 'http://localhost:3000/questions/';
	const req = new XMLHttpRequest();
	req.open('GET', url, true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

	req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400) {
			const listOfObjs = JSON.parse(req.responseText);

			listOfObjs.forEach(function(obj){
				addQuestionObj(obj);
			});
		}
	});

	req.send();

	*/
}

document.addEventListener("DOMContentLoaded", main);