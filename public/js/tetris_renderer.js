import MinoRenderer from "/js/mino_renderer.js"
import Mino from "/common/mino.mjs"

export default class TetrisRenderer {
    constructor(renderer, tile_size, queue_size, default_skin, ghost_skin) {
        this.tile_size = tile_size
        this.queue_size = queue_size
        /** @type { p5 } */
        this.renderer = renderer
        this.mino_renderer = new MinoRenderer({tile_size: this.tile_size, renderer:this.renderer, default_skin:default_skin, ghost_skin:ghost_skin})
    }
    render(tetris) {
        this.renderer.translate(6 * this.tile_size, 0)
        this.renderer.background(0)
        this.renderer.push()
        this.renderer.translate(0, -(tetris.height - tetris.visible_height) * this.tile_size)
        for (const mino of tetris.fallen_minos) {
            this.mino_renderer.render(mino)
        }
        this.render_ghost(tetris)
        this.mino_renderer.render(tetris.active_mino)
        this.renderer.pop()
        
    }

    render_ghost(tetris) {
        if(!tetris.active_mino) return
        let ghost = tetris.active_mino.clone()
        while(tetris.tick_down(false, ghost))
            ;
        
        ghost.meta.ghost = true
        this.mino_renderer.render(ghost)
    }

    render_queue(tetris, SRS_tiles) {
        let x = (tetris.width + 0.5) * this.tile_size, y = tetris.visible_height * this.tile_size
        this.renderer.stroke(153);
        this.renderer.strokeWeight(this.tile_size)
        this.renderer.line(x, 0, x, y)
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
    render_holded(tetris) {
        this.renderer.translate(-6 * this.tile_size, 0)
        let x = (5 + 0.5) * this.tile_size, y = tetris.visible_height * this.tile_size
        this.renderer.stroke(153);
        this.renderer.strokeWeight(this.tile_size)
        this.renderer.line(x, 0, x, y)
        if(tetris.holded_mino != null) {
            tetris.holded_mino.x = 1;
            tetris.holded_mino.y = 1;
            tetris.holded_mino.current_rotation = 0;
            this.mino_renderer.render(tetris.holded_mino)
        }
    }
}