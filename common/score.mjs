
export default class Score {
    constructor() {
        this.scores = {
            double: 300,
            triple: 500,
            tetris: 800
        }
        this.score = 0
    }

    update(ev) {
        this.score += this.scores[ev] || 0
    }
}