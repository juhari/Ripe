/**
 * Created with IntelliJ IDEA.
 * User: juhari
 * Date: 8/4/13
 * Time: 8:12 PM
 * To change this template use File | Settings | File Templates.
 */

var DebugShapeRenderer = ShapeRenderer.extend ({
    prevVertex:null,
    currVertex:null,
    firstVertex:null,
    p1:null,
    p2:null,
    rotMatrix:null,

    ctor:function (body) {
        this._super(body);
        this.prevVertex = new b2Vec2();
        this.currVertex = new b2Vec2();
        this.firstVertex = new b2Vec2();
        this.p1 = new cc.Point(0,0);
        this.p2 = new cc.Point(0,0);
        this.rotMatrix = b2Mat22.FromAngle(0);
    },

    draw: function() {
        cc.drawingUtil.setDrawColor4B(255,255,255,255);
        for( var body = this._world.GetBodyList(); body != null; body = body.GetNext() ) {
            this.drawBody(body);
        }
        cc.drawingUtil.setDrawColor4B(0,0,255,255);
        for( var joint = this._world.GetJointList(); joint != null; joint = joint.GetNext() ) {
            this.drawJoint(joint);
        }
    },

    drawJoint: function(joint) {
        var anchorA = joint.GetAnchorA();
        var bodyA = joint.GetBodyA().GetPosition();
        var anchorB = joint.GetAnchorB();
        var bodyB = joint.GetBodyB().GetPosition();


        this.p2.x = anchorA.x * pixelsPerMeter;
        this.p2.y = anchorA.y * pixelsPerMeter;
        this.p1.x = bodyA.x * pixelsPerMeter;
        this.p1.y = bodyA.y * pixelsPerMeter;
        cc.drawingUtil.drawLine(this.p1, this.p2);

        this.p2.x = anchorB.x * pixelsPerMeter;
        this.p2.y = anchorB.y * pixelsPerMeter;
        this.p1.x = bodyB.x * pixelsPerMeter;
        this.p1.y = bodyB.y * pixelsPerMeter;
        cc.drawingUtil.drawLine(this.p1, this.p2);

        this.p2.x = anchorA.x * pixelsPerMeter;
        this.p2.y = anchorA.y * pixelsPerMeter;
        this.p1.x = anchorB.x * pixelsPerMeter;
        this.p1.y = anchorB.y * pixelsPerMeter;
        cc.drawingUtil.drawLine(this.p1, this.p2);
    },

    drawBody: function(body) {
        var pos = body.GetPosition();
        var angle = body.GetAngle();
        this.rotMatrix.Set(-angle);

        for( var fixture = body.GetFixtureList(); fixture != null; fixture = fixture.GetNext() ) {
            var shape = fixture.GetShape();
            var type = shape.GetType();
            // only circle shape supported at the moment
            if( shape instanceof b2CircleShape ) {
                var point = new cc.Point(pos.x * pixelsPerMeter,
                    pos.y * pixelsPerMeter)
                var radius = shape.m_radius*pixelsPerMeter;

                cc.drawingUtil.drawCircle(point, radius, angle, 60, true);
            }
            if( shape instanceof b2PolygonShape ) {
                var vertices = shape.GetVertices();


                for (var i = 1, len = vertices.length; i < len; i++) {
                    if(i === 1) {
                        this.prevVertex.Set(vertices[i-1].x, vertices[i-1].y);
                        this.prevVertex.MulTM(this.rotMatrix);
                        this.prevVertex.Add(pos);
                        this.firstVertex.Set(this.prevVertex.x,
                            this.prevVertex.y);
                    }


                    this.currVertex.Set(vertices[i].x, vertices[i].y);
                    this.currVertex.MulTM(this.rotMatrix);

                    this.currVertex.Add(pos);


                    this.p2.x = this.currVertex.x * pixelsPerMeter;
                    this.p2.y = this.currVertex.y * pixelsPerMeter;
                    this.p1.x = this.prevVertex.x * pixelsPerMeter;
                    this.p1.y = this.prevVertex.y * pixelsPerMeter;

                    cc.drawingUtil.drawLine(this.p1, this.p2);
                    if(i === len-1 && body.isNotClosed != true) {
                        this.p1.x = this.firstVertex.x * pixelsPerMeter;
                        this.p1.y = this.firstVertex.y * pixelsPerMeter;
                        cc.drawingUtil.drawLine(this.p2, this.p1);
                    }
                    this.prevVertex.Set(this.currVertex.x, this.currVertex.y);
                }
            }
        }
    }
});