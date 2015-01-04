/**
Hintergrund Animation für meine private Homepage wolfgangpfeiffer.de 
@author Wolfgang Pfeiffer (Lupo72)
@version 1.2 - stable

** References used:
* http://stackoverflow.com/questions/9300590/html5-coordinates-of-a-scaled-canvas-element
*/

(function() {
    
    var CANV_WIDTH = 640;
    var CANV_HEIGHT = 480;

    function isEmpty(param) {
        return (param === null || param === undefined || param === "NaN");
    };

    Modernizr.load();
    window.reqAnimFrame = Modernizr.prefixed('requestAnimationFrame', window) || function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };

    var BaseSprite = function() {
        this.ctx = document.getElementById('myCanvas').getContext('2d');
        this.x = 0;
        this.y = 0;
        this.moveIndex = 0;
        this.nextAnimationCycle  = 0;
        this.moveTime  = 60;
        this.idleTime  = 2000;
        this.timesPaused = 0;
        this.sheet     = [];
        this.startSpeed = 4;
    };

    var Maus = {};

    /** SkeletonSprite
     * @param name String
     * @param idx Int
     * @param moveTime Int
     * @param idleTime Int
     * */
    var SkeletonSprite = function(name, idx, moveTime, idleTime) 
    {
        this.name = name;
        this.index = idx;
        this.autoplay = true;
        this.localstorage = [];
        this.beingDragged = false;
        this.moveDirectionX = 4;
        this.moveDirectionY = 4;
        this.moveTime = moveTime;
        this.idleTime = idleTime;
        this.ignoreMouse = false;
        var self = this;

        this.sheet[0] = [
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 3, 1, 3, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 0, 0],
            [1, 0, 1, 2, 1, 0, 1, 0],
            [0, 0, 0, 1, 0, 0, 0, 0],
            [0, 1, 1, 0, 1, 1, 0, 0]];
        this.sheet[1] = [
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 3, 1, 3, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 0],
            [1, 0, 1, 2, 1, 0, 0, 0],
            [0, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 0, 0]];
        this.sheet[2] = [
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 3, 1, 3, 1, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 1, 2, 1, 0, 1, 0],
            [0, 0, 0, 1, 1, 1, 0, 0],
            [0, 1, 1, 0, 0, 0, 0, 0]];
        
        /** lets sprite move towards mouse pointer - pause sprite a couple of seconds when mouseposition is reached */
        this.walkToMouse = function() 
        {
            if (self.ignoreMouse) {
                return;
            }
            var x = self.x, y = self.y;
            var abstand = Math.floor(Math.random() * 16) + 1;
            self.moveDirectionX = x < Math.round(Maus.x) ? self.startSpeed : -self.startSpeed;
            self.moveDirectionY = y < Math.round(Maus.y) ? self.startSpeed : -self.startSpeed;
            if ( y > (Maus.y - abstand)  && y <  (Maus.y + abstand) && x > (Maus.x - abstand)  && x <  (Maus.x + abstand) ) {
                self.moveDirectionX = 0;
                self.moveDirectionY = 0;
                
                self.timesPaused += 1;
                
                if (self.timesPaused < 2) {
                    self.pause();    
                } else {
                    self.ignoreMouse = true;
                    self.moveDirectionX = Math.random() * 1 < .5 ? -self.startSpeed : self.startSpeed; 
                    self.moveDirectionY = Math.random() * 1 < .5 ? -self.startSpeed : self.startSpeed; 
                }
            }
        }; 
        // END Method walkToMouse

        /** (auto) move sprite */
        this.autoMove = function() 
        {
            var x = self.x, y = self.y;
            var D = new Date();

            // Sprite is waiting ...
            if ( self.autoplay && self.moveDirectionX === 0 && self.moveDirectionY === 0 ) {
                self.clearCanvasPos();
                self.drawIdle();
            }

            if (self.nextAnimationCycle < D.getTime()) {
                self.nextAnimationCycle = D.getTime() + self.moveTime;
                
                if ( !isEmpty(Maus.x)  && !isEmpty(Maus.y) ) {
                    self.walkToMouse();
                }

                x += self.moveDirectionX;
                y += self.moveDirectionY;

                if (self.x !== x || self.y !== y) {
                    self.clearCanvasPos();
                    self.x = x;
                    self.y = y;
                    self.draw();
                }
                self.checkBounds();
            } 
            window.reqAnimFrame(skeletons[self.index].autoMove);
        }; 
        // END autoMove method

        /** clear / overpaint Sprites old position */
        this.clearCanvasPos = function() 
        {
            var stepX = 2;
            var stepY = 4;
            var width = 3;
            var height = 4;
            
            var moveIdx = self.moveIndex > 0 ? self.moveIndex - 1 : self.sheet.length - 1;
            
            for (var indexY = 0; indexY < stepY * 9; indexY += stepY) {
                for (var indexX = 0; indexX < stepX * 8; indexX += stepX) {
                    if (self.sheet[moveIdx][indexY / stepY][indexX / stepX] !== 0) {
                        self.ctx.fillStyle = 'rgb(255,255,255)';
                        self.ctx.fillRect(indexX + self.x, indexY + self.y, width, height);
                    }
                }
            }            
        };

        /** keep sprite in canvas dimensions */
        this.checkBounds = function() 
        {
            if (self.x < -32 ) {
                self.x = -32;
                this.x = self.x;
                self.moveDirectionX = -self.moveDirectionX;
                return;
            }
            
            if (self.x > CANV_WIDTH ) {
                self.x = CANV_WIDTH;
                this.x = self.x;
                self.moveDirectionX = -self.moveDirectionX;
                return;
            }
            
            if (self.y < -32 ) {
                self.y = -32;
                this.y = self.y;
                self.moveDirectionY = -self.moveDirectionY;
                return;
            }
            
            if (self.y > CANV_HEIGHT ) {
                self.y = CANV_HEIGHT;
                this.y = self.y;
                self.moveDirectionY = -self.moveDirectionY;
                return;
            }
        };
        /** draws sprite while moving */
        this.draw = function() 
        {
            var stepX = 2;
            var stepY = 4;
            var width = 3;
            var height = 4;
            for (var indexY = 0; indexY < stepY * 9; indexY += stepY) {
                for (var indexX = 0; indexX < stepX * 8; indexX += stepX) {
                    if (self.sheet[self.moveIndex][indexY / stepY][indexX / stepX] !== 0) {
                        var color = this.getColor(self.sheet[self.moveIndex][indexY / stepY][indexX / stepX]);
                        self.ctx.fillStyle = color;
                        self.ctx.fillRect(indexX + self.x, indexY + self.y, width, height);
                    }
                }
            }
            self.moveIndex += 1;
            if (self.moveIndex > self.sheet.length - 1) {
                self.moveIndex = 0;
            }
            // saving Position in localStorage
            if (Modernizr.localstorage) {
                localStorage.setItem(self.name + '_X', self.x);
                localStorage.setItem(self.name + '_Y', self.y);
            }
        };
        
        /** draws sprite while standing */
        this.drawIdle = function() 
        {
            var stepX = 2;
            var stepY = 4;
            var width = 3;
            var height = 4;
            var moveIdx = self.moveIndex > 0 ? self.moveIndex - 1 : self.sheet.length - 1;
            for (var indexY = 0; indexY < stepY * 9; indexY += stepY) {
                for (var indexX = 0; indexX < stepX * 8; indexX += stepX) {
                    if (self.sheet[moveIdx][indexY / stepY][indexX / stepX] !== 0) {
                        var color = this.getColor(self.sheet[self.moveIndex][indexY / stepY][indexX / stepX]);
                        self.ctx.fillStyle = color;
                        self.ctx.fillRect(indexX + self.x, indexY + self.y, width, height);
                    }
                }
            }
        };

        /**get color from val in spritesheet array at x,y */
        this.getColor = function(param) 
        {
            switch (param) {
                // lightgrey - body
                case 1:
                    switch(self.index){
                        case 1:
                            return "rgb(50,120,80)";
                            break;
                        case 2:
                            return "rgb(130,30,30)";
                            break;
                        case 3:
                            return "rgb(30,30,130)";
                            break;
                        default:
                            return "rgb(150,150,150)";
                            
                            
                    }
                    break;
                // darkgrey - ribs
                case 2:
                    switch(self.index) {
                        case 1:
                            return "rgb(70,150,100)";
                            break;
                        case 2:
                            return "rgb(150,50,50)";
                            break;
                        case 3:
                            return "rgb(60,60,150)";
                            break;
                        default:
                            return "rgb(175,175,175)";
                    }
                    break;
                // yellow - eyes
                case 3:
                    return "rgb(255,175,0)";
                    break;
            }
        };
        
        /** get Sprites stored position from localStorage */
        this.getStoredPosition = function() 
        {
            if (Modernizr.localstorage) {
                this.localstorage[this.name + '_X'] = localStorage.getItem(this.name + '_X');
                this.localstorage[this.name + '_Y'] = localStorage.getItem(this.name + '_Y');
            }
        };

        /** init Sprites position */
        this.initPosition = function(ox,oy) 
        {
            this.getStoredPosition();

            if (isEmpty(this.localstorage[this.name + '_X'])) {
                this.x = parseInt(ox);
            } else {
                this.x = parseInt(this.localstorage[this.name + '_X']);
            }
            if (isEmpty(this.localstorage[this.name + '_Y'])) {
                this.y = parseInt(oy);
            } else {
                this.y = parseInt(this.localstorage[this.name + '_Y']);
            }

        };

        /** pause Sprite */
        this.pause = function() 
        {
            this.clearCanvasPos();
            this.moveIndex = 0;
            this.draw();
            this.autoplay = true;
            this.nextAnimationCycle = new Date().getTime() + this.idleTime;
        };
        
    SkeletonSprite.prototype = new BaseSprite();
    
    $('html').bind('mousemove', function(evt) 
    {
        for(var idx=0;idx<skeletons.length;idx++) {
            skeletons[idx].ignoreMouse = false;
            skeletons[idx].timesPaused = 0;
        }
        var x = (evt.clientX / $('#myCanvas').width()) * CANV_WIDTH;
        var y = (evt.clientY / $('#myCanvas').height()) * CANV_HEIGHT;
        Maus.x = Math.floor(x);
        Maus.y = Math.floor(y);
    });
    
    $('#myCanvas').bind('mouseleave', function(evt) 
    {
        var x = (evt.clientX / $('#myCanvas').width()) * CANV_WIDTH;
        var y = (evt.clientY / $('#myCanvas').height()) * CANV_HEIGHT;
        Maus.x = null;
        Maus.y = null;
    });
    
    var skeletons = [];

    function init() 
    {
        skeletons[0] = new SkeletonSprite('Inky1', 0, 60, 4000);
        skeletons[1] = new SkeletonSprite('Clyde', 1, 50, 6000);
        skeletons[2] = new SkeletonSprite('Pinky', 2, 70, 8500);
        skeletons[3] = new SkeletonSprite('Brain', 3, 65, 7500);
    }
    
    function autoplay() 
    {
        for (var i=0; i<skeletons.length; i++) {
            var ox = Math.floor(Math.random() * CANV_WIDTH) + 1;
            skeletons[i].initPosition(ox, 30);
            window.reqAnimFrame(skeletons[i].autoMove);
        }
    }

    init();
    autoplay();

})();

