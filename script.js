
//////////////////////////////////////////////////////////////////////////////////////////
/////////                               Player class                              /////////
//////////////////////////////////////////////////////////////////////////////////////////

function simplePlayer(_videoUrl,_subUrls) {

    this.container = document.createElement('div')
    this.container.className = "playerContainer"
    this.loaded = false
    this.onloaded = function(){ 
        console.log("video loaded")
    }

    this.downloadVideo(_videoUrl)

    this.video = document.createElement('video')
    // this.video.src = _videoUrl
    this.container.className = "playerVideo"
    this.container.appendChild(this.video)
    this.container.appendChild(this.video)
    this.video.addEventListener('loadedmetadata', () => { 

        this.load()

        if(!this.loaded){
            this.loaded = true
            this.video.load()

        }else{
            this.onloaded()
        }

    });
    

    this.conntrols = {}
    this.controlContainer = document.createElement('div')
    this.container.appendChild(this.controlContainer)
    
    this.conntrols.subtitles = new subtilteControl(_subUrls, this.video, this.container)
    this.conntrols.timeLine = new timeLineControl(this.video)

    

}

simplePlayer.prototype.downloadVideo = function(_url){

    var req = new XMLHttpRequest();
    req.open('GET', _url, true);
    req.responseType = 'blob';
    var _this = this
    
    req.onload = function() {
       // Onload is triggered even on 404
       // so we need to check the status code
       if (this.status === 200) {
          var videoBlob = this.response;
          var vid = URL.createObjectURL(videoBlob); // IE10+
          console.log(vid)
          // Video is now downloaded
          // and we can set it as source on the video element
          _this.video.src = vid;
       }
    }
    req.onerror = function() {
       // Error
    }
    
    req.send();

}


simplePlayer.prototype.load = function(){
    this.conntrols.subtitles.setup()
}

simplePlayer.prototype.selectSubtitle = function(_id){

    this.conntrols.subtitles.selectSubtitle(_id)

}

//////////////////////////////////////////////////////////////////////////////////////////
/////////                           Timeline Controls                            /////////
//////////////////////////////////////////////////////////////////////////////////////////

// Timeline controls
// Pause/play controls
function timeLineControl(_video){

    this.video = _video
    _video.addEventListener('timeupdate', (_event)=>{
        _event.target.currentTime
    })

}

timeLineControl.prototype.setCurrentTime = function (_percentage) {

    this.video
    

}


//////////////////////////////////////////////////////////////////////////////////////////
/////////                           Subtitle Control                             /////////
//////////////////////////////////////////////////////////////////////////////////////////

//====================================================================
//===================        Control Class        ====================
//====================================================================

function subtilteControl(_subUrls,_video,_parent){

    this.subtitles = []
    this.container = document.createElement("div")
    this.container.className = "subtitlesContainer"
    _parent.appendChild(this.container)
    this.activeSubtitle = ""
    this.defaultSubtitle = false

    for(var i = 0; i < _subUrls.length; i++ ){
        var sub = new subtitle(_video,_subUrls[i], i, this.container)
        this.subtitles.push( sub )
    }

}

subtilteControl.prototype.setup = function () {

    for (let i = 0; i < this.subtitles.length; i++) {
        this.subtitles[i].setup()
    }

}

subtilteControl.prototype.selectSubtitle = function(_id) {

    if (this.activeSubtitle) this.activeSubtitle.makeActive( false )
    this.activeSubtitle = this.subtitles[_id]
    this.activeSubtitle.makeActive( true )
}

//====================================================================
//===================        Subtitle Class        ===================
//====================================================================

function subtitle(_video,_url,_id,_parent){

    this.isActive = false
    this.track = document.createElement("track")
    this.track.src = _url
    this.track.kind = "subtitles"
    this.track.id = _id
    this.track.mode = "hidden"

    if ( _id == 0 ) { this.track.setAttribute("default","") }
  
    _video.appendChild(this.track)
    _video.textTracks[_id].mode = "hidden"

    this.textTrack = _video.textTracks[_id]

    this.subContainer = document.createElement("div")
    this.subContainer.className = "subtitle"
    this.subContainer.id = "subtitleContainer-" + _id
    _parent.appendChild(this.subContainer)
    this.cueExit()

}


subtitle.prototype.makeActive = function(_isActve){

    this.isActive = _isActve
    
    if (_isActve){
        this.subContainer.style.display = "block"
    }else{
        this.subContainer.style.display = "none"
    }

}


subtitle.prototype.cueEnter = function(_text){

    this.subContainer.innerHTML = _text.replace(/(\r\n|\n|\r)/gm, "<br />");

    if  ( !this.isActive) return
    this.subContainer.style.display = "block"
}


subtitle.prototype.cueExit = function(){
    this.subContainer.style.display = "none"
}

subtitle.prototype.setup = function(){

    for (var i = 0; i < this.textTrack.cues.length; i ++) {
        
        var cue = this.textTrack.cues[i];
        var text = cue.text
        var _this = this

        cue.onenter = function() { _this.cueEnter(this.text) }
        cue.onexit = function()  { _this.cueExit()           }
    }

}



// var video = document.querySelector("#video")
// var subContainer = document.querySelector("#subtitle")
// var sub1 = new subtitle(video.textTracks[0],subContainer)


// video.addEventListener('loadedmetadata', () => { 
//     console.log("==")
//     sub1.setup()
// });

//====================================================================
//===================          Sign Language       ===================
//====================================================================



var video1 = new simplePlayer('videos/0/video.mp4',[ 
    'videos/0/subs/en.vtt',
    'videos/0/subs/de.vtt'
    ]
)

document.body.appendChild(video1.container)
video1.selectSubtitle(1)
