class HealthBar {
    constructor(hp, x, y, s) {
        this.hp = hp;
        this.hpMapping = [0, hp, 0, s];
        this.thickness = 5;
        this.opacity = 255;
        this.showTime = 3000; // ms
        this.time = 0;
        this.timeToDecay = 1000; //ms
    }

    run(x, y) {
        if (this.hp >= 0 && this.hp != this.hpMapping[1]) {
            this.timer();
            this.display(x, y);
        }
    }

    hpGet() {
        return this.hp;
    }

    hpSet(hp) {
        this.hp = hp;
        this.restVisuals();
    }

    addHp(amount) {
        this.hp += amount;
        this.restVisuals();
    }

    restVisuals() {
        this.time = millis();
        this.opacity = 255;
    }

    timer() {
        if (millis() - this.time >= this.showTime) {
            this.decay();
        }
    }

    decay() {
        let diff = this.time + this.timeToDecay + this.showTime - millis();
        if (diff > 0) {
        }
        this.opacity = map(diff, 0, this.timeToDecay, 0, 255);
    }

    display(x, y) {
        let offset = this.hpMapping[3] / 2 + 15;
        let fac = 1.4;
        push();
        strokeWeight(0);
        fill(200, 0, 0, this.opacity);
        rect(
            x - (this.hpMapping[3] / 2) * fac,
            y - offset,
            this.hpMapping[3] * fac,
            this.thickness
        );
        fill(0, 200, 0, this.opacity);
        rect(
            x - (this.hpMapping[3] / 2) * fac,
            y - offset,
            map(
                this.hp,
                this.hpMapping[0],
                this.hpMapping[1],
                this.hpMapping[2],
                this.hpMapping[3]
            ) * fac,
            this.thickness
        );
        pop();
    }
}