// @ts-check
/// <reference path="../vendor/p5.d.ts" />
import Mino from "/common/mino.mjs"
import Tetris from "/common/tetris.mjs"

new p5(( /** @type {p5} */ p) => {
    let default_skin, ghost_skin

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
            p.translate(6 * this.tile_size, 0)
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
            let x = (tetris.width + 0.5) * this.tile_size, y = tetris.visible_height * this.tile_size
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
        render_holded() {
            p.translate(-6 * this.tile_size, 0)
            let x = (5 + 0.5) * this.tile_size, y = tetris.visible_height * this.tile_size
            p.stroke(153);
            p.strokeWeight(this.tile_size)
            p.line(x, 0, x, y)
            if(tetris.holded_mino != null) {
                
                tetris.holded_mino.x = 1;
                tetris.holded_mino.y = 1;
                tetris.holded_mino.current_rotation = 0;
                this.mino_renderer.render(tetris.holded_mino)

            }
        }
    }

    class KeyboardManager {
        constructor() {
            this.keybinds = {
                'MOVE_LEFT':  [37, 65],         // LEFT_ARROW, A
                'ROTATE_CW':  [38, 87, 88],     // UP_ARROW, W, X
                'ROTATE_CCW': [17, 90],         // CONTROL, Z
                'ROTATE_180': [86],             // V
                'MOVE_RIGHT': [39, 68],         // RIGHT_ARROW, D
                'SOFT_DROP':  [40, 83],         // DOWN_ARROW, S
                'HARD_DROP':  [32],             // SPACE
                'HOLD_MINO':  [16, 67],         // SHIFT, C
                'PAUSE':      [27, 112],        // ESC, F1
        
            }
            this.inputs = []
            this.right_pressed_time = Infinity
            this.left_pressed_time = Infinity
            this.dasing_left = false
            this.dasing_right = false
            this.moved_left = true
            this.moved_right = true
        }
        
        keyPressed(keyCode) {
            const isKeyFor = action => this.keybinds[action].includes(keyCode)
            switch(true) {
                case isKeyFor('MOVE_LEFT'):
                    this.leftPressed()
                    break;
                case isKeyFor('ROTATE_CW'):
                    tetris.rotate_cw()
                    break;
                case isKeyFor('ROTATE_CCW'):
                    tetris.rotate_ccw()
                    break;
                case isKeyFor('ROTATE_180'):
                    tetris.rotate_180()
                    break;
                case isKeyFor('MOVE_RIGHT'):
                    this.rightPressed()
                    break;
                case isKeyFor('SOFT_DROP'):
                    this.softDropPressed()
                    break;
                case isKeyFor('HARD_DROP'):
                    tetris.hard_drop()
                    break;
                case isKeyFor('HOLD_MINO'):
                    tetris.hold_mino()
                    break;
            }
        }

        keyReleased(keyCode) {
            const isKeyFor = action => this.keybinds[action].includes(keyCode)
            switch(true) {
                case isKeyFor('MOVE_LEFT'):
                    this.leftReleased()
                    break;
                case isKeyFor('MOVE_RIGHT'):
                    this.rightReleased()
                    break;
                case isKeyFor('SOFT_DROP'):
                    this.softDropReleased()
                    break;
            }
        }

        get_inputs() {
            this.time = performance.now()
            if(this.time - this.right_pressed_time > 119) {
                if(!this.dasing_right)
                {
                    this.dasing_right = true
                    this.inputs.push('right_das')
                }
            }
            if(this.time - this.left_pressed_time > 119) {
                if(!this.dasing_left)
                {
                    this.dasing_left = true
                    this.inputs.push('left_das')
                }
            }
            // console.log(this.inputs)
            let move = this.inputs
                        .reduce((ac, e, i, ar) => 
                            ar[i-1] == 'left_das' && e == 'right' 
                            ? [...ac, 'left_das-1']
                            : ar[i-1] == 'right_das' && e == 'left' 
                            ? [...ac, 'right_das-1']
                            : [...ac, e], [])
                            [this.inputs.length - 1]
            if((move == 'left' && this.moved_left) || (move == 'right' && this.moved_right))
                move = ''
            else if(move == 'left' || move == 'right_das-1')
                this.moved_left = true
            else if(move == 'right' || move == 'left_das-1')
                this.moved_right = true
            return {
                move,
                soft_dropping: this.soft_dropping
            }
        }

        update_inputs() {

        }


        leftPressed() {
            this.moved_left = false
            this.inputs.push('left')
            this.left_pressed_time = performance.now()
        }

        leftReleased() {
            this.inputs = this.inputs.filter(e => !e.includes('left'))
            this.dasing_left = false
            this.left_pressed_time = Infinity
        }

        rightPressed() {
            this.moved_right = false
            this.inputs.push('right')
            this.right_pressed_time = performance.now()
        }
        
        rightReleased() {
            this.inputs = this.inputs.filter(e => !e.includes('right'))
            this.dasing_right = false
            this.right_pressed_time = Infinity
        }

        softDropPressed() {
            this.soft_dropping = true
        }
    
        softDropReleased() {
            this.soft_dropping = false
        }
    }
    
    
    let SRS
    let SRS_tiles = {}
    let SRS_wallkick
    let tetris
    let renderer = new TetrisRenderer()
    let kb_manager = new KeyboardManager()
    let paused = false
    let socket

    p.preload = () => {
        SRS = p.loadJSON('/data/SRS_rotations.json')
        SRS_wallkick = p.loadJSON('/data/SRS_wallkicks.json')
        jQuery.ajaxSetup({async:false});
        let skinPath = $.get('/account/skin').responseJSON.skinPath
        jQuery.ajaxSetup({async:true});
        default_skin = p.loadImage("textures/" + skinPath)
        ghost_skin = p.loadImage("textures/ghost.png")
    }

    p.setup = () => {
        socket = io.connect('http://' + document.domain + ':' + location.port);
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
        const canvas = p.createCanvas((tetris.width + 12) * renderer.tile_size, tetris.visible_height * renderer.tile_size)
        canvas.parent('sketch-holder')
    }
    
    p.draw = () => {
        if(!tetris.dead)
        {
            let inputs = kb_manager.get_inputs()
            socket.emit('inputs', inputs);
            tetris.update(inputs)
            renderer.render(tetris)
            renderer.render_queue()
            renderer.render_holded()
        }
        else if(!paused)
        {
            alert('you die')
            tetris = new Tetris(SRS_tiles)
        }
    }

    p.keyPressed = () => {
        kb_manager.keyPressed(p.keyCode)
    }

    p.keyReleased = () => {
        kb_manager.keyReleased(p.keyCode)
    }
})