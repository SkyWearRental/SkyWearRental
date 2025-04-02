document.addEventListener("DOMContentLoaded", function(){
    const arrivalDateInput = document.getElementById("arrival-date");
    const retrievalDateInput = document.getElementById("retrieval-date");
    const submitButton = document.getElementById("submit-button");
    const backButton = document.getElementById("back-button");
    
    // Getting current date
    let today = getLocalDate();
    
    // Possible reset of stored dates
    resetDates();
    
    // Fill inputs with stored data
    fillDates();
    // Setting the button state based on the starting input values
    setButton();

    // Restricting the date inputs
    setDateRestrictions();

    arrivalDateInput.addEventListener("change", function(){
        restrictRetrievalDate();
        setButton();
    });

    retrievalDateInput.addEventListener("change", ()=>{
        setButton();
    });

    showPickerOnClick(arrivalDateInput);
    showPickerOnClick(retrievalDateInput);

    submitButton.addEventListener("click", ()=>{
        saveInputs();
        window.location.href = "clothes.html";
    })

    backButton.addEventListener("click", ()=>{
        saveInputs();
        window.location.href = "flight-number.html";
    })


    // Returns current date
    function getLocalDate(){
        const now = new Date();
        return now.toISOString().split("T")[0];
    }

    // Deletes the stored date inputs if they are prior to the current one
    function resetDates(){
        const arrivalDate = localStorage.getItem("arrivalDate");
        if(arrivalDate && arrivalDate != "null"){
            const arrivalDateObj = new Date(arrivalDate);
            const todayObj = new Date(today);

            const datePattern = /^\d{4}-\d{2}-\d{2}$/;

            if(arrivalDateObj < todayObj || !datePattern.test(arrivalDate)){
                localStorage.setItem("arrivalDate", null);
                localStorage.setItem("retrievalDate", null);
            }
        }
    }

    // Fills the date inputs with stored data
    function fillDates(){
        const arrivalDate = localStorage.getItem("arrivalDate");
        const retrievalDate = localStorage.getItem("retrievalDate");
        
        arrivalDateInput.value = arrivalDate && arrivalDate != "null" ? arrivalDate : "";
        retrievalDateInput.value = retrievalDate && retrievalDate != "null" ? retrievalDate : "";
    }

    // Sets the date inputs restrictions
    function setDateRestrictions(){
        arrivalDateInput.setAttribute("min", today);

        const retrievalDate = localStorage.getItem("retrievalDate");
        retrievalDateInput.disabled = !(retrievalDate && retrievalDate != null);

        restrictRetrievalDate();
    }

    function restrictRetrievalDate(){
        if(arrivalDateInput.value && arrivalDateInput.value != ""){
            const arrivalDateObj = new Date(arrivalDateInput.value);
            if(retrievalDateInput.value && arrivalDateInput.value != ""){
                const retrievalDateObj = new Date(retrievalDateInput.value);
                if(arrivalDateObj >= retrievalDateObj){

                    retrievalDateInput.value = "";
                }   
            }
            
            const nextDay = new Date(arrivalDateObj)
            nextDay.setDate(arrivalDateObj.getDate() + 1);

            const nextDayForm = nextDay.toISOString().split("T")[0];

            retrievalDateInput.min = nextDayForm;
            retrievalDateInput.disabled = false;
        
        }
        else{
            retrievalDateInput.value = "";
            retrievalDateInput.disabled = true;
        }
    }

    function showPickerOnClick(input){
        input.addEventListener("click", ()=>{
            input.showPicker();
        })
    }

    function setButton(){
        const state = getButtonState();
        handleState(state);
    }

    function getButtonState(){
        return checkCompletion() ? "permit" : "block";
    }

    function checkCompletion(){
        return (arrivalDateInput.value && arrivalDateInput.value != "" && retrievalDateInput.value && retrievalDateInput.value != "");
    }

    function handleState(state){
        switch(state){
            case "block":
                submitButton.disabled = true;
                submitButton.textContent = "All fields must be filled";
                break;
            case "permit":
                submitButton.disabled = false;
                submitButton.textContent = "Next";
                break;
        }
    }

    function saveInputs(){
        if(arrivalDateInput.value && arrivalDateInput.value != ""){
            localStorage.setItem("arrivalDate", arrivalDateInput.value);
        }
        else{
            localStorage.setItem("arrivalDate", null);
        }

        if(retrievalDateInput.value && retrievalDateInput.value != ""){
            localStorage.setItem("retrievalDate", retrievalDateInput.value);
        }
        else{
            localStorage.setItem("retrievalDate", null);
        }
    }
});