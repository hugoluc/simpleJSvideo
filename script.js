
//////////////////////////////////////////////////////////////////////////////////////////
/////////                               Player class                              ////////
//////////////////////////////////////////////////////////////////////////////////////////

function simplePlayer(_videoUrl,_subs) { 

    this.container = document.createElement('div')
    this.container.className = "playerContainer"
    this.loaded = false
    this.onloaded = function(){ 
        console.log("video loaded")
    }
    document.body.appendChild(this.container)
    // this.downloadVideo(_videoUrl)

    this.video = document.createElement('video')
    this.video.isLoaded = false
    this.video.src = _videoUrl
    this.container.className = "playerVideo"
    this.container.appendChild(this.video)
    this.video.addEventListener('touchstart', e => {
        this.controls.toggleControls()
    })

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
    
    //background
    this.controlContainer = document.createElement('div')
    this.controlContainer.className = "controlContainer"
    this.container.appendChild(this.controlContainer)

    //controlers
    this.btnsContainer = document.createElement('div')
    this.btnsContainer.style.transform = "translate(0px, px)"
    this.btnsContainer.className = "btnsContainer"
    this.controlContainer.appendChild(this.btnsContainer)
    
    this.controls = new timeLineControl( this.video, this.btnsContainer, this.controlContainer, this.container, _subs) 

}

simplePlayer.prototype.load = function(){
    this.controls.subtilteControl.setup()
}

//////////////////////////////////////////////////////////////////////////////////////////
/////////                           Timeline Controls                            /////////
//////////////////////////////////////////////////////////////////////////////////////////

// Timeline controls
// Pause/play controls
function timeLineControl(_video, _parent, _controlContainer, _container, _subs){

    _video.addEventListener('timeupdate', (_event)=>{ 
        if (_event.target.currentTime >= this.video.duration) console.log(" finished ")
        this.timeUpdated(_event.target.currentTime )
    })

    this.btnsContainer = _parent
    this.video = _video
    this.controlContainer = _controlContainer

    this.isPlaying = false;
    this.userInteracted = false
    this.menuOpen = true

    this.createDOMelements(_parent, _controlContainer)

    this.subtilteControl = new subtilteControl(  _subs, _video, _container, _parent)
    this.subtilteControl.interactionHandler = () => { this.setEllapsedTime() }
    this.subtilteControl.detectInactivity = () => { this.setEllapsedTime() }

    console.log("-----------------");
    this.waitTime = 5000
    this.userInteracted = true
    this.menuOpen = true
    this.startTime = Date.now()
    this.setEllapsedTime()
    this.detectInactivity()    

}

timeLineControl.prototype.createDOMelements = function (_parent,_controlContainer) {
    
    this.container = document.createElement('div')
    this.container.className = "timeLineControls"
    _parent.appendChild(this.container)

    this.playBtn = document.createElement('div')
    this.playBtn.className = "play-pause"
    this.container.appendChild(this.playBtn)
    this.playBtn.addEventListener('touchstart', e => {
        console.log("clocked on plat btn");
        this.togglePlay()
    })

    this.timeLine = document.createElement('div')
    this.timeLine.className = "timeLine"
    this.container.appendChild(this.timeLine)
    
    this.timeLine.addEventListener('touchmove', e => {
        if (!this.video.isReady) return;
        
        this.setEllapsedTime()
        var rect = e.target.getBoundingClientRect();
        var x = e.targetTouches[0].pageX - rect.left;
        this.setCurrentTime(x/rect.width)
    })
    
    this.timeLine.addEventListener('touchstart', e => {

        if (!this.video.isReady) return;
        
        this.setEllapsedTime()
        var rect = e.target.getBoundingClientRect();
        var x = e.targetTouches[0].pageX - rect.left;
        this.setCurrentTime(x/rect.width)
    })  

    // this.timeLine.addEventListener('touchend', e => {
    //     this.detectInactivity()
        
    // })


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


    this.bg = document.createElement("div")
    this.bg.className = "playerBg"
    _controlContainer.insertBefore(this.bg,_controlContainer.childNodes[_controlContainer.childNodes.length])

}

timeLineControl.prototype.setCurrentTime = function (_percentage) {
    
    this.video.currentTime =  this.video.duration * _percentage
    this.subtilteControl.setCurrentTime(this.video.duration * _percentage)
    this.timeUpdated(this.video.currentTime)
    
}

timeLineControl.prototype.timeUpdated = function (_time) {

    // console.log(this.timeLine.getBoundingClientRect().width)
    // console.log(_time)
    // console.log(this.video.duration)
    // console.log((( this.timeLine.getBoundingClientRect().width * _time) / this.video.duration) + "px")
    // console.log(">>>>>>>>>>>>>>>>")

    var minutes = parseInt(_time/60)
    minutes = minutes.toString().length > 1 ? minutes : ("0" + minutes)
        
    var seconds = parseInt(_time%60)
    seconds = seconds.toString().length > 1 ? seconds : ("0" + seconds) 

    this.timeCounter.innerHTML = minutes + ":" + seconds
    this.currentTime.style.width = (( this.timeLine.getBoundingClientRect().width * _time) / this.video.duration) + "px"
    
}

//===============================================

timeLineControl.prototype.play = function (_time) {
    
    this.subtilteControl.play()
    this.video.play()
    this.isPlaying = true
    this.playBtn.classList.toggle("on")

}

timeLineControl.prototype.pause = function (_time) {

    this.subtilteControl.pause()
    this.video.pause()
    this.isPlaying = false
    this.playBtn.classList.toggle("on")

}

timeLineControl.prototype.togglePlay = function (_time) {

    if(!this.menuOpen){
        this.toggleControls()
    }else{
        
        if(!this.isPlaying){

            this.play()
            this.setEllapsedTime()
    
        }else{
            
            this.pause()
    
        }

    }

    

}

//===============================================

timeLineControl.prototype.closeControls = function(){    
    
    this.btnsContainer.classList.toggle("closed")
    this.bg.classList.toggle("closed")
    setTimeout(()=>{
        this.controlContainer.classList.toggle("closed")    
    }, 300)
    this.menuOpen = false
    this.ellapsedTime = 0
}

timeLineControl.prototype.openControls = function(){    

    this.controlContainer.classList.toggle("closed")    
    setTimeout(()=>{
        this.btnsContainer.classList.toggle("closed")
        this.bg.classList.toggle("closed")
    },1)

    console.log("-----------------");
    this.menuOpen = true
    
    this.userInteracted = true
    this.ellapsedTime = this.waitTime
    this.detectInactivity()    

}

timeLineControl.prototype.toggleControls = function(){    
    
    if(!this.menuOpen){ 
        this.openControls()
    }
    
}

//===============================================

timeLineControl.prototype.setEllapsedTime = function(){    
    
    this.userInteracted = true
    this.ellapsedTime = Date.now() - this.startTime
    
}

timeLineControl.prototype.detectInactivity = function(){   

    console.log("detecting user inactivity...");
    
    if(!this.menuOpen) return

    if(!this.isPlaying){
        console.log("video is paused try later");
        this.startTime = Date.now()  
        setTimeout(()=>{ this.detectInactivity() }, this.waitTime)
        return    
    }

    if( !this.userInteracted ) {
        
        console.log("user inactive! Closing menu");
        this.closeControls()
    
    }else{
    
        console.log("user active! setetting timer to:", this.waitTime, this.ellapsedTime);
        this.startTime = Date.now()
        this.userInteracted = false
        setTimeout(()=>{ this.detectInactivity() }, this.ellapsedTime)
    
    }

}


//////////////////////////////////////////////////////////////////////////////////////////
/////////                           Subtitle Control                             /////////
//////////////////////////////////////////////////////////////////////////////////////////

//====================================================================
//===================        Control Class        ====================
//====================================================================

function subtilteControl(_subs,_video,_subParent, _controlParent){

    //get opened menu height based on subtitle number
    var menuItemSizes = {
        itemHeight : 45,
        margin : 26,
    }
    this.openMenuHeight = (2 * menuItemSizes.margin)  + (_subs.length * menuItemSizes.itemHeight)
    this.menuClosed = false
    this.animationEnded = true
    this.detectInactivity = function(){}
    this.interactionHandler = function(){}

    //-------------------
    //    container
    //-------------------    
    this.controlContainer = document.createElement("div")
    this.controlContainer.className = "subControlContainer"
    _controlParent.appendChild(this.controlContainer)

    //-------------------
    //    background
    //-------------------
    this.controlBg = document.createElement("div")
    this.controlBg.className = "controlBg"
    this.controlBg.style.height = this.openMenuHeight
    this.controlContainer.appendChild(this.controlBg)

    //-------------------
    //    subtitles
    //-------------------
    this.controls = []
    this.subtitles = []
    
    this.subtitlesContainer = document.createElement("div")
    this.subtitlesContainer.className = "subtitlesContainer"
    _video.insertAdjacentElement("afterEnd", this.subtitlesContainer)

    this.activeSubtitle = ""
    this.defaultSubtitle = false

    for(var i = 0; i < _subs.length; i++ ){
        
        //add controls
        var control = document.createElement("div")
        control.id = i
        control.className = "subControl"
        control.innerHTML = _subs[i].title
        control.addEventListener('touchstart', e => {
            if (!this.animationEnded) return

            this.animationEnded = false
            if(!this.menuClosed){
                this.selectSubtitle(e.target.id)
                this.closeMenu()
            }else{
                this.openMenu()
            }
        })

        control.addEventListener('webkitTransitionEnd', e => {
            this.animationEnded = true
        })
        this.controlContainer.appendChild(control)
        this.controls.push(control)

        var finalPos = ( menuItemSizes.itemHeight * i) + menuItemSizes.margin
        control.setAttribute("finalpos", finalPos)
        control.style.transform = "translateY(-" + finalPos +  "px)"
        control.style.height = menuItemSizes.itemHeight +  "px"


        //add subtitles
        var sub;
        if(_subs[i].type == "text"){
            sub = new subtitle(_video,_subs[i], i, this.subtitlesContainer)
        }else{
            sub = new libras(_video,_subs[i], i, _subParent)
            this.libras = sub
        }
        this.subtitles.push( sub )
        if (_subs[i].default) this.selectSubtitle(i)
 
    }

    this.closeMenu()
 
}

subtilteControl.prototype.play = function () {
    this.libras.video.play()
}

subtilteControl.prototype.pause = function () {
    this.libras.video.pause()
}

subtilteControl.prototype.openMenu = function () {
    
    this.menuClosed = false
    this.controlBg.style.height = this.openMenuHeight
    
    for(var i = 0; i < this.controls.length; i++ ){
        this.controls[i].style.transform = "translateY(-" + this.controls[i].getAttribute("finalpos") +  "px)"
        this.controls[i].classList.remove("hidden")    
    }

    this.interactionHandler()

}

subtilteControl.prototype.closeMenu = function () {
    
    this.menuClosed = true
    this.controlBg.style.height = "56px"

    for(var i = 0; i < this.controls.length; i++ ){

        if(this.controls[i].id == this.activeSubtitle.id){
            var activeSubElement = this.controls[this.activeSubtitle.id]
            activeSubElement.style.transform = "translateY(-" + 5 +  "px)"
        }else{
            this.controls[i].classList.add("hidden")    
        }

    }
    
    // this.detectInactivity()

}

subtilteControl.prototype.selectSubtitle = function(_id) {

    if (this.activeSubtitle) {
        this.controls[this.activeSubtitle.id].className = "subControl"
        this.activeSubtitle.makeActive( false )
    }

    this.controls[_id].classList.add("active")  
    this.activeSubtitle = this.subtitles[_id]
    this.activeSubtitle.makeActive( true )

}

subtilteControl.prototype.setCurrentTime = function (_time) {
    this.libras.video.currentTime = _time
}

subtilteControl.prototype.setup = function () {

    for (let i = 0; i < this.subtitles.length; i++) {
        this.subtitles[i].setup()
    }

}


//====================================================================
//===================        Subtitle Class        ===================
//====================================================================

function subtitle(_video,_sub,_id,_parent){

    this.id = _id
    this.isActive = false
    this.track = document.createElement("track")
    this.track.src = _sub.url
    this.track.kind = "subtitles"
    this.track.id = _id
    this.track.mode = "hidden"
    _video.appendChild(this.track)
    
    // console.log(
    //     _video.textTracks.length,
    //     _video.textTracks[_video.textTracks.length-1],
    //     _id)
    _video.textTracks[_video.textTracks.length-1].mode = "hidden"

    this.textTrack = _video.textTracks[_video.textTracks.length-1]

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

//====================================================================
//===================          Sign Language       ===================
//====================================================================

function libras(_video,_sub,_id,_parent){

    this.id = _id
    this.video = document.createElement("video")
    this.video.className = "librasVideo"
    this.video.src = _sub.url
    this.video.volume = 0
    _parent.appendChild(this.video)
    
}

libras.prototype.setup = function(){
    this.makeActive(false)
}

libras.prototype.makeActive = function(_isActve){

    this.isActive = _isActve
    
    if (_isActve){
        this.video.style.display = "block"
    }else{
        this.video.style.display = "none"
    }

}

//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================

var allVids = []

for (let i = 0; i < 1; i++) {
    
    var index = i % 8

    var subs = [
        { 
            type : "libras",
            url : 'libras.webm' ,
            title : "Libras",
            default : false
        },
        { 
            type : "text",
            url : 'videos/' + index + '/subs/es.vtt' ,
            title : "Ingles",
            default : false
        },
        { 
            type : "text",
            url : 'videos/' + index + '/subs/de.vtt' ,
            title : "Espanhol",
            default : false
        },
        { 
            type : "text",
            url : 'videos/' + index + '/subs/en.vtt' ,
            title : 'Portugês',
            default : true
        },
    
        ]
    
        allVids.push(new simplePlayer("videos/" + index +"/video.mp4", subs ))
    
}

