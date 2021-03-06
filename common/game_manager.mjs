// @ts-check
import DefaultTetris from "./default_tetris.mjs"

export default class GameManager {
    constructor(onupdate, ondie) {
        this.tetrises = []
        this.onupdate = onupdate
        this.ondie = ondie
        this.leaderboard = []
        this.cur_place = 0
    }

    player_join(id, username) {
        let t = DefaultTetris((ev, tetris) => {
            let random_opponent = this.tetrises.filter(t => t.meta.id !== tetris.meta.id)[Math.floor(Math.random() * this.tetrises.length)] || {send_garbage:_=>{}}
            switch(ev) {
                case 'update':
                    this.onupdate(tetris)
                    break
                case 'dead':
                    this.ondie(tetris)
                    tetris.meta.place = this.cur_place++
                    if(this.cur_place == this.tetrises.length - 1)
                    {
                        this.tetrises.filter(t => t.meta.place === undefined)[0].meta.place = this.cur_place++
                        console.log(this.tetrises.sort((a, b) => b.meta.place - a.meta.place).map(t => t.meta.username).join('\n'))
                    }
                    break
                case 'double':
                    random_opponent.send_garbage(Math.floor(Math.random() * 10), 1)
                    break
                case 'triple':
                    random_opponent.send_garbage(Math.floor(Math.random() * 10), 2)
                    break
                case 'tetris':
                    random_opponent.send_garbage(Math.floor(Math.random() * 10), 4)
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