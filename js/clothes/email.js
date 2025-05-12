import {showModal, closeModal} from "../utilities/utilities.js";

const modal = document.getElementById("email-modal");

export async function initEmailJS(){
    emailjs.init("EEjH3nxJxcXECaWFW");
    document.getElementById("confirm-order-btn").addEventListener("click", () => showModal(modal));
    document.getElementById("email-form").addEventListener("submit", (event) => handleSubmission(event));
    document.getElementById("close-cross-email").addEventListener("click", ()=> closeModal(modal));
}

function getOrderDetails(){
    const arrivalDate = localStorage.getItem("arrivalDate");
    const retrievalDate = localStorage.getItem("retrievalDate");
    const flightNumberGoing = localStorage.getItem("flightNumberGoing");
    const flightNumberBack = localStorage.getItem("flightNumberBack");
    const destination = localStorage.getItem("destinationName");
    let cart = localStorage.getItem("cart");
    cart = cart? JSON.parse(cart) : [];
    
    const arrivalDateObj = new Date(arrivalDate)
    const retrievalDateObj = new Date(retrievalDate)
    let formattedArrivalDate = arrivalDateObj.toLocaleString();
    let formattedRetrievalDate = retrievalDateObj.toLocaleString();

    let totalPrice = 0;
    const arrivalDay = arrivalDate.split("T")[0];
    const retrievalDay = retrievalDate.split("T")[0];
    let duration = new Date(retrievalDay) - new Date(arrivalDay);
    duration = duration / (1000 * 60 * 60 * 24); 
    const weekPercentage = duration / 7;

    let cartDetails = "--------------------------------\n";
    cart.forEach(item => {
        totalPrice += parseFloat(item.price.replace(/[^0-9.]/g, '')) * weekPercentage;
        console.log()
        cartDetails += `Type: ${item.type},\n Brand: ${item.brand},\n ID: ${item.id},\n Name: ${item.name},\n Size: ${item.size},\n Price: ${item.price}/week\n--------------------------------\n`;
    });

    let orderDetails = ""; 

    if(flightNumberGoing && flightNumberGoing != "null" && flightNumberBack && flightNumberBack != "null"){
        console.log("FLIGHT NUMBER GOING AND BACK");
        orderDetails = `
            Arrival Date: ${arrivalDateObj.toLocaleDateString()}
            Retrieval Date: ${retrievalDateObj.toLocaleDateString()}
            Outbound Flight Number: ${flightNumberGoing}
            Return Flight Number: ${flightNumberBack}
            Cart Items:
            ${cartDetails}
            Total Price: ${parseFloat(totalPrice.toFixed(2))}$
        `;
    }
    else if(flightNumberGoing && flightNumberGoing != "null" && (!flightNumberBack || flightNumberBack == "null")){
        console.log("FLIGHT NUMBER GOING BUT NO BACK");
        orderDetails = `
            Arrival Date: ${arrivalDateObj.toLocaleDateString()}
            Retrieval Date: ${retrievalDateObj.toLocaleDateString()}
            Outbound Flight Number: ${flightNumberGoing}
            Cart Items:
            ${cartDetails}
            Total Price: ${parseFloat(totalPrice.toFixed(2))}$
        `;
    }
    else if(destination && destination!="null") {
        console.log("NO FLIGH NUMBERS, ONLY DESTINATION");
        orderDetails = `
            Arrival Date: ${formattedArrivalDate}
            Retrieval Date: ${formattedRetrievalDate}
            Destination: ${destination}
            Cart Items:
            ${cartDetails}
            Total Price: ${parseFloat(totalPrice.toFixed(2))}$
        `;
    }

    return orderDetails;
}

function sendUserEmail(userEmail, orderDetails){
    emailjs.send("service_6upcf8e", "template_8jjbsw7", {
        user_email: userEmail,
        order_details: orderDetails
    })
    .then(function(response){
        console.log("User email sent successfully!", response);
    }, function(error){
        console.log("Failed to send user email:", error);
    });
}

function sendAdminEmail(userEmail, orderDetails){
    emailjs.send("service_6upcf8e", "template_y8ev1gl", {
        order_details: orderDetails,
        user_email: userEmail
    })
    .then(function(response) {
        console.log("Admin email sent successfully!", response);
    }, function(error){
        console.log("Failed to send admin email", error);
    });
}

function handleSubmission(event){
    event.preventDefault();

    const userEmail = document.getElementById("email-input").value;
    const errorMessage = document.getElementById("error-message");

    // validate the email format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if(!emailPattern.test(userEmail)){
        errorMessage.style.display = "block";
    }
    else{
        errorMessage.style.display = "none";
        confirmOrder(userEmail);
    }
}

function confirmOrder(userEmail){
    const orderDetails = getOrderDetails();
    console.log(orderDetails);
    sendAdminEmail(userEmail, orderDetails);
    sendUserEmail(userEmail, orderDetails);
    alert(`Your order has been submitted! We will send you a confirmation to ${userEmail}`);
    closeModal(modal);
}