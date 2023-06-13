import App from "../../App.js";
import { getMaterialIcon } from "../../lib/gtd/material/materialicons.js";
import { setClasses, setEvents, setStyles, UIComponent } from "../../lib/gtd/web/uicomponent.js";
import { ViewUI } from "../../lib/gtdf/views/ViewUI.js";
import HomeCore from "./HomeView.core.js";

export default class HomeView extends ViewUI {

    private static ID = "home";
    private static SETTINGS_PANEL_ID = "panel-settings";
    private static MAIN_PANEL_ID = "panel-main";

    public constructor(){
        super({
            type: "view",
            id: HomeView.ID,
            classes: ["box-row","box-y-center"],
        });
    }

    public show(params : string[], container : UIComponent): void {

        const settingsPanel = this.instanceSettingsPanel();
        const mainPanel = this.instanceMainPanel();
       
        settingsPanel.appendTo(this);
        mainPanel.appendTo(this);

        this.appendTo(container);
    }


    public addImage(File : File){

        //add image to gallery
        const gallery = this.element.querySelector("#gallery") as HTMLElement;

        const image = new UIComponent({
            type : "img",
            attributes : {
                src : URL.createObjectURL(File),
            },
            classes : ["image-icon"],
        });

        image.appendTo(gallery);

    }


    public instanceSettingsPanel(): UIComponent {

        const panel = new UIComponent({
            type : "div",
            id : HomeView.SETTINGS_PANEL_ID,
            classes : ["box-column","box-y-center"],
        });

        const title = new UIComponent({ 
            type : "h1",
            text : App.getBundle().home.SETTINGS,
            id: "title",
        });

        const inputLabel = new UIComponent({
            type : "label",
            text : "File name",
            id : "input-file-name-label",
            styles : {
                fontSize : "0.8rem",
                color : "rgba(200,200,200,0.5)",
                marginTop : "1rem",
            }
        });


        const input = new UIComponent({
            type : "input",
            attributes : {
                type : "text",
                placeholder : "File name",
                value : "mygif",
            },
            id : "input-file-name",
            styles : {
                width : "10rem",
            }
        });


        const sliderValue = new UIComponent({
            type : "p",
            text : "Time: 50ms",
            id : "input-slider-value",
            styles : {
                fontSize : "0.8rem",
                color : "rgba(200,200,200,0.5)",
                marginTop : ".2rem",
            }
        });

        const slider = new UIComponent({
            type : "input",
            attributes : {
                type : "range",
                min : "1",
                max : "1000",
                value : "50",
            },
            id : "input-slider",
            styles : {
                width : "10rem",
                cursor : "pointer",
            }
        });
        

        setEvents(slider.element,{
            input : (e : Event) => {
                const target = e.target as HTMLInputElement;
                sliderValue.element.innerText = "Time: " + target.value + " ms";
            }
        });


        const button = new UIComponent({
            type : "button",
            text : "Create",
            id : "button-create-gif",
            styles : {
                width : "6rem",
                marginTop : "1rem",
                backgroundColor : "rgba(200,200,200,0.1)",
            }
        });

        
        title.appendTo(panel);
        
        sliderValue.appendTo(panel);
        slider.appendTo(panel);

        inputLabel.appendTo(panel);
        input.appendTo(panel);

        button.appendTo(panel);
        return panel;

    }


    public instanceMainPanel(): UIComponent {

        const panel = new UIComponent({
            type : "div",
            classes : ["box-column","box-center"],
            id : HomeView.MAIN_PANEL_ID,
        });


        const title = new UIComponent({
            type : "h1",
            text : App.getBundle().home.WELCOME_MESSAGE,
            id: "title",
        })

        const dragAndDrop = new UIComponent({
            type : "div",
            id : "drag-and-drop",
        });

        const fileicon = getMaterialIcon("image",{
            size : "5rem",
            fill : "rgba(200,200,200,0.1)"
        });

        fileicon.appendTo(dragAndDrop);

     
        setEvents(dragAndDrop.element,{
            dragover : (e : DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
                setClasses(dragAndDrop.element,["active"]);
            },
            dragleave : (e : DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
                dragAndDrop.element.classList.remove("active");
            },

            drop : (e : DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
                dragAndDrop.element.classList.remove("active");

                const files = e.dataTransfer?.files;
                if(files){
                    HomeCore.uploadFiles(this, files);
                }
            }

        });

        const gallery = new UIComponent({
            type : "div",
            id : "gallery",
        });

        title.appendTo(panel);
        dragAndDrop.appendTo(panel);
        gallery.appendTo(panel);

        return panel;

    }

}