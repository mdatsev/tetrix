// @ts-check
/// <reference path="../vendor/p5.d.ts" />
new p5(( /** @type {p5} */ p) => {

    let keybinds = {
        'MOVE_LEFT':  37, // LEFT_ARROW
        'ROTATE_CW': 88, // X
        'ROTATE_CCW': 90, // Z
        'MOVE_RIGHT': 39, // RIGHT_ARROW
        'SOFT_DROP':  40  // SOFT_DROP
    }

    class Mino {
        constructor(rotations, textures, x, y, tile_size) {
            this.rotations = rotations
            this.textures = textures
            this.x = x
            this.y = y
            this.tile_size = tile_size
            this.current_rotation = 0
        }

        render() {
            const tiles = this.get_tiles_on_board()
            const ts = this.tile_size;
            p.fill(255)
            for(const tile of tiles) {
                p.rect(ts * (tile[0]), ts * (tile[1]), ts, ts)
            }
        }

        rotate_cw() {
            if(++this.current_rotation > this.rotations.length - 1)
                this.current_rotation = 0
        }

        rotate_ccw() {
            if(--this.current_rotation < 0)
                this.current_rotation = this.rotations.length - 1
        }

        get_tiles() {
            return this.rotations[this.current_rotation]
        }

        get_tiles_on_board() {
            return this.rotations[this.current_rotation].map(t => [t[0] + this.x, t[1] + this.y])
        }

        destroy_tile_on_board(tile) {
            tile = [tile[0] - this.x, tile[1] - this.y]
            this.rotations[this.current_rotation] =
            this.rotations[this.current_rotation]
                .filter(t => t[0] != tile[0] || t[1] != tile[1])
                .map(t => t[1] < tile[1] && t[0] == tile[0] ? [t[0], t[1] + 1] : t)
        }
    }

    class Tetris {
        constructor() {
            this.width = 10
            this.height = 22
            this.tile_size = 20
            this.active_mino = null
            this.fallen_minos = []
            this.last_drop_tick = performance.now()
        }

        render() {
            for (const mino of this.fallen_minos) {
                mino.render()
            }
            p.fill([255, 0, 0])
            let ts = 20;
            for(const tile of this.get_solid_tiles()) {
                p.rect(ts * (tile[0]), ts * (tile[1]), ts, ts)
            }
            this.active_mino.render()
        }

        spawn_mino() {
            const srs_mino = SRS_tiles[p.random([...'LJSZTOI'])].slice(0)
            this.active_mino = new Mino(srs_mino, null, Math.floor((this.width - srs_mino.length) / 2), 0, this.tile_size)
            
            if(this.active_mino_collides())
                alert('You die')
        }

        lock_mino() {
            this.fallen_minos.push(this.active_mino);
        }

        update() {
            this.time = performance.now()
            if(this.active_mino instanceof Mino) {
                if(this.time - this.last_drop_tick > (this.soft_dropping ? 50 : 400))
                {
                    this.active_mino.y++
                    this.last_drop_tick = performance.now()
                }
                if(this.active_mino_collides()) {
                    this.active_mino.y--
                    this.lock_mino()
                    this.spawn_mino()
                }
            }
            else {
                this.spawn_mino()
            }
            this.check_clear()
        }

        check_clear() {
            let lines = new Array(this.height).fill(null).map(_=>[])
            for(const tile of this.get_real_solid_tiles())
            {
                lines[tile[1]].push(tile)
            }
            for(const line of lines)
            {
                if(line.length == this.width)
                {
                    for(let mino of this.fallen_minos)
                    {
                        for(const tile of line)
                        {
                            mino.destroy_tile_on_board(tile)
                        }
                    }
                }
            }
        }

        active_mino_collides() {
            return this.get_solid_tiles()
                    .some(t => this.active_mino.get_tiles_on_board()
                        .some(t1 => t[0] == t1[0] && 
                                    t[1] == t1[1]))
        }

        get_solid_tiles() {
            const widths = [...Array(this.width).keys()];
            const heights = [...Array(this.height).keys()]
            return this.get_real_solid_tiles()
                .concat(widths.map(e => [e, -1]))
                .concat(heights.map(e => [-1, e]))
                .concat(widths.map(e => [e, this.height]))
                .concat(heights.map(e => [this.width, e]))
        }

        get_real_solid_tiles() {
            return this.fallen_minos
                .map(mino => mino.get_tiles_on_board())
                .reduce((a, e) => a.concat(e), [])
                .filter(e => e[1] < this.height)
        }

        rotate_cw() {
            this.active_mino.rotate_cw()
            if(this.active_mino_collides())
                this.active_mino.rotate_ccw()
        }

        rotate_ccw() {
            this.active_mino.rotate_ccw()
            if(this.active_mino_collides())
                this.active_mino.rotate_cw()
        }

        leftPressed() {
            this.active_mino.x--;
            if(this.active_mino_collides())
                this.active_mino.x++;
        }

        leftReleased() {

        }

        rightPressed() {
            this.active_mino.x++;
            if(this.active_mino_collides())
                this.active_mino.x--;
        }

        rightReleased() {

        }

        softDropPressed() {
            this.soft_dropping = true;
        }

        softDropReleased() {
            this.soft_dropping = false;
        }
    }

    let SRS
    let SRS_tiles = {}
    let tetris = new Tetris()

    p.preload = () => {
        SRS = p.loadJSON('/data/SRS.json')
    }

    p.setup = () => {
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
        p.createCanvas(tetris.width * tetris.tile_size, tetris.height * tetris.tile_size)
    }
    
    p.draw = () => {
        p.background(0)
        tetris.update()
        tetris.render()
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