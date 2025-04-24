import {loadXML} from "../utilities/xml.js";
import {createHeader} from "./header.js";
import {populateClothingRows} from "./show_clothes.js";
import {initCart} from "./cart.js";
import { initEmailJS } from "./email.js";
import { initFilters } from "./filters.js";

document.addEventListener("DOMContentLoaded", async function(){
    try{
        const [male_xml, female_xml] = await Promise.all([
            loadXML("../xml/clothing_male.xml"),
            loadXML("../xml/clothing_female.xml")
        ]);

        await Promise.all([
            createHeader(),
            populateClothingRows(male_xml),
            initCart(),
            initEmailJS(),
            initFilters(male_xml, female_xml)
        ]);
    }
    catch(error){
        console.error(error);
    }
});



