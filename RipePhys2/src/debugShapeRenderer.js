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
            var type = shape.GetType();
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
            if( shape instanceof b2PolygonShape ) {
                var vertices = shape.GetVertices();                
                for (var i = 1, len = vertices.length; i < len; i++) {
                    var currVertex = vertices[i];                    
                    var prevVertex = vertices[i-1];                    
                    
                    var p2 = new cc.Point(currVertex.x * pixelsPerMeter,
                                          currVertex.y * pixelsPerMeter);
                    var p1 = new cc.Point(prevVertex.x * pixelsPerMeter,
                                          prevVertex.y * pixelsPerMeter);
                    cc.drawingUtil.setDrawColor4B(255,255,255,255);
                    cc.drawingUtil.drawLine(p1, p2);
                }
            }
        }
    }
});