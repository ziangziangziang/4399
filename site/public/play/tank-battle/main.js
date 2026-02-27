(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // games/tank-battle/src/main.ts
  var Main = class extends Phaser.Scene {
    constructor() {
      super({ key: "Main" });
      __publicField(this, "player");
      __publicField(this, "bullets");
      __publicField(this, "enemies");
      __publicField(this, "obstacles");
      __publicField(this, "base");
      __publicField(this, "keys");
      __publicField(this, "score", 0);
      __publicField(this, "scoreText");
      __publicField(this, "gameOver", false);
      __publicField(this, "enemySpawnTimer", null);
    }
    preload() {
      this.load.setBaseURL("https://cdn.jsdelivr.net/npm/phaser3@3.60.0/dist/resources");
      this.load.image("player-tank", "https://cdn.jsdelivr.net/gh/photonstorm/phaser3vibes@main/assets/sprites/phaser3-logo.png");
      this.load.image("enemy-tank", "https://cdn.jsdelivr.net/gh/photonstorm/phaser3vibes@main/assets/particles/particle.png");
      this.load.image("bullet", "https://cdn.jsdelivr.net/gh/photonstorm/phaser3vibes@main/assets/particles/particle.png");
      this.load.image("obstacle", "https://cdn.jsdelivr.net/gh/photonstorm/phaser3vibes@main/assets/tilesets/brick.png");
      this.load.image("base", "https://cdn.jsdelivr.net/gh/photonstorm/phaser3vibes@main/assets/tilesets/brick.png");
      this.load.image("enemy-icon", "https://cdn.jsdelivr.net/gh/photonstorm/phaser3vibes@main/assets/particles/particle.png");
    }
    create() {
      this.physics.world.setBounds(0, 0, 1024, 768);
      this.obstacles = this.physics.add.staticGroup();
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 8; j++) {
          if (Math.random() > 0.5) {
            const obstacle = this.obstacles.create(128 + j * 128, 128 + i * 96, "obstacle");
            obstacle.setDisplaySize(64, 64);
          }
        }
      }
      this.player = this.physics.add.image(512, 650, "player-tank");
      this.player.setCollideWorldBounds(true);
      this.player.setDepth(10);
      this.bullets = this.physics.add.group();
      this.enemies = this.physics.add.group();
      this.base = this.physics.add.image(512, 720, "base");
      this.base.setCollideWorldBounds(true);
      this.base.setDepth(5);
      const keyboard = this.input.keyboard?.createCursorKeys();
      const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      if (!keyboard || !spaceKey) {
        console.error("Keyboard initialization failed");
        return;
      }
      this.keys = keyboard;
      this.keys.space = spaceKey;
      this.scoreText = this.add.text(16, 16, "Score: 0", {
        fontSize: "24px",
        color: "#ffffff"
      });
      this.enemySpawnTimer = this.time.addEvent({
        delay: 2e3,
        callback: this.spawnEnemy,
        callbackScope: this,
        loop: true
      });
      this.physics.add.collider(this.player, this.obstacles);
      this.physics.add.collider(this.enemies, this.obstacles);
      this.physics.add.collider(this.base, this.obstacles);
      this.physics.add.collider(this.player, this.base);
      this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, void 0, this);
      this.physics.add.overlap(this.bullets, this.obstacles, this.hitObstacle, void 0, this);
      this.physics.add.overlap(this.enemies, this.base, this.hitBase, void 0, this);
      this.physics.add.overlap(this.enemies, this.player, this.hitPlayer, void 0, this);
      this.cameras.main.startFollow(this.player);
    }
    update() {
      if (this.gameOver) {
        return;
      }
      const speed = 200;
      if (this.keys.left?.isDown) {
        this.player.setVelocityX(-speed);
      } else if (this.keys.right?.isDown) {
        this.player.setVelocityX(speed);
      } else {
        this.player.setVelocityX(0);
      }
      if (this.keys.up?.isDown) {
        this.player.setVelocityY(-speed);
      } else if (this.keys.down?.isDown) {
        this.player.setVelocityY(speed);
      } else {
        this.player.setVelocityY(0);
      }
      const spaceKey = this.keys.space;
      if (spaceKey && Phaser.Input.Keyboard.JustDown(spaceKey)) {
        this.shoot();
      }
    }
    shoot() {
      const bullet = this.bullets.create(this.player.x, this.player.y, "bullet");
      bullet.setDisplaySize(10, 10);
      bullet.setDepth(11);
      let velocity = new Phaser.Math.Vector2(0, -300);
      if (this.keys.up?.isDown)
        velocity = new Phaser.Math.Vector2(0, -300);
      else if (this.keys.down?.isDown)
        velocity = new Phaser.Math.Vector2(0, 300);
      else if (this.keys.left?.isDown)
        velocity = new Phaser.Math.Vector2(-300, 0);
      else if (this.keys.right?.isDown)
        velocity = new Phaser.Math.Vector2(300, 0);
      else
        velocity = new Phaser.Math.Vector2(0, -300);
      bullet.setVelocity(velocity.x, velocity.y);
      this.time.delayedCall(1e3, () => {
        if (bullet.active)
          bullet.destroy();
      });
    }
    spawnEnemy() {
      if (this.gameOver)
        return;
      const x = Math.random() > 0.5 ? 0 : 1024;
      const y = Math.random() * 600 + 50;
      const enemy = this.enemies.create(x, y, "enemy-tank");
      enemy.setDisplaySize(64, 64);
      enemy.setCollideWorldBounds(true);
      enemy.setDepth(9);
      enemy.health = 2;
      this.physics.add.overlap(enemy, this.bullets, this.hitEnemyByPlayer, void 0, this);
    }
    hitEnemy(bullet, enemy) {
      bullet.destroy();
      enemy.health--;
      if (enemy.health <= 0) {
        enemy.destroy();
        this.score += 100;
        this.scoreText.setText(`Score: ${this.score}`);
      }
    }
    hitEnemyByPlayer(enemy, bullet) {
      this.hitEnemy(bullet, enemy);
    }
    hitObstacle(bullet) {
      bullet.destroy();
    }
    hitBase(enemy) {
      enemy.destroy();
      this.gameOver = true;
      this.add.text(512, 384, "GAME OVER", {
        fontSize: "48px",
        color: "#ff0000",
        fontStyle: "bold"
      }).setOrigin(0.5);
      this.add.text(512, 450, `Final Score: ${this.score}`, {
        fontSize: "32px",
        color: "#000"
      }).setOrigin(0.5);
      this.add.text(512, 500, "Press SPACE to restart", {
        fontSize: "24px",
        color: "#000"
      }).setOrigin(0.5);
      const keyboard = this.input.keyboard;
      if (keyboard) {
        keyboard.once("keydown-SPACE", () => {
          this.scene.restart();
        });
      }
      if (this.enemySpawnTimer !== null) {
        this.enemySpawnTimer.remove();
      }
    }
    hitPlayer(enemy) {
      enemy.destroy();
      this.gameOver = true;
      this.add.text(512, 384, "GAME OVER", {
        fontSize: "48px",
        color: "#ff0000",
        fontStyle: "bold"
      }).setOrigin(0.5);
      this.add.text(512, 450, `Final Score: ${this.score}`, {
        fontSize: "32px",
        color: "#000"
      }).setOrigin(0.5);
      this.add.text(512, 500, "Press SPACE to restart", {
        fontSize: "24px",
        color: "#000"
      }).setOrigin(0.5);
      const keyboard = this.input.keyboard;
      if (keyboard) {
        keyboard.once("keydown-SPACE", () => {
          this.scene.restart();
        });
      }
      if (this.enemySpawnTimer !== null) {
        this.enemySpawnTimer.remove();
      }
    }
  };
  var config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#87CEEB",
    scene: [Main],
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    }
  };
  var game = new Phaser.Game(config);
})();
