/**
 * Created with IntelliJ IDEA.
 * User: juhari
 * Date: 8/4/13
 * Time: 8:12 PM
 * To change this template use File | Settings | File Templates.
 */

var DebugShapeRenderer = ShapeRenderer.extend ({

    ctor:function (body) {
        this._super(body);
    },

    draw: function() {

        for( var fixture = this._body.GetFixtureList(); fixture != null; fixture = fixture.GetNext() ) {
            var shape = fixture.GetShape();
            // only circle shape supported at the moment
            if( shape instanceof b2CircleShape ) {
                var pos = this._body.GetPosition(),
                    angle = this._body.GetAngle(),
                    point = new cc.Point(pos.x * pixelsPerMeter,
                        pos.y * pixelsPerMeter),
                    radius = shape.m_radius*pixelsPerMeter;

                cc.drawingUtil.setDrawColor4B(255,255,255,255);
                cc.drawingUtil.drawCircle(point, radius, angle, 60, true);
            }
        }
    }
});