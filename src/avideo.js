import Log from "./utils/logger";
import Hls from "../lib/hls.light";
import WebRTMP from "../lib/webrtmp";
import {getFileExtension} from "./utils/utils";


export class AVideo extends HTMLVideoElement{
    TAG = "AVideo";
    static observedAttributes = ['src'];

    streamurl = "";

    constructor() {
        super();

        Log.d(this.TAG, "construct");

        this.webrtmp = new WebRTMP();
    }

    play(){
        Log.d(this.TAG, "play");

        const url = new URL(this.streamurl);

        Log.d(this.TAG, url);

        switch(url.protocol){
        case "https:":
        case "http:":
            switch(getFileExtension(url.pathname)){
            case "m3u8":
                Log.i(this.TAG, "loading HLS");
                break;

            default:
                return super.play();
            }

            break;

        case "rtmp:":
            Log.i(this.TAG, "loading RTMP");
            this.webrtmp.attachMedia(this);
            let port = url.port;
            if(!port) port = 9001;

            this.webrtmp.open(url.hostname, port).then(()=>{
                this.webrtmp.connect().then(()=>{
                    return this.webrtmp.play();
                });
            });
            break;
        }

        //this.setAttribute("src", this.streamurl);
    }

    connectedCallback(){
        Log.d(this.TAG, "connected");
        if(this.hasAttribute("src")) this.src = this.getAttribute("src");
    }

    disconnectedCallback() {
        Log.d(this.TAG, 'disconnectedCallback');
    }

    adoptedCallback() {
        Log.d(this.TAG, 'adoptedCallback');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log("attributeChangedCallback: " + name);
        switch(name){
            case "src":
                // src parsen
                const url = new URL(newValue);

                Log.d(this.TAG, url);

                switch(url.protocol){
                    case "https:":
                    case "http:":
                        switch(getFileExtension(url.pathname)){
                            case "m3u8":
                                Log.i(this.TAG, "loading HLS");
                                break;
                        }

                        break;

                    case "rtmp:":
                        Log.i(this.TAG, "loading RTMP");
                        break;
                }

                break;

            default:
                Log.d(this.TAG, "Attribute: " + name);
                break;
        }
    }

    get src(){
        Log.d("getSrc");
        return this.streamurl;
    }

    set src(val) {
        Log.d("setSrc: " + val);
        this.streamurl = val;
    }
}


customElements.define("a-video", AVideo, { extends: "video" });

