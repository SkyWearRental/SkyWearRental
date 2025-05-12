import {
    closeModal,
    showModal,
    createElement,
    createImageCarousel,
    getRentingPrice
} from "../utilities/utilities.js";

import { addToCart } from "./cart.js";


export async function showGenderSelection(male_xml, female_xml){
    const genderSelectionDiv = document.getElementById("gender-selection");
    const maleBtn = document.getElementById("male-btn");
    const femaleBtn = document.getElementById("female-btn");

    maleBtn.addEventListener("click", () => {
        pickGender(genderSelectionDiv, male_xml);
        setFilterBtns("male");
    });

    femaleBtn.addEventListener("click", () => {
        pickGender(genderSelectionDiv, female_xml);
        setFilterBtns("female");
    });
}

function setFilterBtns(gender){
    switch(gender){
        case "male":
            document.getElementById("male-filter").classList.add("active");
            break;

        case "female":
            document.getElementById("female-filter").classList.add("active");
            break;
    }
}

function pickGender(genderSelectionDiv, xml){
        genderSelectionDiv.style.display = "none";
        populateClothingRowsByType(xml);
        document.getElementById("filters-btn").style.display = "block";
        document.getElementById("items-btn").style.display = "block";
        document.getElementById("bundles-btn").style.display = "block";
}

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
    
    const rentingPrice = getRentingPrice(item);
    const priceTag = createElement("p", "price-tag");
    priceTag.textContent = `${rentingPrice} € / week`;
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

function createBundleCard(item){
    const card = createElement("div", "bundle-clothing-card");

    // First Image (No carousel)
    const imageContainer = createElement("div", "image-container");
    const img = createElement("img");
    const firstImage = item.querySelector("image"); // Assuming the first <image> tag has the first picture
    img.src = firstImage ? firstImage.textContent : "";  // Use the first image source URL
    img.alt = "Clothing item image";  // Alt text for accessibility
    imageContainer.appendChild(img);
    card.appendChild(imageContainer);

    // Description (Small container)
    const descriptionContainer = createElement("div", "description-container"); 
    const description = createElement("p");
    description.textContent = item.querySelector("name").textContent;  // Item's name as description
    descriptionContainer.appendChild(description);

    card.appendChild(descriptionContainer);

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
            const rentalPrice = getRentingPrice(item);
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

export function populateBundleClothingRows(xml) {
    const bundles = xml.querySelectorAll("bundle");
    const body = document.getElementById("clothing-container");

    bundles.forEach((bundle) => {
        const bundleType = bundle.getAttribute("type");
        const bundleId = bundle.getAttribute("id");

        const bundleContainer = createElement("div", "bundle-container");

        const bundleButton = createElement("button", "bundle-action-button");
        bundleButton.innerHTML = "<i class='fa-solid fa-plus'></i>";
        
        // Size dropdown container
        const sizeDropdown = createElement("div", "bundle-size-dropdown");

        // Create size buttons
        ["S", "M", "L"].forEach(size => {
            const sizeBtn = createElement("button", "bundle-size-btn");
            sizeBtn.textContent = size;

            sizeBtn.addEventListener("click", (e) => {
                e.stopPropagation();


                const allItems = bundle.querySelectorAll("item");
                allItems.forEach(item => {
                    const bundlePrice = 90 / allItems.length;
                    const categoryNode = item.closest("jacket, sweaters, tshirts");
                    const typeName = categoryNode ? categoryNode.nodeName : "Unknown Type";
                    const brandName = bundle.getAttribute("brand") || "Unknown Brand";

                    const wrappedItem = convertBundleItemToStandardItem(item, capitalize(typeName), brandName);
                    addToCart(wrappedItem, size, bundlePrice);
                });

                sizeDropdown.classList.remove("active");
                bundleButton.querySelector("i").classList.remove("active");
            });

            sizeDropdown.appendChild(sizeBtn);
        });

        // Toggle dropdown visibility
        bundleButton.addEventListener("click", (e) => {
            e.stopPropagation();
            bundleButton.querySelector("i").classList.toggle("active");
            sizeDropdown.classList.toggle("active");
        });

        bundleContainer.appendChild(bundleButton);
        bundleContainer.appendChild(sizeDropdown);

        // Optional: hide dropdown when leaving bundle area
        bundleContainer.addEventListener("mouseleave", () => {
            sizeDropdown.classList.remove("active");
            bundleButton.querySelector("i").classList.remove("active");
        });

        const bundleTitle = createElement("h1");
        bundleTitle.textContent = `${bundleType} Bundle ${bundleId}`;
        bundleContainer.appendChild(bundleTitle);

        // Iterate through category nodes inside the bundle (jackets, sweaters, tshirts, etc.)
        const categories = bundle.children;
        for (let category of categories) {
            const categoryName = category.nodeName;

            const typeContainer = createElement("div", "bundle-type-container");
            const typeTitle = createElement("h2");
            typeTitle.textContent = capitalize(categoryName);
            typeContainer.appendChild(typeTitle);

            const row = createElement("div", "bundle-row");
            const items = category.querySelectorAll("item");

            items.forEach(item => {
                const card = createBundleCard(item);
                row.appendChild(card);
            });

            typeContainer.appendChild(row);

            // Only append if there are items
            if (row.hasChildNodes()) {
                bundleContainer.appendChild(typeContainer);
            }
        }

        if (bundleContainer.children.length > 1) {
            body.appendChild(bundleContainer);
        }
    });
}

function convertBundleItemToStandardItem(bundleItem, typeName, brandName) {
    // Create the full structure: <brand><type><item>...</item></type></brand>

    const item = document.createElement("item");

    // ID
    const id = createElement("id");
    id.textContent = bundleItem.querySelector("id")?.textContent || "";
    item.appendChild(id);

    // Name
    const name = createElement("name");
    name.textContent = bundleItem.querySelector("name")?.textContent || "";
    item.appendChild(name);

    // Description (optional)
    const desc = createElement("description");
    desc.textContent = bundleItem.querySelector("description")?.textContent || "No description";
    item.appendChild(desc);

    // Sizes
    const sizesWrapper = createElement("sizes");
    bundleItem.querySelectorAll("size").forEach(size => {
        const sizeElement = createElement("size");
        sizeElement.textContent = size.textContent;
        sizesWrapper.appendChild(sizeElement);
    });
    item.appendChild(sizesWrapper);

    // Prices
    const retail = createElement("retail-price");
    retail.textContent = bundleItem.querySelector("retail-price")?.textContent || "€0";
    item.appendChild(retail);

    const rent = createElement("renting-price");
    rent.textContent = bundleItem.querySelector("renting-price")?.textContent || "€0";
    item.appendChild(rent);

    // Images
    const imagesWrapper = createElement("images");
    bundleItem.querySelectorAll("image").forEach(img => {
        const imgElement = createElement("image");
        imgElement.textContent = img.textContent;
        imagesWrapper.appendChild(imgElement);
    });
    item.appendChild(imagesWrapper);

    // Wrap in <type name="...">
    const type = createElement("type");
    type.setAttribute("name", typeName);
    type.appendChild(item);

    // Wrap in <brand name="...">
    const brand = createElement("brand");
    brand.setAttribute("name", brandName || "Unknown Brand");
    brand.appendChild(type);

    return item; // Return the original <item>, which is now inside <type> inside <brand>
}
// Optional helper to capitalize category titles like "jackets" → "Jackets"
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


