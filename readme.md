All-In Videoplayer
======
A HTML5 customElement which extends the classic Video Element

## Formats
- All default Videoelement Formats
- HLS  by [hls.js](https://github.com/video-dev/hls.js/)
- RTMP over WSS by [WebRTMP](https://github.com/aeinstein/webrtmp.js)

Demo
[https://bunkertv.org/avideo/index.html](https://bunkertv.org/avideo/index.html)


```html
<script type="text/javascript" src="dist/avideo.js"></script>

<video controls loop autoplay is="very-cool" id="output"></video>

<button onclick="play('https://bunkertv.org/css/logo_neu.mp4')">Play Mp4</button><br>
<button onclick="play('https://bunkertv.org/hls/fab5bc692e71e17fba34e92d47e64fd0.m3u8')">Play HLS</button><br>
<button onclick="play('rtmp://bunkertv.org:9001/demo/livetest')">Play RTMP</button><br>

<script>
    const output = document.getElementById("output");

    function play(url){
        output.playURL(url);
    }    
</script>
```

