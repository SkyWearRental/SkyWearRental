import {isActive, createElement, emptyPage} from "../utilities/utilities.js";
import { populateClothingRows, populateClothingRowsByType } from "./show_clothes.js";

var activeElements = [];
let male_xml = null;
let female_xml = null;
let current_xml = null;

const filtersBtn = document.getElementById("filters-btn");

const sidebar = document.querySelector(".sidebar");

// Gender filters
const maleBtn = document.getElementById("male-filter");
const femaleBtn = document.getElementById("female-filter");
// Order by filters
const brandBtn = document.getElementById("brand-btn");
const typeBtn  = document.getElementById("type-btn");
// Type filters
const typesDropdown = document.getElementById("types-dropdown");
const typeItems = document.getElementById("type-items");
// Brand filters
const brandsDropdown = document.getElementById("brands-dropdown");
const brandItems = document.getElementById("brand-items");

const overlay = document.getElementById("overlay");

const applyBtn = document.getElementById("apply-filters-btn"); 

export async function initFilters(m_xml, f_xml){
    male_xml = m_xml;
    female_xml = f_xml;

    current_xml = getCurrentXML();
    populateAllFilters(current_xml);

    filtersBtn.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", closeSidebar);

    maleBtn.addEventListener("click", toggleGender);
    femaleBtn.addEventListener("click", toggleGender);
    brandBtn.addEventListener("click", toggleOrder);
    typeBtn.addEventListener("click", toggleOrder);

    applyBtn.addEventListener("click", applyFilters)
}
function getCurrentXML(){
    return isActive(maleBtn) ? male_xml : female_xml;
}

function toggleSidebar(){
    sidebar.classList.toggle("active");
    filtersBtn.classList.toggle("active");

    reset();
}

function closeSidebar(){
    sidebar.classList.remove("active");
    filtersBtn.classList.remove("active");

    reset();
}

function applyFilters(){
    updateActiveElements();
    closeSidebar();
    updatePage();
}

function updatePage(){
    emptyPage();

    const {wantedTypes, breakIndex} = getSelectedTypes();

    const wantedBrands = getSelectedBrands(breakIndex);

    const xml = getCurrentXML().cloneNode(true);

    const brands = xml.querySelectorAll("brand");
    brands.forEach(brand => {
        const brandName = brand.getAttribute("name");

        if(wantedBrands.length > 0 && !wantedBrands.includes(brandName)){
            const parent = brand.parentElement;
            parent.removeChild(brand);
        }

        const types = brand.querySelectorAll("type");

        types.forEach(type => {
            const typeName = type.getAttribute("name");

            if(wantedTypes.length > 0 && !wantedTypes.includes(typeName)){
                brand.removeChild(type);
            }
        });
    });

    activeElements[1].innerHTML === "Clothing Type" ? populateClothingRowsByType(xml) : populateClothingRows(xml);
}

function getSelectedTypes(){
    let wantedTypes = [];
    let breakIndex = activeElements.length;

    for(let i = 2; i < activeElements.length; i++){
        if(activeElements[i].innerHTML.includes("brands")){
            breakIndex = 1;
            break;
        }
        else if(!activeElements[i].innerHTML.includes("types")){
            wantedTypes.push(activeElements[i].innerHTML);
        }
    }

    return {wantedTypes, breakIndex};
}

function getSelectedBrands(breakIndex){
    let wantedBrands = [];
    for(let i = breakIndex; i < activeElements.length; i++){
        if(!activeElements[i].innerHTML.includes("brands")){
            wantedBrands.push(activeElements[i].innerHTML);
        }
    }

    return wantedBrands;
}

function updateActiveElements(){
    activeElements.length = 0;
    Array.from(sidebar.getElementsByTagName("button")).forEach(button => {
        if(isActive(button)) activeElements.push(button);
    });
}

function reset(){
    const buttons = getFilterBtns();

    if(isActive(sidebar)){
        document.body.style.overflow = "hidden";
        overlay.style.display = "block";

        buttons.forEach(button => {
            if(button.classList.contains("active")){
                activeElements.push(button);
            }
        });
    }
    else{
        document.body.style.overflow = "";
        overlay.style.display = "none";
        buttons.forEach(button => {
            if((isActive(button) && !(activeElements.includes(button))) || (activeElements.includes(button) && !isActive(button))){
                button.classList.toggle("active");
            }
        });

    }

    document.getElementById("type-items").style.display = isActive(document.getElementById("types-dropdown")) ? "block" : "none";
    document.getElementById("brand-items").style.display = isActive(document.getElementById("brands-dropdown")) ? "block" : "none";
}

function populateAllFilters(xml){
    populateFilters(xml, "type");
    populateFilters(xml, "brand");
}

function populateFilters(xml, tag){
    const isType = (tag==="type");
    const itemsContainer = isType ? typesDropdown : brandsDropdown;
    const items = isType ? typeItems : brandItems; 
    items.innerHTML = "";

    getSet(xml, tag).forEach(item => {
        createFilterBtn(item, items);
    });

    setLastElement(items);
    items.style.display = "none";
    
    if(!itemsContainer.dataset.listenerAdded){
        itemsContainer.addEventListener("click", ()=>dropdown(items, itemsContainer));
        itemsContainer.dataset.listenerAdded = "true";
    }
}

function dropdown(items, title){
    items.style.display = items.style.display === "none" ? "block" : "none";
    title.classList.toggle("active");
}

function setLastElement(items){
    const children = items.getElementsByClassName("dropdown-item");
    children[children.length - 1].classList.add("last-item");
}

function getSet(xml, tagname){
    const set = new Set();
    
    const elements = xml.getElementsByTagName(tagname);
    for(let element of elements){
        set.add(element.getAttribute("name"));
    }

    return set;
}

function createFilterBtn(content, container){
    console.log("creating filters buttons");
    const button = createElement("button", "dropdown-item");
    button.textContent = content;
    container.appendChild(button);

    button.addEventListener("click", function(){
        this.classList.toggle("active");
    });
}

function getFilterBtns(){
    return Array.from(sidebar.getElementsByTagName("button"));
}

function toggleGender(){
    maleBtn.classList.toggle("active");
    femaleBtn.classList.toggle("active");
    
    current_xml = getCurrentXML();
    populateAllFilters(current_xml);
    
    reset();
}

function toggleOrder(){
    brandBtn.classList.toggle("active");
    typeBtn.classList.toggle("active");
}