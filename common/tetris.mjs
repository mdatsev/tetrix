// @ts-check
import Mino from "./mino.mjs"

export default class Tetris {
    constructor(pieces, wallkick_data) {
        this.lock_delay_default = 1500
        this.current_lock_delay = this.lock_delay_default
        this.last_time_diff = 0
        this.lock_delay_updated = false
        this.last_try_lock = Infinity
        this.drop_speed = 1500
        this.pieces = pieces
        this.wallkick_data = wallkick_data || {'default': [[0, 0]]}
        this.width = 10
        this.height = 40
        this.visible_height = this.height / 2;
        this.can_hold = false;
        this.active_mino = null
        this.holded_mino = null
        this.fallen_minos = []
        this.minos_bag = []
        this.dead = false
        this.dasing_left = false
        this.dasing_right = false
    }

    spawn_mino() {
        this.can_hold = true;
        if(this.minos_bag.length <= 5) {
            this.generate_bag();
        }
        console.log(Date.now())
        const letter = this.minos_bag.shift();
        const srs_mino = [...this.pieces[letter]]
        
        this.active_mino = new Mino(srs_mino, Math.floor((this.width - 4) / 2), 0, {letter})
        
        if(this.mino_collides())
            this.dead = true
    }

    generate_bag() {
        const letters = [...'LJSZTOI']
        this.minos_bag.push(...shuffle(letters));
        console.log("Added to bag");
    }
    
    lock_mino() {
        this.fallen_minos.push(this.active_mino);
    }
    
    update(input) {
        this.time = Date.now()
        if(this.active_mino instanceof Mino) {
            if(this.time - this.active_mino.last_drop_tick > 
                (input.soft_dropping ? 10 : this.drop_speed)) {
                this.tick_down()
            }
            if(!this.move_mino(this.active_mino, 0, 1, false))
            {
                this.check_lock()
            }else {
                if(!this.lock_delay_updated) {
                    console.log('diff ' + this.last_time_diff)
                    this.current_lock_delay -= this.last_time_diff
                    this.lock_delay_updated = true
                }
                this.last_try_lock = Infinity
            }
        }
        else {
            this.spawn_mino()
        }
        switch(input.move) {
            case 'right_das':
                this.das_right()
                break
            case 'left_das':
                this.das_left()
                break
            case 'right_das-1':
                this.das_right()
            case 'left':
                this.move_left()
                break
            case 'left_das-1':
                this.das_right
            case 'right':
                this.move_right()
                break
        }

        this.check_clear()
    }

    das_left() {
        while(this.move_left())
            ;
    }
    
    das_right() {
        while(this.move_right())
            ;
    }
    
    move_mino(mino, x, y, move_if_possible  = true) {
        mino.x += x
        mino.y += y
        if(this.mino_collides(mino)) {
            this.move_mino(mino, -x, -y)
            return false
        }
        if(!move_if_possible) 
            this.move_mino(mino, -x, -y)
        return true
    }

    check_lock(ignore_lock_delay = false) {
        if(this.last_try_lock == Infinity) {
            this.last_try_lock = Date.now()
            console.log('coll')
        }
        this.last_time_diff = this.time - this.last_try_lock
        this.lock_delay_updated = false
        console.log('inside diff' + this.last_time_diff);
        if(this.last_time_diff >= this.current_lock_delay || ignore_lock_delay) {
            this.lock_mino()
            this.spawn_mino()
            this.last_try_lock = Infinity
            this.current_lock_delay = this.lock_delay_default
            this.last_time_diff = 0
            this.lock_delay_updated = true
        }
        console.log('Curr lock' + this.current_lock_delay)
    }

    tick_down(spawn = true, mino = this.active_mino, ignore_lock_delay = false) {
        this.time = Date.now()
        if(!this.move_mino(mino, 0, 1)) {
            if(spawn) {
               this.check_lock(ignore_lock_delay)
            }
            return false
        }else {
            if(!this.lock_delay_updated) {
                console.log('diff ' + this.last_time_diff)
                this.current_lock_delay -= this.last_time_diff
                this.lock_delay_updated = true
            }
            this.last_try_lock = Infinity
        }
        mino.last_drop_tick = Date.now()
        return true
    }

    check_clear() {
        let lines = new Array(this.visible_height).fill(null).map(_=>[])
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
        const heights = [...Array(this.visible_height).keys()]
        return this.get_real_solid_tiles()
            .concat(widths.map(e => [e, -1]))
            .concat(heights.map(e => [-1, e]))
            .concat(widths.map(e => [e, this.visible_height]))
            .concat(heights.map(e => [this.width, e]))
    }

    get_real_solid_tiles() {
        return this.fallen_minos
            .map(mino => mino.get_tiles_on_board())
            .reduce((a, e) => a.concat(e), [])
            .filter(e => e[1] < this.visible_height)
    }

    rotate(state) {
        let old_state = this.active_mino.current_rotation
        if(state > this.active_mino.rotations.length - 1)
            state %= this.active_mino.rotations.length
        if(state < 0)
            state = this.active_mino.rotations.length - 1
        this.active_mino.rotate(state)
        const transition = `${old_state}${state}`
        const piece_offsets = this.wallkick_data[this.active_mino.meta.letter] || this.wallkick_data['default']
        const transition_offsets = piece_offsets[transition] || [[0,0]]
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

    rotate_180() {
        this.rotate(this.active_mino.current_rotation + 2)
    }
    
    move_left() {
        return this.move_mino(this.active_mino, -1, 0)
    }

    move_right() {
        return this.move_mino(this.active_mino, 1, 0)
    }

    hard_drop() {
        while(this.tick_down(true, this.active_mino, true))
            ;
    }
    hold_mino() {
        if(this.can_hold) {
            if(this.holded_mino == null) {
                this.holded_mino = this.active_mino.clone();
                this.spawn_mino()
            } else {
                this.holded_mino.x = Math.floor((this.width - 4) / 2);
                this.holded_mino.y = 0;
                let tmp_mino = this.holded_mino;
                this.holded_mino = this.active_mino;
                this.active_mino = tmp_mino;
                this.active_mino.last_drop_tick = Date.now();
            }
            this.can_hold = false;
        }
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