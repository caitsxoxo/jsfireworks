const SHELLTYPES = ['simple', 'split', 'burst', 'double', 
                    'mega', 'writer', 'pent', 'comet'];
const GRAVITY = 0.2;

var shells = []; 
var stars  = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
}
function draw() {
    shells = shells.filter(shell => !shell.exploded);
    stars = stars.filter(star => star.brt > 0);

    for (let shell of shells) 
        shell.draw();
    for (let star of stars) 
        star.draw();
}

class Shell {
    constructor(position, speed, type, sparkleTrail) {
        if (position == undefined)
            position = createVector(int(random(-width / 4, width / 4)), 0);
        if (speed == undefined)
            speed = createVector(random(-2, 2), -random(11, 16));
        if (sparkleTrail == undefined)
            sparkleTrail = random() < 0.5;
        if (type == undefined) {
            let randIndex = floor(random(0, SHELLTYPES.length));
            type = SHELLTYPES[randIndex];
            // type = SHELLTYPES[7];
        }
        this.position = position;
        this.speed = speed;
        this.sparkleTrail = sparkleTrail;
        this.fuse = random(-3, -1);
        this.hue = round(random(0, 360));
        this.type = type;
        this.exploded = false;
    }

    draw() {
        if (this.fuse < this.speed.y) {
            this.explode();
            return;
        }

        if (this.sparkleTrail) {
            let sparkleDir = random(0, TWO_PI);
            let sparkleVel = random(0, 1);
            let sparkleSpd = createVector(sparkleVel * cos(sparkleDir), 
                                          sparkleVel * sin(sparkleDir))
            let sparklePos = createVector(this.position.x + sparkleSpd.x, 
                                          this.position.y + sparkleSpd.y);
            let s = new Star(sparklePos, sparkleSpd, random(50, 75), 
                                floor(random(20, 40)), floor(random(0,30)));
            stars.push(s);
        }

        stroke(this.hue + round(random(-10, 10)), random(0, 20), 90);
        point(this.position.x, this.position.y);

        this.position.add(this.speed);
        this.speed.y = this.speed.y + GRAVITY;
    }

    drawStars(numStars, velMin, velMax, fadeMin, fadeMax, type, baseDir, angle) {
        for (let i = 0; i < numStars; i++) {
            let dir = random(0, TWO_PI);
            if (baseDir != undefined) 
                dir = baseDir + random(0, PI/angle);
            let vel = random(velMin, velMax);
            let starSpd = createVector(this.speed.x + vel * cos(dir), 
                                       this.speed.y + vel * sin(dir)); 
            let hue = this.hue + round(random(-10, 10));
            let sat = round(random(0, 40));
            let fade = random(fadeMin, fadeMax);
            let star = new Star(this.position.copy(), starSpd, fade, hue, sat, type);
            stars.push(star);
        }
    }

    explode() {
        if (this.type == 'split') {
            this.drawStars(30, 3, 5, 3, 8, 'writer');
            this.drawStars(10, 3, 5, 3, 6, 'sparkler');
        } else if (this.type == 'burst') {
            this.drawStars(60, 0, 6, 3, 8, 'sparkler');
        } else if (this.type == 'double') {
            this.drawStars(90, 3, 5, 2, 4);
            this.drawStars(90, 0.5, 2, 4, 6, 'writer');            
        } else if (this.type == 'mega') {
           this.drawStars(600, 0, 8, 3, 8);
        } else if (this.type == 'writer') {
            this.drawStars(100, 0, 5, 1, 3, 'writer');
        } else if (this.type == 'simple') {
            this.drawStars(100, 0, 5, 1, 3);
        } else if (this.type == 'pent') {
            let baseDir = random(0, TWO_PI);
            this.drawStars(20, 3, 5, 3, 8, 'writer', baseDir + (2/5)*PI, 6);
            this.drawStars(20, 3, 5, 3, 8, 'writer', baseDir + (4/5)*PI, 6);
            this.drawStars(20, 3, 5, 3, 8, 'writer', baseDir + (6/5)*PI, 6);
            this.drawStars(20, 3, 5, 3, 8, 'writer', baseDir + (8/5)*PI, 6);
            this.drawStars(20, 3, 5, 3, 8, 'writer', baseDir + (10/5)*PI, 6);           
        } else if (this.type == 'comet') {
            let baseDir = random(0, TWO_PI);
            this.drawStars(10, 3, 7, 3, 8, 'sparkler', baseDir + (2/3)*PI, 128);
            this.drawStars(10, 3, 7, 3, 8, 'sparkler', baseDir + (4/3)*PI, 128);
            this.drawStars(10, 3, 7, 3, 8, 'sparkler', baseDir + (6/3)*PI, 128);
            this.drawStars(200, 0, 8, 3, 8, 'writer');
        }
        this.exploded = true;
    }
}

class Star {
    constructor(position, speed, fade, hue, sat, type) {
        this.position = position;
        this.speed = speed; 
        this.fade = fade;
        this.hue = hue;
        this.sat = sat;
        this.type = (type == undefined ? "default" : type);
        this.brt = 255;
        this.burntime = 0;
    }

    draw() {
        stroke(this.hue, this.sat, this.brt);
        let newXPos = this.position.x + log(this.burntime) * 8 * this.speed.x;
        let newYPos = this.position.y + log(this.burntime) * 8 * this.speed.y 
                      + this.burntime * GRAVITY;

        point(newXPos, newYPos);

        if (this.type == "writer" && this.burntime > 1) {
            line(newXPos, newYPos, this.position.x + log(this.burntime - 2) * 8 * 
                 this.speed.x, this.position.y + log(this.burntime - 2) * 8 * 
                 this.speed.y + this.burntime * GRAVITY);
        }

        if (this.type == "sparkler") {
            let dir = random(0, TWO_PI);
            let vel = random(0, 1);
            let starSpd = createVector(vel * cos(dir), vel * sin(dir))
            let star = new Star(createVector(newXPos + starSpd.x, newYPos + starSpd.y), 
                                starSpd, random(50, 75), round(random(20, 40)), 
                                round(random(0, 30)));
            stars.push(star);
        }
        
        this.brt -= this.fade;
        this.burntime++;
    }
}


function touchMoved() {
    touchStarted();
    return false;
}

function touchStarted() {
    let speed = createVector(0, 0);
    let position = createVector(mouseX - width / 2, mouseY - height);
    let s = new Shell(position, speed);
    s.explode();
    return false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
