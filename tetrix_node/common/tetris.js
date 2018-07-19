// @ts-check
import Mino from "./mino.js"
export default class Tetris {
    constructor(pieces, wallkick_data) {
        this.pieces = pieces
        this.wallkick_data = wallkick_data || {'default': [[0, 0]]}
        this.width = 10
        this.height = 22
        this.active_mino = null
        this.fallen_minos = []
        this.minos_bag = []
        this.dead = false
        this.right_pressed_time = Infinity
        this.left_pressed_time = Infinity
        this.dasing_left = false
        this.dasing_right = false
        this.input_priorities = []
        this.moved_left = true
        this.moved_right = true
    }

    spawn_mino() {
        if(this.minos_bag.length == 0) {
            this.generate_bag();
        }
        console.log(this.minos_bag);
        const letter = this.minos_bag.pop();
        console.log(letter);
        const srs_mino = [...this.pieces[letter]]
        this.active_mino = new Mino(srs_mino, Math.floor((this.width - srs_mino.length) / 2), 0, {letter})
        
        if(this.mino_collides())
            this.dead = true
    }

    generate_bag() {
        const letters = [...'LJSZTOI']
        this.minos_bag = shuffle(letters);
        console.log("Mino" + this.minos_bag);
    }

    lock_mino() {
        this.fallen_minos.push(this.active_mino);
    }

    update() {
        this.time = performance.now()
        if(this.time - this.right_pressed_time > 400) {
            if(!this.input_priorities.includes('right_das'))
                this.input_priorities.push('right_das')
        }
        if(this.time - this.left_pressed_time > 400) {
            if(!this.input_priorities.includes('left_das'))
                this.input_priorities.push('left_das')
        }
        for(const input of this.input_priorities) {
            switch(input) {
                case 'left':
                    if(this.moved_left) break;
                    this.move_left()
                    this.moved_left = true
                    break;
                case 'right':
                    if(this.moved_right) break;
                    this.move_right()
                    this.moved_right = true
                    break;
                case 'left_das':
                    while(this.move_left())
                        ;
                    this.moved_right = false
                    break;
                case 'right_das':
                    while(this.move_right())
                        ;
                    this.moved_left = false
                    break;
            }
        }
        
        if(this.active_mino instanceof Mino) {
            if(this.time - this.active_mino.last_drop_tick > (this.soft_dropping ? 50 : 1500)) {
                this.tick_down()
            }
        }
        else {
            this.spawn_mino()
        }
        this.check_clear()
    }

    move_mino(mino, x, y) {
        mino.x += x
        mino.y += y
        if(this.mino_collides(mino)) {
            this.move_mino(mino, -x, -y)
            return false
        }
        return true
    }

    tick_down(spawn = true, mino = this.active_mino) {
        if(!this.move_mino(mino, 0, 1)) {
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

    rotate(state) {
        let old_state = this.active_mino.current_rotation
        if(state > this.active_mino.rotations.length - 1)
            state = 0
        if(state < 0)
            state = this.active_mino.rotations.length - 1
        this.active_mino.rotate(state)
        const transition = `${old_state}${state}`
        const piece_offsets = this.wallkick_data[this.active_mino.meta.letter] || this.wallkick_data['default']
        const transition_offsets = piece_offsets[transition]
        console.log(transition)
        for(const offset of transition_offsets)
        {
            this.active_mino.move(offset[0], -offset[1])
            if(!this.mino_collides()) {
                return
            }
            this.active_mino.move(-offset[0], offset[1])
        }
        this.active_mino.rotate(old_state)
    }
    rotate_cw() {
        this.rotate(this.active_mino.current_rotation + 1)
    }

    rotate_ccw() {
        this.rotate(this.active_mino.current_rotation - 1)
    }

    move_left() {
        return this.move_mino(this.active_mino, -1, 0)
    }

    move_right() {
        return this.move_mino(this.active_mino, 1, 0)
    }

    leftPressed() {
        this.moved_left = false
        this.input_priorities.push('left')
        this.left_pressed_time = performance.now()
    }

    leftReleased() {
        this.input_priorities = this.input_priorities.filter(e => e != 'left_das')
        this.input_priorities = this.input_priorities.filter(e => e != 'left')
        this.dasing_left = false
        this.left_pressed_time = Infinity
    }

    rightPressed() {
        this.moved_right = false
        this.input_priorities.push('right')
        this.right_pressed_time = performance.now()
    }
    
    rightReleased() {
        this.input_priorities = this.input_priorities.filter(e => e != 'right_das')
        this.input_priorities = this.input_priorities.filter(e => e != 'right')
        this.dasing_right = false
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

function shuffle(array) {
    var current_index = array.length, temporary_value, random_index;

    while (0 !== current_index) {
      random_index = Math.floor(Math.random() * current_index);
      current_index -= 1;

      temporary_value = array[current_index];
      array[current_index] = array[random_index];
      array[random_index] = temporary_value;
    }
  
    return array;
}