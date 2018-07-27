// @ts-check
import DefaultTetris from "./default_tetris.mjs"

export default class GameManager {
    constructor(onupdate, ondie) {
        this.tetrises = []
        this.onupdate = onupdate
        this.ondie = ondie
    }

    player_join(id, username) {
        let t = DefaultTetris((ev, tetris) => {
            switch(ev) {
                case 'update':
                    this.onupdate(tetris)
                    break
                case 'dead':
                    this.ondie(tetris)
                    break
                default:
                    console.log(ev)
            }
        })
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
        this.tetrises.splice(this.tetrises.indexOf(t))
    }

    input(id, inputs) {
        let t = this.tetrises.find(t => t.meta.id === id)
        t.update(inputs)
        t.meta.last_inputs = inputs
    }
}