import Mino from "/common/mino.js"
import Tetris from "/common/tetris.js"
// @ts-check
/// <reference path="../vendor/p5.d.ts" />
new p5(( /** @type {p5} */ p) => {

    let default_skin, ghost_skin

    let keybinds = {
        'MOVE_LEFT':  37, // LEFT_ARROW
        'ROTATE_CW':  88, // X
        'ROTATE_CCW': 90, // Z
        'MOVE_RIGHT': 39, // RIGHT_ARROW
        'SOFT_DROP':  40, // DOWN_ARROW
        'HARD_DROP':  32, // SPACE
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
    }

    
    let SRS
    let SRS_tiles = {}
    let SRS_wallkick
    let tetris
    let renderer = new TetrisRenderer()

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
        const canvas = p.createCanvas(tetris.width * renderer.tile_size, tetris.height * renderer.tile_size)
        canvas.parent('sketch-holder')
    }
    
    p.draw = () => {
        if(!tetris.dead)
        {
            tetris.update()
            renderer.render(tetris)
        }
        else
        {
            alert('you die')
            tetris = new Tetris(SRS_tiles)
        }
    }

    p.keyPressed = () => {
        switch(p.keyCode) {
            case keybinds['MOVE_LEFT']:
                tetris.leftPressed()
                break;
            case keybinds['ROTATE_CW']:
                tetris.rotate_cw()
                break;
            case keybinds['ROTATE_CCW']:
                tetris.rotate_ccw()
                break;
            case keybinds['MOVE_RIGHT']:
                tetris.rightPressed()
                break;
            case keybinds['SOFT_DROP']:
                tetris.softDropPressed()
                break;
            case keybinds['HARD_DROP']:
                tetris.hard_drop()
                break;
        }
    }

    p.keyReleased = () => {
        switch(p.keyCode) {
            case keybinds['MOVE_LEFT']:
                tetris.leftReleased()
                break;
            case keybinds['MOVE_RIGHT']:
                tetris.rightReleased()
                break;
            case keybinds['SOFT_DROP']:
                tetris.softDropReleased()
                break;
        }
    }
})