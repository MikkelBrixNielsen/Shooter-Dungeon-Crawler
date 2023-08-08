class Minimap {
    constructor(player, size = 3) {
        this.show = false;
        this.zoom = size;
        this.map = this.create2DArray(10, 10);
        this.roomsSeen = 0;
        this.player = player;
    }

    run() {
        this.convertTo2DArray();
        if (this.show) {
            this.display();
        }
    }

    toggle() {
        this.show = !this.show;
    }

    create2DArray(w, h) {
        return new Array(w).fill(null).map(() => new Array(h).fill(null));
    }

    convertTo2DArray() {
        for (let i = this.roomsSeen; i < rooms.length; i++) {
            this.insertRoom(rooms[i]);
        }
        this.roomsSeen = rooms.length;
    }

    insertRoom(room) {
        const [left, right, up, down] = room.rooms;
        const { x, y } = room.coord;
        const res = this.remapAndOUBCheck(x, y);
        if (!res) { return; } // remap caused OUB and new this.map was created
        this.map[res.x][res.y] = room;
        if (left !== null) this.map[res.x - 1][res.y] = rooms[left];
        if (right !== null) this.map[res.x + 1][res.y] = rooms[right];
        if (up !== null) this.map[res.x][res.y - 1] = rooms[up];
        if (down !== null) this.map[res.x][res.y + 1] = rooms[down];
    }

    remapAndOUBCheck(x, y) {
        const res = this.remap(x, y);
        if (this.isOutOfBounds(res.x, res.y)) {
            const size = this.map.length + 2;
            this.map = this.create2DArray(size, size);
            for (const room of rooms) {
                this.insertRoom(room);
            }
            return null;
        } else {
            return res;
        }
    }

    remap(x, y, w = this.map.length, h = this.map[0].length) {
        const wx = w - 1;
        const wy = h - 1;
        let remappedX = round(map(x, floor(-wx / 2), floor(wx / 2), 0, wx));
        let remappedY = round(map(y, floor(-wy / 2), floor(wy / 2), 0, wy));
        return createVector(remappedX, remappedY);
    }

    isOutOfBounds(x, y) {
        return x >= this.map.length - 1 || x <= 0 ||
            y >= this.map[0].length - 1 || y <= 0;
    }

    display() {
        const size = this.zoom;
        // index variables into this.map for zooming and stuff
        const cen = this.remap(currentRoom.coord.x, currentRoom.coord.y);
        const halfX = floor(size / 2);
        const halfY = floor(size / 2);
        let startI = cen.x - halfX;
        let endI = cen.x + halfX
        let startJ = cen.y - halfY;
        let endJ = cen.y + halfY;

        // background for map 
        const mapWidth = width - 200;
        const mapHeight = height - 200;
        const mapX = 100;
        const mapY = 100;
        const a = 200;
        noStroke;
        fill(10, a);
        rect(mapX, mapY, mapWidth, mapHeight);

        // room variables
        const rWidth = mapWidth / size;
        const rHeight = mapHeight / size;
        // variables for making the rooms doors 
        const scl = 0.35;
        const thickness = rWidth * scl ** 4;
        const doorLength = rHeight * scl;
        const doorThickness = thickness / 2;
        let doors = [];

        // player variables
        let nx = 0;
        let ny = 0;

        push();
        for (let i = startI; i <= endI; i++) {
            for (let j = startJ; j <= endJ; j++) {
                if (i >= 0 && i < this.map.length && j >= 0 && j < this.map[0].length) {
                    let room = this.map[i][j];
                    if (room) {
                        const x = mapX + (i - startI) * rWidth;
                        const y = mapY + (j - startJ) * rHeight;
                        stroke(0);
                        fill(...room.colorGet(), a);
                        rect(x, y, rWidth, rHeight);

                        // lines for doors 
                        if (room.doors[0]) // left door
                            doors.push([x + doorThickness, y + doorLength, x + doorThickness, y + rHeight - doorLength]);
                        if (room.doors[1]) // right door 
                            doors.push([x + rWidth - doorThickness, y + doorLength, x + rWidth - doorThickness, y + rHeight - doorLength]);
                        if (room.doors[2]) // top door
                            doors.push([x + doorLength, y + doorThickness, x + rWidth - doorLength, y + doorThickness]);
                        if (room.doors[3]) // bottom door
                            doors.push([x + doorLength, y + rHeight - doorThickness, x + rWidth - doorLength, y + rHeight - doorThickness]);

                        if (i == cen.x && j == cen.y) {
                            nx = map(this.player.xGet(), 0, width, x, x + rWidth);
                            ny = map(this.player.yGet(), 0, height, y, y + rHeight);
                        }
                    }
                }
            }
        }

        push();
        strokeWeight(thickness);
        stroke(255);
        for (const door of doors) {
            line(...door);
        }
        pop();

        push();
        stroke(0);
        strokeWeight(4 / (size ** scl));
        fill("red");
        const pw = min(50 / (size ** scl), rWidth);
        rectMode(CENTER);
        square(nx, ny, pw);
        pop();
        pop();
    }

    increaseZoom() {
        if (this.zoom > 2) this.zoom -= 2;
        print(this.zoom);
    }

    decreaseZoom() {
        //if (this.map.length - this.zoom > 2 && this.map[0].length - this.zoom > 2)
        this.zoom += 2;
        print(this.zoom);

    }
}