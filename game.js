var Game = function(){
    var twoPi = Math.PI * 2;
    var raycaster = {
        init: function(){
            this.maxDistance = Math.sqrt(minimap.cellsAcross * minimap.cellsAcross + minimap.cellsDown * minimap.cellsDown);
            var numberOfRays = 300;
            var angleBetweenRays = .2 * Math.PI / 180;
            this.castRays = function(){
                foregroundSlivers = [];
                backgroundSlivers = [];
                minimap.rays = [];
                dino.show = false;
                for(var i=0;i<numberOfRays;i++){
                    var rayNumber = -numberOfRays/2 + i;
                    var rayAngle = angleBetweenRays * rayNumber + player.angle;
                    this.castRay(rayAngle, i);
                } // end for
            } // end castRays function
            this.castRay = function(rayAngle, i){
                rayAngle %= twoPi;
                if(rayAngle < 0) rayAngle += twoPi;
                    var right = (rayAngle > twoPi * 0.75 || rayAngle < twoPi * 0.25);
                    var up = rayAngle > Math.PI;
                    var slope = Math.tan(rayAngle);
                    var distance = 0;
                    var xHit = 0;
                    var yHit = 0;
                    var wallX;
                    var wallY;
                    var dX = right ? 1 : -1;
                    var dY = dX * slope;
                    var x = right ? Math.ceil(player.x) : Math.floor(player.x);
                    var y = player.y + (x - player.x) * slope;
                    var wallType;
                        while (x >= 0 && x < minimap.cellsAcross && y >= 0 && y < minimap.cellsDown){
                            wallX = Math.floor(x + (right ? 0 : -1));
                            wallY = Math.floor(y);
                            if (map[wallY][wallX] > -1) {
                                var distanceX = x - player.x;
                                var distanceY = y - player.y;
                                distance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                                xHit = x;
                                yHit = y; 
                                wallType = map[wallY][wallX];
                                break;
                            } else{ // end if
                                if(dino.x === wallX && dino.y === wallY){
                                    dino.show = true;
                                }; // end if
                            } // endelse
                            x += dX;
                            y += dY;
                        } // end while
                        slope = 1/slope;
                        dY = up ? -1 : 1;
                        dX = dY * slope;
                        y = up ? Math.floor(player.y) : Math.ceil(player.y);
                        x = player.x + (y - player.y) * slope;
                        while (x >= 0 && x < minimap.cellsAcross && y >= 0 && y < minimap.cellsDown){
                            wallY = Math.floor(y + (up ? -1 : 0));
                            wallX = Math.floor(x);
                            if (map[wallY][wallX] > -1){
                                var distanceX = x - player.x;
                                var distanceY = y - player.y;
                                var blockDistance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
                                if (!distance || blockDistance < distance){
                                    distance = blockDistance;
                                    xHit = x;
                                    yHit = y;
                                    wallType = map[wallY][wallX];
                                }// end if
                                break;
                            }else{  //end if
                                if(dino.x === wallX && dino.y === wallY){
                                    dino.show = true;
                                }; // end if
                            } // end else
                        x += dX;
                        y += dY;
                        } // end while
                        if(dino.show === true){
                            var dinoDistanceX = dino.x + .5 - player.x;
                            var dinoDistanceY = dino.y + .5 - player.y;
                            dino.angle = Math.atan(dinoDistanceY/dinoDistanceX) - player.angle;
                            dino.distance = Math.sqrt(dinoDistanceX*dinoDistanceX + dinoDistanceY * dinoDistanceY);
                        };  // end if
                        minimap.rays.push([xHit, yHit]);
                        var adjustedDistance = Math.cos(rayAngle - player.angle) * distance;
                        var wallHalfHeight = canvas.height / adjustedDistance / 2;
                        var wallTop = Math.max(0, canvas.halfHeight - wallHalfHeight);
                        var wallBottom = Math.min(canvas.height, canvas.halfHeight + wallHalfHeight);
                        var percentageDistance = adjustedDistance / this.maxDistance;
                        var brightness = 1 - percentageDistance;
                        var shade = Math.floor(palette.shades * brightness);
                        var color = palette.walls[wallType][shade];
                        if(adjustedDistance < dino.distance){
                            foregroundSlivers.push([i, wallTop, wallBottom, color]);
                        }else { // end if
                            backgroundSlivers.push([i, wallTop, wallBottom, color]);
                        }; // end else
            } // function
        } // end init function
    } // end raycaster
    var player = {
        init: function(){
            this.x = 14;
            this.y = 14;
            this.direction = 0;
            this.angle = 4.5;
            this.speed = 0;
            this.movementSpeed = 0.1;
            this.turnSpeed = 4 * Math.PI / 180;
            this.move = function(){
                var moveStep = this.speed * this.movementSpeed;
                this.angle += this.direction * this.turnSpeed;
                var newX = this.x + Math.cos(this.angle) * moveStep;
                var newY = this.y + Math.sin(this.angle) * moveStep;
                if(!containsBlock(newX, newY)){
                    this.x = newX;
                    this.y = newY;
                };
            };
            this.draw = function(){
                var playerXOnMinimap = this.x * minimap.cellWidth;
                var playerYOnMinimap = this.y * minimap.cellHeight;
                minimap.context.fillStyle = "#000000";
                minimap.context.beginPath();
                minimap.context.arc(minimap.cellWidth*this.x, minimap.cellHeight*this.y, minimap.cellWidth/2, 0, 2*Math.PI, true);
                minimap.context.fill();
                var projectedX = this.x + Math.cos(this.angle);
                var projectedY = this.y + Math.sin(this.angle);
                minimap.context.fillRect(minimap.cellWidth*projectedX - minimap.cellWidth/4, minimap.cellHeight*projectedY - minimap.cellHeight/4, minimap.cellWidth/2, minimap.cellHeight/2);
            };
        }
    } // end player
    function containsBlock(x,y){
        return(map[Math.floor(y)][Math.floor(x)] !== -1);
    }; // end containsBlock
    var map = [ 
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], 
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1], 
        [1,-1,-1,-1,2,2,-1,2,-1,2,-1,-1,2,-1,-1,1], 
        [1,-1,-1,-1,-1,2,-1,2,-1,2,-1,-1,2,2,-1,1], 
        [1,-1,2,-1,-1,-1,-1,2,-1,-1,-1,2,2,-1,-1,1], 
        [1,-1,2,2,-1,2,-1,2,-1,2,-1,2,-1,-1,-1,1], 
        [1,-1,-1,-1,-1,2,2,2,-1,2,-1,-1,-1,-1,-1,1], 
        [1,-1,2,2,2,2,-1,-1,2,2,2,-1,2,2,-1,1], 
        [1,-1,2,-1,-1,-1,-1,-1,-1,2,-1,-1,2,-1,-1,1], 
        [1,-1,2,-1,2,2,2,-1,-1,-1,-1,-1,2,-1,-1,1], 
        [1,-1,-1,-1,-1,-1,-1,2,-1,-1,2,2,2,2,-1 ,1], 
        [1,-1,2,2,2,-1,-1,-1,2,-1,-1,-1,-1,-1,-1,1], 
        [1,-1,-1,2,-1,-1,-1,-1,-1,2,-1,-1,2,-1,-1,1], 
        [1,-1,-1,-1,-1,2,2,2,2,2,-1,-1,2,-1,-1,1], 
        [1,-1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,-1,-1,1], 
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]; // end map
    var minimap = {
        init: function(){
            this.element = document.getElementById('minimap');
            this.context = this.element.getContext("2d");
            this.element.width = 300;
            this.element.height = 300;
            this.width = this.element.width;
            this.height = this.element.height;
            this.cellsAcross = map[0].length;
            this.cellsDown = map.length;
            this.cellWidth = this.width/this.cellsAcross;
            this.cellHeight = this.height/this.cellsDown;
            this.colors = ["#ffff00", "#ff00ff", "#00ffff", "#0000ff"];
            this.draw = function(){
                for(var y = 0; y < this.cellsDown; y++){
                    for(var x = 0; x < this.cellsAcross; x++){
                        var cell = map[y][x];
                        if(cell ===-1){
                            this.context.fillStyle = "#ffffff"
                        }else{ // end if
                            this.context.fillStyle = this.colors[map[y][x]];
                        }; // end else
                        this.context.fillRect(this.cellWidth*x, this.cellHeight*y, this.cellWidth, this.cellHeight);
                    }; // end xfor  -origends  
                }; // end for
                for(var i = 0; i< this.rays.length; i++){
                    this.drawRay(this.rays[i][0], this.rays[i][1])
                } // end for
            }; // end this draw function
            this.drawRay = function(xHit, yHit){
                this.context.beginPath();
                this.context.moveTo(this.cellWidth*player.x, this.cellHeight*player.y);
                this.context.lineTo(xHit * this.cellWidth, yHit * this.cellHeight);
                this.context.closePath();
                this.context.stroke();
            }; // end draw ray function
        } // end init 
    }; //end minimap
    var canvas = {
        init: function(){
            this.element = document.getElementById('canvas');
            this.context = this.element.getContext("2d");
            this.width = this.element.width;
            this.height = this.element.height;
            this.halfHeight = this.height/2;
            this.blank = function(){
                this.context.clearRect(0, 0, this.width, this.height);
                this.context.fillStyle = palette.sky;
                this.context.fillRect(0, 0, this.width, this.halfHeight);
                this.context.fillStyle = palette.ground;
                this.context.fillRect(0, this.halfHeight, this.width, this.height);
            } // end blank function
            this.drawSliver = function(sliver, wallTop, wallBottom, color){
                this.context.beginPath();
                this.context.strokeStyle = color;
                this.context.moveTo(sliver + .5, wallTop);
                this.context.lineTo(sliver + .5, wallBottom);
                this.context.closePath();
                this.context.stroke();
            } // end drawsliver function
        } // end init function
    }; // end canvas
    var camera = {
        init: function(){
            this.context = document.getElementById('screenshot').getContext('2d');
            var filtered = false;
            var f;
            $("#screenshot").on("click", function(){
                if(filtered){
                    filtered = false;
                    f.reset().render();
                }else{              //if
                    filtered = true;
                    f = Filtrr2("#screenshot", function(){
                        //this.expose(50)
                        this.sepia()
                        .render();  
                    }, {store: false});         //sc function
                }; // end else
            });// end on click
            this.takePicture = function(){
                var image = new Image();
                image.src = canvas.element.toDataURL('image/png');
                image.onload = function(){
                    camera.context.drawImage(image, 0, 0);
                }  // onload function
                filtered = false;
            } // pic fucntion
        } // end init 
    }; // end camera
    var palette = {
        init: function(){
            this.ground = '#403c17';
            this.sky = '#28bdbf';
            this.shades = 300;
            var initialWallColors = [ [85, 68, 102],
                                      [163, 166, 168],
                                      [55, 25, 64],
                                      [118, 204, 159] ];
            this.walls = [];
            for(var i = 0; i < initialWallColors.length; i++){
                this.walls[i] = [];
                for(var j = 0; j < this.shades; j++){
                    var red = Math.round(initialWallColors[i][0] * j / this.shades);
                    var green = Math.round(initialWallColors[i][1] * j / this.shades);
                    var blue = Math.round(initialWallColors[i][2] * j / this.shades);
                    var color = "rgb("+red+", "+green+", "+blue+")";
                    this.walls[i].push(color);
                }; // end for
            };  // end for
        } // init
    } // end palette
    var dino = {
        init: function(){
            this.sprite = new jaws.Sprite({image: "dino.png", x: 0, y: canvas.height/2, anchor: "center"});
            this.x = 2;
            this.y = 2;
            this.show = false;
            this.distance = 10000;
            this.draw = function(){
                this.scale = raycaster.maxDistance / dino.distance / 2;
                this.sprite.scaleTo(this.scale);
                this.angle %= twoPi;
                if (this.angle < 0) this.angle += twoPi;
                this.angleInDegrees = this.angle * 180 / Math.PI;
                var potentialWidth = 300*.2;
                var halfAngularWidth = potentialWidth/2;
                this.adjustedAngle = this.angleInDegrees + halfAngularWidth;
                if (this.adjustedAngle > 180 || this.adjustedAngle < -180){
                    this.adjustedAngle %= 180;
                }; // end if
                this.sprite.x = this.adjustedAngle/potentialWidth*canvas.width;
                this.sprite.draw();
            }; // end draw function
        } // end init
    }; // end dino
    this.draw = function(){
        minimap.draw();
        player.draw();
        canvas.blank();
        for(var i = 0; i < backgroundSlivers.length; i++){
            canvas.drawSliver.apply(canvas, backgroundSlivers[i]);
        }; // end for
        if (dino.show){
            dino.draw();
        };
        for(var i = 0; i < foregroundSlivers.length; i++){
            canvas.drawSliver.apply(canvas, foregroundSlivers[i]);
        }; // end for
    }; // end drawfunction
    this.setup = function(){
        camera.init();
        minimap.init();
        player.init();
        raycaster.init();
        canvas.init();
        palette.init();
        dino.init();
    };// end setupfunction
    this.update = function(){
        raycaster.castRays();
        if(jaws.pressed("left")) { player.direction = -1 };
        if(jaws.pressed("right")) { player.direction = 1 };
        if(jaws.pressed("up")) { player.speed = 1 };
        if(jaws.pressed("down")) { player.speed = -1 };

        if(jaws.on_keyup(["left", "right"], function(){
            player.direction = 0;
        }));
        if(jaws.on_keyup(["up", "down"], function(){
            player.speed = 0;
        }));
        if(jaws.pressed("space")){
            camera.takePicture();
        };
        player.move();
    }; //end updatefunction
} //this is the end of the file