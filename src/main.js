import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene.js'
import { OverworldScene } from './scenes/OverworldScene.js'
import { BattleScene } from './scenes/BattleScene.js'

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 640,
  parent: 'game',
  backgroundColor: '#1a1a2e',
  pixelArt: true,
  scene: [BootScene, OverworldScene, BattleScene],
}

const game = new Phaser.Game(config)
