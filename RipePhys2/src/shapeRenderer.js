/**
 * Created with IntelliJ IDEA.
 * User: juhari
 * Date: 8/4/13
 * Time: 8:11 PM
 * To change this template use File | Settings | File Templates.
 */


var ShapeRenderer = cc.Layer.extend ({
    _world: null,

    ctor:function (world) {
        this._super();
        this._world = world;
    },

    draw: function() {
        // empty implementation
    }

});