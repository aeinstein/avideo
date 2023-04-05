import Log from "./utils/logger";
import Hls from "../lib/hls.light";
import  dashjs  from "../lib/dash.mediaplayer.min";
import {_parseRTMPURL, getFileExtension} from "./utils/utils";
import { WebRTMP } from "../lib/webrtmp";

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
        liveSyncDurationCount: 3		// 3 fragments before playing
    }

    /**
     * @type WebRTMP
     */
    webrtmp;

    /**
     * @type HLS
     */
    hls;
    hls_paused = false;

    dash;

    constructor() {
        super();

        Log.d(this.TAG, "construct");

        this.webrtmp = new WebRTMP();
        this.hls = new Hls(this.hls_config);

        this.addEventListener("pause", ()=>{
            Log.d(this.TAG, "pause");
            this._ensureCorrectPauseState();
        })

        this.addEventListener("play", ()=>{
            Log.d(this.TAG, "play");
            this._ensureCorrectPauseState();
        })
    }

    stop(){
        switch(this.attached){
        case "WebRTMP":
            this.webrtmp.stopLoad();
            break;

        case "HLS":
            this.hls.stopLoad();
            break;

        case "DASH":
            this.dash.pause();
            break;
        }

        this._detach();
    }

    pause(enable){
        switch(this.attached){
        case "WebRTMP":
            this.webrtmp.pause(enable);
            break;

        case "DASH":
            if(enable) this.dash.pause();
            else this.dash.play();
            break;

        default:
            if(enable) super.pause();
            else super.play();
        }
    }

    _ensureCorrectPauseState(){
        switch(this.attached){
        case "HLS":
            if(this.paused){
                this.hls_paused = true;
                this.hls.stopLoad();

            } else {
                if(this.hls_paused) this.hls.startLoad();
                this.hls_paused = false;
            }
            break;
        }
    }

    playURL(streamurl, force){
        if(streamurl && streamurl !== this.streamurl) {
            this.streamurl = streamurl;
            this.stop();

        } else {
            if(!force) {
                Log.d(this.TAG, "already playing this URL");
                super.pause();
                return new Promise((resolve, reject)=>{
                    resolve();
                });
            }
        }

        Log.d(this.TAG, "play: " + this.streamurl);

        const parts = _parseRTMPURL(this.streamurl);

        if(parts){
            Log.d(this.TAG, "WebRTMP play: ", parts);
            if(this.attached && this.attached !== "WebRTMP") this._detach();
            if(!this.attached) this._attach("WebRTMP");

            return new Promise((resolve, reject)=>{
                this.webrtmp.open(parts["server"], parts["port"]).then(()=>{
                    this.webrtmp.connect(parts["app"]).then(()=>{
                        this.webrtmp.play(parts["stream"]).then(resolve);
                    }).catch(reject);
                }).catch(reject);
            });

        } else if(getFileExtension(this.streamurl) === "m3u8") {
            Log.d(this.TAG, "super.play2");
            if (this.attached && this.attached !== "HLS") this._detach();

            this.hls.loadSource(this.streamurl);

            if (!this.attached) this._attach("HLS");
            return super.play();

            /*
            return new Promise((resolve) => {
                this.addEventListener("play", resolve);
            });*/

        } else if(getFileExtension(this.streamurl) === "mpd"){
            Log.d(this.TAG, "play MPD");
            if (this.attached && this.attached !== "DASH") this._detach();
            if (!this.attached) this._attach("DASH");

            this.dash.attachSource(this.streamurl);

            return new Promise((resolve) => {
                this.addEventListener("play", resolve);
                this.dash.play();
            });

        } else {
            if(this.attached) this._detach();

            Log.d(this.TAG, "super.play:" + super.src + " = " + this.src);
            super.src = this.streamurl;
            return super.play();
        }
    }

    _detach(){
        Log.d(this.TAG, "_detach: "+ this.attached);
        switch(this.attached){
            case "HLS":
                this.hls.stopLoad();
                this.hls.detachMedia(this);
                break;

            case "WebRTMP":
                this.webrtmp.stopLoad();
                this.webrtmp.detachMediaElement();
                break;

            case "DASH":
                this.dash.destroy();
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

        case "DASH":
            this.dash = dashjs.MediaPlayer().create();
            this.dash.initialize(this);
            break;
        }
    }

    connectedCallback(){
        Log.d(this.TAG, "connectedCallback");
        if(this.hasAttribute("src")) this.src = this.getAttribute("src");
        if(this.hasAttribute("src")){
            this.playURL(this.getAttribute("src"));
        }
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
