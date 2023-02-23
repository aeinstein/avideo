export function getFileExtension(filename){
    return filename.split('.').pop();
}

export function _parseRTMPURL(url){
    let res = url.match(/rtmp:\/\/([^\/:]*)([:0-9]*)\/([^\/]*)\/(.*)/gi);

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
