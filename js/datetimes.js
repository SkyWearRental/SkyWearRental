document.addEventListener("DOMContentLoaded", function () {
    const arrivalDateInput = document.getElementById("arrival-date");
    const retrievalDateInput = document.getElementById("retrieval-date");
    const submitButton = document.getElementById("submit-button");
    const backButton = document.getElementById("back-button");

    // Getting current datetime
    let now = getLocalDatetime();

    // Possible reset of stored dates
    resetDates();

    // Fill inputs with stored data
    fillDates();
    
    // Setting the button state based on the starting input values
    setButton();

    // Restricting the datetime inputs
    setDateRestrictions();

    arrivalDateInput.addEventListener("change", function () {
        restrictRetrievalDate();
        setButton();
    });

    retrievalDateInput.addEventListener("change", () => {
        setButton();
    });

    showPickerOnClick(arrivalDateInput);
    showPickerOnClick(retrievalDateInput);

    submitButton.addEventListener("click", () => {
        saveInputs();
        window.location.href = "clothes.html";
    });

    backButton.addEventListener("click", () => {
        saveInputs();
        window.location.href = "destination-name.html";
    });

    // Returns current datetime formatted for input type "datetime-local"
    function getLocalDatetime() {
        const now = new Date();
        return now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
    }

    // Deletes the stored date inputs if they are prior to the current datetime
    function resetDates() {
        const arrivalDate = localStorage.getItem("arrivalDate");
        if (arrivalDate && arrivalDate !== "null") {
            const arrivalDateObj = new Date(arrivalDate);
            const nowObj = new Date(now);

            const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

            if (arrivalDateObj < nowObj || !datePattern.test(arrivalDate)) {
                localStorage.setItem("arrivalDate", null);
                localStorage.setItem("retrievalDate", null);
            }
        }
    }

    // Fills the datetime inputs with stored data
    function fillDates() {
        const arrivalDate = localStorage.getItem("arrivalDate");
        const retrievalDate = localStorage.getItem("retrievalDate");

        arrivalDateInput.value = arrivalDate && arrivalDate !== "null" ? arrivalDate : "";
        retrievalDateInput.value = retrievalDate && retrievalDate !== "null" ? retrievalDate : "";
    }

    // Sets the datetime inputs restrictions
    function setDateRestrictions() {
        arrivalDateInput.setAttribute("min", now);

        const retrievalDate = localStorage.getItem("retrievalDate");
        retrievalDateInput.disabled = !(retrievalDate && retrievalDate !== "null");

        restrictRetrievalDate();
    }

    function restrictRetrievalDate() {
        if (arrivalDateInput.value && arrivalDateInput.value !== "") {
            const arrivalDateObj = new Date(arrivalDateInput.value);
            if (retrievalDateInput.value && retrievalDateInput.value !== "") {
                const retrievalDateObj = new Date(retrievalDateInput.value);
                if (arrivalDateObj >= retrievalDateObj) {
                    retrievalDateInput.value = "";
                }
            }

            const nextDay = new Date(arrivalDateObj);
            nextDay.setHours(arrivalDateObj.getDate() + 1); // Ensure retrieval is at least 1 hour later

            const nextDayForm = nextDay.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"

            retrievalDateInput.min = nextDayForm;
            retrievalDateInput.disabled = false;
        } else {
            retrievalDateInput.value = "";
            retrievalDateInput.disabled = true;
        }
    }

    function showPickerOnClick(input) {
        input.addEventListener("click", () => {
            input.showPicker();
        });
    }

    function setButton() {
        const state = getButtonState();
        handleState(state);
    }

    function getButtonState() {
        return checkCompletion() ? "permit" : "block";
    }

    function checkCompletion() {
        return (
            arrivalDateInput.value &&
            arrivalDateInput.value !== "" &&
            retrievalDateInput.value &&
            retrievalDateInput.value !== ""
        );
    }

    function handleState(state) {
        switch (state) {
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

    function saveInputs() {
        if (arrivalDateInput.value && arrivalDateInput.value !== "") {
            localStorage.setItem("arrivalDate", arrivalDateInput.value);
        } else {
            localStorage.setItem("arrivalDate", null);
        }

        if (retrievalDateInput.value && retrievalDateInput.value !== "") {
            localStorage.setItem("retrievalDate", retrievalDateInput.value);
        } else {
            localStorage.setItem("retrievalDate", null);
        }
    }
});
