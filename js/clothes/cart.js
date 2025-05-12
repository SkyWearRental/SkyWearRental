import {closeModal, showModal, createElement} from "../utilities/utilities.js";

let cart = [];
let totalOrderPrice = 0;
const modal = document.getElementById("cart-modal");

export async function initCart(){
    loadCart();
    document.getElementById("suitcase-icon").addEventListener("click", toggleCartModal);
    document.getElementById("close-cross-cart").addEventListener("click", ()=> closeModal(modal));
    window.addEventListener("click", function(event){
        if(event.target === modal){
            closeModal(modal);
        }
    });
}

function loadCart(){
    const savedCart = localStorage.getItem("cart");
    if(savedCart){
        cart = JSON.parse(savedCart);
        totalOrderPrice = cart.reduce((sum, item) => {
            const price = parseFloat(item.price.replace(/[^\d.]/g, ""));
            return sum + (isNaN(price) ? 0 : price);
        }, 0);
        document.getElementById("total-price").innerHTML = `<strong>Total:</strong> € ${totalOrderPrice.toFixed(2)} / week`
    }
    updateCartUI();
}

function saveCart(){
    localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(item, size, bundlePrice){
    const itemName = item.querySelector("name").textContent;
    const itemBrand = item.closest("brand") ? item.closest("brand").getAttribute("name") : "Unknown Brand";
    const itemId = item.querySelector("id").textContent.trim();
    const itemType = item.closest("type").getAttribute("name");
    const mainImage = item.querySelectorAll("image")[0].textContent;
    const rentalPrice = item.querySelector("renting-price").textContent;

    cart.push({type: itemType, brand: itemBrand, id: itemId, name: itemName, size: size, image: mainImage, price: rentalPrice});
    
    if(!bundlePrice){
        const priceNumber = parseFloat(rentalPrice.replace(/[^\d.]/g, ""));
        if(!isNaN(priceNumber)){
            totalOrderPrice += priceNumber;
        }
    }
    else{
        totalOrderPrice += bundlePrice;
    }
    
    document.getElementById("total-price").innerHTML = `<strong>Total: </strong> € ${totalOrderPrice.toFixed(2)} / week`

    saveCart();
    updateCartUI();
}

function removeFromCart(itemType, itemBrand, itemId, size){
    cart = cart.filter(item => !(item.type === itemType && item.brand == itemBrand && item.id === itemId && item.size === size));

    saveCart();
    updateCartUI();
}

function removeItemFromCart(index){
    const removedItem = cart[index];

    const priceNumber = parseFloat(removedItem.price.replace(/[^\d.]/g, ""));
    if (!isNaN(priceNumber)) {
        totalOrderPrice -= priceNumber;
    }

    cart.splice(index, 1);
    
    document.getElementById("total-price").innerHTML = `<strong>Total: </strong> € ${totalOrderPrice.toFixed(2)} / week`;
    
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

function toggleCartModal(){
    if(modal.style.display === "flex"){
        closeModal(modal);
    }
    else{
        renderCartItems();
        showModal(modal);
    }
}


function renderCartItems(){
    const modalItemsContainer = document.getElementById("modal-items-container");
    modalItemsContainer.innerHTML = "";

    if(cart.length === 0){
        modalItemsContainer.innerHTML = "<p>Your cart is empty</p>";
        return;
    }

    cart.forEach((item, index) => {
        const cartItem = createElement("div", "cart-item");

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