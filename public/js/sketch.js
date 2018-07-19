// @ts-check
/// <reference path="../vendor/p5.d.ts" />
import Mino from "/common/mino.js"
import Tetris from "/common/tetris.js"

new p5(( /** @type {p5} */ p) => {
    let default_skin, ghost_skin
    let keybinds = {
        'MOVE_LEFT':  [37, 65],         // LEFT_ARROW, A
        'ROTATE_CW':  [38, 87, 88],     // UP_ARROW, W, X
        'ROTATE_CCW': [17, 90],         // CONTROL, Z
        'MOVE_RIGHT': [39, 68],         // RIGHT_ARROW, D
        'SOFT_DROP':  [40, 83],         // DOWN_ARROW, S
        'HARD_DROP':  [32],             // SPACE
        'HOLD_MINO':  [16, 67],         // SHIFT, C
        'PAUSE':      [27, 112],        // ESC, F1

    }

    class MinoRenderer {
        constructor({tile_size}) {
            this.tile_size = tile_size
        }
        render(mino) {
            const tiles = mino.get_tiles_on_board()
            const ts = this.tile_size;
            for(const tile of tiles) {
                p.image(mino.meta.ghost ? ghost_skin : default_skin, ts * (tile[0]), ts * (tile[1]), ts, ts)
            }
        }
    }

    class TetrisRenderer {
        constructor() {
            this.tile_size = 25
            this.queue_size = 5;
            this.mino_renderer = new MinoRenderer({tile_size: this.tile_size})
        }
        render(tetris) {
            p.background(0)
            for (const mino of tetris.fallen_minos) {
                this.mino_renderer.render(mino)
            }
            p.fill([255, 0, 0])
            
            this.render_ghost()
            this.mino_renderer.render(tetris.active_mino)
        }

        render_ghost() {
            let ghost = tetris.active_mino.clone()
            while(tetris.tick_down(false, ghost))
                ;
            
            ghost.meta.ghost = true
            this.mino_renderer.render(ghost)
        }

        render_queue() {
            let x = (tetris.width + 0.5) * this.tile_size, y = tetris.height * this.tile_size
            p.stroke(153);
            p.strokeWeight(this.tile_size)
            p.line(x, 0, x, y)
            if(tetris.minos_bag.length > 0) {
                let minos_bag_clone = [...tetris.minos_bag.slice(0, this.queue_size)]
                //console.log(minos_bag_clone )
                let mino_pos_start = 1;
                minos_bag_clone
                    .forEach(m => {
                        let mino = new Mino(SRS_tiles[m], tetris.width + 2, mino_pos_start, m)
                        this.mino_renderer.render(mino)
                        mino_pos_start += 4;
                    })
            }
        }
    }
    
    
    let SRS
    let SRS_tiles = {}
    let SRS_wallkick
    let tetris
    let renderer = new TetrisRenderer()
    let paused = false

    p.preload = () => {
        SRS = p.loadJSON('/data/SRS_rotations.json')
        SRS_wallkick = p.loadJSON('/data/SRS_wallkicks.json')
        default_skin = p.loadImage("textures/skin.png")
        ghost_skin = p.loadImage("textures/ghost.png")
    }

    p.setup = () => {
        tetris = new Tetris(SRS_tiles, SRS_wallkick)
        for (const mino in SRS) {
            SRS_tiles[mino] = SRS[mino]
                .map(rotation => {
                    let tiles = []
                    for (let i = 0; i < rotation.length; i++) {
                        for (let j = 0; j < rotation[i].length; j++) {
                            if (rotation[i][j] == '#')
                                tiles.push([j, i])
                        }
                    }
                    return tiles
                })
        }
        const canvas = p.createCanvas((tetris.width + 6) * renderer.tile_size, tetris.height * renderer.tile_size)
        canvas.parent('sketch-holder')
    }
    
    p.draw = () => {
        if(!tetris.dead)
        {
            tetris.update()
            renderer.render(tetris)
            renderer.render_queue()
        }
        else if(!paused)
        {
            alert('you die')
            tetris = new Tetris(SRS_tiles)
        }
    }

    p.keyPressed = () => {
        switch(true) {
            case keybinds['MOVE_LEFT'].includes(p.keyCode):
                tetris.leftPressed()
                break;
            case keybinds['ROTATE_CW'].includes(p.keyCode):
                tetris.rotate_cw()
                break;
            case keybinds['ROTATE_CCW'].includes(p.keyCode):
                tetris.rotate_ccw()
                break;
            case keybinds['MOVE_RIGHT'].includes(p.keyCode):
                tetris.rightPressed()
                break;
            case keybinds['SOFT_DROP'].includes(p.keyCode):
                tetris.softDropPressed()
                break;
            case keybinds['HARD_DROP'].includes(p.keyCode):
                tetris.hard_drop()
                break;
            case keybinds['HOLD_MINO'].includes(p.keyCode):
                tetris.hold_mino()
                
        }
    }

    p.keyReleased = () => {
        switch(true) {
            case keybinds['MOVE_LEFT'].includes(p.keyCode):
                tetris.leftReleased()
                break;
            case keybinds['MOVE_RIGHT'].includes(p.keyCode):
                tetris.rightReleased()
                break;
            case keybinds['SOFT_DROP'].includes(p.keyCode):
                tetris.softDropReleased()
                break;
        }
    }
})