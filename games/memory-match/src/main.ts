import { gameConfig } from './config.js';

const cardIcons = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🥥', '🥝'];
let cards: Phaser.GameObjects.Container[] = [];
let flippedCards: Phaser.GameObjects.Container[] = [];
let matchedPairs = 0;
let moves = 0;
let gameLocked = false;

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor('#2d5a27');
    
    const deck = [...cardIcons, ...cardIcons];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    for (let row = 0; row < 4; row++) {
      cards[row] = [];
      for (let col = 0; col < 4; col++) {
        const card = this.add.container(120 + col * 140, 150 + row * 120);
        
        const back = this.add.rectangle(70, 60, 120, 100, 0x4a7c45);
        back.setStrokeStyle(3, 0x6DBB3A);
        card.add(back);
        
        const front = this.add.text(70, 60, deck[row * 4 + col], {
          fontSize: '56px'
        }).setOrigin(0.5);
        front.setVisible(false);
        card.add(front);
        
        card.setData('front', front);
        card.setData('flipped', false);
        card.setData('icon', deck[row * 4 + col]);
        
        card.setInteractive({ useHandCursor: true });
        card.on('pointerdown', () => flipCard(card, front));
        
        cards[row][col] = card;
      }
    }
    
    const movesText = this.add.text(400, 50, '步数：0', {
      fontSize: '28px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    const pairsText = this.add.text(400, 80, '配对：0/8', {
      fontSize: '24px',
      color: '#FFFF00'
    }).setOrigin(0.5);
    
    function flipCard(card: Phaser.GameObjects.Container, front: Phaser.GameObjects.Text) {
      if (gameLocked || card.getData('flipped') || flippedCards.length >= 2) {
        return;
      }
      
      card.getData('front').setVisible(true);
      card.setData('flipped', true);
      flippedCards.push(card);
      
      if (flippedCards.length === 2) {
        moves++;
        movesText.setText(`步数：${moves}`);
        gameLocked = true;
        
        setTimeout(() => {
          const [card1, card2] = flippedCards;
          const icon1 = card1.getData('icon');
          const icon2 = card2.getData('icon');
          
          if (icon1 === icon2) {
            matchedPairs++;
            pairsText.setText(`配对：${matchedPairs}/8`);
            
            if (matchedPairs === 8) {
              this.add.text(400, 300, '恭喜获胜!', {
                fontSize: '64px',
                color: '#00FF00'
              }).setOrigin(0.5);
            }
          } else {
            card1.getData('front').setVisible(false);
            card2.getData('front').setVisible(false);
            card1.setData('flipped', false);
            card2.setData('flipped', false);
          }
          
          flippedCards = [];
          gameLocked = false;
        }, 1000);
      }
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  ...gameConfig,
  scene: [MainScene]
};

const game = new Phaser.Game(config);

export default game;