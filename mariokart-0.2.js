const imgHeight = 374;
const imgWidth = 198;
var cont = 0;
var firstTime = 0;
var firstTimeDead = 0;

(function(exports) {

function MarioKart() {
    var oMaps = {
        "map1": {
            "texture": "media/map_1.png",
            "width": 512,
            "height": 512,
            "collision": [
                [84, 80, 49, 212],
                [68, 276, 20, 56],
                [290, 3, 220, 47],
                [132, 146, 98, 42],
                [133, 105, 55, 46],
                [220, 170, 62, 22],
                [136, 188, 208, 60],
                [0, 0, 36, 33],
                [2, 408, 36, 33],
                [250, 3, 43, 31],
                [336, 244, 35, 32],
                [132, 244, 36, 32],
                [352, 274, 24 ,96],
                [330, 48, 43, 33],
                [136, 386, 55, 53],
                [344, 208, 64, 40],
                [368, 248, 40, 160],
                [370, 49, 140, 59],
                [430, 105, 80, 45],
                [105, 404, 33, 35],
                [4, 436, 236, 72],
                [186, 358, 78, 78],
                [262, 438, 42, 74],
                [480, 476, 32, 36],
                [300, 480, 35, 30]
            ],
            "startpositions": [{
                x: 460,
                y: 292
            }, {
                x: 476 - 18,
                y: 356 - 18
            }, {
                x: 476,
                y: 356 - 24
            }],
            "sand":[
            ],
            "checkpoints":[
            ],
            "startrotation": 180,
            "aipoints": [
                [467, 273],
                [459, 208],
                [317, 128],
                [160, 50],
                [64, 53],
                [44, 111],
                [38, 272],
                [50, 351],
                [106, 349],
                [215, 300],
                [278, 305],
                [337, 417],
                [405, 451],
                [462, 414]
            ]
        },
        "map2": {
            "texture": "media/map_2.png",
            "width": 198,
            "height": 374,
            "collision": [
                [72, 60, 59, 241]
            ],
            "sand":[
                [0, 0, 198, 10],
                [0, 10, 14, 354],
                [0, 364, 198, 10],
                [189, 10, 9, 354],
                [56, 51, 92, 272]
            ],
            "checkpoints":[
            	[128, 62, 70],
            	[0, 62, 74],
            	[0, 299, 74],
            	[128, 299, 79],
            	[128, 144, 70],
            	[0, 144, 74],
            	[0, 244, 75]
            ],
            "startpositions": [{
                x: 167,
                y: 198
            }, {
                x: 167 - 18,
                y: 196
            }, {
                x: 167,
                y: 210
            }],
            "startrotation": 180,
            "aipoints": [167,257]
        }
    }
    var aAvailableMaps = ["map1", "map2"];
    // render modes:
    // 0: One screen canvas
    // 1: One canvas per horizontal screen line
    var iRenderMode = 0;
    var iWidth = 80;
    var iHeight = 35;
    var iScreenScale = 15;
    var iQuality = 1; // 1 = best, 2 = half as many lines, etc.
    var bSmoothSprites = true;
    var bMusic = true;
    var _self = this;

    function setRenderMode(iValue) {
        if (bCounting) return;
        iRenderMode = iValue;
        if (bRunning) resetScreen();
    }
    this.setRenderMode = setRenderMode;

    function setScreenScale(iValue) {
        if (bCounting) return;
        iScreenScale = iValue;
        if (bRunning) resetScreen();
    }
    this.setScreenScale = setScreenScale;

    function setQuality(iValue) {
        if (bCounting) return;
        iQuality = iValue;
        if (bRunning) resetScreen();
    }
    this.setQuality = setQuality;
    
    var oMap;
    var oHills;
    var oTrees;
    var aCharacters = ["mario", "luigi", "peach"];
    var aPlayers = [];
    var oPlayer;
    var strPlayer = "";
    var playerCount = 1;
    var iStartPos = -1;
    var iMapWidth;
    var iMapHeight;
    var oMapImg;

    function resetGame(strMap) {
        oMap = oMaps[strMap];
        loadMap(oMap);
    }
    this.resetGame = resetGame;

    function loadMap() {
        oMapImg = new Image();
        iMapWidth = oMap.width;
        iMapHeight = oMap.height;
        oMapImg.onload = startGame;
        oMapImg.src = oMap.texture;
    }
    var fMaxSpeed = 6;
    var fMaxRotInc = 6;
    var fMaxRotTimer = 0;
    var aKarts = [];
    var bRunning = false;
    var bCounting = false;

    function startGame() {
        resetScreen();
        if (bMusic) {
            // startMusic();
        }

        //Esse será o vetor que armzenará os players, no jogo original ficava com o usuario e as duas IA's
        aKarts = [];
        for (var i = 0; i < numberOfMarios; ++i) {
            ++iStartPos;
            aPlayers[i] = 'mario';

            //Construtor do objeto oPlayer
            //#1
            var p = elJugador[i];
            p.player = aPlayers[i];
            p.x = oMap.startpositions[0].x;
            p.y = oMap.startpositions[0].y;
            p.speed = 0;
            p.speedinc = 0;
            p.rotation = oMap.startrotation;
            p.rotincdir = 0;
            p.rotinc = 0;
            p.sprite = new Sprite(aPlayers[i]);
            p.cpu = false;
            p.fitness = 0;
            p.isFreezed = 0;
            //Criação do cérebro do mario
            p.brain = new NeuralNetwork(8, 200, 1);
            //Fim do construtor

            firstTime++;
            if(firstTime == 1) {
                oPlayer = p;
            }
            //Adiciona o objeto que acabamos de criar no vetor de karts que vao para o jogo
            aKarts.push(p);
        }

        render();
        bCounting = true;
        var oCount = document.createElement("div");
        var oCntStyle = oCount.style;
        oCntStyle.position = "absolute";
        oCntStyle.width = (12 * iScreenScale) + "px";
        oCntStyle.height = (12 * iScreenScale) + "px";
        oCntStyle.overflow = "hidden";
        oCntStyle.top = (4 * iScreenScale) + "px";
        oCntStyle.left = (8 * iScreenScale) + "px";
        var oCountImg = document.createElement("img");
        oCountImg.src = "media/countdown.png";
        oCountImg.style.position = "absolute";
        oCountImg.style.left = "0px";
        oCountImg.height = 12 * iScreenScale;
        oCount.appendChild(oCountImg);
        oContainer.appendChild(oCount);
        var iCntStep = 1;
        oCount.scrollLeft = 0;
        var fncCount = function() {
                oCount.scrollLeft = iCntStep * 12 * iScreenScale;
                iCntStep++;
                if (iCntStep < 4) {
                    setTimeout(fncCount, 1000);
                }
                else {
                    setTimeout(

                    function() {
                        oContainer.removeChild(oCount);
                        bCounting = false;
                    }, 1000);
                    cycle();
                    bRunning = true;
                }
            }
        setTimeout(fncCount, 1000);
    }
    //End start game

    var oMusicEmbed;
    var bMusicPlaying = false;

    function startMusic() {
        bMusicPlaying = true;
        oMusicEmbed = document.createElement("embed");
        oMusicEmbed.src = "media/" + strMap + ".mid";
        oMusicEmbed.setAttribute("loop", "true");
        oMusicEmbed.setAttribute("autostart", "true");
        oMusicEmbed.style.position = "absolute";
        oMusicEmbed.style.left = "-1000px";
        oMusicEmbed.style.top = "-1000px";
        document.body.appendChild(oMusicEmbed);
    }

    function stopMusic() {
        if (!bMusicPlaying) {
            return;
        }
        bMusicPlaying = false;
        document.body.removeChild(oMusicEmbed);
    }
    
    this.setMusic = function(iValue) {
        bMusic = !! iValue;
        if (bMusic && !bMusicPlaying && bRunning) {
            startMusic();
        }
        if (!bMusic && bMusicPlaying) {
            stopMusic();
        }
    };


    //Passa aqui só uma vez
    var fSpriteScale = 0;
    var fLineScale = 0;
    // setup main container
    var oContainer = document.createElement("div")
    oContainer.tabindex = 1;
    var oCtrStyle = oContainer.style;
    oCtrStyle.position = "absolute";
    oCtrStyle.border = "2px solid black";
    oCtrStyle.overflow = "hidden";
    //document.body.appendChild(oContainer);
    document.getElementById("mariokartcontainer").appendChild(oContainer);
    // setup screen canvas for render mode 0.
    var oScreenCanvas = document.createElement("canvas");
    var oScreenCtx = oScreenCanvas.getContext("2d");
    var oScrStyle = oScreenCanvas.style;
    oScrStyle.position = "absolute";
    oContainer.appendChild(oScreenCanvas);
    // setup strip container render mode 1.
    var oStripCtr = document.createElement("div");
    oStripCtr.style.position = "absolute";
    oContainer.appendChild(oStripCtr);
    // array for screen strip descriptions
    var aStrips = [];
    var iCamHeight = 24;
    var iCamDist = 32;
    var iViewHeight = -10;
    var iViewDist = 0;
    var fFocal = 1 / Math.tan(Math.PI * Math.PI / 360);

    function resetScreen() {
        fSpriteScale = iScreenScale / 4;
        fLineScale = 1 / iScreenScale * iQuality;
        aStrips = [];
        oStripCtr.innerHTML = "";
        // change dimensions of main container
        oCtrStyle.width = (iWidth * iScreenScale) + "px";
        oCtrStyle.height = (iHeight * iScreenScale) + "px";
        if (oHills) oContainer.removeChild(oHills.div);
        if (oTrees) oContainer.removeChild(oTrees.div);
        // change dimensions of screen canvas
        oScreenCanvas.width = iWidth / fLineScale;
        oScreenCanvas.height = iHeight / fLineScale;
        oScrStyle.width = (iWidth * iScreenScale + iScreenScale) + "px";
        oScrStyle.left = (-iScreenScale / 2) + "px";
        oScrStyle.top = iScreenScale + "px";
        oScrStyle.height = (iHeight * iScreenScale) + "px";
        oStripCtr.style.width = (iWidth * iScreenScale + iScreenScale) + "px";
        oStripCtr.style.left = (-iScreenScale / 2) + "px";
        var fLastZ = 0;
        // create horizontal strip descriptions
        for (var iViewY = 0; iViewY < iHeight; iViewY += fLineScale) {
            var iTotalY = iViewY + iViewHeight; // total height of point (on view) from the ground up
            var iDeltaY = iCamHeight - iTotalY; // height of point relative to camera
            var iPointZ = (iTotalY / (iDeltaY / iCamDist)); // distance to point on the map
            var fScaleRatio = fFocal / (fFocal + iPointZ);
            var iStripWidth = Math.floor(iWidth / fScaleRatio);
            if (fScaleRatio > 0 && iStripWidth < iViewCanvasWidth) {
                if (iViewY == 0) fLastZ = iPointZ - 1;
                var oCanvas;
                if (iRenderMode == 1) {
                    var oCanvas = document.createElement("canvas");
                    oCanvas.width = iStripWidth;
                    oCanvas.height = 1;
                    var oStyle = oCanvas.style;
                    oStyle.position = "absolute";
                    oStyle.width = (iWidth * iScreenScale + iScreenScale) + "px";
                    oStyle.height = (iScreenScale * fLineScale) + iScreenScale * 0.5;
                    oStyle.left = (-iScreenScale / 2) + "px";
                    oStyle.top = Math.round((iHeight - iViewY) * iScreenScale) + "px";
                    oStripCtr.appendChild(oCanvas);
                }
                aStrips.push({
                    canvas: oCanvas || null,
                    viewy: iViewY,
                    mapz: iPointZ,
                    scale: fScaleRatio,
                    stripwidth: iStripWidth,
                    mapzspan: iPointZ - fLastZ
                })
                fLastZ = iPointZ;
            }
        }
        oHills = new BGLayer("hills", 360);
        oTrees = new BGLayer("trees", 720);
    }

    // setup canvas for holding the currently visible portion of the map
    // this is the canvas used to draw from when rendering
    var iViewCanvasHeight = 90; // these height, width and y-offset values 
    var iViewCanvasWidth = 256; // have been adjusted to work with the current camera setup
    var iViewYOffset = 10;
    var oViewCanvas = document.createElement("canvas");
    var oViewCtx = oViewCanvas.getContext("2d");
    oViewCanvas.width = iViewCanvasWidth;
    oViewCanvas.height = iViewCanvasHeight;

    function Sprite(strSprite) {
        // buttonUp();
        var oImg = new Image();
        oImg.style.position = "absolute";
        oImg.style.left = "0px";
        oImg.src = "media/sprite_" + strSprite + (bSmoothSprites ? "_smooth" : "") + ".png";
        var oSpriteCtr = document.createElement("div");
        oSpriteCtr.style.width = "32px";
        oSpriteCtr.style.height = "32px";
        oSpriteCtr.style.position = "absolute";
        oSpriteCtr.style.overflow = "hidden";
        oSpriteCtr.style.zIndex = 10000;
        oSpriteCtr.style.display = "none";
        oSpriteCtr.appendChild(oImg);
        oContainer.appendChild(oSpriteCtr);
        var iActiveState = 0;
        
        //FUNÇÃO DESENHAR
        this.draw = function(iX, iY, fScale) {
            //=====================================
            var bDraw = true;
            if (iY > iHeight * iScreenScale || iY < 6 * iScreenScale) {
                bDraw = false;
            }
            if (!bDraw) {
                oSpriteCtr.style.display = "none";
                return;
            }
            oSpriteCtr.style.display = "block";
            var fSpriteSize = Math.round(32 * fSpriteScale * fScale);
            oSpriteCtr.style.left = Math.round(iX - fSpriteSize / 2) + "px";
            oSpriteCtr.style.top = Math.round(iY - fSpriteSize / 2) + "px";
            oImg.style.height = fSpriteSize + "px";
            oSpriteCtr.style.width = fSpriteSize + "px";
            oSpriteCtr.style.height = fSpriteSize + "px";
            oImg.style.left = -Math.round(fSpriteSize * iActiveState) + "px";
        }
        this.setState = function(iState) {
            iActiveState = iState;
        }
        this.img = oImg;
        this.div = oSpriteCtr;
        this.remove = function(){
            oSpriteCtr.removeChild(oImg);
            oContainer.removeChild(oSpriteCtr);
        }
    }

    function BGLayer(strImage, iLayerWidth) {
        //Passa aqui duas vezes antes do jogo começar
        var oLayer = document.createElement("div");
        oLayer.style.height = (10 * iScreenScale) + "px";
        oLayer.style.width = (iWidth * iScreenScale) + "px";
        oLayer.style.position = "absolute";
        oLayer.style.overflow = "hidden";
        var oImg1 = new Image();
        oImg1.height = 20;
        oImg1.width = iLayerWidth;
        oImg1.style.position = "absolute";
        oImg1.style.left = "0px";
        var oImg2 = new Image();
        oImg2.height = 20;
        oImg2.width = iLayerWidth;
        oImg2.style.position = "absolute";
        oImg2.style.left = "0px";
        var oCanvas1 = document.createElement("canvas");
        oCanvas1.width = iLayerWidth;
        oCanvas1.height = 20;
        oImg1.onload = function() {
            oCanvas1.getContext("2d").drawImage(oImg1, 0, 0);
        }
        oImg1.src = "media/bg_" + strImage + ".png";
        oCanvas1.style.width = Math.round(iLayerWidth / 2 * iScreenScale + iScreenScale) + "px"
        oCanvas1.style.height = Math.round(10 * iScreenScale) + "px";
        oCanvas1.style.position = "absolute";
        oCanvas1.style.left = "0px";
        var oCanvas2 = document.createElement("canvas");
        oCanvas2.width = iLayerWidth;
        oCanvas2.height = 20;
        oImg2.onload = function() {
            oCanvas2.getContext("2d").drawImage(oImg2, 0, 0);
        }
        oImg2.src = "media/bg_" + strImage + ".png";
        oCanvas2.style.width = Math.round(iLayerWidth / 2 * iScreenScale) + "px";
        oCanvas2.style.height = Math.round(10 * iScreenScale) + "px";
        oCanvas2.style.position = "absolute";
        oCanvas2.style.left = Math.round(iLayerWidth * iScreenScale) + "px";
        oLayer.appendChild(oCanvas1);
        oLayer.appendChild(oCanvas2);
        oContainer.appendChild(oLayer);
        return {
            draw: function(fRotation) {
                // something is wrong in here. For now, it looks fine due to fortunate hill placement
                var iRot = -Math.round(fRotation);
                while (iRot < 0)
                iRot += 360;
                while (iRot > 360)
                iRot -= 360;
                // iRot is now between 0 and 360
                var iScaledWidth = (iLayerWidth / 2 * iScreenScale);
                // one degree of rotation equals x width units:
                var fRotScale = iScaledWidth / 360;
                var iScroll = iRot * fRotScale;
                var iLeft1 = -iScroll;
                var iLeft2 = -iScroll + iScaledWidth;
                oCanvas1.style.left = Math.round(iLeft1) + "px";
                oCanvas2.style.left = Math.round(iLeft2) + "px";
            },
            div: oLayer
        }
    }

    // Função renderizar
    function render() {
        oViewCanvas.width = oViewCanvas.width;
     
//===================================================================
        //#Loop_do_jogo
        //#2
        //Criar um for que passa por todas as posições
        //Começa da segunda posição ate a ultima, porque o primeiro cara sou eu
        for (let i=1; i<aKarts.length; i++) {
            if(!(aKarts[i].isFreezed)) {
                aKarts[i].fitness++;
            }

            aKarts[i].buttonUp();
            
            aKarts[i].think(oMap);
            if(aKarts[i].isFreezed){
                aKarts[i].freeze(oMap);
            }

            if(isEverybodyDead(aKarts)){
            	if(contadorPodeGerar > numberOfMarios){
            		aKarts = newGeneration(aKarts, oMap, cloneFunction); //This new array is not freezed anymore
                    contadorPodeGerar = 0;
                }else{
            		contadorPodeGerar++;
            	}
            } 
            //reset game
            //start again
        }
    
//=====================================================================================
        oViewCtx.fillStyle = "green";
        oViewCtx.fillRect(0, 0, oViewCanvas.width, oViewCanvas.height);
        oViewCtx.save();
        oViewCtx.translate(iViewCanvasWidth / 2, iViewCanvasHeight - iViewYOffset);
        oViewCtx.rotate((180 + oPlayer.rotation) * Math.PI / 180);
        oViewCtx.drawImage(oMapImg, -oPlayer.x, -oPlayer.y);
        oViewCtx.restore();
        oScreenCanvas.width = oScreenCanvas.width;
        oScreenCtx.fillStyle = "green";
        //oScreenCtx.fillRect(0,0,oScreenCanvas.width,oScreenCanvas.height);


        for (var i = 0; i < aStrips.length; i++) {
            var oStrip = aStrips[i];
            if (iRenderMode == 0) {
                try {
                    oScreenCtx.drawImage(
                        oViewCanvas, iViewCanvasWidth / 2 - (oStrip.stripwidth / 2),
                        //Math.floor(((iViewCanvasHeight-iViewYOffset) - oStrip.mapz)),
                        ((iViewCanvasHeight - iViewYOffset) - oStrip.mapz) - 1, oStrip.stripwidth, oStrip.mapzspan, 0, 
                        (iHeight - oStrip.viewy) / fLineScale, iWidth / fLineScale, 1
                    );
                }
                catch (e) {};
            }
            if (iRenderMode == 1) {
                var iStripHeight = Math.max(3, oStrip.mapzspan);
                //oStrip.canvas.width=oStrip.canvas.width;
                oStrip.canvas.height = iStripHeight;
                oStrip.canvas.getContext("2d").clearRect(0, 0, oStrip.stripwidth, 1);
                try {
                    oStrip.canvas.getContext("2d").drawImage(
                        oViewCanvas, iViewCanvasWidth / 2 - (oStrip.stripwidth / 2), 
                        ((iViewCanvasHeight - iViewYOffset) - oStrip.mapz) - 1, oStrip.stripwidth, 
                        oStrip.mapzspan, 0, 0, oStrip.stripwidth, iStripHeight
                    );
                }
                catch (e) {};
            }
        }
        var iOffsetX = (iWidth / 2) * iScreenScale;
        var iOffsetY = (iHeight - iViewYOffset) * iScreenScale;
        var zIndexBase = 10000;

        for (var i = 0; i < aKarts.length; i++) {
            var oKart = aKarts[i];
            if (oKart != oPlayer) { //oKart.cpu) {
                var fCamX = -(oPlayer.x - oKart.x);
                // var fCamX = 1;
                var fCamY = -(oPlayer.y - oKart.y);
                var fRotRad = oPlayer.rotation * Math.PI / 180;
                var fTransX = fCamX * Math.cos(fRotRad) - fCamY * Math.sin(fRotRad);
                var fTransY = fCamX * Math.sin(fRotRad) + fCamY * Math.cos(fRotRad);
                var iDeltaY = -iCamHeight;
                var iDeltaX = iCamDist + fTransY;
                var iViewY = ((iDeltaY / iDeltaX) * iCamDist + iCamHeight) - iViewHeight;
                var fViewX = -(fTransX / (fTransY + iCamDist)) * iCamDist;
                var fAngle = oPlayer.rotation - oKart.rotation;
                while (fAngle < 0)
                fAngle += 360;
                while (fAngle > 360)
                fAngle -= 360;
                var iAngleStep = Math.round(fAngle / (360 / 22));
                if (iAngleStep == 22) iAngleStep = 0;
                
                oKart.sprite.setState(iAngleStep);
                oKart.sprite.div.style.zIndex = Math.round(zIndexBase - fTransY);
                oKart.sprite.draw(((iWidth / 2) + fViewX) * iScreenScale, (iHeight - iViewY) * iScreenScale, fFocal / (fFocal + (fTransY)));
            }
            else {
                oKart.sprite.div.style.zIndex = zIndexBase;
                oKart.sprite.draw(iOffsetX, iOffsetY, 1);
            }
        }
        oHills.draw(oPlayer.rotation);
        oTrees.draw(oPlayer.rotation);
    }
    
    function wall(iX, iY) {
        for (var i = 0; i < oMap.collision.length; i++) {
            var oBox = oMap.collision[i];
            if ((iX > oBox[0] && iX < oBox[0] + oBox[2])&&(iY > oBox[1] && iY < oBox[1] + oBox[3])) return true;
        }
        return false;
    }

    function canMoveTo(iX, iY) {
        if (iX > iMapWidth - 5 || iY > iMapHeight - 5) return false;
        if (iX < 4 || iY < 4) return false;
        if(wall(iX, iY) == true) return false;
        return true;
    }

    function areia(iX, iY) {
        for(let i=0; i < oMap.sand.length; i++) {
            let oBox = oMap.sand[i];
            if ((iX > oBox[0] && iX < oBox[0] + oBox[2])&&(iY > oBox[1] && iY < oBox[1] + oBox[3]))  return true;
        }
        return false;
    }

    function check(iX, iY) {
    	for(let i=0; i < oMap.checkpoints.length; i++) {
            let oLine = oMap.checkpoints[i];
            if ((iX > oLine[0] && iX < oLine[0] + oLine[2]) && (iY == oLine[1]))  return i;
        }
        return 0;
    }

    function move(oKart) {
        if (oKart.rotincdir) {
            oKart.rotinc += 2 * oKart.rotincdir;
        }
        else {
            if (oKart.rotinc < 0) {
                oKart.rotinc = Math.min(0, oKart.rotinc + 1);
            }
            if (oKart.rotinc > 0) {
                oKart.rotinc = Math.max(0, oKart.rotinc - 1);
            }
        }
        oKart.rotinc = Math.min(oKart.rotinc, fMaxRotInc);
        oKart.rotinc = Math.max(oKart.rotinc, -fMaxRotInc);
        if (oKart.speed) {
            oKart.rotation += (oKart.speedinc < 0 || (oKart.speedinc == 0 && oKart.speed < 0)) ? -oKart.rotinc : oKart.rotinc;
        }
        if (oKart.rotation < 0) oKart.rotation += 360;
        if (oKart.rotation > 360) oKart.rotation -= 360;
        if (!oKart.cpu) {
            if (oKart.rotincdir == 0) {
                oKart.sprite.setState(0);
            }
            else {
                if (oKart.rotincdir < 0) {
                    if (oKart.rotinc == -fMaxRotInc && fMaxRotTimer > 0 && (new Date().getTime() - fMaxRotTimer) > 800) oKart.sprite.setState(26);
                    else oKart.sprite.setState(24);
                }
                else {
                    if (oKart.rotinc == fMaxRotInc && fMaxRotTimer > 0 && (new Date().getTime() - fMaxRotTimer) > 800) oKart.sprite.setState(27);
                    else oKart.sprite.setState(25);
                }
            }
            if (Math.abs(oKart.rotinc) != fMaxRotInc) {
                fMaxRotTimer = 0;
            }
            else if (fMaxRotTimer == 0) {
                fMaxRotTimer = new Date().getTime();
            }
        }
        oKart.speed += oKart.speedinc;
        var fMaxKartSpeed = fMaxSpeed;
        if (oKart.cpu) fMaxKartSpeed *= 0.95;
        if (oKart.speed > fMaxKartSpeed) oKart.speed = fMaxKartSpeed;
        if (oKart.speed < -fMaxKartSpeed / 4) oKart.speed = -fMaxKartSpeed / 4;
        // move position
        var fMoveX = oKart.speed * Math.sin(oKart.rotation * Math.PI / 180);
        var fMoveY = oKart.speed * Math.cos(oKart.rotation * Math.PI / 180);
        var fNewPosX = oKart.x + fMoveX;
        var fNewPosY = oKart.y + fMoveY;
        if (canMoveTo(Math.round(fNewPosX), Math.round(fNewPosY))) {
            oKart.x = fNewPosX;
            oKart.y = fNewPosY;
        }
        else {
            if(oKart != aKarts[0]) oKart.isFreezed = 1;
            oKart.speed *= -1;
        }
        // decrease speed
        oKart.speed *= 0.9;
        if(areia( oKart.x, oKart.y) == true){
        	// oKart.speed *= 0.6;
    		oKart.fitness-=2;
    	}
    	oKart.fitness*=(1+0.1*check(oKart.x, oKart.y));
    }

    //===========================================CLONE============================================
    function cloneFunction (obj) {
        var newCopy = {
            //Métodos do objeto
            think: function(oMap) {
            	let inputs = [];
            	if(this.rotation > 135 && this.rotation <= 225 ){
            		inputs[0] = this.distanceUp(oMap);
            		inputs[1] = this.distanceBottom(oMap);
            		inputs[2] = this.distanceRight(oMap);
            		inputs[3] = this.distanceLeft(oMap);
            	}
            	else if(this.rotation > 45 && this.rotation <= 135 ){
            		inputs[0] = this.distanceRight(oMap);
            		inputs[1] = this.distanceLeft(oMap);
            		inputs[2] = this.distanceBottom(oMap);
            		inputs[3] = this.distanceUp(oMap);
            	}
            	else if(this.rotation > 225 && this.rotation <= 315 ){
            		inputs[0] = this.distanceLeft(oMap);
            		inputs[1] = this.distanceRight(oMap);
            		inputs[2] = this.distanceUp(oMap);
            		inputs[3] = this.distanceBottom(oMap);
            	}
            	else if(this.rotation > 315 || this.rotation <= 45 ){
            		inputs[0] = this.distanceBottom(oMap);
            		inputs[1] = this.distanceUp(oMap);
            		inputs[2] = this.distanceLeft(oMap);
            		inputs[3] = this.distanceRight(oMap);
            	}
            	inputs[4] = this.rotation/360;
                inputs[5] = this.speed;
                inputs[6] = this.x;
                inputs[7] = this.y;
            	let output = this.brain.predict(inputs);
            	if (output[0] > 0.66) {
                	this.buttonRight();
            	}
            	else if (output[0] < 0.33) {
                	this.buttonLeft();
            	}
        	}, 

            distanceUp: function(oMap) {
                let x = this.x;
                let y = this.y;
                let minDistance = y;
                //Passa por todas as caixas contidas no vetor collision
                for (var i = 0; i < oMap.collision.length; i++) {
                    var oBox = oMap.collision[i];
                    //O jogador precisa estar abaixo ou acima da caixa para detectar as linha, isso evita detecções erradas
                    if (x > oBox[0] && x < oBox[0] + oBox[2]){
                        //As coordenadas y precisam ser menores que a atual do jogador, pois isso fara com que a linha esteja acima dele olhando no png do mapa
                        if (oBox[1] < y) {
                            minDistance = y - oBox[1];
                        }
                        //A outra linha da caixa
                        if (oBox[1] + oBox[3] < y) {
                            let distance = y - oBox[1] - oBox[3]; 
                            if (distance < minDistance) {
                                minDistance = distance;
                            }
                        }
                    }
                    return minDistance;
                }
            },

            distanceBottom: function(oMap) {
                //365 é o tamanho na vertical
                let minDistance = oMap.height - 9 - this.y;
                let x = this.x;
                let y = this.y;
                for (var i = 0; i < oMap.collision.length; i++) {
                    var oBox = oMap.collision[i];
                    //O jogador precisa estar abaixo ou acima da caixa para detectar as linha, isso evita detecções erradas
                    if (x > oBox[0] && x < oBox[0] + oBox[2]){
                        //As coordenadas y da caixa precisam ser maiores que a atual do jogador, pois isso fara com que a linha esteja abaixo dele, olhando no png do mapa
                        if (oBox[1] > y) {
                            minDistance = oBox[1] - y;
                        }
                        //A outra linha da caixa
                        if (oBox[1] + oBox[3] > y) {
                            let distance = oBox[1] + oBox[3] - y;
                            if (distance < minDistance) {
                                minDistance = distance; 
                            }
                        }
                    }
                }
                return minDistance;
            },

            distanceLeft: function(oMap) {
                let x = this.x;
                let y = this.y;
                let minDistance = x;
                for (var i = 0; i < oMap.collision.length; i++) {
                    var oBox = oMap.collision[i];
                    //O jogador precisa estar à direita ou à esquerda da caixa para detectar as linhas, isso evita detecções erradas
                    if (y > oBox[1] && y < oBox[1] + oBox[3]){
                        //As coordenadas y da caixa precisam ser maiores que a atual do jogador, pois isso fara com que a linha esteja abaixo dele, olhando no png do mapa
                        if (x > oBox[0] + oBox[2]) {
                            minDistance = x - oBox[0] - oBox[2];
                        }
                        //A outra linha da caixa sempre estará mais longe, pois como nao ha coordenadas negativas o oBox[0]+oBox[2] sempre ira minimizar o minDistance
                        //Entoncess não precisamos conferir
                    }
                }
                return minDistance;
            },

            distanceRight: function(oMap) {
                let x = this.x;
                let y = this.y;
                let minDistance = oMap.width - 10 - x;
                for (var i = 0; i < oMap.collision.length; i++) {
                    var oBox = oMap.collision[i];
                    //O jogador precisa estar à direita ou à esquerda da caixa para detectar as linhas, isso evita detecções erradas
                    if (y > oBox[1] && y < oBox[1] + oBox[3]){
                        //As coordenadas y da caixa precisam ser maiores que a atual do jogador, pois isso fara com que a linha esteja abaixo dele, olhando no png do mapa
                        if (x < oBox[0]) {
                            minDistance = oBox[0] - x;
                        }
                        //A outra linha da caixa sempre estará mais longe, pois como nao ha coordenadas negativas o oBox[0]+oBox[2] sempre ira minimizar o minDistance
                        //Entoncess não precisamos conferir
                    }
                }
                return minDistance;
            },

            // Acceleration function
            buttonUp: function() {
                this.speedinc = 1;
            },

            //Deceleration function
            buttonDown :function() {
                this.speedinc -= 0.2;
            },

            //Turn right
            buttonRight :function() {
                this.rotincdir = -1;
            },

            //Turn left
            buttonLeft :function() {
                this.rotincdir = 1;
            },

            freeze: function(oMap) {
                this.speed = 0;
                this.x = oMap.startpositions[0].x;
                this.y = oMap.startpositions[0].y;
                this.rotation = oMap.startrotation;
            	this.rotincdir = 0;
            	this.rotinc = 0;
            }

        };
       	newCopy.player = 'mario';
        newCopy.sprite = new Sprite('mario');
        newCopy.cpu = obj.cpu;
        newCopy.speed = obj.speed;
        newCopy.speedinc = obj.speedinc;
        newCopy.rotincdir = obj.rotincdir;
        newCopy.rotinc = obj.rotinc;
        newCopy.fitness = obj.fitness;
        newCopy.x = obj.x;
        newCopy.y = obj.y;
        newCopy.rotation = obj.rotation;
        newCopy.isFreezed = obj.isFreezed;
        newCopy.brain = obj.brain.copy();
        return newCopy;
    }
    //Fim da função clone

    function ai(oKart) {
        var aCurPoint = oMap.aipoints[oKart.aipoint];
        // first time, get the point coords
        if (!oKart.aipointx) oKart.aipointx = aCurPoint[0];
        if (!oKart.aipointy) oKart.aipointy = aCurPoint[1];
        var iLocalX = oKart.aipointx - oKart.x;
        var iLocalY = oKart.aipointy - oKart.y;
        iRotatedX = iLocalX * Math.cos(oKart.rotation * Math.PI / 180) - iLocalY * Math.sin(oKart.rotation * Math.PI / 180);
        iRotatedY = iLocalX * Math.sin(oKart.rotation * Math.PI / 180) + iLocalY * Math.cos(oKart.rotation * Math.PI / 180);
        var fAngle = Math.atan2(iRotatedX, iRotatedY) / Math.PI * 180;
        if (Math.abs(fAngle) > 10) {
            if (oKart.speed == fMaxSpeed) oKart.speedinc = -0.5;
            oKart.rotincdir = fAngle > 0 ? 1 : -1;
        }
        else {
            oKart.rotincdir = 0;
        }
        oKart.speedinc = 1;
        var fDist = Math.sqrt(iLocalX * iLocalX + iLocalY * iLocalY);
        if (fDist < 40) {
            oKart.aipoint++;
            if (oKart.aipoint >= oMap.aipoints.length) oKart.aipoint = 0;
            var oNewPoint = oMap.aipoints[oKart.aipoint];
            oKart.aipointx = oNewPoint[0] + (Math.random() - 0.5) * 10;
            oKart.aipointy = oNewPoint[1] + (Math.random() - 0.5) * 10;
        }
    }

    function cycle() {
        for (var i = 0; i < aKarts.length; i++) {
            if (aKarts[i].cpu) ai(aKarts[i]);
            move(aKarts[i]);
        }
        setTimeout(cycle, 1000 / 15);
        render();
    }

    document.onkeydown = function(e) {
        if (!bRunning) return;
        switch (e.keyCode) {
            case 38:
                // up
                oPlayer.buttonUp();
                break;
            case 37:
                // left
                oPlayer.buttonLeft();
                break;
            case 39:
                // right
                oPlayer.buttonRight();
                break;
            case 40:
                // down
                oPlayer.buttonDown();
                break;
        }
        _self.emit("playerMove", oPlayer);
    }
    document.onkeyup = function(e) {
        if (!bRunning) return;
        switch (e.keyCode) {
            case 38:
                // up
                oPlayer.speedinc = 0;
                break;
            case 37:
                // left
                oPlayer.rotincdir = 0;
                break;
            case 39:
                // right
                oPlayer.rotincdir = 0;
                break;
            case 40:
                // down
                oPlayer.speedinc = 0;
                break;
        }
        _self.emit("playerMove", oPlayer);
    }
    // hastily tacked on intro screens, so you can select driver and track.
    
    var oStatus, oScr;

    function selectPlayerScreen() {
        oScr = document.createElement("div");
        var oStyle = oScr.style;
        oStyle.width = (iWidth * iScreenScale) + "px";
        oStyle.height = (iHeight * iScreenScale) + "px";
        oStyle.border = "1px solid black";
        oStyle.backgroundColor = "black";
        var oTitle = document.createElement("img");
        oTitle.src = "media/title.png";
        oTitle.style.position = "absolute";
        oTitle.style.width = (39 * iScreenScale) + "px";
        oTitle.style.height = (13 * iScreenScale) + "px";
        oTitle.style.left = ((iWidth - 39) / 2 * iScreenScale) + "px";
        oTitle.style.top = (2 * iScreenScale) + "px";
        oScr.appendChild(oTitle);
        oCtrStyle.width = (iWidth * iScreenScale) + "px";
        oCtrStyle.height = (iHeight * iScreenScale) + "px";
        oContainer.appendChild(oScr);

        var oPImg = document.createElement("img");
        oPImg.src = "media/start_button.png";
        oPImg.style.width = (12 * iScreenScale) + "px";
        oPImg.style.height = (12 * iScreenScale) + "px";
        oPImg.style.position = "absolute"
        oPImg.style.left = (((iWidth - 12 * aCharacters.length) / 2 + 12) * iScreenScale) + "px";
        oPImg.style.top = (18 * iScreenScale) + "px";
        oPImg.player = aCharacters[0];
        //ONCLICK!!!
        oPImg.onclick = function() {
            strPlayer = this.player;
            _self.addPlayer(strPlayer);
            _self.emit("playerSelect", strPlayer);
        }
        oScr.appendChild(oPImg);
        
        oStatus = document.createElement("blink");
        oStatus.style.position = "absolute";
        oStatus.style.width = (45 * iScreenScale) + "px";
        oStatus.style.height = (3 * iScreenScale) + "px";
        oStatus.style.left = ((iWidth - 34) / 2 * iScreenScale) + "px";
        oStatus.style.top = (31 * iScreenScale) + "px";
        oStatus.style.color = "silver";
        oStatus.style.fontStyle = "bold";
        oStatus.style.fontFamily = "monospaced";
        oStatus.style.fontSize = "22px";
        oStatus.appendChild(document.createTextNode("Start Evolution!"));
        
        oScr.appendChild(oStatus);
    }
    
    this.gotoSelectMap = function() {
        oScr.innerHTML = "";
        oContainer.removeChild(oScr);
        selectMapScreen();
    };

    function selectMapScreen() {
        oScr = document.createElement("div");
        var oStyle = oScr.style;
        oStyle.width = (iWidth * iScreenScale) + "px";
        oStyle.height = (iHeight * iScreenScale) + "px";
        oStyle.border = "1px solid black";
        oStyle.backgroundColor = "black";
        oCtrStyle.width = (iWidth * iScreenScale) + "px";
        oCtrStyle.height = (iHeight * iScreenScale) + "px";
        oContainer.appendChild(oScr);
        var oTitle = document.createElement("img");
        oTitle.src = "media/mushroomcup.png";
        oTitle.style.position = "absolute";
        oTitle.style.width = (36 * iScreenScale) + "px";
        oTitle.style.height = (6 * iScreenScale) + "px";
        oTitle.style.left = ((iWidth - 36) / 2 * iScreenScale) + "px";
        oTitle.style.top = (6 * iScreenScale) + "px";
        oScr.appendChild(oTitle);
        for (var i = 0; i < aAvailableMaps.length; i++) {
            var oPImg = document.createElement("img");
            oPImg.src = "media/select_" + aAvailableMaps[i] + ".png";
            oPImg.style.width = (30 * iScreenScale) + "px";
            oPImg.style.height = (12 * iScreenScale) + "px";
            oPImg.style.position = "absolute"
            oPImg.style.left = (((iWidth - 30 * aAvailableMaps.length) / 2 + i * 30 + i) * iScreenScale) + "px";
            oPImg.style.top = (14 * iScreenScale) + "px";
            oPImg.map = aAvailableMaps[i];
            
            //on click
            oPImg.onclick = function() {
                strMap = this.map;
                _self.emit("playerMapSelect", strMap);
                if (playerCount < 2)
                    _self.gotoGameStart();
            }
            oScr.appendChild(oPImg);
        }
    }
    
    this.gotoGameStart = function() {
        if (oScr) {
            oScr.innerHTML = "";
            oContainer.removeChild(oScr);
            oScr = oStatus = null;
        }
        resetGame(strMap);
    }
    
    for (var i = 0; i < aCharacters.length; i++) {
        var oImg = new Image();
        oImg.src = "media/sprite_" + aCharacters[i] + "_smooth.png";
    }
    this.setStatusMessage = function(msg) {
        if (oStatus && oStatus.firstChild)
            oStatus.firstChild.nodeValue = msg.toString();
    }
    
    selectPlayerScreen();
    
    // multiplayer logic
    this.addPlayer = function(name) {
        if (bRunning || !name || aPlayers.indexOf(name) > -1)
            return;
        aPlayers.push(name);
        if (aPlayers.length >= playerCount)
            return _self.gotoSelectMap();
        
        var imgs = oScr.getElementsByTagName("img");
        for (var i = 1, l = imgs.length; i < l; ++i) {
            if (imgs[i].player == name) {
                imgs[i].style.opacity = "0.4";
                imgs[i].onclick = null;
            }
        }
        
        // set status message
        var oldVal = oStatus.firstChild.nodeValue;
        if (name == strPlayer) {
            _self.setStatusMessage("Please wait for another player to join...");
        }
        else {
            _self.setStatusMessage(name + " joined the game!");
            setTimeout(function() {
                _self.setStatusMessage(oldVal);
            }, 2000);
        }
    };
    
    this.setMap = function(map) {
        if (bRunning)
            return;
        strMap = map;
    };
    
    this.movePlayer = function(player, data) {
        if (!bRunning || !aKarts.length)
            return;
        for (var i = 0, l = aKarts.length; i < l; ++i) {
            if (aKarts[i].player != player)
                continue;
            for (var j in data)
                aKarts[i][j] = data[j];
        }
    };
    
    this.setPlayerCount = function(num) {
        if (bRunning)
            return;
        playerCount = parseInt(num);
        _self.emit("playerCountChange", playerCount);
    };
    
    this.getPlayerCount = function() {
        return playerCount;
    };
    
    this.reset = function() {
        if (!bRunning)
            return;
        document.location.href = document.location.href;
    };
    
    // event handling code:
    this.events = {};

    this.on = function(name, fn){
        if (!(name in this.events))
            this.events[name] = [];
        this.events[name].push(fn);
        return this;
    };
    
    this.once = function(name, fn){
        var self = this,
            once = function(){
                self.removeEvent(name, once);
                fn.apply(self, arguments);
            };
        once.ref = fn;
        self.on(name, once);
        return this;
    };

    this.emit = function(name, args){
        if (name in this.events){
            var events = this.events[name];
            for (var i = 0, ii = events.length; i < ii; i++)
                events[i].apply(this, isArray(args) ? args : [args]);
        }
        return this;
    };

    this.removeEvent = function(name, fn){
        if (name in this.events){
            for (var a = 0, l = this.events[name].length; a < l; a++)
                if (this.events[name][a] == fn || this.events[name][a].ref && this.events[name][a].ref == fn)
                    this.events[name].splice(a, 1);    
        }
        return this;
    };
}

var isArray = Array.isArray || function(arr) {
    return arr && Object.prototype.toString.call(arr) === "[object Array]";
};

// browser detection:
var sAgent = navigator.userAgent.toLowerCase() || "",
    // 1->IE, 0->FF, 2->GCrome, 3->Safari, 4->Opera, 5->Konqueror 
    b      = (typeof/./)[0]=='f'?+'1\0'?3:2:+'1\0'?5:1-'\0'?1:+{valueOf:function(x){return!x}}?4:0;
if((typeof/./)[0]=='f' && parseFloat((sAgent.match(/(?:firefox|minefield)\/([\d\.]+)/i) || {})[1]) <= 2)
    b = 0;
if (b == 2 && sAgent.indexOf("chrome") == -1) 
    b = 3;

var isOpera       = b===4 || b===5;
var isKonqueror   = b===5;
var isSafari      = b===3;
var isIphone      = sAgent.indexOf("iphone") != -1 || sAgent.indexOf("aspen simulator") != -1;
var isChrome      = b===2;
var isWebkit      = isSafari || isChrome || isKonqueror;
var isGecko       = b===0;
var isIE          = b===1;

// DOMReady implementation
var load_events = [],
    load_timer  = null,
    load_done   = false,
    load_init   = null;

function execDeferred() {
    // execute each function in the stack in the order they were added
    var len = load_events.length;
    while (len--)
        (load_events.shift())();
}

function onDomReady(func) {
    //if (!this.$bdetect)
    //    this.browserDetect();

    if (load_done)
        return func();

    // create event function stack
    //apf.done = arguments.callee.done;
    if (!load_init) {
        load_init = function() {
            if (load_done) return;
            // kill the timer
            clearInterval(load_timer);
            load_timer = null;
            load_done  = true;
            execDeferred();
        };
    }

    load_events.push(func);

    if (func && load_events.length == 1) {
        // Catch cases where addDomLoadEvent() is called after the browser
        // event has already occurred.
        var doc = document, UNDEF = "undefined";
        if ((typeof doc.readyState != UNDEF && doc.readyState == "complete")
          || (doc.getElementsByTagName("body")[0] || doc.body))
            return load_init();

        // for Mozilla/Opera9.
        // Mozilla, Opera (see further below for it) and webkit nightlies
        // currently support this event
        if (doc.addEventListener && !isOpera) {
            // We're using "window" and not "document" here, because it results
            // in a memory leak, especially in FF 1.5:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=241518
            // See also:
            // http://bitstructures.com/2007/11/javascript-method-callbacks
            // http://www-128.ibm.com/developerworks/web/library/wa-memleak/
            window.addEventListener("DOMContentLoaded", load_init, false);
        }
        // If IE is used and is not in a frame
        else if (isIE && window == top) {
            load_timer = setInterval(function() {
                try {
                    // If IE is used, use the trick by Diego Perini
                    // http://javascript.nwbox.com/IEContentLoaded/
                    doc.documentElement.doScroll("left");
                }
                catch(ex) {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                // no exceptions anymore, so we can call the init!
                load_init();
            }, 10);
        }
        else if (isOpera) {
            doc.addEventListener("DOMContentLoaded", function() {
                load_timer = setInterval(function() {
                    for (var i = 0, l = doc.styleSheets.length; i < l; i++) {
                        if (doc.styleSheets[i].disabled)
                            return;
                    }
                    // all is fine, so we can call the init!
                    load_init();
                }, 10);
            }, false);
        }
        else if (isWebkit && !isIphone) {
            var aSheets = doc.getElementsByTagName("link"),
                i       = aSheets.length,
                iSheets;
            for (; i >= 0; i++) {
                if (!aSheets[i] || aSheets[i].getAttribute("rel") != "stylesheet")
                    aSheets.splice(i, 0);
            }
            iSheets = aSheets.length;
            load_timer  = setInterval(function() {
                if (/loaded|complete/.test(doc.readyState)
                  && doc.styleSheets.length == iSheets)
                    load_init(); // call the onload handler
            }, 10);
        }
        // for other browsers set the window.onload, but also execute the
        // old window.onload
        else {
            var old_onload = window.onload;
            window.onload  = function () {
                load_init();
                if (old_onload)
                    old_onload();
            };
        }
    }
}

exports.onDomReady = onDomReady;

onDomReady(function() {
    exports.MarioKart = new MarioKart();
});

})(self);