// @ts-check
export default class Mino {
    constructor(rotations, x, y, meta) {
        this.rotations = rotations
        this.x = x
        this.y = y
        this.current_rotation = 0
        this.meta = meta || {}
        this.last_drop_tick = Date.now()
    }

    rotate(state) {
        this.current_rotation = state
    }

    get_tiles() {
        return this.rotations[this.current_rotation]
    }

    get_tiles_on_board() {
        return this.rotations[this.current_rotation].map(t => [t[0] + this.x, t[1] + this.y])
    }

    destroy_tile_on_board(tile) {
        tile = [tile[0] - this.x, tile[1] - this.y]
        this.rotations[this.current_rotation] =
        this.rotations[this.current_rotation]
            .filter(t => t[0] != tile[0] || t[1] != tile[1])
            .map(t => t[1] < tile[1] && t[0] == tile[0] ? [t[0], t[1] + 1] : t)
    }

    clone() {
        const m = new Mino([...this.rotations], this.x, this.y, {...this.meta});
        m.current_rotation = this.current_rotation;
        return m;
    }

    move(x_or_xy, y) {
        if(y !== undefined) {
            this.x += x_or_xy
            this.y += y
        }
        else {
            this.x += x_or_xy[0]
            this.y += x_or_xy[1]
        }
    }

    static from(obj) {
        if(!obj) return obj
        let ret = new Mino(obj.rotations, obj.x, obj.y, obj.meta)
        return Object.assign(ret, obj);
    }
}