var pixelsPerMeter = 30;

var b2Vec2 = Box2D.Common.Math.b2Vec2
, b2BodyDef = Box2D.Dynamics.b2BodyDef
, b2Body = Box2D.Dynamics.b2Body
, b2FixtureDef = Box2D.Dynamics.b2FixtureDef
, b2World = Box2D.Dynamics.b2World
, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
, b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
, b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;


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

        this.createGround();
        //this.createGround(fixDef);
        this.createVehicle();

        this.rightFlag = 0;
        this.leftFlag = 0
    },

    createVehicle: function() {

        /*
        // Debug wheel
        //***************************************************************

        // fixture
        var wheelFixture = new b2FixtureDef;
        wheelFixture.density = 1.0;
        wheelFixture.friction = 1.5;
        wheelFixture.restitution = 0.2;

        // body definition
        var wheelBodyDef = new b2BodyDef;
        wheelBodyDef.type = b2Body.b2_dynamicBody;
        wheelBodyDef.position.x = 0;
        wheelBodyDef.position.y = 5;

        wheelFixture.shape = new b2CircleShape(16/pixelsPerMeter);

        var wheelBody = this.world.CreateBody(wheelBodyDef);
        this.wheels.push(wheelBody);
        this.centerBody = wheelBody;
        wheelBody.CreateFixture(wheelFixture);

        // rendering
        var renderer = new DebugShapeRenderer(wheelBody);
        this.addChild(renderer);
        */

        var worldScale = pixelsPerMeter;

        // ************************ THE CAR ************************ //
        // shape
        var carShape = new b2PolygonShape();
        carShape.SetAsBox(120/worldScale,20/worldScale);
        // fixture
        var carFixture = new b2FixtureDef();
        carFixture.density=5;
        carFixture.friction=3;
        carFixture.restitution=0.3;
        carFixture.filter.groupIndex=-1;
        carFixture.shape=carShape;
        // body definition
        var carBodyDef = new b2BodyDef();
        carBodyDef.type=b2Body.b2_dynamicBody;
        carBodyDef.position.Set(0,5);
        /*
        // ************************ THE TRUNK ************************ //
        // shape
        var trunkShape = new b2PolygonShape();
        trunkShape.SetAsOrientedBox(40/worldScale,40/worldScale,new b2Vec2(-80/worldScale,60/worldScale));
        // fixture
        var trunkFixture = new b2FixtureDef();
        trunkFixture.density=1;
        trunkFixture.friction=3;
        trunkFixture.restitution=0.3;
        trunkFixture.filter.groupIndex=-1;
        trunkFixture.shape=trunkShape;
        // ************************ THE HOOD ************************ //
        // shape
        var hoodShape = new b2PolygonShape();
        var carVector=new b2Vec2();
        carVector[0]=new b2Vec2(-40/worldScale,20/worldScale);
        carVector[1]=new b2Vec2(-40/worldScale,100/worldScale);
        carVector[2]=new b2Vec2(120/worldScale,20/worldScale);
        hoodShape.SetAsVector(carVector,3);
        // fixture
        var hoodFixture = new b2FixtureDef();
        hoodFixture.density=1;
        hoodFixture.friction=3;
        hoodFixture.restitution=0.3;
        hoodFixture.filter.groupIndex=-1;
        hoodFixture.shape=hoodShape;
        */
        // ************************ MERGING ALL TOGETHER ************************ //
        // the car itself
        var car=this.world.CreateBody(carBodyDef);
        car.CreateFixture(carFixture);
        //car.CreateFixture(trunkFixture);
        //car.CreateFixture(hoodFixture);
        this.centerBody = car;

        var renderer = new DebugShapeRenderer(car);
        this.addChild(renderer);

        // ************************ THE AXLES ************************ //
        // shape
        /*
        var axleShape = new b2PolygonShape();
        axleShape.SetAsBox(20/worldScale,20/worldScale);
        // fixture
        var axleFixture = new b2FixtureDef();
        axleFixture.density=0.5;
        axleFixture.friction=3;
        axleFixture.restitution=0.3;
        axleFixture.shape=axleShape;
        axleFixture.filter.groupIndex=-1;
        // body definition
        var axleBodyDef = new b2BodyDef();
        axleBodyDef.type=b2Body.b2_dynamicBody;
        // the rear axle itself
        axleBodyDef.position.Set(car.GetWorldCenter().x-(60/worldScale),car.GetWorldCenter().y-(65/worldScale));
        var rearAxle=this.world.CreateBody(axleBodyDef);
        rearAxle.CreateFixture(axleFixture);
        renderer = new DebugShapeRenderer(rearAxle);
        this.addChild(renderer);

        // the front axle itself
        axleBodyDef.position.Set(car.GetWorldCenter().x+(75/worldScale),car.GetWorldCenter().y-(65/worldScale));
        var frontAxle=this.world.CreateBody(axleBodyDef);
        frontAxle.CreateFixture(axleFixture);

        renderer = new DebugShapeRenderer(frontAxle);
        this.addChild(renderer);
        */
        // ************************ THE WHEELS ************************ //
        // shape
        var wheelShape=new b2CircleShape(40/worldScale);
        // fixture
        var wheelFixture = new b2FixtureDef();
        wheelFixture.density=1;
        wheelFixture.friction=3;
        wheelFixture.restitution=0.1;
        wheelFixture.filter.groupIndex=-1;
        wheelFixture.shape=wheelShape;
        // body definition
        var wheelBodyDef = new b2BodyDef();
        wheelBodyDef.type=b2Body.b2_dynamicBody;
        // the real wheel itself
        wheelBodyDef.position.Set(car.GetWorldCenter().x-(60/worldScale),car.GetWorldCenter().y-(65/worldScale));
        var rearWheel=this.world.CreateBody(wheelBodyDef);
        rearWheel.CreateFixture(wheelFixture);
        // the front wheel itself
        wheelBodyDef.position.Set(car.GetWorldCenter().x+(75/worldScale),car.GetWorldCenter().y-(65/worldScale));
        var frontWheel=this.world.CreateBody(wheelBodyDef);
        frontWheel.CreateFixture(wheelFixture);

        renderer = new DebugShapeRenderer(rearWheel);
        this.addChild(renderer);
        renderer = new DebugShapeRenderer(frontWheel);
        this.addChild(renderer);

        // ************************ REVOLUTE JOINTS ************************ //
        // rear joint
        /*
        var rearWheelRevoluteJointDef=new b2RevoluteJointDef();
        rearWheelRevoluteJointDef.Initialize(rearWheel,rearAxle,rearWheel.GetWorldCenter());
        rearWheelRevoluteJointDef.enableMotor=true;
        rearWheelRevoluteJointDef.maxMotorTorque=10000;
        var rearWheelRevoluteJoint=this.world.CreateJoint(rearWheelRevoluteJointDef);
        // front joint
        var frontWheelRevoluteJointDef=new b2RevoluteJointDef();
        frontWheelRevoluteJointDef.Initialize(frontWheel,frontAxle,frontWheel.GetWorldCenter());
        frontWheelRevoluteJointDef.enableMotor=true;
        frontWheelRevoluteJointDef.maxMotorTorque=10000;
        var frontWheelRevoluteJoint=this.world.CreateJoint(frontWheelRevoluteJointDef);
        // ************************ PRISMATIC JOINTS ************************ //
        //  definition
        var axlePrismaticJointDef=new b2PrismaticJointDef();
        axlePrismaticJointDef.lowerTranslation=-20/worldScale;
        axlePrismaticJointDef.upperTranslation=5/worldScale;
        axlePrismaticJointDef.enableLimit=true;
        axlePrismaticJointDef.enableMotor=true;
        // front axle
        axlePrismaticJointDef.Initialize(car,frontAxle,frontAxle.GetWorldCenter(),new b2Vec2(0,1));
        var frontAxlePrismaticJoint=this.world.CreateJoint(axlePrismaticJointDef);
        // rear axle
        axlePrismaticJointDef.Initialize(car,rearAxle,rearAxle.GetWorldCenter(),new b2Vec2(0,1));
        var rearAxlePrismaticJoint=this.world.CreateJoint(axlePrismaticJointDef);
        */
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

