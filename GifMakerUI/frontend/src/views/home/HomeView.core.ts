import { StringMap } from "../../components/select/Select.js";
import { Config } from "../../config/Config.js";
import Utils from "../../core/Utils.js";
import { HTTPS_METHOD } from "../../lib/gtd/core/http.js";
import { efetch } from "../../lib/gtd/data/easyfetch.js";
import { ViewCore } from "../../lib/gtdf/views/ViewCore.js";
import LanguageService from "../../services/LanguageService.js";
import HomeView from "./HomeView.ui.js";

export default class HomeCore extends ViewCore {

    public static CONTRIBUTE_URL = "https://github.com/akrck02/GTD-Framework";

    public static files = {};

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
            view.addImage(file[i]);

            //create id with name + timestamp
            let id = file[i].name + "_" + i + "_" + new Date().getTime();

            //add to files
            HomeCore.files[id] = file[i];
        }        

        console.log(HomeCore.files);
        

    }

    public static downloadFile(id : string){

    }

    public static makeGif(view : HomeView, name : string, delay : string) : string {

        console.table(HomeCore.files);

        // send files to server as form data
        const formData = new FormData();
        for(let i = 0; i < Object.keys(HomeCore.files).length; i++){
            const file = HomeCore.files[Object.keys(HomeCore.files)[i]];
            formData.append("file", file);
        }

        const id = new Date().getTime();
        fetch(Config.API.GIF + `?id=${id}&output=${name}&delay=${delay}`, { //
            method: HTTPS_METHOD.POST,
            body: formData,
        }).then((response : any) => {

            if(response.status == 200){
                view.updateQueueItem(`${id}`,name);
                alert({
                    title : "Success",
                    message : "Your gif is ready to download",
                    icon : "success",
                })

            }else{
                view.updateQueueItem(`${id}`,name, false);
                alert({
                    title : "Success",
                    message : "Your gif could not be created",
                    icon : "close",
                })
            }

            
        }).catch((error : any) => {
            console.log(error);
        });
        
        HomeCore.files = {};
        view.clearGallery();

        return `${id}`;
     
    }

}