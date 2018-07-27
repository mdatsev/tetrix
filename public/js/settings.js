import { ENETUNREACH } from "constants";

export default class Settings {
    constructor () {
        this.keybinds = {
            'MOVE_LEFT': [37, 65],          // LEFT_ARROW, A
            'ROTATE_CW': [38, 87, 88],      // UP_ARROW, W, X
            'ROTATE_CCW': [17, 90],         // CONTROL, Z
            'ROTATE_180': [86],             // V
            'MOVE_RIGHT': [39, 68],         // RIGHT_ARROW, D
            'SOFT_DROP': [40, 83],          // DOWN_ARROW, S
            'HARD_DROP': [32],              // SPACE
            'HOLD_MINO': [16, 67],          // SHIFT, C
            'PAUSE': [27, 112],             // ESC, F1
        }
        this.tetris_settings = {
            'LOCK_DELEY': 500,
            'DROP_SPEED': 1500,
            'ARR': 1,
            'DAS': 10
        }
    }
    set_keybind(id) {
        keycode = this.get_keycode()

    }

    set_setting(value, id) {
        this.tetris_settings[id] = value
    }

    set_onclick() {
        let keybinds = document.getElementsByClassName('keybinds')
        for (let keybind in keybinds) {
            keybind.onclick = () => {this.set_keybind(keybind.id)}
        }
        let settings = document.getElementsByClassName('settings')
        for (let setting in settings) {
            setting.addEventListener('input', () => {
                this.set_setting(this.value, setting.id)
            }) 
        }
    }
    get_keycode() {

    }


}