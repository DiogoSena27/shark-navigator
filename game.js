// ==========================================
// 1. SISTEMA DE PROGRESSO (Guarda no Navegador)
// ==========================================
const SharkProgress = {
    get: () => {
        const data = localStorage.getItem('shark_navigator_progress');
        return data ? JSON.parse(data) : { precision: 1, cargo: 1, navigation: 1 };
    },
    save: (skill, level) => {
        let current = SharkProgress.get();
        if (level >= current[skill]) {
            current[skill] = level + 1;
            localStorage.setItem('shark_navigator_progress', JSON.stringify(current));
        }
    }
};

// ==========================================
// 2. CENA DE BOOT (Carrega as imagens)
// ==========================================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        this.load.image('logo', 'shark-logo.png'); 
        this.load.image('lock', 'https://cdn-icons-png.flaticon.com/512/3064/3064155.png');
    }
    create() { 
        this.scene.start('MainMenu'); 
    }
}

// ==========================================
// 3. CENA DO MENU PRINCIPAL
// ==========================================
class MainMenu extends Phaser.Scene {
    constructor() { super('MainMenu'); }
    
    create() {
        this.cameras.main.setBackgroundColor('#161616'); 
        
        this.add.image(640, 180, 'logo').setScale(0.8);
        
        let titleText = this.add.text(640, 320, 'SHARK NAVIGATOR', { 
            font: '900 50px Nunito', 
            fill: '#ffffff',
            letterSpacing: 2 
        }).setOrigin(0.5);
        
        // Degradê Cyan-Magenta condizente com o logo
        titleText.setTint(0x00ffff, 0x00ffff, 0xff00ff, 0xff00ff);

        const skills = [
            { key: 'precision', label: 'PRECISÃO', color: 0xff00ff, y: 430 }, // Magenta
            { key: 'cargo', label: 'CARGA', color: 0x00ffff, y: 520 },    // NOVO: Azul Ciano
            { key: 'navigation', label: 'NAVEGAÇÃO', color: 0x9b59b6, y: 610 } // Roxo
        ];

        skills.forEach(skill => {
            let btn = this.add.container(640, skill.y);
            let bgGraphics = this.add.graphics();
            
            const drawButton = (isHover) => {
                bgGraphics.clear();
                bgGraphics.fillStyle(isHover ? 0x2a2a2a : 0x1a1a1a, 1); 
                bgGraphics.fillRoundedRect(-200, -35, 400, 70, 20); 
                bgGraphics.lineStyle(isHover ? 5 : 3, skill.color, 1); 
                bgGraphics.strokeRoundedRect(-200, -35, 400, 70, 20);
            };
            
            drawButton(false); 
            
            let txt = this.add.text(0, 0, skill.label, { font: '700 24px Nunito', fill: '#ffffff' }).setOrigin(0.5);
            
            btn.add([bgGraphics, txt]);
            btn.setSize(400, 70);
            btn.setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => { drawButton(true); btn.setScale(1.05); });
            btn.on('pointerout', () => { drawButton(false); btn.setScale(1); });
            btn.on('pointerdown', () => this.scene.start('LevelSelect', { skill: skill }));
        });
    }
}

// ==========================================
// 4. CENA DO SUBMENU (Seleção de Níveis)
// ==========================================
class LevelSelect extends Phaser.Scene {
    constructor() { super('LevelSelect'); }
    
    init(data) { 
        this.skill = data.skill; 
    }
    
    create() {
        this.cameras.main.setBackgroundColor('#161616');
        
        this.add.text(640, 100, `TREINO: ${this.skill.label}`, { 
            font: '900 40px Nunito', 
            fill: '#ffffff' 
        }).setOrigin(0.5).setTint(this.skill.color, this.skill.color, 0xffffff, 0xffffff);
        
        const progress = SharkProgress.get();
        const unlockedCount = progress[this.skill.key];

        for (let i = 1; i <= 5; i++) {
            let isLocked = i > unlockedCount;
            let x = 340 + (i - 1) * 150;
            let btn = this.add.container(x, 360);
            
            let bgGraphics = this.add.graphics();
            bgGraphics.fillStyle(isLocked ? 0x222222 : 0x1a1a1a, 1);
            bgGraphics.fillRoundedRect(-50, -50, 100, 100, 20);
            bgGraphics.lineStyle(3, isLocked ? 0x444444 : this.skill.color, 1);
            bgGraphics.strokeRoundedRect(-50, -50, 100, 100, 20);

            let txt = this.add.text(0, 0, i, { font: '900 40px Nunito', fill: isLocked ? '#444444' : '#ffffff' }).setOrigin(0.5);
            
            btn.add(bgGraphics);
            
            if (isLocked) {
                let lockImg = this.add.image(0, 0, 'lock').setDisplaySize(40, 40).setAlpha(0.3);
                btn.add(lockImg);
            } else {
                btn.add(txt);
                let hitArea = new Phaser.Geom.Rectangle(-50, -50, 100, 100);
                btn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
                
                btn.on('pointerover', () => { 
                    btn.setScale(1.1); 
                    bgGraphics.clear();
                    bgGraphics.fillStyle(0x2a2a2a, 1);
                    bgGraphics.fillRoundedRect(-50, -50, 100, 100, 20);
                    bgGraphics.lineStyle(5, this.skill.color, 1);
                    bgGraphics.strokeRoundedRect(-50, -50, 100, 100, 20);
                });
                btn.on('pointerout', () => { 
                    btn.setScale(1); 
                    bgGraphics.clear();
                    bgGraphics.fillStyle(0x1a1a1a, 1);
                    bgGraphics.fillRoundedRect(-50, -50, 100, 100, 20);
                    bgGraphics.lineStyle(3, this.skill.color, 1);
                    bgGraphics.strokeRoundedRect(-50, -50, 100, 100, 20);
                });
                btn.on('pointerdown', () => this.startLevel(i));
            }
        }

        let voltar = this.add.text(640, 600, '< VOLTAR AO MENU', { font: '700 24px Nunito', fill: '#aaaaaa' })
            .setOrigin(0.5).setInteractive({ useHandCursor: true });
            
        voltar.on('pointerover', () => voltar.setFill('#ffffff'));
        voltar.on('pointerout', () => voltar.setFill('#aaaaaa'));
        voltar.on('pointerdown', () => this.scene.start('MainMenu'));
    }

    startLevel(level) {
        this.scene.start('GamePlay', { skill: this.skill, level: level });
    }
}

// ==========================================
// 5. CENA DE JOGO 
// ==========================================
class GamePlay extends Phaser.Scene {
    constructor() { super('GamePlay'); }

    init(data) {
        this.skill = data.skill; 
        this.level = data.level;
        this.pontuacao = 0;
        this.alvosNecessarios = 10;
        this.jogoAcabou = false; 
    }

    create() {
        this.cameras.main.setBackgroundColor('#161616');

        this.add.text(640, 50, `TREINO DE ${this.skill.label} - NÍVEL ${this.level}`, { 
            font: '900 30px Nunito', fill: '#ffffff' 
        }).setOrigin(0.5).setTint(this.skill.color, this.skill.color, 0xffffff, 0xffffff);

        let btnVoltar = this.add.text(50, 35, '< DESISTIR', { font: '700 20px Nunito', fill: '#ff4444' })
            .setInteractive({ useHandCursor: true });
        btnVoltar.on('pointerdown', () => this.scene.start('LevelSelect', { skill: this.skill }));

        this.tempoInicio = this.time.now; 

        if (this.skill.key === 'precision') {
            this.alvosNecessarios = 10;
            this.textoPontuacao = this.add.text(640, 100, `ALVOS: ${this.pontuacao} / ${this.alvosNecessarios}`, { font: '700 40px Nunito', fill: '#ffffff' }).setOrigin(0.5);
            this.iniciarPrecisao();
        } 
        else if (this.skill.key === 'cargo') {
            this.alvosNecessarios = 2 + (this.level * 2); 
            this.textoPontuacao = this.add.text(640, 100, `ENTREGAS: ${this.pontuacao} / ${this.alvosNecessarios}`, { font: '700 40px Nunito', fill: '#ffffff' }).setOrigin(0.5);
            this.iniciarCarga();
        }
        else if (this.skill.key === 'navigation') {
            if (this.level === 4) this.alvosNecessarios = 60;
            else if (this.level === 5) this.alvosNecessarios = 100;
            else this.alvosNecessarios = 5 + (this.level * 5);

            this.textoPontuacao = this.add.text(640, 100, `ENERGIA: ${this.pontuacao} / ${this.alvosNecessarios}`, { font: '700 40px Nunito', fill: '#ffffff' }).setOrigin(0.5);
            this.iniciarNavegacao();
        }
    }

    // --- PRECISÃO ---
    iniciarPrecisao() {
        let tamanhoAlvo = 75 - (this.level * 11); 
        let x = Phaser.Math.Between(150, 1130);
        let y = Phaser.Math.Between(220, 600);
        let alvo = this.add.circle(x, y, tamanhoAlvo, this.skill.color).setStrokeStyle(this.level >= 4 ? 2 : 4, 0xffffff); 
        this.tweens.add({ targets: alvo, scale: { from: 0, to: 1 }, duration: 250, ease: 'Back.easeOut' });
        alvo.setInteractive({ useHandCursor: true });
        if (this.level > 1) {
            const moverAlvoRandom = () => {
                if (!alvo.active || this.jogoAcabou) return; 
                this.tweens.add({ targets: alvo, x: Phaser.Math.Between(150, 1130), y: Phaser.Math.Between(220, 600), duration: 2500 - (this.level * 420), ease: (this.level === 5) ? 'Linear' : 'Sine.easeInOut', onComplete: moverAlvoRandom });
            };
            this.time.delayedCall(300, moverAlvoRandom);
        }
        alvo.on('pointerdown', () => {
            alvo.input.enabled = false; 
            this.tweens.add({ targets: alvo, scale: 0, alpha: 0, duration: 200, ease: 'Power2', onComplete: () => alvo.destroy() });
            this.pontuacao++; 
            this.textoPontuacao.setText(`ALVOS: ${this.pontuacao} / ${this.alvosNecessarios}`); 
            if (this.pontuacao >= this.alvosNecessarios) this.vencerNivel();
            else this.iniciarPrecisao(); 
        });
    }

    // --- CARGA ---
    iniciarCarga() {
        let tamanhoBase = 120 - (this.level * 15); 
        let tamanhoItem = tamanhoBase * 0.7; 
        for (let i = 0; i < this.alvosNecessarios; i++) {
            let x = Phaser.Math.Between(850, 1150);
            let y = Phaser.Math.Between(200, 630);
            let base = this.add.rectangle(x, y, tamanhoBase, tamanhoBase, 0x000000, 0).setStrokeStyle(3, 0x444444);
            base.setInteractive({ dropZone: true }); 
            if (this.level === 2) this.tweens.add({ targets: base, x: x - 150, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            else if (this.level === 3) this.tweens.add({ targets: base, y: y - 250, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            else if (this.level === 4) {
                this.tweens.add({ targets: base, x: x - 200, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                this.tweens.add({ targets: base, y: y + 200, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            } else if (this.level === 5) {
                const moverBaseRandom = () => {
                    if (!base.active || this.jogoAcabou) return;
                    this.tweens.add({ targets: base, x: Phaser.Math.Between(800, 1200), y: Phaser.Math.Between(150, 650), duration: Phaser.Math.Between(400, 850), ease: 'Sine.easeInOut', onComplete: moverBaseRandom });
                };
                moverBaseRandom();
            }
        }
        for (let i = 0; i < this.alvosNecessarios; i++) {
            let item = this.add.rectangle(Phaser.Math.Between(100, 450), Phaser.Math.Between(200, 630), tamanhoItem, tamanhoItem, this.skill.color);
            item.setInteractive({ useHandCursor: true });
            this.input.setDraggable(item); 
            item.startX = item.x; item.startY = item.y;
        }
        this.input.on('dragstart', (pointer, gameObject) => { this.children.bringToTop(gameObject); gameObject.setStrokeStyle(3, 0xffffff); });
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => { gameObject.x = dragX; gameObject.y = dragY; });
        this.input.on('dragenter', (pointer, gameObject, dropZone) => { dropZone.setStrokeStyle(5, this.skill.color); });
        this.input.on('dragleave', (pointer, gameObject, dropZone) => { dropZone.setStrokeStyle(3, 0x444444); });
        this.input.on('drop', (pointer, gameObject, dropZone) => {
            gameObject.destroy(); 
            dropZone.setStrokeStyle(6, 0x00ff00); 
            dropZone.input.enabled = false; 
            this.tweens.add({ targets: dropZone, scale: 1.3, duration: 150, yoyo: true, ease: 'Quad.easeInOut' });
            this.pontuacao++;
            this.textoPontuacao.setText(`ENTREGAS: ${this.pontuacao} / ${this.alvosNecessarios}`);
            if (this.pontuacao >= this.alvosNecessarios) this.vencerNivel();
        });
        this.input.on('dragend', (pointer, gameObject, dropped) => {
            if (!dropped) {
                gameObject.setStrokeStyle(0);
                this.tweens.add({ targets: gameObject, x: gameObject.startX, y: gameObject.startY, duration: 300, ease: 'Back.easeOut' });
                this.tweens.add({ targets: gameObject, angle: { from: -10, to: 10 }, duration: 50, yoyo: true, repeat: 3 });
            }
        });
    }

    // --- NAVEGAÇÃO ---
    iniciarNavegacao() {
        this.energias = []; this.minas = [];
        this.jogador = this.add.circle(640, 360, 18, 0x161616).setStrokeStyle(4, this.skill.color);
        this.input.on('pointermove', (pointer) => {
            if (!this.jogoAcabou) { this.jogador.x = pointer.x; this.jogador.y = pointer.y; }
        });
        this.time.addEvent({
            delay: 1000 - (this.level * 160), loop: true,
            callback: () => {
                if (this.jogoAcabou) return;
                let startX = Phaser.Math.Between(50, 1230);
                let endX = startX + Phaser.Math.Between(-300, 300); 
                let energia = this.add.circle(startX, -50, 15, 0x00ff00);
                this.energias.push(energia);
                this.tweens.add({ targets: energia, y: 770, x: endX, duration: 3000 - (this.level * 400), onComplete: () => { energia.destroy(); Phaser.Utils.Array.Remove(this.energias, energia); } });
            }
        });
        if (this.level > 1) {
            this.time.addEvent({
                delay: 1500 - (this.level * 250), loop: true,
                callback: () => {
                    if (this.jogoAcabou) return;
                    let startX = Phaser.Math.Between(50, 1230);
                    let endX = startX + Phaser.Math.Between(-400, 400); 
                    let mina = this.add.circle(startX, -50, 20, 0xff0000);
                    this.minas.push(mina);
                    this.tweens.add({ targets: mina, y: 770, x: endX, duration: 2800 - (this.level * 450), onComplete: () => { mina.destroy(); Phaser.Utils.Array.Remove(this.minas, mina); } });
                }
            });
        }
    }

    update() {
        if (this.jogoAcabou || this.skill.key !== 'navigation') return;
        for (let i = this.energias.length - 1; i >= 0; i--) {
            let energia = this.energias[i];
            if (Phaser.Math.Distance.Between(this.jogador.x, this.jogador.y, energia.x, energia.y) < 33) {
                energia.destroy(); this.energias.splice(i, 1);
                this.pontuacao++; this.textoPontuacao.setText(`ENERGIA: ${this.pontuacao} / ${this.alvosNecessarios}`);
                let fx = this.add.circle(this.jogador.x, this.jogador.y, 15, 0x00ff00);
                this.tweens.add({ targets: fx, scale: 3, alpha: 0, duration: 300, onComplete: () => fx.destroy() });
                if (this.pontuacao >= this.alvosNecessarios) this.vencerNivel();
            }
        }
        for (let i = this.minas.length - 1; i >= 0; i--) {
            let mina = this.minas[i];
            if (Phaser.Math.Distance.Between(this.jogador.x, this.jogador.y, mina.x, mina.y) < 45) {
                mina.destroy(); this.minas.splice(i, 1);
                if (this.pontuacao > 0) { this.pontuacao--; this.textoPontuacao.setText(`ENERGIA: ${this.pontuacao} / ${this.alvosNecessarios}`); }
                this.cameras.main.shake(150, 0.005);
                let fx = this.add.circle(this.jogador.x, this.jogador.y, 20, 0xff0000);
                this.tweens.add({ targets: fx, scale: 3, alpha: 0, duration: 300, onComplete: () => fx.destroy() });
            }
        }
    }

    vencerNivel() {
        this.jogoAcabou = true; 
        if (this.jogador) this.jogador.destroy(); 
        let tempoFinal = (this.time.now - this.tempoInicio) / 1000;
        SharkProgress.save(this.skill.key, this.level);
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.85);
        this.add.text(640, 250, 'OBJETIVO CONCLUÍDO!', { font: '900 60px Nunito', fill: '#00ff00' }).setOrigin(0.5);
        this.add.text(640, 330, `TEMPO: ${tempoFinal.toFixed(2)}s`, { font: '700 40px Nunito', fill: '#ffffff' }).setOrigin(0.5);
        let btnMenu = this.add.text(440, 480, '[ MENU DE NÍVEIS ]', { font: '700 24px Nunito', fill: '#aaaaaa' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btnMenu.on('pointerover', () => btnMenu.setFill('#ffffff'));
        btnMenu.on('pointerout', () => btnMenu.setFill('#aaaaaa'));
        btnMenu.on('pointerdown', () => this.scene.start('LevelSelect', { skill: this.skill }));
        if (this.level < 5) {
            let btnProximo = this.add.container(840, 480);
            let bgGraphics = this.add.graphics();
            const drawProximo = (isHover) => {
                bgGraphics.clear();
                bgGraphics.fillStyle(isHover ? 0x2a2a2a : 0x1a1a1a, 1); 
                bgGraphics.fillRoundedRect(-120, -30, 240, 60, 15); 
                bgGraphics.lineStyle(isHover ? 4 : 2, this.skill.color, 1); 
                bgGraphics.strokeRoundedRect(-120, -30, 240, 60, 15);
            };
            drawProximo(false);
            let txtProximo = this.add.text(0, 0, 'PRÓXIMO NÍVEL >', { font: '900 20px Nunito', fill: '#ffffff' }).setOrigin(0.5);
            btnProximo.add([bgGraphics, txtProximo]);
            btnProximo.setSize(240, 60); btnProximo.setInteractive({ useHandCursor: true });
            btnProximo.on('pointerover', () => { drawProximo(true); btnProximo.setScale(1.05); });
            btnProximo.on('pointerout', () => { drawProximo(false); btnProximo.setScale(1); });
            btnProximo.on('pointerdown', () => this.scene.start('GamePlay', { skill: this.skill, level: this.level + 1 }));
        } else {
            let btnRepetirColorHex = '#' + this.skill.color.toString(16).padStart(6, '0');
            let btnRepetir = this.add.text(840, 480, '[ TENTAR BATER O TEMPO ]', { font: '700 24px Nunito', fill: btnRepetirColorHex })
                .setOrigin(0.5).setInteractive({ useHandCursor: true });
            btnRepetir.on('pointerover', () => { btnRepetir.setFill('#ffffff'); btnRepetir.setScale(1.05); });
            btnRepetir.on('pointerout', () => { btnRepetir.setFill(btnRepetirColorHex); btnRepetir.setScale(1); });
            btnRepetir.on('pointerdown', () => this.scene.start('GamePlay', { skill: this.skill, level: this.level }));
        }
    }
}

// Arranque
const config = {
    type: Phaser.AUTO, width: 1280, height: 720, backgroundColor: '#161616',
    scene: [BootScene, MainMenu, LevelSelect, GamePlay] 
};
const game = new Phaser.Game(config);