function loadXML(file){
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

function createClothingCard(item){
    const card = document.createElement("div");
    card.className = "clothing-card";

    const imgContainer = document.createElement("div");
    imgContainer.className = "img-container";

    const carousel = document.createElement("div");
    imgContainer.className = "carousel";

    const images = item.querySelectorAll("image");
    let imageIndex = 0;

    images.forEach((image, index) => {
        const img = document.createElement("img");
        img.src = image.textContent;
        img.alt = item.querySelector("name").textContent;
        img.classList.add("carousel-image");
        img.style.display = index === 0 ? "block" : "none";
        carousel.appendChild(img);
    });
    imgContainer.appendChild(carousel);

    const numImages = images.length;

    if(numImages > 1){
        const prevButton = document.createElement("button");
        prevButton.className = "carousel-button prev";
        prevButton.innerHTML = "<i class='fa-solid fa-chevron-left'></i>";
        prevButton.addEventListener("click", () => changeImage(-1));

        const nextButton = document.createElement("button");
        nextButton.className = "carousel-button next";
        nextButton.innerHTML = "<i class='fa-solid fa-chevron-right'></i>";
        nextButton.addEventListener("click", () => changeImage(1));

        function changeImage(direction){
            const images = carousel.querySelectorAll("img");
            images[imageIndex].style.display = "none";
            imageIndex = (imageIndex + direction + images.length) % images.length;
            images[imageIndex].style.display = "block";
        }

        imgContainer.appendChild(prevButton);
        imgContainer.appendChild(nextButton);
    }

    const descriptionContainer = document.createElement("div"); 
    descriptionContainer.className = "description-container";

    const description = document.createElement("p");
    description.textContent = item.querySelector("name").textContent;

    descriptionContainer.appendChild(description);
    card.appendChild(imgContainer);
    card.appendChild(descriptionContainer);

    const plusButton = document.createElement("button");
    plusButton.className = "plus-button";
    plusButton.innerHTML = "<i class='fa-solid fa-circle-plus'></i>"
    const plusIcon = plusButton.getElementsByTagName("i")[0];
    plusIcon.addEventListener("click", function(event){
        event.stopImmediatePropagation();
        this.classList.toggle("active");
        sizesContainer.classList.toggle("active");
    });

    const sizesContainer = document.createElement("div");
    sizesContainer.className = "quick-sizes-container";

    const sizes = item.querySelectorAll("size");
    sizes.forEach(size =>{
        const sizeBtn = document.createElement("button");
        sizeBtn.className = "size-btn";
        sizeBtn.innerHTML = size.textContent;

        sizeBtn.addEventListener("click", function(event){
            event.stopImmediatePropagation();
            addToCart(item, size.textContent);
            plusIcon.classList.toggle("active");
            sizesContainer.classList.toggle("active");
        });

        sizesContainer.appendChild(sizeBtn);
    });


    imgContainer.addEventListener("mouseleave", ()=>{
        if(plusIcon.classList.contains("active")){
            plusIcon.classList.toggle("active");
            sizesContainer.classList.toggle("active");
        }
    });

    imgContainer.appendChild(plusButton);
    imgContainer.appendChild(sizesContainer);
    addModalBehavior(card, item);

    return card;
}

function populateSubHeader(xml){
    const brandsContainer = document.querySelector("#brands-sub-header .buttons-container");
    const typesContainer  = document.querySelector("#types-sub-header .buttons-container");

    const brandSet = new Set();
    const typeSet = new Set();

    const brands = xml.getElementsByTagName("brand");

    for(let i = 0; i < brands.length; i++){
        const brandName = brands[i].getAttribute("name");
        brandSet.add(brandName);

        const types = brands[i].getElementsByTagName("type");
        for(let j = 0; j < types.length; j++){
            const typeName = types[j].getAttribute("name");
            typeSet.add(typeName);
        }
    }

    brandSet.forEach(brand => {
        const button = document.createElement("button");
        button.textContent = brand;
        button.classList.add("brand-button");
        button.addEventListener("click", ()=>{
            // TODO
        });
        brandsContainer.appendChild(button);
    });

    typeSet.forEach(type => {
        const button = document.createElement("button");
        button.textContent = type;
        button.classList.add("type-button");
        button.addEventListener("click", () => {
            // TODO
        });
        typesContainer.appendChild(button);
    })
}

function populateClothingRows(xml) {
    const clothingData = xml.querySelectorAll("brand");  // Start by selecting the brands
    const body = document.getElementsByClassName("clothing-container")[0];

    clothingData.forEach((brand) => {
        const brandName = brand.getAttribute("name");
        const brandContainer = document.createElement("div");
        brandContainer.className = "brand-container";

        const brandTitle = document.createElement("h1");
        brandTitle.textContent = brandName;
        brandContainer.appendChild(brandTitle);

        const types = brand.querySelectorAll("type"); // Now go into the types within each brand
        types.forEach((type) => {
            const typeName = type.getAttribute("name");
            const typeContainer = document.createElement("div");
            typeContainer.className = "type-container";

            const typeTitle = document.createElement("h2");
            typeTitle.textContent = typeName;
            typeContainer.appendChild(typeTitle);

            const row = document.createElement("div");
            row.className = "row";

            const items = type.querySelectorAll("item");  // Get the items within each type
            items.forEach(item => {
                const card = createClothingCard(item);  // Assuming createClothingCard is a function to generate the card
                row.appendChild(card);
            });

            typeContainer.appendChild(row);
            if(typeContainer.getElementsByClassName("row")[0].hasChildNodes()){
                brandContainer.appendChild(typeContainer);
            }
        });

        if(brandContainer.children.length > 1){
            body.appendChild(brandContainer);
        }
    });
}

function populateClothingRowsByType(xml) {
    const clothingData = xml.querySelectorAll("type");
    const uniqueTypes = new Set();

    clothingData.forEach((type) => {
        const typeName = type.getAttribute("name");
        uniqueTypes.add(typeName);
    });

    const body = document.getElementById("clothing-container");

    uniqueTypes.forEach((typeName) => {
        const typeContainer = document.createElement("div");
        typeContainer.className = "brand-container";

        const typeTitle = document.createElement("h1");
        typeTitle.textContent = typeName;
        typeContainer.appendChild(typeTitle);

        const xpathExpression = `//brand[type[@name='${typeName}']]`;
        const result = xml.evaluate(xpathExpression, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        
        for(let i = 0; i < result.snapshotLength; i++){
            const brand = result.snapshotItem(i);
            const brandName = brand.getAttribute("name");
            const brandContainer = document.createElement("div");
            brandContainer.className = "type-container";

            const brandTitle = document.createElement("h2");
            brandTitle.textContent = brandName;
            brandContainer.appendChild(brandTitle);

            const row = document.createElement("div");
            row.className = "row";

            const items = brand.querySelectorAll(`type[name='${typeName}'] > item`);
            items.forEach(item=> {
                const card = createClothingCard(item);
                row.appendChild(card);
            });

            brandContainer.appendChild(row);
            typeContainer.appendChild(brandContainer);
        }
        body.appendChild(typeContainer);
    });
}


function closeModal(){
    const modal = document.getElementById("clothing-modal");
    modal.style.display = "none";
}

async function initializePage(){
    try{
        const xml = await loadXML("../xml/clothing_male.xml");
        //populateSubHeader(xml);
        populateClothingRows(xml);
    }
    catch(error){
        console.error(error);
    }
}

initializePage();

document.getElementById("logo").addEventListener("click", ()=>{
    let prevPage;
    if(localStorage.getItem("destinationName") && localStorage.getItem("destinationName") != "null"){
        prevPage = "datetimes.html";
    }
    else{
        prevPage = "dates.html";
    }

    window.location.href = prevPage;
});

/*
let resizeTimeout;
function changeLogo(){
    const logo = document.getElementById("logo");
    if(resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if(window.innerWidth <= 450){
            logo.src = "../images/logo/logo_name.png";
        }
        else{
            logo.src = "../images/logo/logo.png";
        }
    }, 300);
}

changeLogo();

window.addEventListener("resize", changeLogo);
*/

function addModalBehavior(card, item){
    card.addEventListener("click", function(event) {
        if(!event.target.closest(".prev") && !event.target.closest(".next")){
            const modal = document.getElementById("clothing-modal");
            modal.addEventListener("click", function(event){
                if(!event.target.closest(".modal-content")){
                    closeModal();
                }
            });

            const modalCarouselContainer = modal.querySelector(".modal-carousel-container");
            const modalDescriptionContainer = modal.querySelector(".modal-description-container");

            modalCarouselContainer.innerHTML = "";
            modalDescriptionContainer.innerHTML = "";

            const name = item.querySelector("name").textContent;
            const brand = item.closest("brand") ? item.closest("brand").getAttribute("name") : "Unknown Brand";
            const description = item.querySelector("description").textContent;
            const retailPrice = item.querySelector("retail-price") ? item.querySelector("retail-price").textContent : "Price not available";
            const rentalPrice = item.querySelector("renting-price") ? item.querySelector("renting-price").textContent : "Price not available";
            const sizes = item.querySelectorAll("size");

            const itemId = item.querySelector("id").textContent.trim();
            const itemType = item.closest("type").getAttribute("name");

            const carousel = document.createElement("div");
            carousel.className = "modal-carousel";

            const images = item.querySelectorAll("image");
            let imageIndex = 0;
 
            images.forEach((image, index) => {
                const img = document.createElement("img");
                img.src = image.textContent;
                img.alt = name;
                img.classList.add("modal-carousel-image");
                img.style.display = index === 0 ? "block" : "none";
                carousel.appendChild(img);
            });

            if(images.length > 1){
                const prevButton = document.createElement("button");
                prevButton.className = "carousel-button prev";
                prevButton.innerHTML = "<i class='fa-solid fa-chevron-left'></i>";
                prevButton.addEventListener("click", () => changeModalImage(-1));

                const nextButton = document.createElement("button");
                nextButton.className = "carousel-button next";
                nextButton.innerHTML = "<i class='fa-solid fa-chevron-right'></i>";
                nextButton.addEventListener("click", () => changeModalImage(+1));

                function changeModalImage(direction){
                    const images = modal.querySelectorAll(".modal-carousel-image");
                    images[imageIndex].style.display = "none";
                    imageIndex = (imageIndex + direction + images.length) % images.length;
                    images[imageIndex].style.display = "block";
                }

                modalCarouselContainer.appendChild(prevButton);
                modalCarouselContainer.appendChild(nextButton);
            }

            modalCarouselContainer.appendChild(carousel);

            const sizesElem = document.createElement("div");
            sizesElem.classList.add("sizes-container");

            const sizesTitle = document.createElement("p");
            sizesTitle.innerHTML = "<strong>Sizes:</strong>";

            sizesElem.appendChild(sizesTitle);
            
            let selectedSize = null;

            sizes.forEach(size => {
                const sizeValue = size.childNodes[0].nodeValue.trim();
                //const available = size.querySelector("available")  ? parseInt(size.querySelector("available").textContent) : 0;

                const sizeButton = document.createElement("button");
                sizeButton.textContent = sizeValue;
                sizeButton.classList.add("size-button");
                //sizeButton.disabled = available <= 0;

                sizeButton.addEventListener("click", () => {
                    const isSelected = sizeButton.classList.contains("selected");
                    document.querySelectorAll(".size-button").forEach(btn => btn.classList.remove("selected"));                            
                    if(!isSelected){
                        sizeButton.classList.add("selected");
                        selectedSize = sizeValue;
                        addToCartButton.textContent = "Add To Cart";
                        addToCartButton.disabled = false;
                        
                    }
                    else{
                        sizeButton.classList.remove("selected");
                        selectedSize = null;
                        addToCartButton.disabled = true;
                        addToCartButton.textContent = "Select a Size";
                    }
                });

                sizesElem.appendChild(sizeButton);
            });

            const nameElem = document.createElement("h2");
            nameElem.textContent = name;

            const brandElem = document.createElement("p");
            brandElem.innerHTML = `<strong>Brand:</strong> ${brand}`;

            const descElem = document.createElement("p");
            descElem.innerHTML = `<strong>Description:</strong> ${description}`;

            const addToCartButton = document.createElement("button");
            addToCartButton.className = "add-to-cart-button";
            addToCartButton.textContent = "Select a Size";
            addToCartButton.disabled = true;

            addToCartButton.addEventListener("click", () => {
                addToCart(item, selectedSize);
            });
            
            const retailPriceElem = document.createElement("p");
            retailPriceElem.innerHTML = `<strong>Avg. Retail Price:</strong> ${retailPrice}`;

            const rentalPriceElem = document.createElement("p");
            rentalPriceElem.innerHTML = `<strong>Rental Price:</strong> ${rentalPrice} / week`
            rentalPriceElem.style.color = "var(--secondary)";

            modalDescriptionContainer.appendChild(sizesElem);
            modalDescriptionContainer.appendChild(nameElem);
            modalDescriptionContainer.appendChild(brandElem);
            modalDescriptionContainer.appendChild(descElem);
            modalDescriptionContainer.appendChild(retailPriceElem);
            modalDescriptionContainer.appendChild(rentalPriceElem);

            modalDescriptionContainer.appendChild(addToCartButton);
            
            modal.style.display = "flex";   
            document.body.style.overflow = "hidden";
        }
    });
}

let cart = [];

function loadCart(){
    const savedCart = localStorage.getItem("cart");
    if(savedCart){
        cart = JSON.parse(savedCart);
    }
    updateCartUI();
}

function saveCart(){
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(itemType, itemBrand, itemId, itemName, selectedSize,  itemImage){
    if(!cartContains(itemType, itemId, selectedSize)){
        cart.push({type: itemType, brand: itemBrand, id: itemId, name: itemName, size: selectedSize, image: itemImage});
        saveCart();
        updateCartUI();
        return true;
    }

    return false;    
}

function addToCart(item, size){
    const itemName = item.querySelector("name").textContent;
    const itemBrand = item.closest("brand") ? item.closest("brand").getAttribute("name") : "Unknown Brand";
    const itemId = item.querySelector("id").textContent.trim();
    const itemType = item.closest("type").getAttribute("name");
    const mainImage = item.querySelectorAll("image")[0].textContent;
    const rentalPrice = item.querySelector("renting-price").textContent;

    cart.push({type: itemType, brand: itemBrand, id: itemId, name: itemName, size: size, image: mainImage, price: rentalPrice});
    saveCart();
    updateCartUI();
}

function removeFromCart(itemType, itemBrand, itemId, size){
    cart = cart.filter(item => !(item.type === itemType && item.brand == itemBrand && item.id === itemId && item.size === size));

    saveCart();
    updateCartUI();
}

function removeItemFromCart(index){
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    renderCartItems();
}

function updateCartUI(){
    const counter = document.getElementById("counter");
    counter.innerHTML = cart.length;

    const confirmOrderButton = document.getElementById("confirm-order-btn");
    if(cart.length > 0){
        confirmOrderButton.disabled = false;
        confirmOrderButton.textContent="Confirm Order";
    }
    else{
        confirmOrderButton.disabled = true;
        confirmOrderButton.textContent="Cart is Empty";
    }
}

function cartContains(itemType, itemId, size){
    const existingItem = cart.find(item => item.type === itemType && item.id === itemId && item.size === size);
    
    if(existingItem){
        return true;
    }
    return false;
}

document.addEventListener("DOMContentLoaded", loadCart);

function toggleCartModal(){
    renderCartItems();
    const modal = document.getElementById("cart-modal");
    modal.style.display = modal.style.display === "flex" ? "none" : "flex";
}

function closeCartModal(){
    const modal = document.getElementById("cart-modal");
    modal.style.display = "none";
}

const suitcaseIcon = document.getElementById("suitcase-icon");
suitcaseIcon.addEventListener("click", toggleCartModal);

const closeModalButton = document.getElementById("close-cross-cart");
closeModalButton.addEventListener("click", closeCartModal);

window.addEventListener("click", function(event){
    const modal = this.document.getElementById("cart-modal");
    if(event.target === modal){
        closeCartModal();
    }
});

function renderCartItems(){
    const modalItemsContainer = document.getElementById("modal-items-container");
    modalItemsContainer.innerHTML = "";

    if(cart.length === 0){
        modalItemsContainer.innerHTML = "<p>Your cart is empty</p>";
        return;
    }

    cart.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <div class ="cart-item-image">
                <img src="${item.image}" alt="${item.name}" />
            </div>
            <div class="cart-item-details">
                <p><strong>${item.name}</strong></p>
                <p>Size: ${item.size}</p>
                <p>Price: ${item.price}/week</p> 
            </div>
            <div class="cart-item-remove">
                <i class="fa-solid fa-trash-can"></i>
            </div>
        `;

        modalItemsContainer.appendChild(cartItem);
    });

    document.querySelectorAll(".cart-item-remove i").forEach((item, index) => {
        item.addEventListener("click", (e) => {
            removeItemFromCart(index);
        });
    });
}

document.addEventListener("DOMContentLoaded", function(){
    const datesContainer = document.querySelector(".dates-container");
    const arrivalDate = localStorage.getItem("arrivalDate");
    const retrievalDate = localStorage.getItem("retrievalDate");

    if(arrivalDate && retrievalDate){
        const formattedArrival = new Date(arrivalDate).toLocaleDateString();
        const formattedRetrieval = new Date(retrievalDate).toLocaleDateString();

        datesContainer.innerHTML = `
            <div class="date-box" id="arrival-box">
                <i class="fa-solid fa-plane-arrival"></i>
                <span class="date-value">${formattedArrival}</span>
            </div>
            <div class="date-box" id="retrieval-box">
                <i class="fa-solid fa-plane-departure"></i>
                <span class="date-value">${formattedRetrieval}</span>
            </div>
        `;

        datesContainer.addEventListener("click", function(){
            const flightNumber = localStorage.getItem("flightNumberGoing"); 
            if( flightNumber && flightNumber != "null"){
                window.location.href = "dates.html";
            }
            else{
                window.location.href = "datetimes.html";
            }
        });

        datesContainer.style.cursor = "pointer";
    }
});

// Show the email modal when the "Confirm Order" button is pressed
function showEmailModal() {
    document.getElementById('email-modal').style.display = 'flex';
}

// Close the modal when the "×" button is clicked
function closeEmailModal() {
    document.getElementById('email-modal').style.display = 'none';
}

document.getElementById("confirm-order-btn").addEventListener("click", showEmailModal);

emailjs.init("EEjH3nxJxcXECaWFW")

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
    const weekPercentage = duration * (100/7);

    let cartDetails = "--------------------------------\n";
    cart.forEach(item => {
        totalPrice += item.price * weekPercentage;
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
            Total Price: ${totalPrice}$
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
            Total Price: ${totalPrice}$
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
            Total Price: ${totalPrice}$
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

// Handle form submission
document.getElementById('email-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from submitting

    const userEmail = document.getElementById('email-input').value;
    const errorMessage = document.getElementById('error-message');

    // Validate the email format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailPattern.test(userEmail)) {
        errorMessage.style.display = 'block';  // Show error message
    } else {
        errorMessage.style.display = 'none';  // Hide error message
        // Proceed with the order confirmation logic
        confirmOrder(userEmail);
    }
});

function confirmOrder(userEmail){
    const orderDetails = getOrderDetails();
    console.log(orderDetails);
    sendAdminEmail(userEmail, orderDetails);
    sendUserEmail(userEmail, orderDetails);
    alert(`Your order has been submitted! We will send you a confirmation to ${userEmail}`);
    closeEmailModal();
}

document.addEventListener("DOMContentLoaded", function() {
    const subHeader = document.querySelector(".sub-header");
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    window.addEventListener("scroll", function(){
        if(subHeader && scrollToTopBtn){
            let subHeaderRect = subHeader.getBoundingClientRect();

            if(subHeaderRect.bottom <= 0){
                scrollToTopBtn.style.display = "block";
            }
            else{
                scrollToTopBtn.style.display = "none";
            }
        }
    });
});

function scrollToTop(){
    window.scrollTo({top: 0, behavior: "smooth"});
}

document.addEventListener("DOMContentLoaded", function(){
    const filtersBtn = document.getElementById("filters-btn");
    const sidebar = document.querySelector(".sidebar");

    var activeElements = [];

    filtersBtn.addEventListener("click", function(){
        sidebar.classList.toggle("active");
        filtersBtn.classList.toggle("active");

        reset(sidebar, activeElements);
    });

    document.addEventListener("click", function(event){
        if(!sidebar.contains(event.target) && !filtersBtn.contains(event.target)){
            sidebar.classList.remove("active");
            filtersBtn.classList.remove("active");
            
            reset(sidebar, activeElements);
        }
    });

    document.getElementById("apply-filters-btn").addEventListener("click", () => {
        updateSideBar(sidebar, activeElements);
        sidebar.classList.remove("active");
        filtersBtn.classList.remove("active");
        reset(sidebar, activeElements);
        updatePage(activeElements);
    });
});

async function updatePage(activeElements){
    const genderBtn = activeElements[0];
    try{
        const xml = genderBtn.innerHTML==="Male" ? await loadXML("../xml/clothing_male.xml") : await loadXML("../xml/clothing_female.xml");
        emptyPage();

        wantedTypes = [];
        var breakIndex = activeElements.length;
        for(let i = 2; i < activeElements.length; i++){
            if(activeElements[i].innerHTML.includes("brands")){
                breakIndex = i;
                break;
            }
            else if(!activeElements[i].innerHTML.includes("types")){
                wantedTypes.push(activeElements[i].innerHTML);
            }
        }
        console.log(wantedTypes);

        wantedBrands = [];
        for(let i = breakIndex; i < activeElements.length; i++){
            if(!activeElements[i].innerHTML.includes("brands")){
                wantedBrands.push(activeElements[i].innerHTML);
            }
        }
        console.log(wantedBrands);

        const brands = xml.querySelectorAll("brand");
        brands.forEach((brand) => {
            const brandName = brand.getAttribute("name");

            if(wantedBrands.length > 0 && !wantedBrands.includes(brandName)){
                const parent = brand.parentElement;
                parent.removeChild(brand);
            }

            const types = brand.querySelectorAll("type");

            types.forEach((type) => {
                const typeName = type.getAttribute("name");

                if(wantedTypes.length > 0 && !wantedTypes.includes(typeName)){
                    brand.removeChild(type);
                }
            });
        });

        console.log(xml);

        
        if(activeElements[1].innerHTML === "Clothing Type"){
            populateClothingRowsByType(xml);
        }
        else{
            populateClothingRows(xml);
        }
    }
    catch(error){
        console.error(error);
    }
}

function emptyPage(){
    const clothingContainer = document.getElementById("clothing-container");
    const scrollToTopBtn    = document.getElementById("scrollToTopBtn");

    clothingContainer.innerHTML = "";
    clothingContainer.appendChild(scrollToTopBtn);
}

function updateSideBar(sidebar, activeElements){
    activeElements.length = 0;
    Array.from(sidebar.getElementsByTagName("button")).forEach(button => {
        if(button.classList.contains("active")){
            activeElements.push(button);
        }
    });
}

function reset(filtersContainer, activeElements){
    if(filtersContainer.classList.contains("active")){
        document.body.style.overflow = "hidden";
        document.getElementById("overlay").style.display = "block";

        Array.from(filtersContainer.getElementsByTagName("button")).forEach(button => {
            if(button.classList.contains("active")){
                activeElements.push(button);
            }
        });
    }
    else{
        document.body.style.overflow = "";
        document.getElementById("overlay").style.display = "none";
        Array.from(filtersContainer.getElementsByTagName("button")).forEach(button => {
            if(button.classList.contains("active") && !(activeElements.includes(button))
            || activeElements.includes(button) && !button.classList.contains("active")){
                button.classList.toggle("active");
            }
        })
    }

    document.getElementById("type-items").style.display = document.getElementById("types-dropdown").classList.contains("active") ? "block" : "none";
    document.getElementById("brand-items").style.display = document.getElementById("brands-dropdown").classList.contains("active") ? "block" : "none"; 
}

function orderBtn(){
    this.classList.toggle("active");
}

document.addEventListener("DOMContentLoaded", async() => {
    const typesDropdown = document.getElementById("types-dropdown");
    const typeItems = document.getElementById("type-items");

    const brandsDropdown = document.getElementById("brands-dropdown");
    const brandItems = document.getElementById("brand-items");

    try{
        const xml = await loadXML("../xml/clothing_male.xml");

        // TYPES
        const typesSet = new Set();

        const types = xml.getElementsByTagName("type");
        for(let type of types){
            typesSet.add(type.getAttribute("name"));
        }

        typesSet.forEach(type => {
            const typeButton = document.createElement("button");
            typeButton.textContent = type;
            typeButton.classList.add("dropdown-item");
            typeItems.appendChild(typeButton);

            typeButton.addEventListener("click", ()=>{
                typeButton.classList.toggle("active");
            });
        });

        const typeItemsChilds = typeItems.getElementsByClassName("dropdown-item"); 
        typeItemsChilds[typeItemsChilds.length - 1].classList.add("last-item");

        typeItems.style.display = "none";

        typesDropdown.addEventListener("click", () => {
            typeItems.style.display = typeItems.style.display === "none" ? "block" : "none";
            typesDropdown.classList.toggle("active");
        });

        // BRANDS
        const brandsSet = new Set();

        const brands = xml.getElementsByTagName("brand");
        for(let brand of brands){
            brandsSet.add(brand.getAttribute("name"));
        }

        brandsSet.forEach(brand => {
            const brandButton = document.createElement("button");
            brandButton.textContent = brand;
            brandButton.classList.add("dropdown-item");
            brandItems.appendChild(brandButton);

            brandButton.addEventListener("click", ()=>{
                brandButton.classList.toggle("active");
            });
        });

        const brandItemsChilds = brandItems.getElementsByClassName("dropdown-item");
        brandItemsChilds[brandItemsChilds.length - 1].classList.add("last-item");

        brandItems.style.display = "none";

        brandsDropdown.addEventListener("click", () => {
            brandItems.style.display = brandItems.style.display === "none" ? "block" : "none";
            brandsDropdown.classList.toggle("active");
        });
    }
    catch(error){
        console.error("Error loading XML:", error);
    }
});

function toggleGender(){
    const maleBtn = document.getElementById("male-btn");
    const femaleBtn = document.getElementById("female-btn");

    maleBtn.classList.toggle("active");
    femaleBtn.classList.toggle("active");
}

function toggleOrder(){
    const orderBrand = document.getElementById("brand-btn");
    const orderType = document.getElementById("type-btn");

    orderBrand.classList.toggle("active");
    orderType.classList.toggle("active");
}
