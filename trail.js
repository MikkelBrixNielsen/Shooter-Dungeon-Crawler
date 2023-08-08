class Trail {
    constructor() {
        this.doTrail = true;
        this.crumbs = [];
        this.compactness = 20; // smaller number more compact
        this.batchSize = 5;
        // timing
        this.doTrail = doTrail;
        this.trailDelay = 50; // ms
        this.lastTrail = 0;
    }

    run(create) {
        if (create) {
            this.createTrail();
        }
        this.display();
    }

    trailToggle() {
        this.doTrail = !this.doTrail;
    }

    createTrail() {
        if (
            this.doTrail &&
            myPlayer.isMoving() &&
            millis() - this.lastTrail >= this.trailDelay
        ) {
            this.lastTrail = millis();
            for (let i = 0; i < this.batchSize; i++) {
                this.crumbs.push(
                    new Crumb(
                        myPlayer.xGet() + random(-this.compactness, this.compactness),
                        myPlayer.yGet() + random(-this.compactness, this.compactness),
                        random(3, 7), // size
                        color(random(222, 244), random(178, 200), random(95, 117))
                    )
                );
            }
        }
    }

    display() {
        push();
        for (let i = 0; i < this.crumbs.length; i++) {
            fill(this.crumbs[i].colors);
            angleMode(DEGREES);
            square(this.crumbs[i].x, this.crumbs[i].y, this.crumbs[i].size);
        }
        pop();
    }
}

class Crumb {
    constructor(x, y, s, c) {
        this.x = x;
        this.y = y;
        this.size = s;
        this.colors = c;
    }
}