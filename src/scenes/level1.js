import 'phaser';
import { Player } from '../player.ts';
import { Walker } from '../walker';
import { Bird } from '../bird';
import { BananaPeel } from '../BananaPeel';
import { StaminaBar } from '../StaminaBar';
import { Shopkeeper } from '../shopkeeper';

var layer;

export function GetObjectsCollection(map) {
    let collection = [];

    map.tilesets.forEach((tileset) => {
        let key = tileset.name.slice(tileset.name.lastIndexOf('/') + 1, tileset.name.lastIndexOf('.'));
        collection[tileset.firstgid] = key;
    });

    return collection;
}

function GetObjectByName(objectLayer, name) {
    return objectLayer.objects.find(function (elem, index, arr) {
        return elem['name'] == name;
    });
}

function GetObjectsByType(objectLayer, type) {
    let objects = [];
    for (let index = 0; index < objectLayer.objects.length; index++) {
        const element = objectLayer.objects[index];
        if (element['type'] == type) {
            objects.push(element);
        }
    }
    return objects;
}

function GetObjectProperty(tiledObject, propName) {
    let value = undefined;
    tiledObject.properties.forEach(prop => {
        if (prop.name === propName) {
            value = prop.value;
        }
    });
    return value;
}

class LevelBase extends Phaser.Scene {
    constructor(levelName) {
        super(levelName);
        this.levelName = levelName
        console.log('CONSTRUCTOR:', this.levelName);
    }

    preload() { }

    create() {
        console.log('CREATE:', this.levelName);
        this.map = this.make.tilemap({ key: this.levelName });

        let tilesets = [];
        tilesets.push(this.map.addTilesetImage('bg', 'city-bg-tileset'));
        tilesets.push(this.map.addTilesetImage('city-tileset'));

        this.map.layers.forEach(function (layerData, index) {
            this.map.createStaticLayer(index, tilesets);
            if (layerData.name === 'Level') {
                layer = layerData.tilemapLayer;
            }
        }, this);
        this.map.setCollision([1, 2, 6, 7, 8, 10], true, true, layer);

        this.positionsLayer = this.map.getObjectLayer('Positions');
        this.cityObjectsLayer = this.map.getObjectLayer('CityObjects');

        this.cameras.main.setBackgroundColor("#87ceeb");

        this.playerStartPos = GetObjectByName(this.positionsLayer, 'PlayerStartPos');

        let objectsCollection = GetObjectsCollection(this.map);
        console.log("Objects Collection:", objectsCollection);
        this.cityObjectsLayer.objects.forEach((obj) => {
            console.log(obj);
            if (obj.gid != undefined) {
                this.map.createFromObjects('CityObjects', obj.gid, { key: objectsCollection[obj.gid] });
            }
        });

        this.player = new Player(this, this.playerStartPos.x, this.playerStartPos.y).setOrigin(0.5, 1);

        this.physics.add.collider(this.player, layer);

        this.input.keyboard.on("keyup_R", this.restartGame, this);
        this.input.keyboard.on("keyup_ESC", this.pauseGame, this);

        this.cameras.main.startFollow(this.player, false, 0.08, 0, -80, 65);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(layer.x, layer.y, layer.width, layer.height);

        let uicamera = this.cameras.add(0, 0, 720, 400, false, "uicamera");
        uicamera.scrollY = 1000;

        this.isLevelStarted = false;

        this.levelData = new Map();
        this.map.properties.forEach(function (prop) {
            this.levelData.set(prop.name, prop.value);
        }, this);

        this.timeRemaining = this.levelData.get('Time Limit');
        this.starsTimeConditions = [
            this.levelData.get('1stars'),
            this.levelData.get('2stars'),
            this.levelData.get('3stars')
        ]
        console.log("STARS CONDS", this.starsTimeConditions);
        this.textTime = this.add.text(590, 1010, '');
        this.staminaBar = new StaminaBar(this, 20, 1010, this.player);

        this.initBananas();
        this.initWalkers();
        this.initBirdTriggers();
        this.initShopkeepers();

        this.preStart();
    }

    preStart() {
        this.time.delayedCall(1000, this.startGame, null, this);
    }

    getWalkers() {
        return this.walkers;
    }

    isRunIntoWalker(player, walker) {
        if (this.levelComplete) {
            return false;
        }
        if (player.isDodging()) {
            return false;
        }
        if (player.isStumbled() || walker.isBumped) {
            return false;
        }
        if (player.x > walker.x) {
            return false;
        }
        return true;
    }

    onRunIntoWalker(player, walker) {
        console.log("Run into walker");
        player.onRunIntoWalker();
        walker.onBumped();
    }

    startGame() {
        this.bananaPeels.forEach(bananaPeel => {
            bananaPeel.reset();
        });

        this.initFinish();

        this.walkers.forEach(walker => {
            walker.isBumped = false;
            walker.walkFromStart();
        });

        this.birdTriggers.forEach(trig => {
            trig.enabled = true;
            trig.bird.reset();
        });

        this.levelComplete = false;
        this.timeRemaining = this.levelData.get('Time Limit');
        this.isLevelStarted = true;
        this.player.restoreFullStamina();
        this.player.run();
    }

    update(time, delta) {
        if (this.isLevelFailed()) {
            this.scene.setActive(false, this.levelName);
            this.scene.get('MainMenu').showFailScreen();
        }
        else if (this.isLevelComplete()) {
        }
        else {
            this.player.update(delta);
            this.updateTimeFromStart(delta);
            this.staminaBar.update();
            this.tryLaunchBird();
            this.shopkeepers.forEach(keeper => {
                keeper.update();
            });
        }
    }

    updateTimeFromStart(delta) {
        if (this.isLevelStarted) {
            this.timeRemaining = this.timeRemaining > delta ? this.timeRemaining - delta : 0;
        }
        let timeString = (Math.round(this.timeRemaining) / 1000).toFixed(2);
        this.textTime.setText("TIME: " + timeString + " s");
    }

    restartGame() {
        this.scene.setActive(true, this.levelName);
        this.physics.world.removeCollider(this.finishOverlapCollider);

        this.player.setPosition(this.playerStartPos.x, this.playerStartPos.y);
        this.startGame();
    }

    isLevelComplete() {
        return this.levelComplete;
    }

    isLevelFailed() {
        return this.player.y > 500 || this.timeRemaining === 0;
    }

    initBananas() {
        this.bananaPeels = [];

        let bananaPeelsPositions = GetObjectsByType(this.positionsLayer, 'BananaPeel');
        bananaPeelsPositions.forEach(pos => {
            console.log(pos);
            let bananaPeel = new BananaPeel(this, { x: pos.x, y: pos.y });

            this.physics.add.collider(bananaPeel, layer);
            this.physics.add.overlap(this.player, bananaPeel, this.onStepOnBanana, null, this);

            this.bananaPeels.push(bananaPeel);
        });
    }

    onStepOnBanana(player, banana) {
        if (banana.isUsed) {
            return;
        }

        console.log("Player stepped on banana at (%d, %d)", banana.x, banana.y);
        player.onStepOnBanana();
        banana.flyAway();
    }

    initFinish() {
        var finishTile;
        layer.forEachTile(function (tile) {
            if (tile.properties.isFinish) {
                finishTile = tile;
            }
        }, this);

        let finishImage = this.physics.add.staticImage(layer.x + finishTile.pixelX + 8, layer.y + finishTile.pixelY + 8);
        finishImage.setSize(16, 16);
        this.finishOverlapCollider = this.physics.add.overlap(this.player, finishImage, this.onEnterFinish, null, this);
    }

    onEnterFinish(player, finish) {
        player.onEnterFinishTile();
        this.physics.world.removeCollider(this.finishOverlapCollider);
        this.levelComplete = true;
        let stars = this.countStars();
        this.scene.get('MainMenu').showVictoryScreen(stars);
    }

    countStars() {
        let time = this.levelData.get('Time Limit') - this.timeRemaining;
        let stars = 0;
        this.starsTimeConditions.forEach(cond => {
            if (time <= cond) {
                stars++;
            }
        });
        return stars;
    }

    initWalkers() {
        this.walkers = [];

        let walkerPaths = GetObjectsByType(this.positionsLayer, 'WalkerPath');
        walkerPaths.forEach(path => {
            console.log(path);
            let inverse = path.properties[0].value;
            let x = path.x;
            let y = path.y;

            let walker = new Walker(this, {
                fromX: inverse ? x + path.polyline[1].x : x,
                toX: inverse ? x : x + path.polyline[1].x,
                fromY: y,
                type: Math.floor(1 + Math.random() * Walker.WALKER_TYPE_COUNT)
            });

            this.physics.add.collider(walker, layer);
            this.physics.add.overlap(this.player, walker, this.onRunIntoWalker, this.isRunIntoWalker, this);

            this.walkers.push(walker);
        });
    }

    initBirdTriggers() {
        this.birdTriggers = [];

        let triggers = GetObjectsByType(this.positionsLayer, 'BirdTrigger');
        triggers.forEach(trig => {
            console.log(trig);
            let bird = new Bird(this, { x: trig.x + 250, y: trig.y - 25 });

            this.physics.add.overlap(this.player, bird, this.onRunIntoBird, null, this);

            this.birdTriggers.push({ x: trig.x, enabled: true, bird: bird });
        });
    }

    initShopkeepers() {
        this.shopkeepers = [];

        let positionList = GetObjectsByType(this.positionsLayer, 'Shopkeeper');
        positionList.forEach(pos => {
            console.log(pos);
            console.log('Shopkeeper type:', GetObjectProperty(pos, 'type'));
            let shopkeeper = new Shopkeeper(this, {
                x: pos.x,
                y: pos.y,
                type: GetObjectProperty(pos, 'type'),
                player: this.player
            });

            this.shopkeepers.push(shopkeeper);
        });
    }

    onRunIntoBird(player, bird) {
        console.log("Run into bird");
        player.onRunIntoBird();
        bird.onBumped();
    }

    tryLaunchBird() {
        this.birdTriggers.forEach(trig => {
            if (this.player.x > trig.x && trig.enabled) {
                trig.bird.startFly();
                trig.enabled = false;
            }
        });
    }

    pauseGame(event) {
        event.stopPropagation();
        this.scene.setActive(false, this.levelName);
        this.scene.get('MainMenu').showPauseScreen();
    }

    resumeGame() {
        this.scene.setActive(true, this.levelName);
    }
}


export class Level1 extends LevelBase {
    constructor() {
        super('Level1');
    }
}

export class Level2 extends LevelBase {
    constructor() {
        super('Level2');
    }
}

export class Level3 extends LevelBase {
    constructor() {
        super('Level3');
    }
}
