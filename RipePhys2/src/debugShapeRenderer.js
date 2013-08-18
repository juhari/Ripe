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
            var pos = this._body.GetPosition();
            var angle = this._body.GetAngle();
            var type = shape.GetType();
            // only circle shape supported at the moment
            if( shape instanceof b2CircleShape ) {
                var point = new cc.Point(pos.x * pixelsPerMeter,
                                         pos.y * pixelsPerMeter)
                var radius = shape.m_radius*pixelsPerMeter;

                cc.drawingUtil.setDrawColor4B(255,255,255,255);
                cc.drawingUtil.drawCircle(point, radius, angle, 60, true);
            }
            if( shape instanceof b2PolygonShape ) {
                var vertices = shape.GetVertices();                
                for (var i = 1, len = vertices.length; i < len; i++) {
                    
                    var R = b2Mat22.FromAngle(angle);
                    var currVertex = vertices[i];                    
                    var prevVertex = vertices[i-1];                    
                    
                    var p2 = new cc.Point((pos.x + currVertex.x) * pixelsPerMeter, 
                                          (pos.y + currVertex.y) * pixelsPerMeter);
                    var p1 = new cc.Point((pos.x + prevVertex.x) * pixelsPerMeter,
                                          (pos.y + prevVertex.y) * pixelsPerMeter);
                    cc.drawingUtil.setDrawColor4B(255,255,255,255);
                    cc.drawingUtil.drawLine(p1, p2);
                }
            }
        }
    }
});