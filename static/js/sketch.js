// @ts-check
/// <reference path="../vendor/p5.d.ts" />
new p5(( /** @type {p5} */ p) => {

    let keybinds = {
        'MOVE_LEFT':  37, // LEFT_ARROW
        'ROTATE_CW': 88, // X
        'ROTATE_CCW': 90, // Z
        'MOVE_RIGHT': 39, // RIGHT_ARROW
        'SOFT_DROP':  40, // DOWN_ARROW
        'HARD_DROP': 32, // SPACE
    }

    class Mino {
        constructor(rotations, textures, x, y, tile_size, skin) {
            this.rotations = rotations
            this.textures = textures
            this.x = x
            this.y = y
            this.tile_size = tile_size
            this.current_rotation = 0
            this.skin = skin 
            this.last_drop_tick = performance.now()
        }

        render() {
            const tiles = this.get_tiles_on_board()
            const ts = this.tile_size;
            for(const tile of tiles) {
                p.image(this.skin, ts * (tile[0]), ts * (tile[1]), ts, ts)
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

        clone() {
            const m = new Mino(this.rotations.slice(0), this.textures, this.x, this.y, this.tile_size, this.skin);
            m.current_rotation = this.current_rotation;
            return m;
        }
    }

    class Tetris {
        constructor() {
            this.width = 10
            this.height = 22
            this.tile_size = 25
            this.active_mino = null
            this.fallen_minos = []
            this.dead = false
            this.right_pressed_time = Infinity
            this.left_pressed_time = Infinity
        }

        render() {
            p.background(0)
            for (const mino of this.fallen_minos) {
                mino.render()
            }
            p.fill([255, 0, 0])
            
            this.active_mino.render()
            this.render_ghost()
        }

        render_ghost() {
            let ghost = this.active_mino.clone()
            while(this.tick_down(false, ghost))
                ;
            
            ghost.render()
        }

        spawn_mino() {
            const srs_mino = SRS_tiles[p.random([...'LJSZTOI'])].slice(0)
            let skin = p.loadImage("textures/skin"+(Math.floor(Math.random() * 4)+1).toString()+".png");
            this.active_mino = new Mino(srs_mino, null, Math.floor((this.width - srs_mino.length) / 2), 0, this.tile_size, skin)
            
            if(this.mino_collides())
                this.dead = true
        }

        lock_mino() {
            this.fallen_minos.push(this.active_mino);
        }

        update() {
            this.time = performance.now()
            if(this.time - this.right_pressed_time > 119)
            {
                while(this.rightPressed())
                    ;
                this.right_pressed_time = Infinity
            }
            if(this.time - this.left_pressed_time > 119)
            {
                while(this.leftPressed())
                    ;
                this.left_pressed_time = Infinity
            }
            if(this.active_mino instanceof Mino) {
                if(this.time - this.active_mino.last_drop_tick > (this.soft_dropping ? 50 : 400))
                {
                    this.tick_down()
                }
            }
            else {
                this.spawn_mino()
            }
            this.check_clear()
        }

        tick_down(spawn = true, mino = this.active_mino) {
            mino.y++
            if(this.mino_collides(mino)) {
                mino.y--
                if(spawn)
                {
                    this.lock_mino()
                    this.spawn_mino()
                }
                return false
            }
            mino.last_drop_tick = performance.now()
            return true
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

        mino_collides(mino = this.active_mino) {
            return this.get_solid_tiles()
                    .some(t => mino.get_tiles_on_board()
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
            if(this.mino_collides())
                this.active_mino.rotate_ccw()
        }

        rotate_ccw() {
            this.active_mino.rotate_ccw()
            if(this.mino_collides())
                this.active_mino.rotate_cw()
        }

        leftPressed() {
            this.active_mino.x--;
            if(this.mino_collides())
            {
                this.active_mino.x++;
                return false
            }
            this.left_pressed_time = performance.now()
            return true
        }

        leftReleased() {
            this.left_pressed_time = Infinity
        }

        rightPressed() {
            this.active_mino.x++;
            if(this.mino_collides())
            {
                this.active_mino.x--;
                return false
            }
            this.right_pressed_time = performance.now()
            return true
        }

        rightReleased() {
            this.right_pressed_time = Infinity
        }

        softDropPressed() {
            this.soft_dropping = true;
        }

        softDropReleased() {
            this.soft_dropping = false;
        }

        hard_drop() {
            while(this.tick_down())
                ;
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
        const canvas = p.createCanvas(tetris.width * tetris.tile_size, tetris.height * tetris.tile_size)
        // canvas.parent('sketch-holder')
    }
    
    p.draw = () => {
        if(!tetris.dead)
        {
            tetris.update()
            tetris.render()
        }
        else
        {
            alert('you die')
            tetris = new Tetris()
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