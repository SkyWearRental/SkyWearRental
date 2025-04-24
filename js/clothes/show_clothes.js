import {
    closeModal,
    showModal,
    createElement,
    createImageCarousel
} from "../utilities/utilities.js";

import { addToCart } from "./cart.js";

const modal = document.getElementById("clothing-modal");

function createClothingCard(item){
    const card = createElement("div", "clothing-card");

    // Carousel Creation
    const carouselContainer = createImageCarousel(item.querySelectorAll("image"), "carousel-image");
    card.appendChild(carouselContainer);

    // Description Creation
    const descriptionContainer = createElement("div", "description-container"); 
    
    const description = createElement("p");
    description.textContent = item.querySelector("name").textContent;
    descriptionContainer.appendChild(description);
    
    const rentalPrice = item.querySelector("renting-price") ? item.querySelector("renting-price").textContent : "0.00 $";
    const priceTag = createElement("p", "price-tag");
    priceTag.textContent = `${rentalPrice} / week`;
    descriptionContainer.appendChild(priceTag);
    
    card.appendChild(descriptionContainer);


    // Quick Add Creation & Logic
    const plusButton = createElement("button", "plus-button");
    plusButton.innerHTML = "<i class='fa-solid fa-circle-plus'></i>"
    const plusIcon = plusButton.getElementsByTagName("i")[0];
    plusIcon.addEventListener("click", function(event){
        event.stopImmediatePropagation();
        this.classList.toggle("active");
        sizesContainer.classList.toggle("active");
    });

    const sizesContainer = createElement("div", "quick-sizes-container");

    const sizes = item.querySelectorAll("size");
    sizes.forEach(size =>{
        const sizeBtn = createElement("button", "size-btn");
        sizeBtn.innerHTML = size.textContent;

        sizeBtn.addEventListener("click", function(event){
            event.stopImmediatePropagation();
            addToCart(item, size.textContent);
            plusIcon.classList.toggle("active");
            sizesContainer.classList.toggle("active");
        });

        sizesContainer.appendChild(sizeBtn);
    });

    carouselContainer.addEventListener("mouseleave", ()=>{
        if(plusIcon.classList.contains("active")){
            plusIcon.classList.toggle("active");
            sizesContainer.classList.toggle("active");
        }
    });


    carouselContainer.appendChild(plusButton);
    carouselContainer.appendChild(sizesContainer);
    addModalBehavior(card, item);

    return card;
}

function addModalBehavior(card, item){
    card.addEventListener("click", function(event) {
        if(!event.target.closest(".prev") && !event.target.closest(".next")){
            modal.addEventListener("click", function(event){
                if(!event.target.closest(".modal-content")){
                    closeModal(this);
                }
            });

            modal.querySelector(".close-cross").addEventListener("click", ()=>closeModal(modal));

            const modalContent = modal.querySelector(".modal-content");

            const name = item.querySelector("name").textContent;
            const brand = item.closest("brand") ? item.closest("brand").getAttribute("name") : "Unknown Brand";
            const description = item.querySelector("description").textContent;
            const retailPrice = item.querySelector("retail-price") ? item.querySelector("retail-price").textContent : "Price not available";
            const rentalPrice = item.querySelector("renting-price") ? item.querySelector("renting-price").textContent : "Price not available";
            const sizes = item.querySelectorAll("size");

            if(modalContent.children.length > 1){
                modalContent.removeChild(modalContent.lastChild);
                modalContent.removeChild(modalContent.lastChild);
            }

            const modalCarouselContainer = createImageCarousel(item.querySelectorAll("image"), "modal-carousel-image");
            modalContent.appendChild(modalCarouselContainer);

            const modalDescriptionContainer = createElement("div", "modal-description-container");
            modalDescriptionContainer.innerHTML = "";
            modalContent.appendChild(modalDescriptionContainer);

            const sizesElem = createElement("div");
            sizesElem.classList.add("sizes-container");

            const sizesTitle = createElement("p");
            sizesTitle.innerHTML = "<strong>Sizes:</strong>";

            sizesElem.appendChild(sizesTitle);
            
            let selectedSize = null;

            sizes.forEach(size => {
                const sizeValue = size.childNodes[0].nodeValue.trim();
                //const available = size.querySelector("available")  ? parseInt(size.querySelector("available").textContent) : 0;

                const sizeButton = createElement("button");
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

            const nameElem = createElement("h2");
            nameElem.textContent = name;

            const brandElem = createElement("p");
            brandElem.innerHTML = `<strong>Brand:</strong> ${brand}`;

            const descElem = createElement("p");
            descElem.innerHTML = `<strong>Description:</strong> ${description}`;

            const addToCartButton = createElement("button", "add-to-cart-button");
            addToCartButton.textContent = "Select a Size";
            addToCartButton.disabled = true;

            addToCartButton.addEventListener("click", () => {
                addToCart(item, selectedSize);
            });
            
            const retailPriceElem = createElement("p");
            retailPriceElem.innerHTML = `<strong>Avg. Retail Price:</strong> ${retailPrice}`;

            const rentalPriceElem = createElement("p", "price-tag");
            rentalPriceElem.innerHTML = `<strong>Rental Price:</strong> ${rentalPrice} / week`;

            modalDescriptionContainer.appendChild(sizesElem);
            modalDescriptionContainer.appendChild(nameElem);
            modalDescriptionContainer.appendChild(brandElem);
            modalDescriptionContainer.appendChild(descElem);
            modalDescriptionContainer.appendChild(retailPriceElem);
            modalDescriptionContainer.appendChild(rentalPriceElem);

            modalDescriptionContainer.appendChild(addToCartButton);
            
            showModal(modal); 
        }
    });
}

export function populateClothingRows(xml) {
    const clothingData = xml.querySelectorAll("brand");  // Start by selecting the brands
    const body = document.getElementsByClassName("clothing-container")[0];

    clothingData.forEach((brand) => {
        const brandName = brand.getAttribute("name");
        const brandContainer = createElement("div", "brand-container");

        const brandTitle = createElement("h1");
        brandTitle.textContent = brandName;
        brandContainer.appendChild(brandTitle);

        const types = brand.querySelectorAll("type"); // Now go into the types within each brand
        types.forEach((type) => {
            const typeName = type.getAttribute("name");
            const typeContainer = createElement("div", "type-container");

            const typeTitle = createElement("h2");
            typeTitle.textContent = typeName;
            typeContainer.appendChild(typeTitle);

            const row = createElement("div", "row");

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

export function populateClothingRowsByType(xml) {
    const clothingData = xml.querySelectorAll("type");
    const uniqueTypes = new Set();

    clothingData.forEach((type) => {
        const typeName = type.getAttribute("name");
        uniqueTypes.add(typeName);
    });

    const body = document.getElementById("clothing-container");

    uniqueTypes.forEach((typeName) => {
        const typeContainer = createElement("div", "brand-container");

        const typeTitle = createElement("h1");
        typeTitle.textContent = typeName;
        typeContainer.appendChild(typeTitle);

        const xpathExpression = `//brand[type[@name='${typeName}']]`;
        const result = xml.evaluate(xpathExpression, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        
        for(let i = 0; i < result.snapshotLength; i++){
            const brand = result.snapshotItem(i);
            const brandName = brand.getAttribute("name");
            const brandContainer = createElement("div", "type-container");

            const brandTitle = createElement("h2");
            brandTitle.textContent = brandName;
            brandContainer.appendChild(brandTitle);

            const row = createElement("div", "row");

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

