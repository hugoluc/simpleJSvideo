
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
    this.video.isLoaded = false
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
            this.video.isReady = true
        }

    });
    

    this.conntrols = {}
    this.controlContainer = document.createElement('div')
    this.controlContainer.className = "controlContainer"
    this.container.appendChild(this.controlContainer)
    
    this.btnsContainer = document.createElement('div')
    this.btnsContainer.className = "btnsContainer"
    this.controlContainer.appendChild(this.btnsContainer)

    this.conntrols.timeLine = new timeLineControl(this.video, this.btnsContainer) 
    this.conntrols.subtitles = new subtilteControl(_subUrls, this.video, this.container, this.btnsContainer)

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
          console.log(" video downloaded")
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
function timeLineControl(_video,_parent){

    this.video = _video
    _video.addEventListener('timeupdate', (_event)=>{
        
        if (_event.target.currentTime >= this.video.duration) console.log(" finished ")
        this.timeUpdated(_event.target.currentTime )

    })

    this.container = document.createElement('div')
    this.container.className = "timeLineControls"
    _parent.appendChild(this.container)

    this.playBtn = document.createElement('div')
    this.playBtn.className = "playBtn"
    this.container.appendChild(this.playBtn)

    this.timeLine = document.createElement('div')
    this.timeLine.className = "timeLine"
    this.container.appendChild(this.timeLine)

    this.timeLine.addEventListener('touchmove', e => {
        if (!this.video.isReady) return;
        var rect = e.target.getBoundingClientRect();
        var x = e.targetTouches[0].pageX - rect.left;
        this.setCurrentTime(x/rect.width)
    })
    this.timeLine.addEventListener('touchstart', e => {
        if (!this.video.isReady) return;
        var rect = e.target.getBoundingClientRect();
        var x = e.targetTouches[0].pageX - rect.left;
        this.setCurrentTime(x/rect.width)

    })


    this.totalTime = document.createElement('div')
    this.totalTime.className = "totalTime"
    this.timeLine.appendChild(this.totalTime)

    this.currentTime = document.createElement('div')
    this.currentTime.className = "currentTime"
    this.timeLine.appendChild(this.currentTime)
    this.currentTime.style.width = "0px"

    this.timeCounter = document.createElement('div')
    this.timeCounter.className = "timeCounter"
    this.timeCounter.innerHTML = "00:00"
    this.container.appendChild(this.timeCounter)

    

}

timeLineControl.prototype.setCurrentTime = function (_percentage) {
    this.video.currentTime = this.video.duration * _percentage
    this.timeUpdated(this.video.currentTime)
    
}

timeLineControl.prototype.timeUpdated = function (_time) {

    this.currentTime.style.width = (( this.timeLine.getBoundingClientRect().width * _time) / this.video.duration) + "px"
    
}


//////////////////////////////////////////////////////////////////////////////////////////
/////////                           Subtitle Control                             /////////
//////////////////////////////////////////////////////////////////////////////////////////

//====================================================================
//===================        Control Class        ====================
//====================================================================

function subtilteControl(_subUrls,_video,_subParent, _controlParent){

    this.controlContainer = document.createElement("div")
    this.controlContainer.className = "subControlContainer"
    _controlParent.appendChild(this.controlContainer)

    this.subtitles = []
    this.subtitlesContainer = document.createElement("div")
    this.subtitlesContainer.className = "subtitlesContainer"
    _video.insertAdjacentElement("afterEnd", this.subtitlesContainer)

    this.activeSubtitle = ""
    this.defaultSubtitle = false

    for(var i = 0; i < _subUrls.length; i++ ){
        var sub = new subtitle(_video,_subUrls[i], i, this.subtitlesContainer)
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
