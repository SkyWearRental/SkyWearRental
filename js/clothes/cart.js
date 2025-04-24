import {closeModal, showModal, createElement} from "../utilities/utilities.js";

let cart = [];
const modal = document.getElementById("cart-modal");

export function initCart(){
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
    }
    updateCartUI();
}

function saveCart(){
    localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(item, size){
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