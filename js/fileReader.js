function readText(filePath) {
    let reader = new FileReader(); 
    if(filePath.files && filePath.files[0]) {           
        reader.onload = function (e) {
            document.dispatchEvent(new CustomEvent("GraphLoad", { detail: e.target.result} ))
        };
        
        reader.readAsText(filePath.files[0]);
    }
    
    else { 
        return null
    }       
}   

function saveData(data){
    let tempLink = document.createElement("a");
    let taBlob = new Blob([JSON.stringify(data)], {type: 'text/plain'});
    tempLink.setAttribute('href', URL.createObjectURL(taBlob));
    tempLink.setAttribute('download', "netData.json");
    tempLink.click();
    
    URL.revokeObjectURL(tempLink.href);
  }

