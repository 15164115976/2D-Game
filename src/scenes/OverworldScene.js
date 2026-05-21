// 大地图 — 点击移动，触碰敌人进入战斗

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' })
    this.enemies = []
    this.player = null
    this.moveTarget = null
    this.inBattle = false
    this.battlingEnemy = null
    this.facingLeft = true   // 图片默认朝左
  }

  create() {
    const { width, height } = this.scale

    // 背景地图
    const bg = this.add.image(width / 2, height / 2, 'bg')
    bg.setDisplaySize(width, height)
    bg.setDepth(0)

    // 玩家 — 使用图片，朝右
    this.player = this.add.image(width * 0.75, height * 0.7, 'player')
    this.player.setScale(0.15)   // 384×303 → 约58×45
    this.player.setOrigin(0.5, 1)
    this.player.setDepth(10)

    // 生成敌人
    this.spawnEnemies()

    // 点击移动
    this.input.on('pointerdown', (pointer) => {
      if (this.inBattle) return
      this.moveTarget = { x: pointer.x, y: pointer.y }

      const marker = this.add.circle(pointer.x, pointer.y, 6, 0xffffff, 0.5).setDepth(5)
      this.tweens.add({ targets: marker, alpha: 0, scale: 2, duration: 400, onComplete: () => marker.destroy() })
    })
  }

  spawnEnemies() {
    const { width, height } = this.scale
    this.enemies = []

    const positions = [
      { x: width * 0.15, y: height * 0.2 },
      { x: width * 0.35, y: height * 0.55 },
      { x: width * 0.55, y: height * 0.25 },
      { x: width * 0.2, y: height * 0.8 },
    ]

    positions.forEach(pos => {
      const enemy = this.createPixelCharacter(pos.x, pos.y, 0xd63031, true)
      enemy.enemyData = { name: '🦴 骷髅', hp: 30, maxHp: 30, atk: 10 }
      enemy.setDepth(10)

      const label = this.add.text(pos.x, pos.y - 35, '🦴 骷髅', {
        fontSize: '12px', color: '#fff',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(11)

      enemy.label = label
      this.enemies.push(enemy)
    })
  }

  update() {
    if (this.inBattle || !this.moveTarget || !this.player) return

    const target = this.moveTarget
    const speed = 3

    const dx = target.x - this.player.x
    const dy = target.y - this.player.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 5) {
      this.moveTarget = null
      return
    }

    const step = Math.min(speed, dist)
    this.player.x += (dx / dist) * step
    this.player.y += (dy / dist) * step

    // 朝向：向左为正方向（原图朝左），向右镜像翻转
    if (dx < -2 && !this.facingLeft) {
      this.facingLeft = true
      this.player.setFlipX(false)
    } else if (dx > 2 && this.facingLeft) {
      this.facingLeft = false
      this.player.setFlipX(true)
    }

    // 碰撞检测
    for (const enemy of this.enemies) {
      if (!enemy.active) continue
      const edx = this.player.x - enemy.x
      const edy = this.player.y - enemy.y
      if (Math.sqrt(edx * edx + edy * edy) < 40) {
        this.triggerBattle(enemy)
        break
      }
    }
  }

  createPixelCharacter(x, y, color, isEnemy) {
    const container = this.add.container(x, y)
    const g = this.add.graphics()

    g.fillStyle(color, 1)
    g.fillRect(-8, -4, 16, 16)

    g.fillStyle(isEnemy ? 0xd63031 : 0xfeca57, 1)
    g.fillRect(-6, -16, 12, 12)

    g.fillStyle(0xffffff, 1)
    g.fillRect(-4, -14, 3, 3)
    g.fillRect(1, -14, 3, 3)
    g.fillStyle(isEnemy ? 0xff0000 : 0x000000, 1)
    g.fillRect(-3, -13, 2, 2)
    g.fillRect(2, -13, 2, 2)

    g.fillStyle(color, 1)
    g.fillRect(-5, 12, 3, 6)
    g.fillRect(2, 12, 3, 6)

    container.add(g)
    container.setSize(32, 32)
    return container
  }

  triggerBattle(enemy) {
    this.inBattle = true
    this.moveTarget = null
    this.battlingEnemy = enemy

    this.cameras.main.flash(300, 255, 255, 255)

    this.time.delayedCall(500, () => {
      this.scene.launch('BattleScene', {
        enemies: [enemy.enemyData],
        bg: 'bg',
      })
      this.scene.pause()
    })
  }

  resumeFromBattle(victory) {
    if (victory && this.battlingEnemy) {
      if (this.battlingEnemy.label) this.battlingEnemy.label.destroy()
      this.battlingEnemy.destroy()
      this.enemies = this.enemies.filter(e => e !== this.battlingEnemy)
    }

    this.inBattle = false
    this.battlingEnemy = null

    if (this.enemies.length === 0) {
      this.spawnEnemies()
    }

    this.scene.resume()
  }
}
