
//////////////////////////////////////////////////////////////////////////////////////////
/////////                               Player class                              ////////
//////////////////////////////////////////////////////////////////////////////////////////

function simplePlayer(_videoUrl,_subs,_title) { 

    this.container = document.createElement('div')
    this.container.className = "playerVideo"
    this.loaded = false
    this.onloaded = function(){ 
        console.log("video loaded")
    }
    document.body.appendChild(this.container)
    // this.downloadVideo(_videoUrl)

    this.videoContainer = document.createElement('div')
    this.videoContainer.className = "videoContainer"
    this.videoContainer.addEventListener('touchstart', e => {
        this.controls.togglePlay()
    })
    this.container.appendChild(this.videoContainer)

    this.video = document.createElement('video')
    this.video.isLoaded = false
    this.video.src = _videoUrl
    this.videoContainer.appendChild(this.video)


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
    
    this.controls = new timeLineControl( this.video, this.btnsContainer, this.controlContainer, this.videoContainer, _subs, _title ) 

}

simplePlayer.prototype.load = function(){
    this.controls.subtilteControl.setup()
}

//////////////////////////////////////////////////////////////////////////////////////////
/////////                           Timeline Controls                            /////////
//////////////////////////////////////////////////////////////////////////////////////////

// Timeline controls
// Pause/play controls
function timeLineControl(_video, _parent, _controlContainer, _container, _subs, _title){

    _video.addEventListener('timeupdate', (_event)=>{ 
        if (_event.target.currentTime >= this.video.duration) console.log(" finished ")
        this.timeUpdated(_event.target.currentTime )
    })

    this.titleText = _title
    this.btnsContainer = _parent
    this.video = _video
    this.controlContainer = _controlContainer

    this.isPlaying = false
    this.userInteracted = false
    this.menuOpen = true

    this.createDOMelements(_parent, _controlContainer,_container)

    this.subtilteControl = new subtilteControl(  _subs, _video, _container, _parent)
    this.subtilteControl.interactionHandler = () => { this.closeControlTimeout() }
    this.subtilteControl.subtitlesContainer.style.transform = "translate(0px,-150px)"

    this.menuOpen = true
    this.timouts = []
    this.waitTime = 3000
    this.closeControlTimeout()

}

timeLineControl.prototype.createDOMelements = function (_parent,_controlContainer,_container) {
    
    this.container = document.createElement('div')
    this.container.className = "timeLineControls"
    _parent.appendChild(this.container)

    this.title = document.createElement('div')
    this.title.innerHTML = this.titleText
    this.title.className = "title"
    _container.appendChild(this.title)

    this.playBtn = document.createElement('div')
    this.playBtn.className = "play-pause"
    this.container.appendChild(this.playBtn)
    this.playBtn.addEventListener('touchstart', e => {
        this.togglePlay()
    })

    this.timeLine = document.createElement('div')
    this.timeLine.className = "timeLine"
    this.container.appendChild(this.timeLine)
    
    this.timeLine.addEventListener('touchmove', e => {
        if (!this.video.isReady) return;
        
        this.closeControlTimeout()
        var rect = e.target.getBoundingClientRect();
        var x = e.targetTouches[0].pageX - rect.left;
        this.setCurrentTime(x/rect.width)
    })
    
    this.timeLine.addEventListener('touchstart', e => {

        if (!this.video.isReady) return;
        
        this.closeControlTimeout()
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

    var minutes = parseInt(_time/60)
    minutes = minutes.toString().length > 1 ? minutes : ("0" + minutes)
        
    var seconds = parseInt(_time%60)
    seconds = seconds.toString().length > 1 ? seconds : ("0" + seconds) 

    this.timeCounter.innerHTML = minutes + ":" + seconds
    this.currentTime.style.width = (( this.timeLine.getBoundingClientRect().width * _time) / this.video.duration) + "px"
    
}

//=========================================================================

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
            this.closeControlTimeout()
    
        }else{
            
            this.pause()
    
        }

    }

    

}

//=========================================================================

timeLineControl.prototype.closeControls = function(){    
    
    this.btnsContainer.classList.toggle("closed")
    this.bg.classList.toggle("closed")
    setTimeout(()=>{
        this.controlContainer.classList.toggle("closed")    
    }, 300)
    this.menuOpen = false
    this.ellapsedTime = 0

    this.subtilteControl.subtitlesContainer.style.transform = "translate(0px,0px)"
    this.title.classList.toggle("off")  

}

timeLineControl.prototype.openControls = function(){    

    this.controlContainer.classList.toggle("closed")    
    setTimeout(()=>{
        this.btnsContainer.classList.toggle("closed")
        this.bg.classList.toggle("closed")
    },1)

    this.menuOpen = true
    this.closeControlTimeout()

    this.subtilteControl.subtitlesContainer.style.transform = "translate(0px,-150px)"
    this.title.classList.toggle("off")  

}

timeLineControl.prototype.toggleControls = function(){    
    
    if(!this.menuOpen){ 
        this.openControls()
    }
    
}

//=========================================================================

timeLineControl.prototype.closeControlTimeout = function(){    

    //clear all timeout
    for (let index = 0; index < this.timouts.length; index++) {
        window.clearTimeout(this.timouts[index]);
    }
    this.timouts = []

    if(this.isPlaying && this.subtilteControl.menuClosed ){
    
        //create new timeout
        this.timouts.push(window.setTimeout(()=>{ 
        
            
            if(this.isPlaying && this.subtilteControl.menuClosed){ this.closeControls() }
        
        },this.waitTime))

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
    this.menuItemSizes = {
        itemHeight : 45,
        margin : 26,
    }
    this.openMenuHeight = (2 * this.menuItemSizes.margin)  + (_subs.length * this.menuItemSizes.itemHeight)
    this.menuClosed = false
    this.animationEnded = true
    this.interactionHandler = function(){}
    
    this.controls = []
    this.subtitles = []
    this.activeSubtitle = ""
    this.defaultSubtitle = false

    this.createDOMelements(_controlParent,_video,_subs,_subParent)
    this.closeMenu()
 
}

subtilteControl.prototype.createDOMelements = function (_controlParent,_video,_subs,_subParent) {
    
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
    
    this.subtitlesContainer = document.createElement("div")
    this.subtitlesContainer.className = "subtitlesContainer"
    _video.insertAdjacentElement("afterEnd", this.subtitlesContainer)

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

        var finalPos = ( this.menuItemSizes.itemHeight * i) + this.menuItemSizes.margin
        control.setAttribute("finalpos", finalPos)
        control.style.transform = "translateY(-" + finalPos + 20 +  "px)"
        control.style.height = this.menuItemSizes.itemHeight +  "px"

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

    //-------------------
    //    icons
    //-------------------

    this.iconContainer = document.createElement("div")
    this.iconContainer.className = "iconContainer"
    this.controlContainer.appendChild(this.iconContainer)
    this.controlContainer.addEventListener('touchstart', e => {

        if (!this.animationEnded) return

            this.animationEnded = false
            if(!this.menuClosed){
                this.closeMenu()
            }else{
                this.openMenu()
            }

    })

    //left
    this.iconLeft = document.createElement("div")
    this.iconLeft.className = "subIcon"
    var leftPos = getXY(-45,4,0)
    this.iconLeft.style.transform = "rotate(" + leftPos.angle + "deg) translate(" + leftPos.x + "px," + (-leftPos.y) +  "px)"
    this.iconContainer.appendChild(this.iconLeft)

    //right
    this.iconRight = document.createElement("div")
    this.iconRight.className = "subIcon"
    var rightPos = getXY(45,-4,0)
    this.iconRight.style.transform = "rotate(" + rightPos.angle + "deg) translate(" + rightPos.x + "px," + (-rightPos.y) +  "px)"
    this.iconContainer.appendChild(this.iconRight)

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
        this.controls[i].style.transitionDelay = (i * 0.1) + "s" 
        this.controls[i].classList.remove("hidden")    

        if(this.controls[i].id == this.activeSubtitle.id){
            this.controls[i].style.transitionDelay = "0.05s"
        }
    }
    
    var rightPos = getXY(45,-11,this.openMenuHeight - 63)
    this.iconRight.style.transform = "rotate(" + rightPos.angle + "deg) translate(" + rightPos.x + "px," + (-rightPos.y) +  "px)"
    this.iconRight.style.transition = "all 600ms"
    this.iconRight.style.width = "22px"
    
    var leftPos = getXY(-45,11,this.openMenuHeight - 63)
    this.iconLeft.style.transform = "rotate(" + leftPos.angle + "deg) translate(" + leftPos.x + "px," + (-leftPos.y) +  "px)"
    this.iconLeft.style.transition = "all 600ms"
    this.iconLeft.style.width = "22px"

    this.interactionHandler()

}

subtilteControl.prototype.closeMenu = function () {
    
    this.menuClosed = true
    this.controlBg.style.height = "56px"

    for(var i = 0; i < this.controls.length; i++ ){

        if(this.controls[i].id == this.activeSubtitle.id){
            var activeSubElement = this.controls[this.activeSubtitle.id]
            activeSubElement.style.transform = "translateY(-" + 5 +  "px)"
            activeSubElement.style.transitionDelay = "0s"
        }else{
            this.controls[i].style.transitionDelay = 0 + "s"
            this.controls[i].style.transform = "translateY(" + (-this.controls[i].getAttribute("finalpos") + 20)  +  "px)"
            this.controls[i].classList.add("hidden")    
        }

    }
    
    var leftPos = getXY(-45,4,0)
    this.iconLeft.style.transform = "rotate(" + leftPos.angle + "deg) translate(" + leftPos.x + "px," + (-leftPos.y) +  "px)"
    this.iconLeft.style.transition = "all 300ms"
    this.iconLeft.style.width = "18px"
    
    var rightPos = getXY(45,-4,0)
    this.iconRight.style.transform = "rotate(" + rightPos.angle + "deg) translate(" + rightPos.x + "px," + (-rightPos.y) +  "px)"
    this.iconRight.style.transition = "all 300ms"
    this.iconRight.style.width = "18px"
    
    this.interactionHandler()

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
    
        allVids.push(new simplePlayer("videos/" + index +"/video.mp4", subs , "A língua e as variações geográficas"))
    
}


function getXY(_deg,_x,_y){
    var hipotenuse = _y == 0 ?  _x : _y / Math.sin(Math.atan(_y / _x));
    var _deg2 =  Math.atan(_y / _x) * 180 / Math.PI
    var angle = _deg + _deg2
    var y = Math.sin( angle * Math.PI / 180) * hipotenuse
    var x = Math.cos( angle * Math.PI / 180) * hipotenuse
    return{
        x : x,
        y : y,
        angle : _deg
    }
} 

