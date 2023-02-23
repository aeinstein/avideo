import Log from "./utils/logger";
import Hls from "../lib/hls.light";
import WebRTMP from "../lib/webrtmp";
import {_parseRTMPURL, getFileExtension} from "./utils/utils";


export class AVideo extends HTMLVideoElement{
    TAG = "AVideo";
    static observedAttributes = ['src'];

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

        this.webrtmp = window.webrtmp;
    }

    play(){
        Log.d(this.TAG, "play");

        const parts = _parseRTMPURL(this.streamurl);

        if(parts){
            Log.d(this.TAG, "WebRTMP play");
            this.webrtmp.open(parts["server"], parts["port"]).then(()=>{
                this.webrtmp.connect(parts["app"]).then(()=>{
                    return this.webrtmp.play(parts["stream"]);
                });
            });

        } else if(getFileExtension(this.streamurl) === "m3u8"){
            Log.d(this.TAG, "super.play");

            return new Promise((resolve)=>{
                Log.d(this.TAG, "starting HLS");

                this.hls = new Hls(this.hls_config);

                this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                    console.log("MEDIA_ATTACHED");
                    this.hls.loadSource(this.streamurl);
                });

                this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    console.log('manifest loaded, found ' + data.levels.length + ' quality level');
                    super.play().then(resolve);
                });
            });

        } else {
            return super.play();
        }
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
        switch(name) {
        case "src":
            this.streamurl = newValue;

            const parts = _parseRTMPURL(this.streamurl);

            if(parts){
                Log.i(this.TAG, "loading RTMP");
                this.webrtmp.attachMediaElement(this);

            } else if(getFileExtension(this.streamurl) === "m3u8"){
                Log.i(this.TAG, "preparing HLS");

            } else {

                //this.src = this.streamurl;
            }

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
        this.setAttribute("src", val);
    }
}

customElements.define("very-cool", AVideo, { extends: "video" });
