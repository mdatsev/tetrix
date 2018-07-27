// @ts-check
import DefaultTetris from "./default_tetris.mjs"

export default class GameManager {
    constructor(onupdate) {
        this.tetrises = []
        this.onupdate = onupdate
    }

    player_join(id, username) {
        let t = DefaultTetris(this.onupdate)
        t.meta.id = id
        t.meta.username = username
        this.tetrises.push(t)
    }

    start() {
        for(const t of this.tetrises)
        {
            t.meta.timer_id = setInterval(() => {
                if(t.meta.last_inputs)
                    t.update(t.meta.last_inputs, true)
            }, 16)
        }
    }

    player_leave(id) {
        let t = this.tetrises.find(t => t.meta.id === id)
        clearInterval(t.timer_id)
    }

    input(id, inputs) {
        let t = this.tetrises.find(t => t.meta.id === id)
        t.update(inputs)
        t.meta.last_inputs = inputs
    }
}