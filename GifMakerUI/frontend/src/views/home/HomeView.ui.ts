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

        const settings = new UIComponent({
            type : "div",
            id : "options",
            classes : ["box-column","box-y-center"],
        });


        const title = new UIComponent({ 
            type : "h1",
            text : App.getBundle().home.SETTINGS,
            id: "title",
            styles : {
                marginTop : "1rem",
                fontSize : "1.5rem",
                padding : "1rem",
                backgroundColor : "rgba(200,200,200,0.015)",
                width : "18rem",
                borderRadius : "0.5rem",
                fontWeight : "thin",
            }
        });

        const inputLabel = new UIComponent({
            type : "label",
            text : "File name",
            id : "input-file-name-label",
            styles : {
                fontSize : "0.8rem",
                fontWeight : "thin",
                color : "rgba(200,200,200,0.5)",
                marginTop : "1rem",
                width : "16rem",
                marginBottom : ".3rem",
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
                width : "16rem",
            }
        });


        const sliderValue = new UIComponent({
            type : "p",
            text : "Time: 50ms",
            id : "input-slider-value",
        });

        const slider = new UIComponent({
            type : "input",
            attributes : {
                type : "range",
                min : "1",
                max : "1000",
                value : "50",
            },
            id : "input-slider"
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

        setEvents(button.element,{
            click : (e : Event) => {
                const target = e.target as HTMLInputElement;

                const state = this.addQueueItem(input.getValue(),"coffee", false, true);
                const id = HomeCore.makeGif(this, input.getValue(), slider.getValue());
                state.element.id = id;
                
            }
        });

        title.appendTo(settings);
        
        sliderValue.appendTo(settings);
        slider.appendTo(settings);

        inputLabel.appendTo(settings);
        input.appendTo(settings);

        button.appendTo(settings);

        const queuePanel = this.instanceQueuePanel();

        settings.appendTo(panel);
        queuePanel.appendTo(panel);
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


    private instanceQueuePanel(): UIComponent {

        const panel = new UIComponent({
            type : "div",
            classes : ["box-column","box-center"],
            id : "queue-panel",
        });

        const title = new UIComponent({
            type : "h1",
            text : "Queue",
            id: "title",
            styles : {
                padding : "1rem",
                backgroundColor : "rgba(200,200,200,0.015)",
                width : "18rem",
                fontSize : "1.5rem",
                borderRadius : "0.5rem",
                fontWeight : "thin",
            }
        })


        const queue = new UIComponent({
            type : "div",
            id : "queue",
        });

        title.appendTo(panel);
        queue.appendTo(panel);
        return panel;

    }

    public addQueueItem(name : string, icon : string, download: boolean = false, add : boolean) :UIComponent{

        const queue = this.element.querySelector("#queue") as HTMLElement;

        const item = new UIComponent({
            type : "div",
            classes : ["box-row","box-x-between"],
            styles : {
                width : "18rem",
                padding : ".5rem",
                background : "rgba(200,200,200,0.015)",
                marginBottom : ".5rem",
                borderRadius : ".5rem",
            }
        });

        const icons = new UIComponent({
            type : "div",
            classes : ["box-row",],
        });

        const itemIcon = getMaterialIcon(icon,{
            size : "1.5rem",
            fill : "rgba(200,200,200,0.5)",
        });

        if(download) {
            const downloadIcon = getMaterialIcon("download",{
                size : "1.5rem",
                fill : "rgba(200,200,200,0.5)",
            });
    
            setStyles(downloadIcon.element,{
                cursor : "pointer",
                marginRight : ".5rem",
            });
    
    
            downloadIcon.appendTo(icons);
        }

        itemIcon.appendTo(icons);
       
        const itemName = new UIComponent({
            type : "p",
            text : name,
            classes : ["box-row","box-y-center"],
            styles : {
                fontSize : "1rem",
                color : "rgba(200,200,200,0.5)",
                marginLeft : ".5rem",
                height : "1.5rem",
            }
        });

       
        itemName.appendTo(item);
        icons.appendTo(item);
    

        if(add)
            item.appendTo(queue);

        return item;
    }

    public updateQueueItem(id : string, name : string, success : boolean = true) {
        console.log("update queue item");
        
        const item = document.getElementById(id) as HTMLElement;

        if(!success){
            item.remove();
        }


        const newQueueItem = this.addQueueItem(name, "check", true, false);
        item.outerHTML = newQueueItem.element.outerHTML;

    }

    public clearGallery(){
        
        const gallery = this.element.querySelector("#gallery") as HTMLElement;
        gallery.innerHTML = "";

    }

}