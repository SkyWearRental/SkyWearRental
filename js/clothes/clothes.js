import {loadXML} from "../utilities/xml.js";
import {createHeader} from "./header.js";
import {showGenderSelection} from "./show_clothes.js";
import {initCart} from "./cart.js";
import { initEmailJS } from "./email.js";
import { initFilters } from "./filters.js";


var male_xml, female_xml;

document.addEventListener("DOMContentLoaded", async function(){
    try{
        [male_xml, female_xml] = await Promise.all([
            loadXML("../xml/clothing_male.xml"),
            loadXML("../xml/clothing_female.xml")
        ]);

        createHeader();
        initCart();
        initEmailJS();
        initFilters(male_xml, female_xml);
        showGenderSelection(male_xml, female_xml);
    }
    catch(error){
        console.error(error);
    }
});

export function getXML(gender){
    if(gender === "male"){
        return male_xml ? male_xml : null;
    }
    else if(gender === "female"){
        return female_xml ? female_xml : null;
    }

    return null;
}




