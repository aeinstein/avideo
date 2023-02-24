import Log from "./utils/logger";
import Hls from "../lib/hls.light";
import {_parseRTMPURL, getFileExtension} from "./utils/utils";
import WebRTMP from "../lib/webrtmp";

export class AVideo extends HTMLVideoElement{
    TAG = "AVideo";

    //static observedAttributes = ['src'];

    streamurl = "";

    hls_config = {
        nudgeOffset: 1,
        //autoStartLoad: true,s
        maxBufferLength: 10,
        //backBufferLength: 4,
        //maxBufferSize: 10 * 1000 * 1000,
        //startFragPrefetch: false,
        //maxFragLookUpTolerance: 0.5,
        initialLiveManifestSize: 3,
        liveSyncDurationCount: 3		// 2 fragments before playing
    }

    constructor() {
        super();

        Log.d(this.TAG, "construct");

        this.webrtmp = new WebRTMP();//window.webrtmp;
        this.hls = new Hls(this.hls_config);
    }

    playURL(streamurl){
        if(streamurl && streamurl !== this.streamurl) this.streamurl = streamurl;

        Log.d(this.TAG, "play: " + this.streamurl);

        const parts = _parseRTMPURL(this.streamurl);

        if(parts){
            Log.d(this.TAG, "WebRTMP play: ", parts);
            if(this.attached && this.attached !== "WebRTMP") this._detach();
            if(!this.attached) this._attach("WebRTMP");

            this.webrtmp.open(parts["server"], parts["port"]).then(()=>{
                this.webrtmp.connect(parts["app"]).then(()=>{
                    return this.webrtmp.play(parts["stream"]);
                });
            });

        } else if(getFileExtension(this.streamurl) === "m3u8"){
            Log.d(this.TAG, "super.play2");
            if(this.attached && this.attached !== "HLS") this._detach();

            this.hls.loadSource(this.streamurl);

            if(!this.attached) this._attach("HLS");

            return new Promise((resolve)=>{
                Log.d(this.TAG, "starting HLS");
                resolve();
            });

        } else {
            //if(this.attached) this._detach();

            Log.d(this.TAG, "super.play:" + super.src + " = " + this.src);
            super.src = this.streamurl;
            return super.play();
        }
    }

    _detach(){
        Log.d(this.TAG, "_detach");
        switch(this.attached){
            case "HLS":
                this.hls.stopLoad();
                this.hls.detachMedia(this);
                break;

            case "WebRTMP":
                this.webrtmp.stop();
                this.webrtmp.detachMediaElement(this);
                break;
        }

        this.attached = false;
    }

    _attach(type){
        Log.d(this.TAG, "_attach: " + type);
        this.attached = type;

        switch(type){
        case "HLS":
            this.hls.attachMedia(this);
            break;

        case "WebRTMP":
            this.webrtmp.attachMediaElement(this);
            break;
        }
    }

    /*
    pause(){
        switch(this.attached){
            case "HLS":
                this.hls.stopLoad();
                break;

            case "WebRTMP":
                this.webrtmp.pause();
                break;

            default:
                super.pause();
                break;
        }
    }*/

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

    /*
    attributeChangedCallback(name, oldValue, newValue) {
        console.log("attributeChangedCallback: " + name);
        switch(name) {
        case "src":
            this.streamurl = newValue;

            const parts = _parseRTMPURL(this.streamurl);

            if(parts){
                Log.i(this.TAG, "loading RTMP");


            } else if(getFileExtension(this.streamurl) === "m3u8"){
                Log.i(this.TAG, "preparing HLS");


            } else {
                //if(this.attached && this.attached !== "HLS") this._detach();
                // Nothing to do, because setter has already setted src
            }

            break;
        }
    }*/

}

customElements.define("very-cool", AVideo, { extends: "video" });
