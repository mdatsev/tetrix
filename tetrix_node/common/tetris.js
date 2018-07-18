// @ts-check
import Mino from "./mino.js"
export default class Tetris {
    constructor(pieces) {
        this.pieces = pieces
        this.width = 10
        this.height = 22
        this.tile_size = 25
        this.active_mino = null
        this.fallen_minos = []
        this.dead = false
        this.right_pressed_time = Infinity
        this.left_pressed_time = Infinity
    }

    spawn_mino() {
        const letters = [...'LJSZTOI']
        const letter = letters[Math.floor(Math.random()*letters.length)];
        const srs_mino = [...this.pieces[letter]]
        this.active_mino = new Mino(srs_mino, Math.floor((this.width - srs_mino.length) / 2), 0, {letter})
        
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