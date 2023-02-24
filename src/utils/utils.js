export function getFileExtension(filename){
    if(!filename) return false;
    return filename.split('.').pop();
}

export function _parseRTMPURL(url){
    console.log("_parseRTMP: " + url);
    if(!url) return false;
    let res = url.match(/rtmp:\/\/([^\/:]*):{0,1}([0-9]*)\/([^\/]*)\/(.*)/i);

    console.log(res);

    if(res && res.length > 0) {     // rtmp
        return {
            "server": res[1],
            "port": res[2]?res[2]:9001,
            "app": res[3],
            "stream": res[4],
        }
    }
    return false;
}
