import { StringMap } from "../../components/select/Select.js";
import { Config } from "../../config/Config.js";
import Utils from "../../core/Utils.js";
import { RequestState } from "../../core/requests/states.js";
import { HTTPS_METHOD } from "../../lib/gtd/core/http.js";
import { efetch } from "../../lib/gtd/data/easyfetch.js";
import { ViewCore } from "../../lib/gtdf/views/ViewCore.js";
import LanguageService from "../../services/LanguageService.js";
import HomeView from "./HomeView.ui.js";

export default class HomeCore extends ViewCore {

    public static CONTRIBUTE_URL = "https://github.com/akrck02/GTD-Framework";

    public static files = {};
    public static requestQueue : {[key : string]:RequestQueueItem} = {};

    /**
     * Get available languages to add to the select
     * @returns The available languages
     */
    public static getLanguages() : StringMap {
        const languages = LanguageService.getAvailableLanguages();
        const formatted = {};

        const list = Object.keys(languages) 

        list.forEach(lang => {
            formatted[lang.toUpperCase().substring(0,1) + lang.toLowerCase().substring(1)] = languages[lang];
        });

        return formatted;
    }

    /**
     * Set the app language and reload
     * @param selected The selected language
     */
    public static setLanguage(selected :string){        
        
        Config.setLanguage(selected);
        Utils.redirect(Config.VIEWS.HOME,[],true);
    } 

    public static uploadFiles(view : HomeView , file : FileList){
        console.log(file);
        //for each file
        //create a new image

        for(let i = 0; i < file.length; i++){

            //if image not png
            if(file[i].type != "image/png"){
                alert({
                    title : "Error",
                    message : "Only png files are allowed",
                    icon : "close",
                })
                return;
            }

    
            //create id with name + timestamp
            let id = file[i].name + "_" + i + "_" + new Date().getTime();

            //add to files
            HomeCore.files[id] = file[i];
        }        


        //reload gallery
        view.reloadGallery();
        console.log(HomeCore.files);
        

    }

    public static getLastImageNumber() : number {
        const images = document.querySelectorAll(".image");

        if(images.length == 0){
            return 0;
        }

        return images.length;
    }

    public static renameFilesNumerically(){
        
        //for each file

        const keys = Object.keys(HomeCore.files);

        for(let i = 0; i < keys.length; i++){
            const key = keys[i];
            const file = HomeCore.files[key];


            const blob = file.slice(0, file.size, 'image/png'); 
            const newFile = new File([blob], `${i}.png`, {type: 'image/png'});

            //add to files
            HomeCore.files[key] = newFile;
        }
    
    }

    public static makeGif(view : HomeView, name : string, delay : string) : string {

        console.table(HomeCore.files);

        HomeCore.renameFilesNumerically();

        // send files to server as form data
        const formData = new FormData();
        for(let i = 0; i < Object.keys(HomeCore.files).length; i++){
            const file = HomeCore.files[Object.keys(HomeCore.files)[i]];
            formData.append("file", file);
        }

        const id = new Date().getTime();

        //add to queue
        HomeCore.requestQueue[`${id}`] = {
            name : name,
            delay : delay,
            state : RequestState.WAITING,
        }
        view.reloadQueue();

        fetch(Config.API.GIF + `?id=${id}&output=${id}&delay=${delay}`, { //
            method: HTTPS_METHOD.POST,
            body: formData,
        }).then((response : any) => {

            if(response.status == 200){
                view.updateQueueItem(`${id}`,name);
                HomeCore.requestQueue[`${id}`].state = RequestState.SUCCESS;
                view.reloadQueue();
                alert({
                    title : "Success",
                    message : "Your gif is ready to download",
                    icon : "success",
                    desktop : true,
                })

            }else{
                view.updateQueueItem(`${id}`,name, false);
                HomeCore.requestQueue[`${id}`].state = RequestState.ERROR;
                view.reloadQueue();

                alert({
                    title : "Success",
                    message : "Your gif could not be created",
                    icon : "close",
                    desktop : true,
                })
            }

            
        }).catch((error : any) => {

            HomeCore.requestQueue[`${id}`].state = RequestState.ERROR;
            HomeCore.requestQueue[`${id}`].name = name;
            HomeCore.requestQueue[`${id}`].delay = delay;
            view.reloadQueue();

            alert({
                title : "Error",
                message : "Your gif could not be created, check every image has the same size",
                delay : 15000,
                icon : "close",
                desktop : true,
            })

            console.log(error);
        });
        
        HomeCore.files = {};
        view.reloadGallery();

        return `${id}`;
     
    }
     


    public static downloadGif(id : string){

        alert({
            title : "Downloading",
            message : "Your gif is being downloaded",
            icon : "picture",
        })


        fetch(Config.API.GIF_DOWNLOAD + `?id=${id}`, { 
            method: HTTPS_METHOD.GET,
        }).then((response : any) => {

            if(response.status == 200){
                response.blob().then((blob : any) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${HomeCore.requestQueue[id].name}.gif`;
                    a.click();
                });
            }else{
                alert({
                    title : "Error",
                    message : "Your gif could not be downloaded",
                    icon : "close",
                })
            }

        }).catch((error : any) => {
            console.log(error);
            if(error){
                alert({
                    title : "Error",
                    message : "Your gif could not be downloaded",
                    icon : "close",
                })
            }
        });

    }


    public static moveFileNext(id : string){
        const index = +id;
        const keys = Object.keys(HomeCore.files);

        //if not found
        const temp = HomeCore.files[keys[index]];
        if(!temp){
            alert({
                title : "Be careful!",
                message : "You must select san image to move",
                icon : "info",
            })
            return;
        }


        if(index == keys.length - 1){
            alert({
                title : "Be careful!",
                message : "You cannot move the last image",
                icon : "info",
            })
            return;
        }
      
        HomeCore.files[keys[index]] =  HomeCore.files[keys[index + 1]];
        HomeCore.files[keys[index + 1]] = temp;
    
    }

    public static moveFilePrevious(id : string){
        const index = +id;
        const keys = Object.keys(HomeCore.files);

        //if not found
        const temp = HomeCore.files[keys[index]];
        if(!temp){
            alert({
                title : "Be careful!",
                message : "You must select san image to move",
                icon : "info",
            })
            return;
        }

        if(index == 0){
            alert({
                title : "Be careful!",
                message : "You cannot move the first image",
                icon : "info",
            })
            return;
        }

        HomeCore.files[keys[index]] =  HomeCore.files[keys[index - 1]];
        HomeCore.files[keys[index - 1]] = temp;
       
    }

}

interface RequestQueueItem {
    name : string;
    delay : string;
    state : RequestState;
}