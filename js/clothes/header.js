import { emptyPage } from "../utilities/utilities.js";
import { loadXML } from "../utilities/xml.js";
import { getXML } from "./clothes.js";
import { populateBundleClothingRows, populateClothingRowsByType } from "./show_clothes.js";


const subHeader = document.querySelector(".sub-header");
const scrollToTopBtn = document.getElementById("scroll-to-top");
const itemsButton = document.getElementById("items-btn");
const bundlesButton = document.getElementById("bundles-btn");

export async function createHeader(){
    addLogoBehavior(document.getElementById("logo"));
    createDateSelector();
    window.addEventListener("scroll", toggleSubHeader);
    scrollToTopBtn.addEventListener("click", scrollToTop);
    itemsButton.addEventListener("click", ()=>{
        if(!itemsButton.classList.contains("active")){
            itemsButton.classList.toggle("active");
            bundlesButton.classList.toggle("active");
            
            const xml = document.getElementById("male-filter").classList.contains("active") 
            ? getXML("male")
            : getXML("female");

            emptyPage();
            populateClothingRowsByType(xml);
        }
    });

    bundlesButton.addEventListener("click", async ()=>{
        if(!bundlesButton.classList.contains("active")){
            bundlesButton.classList.toggle("active");
            itemsButton.classList.toggle("active");

            const xml = document.getElementById("male-filter").classList.contains("active")
            ? await loadXML("../xml/male_bundles.xml")
            : await loadXML("../xml/female_bundles.xml");

            emptyPage();
            populateBundleClothingRows(xml);
        }
    })
}

function addLogoBehavior(logo){
    logo.addEventListener("click", ()=>{
        window.location.href = "start.html";
    });
}

function createDateSelector(){
    const destination = localStorage.getItem("destinationName");
    if(destination) document.getElementById("location-value").innerHTML = destination;

    const arrivalDate = localStorage.getItem("arrivalDate");
    if(arrivalDate) document.getElementById("arrival-date").innerHTML = `${new Date(arrivalDate).toLocaleDateString()}`;
    
    const retrievalDate = localStorage.getItem("retrievalDate");
    if(retrievalDate) document.getElementById("retrieval-date").innerHTML = `${new Date(retrievalDate).toLocaleDateString()}`;

    expandSearchBar();
}
function expandSearchBar() {
    const searchBar = document.querySelector(".search-bar");
    const subHeader = document.querySelector(".sub-header");
    const searchButton = document.querySelector(".search-button");
    const searchSegments = document.querySelectorAll(".search-segment");

    // Event listener for clicks inside the search bar to open it
    searchBar.addEventListener("click", (event) => {
        // Prevent the click event from propagating if the search button is clicked
        if (event.target === searchButton) return;

        // Open the search bar if it's not already expanded
        if (!searchBar.classList.contains("expanded")) {
            searchBar.classList.add("expanded");
            subHeader.classList.add("expanded");
            searchButton.classList.add("expanded");

            document.getElementById("overlay").style.display = "block";
            document.getElementById("filters-btn").style.display = "none";

            searchSegments.forEach(segment => {
                const segmentValue = segment.querySelector(".segment-value");
                const label = segment.querySelector(".segment-label");

                let input;

                // If this segment has an ID of arrival-date or retrieval-date
                if (segmentValue.id === "arrival-date" || segmentValue.id === "retrieval-date") {
                    input = document.createElement("input");
                    input.type = "datetime-local"; // Set input type to datetime-local for dates
                    // Ensure the input value is in the correct datetime-local format
                    input.addEventListener("click", () => {
                        input.showPicker();
                    });

                    // Get saved value from segment
                    const rawValue = segmentValue.getAttribute("data-raw");
                    if(rawValue){
                        const dateValue = new Date(rawValue);
                        console.log(dateValue);
                        if(!isNaN(dateValue.getTime())){
                            input.value = dateValue.toISOString().slice(0, 16);
                        }
                        else{
                            input.value = "";
                        }
                    }
                    else{
                        input.value = "";
                    }

                    // If it's the arrival date, add a listener to enable retrieval date when a value is set
                    if (segmentValue.id === "arrival-date") {
                        input.addEventListener("input", () => {
                            const retrievalDateSegment = document.querySelector("#retrieval-date").closest(".search-segment"); // Find the segment
                            const retrievalDateInput = retrievalDateSegment ? retrievalDateSegment.querySelector("input") : null;
                            if (retrievalDateInput) {
                                if (input.value) {
                                    retrievalDateInput.disabled = false;


                                    const arrivalDate = new Date(input.value);
                                    arrivalDate.setDate(arrivalDate.getDate() + 1);

                                    const minDate = arrivalDate.toISOString().slice(0, 16);
                                    retrievalDateInput.min = minDate;
                                } else {
                                    retrievalDateInput.disabled = true;
                                    retrievalDateInput.value = "";
                                }
                            }
                        });
                    }

                    if (segmentValue.id === "retrieval-date") {
                        const arrivalDateValue = document.querySelector("#arrival-date")?.getAttribute("data-raw");
                        input.disabled = !arrivalDateValue;

                        if(arrivalDateValue){
                            const arrivalDate = new Date(arrivalDateValue);
                            arrivalDate.setDate(arrivalDate.getDate() + 1);
                            input.min = arrivalDate.toISOString().slice(0, 16);
                        }
                    }
                } else {
                    input = document.createElement("input");
                    input.type = "text";
                    input.value = segmentValue.innerText || segmentValue.getAttribute("data-placeholder");
                    input.placeholder = input.value;
                }

                // Stop the click event from propagating when clicking on input fields
                input.addEventListener("click", (event) => {
                    event.stopPropagation();
                });

                segment.appendChild(input);
                segmentValue.style.display = "none";
                label.style.display = "block";
            });
        }
    });

    // Event listener for the search button to close the search bar and update values
    searchButton.addEventListener("click", (event) => {
        // Prevent the search button's click event from propagating to the search bar
        event.stopPropagation();

        // Close the search bar
        searchBar.classList.remove("expanded");
        subHeader.classList.remove("expanded");
        searchButton.classList.remove("expanded");

        document.getElementById("overlay").style.display = "none";
        document.getElementById("filters-btn").style.display = "block";

        // Update the values of the inputs and clean up
        searchSegments.forEach(segment => {
            const input = segment.querySelector("input");
            if (input) {
                const segmentValue = segment.querySelector(".segment-value");

                // For date fields, format them into a user-friendly string
                if (segmentValue.id === "arrival-date" || segmentValue.id === "retrieval-date") {
                    // Format the datetime value back to a user-friendly date format
                    segmentValue.innerText = formatDateTime(input.value);
                    segmentValue.setAttribute("data-raw", input.value);  // Save the value for future use
                    if(segmentValue.id === "arrival-date"){
                        localStorage.setItem("arrivalDate", input.value);
                    }
                    else if(segmentValue.id === "retrieval-date"){
                        localStorage.setItem("retrievalDate", input.value);
                    }
                } else {
                    segmentValue.innerText = input.value || segmentValue.getAttribute("data-placeholder");
                }
                segment.removeChild(input);
                segmentValue.style.display = "block";
            }
            const label = segment.querySelector(".segment-label");
            label.style.display = "block";
        });
    });

    // Close the search bar when clicking on the overlay (without updating the values)
    document.getElementById("overlay").addEventListener("click", function () {
        // Close the search bar
        searchBar.classList.remove("expanded");
        subHeader.classList.remove("expanded");
        searchButton.classList.remove("expanded");

        document.getElementById("overlay").style.display = "none";
        document.getElementById("filters-btn").style.display = "block";

        // Do not update the input values when the overlay is clicked
        searchSegments.forEach(segment => {
            const input = segment.querySelector("input");
            if (input) {
                const segmentValue = segment.querySelector(".segment-value");

                // Store the value of the date field (if any) back to data-raw
                if (segmentValue.id === "arrival-date" || segmentValue.id === "retrieval-date") {
                    segmentValue.setAttribute("data-raw", input.value); // Save the date input value
                }

                segment.removeChild(input);
                segmentValue.style.display = "block";
            }
            const label = segment.querySelector(".segment-label");
            label.style.display = "block";
        });
    });
}

// Function to format date-time to a user-friendly format (MM/DD/YYYY)
function formatDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options); // Adjust as needed for your locale
}

function toggleSubHeader(){
    scrollToTopBtn.style.display = subHeader.getBoundingClientRect().bottom <= 0 ? "block" : "none";

    if(subHeader.getBoundingClientRect().bottom <= 0){
        const searchBar = document.querySelector(".search-bar");
        const searchButton = document.querySelector(".search-button");
        const searchSegments = document.querySelectorAll(".search-segment");

        if(searchBar.classList.contains("expanded")){
            searchBar.classList.remove("expanded");
            document.getElementById("overlay").style.display = "none";
            document.getElementById("filters-btn").style.display = "block";
        }

        subHeader.classList.remove("expanded");
        searchButton.classList.remove("expanded");

        searchSegments.forEach(segment => {
            const input = segment.querySelector("input");

            if(input){
                const segmentValue = segment.querySelector(".segment-value");

                if(segmentValue.id === "arrival-date" || segmentValue.id === "retrieval-date"){
                    const formattedValue = formatDateTime(input.value) || segmentValue.getAttribute("data-placeholder");
                    segmentValue.innerText = formattedValue;
                    segmentValue.setAttribute("data-raw", input.value);
                }
                else{
                    segmentValue.innerText = input.value || segmentValue.getAttribute("data-placeholder");
                }

                segment.removeChild(input);
                segmentValue.style.display = "block";
            }

            const label = segment.querySelector(".segment-label");
            label.style.display = "block";
        });
    }
}

function scrollToTop(){
    window.scrollTo({top: 0, behavior: "smooth"});
}