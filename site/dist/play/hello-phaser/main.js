import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: document.body,
  backgroundColor: '#1a1a2e',
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let balls;
let ballCount = 0;

function preload() {
  this.load.bitmapFont('font', 'font.png', 'font.xml');
}

function create() {
  balls = this.add.group();
  
  this.input.on('pointerdown', (pointer) => {
    createBall.call(this, pointer.x, pointer.y);
  });
  
  this.input.keyboard.on('keydown-SPACE', () => {
    balls.clear(true, true);
    ballCount = 0;
  });
  
  createBall.call(this, config.width / 2, config.height / 2);
}

function createBall(x, y) {
  ballCount++;
  const color = Math.random() * 0xffffff;
  const ball = this.add.circle(x, y, 20, color);
  ball.setVelocity(
    Phaser.Math.Between(-200, 200),
    Phaser.Math.Between(-200, 200)
  );
  ball.setBounce(1);
  ball.setCollideWorldBounds(true);
  balls.add(ball);
}

function update() {
  balls.children.iterate((ball) => {
    if (ball && ball.velocity) {
      ball.rotation = ball.body.velocity.x * 0.001;
    }
  });
}