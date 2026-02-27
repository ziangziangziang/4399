const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);

let playerIce: Phaser.Physics.Arcade.Image;
let playerFire: Phaser.Physics.Arcade.Image;
let platforms: Phaser.Physics.Arcade.Group;
let goalDoor: Phaser.Physics.Arcade.Image;
let gems: Phaser.Physics.Arcade.Group;
let lavaSpikes: Phaser.Physics.Arcade.Group;
let score: number = 0;
let scoreText: Phaser.GameObjects.Text;
let controlsText: Phaser.GameObjects.Text;
let keys: any;

function preload(this: Phaser.Scene): void {
  this.load.setBaseURL('build');
  
  this.load.image('platform', 'assets/platform.png');
  this.load.image('ice-player', 'assets/ice-player.png');
  this.load.image('fire-player', 'assets/fire-player.png');
  this.load.image('goal-door', 'assets/goal-door.png');
  this.load.image('ice-gem', 'assets/ice-gem.png');
  this.load.image('fire-gem', 'assets/fire-gem.png');
  this.load.image('lava-spikes', 'assets/lava-spikes.png');
}

function create(this: Phaser.Scene): void {
  platforms = this.physics.add.staticGroup();
  gems = this.physics.add.group({
    immovable: true,
    allowGravity: false
  });
  lavaSpikes = this.physics.add.staticGroup();

  createLevel(this);

  playerIce = this.physics.add.image(100, 450, 'ice-player')
    .setCollideWorldBounds(true)
    .setMaxVelocity(300, 300)
    .setBounce(0.1);

  playerFire = this.physics.add.image(150, 450, 'fire-player')
    .setCollideWorldBounds(true)
    .setMaxVelocity(300, 300)
    .setBounce(0.1);

  playerIce.setBounce(0.2);
  playerFire.setBounce(0.2);

  this.physics.add.collider(playerIce, platforms);
  this.physics.add.collider(playerFire, platforms);
  this.physics.add.collider(playerIce, gems, collectIceGem, null, this);
  this.physics.add.collider(playerFire, gems, collectFireGem, null, this);
  this.physics.add.collider(playerIce, lavaSpikes, hitLava, null, this);
  this.physics.add.collider(playerFire, lavaSpikes, hitLava, null, this);

  this.physics.add.overlap(playerIce, goalDoor, checkWin, null, this);
  this.physics.add.overlap(playerFire, goalDoor, checkWin, null, this);

  score = 0;
  scoreText = this.add.text(16, 16, '分数：0', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });

  controlsText = this.add.text(16, 48, '冰：WASD | 火：方向键', {
    fontSize: '18px',
    color: '#cccccc',
    fontFamily: 'Arial'
  });

  keys = {
    iceUp: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    iceDown: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    iceLeft: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    iceRight: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    fireUp: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    fireDown: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
    fireLeft: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    fireRight: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
  };
}

export function update(this: Phaser.Scene): void {
  if (!playerIce.active || !playerFire.active) return;

  if (Phaser.Input.Keyboard.JustDown(keys.iceLeft)) {
    playerIce.setVelocityX(-200);
  } else if (Phaser.Input.Keyboard.JustDown(keys.iceRight)) {
    playerIce.setVelocityX(200);
  }

  if (Phaser.Input.Keyboard.JustDown(keys.iceUp) && playerIce.body!.touching.down) {
    playerIce.setVelocityY(-400);
  }

  if (Phaser.Input.Keyboard.JustDown(keys.fireLeft)) {
    playerFire.setVelocityX(-200);
  } else if (Phaser.Input.Keyboard.JustDown(keys.fireRight)) {
    playerFire.setVelocityX(200);
  }

  if (Phaser.Input.Keyboard.JustDown(keys.fireUp) && playerFire.body!.touching.down) {
    playerFire.setVelocityY(-400);
  }
}

function createLevel(scene: Phaser.Scene): void {
  scene.add.rectangle(400, 580, 800, 40, 0x1a1a2e);

  createPlatform(scene, 200, 480, 200);
  createPlatform(scene, 500, 480, 200);
  createPlatform(scene, 350, 380, 150);
  createPlatform(scene, 150, 280, 120);
  createPlatform(scene, 550, 280, 120);
  createPlatform(scene, 350, 180, 200);

  goalDoor = scene.add.image(700, 100, 'goal-door');
  scene.physics.add.existing(goalDoor, true);

  for (let i = 0; i < 5; i++) {
    let gem = gems.create(200 + i * 80, 150, 'ice-gem');
    if (gem) {
      gem.setBounce(0.3);
      gem.setCollideWorldBounds(true);
    }
  }

  for (let i = 0; i < 4; i++) {
    let gem = gems.create(350 + i * 90, 350, 'fire-gem');
    if (gem) {
      gem.setBounce(0.3);
      gem.setCollideWorldBounds(true);
    }
  }

  let spike = lavaSpikes.create(350, 200, 'lava-spikes');
  if (spike) {
    spike.setImmovable(true);
    spike.setOrigin(0.5, 1);
  }
}

function createPlatform(scene: Phaser.Scene, x: number, y: number, width: number): void {
  let platform = platforms.create(x, y, 'platform');
  platform.setDisplaySize(width, 20);
  platform.refreshBody();
}

function collectIceGem(player: Phaser.Physics.Arcade.Image, gem: Phaser.Physics.Arcade.Image): void {
  gem.disableBody(true, true);
  score += 10;
  scoreText.setText('分数：' + score);
}

function collectFireGem(player: Phaser.Physics.Arcade.Image, gem: Phaser.Physics.Arcade.Image): void {
  gem.disableBody(true, true);
  score += 10;
  scoreText.setText('分数：' + score);
}

function hitLava(player: Phaser.Physics.Arcade.Image, spike: Phaser.Physics.Arcade.Image): void {
  player.disableBody(true, true);
  this.physics.pause();
  
  this.add.text(400, 300, '游戏结束', {
    fontSize: '48px',
    color: '#ff0000',
    fontStyle: 'bold',
    fontFamily: 'Arial'
  }).setOrigin(0.5);

  this.add.text(400, 360, '按 R 重新开始', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);

  this.input.keyboard!.on('keydown-R', () => {
    this.scene.restart();
  });
}

function checkWin(player: Phaser.Physics.Arcade.Image, door: Phaser.Physics.Arcade.Image): void {
  if (score >= 100) {
    this.physics.pause();
    
    this.add.text(400, 300, '通关成功!', {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 360, '分数：' + score, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 410, '按 R 重新开始', {
      fontSize: '24px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown-R', () => {
      this.scene.restart();
    });
  }
}