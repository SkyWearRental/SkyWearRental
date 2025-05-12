document.addEventListener("DOMContentLoaded", async() =>{
    // Getting available destinations from database
    const destinations = await loadDestinations();

    // UI Elements
    const destinationInput = document.getElementById("destination-name");
    const submitButton     = document.getElementById("submit-button");
    const lisbonButton     = document.getElementById("lisbon-button");

    // setting the starting state of the page
    getStartingState();

    // Updating button state on fnGoing input change
    destinationInput.addEventListener("input", function(){
        const query = this.value.toLowerCase();
        const autoCompleteList = document.getElementById("autocomplete-list");
        const input = document.getElementById("destination-name");

        autoCompleteList.innerHTML = "";
        reroundCorners(input);

        if(!query) return;
        handleQuery(query, input, autoCompleteList);

        setButton();
    });

    this.addEventListener("click", (event) => {
        if(event.target !== destinationInput){
            document.getElementById("autocomplete-list").innerHTML = "";
            reroundCorners(document.getElementById("destination-name"));
        }
    });

    submitButton.addEventListener("click", ()=>{
        saveInputs();
        window.location.href = "clothes.html";
    });

    lisbonButton.addEventListener("click", ()=>{
        localStorage.setItem("destinationName", "Lisbon");
        window.location.href = "clothes.html";
    });

    function getStartingState(){
        fillInput();
        setButton();
    }

    function fillInput(){
        const savedDest = localStorage.getItem("destinationName");
        destinationInput.value = (savedDest && savedDest != "null") ? savedDest : "";
    }

    function setButton(){
        const state = getButtonState();
        handleState(state);
    }

    function getButtonState(){
        return (checkCompletion()&&checkDestination()) ? "permit" : "block";
    }

    function checkCompletion(){
        return (destinationInput.value && destinationInput.value != "");
    }

    function checkDestination(){
        const destinationName = destinationInput.value.trim().toLowerCase();
        return destinations.some(dest => dest.city.toLowerCase() === destinationName);
    }

    function handleState(state){
        switch(state){
            case "block":
                submitButton.disabled = true;
                submitButton.textContent = "Destination unavailable";
                break;
            case "permit":
                submitButton.disabled = false;
                submitButton.textContent = "Next";
        }
    }

    function saveInputs(){
        if(destinationInput.value && destinationInput.value != ""){
            localStorage.setItem("destinationName", destinationInput.value);
        }
        else{
            localStorage.setItem("destinationName", null);
        }
    }

    // AutoComplete
    function handleQuery(query, input, autoCompleteList){
        const matches = destinations.filter(dest => dest.city.toLowerCase().startsWith(query));

        unroundCorners(input);

        if(matches.length === 0){
            autoCompleteList.innerHTML = `<div class="autocomplete-item">Sorry, we don't have clothes there yet...</div>`;
        }
        else{
            matches.forEach(dest => {
                let item = document.createElement("div");
                item.classList.add("autocomplete-item");
                item.innerHTML = `<i class="fa-solid fa-plane-arrival"></i> ${dest.city}, ${dest.country}`;
                item.addEventListener("click", () => {
                    destinationInput.value = dest.city;
                    autoCompleteList.innerHTML = "";
                    reroundCorners(input);
                    destinationInput.dispatchEvent(new Event("input", {bubbles: true}));
                });

                autoCompleteList.appendChild(item);
            });
        }
    }

    function unroundCorners(input){
        input.style.borderBottomLeftRadius = "0";
        input.style.borderBottomRightRadius = "0";
    }

    function reroundCorners(input){
        input.style.borderBottomLeftRadius = "15px";
        input.style.borderBottomRightRadius = "15px";
    }

    // Available Destinations
    async function loadDestinations(){
        if(sessionStorage.getItem("destinations")){
            return JSON.parse(sessionStorage.getItem("destinations"));
        }
        const response = await fetch("../xml/destinations.xml");
        const data = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "application/xml");
        const nodes = xml.getElementsByTagName("destination");

        const destinations = Array.from(nodes).map(dest => ({
            city: dest.getElementsByTagName("city")[0].textContent,
            country: dest.getElementsByTagName("country")[0].textContent
        }));

        sessionStorage.setItem("destinations", JSON.stringify(destinations));
        return destinations;
    }
});




