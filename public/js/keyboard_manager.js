export default class KeyboardManager {
    constructor(onchange) {
        this.keybinds = {
            'MOVE_LEFT': [37, 65],         // LEFT_ARROW, A
            'ROTATE_CW': [38, 87, 88],     // UP_ARROW, W, X
            'ROTATE_CCW': [17, 90],         // CONTROL, Z
            'ROTATE_180': [86],             // V
            'MOVE_RIGHT': [39, 68],         // RIGHT_ARROW, D
            'SOFT_DROP': [40, 83],         // DOWN_ARROW, S
            'HARD_DROP': [32],             // SPACE
            'HOLD_MINO': [16, 67],         // SHIFT, C
            'PAUSE': [27, 112],        // ESC, F1

        }
        this.inputs = []
        this.right_pressed_time = Infinity
        this.left_pressed_time = Infinity
        this.dasing_left = false
        this.paused = false
        this.dasing_right = false
        this.moved_left = true
        this.moved_right = true
        this.onchange = onchange
    }

    keyPressed(keyCode) {
        const isKeyFor = action => this.keybinds[action].includes(keyCode)
        if (isKeyFor('PAUSE')) {
            this.paused = !this.paused
        }
        if (!this.paused)
            switch (true) {
            case isKeyFor('MOVE_LEFT'):
                this.leftPressed()
                break
            case isKeyFor('ROTATE_CW'):
                this.rotation = 'cw'
                break
            case isKeyFor('ROTATE_CCW'):
                this.rotation = 'ccw'
                break
            case isKeyFor('ROTATE_180'):
                this.rotation = '180'
                break
            case isKeyFor('MOVE_RIGHT'):
                this.rightPressed()
                break
            case isKeyFor('SOFT_DROP'):
                this.softDropPressed()
                break
            case isKeyFor('HARD_DROP'):
                this.hard_drop = true
                break
            case isKeyFor('HOLD_MINO'):
                this.hold = true
                break
            }
        this.onchange(this.get_inputs())
    }

    keyReleased(keyCode) {
        const isKeyFor = action => this.keybinds[action].includes(keyCode)
        if (!this.paused)
            switch (true) {
            case isKeyFor('MOVE_LEFT'):
                this.leftReleased()
                break
            case isKeyFor('MOVE_RIGHT'):
                this.rightReleased()
                break
            case isKeyFor('SOFT_DROP'):
                this.softDropReleased()
                break
            }
        this.onchange(this.get_inputs())
    }

    get_inputs() {
        // console.log(this.inputs)
        let move = this.inputs
            .reduce((ac, e, i, ar) =>
                ar[i - 1] == 'left_das' && e == 'right'
                    ? [...ac, 'left_das-1']
                    : ar[i - 1] == 'right_das' && e == 'left'
                        ? [...ac, 'right_das-1']
                        : [...ac, e], [])[this.inputs.length - 1]
        if ((move == 'left' && this.moved_left) || (move == 'right' && this.moved_right))
            move = ''
        else if (move == 'left' || move == 'right_das-1')
            this.moved_left = true
        else if (move == 'right' || move == 'left_das-1')
            this.moved_right = true

        let inputs = {
            move,
            soft_dropping: this.soft_dropping,
            rotation: this.rotation,
            hard_drop: this.hard_drop,
            hold: this.hold
        }
        this.rotation = ''
        this.hard_drop = this.hold = false

        return inputs
    }

    update_inputs() {
        this.time = performance.now()
        if (this.time - this.right_pressed_time > 119) {
            if (!this.dasing_right) {
                this.dasing_right = true
                this.inputs.push('right_das')
                this.onchange(this.get_inputs())
            }
        }
        if (this.time - this.left_pressed_time > 119) {
            if (!this.dasing_left) {
                this.dasing_left = true
                this.inputs.push('left_das')
                this.onchange(this.get_inputs())
            }
        }
    }

    is_paused() {
        return this.paused
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