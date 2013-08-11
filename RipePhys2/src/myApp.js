var pixelsPerMeter = 30;

var b2Vec2 = Box2D.Common.Math.b2Vec2
, b2BodyDef = Box2D.Dynamics.b2BodyDef
, b2Body = Box2D.Dynamics.b2Body
, b2FixtureDef = Box2D.Dynamics.b2FixtureDef
, b2World = Box2D.Dynamics.b2World
, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var Helloworld = cc.Layer.extend({
    world:null,
    bodies:null,
    wheels:null,
    selectedBody: null,
    mouseJoint: null,
    centerBody: null,
    rightFlag: null,
    leftFlag: null,

    init:function () {
        var selfPointer = this;
        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window size
        var size = cc.Director.getInstance().getWinSize();

        // add a "close" icon to exit the progress. it's an autorelease object
        var closeItem = cc.MenuItemImage.create(
            "res/CloseNormal.png",
            "res/CloseSelected.png",
            function () {
                history.go(-1);
            },this);
        closeItem.setAnchorPoint(cc.p(0.5, 0.5));

        var menu = cc.Menu.create(closeItem);
        menu.setPosition(cc.PointZero());
        this.addChild(menu, 1);
        closeItem.setPosition(cc.p(size.width - 20, 20));

        /////////////////////////////
        // 3. add your codes below...

        this.bodies = [];
        this.wheels = [];

        this.setMouseEnabled(true);
        this.setKeyboardEnabled(true);
        this.setTouchEnabled(true);

        this.demo();

        this.scheduleUpdate();

        return true;
    },

    computeTorque: function(omega, rightFlag, leftFlag) {
        var k = 1;
        var enginePower = 45;
        var brakePower = 5;
        var torque = 0;

        if(omega < 0) {
            if(rightFlag === 1) { 
                torque = -(k*omega + enginePower)
            }
            if(leftFlag === 1) { 
                torque = brakePower
            }

        }
        else {
            if(rightFlag === 1) { 
                torque = -brakePower
            }
            if(leftFlag === 1) { 
                torque = k*(-1*omega) + enginePower
            }
        }

        //console.log("Torque: " + torque + " Omega: " + omega)
        return torque
    },

    update: function (dt) {
        var world = this.world,
            mouseJoint = this.mouseJoint;

        var wheels = this.wheels;
        for (var i = 0, len = wheels.length; i < len; i++) {
            var wheel = wheels[i];
            var torque = this.computeTorque(wheel.GetAngularVelocity(), this.rightFlag, this.leftFlag);
            wheel.ApplyTorque(torque)
        }

        world.Step(dt, 10, 10);
        world.ClearForces();
        
        
        var pos = this.centerBody.GetPosition();
        var scenePos = new cc.Point(-pos.x * pixelsPerMeter +
            this.getContentSize().width / 2,
            -pos.y * pixelsPerMeter +
                this.getContentSize().height / 2);
        this.setPosition(scenePos);
    },

    demo: function () {
        this.world = new b2World(
            new b2Vec2(0, -10),    //gravity
            true                  //allow sleep
        );

        this.createGround();

        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 1.5;
        fixDef.restitution = 0.2;

        this.createVehicle(fixDef);

        this.rightFlag = 0;
        this.leftFlag = 0
    },

    createVehicle: function(fixDef) {
        var bodyDef = new b2BodyDef;

        bodyDef.type = b2Body.b2_dynamicBody;

        bodyDef.position.x = 0;
        bodyDef.position.y = 5;

        var scale = 0.5,
            width = scale * 32;

        fixDef.shape = new b2CircleShape(width/pixelsPerMeter);
        
        var bdy = this.world.CreateBody(bodyDef);
        var renderer = new DebugShapeRenderer(bdy);
        this.addChild(renderer);
        this.bodies.push(bdy);
        this.wheels.push(bdy);
        this.centerBody = bdy;
        bdy.CreateFixture(fixDef)
    },

    createGround: function() {

        vertices = new Array();
        vertices[0] = new b2Vec2(-50, 2);
        vertices[1] = new b2Vec2(10, 2);
        vertices[2] = new b2Vec2(20, 15);
        vertices[3] = new b2Vec2(30, 2);
        vertices[4] = new b2Vec2(100, 2);

        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_staticBody;
        var bdy = this.world.CreateBody(bodyDef);

        for (var i = 1, len = vertices.length; i < len; i++) {

            var fixDef = new b2FixtureDef;
            fixDef.density = 1.0;
            fixDef.friction = 1.5;
            fixDef.restitution = 0.2;
            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsEdge(vertices[i-1], vertices[i]);            
            bdy.CreateFixture(fixDef)
        }

        var renderer = new DebugShapeRenderer(bdy);
        this.addChild(renderer);

    },

    onKeyUp: function(keycode) {

        console.log(keycode);
        if (keycode === 39) {
            console.log("rightFlag disabled");
            this.rightFlag = 0         
        }
        if (keycode === 37) {
            console.log("leftFlag disabled");
            this.leftFlag = 0
        }
    },

    onKeyDown: function(keycode) {
        console.log(keycode);
        if (keycode === 39) {
            console.log("rightFlag enabled");
            this.rightFlag = 1
        }
        if (keycode === 37) {
            console.log("leftFlag enabled");
            this.leftFlag = 1
        }
    },

    // a selector callback
    menuCloseCallback:function (sender) {
        cc.Director.getInstance().end();
    },
    onTouchesBegan:function (touches, event) {
        this.isMouseDown = true;
    },
    onTouchesMoved:function (touches, event) {
        if (this.isMouseDown) {
            if (touches) {
                //this.circle.setPosition(cc.p(touches[0].getLocation().x, touches[0].getLocation().y));
            }
        }
    },
    onTouchesEnded:function (touches, event) {
        this.isMouseDown = false;
    },
    onTouchesCancelled:function (touches, event) {
        console.log("onTouchesCancelled");
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Helloworld();
        layer.init();
        this.addChild(layer);
    }
});

