// TODO
// accuracy on guns is wack
// chance a room gets an additional door depends on the amount of doors it already has to make it more unlikely to generate an infinite maze

// collision between enemies 
// change to using images for guns
// find / create images for guns
// make more guns (use q and e to cycle)

// display backpack content onscreen
// display ammo on screen
// display blood overlay on screen indication health 

// different enemies
// different enemies have different attacks
// imporve enemy spawns and make different spawning patterns 

// make player able to push enemies 

// difficulty depending on rooms created and or distance from starting point and dungeons cleared
// make starting room shop???
// rooms with different surfaces / regions/bioms
// different scenery for each room 



// Different modes
// - small  room Waves
// - Survival / endless
// - Time based - get highscore in limited time
// - normal with boss marking completion
// - Boss rush

// make shop room
// make boss room

// rouge like system
// - only in run shop
// - currency for one run only
// - loss everything when dies - keep some cash
// - buy weapons and stats from shop
// - high scores
// - increased difficulty
// - clearing dungeon / special currency / in shop buy other characters
// - special abilities
// - backpack slots can be bought in shop to hold more items

let myPlayer;
let guns = [];
let bullets = [];
let rooms = [];
let currentRoom = null;
let doTrail = false;

function setup() {
  frameRate(120);
  createCanvas(windowWidth, windowHeight);

  // gun templates
  // dmg, acc, range, bulletSpeed, fireRate, reloadTime, 
  // maxCapacity, pierce, knockback, barrel length
  guns.push([15, 0.9, 3, 15, 3, 0.5, 18, 1, 10, 65]);
  guns.push([18, 0.0, 4, 20, 15, 0.8, 200, 1, 25, 65]);

  // creates player
  // x, y, size of square, movement speed
  myPlayer = new Player(width / 2, height / 2, 50, 40);
  myPlayer.addItemToBackPack(new Gun(myPlayer, guns[1]));

  // creates initial room
  // id, r, g, b, entrypoint, prev room id
  rooms.push(
    new Room(rooms.length, 40, 70, 70, -1, 0, false)
  );
  currentRoom = rooms[rooms.length - 1];

  // crete minimap
  myMap = new Minimap(myPlayer);
}

function draw() {
  currentRoom.run();
  myPlayer.run();
  myMap.run();
}

function keyPressed() {
  // toggle trails
  if (keyCode == 17) { // ctrl
    print("Trail");
    for (let i = 0; i < rooms.length; i++) {
      rooms[i].trail.doTrail = !rooms[i].trail.doTrail;
      doTrail = !doTrail;
    }
  }

  // toggle map
  if (keyCode == 9) { // tab
    myMap.toggle();
  }

  // change zoom on map 
  if (keyCode == 187) { // +
    myMap.increaseZoom();
  }

  if (keyCode == 189) { // -
    myMap.decreaseZoom();
  }





  // debugging
  if (key == "g") {
    myPlayer.backpack.itemGet(0).ammunition += myPlayer.backpack.itemGet(0).maxCapacity;
  }

  if (key == "h") {
    print(myPlayer.health.hpGet());
  }

  if (key == "u") {
    myPlayer.evasion *= -100;

  }

  if (key == "k") {
    myPlayer.lossHp(10);
  }

  if (key == "i") {
    myPlayer.healHp(10);
  }

  if (key == "o") {
    print(currentRoom.rooms);
  }

  if (key == "p") {
    for (let i = 0; i < rooms.length; i++) {
      print(rooms[i].rooms);
    }
  }

  if (key == "l") {
    print("break");
  }
  return false;
}