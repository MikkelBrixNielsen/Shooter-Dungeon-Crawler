class Enemy {
    constructor(x, y, s, hp, ms, d, r, atkSpeed, v, a, arr, ev) {
        this.x = x;
        this.y = y;
        this.size = s;
        this.health = new HealthBar(hp, x, y, s);
        this.moveSpeed = ms;
        this.damage = d;
        this.range = r;
        this.vision = v
        this.accel = a;
        this.armor = arr;
        this.evasion = ev
        this.atkSpeed = 1000 / atkSpeed;
        this.lastAttack = 0;
        this.xVel = 0;
        this.yVel = 0;
        this.decay = 0.85;
        this.lastDirectionChange = 0;
        this.directionChangeDelay = 1000 + random(-100, 100);
        this.traject = createVector(0, 0);
        this.waited = 2;
        this.weapon = null;
        this.isKnockedBacked = false;
        this.xVelKb = 0;
        this.yVelKb = 0;
        this.kbTraject = createVector(0, 0);
        this.target = myPlayer
    }

    run() {
        if (this.isAlive()) {
            this.display();
            this.health.run(this.x, this.y);
            this.disableKnockBackStatus();
            this.move();
            //if (!this.isStunned) {
            this.attack(this.target);
            //}
        } else {
            this.deleteEnemies();
        }
    }

    move() {
        // constrains enemy movement to the visible screen
        this.y = constrain(this.y, this.size / 2, height - this.size / 2);
        this.x = constrain(this.x, this.size / 2, width - this.size / 2);

        // direction to move 
        if (!this.isKnockedBacked) {
            this.updateMoveDirection();
        }
        this.changeDirectionIfToCloseToWall();

        // update position
        this.x -= this.xVelKb * this.kbTraject.x;
        this.y -= this.yVelKb * this.kbTraject.y;
        this.x -= this.xVel * this.traject.x;
        this.y -= this.yVel * this.traject.y;

        // update drag
        this.xVelKb *= this.decay;
        this.yVelKb *= this.decay;
        this.yVel *= this.decay;
        this.xVel *= this.decay;
    }

    changeDirectionIfToCloseToWall() {
        let off = 5;
        let angle = atan2(this.traject.x, this.traject.y);
        if (angle >= 0 && angle <= 90) {
            // hits roof 
            if (this.y <= this.size / 2 + off) {
                this.turnCounterClockWise()
            }
            // left side 
            if (this.x <= this.size / 2 + off) {
                this.turnClockWise()
            }
        } else if (angle > 90 && angle <= 180) {
            // left side 
            if (this.x <= this.size / 2 + off) {
                this.turnCounterClockWise()
            }
            // hits floor
            if (this.y >= height - this.size / 2 - off) {
                this.turnClockWise()
            }
        } else if (angle > -180 && angle <= -90) {
            // right side
            if (this.x >= width - this.size / 2 - off) {
                this.turnClockWise();
            }
            // hits floor
            if (this.y >= height - this.size / 2 - off) {
                this.turnCounterClockWise()
            }
        } else { // if (angle >= -90 && angle <= 0) {
            // hits roof 
            if (this.y <= this.size / 2 + off) {
                this.turnClockWise()
            }
            // hits right side
            if (this.x >= width - this.size / 2 - off) {
                this.turnCounterClockWise()
            }
        }
    }

    // positive angle
    turnClockWise() {
        this.turn("pos");
    }

    // negative angle
    turnCounterClockWise() {
        this.turn("neg");
    }

    turn(direction) {
        let angle = random(0, 90);
        this.traject.rotate(direction == "pos" ? angle : direction == "neg" ? -angle : 0);
    }

    collisionWithPlayer() {
        // collision detection player
        let offset = myPlayer.sizeGet() / 2;
        let playerX = myPlayer.xGet();
        let PlaeryY = myPlayer.yGet();
        let closestX = constrain(this.x, playerX - offset, playerX + offset);
        let closestY = constrain(this.y, PlaeryY - offset, PlaeryY + offset);
        let distance = dist(this.x, this.y, closestX, closestY);
        if (distance <= this.size / 2) {
            this.collisionResponse2(distance, myPlayer);
            return true;
        } else {
            return false;
        }
    }

    collisionWithEnemy() {
        // collision detection other enemies
        for (let i = 0; i < currentRoom.enemies.length; i++) {
            let e = currentRoom.enemies[i];
            let xOE = e.xGet();
            let yOE = e.yGet();
            let rOE = e.sizeGet() / 2;
            let distance = dist(this.x, this.y, xOE, yOE);
            if (this.isAlive() && (xOE != this.x && yOE != this.y) && distance <= this.size / 2 + rOE) {
                this.collisionResponse(distance, e);
            }
        }
    }

    updateMoveDirection() {
        this.collisionWithEnemy();
        if (this.canSeePlayer()) { // chase player
            if (!this.collisionWithPlayer()) {
                this.accelerate();
                this.traject = p5.Vector.normalize(createVector(this.x - myPlayer.xGet(), this.y - myPlayer.yGet()));
            }
        } else {
            if (millis() - this.lastDirectionChange >= this.directionChangeDelay) {
                this.waited++;
                this.lastDirectionChange = millis();
                if (this.waited >= 2 && this.xVel < 1 && this.yVel < 1) {
                    this.waited = 0;
                    this.traject = p5.Vector.normalize(createVector(random(-1, 1), random(-1, 1)));
                }
            } else if (this.waited < 1) {
                this.accelerate();
            }
        }
    }

    // does not work ///////////////////////////////////
    ///////////////////////////////////////////////////
    //////////////////////////////////////////////////
    collisionResponse(distance, other) {
        print("colliding");
        let traject = p5.Vector.normalize(createVector(this.x - other.xGet(), this.y - other.yGet()));
        let moveX = traject.x * (this.size / 2 - distance)
        let moveY = traject.y * (this.size / 2 - distance)
        this.x -= moveX;
        this.y -= moveY;
    }
    ////////////////////////////////////////
    ///////////////////////////////////////
    //////////////////////////////////////

    collisionResponse2(distance, other) {
        let traject = p5.Vector.normalize(createVector(this.x - other.xGet(), this.y - other.yGet()));
        let moveX = traject.x * (this.size / 2 - distance)
        let moveY = traject.y * (this.size / 2 - distance)

        this.x += moveX;
        this.y += moveY;

        // make enemy able to push other
        other.xUpdate(-moveX);
        other.yUpdate(-moveY);

    }

    canSeePlayer() {
        return myPlayer.isAlive() && this.distToOther(myPlayer) / 100 <= this.vision;
    }

    distToOther(other) {
        return dist(this.x, this.y, other.xGet(), other.yGet());
    }

    accelerate() {
        if (this.moveSpeed > this.xVel) {
            this.xVel += this.accel;
        }
        if (this.moveSpeed > this.yVel) {
            this.yVel += this.accel;
        }
    }

    deleteEnemies() {
        for (let i = 0; i < currentRoom.enemies.length; i++) {
            if (i == 0 && !currentRoom.enemies[i].isAlive()) {
                currentRoom.enemies = currentRoom.enemies.slice(i + 1);
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

    attack(target) {
        if (this.weapon != null && !this.weapon.isOutOfAmmo()) {
            this.weapon.run();
            if (this.canSeePlayer()) {
                this.weapon.shoot(target.xGet(), target.yGet());
            }
        } else if (this.playerIsInMeleeRange() && millis() - this.lastAttack >= this.atkSpeed) {
            this.doBasicAttack(target);
        }
    }

    doBasicAttack(target) {
        this.lastAttack = millis();
        target.lossHp(this.damage);
    }

    playerIsInMeleeRange() {
        return myPlayer.isAlive() && (this.distToOther(myPlayer) - this.size / 2 - myPlayer.sizeGet() / 2) / 100 <= this.range;
    }

    xGet() {
        return this.x;
    }

    yGet() {
        return this.y;
    }

    xUpdate(x) {
        this.x += x;
    }

    yUpdate(y) {
        this.y += y;
    }

    xVelUpdate(xVel) {
        this.xVel += xVel;
    }

    yVelUpdate(yVel) {
        this.yVel += yVel;
    }

    xVelSet(xVel) {
        this.xVel = xVel;
    }

    yVelSet(yVel) {
        this.yVel = yVel
    }

    trajectUpdate(traject) {
        this.traject = traject;
    }

    sizeGet() {
        return this.size;
    }

    getHealth() {
        return this.health.hpGet();
    }

    setHealth(hp) {
        this.health.hpSet(hp);
    }

    lossHp(amount) {
        if (this.isAlive() && random(0, 1) > this.evasion / 100) {
            this.health.addHp(-amount * (1 - this.armor / 100));
        }
    }

    isAlive() {
        return this.health.hpGet() > 0;
    }

    getTargetX() {
        if (this.canSeePlayer()) {
            return this.target.xGet();
        } else {
            return this.x - this.traject.x;
        }
    }

    getTargetY() {
        if (this.canSeePlayer()) {
            return this.target.yGet();

        } else {
            return this.y - this.traject.y;
        }
    }

    display() {
        push();
        let c = color(255)
        if (this.canSeePlayer()) {
            c = color(255, 0, 0);
        }

        if (this.playerIsInMeleeRange()) {
            c = color(0, 255, 255);
        }
        fill(c);
        circle(this.x, this.y, this.size);
        pop();
    }
}