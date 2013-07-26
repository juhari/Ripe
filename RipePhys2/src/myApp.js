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
    rigthFlag: null,
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

        this.bodies = []
        this.wheels = []

        this.setMouseEnabled(true);
        this.setKeyboardEnabled(true);
        this.setTouchEnabled(true);

        this.demo()

        this.scheduleUpdate()

        return true;
    },

    createGroundSprite: function(point, bodyWidth, bodyHeight) {

        var sprite = cc.Sprite.create("res/asfalt.jpg")
        sprite.setPosition(point)

        var spriteSize = sprite.getTextureRect();
        var bodyWidthPixels = bodyWidth*2*pixelsPerMeter;
        var bodyHeightPixels = bodyHeight*2*pixelsPerMeter;
        sprite.setScaleY(bodyHeightPixels/spriteSize.height);
        sprite.setScaleX(bodyWidthPixels/spriteSize.width);

        this.addChild(sprite)
        return sprite
    },

    createBall: function (point, scale) {
        scale = scale || 1
        var sprite = cc.Sprite.create("res/ball.png")
        sprite.setPosition(point)

        sprite.setScale(scale)

        this.addChild(sprite)
        return sprite
    },

    computeTorque: function(omega, rightFlag, leftFlag) {
        var k = 1
        var enginePower = 45;
        var brakePower = 5;
        var torque = 0

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
        mouseJoint = this.mouseJoint        

        var wheels = this.wheels
        for (var i = 0, len = wheels.length; i < len; i++) {
            var wheel = wheels[i]
            var torque = this.computeTorque(wheel.GetAngularVelocity(), this.rightFlag, this.leftFlag)
            wheel.ApplyTorque(torque)
        }

        world.Step(dt, 10, 10)
        world.ClearForces()
        
        
        var pos = this.centerBody.GetPosition()
        var scenePos = new cc.Point(-pos.x * pixelsPerMeter + 
                                    this.getContentSize().width/2,
                                    -pos.y * pixelsPerMeter + 
                                    this.getContentSize().height/2)        
        this.setPosition(scenePos)

        var bodies = this.bodies
        for (var i = 0, len = bodies.length; i < len; i++) {
            var body = bodies[i],
            pos = body.GetPosition(),
            angle = cc.RADIANS_TO_DEGREES(-body.GetAngle()),
            point = new cc.Point(pos.x * pixelsPerMeter, 
                                 pos.y * pixelsPerMeter)
            body.sprite.setPosition(point)
            body.sprite.setRotation(angle)
        }
    },

    demo: function () {
        var world = new b2World(
            new b2Vec2(0, -10),    //gravity
            true                  //allow sleep
        )
        this.world = world

        var fixDef = new b2FixtureDef
        fixDef.density = 1.0
        fixDef.friction = 1.5
        fixDef.restitution = 0.2

        var bodyDef = new b2BodyDef


        this.createGround(fixDef, bodyDef, world)

        
        //create some objects
        bodyDef.type = b2Body.b2_dynamicBody
        
        bodyDef.position.x = 0
        bodyDef.position.y = 5
        
        var scale = 0.5,
        width = scale * 32

        fixDef.shape = new b2CircleShape(width/pixelsPerMeter)
        var sprite = this.createBall(new cc.Point(bodyDef.position.x * pixelsPerMeter, bodyDef.position.y * pixelsPerMeter), scale)

        var bdy = world.CreateBody(bodyDef)
        bdy.sprite = sprite
        this.bodies.push(bdy)
        this.wheels.push(bdy)
        this.centerBody = bdy
        bdy.CreateFixture(fixDef)

        this.rightFlag = 0
        this.leftFlag = 0
    },

    createGround: function(fixDef, bodyDef, world) {

        var body;
        var scale = 1.0

        var sprite

        bodyDef.type = b2Body.b2_staticBody
        fixDef.shape = new b2PolygonShape
        fixDef.shape.SetAsBox(20, 2)

        bodyDef.position.Set(10, 2)
        body = world.CreateBody(bodyDef).CreateFixture(fixDef)
        sprite = this.createGroundSprite(new cc.Point(bodyDef.position.x * pixelsPerMeter, bodyDef.position.y * pixelsPerMeter), 20, 2)
        body.sprite = sprite

        fixDef.shape.SetAsBox(2, 14)
        bodyDef.position.Set(-2, 13)
        body = world.CreateBody(bodyDef).CreateFixture(fixDef)

        bodyDef.position.Set(23.5, 13)
        body = world.CreateBody(bodyDef).CreateFixture(fixDef)

        fixDef.shape.SetAsOrientedBox(5, 5, new b2Vec2(0, 0), Math.PI/4);
        bodyDef.position.Set(10, 4);
        body = world.CreateBody(bodyDef).CreateFixture(fixDef);
        sprite = this.createGroundSprite(new cc.Point((bodyDef.position.x) * pixelsPerMeter, bodyDef.position.y * pixelsPerMeter), 5, 5)
        sprite.setRotation(-cc.RADIANS_TO_DEGREES(Math.PI/4));
        body.sprite = sprite
    },

    onKeyUp: function(keycode) {

        console.log(keycode)
        if (keycode === 39) {
            console.log("rightFlag disabled")
            this.rightFlag = 0         
        }
        if (keycode === 37) {
            console.log("leftFlag disabled")
            this.leftFlag = 0
        }
    },

    onKeyDown: function(keycode) {
        console.log(keycode)
        if (keycode === 39) {
            console.log("rightFlag enabled")
            this.rightFlag = 1
        }
        if (keycode === 37) {
            console.log("leftFlag enabled")
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

