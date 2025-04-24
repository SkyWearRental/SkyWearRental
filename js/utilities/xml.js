export async function loadXML(file){
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", file, true);
        xhr.responseType = "document";
        xhr.overrideMimeType("text/xml");
        xhr.onload = () =>{
            if(xhr.status === 200){
                resolve(xhr.responseXML);
            }
            else{
                reject(`Failed to load XML file: ${xhr.status}`);
            }
        };
        xhr.onerror = ()=>reject("An error occurred during the request.");
        xhr.send();
    });
}

