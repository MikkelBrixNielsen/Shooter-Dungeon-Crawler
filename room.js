class Room {
    constructor(idx, r, g, b, entryPoint, prevIdx, doorsOpen) {
        // right (0), left (1), up (2), down (3)
        this.r = r;
        this.g = g;
        this.b = b;

        // coordinate
        this.coord = this.generateCoord(entryPoint);

        // room's tile size
        this.s = 100;

        // this room's index
        this.idx = idx;

        // idx in rooms array for the room to the [left, right, up, down]
        this.rooms = this.findNeighbouringRooms();

        // the difficulty of the room
        this.diff = 1;

        // contains the tiles which make up the floor of the room
        this.grid = this.tiles();
        // spawns enemies
        this.enemies = this.spawnEnemies(entryPoint);

        // entities in the room 
        this.entities = [...this.enemies]; // creates copies of enemies array
        this.entities.push(myPlayer); // adds player 

        // array containing this rooms door objects
        this.doorsOpen = doorsOpen;
        this.doors = this.createDoors(entryPoint, prevIdx);

        // trail / path player has walked in this room
        this.trail = new Trail();
    }

    // finds any rooms in the rooms list that should be a neighbour to this room 
    // -1 means that there aren't a neighbouring room in that direction
    // directions [left, right, up, down]
    findNeighbouringRooms() {
        let neighbours = [-1, -1, -1, -1];
        let x = this.coord.x;
        let y = this.coord.y;
        for (let i = 0; i < rooms.length; i++) {
            let r = rooms[i];
            let crX = r.coord.x;
            let crY = r.coord.y;
            if (crX == x - 1 && crY == y) { // left room
                neighbours[0] = r.idx;
            } else if (crX == x + 1 && crY == y) { // right room
                neighbours[1] = r.idx;
            } else if (crX == x && crY == y - 1) { // up room
                neighbours[2] = r.idx;
            } else if (crX == x && crY == y + 1) { // down room
                neighbours[3] = r.idx;
            }
        }
        return neighbours;
    }

    generateCoord(entryPoint) {
        if (entryPoint == -1) { // first room to be created 
            return createVector(0, 0);
        } else {
            let currentCoord = currentRoom.coord;
            if (entryPoint == 0) { // left
                return createVector(currentCoord.x - 1, currentCoord.y);
            } else if (entryPoint == 1) { // right
                return createVector(currentCoord.x + 1, currentCoord.y);
            } else if (entryPoint == 2) { // up
                return createVector(currentCoord.x, currentCoord.y - 1);
            } else if (entryPoint == 3) { // downn
                return createVector(currentCoord.x, currentCoord.y + 1);
            }
        }
    }

    // update difficulty depending on something like time
    // increaseDifficulty() {}
    // do something

    pickEnemyType() {
        // randomly pick between Enemy and its different subclasses
        // make more enemy types 
        return Enemy;
    }

    // WORK IN PROGRESS
    spawnEnemies(entryPoint) {
        if (entryPoint == -1) { // spawn room 
            return [];
        }
        // let spawnPattern = random(0, 3);
        let spawnPattern = 0;
        let enemies = [];
        let size = 50
        let spawnBorder = 100 + size;
        let chanceToNotHaveGun = 0.8;
        let ENR = [3, 7];

        let eType = this.pickEnemyType();

        switch (abs(spawnPattern)) {
            case 0: // Single type enemies
                let enemyNum = ceil(random(ENR[0], ENR[1]));
                for (let i = 0; i < enemyNum; i++) {
                    size = random(40, 60);
                    enemies.push(
                        new eType(
                            random(spawnBorder, width - spawnBorder), // x
                            random(spawnBorder, height - spawnBorder), // y
                            size, // size
                            100 * this.diff, // hp
                            5 * this.diff, // moveSpeed
                            15 * this.diff, // damage
                            0.25 * this.diff, // melee range
                            1 * this.diff, // atk speed
                            3 * this.diff, // vission
                            1.95, // acceleration
                            0, // armor 0 - 100 %
                            0 // evasion
                        )
                    );
                }
                // for each enemy deiced if they should have a gun
                // pick what gun they have from guns
                for (let i = 0; i < enemies.length; i++) {
                    if (random(1) > chanceToNotHaveGun) {
                        enemies[i].weapon = new Gun(enemies[i], guns[0]);
                    }
                }
                break;
            case 1: // multiple types of enemies

                break;
            case 2: // other combination of enemies
                break;
            case 3: // boss
                break;
            // more cases
            default:
                break;
        }
        return enemies;
    }

    tryToUnlockDoors() {
        if (this.enemies.length == 0) {
            for (let i = 0; i < this.doors.length; i++) {
                this.doors[i] == null ? 0 : this.doors[i].lockSet(false);
            }
        }
    }

    // special rooms
    // shop room
    // boss room
    // other

    static createAndGoToNextRoom(entryPoint, r, g, b) {
        // creates the room object and adds it to array of all rooms
        // index, r, g, b, entryPoint (left-1, right-2, up-3, down-4), index of current room, tile size 
        rooms.push(
            new Room(
                rooms.length, // id 
                r, // room red colour component 
                g, // green 
                b, // blue 
                entryPoint, // entry direction
                currentRoom.idx, // room you came from
                false // locks all doors when first entering
            )
        );
        //updates current room to be the one just created
        currentRoom = rooms[rooms.length - 1]; // DONT FUCKING DELETE!!!!
        Room.linkSurroundingRooms();
    }

    static linkSurroundingRooms() {
        for (let i = 0; i < currentRoom.rooms.length; i++) {
            if (currentRoom.rooms[i] != -1) { // there is a room
                rooms[currentRoom.rooms[i]].rooms[Room.findFixedDoor(i)] = currentRoom.idx;
            }
        }
    }

    createDoors(entryPoint) {
        let doors = [null, null, null, null];
        let fixedDoor = Room.findFixedDoor(entryPoint);
        let doorsCreated = 0;
        for (let i = 0; i < 4; i++) {
            if (fixedDoor == i || fixedDoor == -1) { // -1 is for startign room having all 4 doors 
                doors[i] = (this.createDoorsAux(i));
                doorsCreated++;
            } else if (this.rooms[i] != -1) { // there is a neighbouring room 
                if (rooms[this.rooms[i]].doors[Room.findFixedDoor(i)] != null) { // it has a door to this
                    doors[i] = this.createDoorsAux(i);
                    doorsCreated++;
                }
            }
            else if (random() < 0.5**doorsCreated) { // if there isn't a room coin flip if there should be a door
                doors[i] = (this.createDoorsAux(i));
                doorsCreated++;
            }
        }
        return doors;
    }

    static findFixedDoor(entryPoint) {
        let fixedDoor = -1;
        switch (entryPoint) {
            case 0:
                fixedDoor = 1;
                break;
            case 1:
                fixedDoor = 0;
                break;
            case 2:
                fixedDoor = 3;
                break;
            case 3:
                fixedDoor = 2;
                break;
            default:
                break;
        }
        return fixedDoor;
    }

    createDoorsAux(i) {
        let f = 0.35, o = 3, t = 10, c = color(360, 180);
        let doors = [
            [o, height / 2 - (height / 2) * f, o, height * f + height / 2 - (height / 2) * f],
            [width - o, height / 2 - (height / 2) * f, width - o, height * f + height / 2 - (height / 2) * f],
            [width / 2 - (width / 2) * f, o, f * width + width / 2 - (width / 2) * f, o],
            [width / 2 - (width / 2) * f, height - o, f * width + width / 2 - (width / 2) * f, height - o]
        ];
        return new Door(doors[i][0], doors[i][1], doors[i][2], doors[i][3], c, t, this.doorsOpen);
    }

    tiles() {
        let grid = [];
        let clr = 0;
        for (let i = 0; i < width / this.s; i++) {
            for (let j = 0; j < height / this.s; j++) {
                if (i % 2 == j % 2) {
                    clr = color(this.r, this.g, this.b);
                } else {
                    clr = color((1 / this.r) * 255, (1 / this.g) * 255, (1 / this.b) * 255);
                }
                grid.push([clr, i * this.s, j * this.s, this.s]);
            }
        }
        return grid;
    }

    drawDoors() {
        for (let i = 0; i < this.doors.length; i++) {
            let door = this.doors[i];
            if (door != null) {
                door.show();
            }
        }
    }

    drawEnemies() {
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].run();
        }
    }

    drawTiles() {
        push();
        for (let i = 0; i < this.grid.length; i++) {
            fill(this.grid[i][0]);
            square(this.grid[i][1], this.grid[i][2], this.grid[i][3]);
        }
        pop();
    }


    colorGet() {
        return [this.r, this.g, this.b];
    }

    run() {
        this.drawTiles();
        this.trail.run(myPlayer.isAlive());
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].run();
        }
        this.drawEnemies();
        this.drawDoors();
        this.tryToUnlockDoors();
    }
}

class Door {
    constructor(x1, y1, x2, y2, c, t, l) {
        this.xStart = x1;
        this.yStart = y1;
        this.xEnd = x2;
        this.yEnd = y2;
        this.colors = c;
        this.thickness = t;
        this.locked = l;
    }

    xStartGet() {
        return this.xStart;
    }

    yStartGet() {
        return this.yStart;
    }

    xEndGet() {
        return this.xEnd;
    }

    yEndGet() {
        return this.yEnd;
    }

    isLocked() {
        return this.locked;
    }

    lockSet(val) {
        this.locked = val;
    }

    show() {
        push();
        stroke(this.colors);
        strokeWeight(this.thickness);
        line(this.xStart, this.yStart, this.xEnd, this.yEnd);
        pop();
    }
}