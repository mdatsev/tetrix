
export default class MinoRenderer {
    constructor({tile_size,renderer,default_skin ,ghost_skin}) {
        this.tile_size = tile_size
        this.renderer = renderer
        this.default_skin = default_skin
        this.ghost_skin = ghost_skin    
    }
    render(mino) {
        if(!mino) return

        let tiles = mino.get_tiles_on_board()
        const ts = this.tile_size
        for(const tile of tiles) {
            this.renderer.image(mino.meta.ghost ? this.ghost_skin : this.default_skin, ts * (tile[0]), ts * (tile[1]), ts, ts)
        }
    }
}
 