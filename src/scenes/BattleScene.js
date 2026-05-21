// 战斗场景 — 敌人左，主角右，HP 气泡

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' })
    this.enemies = []
    this.playerUnit = null
    this.enemyUnits = []
    this.turn = 'player'
    this.battleOver = false
  }

  init(data) {
    this.enemyData = data.enemies || []
    this.bgKey = data.bg || 'bg'
  }

  create() {
    const { width, height } = this.scale
    this.battleOver = false
    this.turn = 'player'

    // 背景
    const bg = this.add.image(width / 2, height / 2, this.bgKey)
    bg.setDisplaySize(width, height)

    // 半透明暗化
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3)

    // 战斗UI底色
    this.add.rectangle(width / 2, height - 60, width, 120, 0x000000, 0.6).setDepth(20)

    // 状态文字
    this.statusText = this.add.text(width / 2, height - 15, '你的回合 — 点击敌人攻击', {
      fontSize: '16px', color: '#ffd32a',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(25)

    this.logText = this.add.text(20, height - 105, '', {
      fontSize: '13px', color: '#aaa',
    }).setDepth(25)

    // 生成玩家（右侧）— 使用图片
    const px = width * 0.7, py = height * 0.4
    this.playerUnit = this.createPlayerBattleUnit(px, py, '勇者', 30, 30, 10)

    // 生成敌人（左侧，按数量分布）
    const count = Math.min(this.enemyData.length, 4)
    for (let i = 0; i < count; i++) {
      const data = this.enemyData[i]
      const ex = width * 0.15 + (i % 2) * 120
      const ey = height * 0.25 + Math.floor(i / 2) * 180
      const unit = this.createBattleUnit(ex, ey, 0xd63031, true, data.name, data.hp, data.maxHp, data.atk)
      unit.on('pointerdown', () => this.onClickEnemy(unit))
      this.enemyUnits.push(unit)
    }
  }

  createPlayerBattleUnit(x, y, name, hp, maxHp, atk) {
    const container = this.add.container(x, y).setDepth(10)

    // 玩家图片 — 朝左（面对敌人）
    const playerImg = this.add.image(0, 0, 'player')
    playerImg.setScale(0.13)
    // 图片本身已朝左，不用翻转
    playerImg.setOrigin(0.5, 0.5)
    container.add(playerImg)

    // 名字
    const label = this.add.text(0, -45, name, {
      fontSize: '14px', color: '#fff',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5)
    container.add(label)

    // HP 气泡
    const hpText = this.add.text(0, 20, `${hp}/${maxHp}`, {
      fontSize: '12px', color: '#fff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(15)
    container.add(hpText)

    const hpBg = this.add.graphics().setDepth(14)
    hpBg.fillStyle(0x000000, 0.7)
    hpBg.fillRoundedRect(-(hpText.width + 12) / 2, 12, hpText.width + 12, 18, 4)
    container.add(hpBg)

    const hpBar = this.add.graphics().setDepth(15)
    hpBar.fillStyle(0x000000, 0.5)
    hpBar.fillRect(-25, 34, 50, 5)
    hpBar.fillStyle(0x00b894, 1)
    hpBar.fillRect(-25, 34, 50, 5)
    container.add(hpBar)

    container.unitData = { name, hp, maxHp, atk, isEnemy: false }
    container.hpText = hpText
    container.hpBg = hpBg
    container.hpBar = hpBar

    return container
  }

  createBattleUnit(x, y, color, isEnemy, name, hp, maxHp, atk) {
    const container = this.add.container(x, y).setDepth(10)

    // 像素角色（比大地图大一些）
    const g = this.add.graphics()
    const scale = 1.5
    const s = (v) => v * scale

    g.fillStyle(color, 1)
    g.fillRect(s(-8), s(-4), s(16), s(16))  // 身体

    g.fillStyle(isEnemy ? 0xd63031 : 0xfeca57, 1)
    g.fillRect(s(-6), s(-16), s(12), s(12)) // 头

    g.fillStyle(0xffffff, 1)
    g.fillRect(s(-4), s(-14), s(3), s(3))
    g.fillRect(s(1), s(-14), s(3), s(3))
    g.fillStyle(isEnemy ? 0xff0000 : 0x000000, 1)
    g.fillRect(s(-3), s(-13), s(2), s(2))
    g.fillRect(s(2), s(-13), s(2), s(2))

    g.fillStyle(color, 1)
    g.fillRect(s(-5), s(12), s(3), s(6))
    g.fillRect(s(2), s(12), s(3), s(6))

    container.add(g)

    // 交互区域
    container.setSize(50, 60)
    if (isEnemy) container.setInteractive()

    // 名字
    const label = this.add.text(0, s(-26), name, {
      fontSize: '12px', color: '#fff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5)
    container.add(label)

    // === HP 气泡（对话气泡风格）===
    const hpText = this.add.text(0, s(20), `${hp}/${maxHp}`, {
      fontSize: '11px', color: '#fff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(15)
    container.add(hpText)

    // HP 气泡背景（圆角矩形）
    const hpBg = this.add.graphics().setDepth(14)
    const bubbleW = hpText.width + 12
    const bubbleH = 18
    hpBg.fillStyle(0x000000, 0.7)
    hpBg.fillRoundedRect(-bubbleW / 2, s(20) - 8, bubbleW, bubbleH, 4)
    container.add(hpBg)

    // HP 条（在气泡下方）
    const hpBar = this.add.graphics().setDepth(15)
    hpBar.fillStyle(0x000000, 0.5)
    hpBar.fillRect(-20, s(20) + 14, 40, 4)
    hpBar.fillStyle(0x00b894, 1)
    hpBar.fillRect(-20, s(20) + 14, 40, 4)
    container.add(hpBar)

    // 存储数据
    container.unitData = { name, hp, maxHp, atk, isEnemy }
    container.hpText = hpText
    container.hpBg = hpBg
    container.hpBar = hpBar

    return container
  }

  updateHpBar(unit) {
    const data = unit.unitData
    const ratio = Math.max(0, data.hp / data.maxHp)

    // 更新气泡文字
    unit.hpText.setText(`${data.hp}/${data.maxHp}`)

    // 更新气泡背景宽度
    unit.hpBg.clear()
    const bubbleW = unit.hpText.width + 12
    unit.hpBg.fillStyle(0x000000, 0.7)
    unit.hpBg.fillRoundedRect(-bubbleW / 2, 22, bubbleW, 18, 4)

    // 更新血条
    unit.hpBar.clear()
    unit.hpBar.fillStyle(0x000000, 0.5)
    unit.hpBar.fillRect(-20, 44, 40, 4)
    const barColor = ratio > 0.3 ? 0x00b894 : (ratio > 0.1 ? 0xf9ca24 : 0xd63031)
    unit.hpBar.fillStyle(barColor, 1)
    unit.hpBar.fillRect(-20, 44, 40 * ratio, 4)
  }

  onClickEnemy(enemy) {
    if (this.turn !== 'player' || this.battleOver || !enemy.active) return
    this.attackUnit(this.playerUnit, enemy)
  }

  attackUnit(attacker, defender) {
    const atk = attacker.unitData.atk
    const dmg = Phaser.Math.Between(atk - 3, atk + 3)
    const data = defender.unitData
    data.hp = Math.max(0, data.hp - dmg)

    this.updateHpBar(defender)
    this.showDamage(defender.x, defender.y - 30, `-${dmg}`, '#ff6b6b')

    this.addLog(`${attacker.unitData.name} 攻击 ${data.name}，${dmg} 点伤害`)

    // 震动
    this.tweens.add({ targets: defender, x: defender.x + 6, yoyo: true, duration: 50, repeat: 2 })

    if (data.hp <= 0) {
      this.killUnit(defender)
    }

    this.endPlayerTurn()
  }

  killUnit(unit) {
    this.tweens.add({
      targets: unit, alpha: 0, scale: 0.3, duration: 400,
      onComplete: () => {
        unit.destroy()
        this.enemyUnits = this.enemyUnits.filter(u => u !== unit)
        this.addLog(`${unit.unitData.name} 被击败！`)

        if (this.enemyUnits.length === 0) {
          this.battleOver = true
          this.addLog('🎉 战斗胜利！')
          this.statusText.setText('🎉 胜利！点击返回')
          this.input.once('pointerdown', () => this.returnToOverworld())
        }
      },
    })
  }

  showDamage(x, y, text, color) {
    const dmgText = this.add.text(x, y, text, {
      fontSize: '20px', color, fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(50)

    this.tweens.add({
      targets: dmgText, y: y - 50, alpha: 0,
      duration: 900, onComplete: () => dmgText.destroy(),
    })
  }

  endPlayerTurn() {
    this.turn = 'enemy'
    this.statusText.setText('👹 敌人回合…')
    this.time.delayedCall(800, () => this.enemyTurn())
  }

  enemyTurn() {
    if (this.battleOver || this.enemyUnits.length === 0) return

    this.enemyUnits.forEach((enemy, i) => {
      this.time.delayedCall(i * 600, () => {
        if (!enemy.active || this.battleOver || !this.playerUnit.active) return

        const atk = enemy.unitData.atk
        const dmg = Phaser.Math.Between(atk - 2, atk + 2)
        this.playerUnit.unitData.hp = Math.max(0, this.playerUnit.unitData.hp - dmg)

        this.updateHpBar(this.playerUnit)
        this.showDamage(this.playerUnit.x, this.playerUnit.y - 30, `-${dmg}`, '#ff6b6b')
        this.addLog(`${enemy.unitData.name} 反击，${dmg} 点伤害`)
        this.tweens.add({ targets: this.playerUnit, x: this.playerUnit.x + 6, yoyo: true, duration: 50, repeat: 2 })

        if (this.playerUnit.unitData.hp <= 0) {
          this.battleOver = true
          this.tweens.add({
            targets: this.playerUnit, alpha: 0, scale: 0.3, duration: 400,
            onComplete: () => {
              this.addLog('💀 勇者倒下了…')
              this.statusText.setText('💀 败北… 点击重新开始')
              this.input.once('pointerdown', () => {
                this.scene.stop()
                this.scene.get('OverworldScene').scene.restart()
              })
            },
          })
        }
      })
    })

    this.time.delayedCall(this.enemyUnits.length * 600 + 400, () => {
      if (!this.battleOver) {
        this.turn = 'player'
        this.statusText.setText('👤 你的回合 — 点击敌人攻击')
      }
    })
  }

  returnToOverworld() {
    this.scene.stop()
    const overworld = this.scene.get('OverworldScene')
    overworld.resumeFromBattle(true)
  }

  addLog(msg) {
    const logs = this.logText.text.split('\n').filter(l => l)
    logs.push(msg)
    if (logs.length > 3) logs.shift()
    this.logText.setText(logs.join('\n'))
  }
}
