

function OpenFile(files, callback){
	if(files[0]){
		var name = files[0].name;
		var reader = new FileReader();
		
		reader.onload = function(e){
			var file = JSON.parse(e.target.result);
			file.name = name;
			callback(file);
		};
		reader.readAsText(files[0]);
	}
}