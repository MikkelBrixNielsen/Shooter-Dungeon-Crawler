class Gun {
    constructor(ow, template) {
        // Gun attributes
        this.owner = ow;
        this.damage = template[0];
        this.accuracy = (360 - map(template[1], 0, 1, 0, 360)) * PI / 180;
        this.range = template[2];
        this.bulletSpeed = template[3];
        this.fireRate = 1000 / template[4];
        this.reloadTime = template[5] * 1000;
        this.maxCapacity = template[6];
        this.pierce = template[7];
        this.knockback = template[8];
        this.barrelLength = template[9];
        this.currentRounds = this.maxCapacity;
        this.ammunition = this.maxCapacity * 4;
        this.lastShot = 0;
        this.angle = 0;
    }

    run() {
        this.updatePosition();
        this.display();
    }

    updatePosition() {
        this.x = this.owner.xGet();
        this.y = this.owner.yGet();
    }

    shoot(targetX, targetY) {
        if (millis() - this.lastShot >= this.fireRate) {
            if (this.currentRounds > 0) {
                this.lastShot = millis();
                this.currentRounds--;
                print("pew");
                bullets.push(
                    new Bullet(
                        this.owner, // owner of gun also owner of bullet 
                        this.x, // x
                        this.y, // y
                        15 + this.damage / 100, // diameter
                        this.bulletSpeed, // velocity
                        this.range, // range
                        1 - this.accuracy, // accuracy
                        this.x - targetX, // x component for trajectory
                        this.y - targetY, // y component for trajectory
                        this.damage, // bullet damage
                        this.pierce, // bullet pierce
                        this.knockback, // knockback
                        this.barrelLength // barrel length
                    )
                );
            } else {
                this.reload();
            }
        }
    }

    reload() {
        if (this.currentRounds < this.maxCapacity) {
            print("reloading");
            this.lastShot = millis() + this.reloadTime;
            if (this.ammunition >= this.maxCapacity) {
                this.ammunition -= this.maxCapacity - this.currentRounds;
                this.currentRounds = this.maxCapacity;
            } else if (this.ammunition > 0) {
                this.currentRounds = this.ammunition;
                this.ammunition -= this.ammunition;
            }
        }
    }

    isOutOfAmmo() {
        return this.ammunition <= 0 && this.currentRounds <= 0;
    }

    display() {
        push();
        this.format();
        push();
        rotate(-this.angle);
        fill(255);
        textSize(32);
        text(this.currentRounds + "/" + this.ammunition, 50, -50);
        pop();
        fill(70);
        rect(-5, 0, 10, 50);
        if (this.angle < -180 || this.angle > 0) {
            rotate(-110);
            rect(-20, -5, 10, 35);
        } else {
            rotate(-70);
            rect(-20, -30, 10, 35);
        }
        pop();
    }

    format() {
        angleMode(DEGREES);
        translate(this.x, this.y);
        this.angle = atan2(this.owner.getTargetY() - this.y, this.owner.getTargetX() - this.x) - 90;
        rotate(this.angle);
    }
}

class Bullet {
    constructor(
        ow,
        x,
        y,
        d,
        vel,
        range,
        accuracy,
        trajectX,
        trajectY,
        damage,
        pierce,
        kb,
        bl
    ) {
        this.owner = ow;
        this.diameter = d;
        this.vel = vel;
        this.range = range;
        this.traject = p5.Vector.normalize(createVector(trajectX, trajectY)).rotate(
            random(-accuracy, accuracy)
        );
        this.moveVec = createVector(x - bl * this.traject.x, y - bl * this.traject.y);
        this.originVec = createVector(x - bl * this.traject.x, y - bl * this.traject.y);
        this.damage = damage;
        this.pierce = pierce;
        this.knockBack = kb;
        this.prevCollision = -1;
        this.toDelete = false;
        this.histogram = [this.originVec];
        // minimum is 3 otherwise things break 
        // mainly in the tunneling part of the collision checking;
        this.histogramLength = 3
    }

    run() {
        if (this.toDelete) {
            return this.deleteBullets();
        } else {
            this.display();
            this.toDelete = this.pierce <= 0 || this.noMoreRange();
            this.move();
            this.hasCollided();
        }
    }

    deleteBullets() {
        for (let i = 0; i < bullets.length; i++) {
            if (i == 0 && bullets[i].toDelete) {
                bullets = bullets.slice(i + 1);
            }
        }
    }

    noMoreRange() {
        return (
            this.range - p5.Vector.sub(this.originVec, this.moveVec).mag() / 100 <= 0
        );
    }

    doTrail() {
        this.histogram.push(createVector(this.moveVec.x, this.moveVec.y));

        this.histogram.length >= this.histogramLength ? this.histogram.shift() : 0
        // does not do anything vissually when bullet speed is too high 
        /*
        push();
        for (let i = 1; i < this.histogram.length; i++) {
            fill(255, map(i, this.histogram.length - 1, 0, 255, 0));
            noStroke();
            circle(this.histogram[i].x, this.histogram[i].y, map(i, this.histogram.length, 0, this.diameter, 0));
        }
        pop();
        */
    }

    move() {
        this.moveVec.x -= this.traject.x * this.vel;
        this.moveVec.y -= this.traject.y * this.vel;

        // damage dropof?
        this.doTrail();
    }

    hasCollided() {
        for (let i = 0; i < currentRoom.entities.length; i++) {
            if (
                this.owner != currentRoom.entities[i] &&
                this.prevCollision != i &&
                currentRoom.entities[i].isAlive() &&
                this.entityInTunnel(currentRoom.entities[i])
            ) {
                this.doDamage(currentRoom.entities[i], i);
                this.prevCollision = i;
                this.pierce--;
            }
        }
    }

    entityInTunnel(entity) {
        let currPos = this.moveVec;
        let prevPos = this.histogram[this.histogram.length - 2];
        let dst = dist(currPos.x, currPos.y, prevPos.x, prevPos.y);
        let amount = ceil(dst / entity.sizeGet() * 2);
        let offset = dst / amount;

        while (dst > 0 && this.pierce > 0) {
            if (dist(currPos.x + dst * this.traject.x, currPos.y + dst * this.traject.y, entity.xGet(), entity.yGet()) <= entity.sizeGet() / 2 + this.diameter / 2) {
                this.pierce = 0;
                return true;
            }
            dst -= offset;
        }
        return false;
    }

    distance(other) {
        return (
            abs(this.moveVec.x - other.xGet()) + abs(this.moveVec.y - other.yGet())
        );
    }

    doDamage(other, idx) {
        let e = other;
        currentRoom.entities.splice(idx, 1);
        currentRoom.entities.push(e);
        other.doKnockBack(this.knockBack, this.traject, false);
        other.lossHp(this.damage);
    }

    display() {
        push();
        ellipseMode(CENTER);
        fill(255);
        circle(this.moveVec.x - this.traject.x, this.moveVec.y, this.diameter);
        pop();
    }
}

