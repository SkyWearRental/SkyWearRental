document.addEventListener("DOMContentLoaded", async() => {
    // UI Elements
    const fnGoingInput = document.getElementById("flight-number-going");
    const fnBackInput  = document.getElementById("flight-number-back");
    const link         = document.getElementById("link");
    const submitButton = document.getElementById("submit-button");  
    
    // setting the starting state of the page
    getStartingState();
    
    // Updating button state on fnGoing input change
    fnGoingInput.addEventListener("input", function(){
        setButton();
    });

    // Add link to go to destination name
    link.addEventListener("click", ()=>{
        saveInputs();
        window.location.href = "destination-name.html";
    });

    submitButton.addEventListener("click", ()=>{
        saveInputs();
        localStorage.setItem("destinationName", null);
        window.location.href = "dates.html";
    })

    //Save inputs to local storage
    function saveInputs(){
        if(fnGoingInput.value && fnGoingInput.value != ""){
            localStorage.setItem("flightNumberGoing", fnGoingInput.value);
        }
        else{
            localStorage.setItem("flightNumberGoing", null);
        }
        if(fnBackInput.value && fnBackInput.value != ""){
            localStorage.setItem("flightNumberBack", fnBackInput.value);
        }
        else{
            localStorage.setItem("flightNumberBack", null);
        }
    }

    // Filling inputs with saved data
    function fillInputs(){
        const savedFnGoing = localStorage.getItem("flightNumberGoing");
        const savedFnBack  = localStorage.getItem("flightNumberBack");
        if(savedFnGoing && savedFnGoing != "null"){
            fnGoingInput.value = savedFnGoing;
        }
        if(savedFnBack && savedFnBack != "null"){
            fnBackInput.value = savedFnBack;
        }
    }

    // Checking validity of inputs (Flight Number going should be filled)
    function checkCompletion(){
        return (fnGoingInput.value && fnGoingInput.value != "");
    }

    // Getting button state based on the inputs validity
    function getButtonState(){
        return checkCompletion() ? "permit" : "block";
    }

    // Button behavior for each state
    function handleState(state){
        switch(state){
            case "block":
                submitButton.disabled = true;
                submitButton.textContent = "Outbound flight number invalid";
                break;
            case "permit":
                submitButton.disabled = false;
                submitButton.textContent = "Next";
                break;
        }
    }

    function setButton(){
        const state = getButtonState();
        handleState(state);
    }

    function getStartingState(){
        fillInputs();
        setButton();
    }
});

