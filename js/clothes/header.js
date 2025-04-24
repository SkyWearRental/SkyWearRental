
const subHeader = document.querySelector(".sub-header");
const scrollToTopBtn = document.getElementById("scroll-to-top");

export function createHeader(){
    addLogoBehavior(document.getElementById("logo"));
    createDateSelector();
    window.addEventListener("scroll", toggleSubHeader);
    scrollToTopBtn.addEventListener("click", scrollToTop);
}

function addLogoBehavior(logo){
    logo.addEventListener("click", ()=>{
        const destinationName = localStorage.getItem("destinationName");

        const prevPage = (destinationName && destinationName !== "null") ? "datetimes.html" : "dates.html";
        window.location.href = prevPage;
    });
}

function createDateSelector(){
    const arrivalDate = localStorage.getItem("arrivalDate");
    if(arrivalDate) document.getElementById("arrival-date").innerHTML = `${new Date(arrivalDate).toLocaleDateString()}`;
    
    const retrievalDate = localStorage.getItem("retrievalDate");
    if(retrievalDate) document.getElementById("retrieval-date").innerHTML = `${new Date(retrievalDate).toLocaleDateString()}`;

    document.querySelector(".dates-container").addEventListener("click", function(){
        const flightNumber = localStorage.getItem("flightNumberGoing");
        window.location.href = (flightNumber && flightNumber != "null") ? "dates.html" : "datetimes.html";
    });
}

function toggleSubHeader(){
    scrollToTopBtn.style.display = subHeader.getBoundingClientRect().bottom <= 0 ? "block" : "none";
}

function scrollToTop(){
    window.scrollTo({top: 0, behavior: "smooth"});
}