class Player {
    constructor(x, y, s, moveSpeed) {
        // position
        this.x = x;
        this.y = y;
        this.size = s;

        // movement related;
        this.decay = 0.85;
        this.accel = 0.1;
        this.moveSpeed = moveSpeed;
        this.xVel = 0;
        this.yVel = 0;

        // maybe make some of thise part of the constructor

        // dash variables
        this.lastDash = 0; // ms
        this.dashDelay = 1500; // ms
        this.canDash = true;
        this.dashSpeed = 120;
        this.traject = 0; // for making dash twoards mouse
        this.invincible = false;
        this.iTime = 1000; // ms
        this.iActivation = 0;

        // knockback
        this.xVelKb = 0;
        this.yVelKb = 0;
        this.kbTraject = createVector(0, 0);
        this.isKnockedBacked = false;

        // other stats
        this.backpack = new Backpack(1);
        this.backPackIdx = 0;
        this.maxHealth = 100; // make constructor setable
        this.health = new HealthBar(this.maxHealth, x, y, s);
        // make modifiable
        this.regenAmount = 1;
        this.regenDelay = 200;
        this.LastTakenDamage = 0;

        this.armor = 0;
        this.evasion = 1; // maybe change to something else
    }

    run() {
        if (this.isAlive()) {
            this.move();
            this.display();
            this.useGun();
            this.health.run(this.x, this.y);
            this.disableKnockBackStatus();
            this.regenHp()
        } else {
            this.invincible = true;
        }
    }

    regenHp() {
        if (this.maxHealth != this.health.hpGet() &&
            millis() - this.LastTakenDamage >= this.regenDelay) {
            this.LastTakenDamage = millis();
            if (this.maxHealth - this.health.hpGet() >= this.regenAmount) {
                this.healHp(this.regenAmount);
            } else {
                this.healHp(this.maxHealth - this.health.hpGet());
            }
        }
    }

    // blood overlay on screen indicating lost hp

    useGun() {
        if (mouseIsPressed === true && mouseButton === LEFT) {
            this.backpack.itemGet(this.backPackIdx).shoot(mouseX, mouseY);
        }

        if (keyIsPressed && key == "r") {
            this.backpack.itemGet(this.backPackIdx).reload();
        }

        this.backpack.itemGet(this.backPackIdx).run(this.x, this.y);
    }

    move() {
        this.dash();
        this.accelerate();

        // update position
        this.x -= this.xVelKb * this.kbTraject.x;
        this.y -= this.yVelKb * this.kbTraject.y;
        this.x += this.xVel;
        this.y += this.yVel;

        // update drag
        this.xVelKb *= this.decay;
        this.yVelKb *= this.decay;
        this.yVel *= this.decay;
        this.xVel *= this.decay;

        // keeps player in bounds and moves to / generate next room
        this.keepInBounds();
    }

    ////////////////////////////////////
    // player collids with an enemy
    // enemy.doKnockBack(amount, traject, toStun);
    // 
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //

    dash() {
        this.traject = p5.Vector.normalize(
            createVector(this.x - mouseX, this.y - mouseY)
        );
        if (millis() - this.lastDash >= this.dashDelay) {
            this.canDash = true;
        }
        if (millis() >= this.iTime + this.iActivation) {
            this.invincible = false;
        }

        if (keyIsDown(16) && this.canDash) {
            this.invincible = true;
            this.iActivation = millis();
            this.lastDash = millis();
            this.xVel -= this.traject.x * this.dashSpeed;
            this.yVel -= this.traject.y * this.dashSpeed;
            this.canDash = false;
        }
    }

    accelerate() {
        // w = 87, s = 83, a = 65, d = 68
        if (abs(this.yVel) < this.moveSpeed / 2) {
            if (keyIsDown(87)) {
                this.yVel -= this.accel * this.moveSpeed;
            }
            if (keyIsDown(83)) {
                this.yVel += this.accel * this.moveSpeed;
            }
        }
        if (abs(this.xVel) < this.moveSpeed / 2) {
            if (keyIsDown(65)) {
                this.xVel -= this.accel * this.moveSpeed;
            }
            if (keyIsDown(68)) {
                this.xVel += this.accel * this.moveSpeed;
            }
        }
    }

    disableKnockBackStatus() {
        if (abs(this.xVel) <= 0.1 && abs(this.yVel) <= 0.1) {
            this.isKnockedBacked = false;
        }
    }

    doKnockBack(amount, traject, doStun) {
        this.isKnockedBacked = doStun;
        this.kbTraject = traject;
        this.xVelKb += amount;
        this.yVelKb += amount;
    }

    // checks if player is within the frame of the door
    // additionally it halts player movement if they are trying
    // to go out of bounds
    // it also teleports the player to the correct location
    // depending on which door it went through
    goneThroughDoor(door, dir) {
        let bool = false;
        if (dir === 0 || dir === 1) {
            bool =
                door &&
                !door.isLocked() &&
                door.yStartGet() < this.y &&
                door.yEndGet() > this.y;
            this.x = bool ? (dir === 0 ? width : 0) : this.x;
        } else if (dir === 2 || dir === 3) {
            bool =
                door &&
                !door.isLocked() &&
                door.xStartGet() < this.x &&
                door.xEndGet() > this.x;
            this.y = bool ? (dir === 2 ? height : 0) : this.y;
        }
        return bool;
    }

    keepInBounds() {
        // direction the player is trying to go out of bounds
        let dir = this.detectOUBDir();
        // doors for the current room
        let doors = currentRoom.doors;
        let door;
        if (dir != -1) {
            door = doors[dir];
            // makes sure player can only go through specified doors
            if (this.goneThroughDoor(door, dir)) {
                bullets = bullets.splice(bullets.length); // deletes all active bullets 
                if (currentRoom.rooms[dir] == -1) {
                    // no room accosiated
                    Room.createAndGoToNextRoom(
                        dir,
                        random(0, 255),
                        random(0, 255),
                        random(0, 255)
                    );
                } else {
                    // goes to associated room
                    currentRoom = rooms[currentRoom.rooms[dir]];
                }
            }
        }

        // constrains the players movement to the defined canvas;
        this.y = constrain(this.y, 1, height - 1);
        this.x = constrain(this.x, 1, width - 1);
    }

    detectOUBDir() {
        return this.x < 0
            ? 0
            : this.x > width
                ? 1
                : this.y < 0
                    ? 2
                    : this.y > height
                        ? 3
                        : -1;
    }

    xGet() {
        return this.x;
    }

    yGet() {
        return this.y;
    }

    xVelGet() {
        return this.xVel;
    }

    yVelGet() {
        return this.yVel;
    }

    xUpdate(x) {
        if (!this.invincible) {
            this.x += x;
        }
    }

    yUpdate(y) {
        if (!this.invincible) {
            this.y += y;
        }
    }

    xVelUpdate(xVel) {
        if (!this.invincible) {
            this.xVel += xVel;
        }
    }

    yVelUpdate(yVel) {
        if (!this.invincible) {
            this.yVel += yVel;
        }
    }

    trajectUpdate(traject) {
        this.traject = traject;
    }

    sizeGet() {
        return this.size;
    }

    BPCapacityGet() {
        return this.backpack.capacity();
    }

    addItemToBackPack(item) {
        this.backpack.addItem(item);
    }

    setGun(gun, idx) {
        this.backpack.slotSet(gun, idx);
    }

    isMoving() {
        return abs(this.xVel) > 1 || abs(this.yVel) > 1 || abs(this.xVelKb) > 1 || abs(this.yVelKb) > 1;
    }

    isAlive() {
        return this.health.hpGet() > 0;
    }

    lossHp(amount) {
        if (!this.invincible && random(0, 1) > this.evasion / 100 &&
            this.isAlive()) {
            this.health.addHp(-amount * (1 - this.armor / 100));
            this.LastTakenDamage = millis();
        }
    }

    healHp(amount) {
        this.health.addHp(amount);
    }

    getHealth() {
        return this.health.hpGet();
    }

    setHealth(hp) {
        this.health.hpSet(hp);
    }

    getTargetX() {
        return mouseX;
    }

    getTargetY() {
        return mouseY;
    }

    display() {
        push();
        rectMode(CENTER);
        fill(255);
        square(this.x, this.y, this.size);
        pop();
    }
}