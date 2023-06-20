import App from "../../App.js";
import { Config } from "../../config/Config.js";
import { RequestState } from "../../core/requests/states.js";
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

        this.reloadGallery();
        this.reloadQueue();
        this.appendTo(container);

    }

    public addImage(File : File){

        //add image to gallery
        const gallery = this.element.querySelector("#gallery") as HTMLElement;

        const index = Object.values(HomeCore.files).indexOf(File);

        const image = new UIComponent({
            type : "img",
            id : `image-${index}`,
            attributes : {
                src : URL.createObjectURL(File),
                draggable : "true",
            },
            classes : ["image-icon"],
        });

        setEvents(image.element,{
            click : (e : Event) => {
                this.setSelected(image.element);
            },
        });


        image.appendTo(gallery);
     

    }

    public setSelected (element : HTMLElement){
         // remove selected from all images
         const images = document.querySelectorAll(".image-icon");
         images.forEach((image : any) => {
             image.classList.remove("selected");
         });

         // add selected to clicked image
         element.classList.toggle("selected");
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
        });

        const inputLabel = new UIComponent({
            type : "label",
            text : "File name",
            id : "input-file-name-label",
        });

        const input = new UIComponent({
            type : "input",
            id : "input-file-name",
            attributes : {
                type : "text",
                placeholder : "File name",
                value : Config.getConfigVariable("gifName") || "KITTEN",
            },
        });

        setEvents(input.element,{
            input : (e : Event) => {
                const target = e.target as HTMLInputElement;
                Config.setConfigVariable("gifName", target.value);
            }
        });

        const sliderValue = new UIComponent({
            type : "p",
            text : `Time: ${Config.getConfigVariable("gifTime") || 50} ms`,
            id : "input-slider-value",
        });

        const slider = new UIComponent({
            type : "input",
            attributes : {
                type : "range",
                min : "5",
                max : "500",
                step: "5",
                value :  Config.getConfigVariable("gifTime") || "50",
            },
            id : "input-slider"
        });
        
        setEvents(slider.element,{
            input : (e : Event) => {
                const target = e.target as HTMLInputElement;
                sliderValue.element.innerText = "Time: " + target.value + " ms";
                Config.setConfigVariable("gifTime", target.value);
            }
        });

        const button = new UIComponent({
            type : "button",
            text : "Create",
            id : "button-create-gif",
            classes : ["box-row","box-center","button"],   
        });

        const icon = getMaterialIcon("construction",{
            size : "1.25rem",
            fill : "rgba(200,200,200,0.5)",
        });

        setStyles(icon.element,{
            marginLeft : ".5rem",
        });

        icon.appendTo(button);

        setEvents(button.element,{
            click : (e : Event) => {
               
                if(input.getValue() == ""){
                    input.element.focus();
                    alert({
                        title : "Be careful!",
                        message : "File name cannot be empty",
                        icon : "info",
                    })
                    return;
                }

                if(Object.keys(HomeCore.files).length == 0){
                    alert({
                        title : "Be careful!",
                        message : "You must upload at least one image",
                        icon : "info",
                    })
                    return;
                }

                const id = HomeCore.makeGif(this, input.getValue(), slider.getValue());
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

        const floatingPanel = this.instanceGalleryButtons();
        floatingPanel.appendTo(panel);

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

    private instanceGalleryButtons() : UIComponent {

        const panel = new UIComponent({
            type : "div",
            classes : ["box-row","box-x-center"],
            id : "gallery-buttons",
            styles : {
                position : "fixed",
                bottom : "1rem",
                right : "1rem",
            }
        });

        const deleteButton = new UIComponent({
            type : "button",
            classes: ["floating-button"],
        });

        const icon = getMaterialIcon("delete",{
            size : "1.5rem",
            fill : "rgba(200,200,200,0.5)",
        });

        setEvents(icon.element,{
            click : (e : Event) => {
                const selected = document.querySelector(".selected");
                if(!selected){
                    alert({
                        title : "Be careful!",
                        message : "You must select an image to delete",
                        icon : "info",
                    })
                    return;
                }
           
                selected.remove();

                //remove from files
                const index = selected.id.split("-")[1];
                delete HomeCore.files[Object.keys(HomeCore.files)[index]];        
                
                this.reloadGallery();
            }
        });


        deleteButton.appendTo(panel);
        icon.appendTo(deleteButton);

        const previewButton = new UIComponent({ 
            type : "button",
            classes: ["floating-button"],
        });

        const previewIcon = getMaterialIcon("back",{
            size : "1.5rem",
            fill : "rgba(200,200,200,0.5)",
        });

        setEvents(previewButton.element,{
            click : (e : Event) => {
                const selected = document.querySelector(".selected");
                if(!selected){
                    alert({
                        title : "Be careful!",
                        message : "You must select an image to move",
                        icon : "info",
                    })
                    return;
                }

                const index = selected.id.split("-")[1];        
                if(+index == 0){
                    alert({
                        title : "Be careful!",
                        message : "You cannot move the first image",
                        icon : "info",
                    })
                    return;
                }

                HomeCore.moveFilePrevious(index);
                this.reloadGallery();                
            }
        });

        previewButton.appendTo(panel);
        previewIcon.appendTo(previewButton);

        const nextButton = new UIComponent({
            type : "button",
            classes: ["floating-button"],
        });

        setEvents(nextButton.element,{
            click : (e : Event) => {
                const selected = document.querySelector(".selected");
                if(!selected){
                    alert({
                        title : "Be careful!",
                        message : "You must select an image to move",
                        icon : "info",
                    })
                    return;
                }

                const index = selected.id.split("-")[1];
                if(+index == Object.keys(HomeCore.files).length - 1){
                    alert({
                        title : "Be careful!",
                        message : "You cannot move the last image",
                        icon : "info",
                    })
                    return;
                }

                HomeCore.moveFileNext(index);
                this.reloadGallery();
            }
        });


        const nextIcon = getMaterialIcon("back",{
            size : "1.5rem",
            fill : "rgba(200,200,200,0.5)",
        });

        setStyles(nextIcon.element,{
            transform : "rotate(180deg)",
        });

        nextButton.appendTo(panel);
        nextIcon.appendTo(nextButton);
        
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

    public reloadQueue() {
        const queue = this.element.querySelector("#queue") as HTMLElement;
        queue.innerHTML = "";

        if(Object.keys(HomeCore.requestQueue).length == 0){
            //show message
            const message = new UIComponent({
                type : "p",
                text : "No requests here, create a gif! 🤓",
                id : "message",
                styles : {
                    color : "rgba(200,200,200,0.5)",
                    fontSize : "1.15rem",
                    fontWeight : "thin",
                }
            });

            message.appendTo(queue);
            return;
        }


        Object.keys(HomeCore.requestQueue).reverse().forEach((key : string) => {
            const item = HomeCore.requestQueue[key];

            let queueItem : UIComponent;

            switch(item.state){
                case RequestState.WAITING:
                    queueItem = this.createWaitingQueueItem(item.name);
                    break;
                case RequestState.SUCCESS:
                    queueItem = this.createSuccessQueueItem(item.name, key);
                    break;
                case RequestState.ERROR:
                    queueItem = this.createErrorQueueItem(item.name);
                    break;
            }

            queueItem.element.id = key;
            queueItem.appendTo(queue);
        });

    }


    public createWaitingQueueItem(name : string) : UIComponent {
        return this.createQueueItem(name, "coffee", false, name);
    }

    public createSuccessQueueItem(name : string, id : string) : UIComponent {
        return this.createQueueItem(name, "check", true, id);
    }

    public createErrorQueueItem(name : string) : UIComponent {
        return this.createQueueItem(name, "close", false, name);
    }

    public createQueueItem(name : string, icon : string, download: boolean = false, id: string) : UIComponent {

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
    
    
            setEvents(downloadIcon.element,{
                click : (e : Event) => {
                    HomeCore.downloadGif(id);
                }
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
    
        return item;
    }

    public updateQueueItem(id : string, name : string, success : boolean = true) {

        const item = document.getElementById(id) as HTMLElement;

        if(!success){
            item.remove();
        }

        const newQueueItem = this.createSuccessQueueItem(name, id);
        item.outerHTML = newQueueItem.element.outerHTML;

    }

    public reloadGallery(){

        const gallery = this.element.querySelector("#gallery") as HTMLElement;
        gallery.innerHTML = "";


        if(Object.keys(HomeCore.files).length == 0){
            //show message

            const message = new UIComponent({
                type : "p",
                text : "Drag and drop your images here",
                id : "message",
                styles : {
                    color : "rgba(200,200,200,0.5)",
                    fontSize : "1.5rem",
                    fontWeight : "thin",
                }
            });

            message.appendTo(gallery);
            return;
        }


        Object.keys(HomeCore.files).forEach((key : string) => {
            const file = HomeCore.files[key];
            this.addImage(file);
        });

    }

}