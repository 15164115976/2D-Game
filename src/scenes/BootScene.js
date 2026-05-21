// 启动画面 → 点一下进入大地图

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.load.image('bg', '/bg.jpg')
    this.load.image('player', '/player.png')
  }

  create() {
    const { width, height } = this.scale

    // 背景图
    const bg = this.add.image(width / 2, height / 2, 'bg')
    bg.setDisplaySize(width, height)

    // 遮罩
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.4)

    // 标题
    this.add.text(width / 2, height * 0.38, '2.5D 冒险', {
      fontSize: '52px', color: '#ffffff', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.46, '点击任意位置开始', {
      fontSize: '18px', color: '#cccccc',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5)

    this.input.once('pointerdown', () => {
      this.cameras.main.fadeOut(300)
      this.time.delayedCall(300, () => {
        this.cameras.main.fadeIn(300)
        this.scene.start('OverworldScene')
      })
    })
  }
}
