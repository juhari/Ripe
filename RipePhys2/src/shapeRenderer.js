/**
 * Created with IntelliJ IDEA.
 * User: juhari
 * Date: 8/4/13
 * Time: 8:11 PM
 * To change this template use File | Settings | File Templates.
 */


var ShapeRenderer = cc.Layer.extend ({
    _body: null,

    ctor:function (body) {
        this._super();
        this._body = body;
    },

    draw: function(shape) {
        // empty implementation
    }

});