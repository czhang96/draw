$(document).ready(function(){
	if(typeof(Storage) != "undefined"){
		if(!localStorage.visited){
			localStorage.visited = true;
			startHomeIntro(true);
		}
	}
});