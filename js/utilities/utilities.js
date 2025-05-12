export function closeModal(modal){
    if(!modal) return;
    requestAnimationFrame(() => {
        modal.style.display = "none";
        document.body.style.overflow= "auto";
    });
}

export function showModal(modal, display = "flex"){
    if(!modal) return;
    requestAnimationFrame(() => {
        modal.style.display = display;
        document.body.style.overflow = "hidden";
    });
}

export function createElement(tag, className, options = {}) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    Object.assign(el, options);
    return el;
}

function createCarouselButton(direction, onClick) {
    const btn = createElement("button", `carousel-button ${direction}`);
    const iconClass = direction === "prev" ? "fa-chevron-left" : "fa-chevron-right";
    btn.innerHTML = `<i class='fa-solid ${iconClass}'></i>`;
    btn.addEventListener("click", onClick);
    return btn;
}

export function createImageCarousel(images, imageClass = "carousel-image") {
    const imagesArray = Array.from(images).map(img => img.textContent);

    const carouselContainer = createElement("div", imageClass.includes("modal") ? "modal-carousel-container" : "carousel-container");
    const carousel = createElement("div", imageClass.includes("modal") ? "modal-carousel" : "carousel");

    const imgElements = [];
    let currentIndex = 0;

    imagesArray.forEach((src, index) => {
        const img = createElement("img", imageClass, {
            src: src,
            alt: ""
        });
        img.style.display = index === 0 ? "block" : "none";
        carousel.appendChild(img);
        imgElements.push(img);
    });

    function changeImage(direction) {
        imgElements[currentIndex].style.display = "none";
        currentIndex = (currentIndex + direction + imgElements.length) % imgElements.length;
        imgElements[currentIndex].style.display = "block";
    }

    const withButtons = (imagesArray.length > 1);
    carouselContainer.appendChild(carousel);
    if(withButtons) carouselContainer.appendChild(createCarouselButton("prev", () => changeImage(-1)));
    if(withButtons) carouselContainer.appendChild(createCarouselButton("next", () => changeImage(1)));

    return carouselContainer;
}

export function getRentingPrice(item){
    const retailPriceStr = item.querySelector("retail-price") ? item.querySelector("retail-price").textContent : "0.00 $";
    const retailPrice = parseFloat(retailPriceStr.replace(/[^0-9.]/g, ''))
    const rentingPrice = Number(retailPrice) * 0.1;

    return rentingPrice.toFixed(2);
}

export function isActive(element){
    return element.classList.contains("active");
}

export function emptyPage(){
    const clothingContainer = document.getElementById("clothing-container");
    const scrollToTopBtn    = document.getElementById("scroll-to-top");

    clothingContainer.innerHTML = "";
    clothingContainer.appendChild(scrollToTopBtn);
}