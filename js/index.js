document.addEventListener("DOMContentLoaded", ()=>{
    /*
    // Data extraction
    const storedData = getStoredData();

    // Get starting state
    const startingState = getStartingState(storedData);

    // Set starting window
    redirectTo(startingState);
    */
    localStorage.clear();
    redirectTo("flight-number");
});

function getStoredData(){
    return {
        destinationName   : localStorage.getItem("destinationName"),
        flightNumberGoing : localStorage.getItem("flightNumberGoing"),
        flightNumberBack  : localStorage.getItem("flightNumberBack"), 
        arrivalDate       : localStorage.getItem("arrivalDate"),
        retrievalDate     : localStorage.getItem("retrievalDate")
    }
}

function getStartingState(storedData){
    const currentDate = new Date();

    const arrivalDateObj = (storedData.arrivalDate && storedData.arrivalDate != "null") ? new Date(storedData.arrivalDate) : null;
    const isFutureArrival = arrivalDateObj && arrivalDateObj > currentDate;
    
    if(storedData.flightNumberGoing && storedData.fligthNumberGoing != "null" && arrivalDateObj && isFutureArrival){
        return "dates";
    }
    if(storedData.flightNumberGoing && storedData.flightNumberGoing != "null" && (!arrivalDateObj || !isFutureArrival)){
        localStorage.setItem("arrivalDate", null);
        localStorage.setItem("retrievalDate", null);
        return "flight-number";
    }
    if(storedData.destinationName && storedData.destinationName != "null" && arrivalDateObj && isFutureArrival){
        return "datetimes";
    }
    if(storedData.destinationName && storedData.destinationName != "null" && (!arrivalDateObj || !isFutureArrival)){
        localStorage.setItem("arrivalDate", null);
        localStorage.setItem("retrievalDate", null);
        return "destination-name";
    }

    return "flight-number";
}

function redirectTo(startingState){
    window.location.href = `html/${startingState}.html`
}

