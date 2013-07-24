"use strict"  // Use strict JavaScript mode

// Pull in the modules we're going to use
var cocos  = require('cocos2d')   // Import the cocos2d module
  , nodes  = cocos.nodes          // Convenient access to 'nodes'
  , events = require('events')    // Import the events module
  , geo    = require('geometry')  // Import the geometry module
  , ccp    = geo.ccp              // Short hand to create points
  , box2d  = require('box2d')

// Convenient access to some constructors
var Layer    = nodes.Layer
  , Scene    = nodes.Scene
  , Label    = nodes.Label
  , Director = cocos.Director

var ControlEnum = {
    LEFT : -1,
    RIGHT: 1,
    NEUTRAL: 0
}

var pixelsPerMeter = 30;

function PhysicsDemo (scene) {
    PhysicsDemo.superclass.constructor.call(this)

    this.isMouseEnabled = true
    this.isKeyboardEnabled = true


    this.bodies = []
    this.wheels = []
    this.control = ControlEnum.NEUTRAL

    // Get size of canvas
    var s = Director.sharedDirector.winSize

    this.scene = scene
    this.demo()
    this.scheduleUpdate()
}

// Create a new layer
PhysicsDemo.inherit(Layer, {
    world: null,
    scene: null,
    bodies: null,
    selectedBody: null,
    mouseJoint: null,
    wheels: null,
    centerBody: null,
    control: null,
    rigthFlag: null,
    leftFlag: null,

    createCrate: function (point, scale) {
        scale = scale || 1
        var sprite = new nodes.Sprite({file: '/resources/asfalt.jpg'})
        sprite.position = point

        sprite.scaleY = scale / 10;
        sprite.scaleX = scale / 2;

        this.addChild(sprite)
        return sprite
    },

    createGroundSprite: function(point, bodyWidth, bodyHeight) {

        var sprite = new nodes.Sprite({file: '/resources/asfalt.jpg'})
        sprite.position = point

        var spriteSize = sprite._contentSize;
        var bodyWidthPixels = bodyWidth*2*pixelsPerMeter;
        var bodyHeightPixels = bodyHeight*2*pixelsPerMeter;
        sprite.scaleY = bodyHeightPixels/spriteSize.height;
        sprite.scaleX = bodyWidthPixels/spriteSize.width;

        this.addChild(sprite)
        return sprite
    },

    createBall: function (point, scale) {
        scale = scale || 1
        var sprite = new nodes.Sprite({file: '/resources/ball.png'})
        sprite.position = point

        sprite.scale = scale

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
        mouseJoint = this.mouseJoint,
        scene = this.scene

        var wheels = this.wheels
        for (var i = 0, len = wheels.length; i < len; i++) {
            var wheel = wheels[i]
            var torque = this.computeTorque(wheel.GetAngularVelocity(), this.rightFlag, this.leftFlag)
            wheel.ApplyTorque(torque)
        }

        world.Step(dt, 10, 10)
        world.ClearForces()
        
        var pos = this.centerBody.GetPosition()
        var scenePos = new geo.Point(-pos.x * pixelsPerMeter + 
                                     scene.contentSize.width/2,
                                     -pos.y * pixelsPerMeter + 
                                     scene.contentSize.height/2)        
        scene.position = scenePos

        var bodies = this.bodies
        for (var i = 0, len = bodies.length; i < len; i++) {
            var body = bodies[i],
            pos = body.GetPosition(),
            angle = geo.radiansToDegrees(-body.GetAngle()),
            point = new geo.Point(pos.x * pixelsPerMeter, 
                                  pos.y * pixelsPerMeter)
            body.sprite.position = point
            body.sprite.rotation = angle
        }
    },

    demo: function () {
        var world = new box2d.b2World(
            new box2d.b2Vec2(0, -10),    //gravity
            true                  //allow sleep
        )
        this.world = world

        var fixDef = new box2d.b2FixtureDef
        fixDef.density = 1.0
        fixDef.friction = 1.5
        fixDef.restitution = 0.2

        var bodyDef = new box2d.b2BodyDef


        this.createGround(fixDef, bodyDef, world)


        //create some objects
        bodyDef.type = box2d.b2Body.b2_dynamicBody
        
        bodyDef.position.x = 0
        bodyDef.position.y = 5
        
        var scale = 0.5,
        width = scale * 32

        fixDef.shape = new box2d.b2CircleShape(width/pixelsPerMeter)
        var sprite = this.createBall(new geo.Point(bodyDef.position.x * pixelsPerMeter, bodyDef.position.y * pixelsPerMeter), scale)

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

        bodyDef.type = box2d.b2Body.b2_staticBody
        fixDef.shape = new box2d.b2PolygonShape
        fixDef.shape.SetAsBox(20, 2)

        bodyDef.position.Set(10, 2)
        body = world.CreateBody(bodyDef).CreateFixture(fixDef)
        sprite = this.createGroundSprite(new geo.Point(bodyDef.position.x * pixelsPerMeter, bodyDef.position.y * pixelsPerMeter), 20, 2)
        body.sprite = sprite


        fixDef.shape.SetAsBox(2, 14)
        bodyDef.position.Set(-2, 13)
        body = world.CreateBody(bodyDef).CreateFixture(fixDef)

        bodyDef.position.Set(23.5, 13)
        body = world.CreateBody(bodyDef).CreateFixture(fixDef)

        fixDef.shape.SetAsOrientedBox(5, 5, new box2d.b2Vec2(0, 0), Math.PI/4);
        bodyDef.position.Set(10, 4);
        body = world.CreateBody(bodyDef).CreateFixture(fixDef);
        sprite = this.createGroundSprite(new geo.Point((bodyDef.position.x) * pixelsPerMeter, bodyDef.position.y * pixelsPerMeter), 5, 5)
        sprite.rotation=(-geo.radiansToDegrees(Math.PI/4));
        console.log(body);
        body.sprite = sprite
    },

    keyUp: function(evt) {
        console.log(evt)
        if (evt.keyCode === 39) {
            console.log("rightFlag disabled")
            this.rightFlag = 0         
        }
        if (evt.keyCode === 37) {
            console.log("leftFlag disabled")
            this.leftFlag = 0
        }
    },

    keyDown: function(evt) {
        console.log(evt)
        if (evt.keyCode === 39) {
            console.log("rightFlag enabled")
            this.rightFlag = 1
        }
        if (evt.keyCode === 37) {
            console.log("leftFlag enabled")
            this.leftFlag = 1
        }
    }

})

/**
 * @class Initial application layer
 * @extends cocos.nodes.Layer
 */
function RipePhys () {
    // You must always call the super class constructor
    RipePhys.superclass.constructor.call(this)

    // Get size of canvas
    var s = Director.sharedDirector.winSize

    // Create label
    var label = new Label({ string:   'Ripe Phys'
                          , fontName: 'Arial'
                          , fontSize: 76
                          })

    // Position the label in the centre of the view
    label.position = ccp(s.width / 2, s.height / 2)
    
    // Add label to layer
    this.addChild(label)
}

// Inherit from cocos.nodes.Layer
RipePhys.inherit(Layer)

/**
 * Entry point for the application
 */
function main () {
    // Initialise application

    // Get director singleton
    var director = Director.sharedDirector
    director.displayFPS = true

    // Wait for the director to finish preloading our assets
    events.addListener(director, 'ready', function (director) {
        // Create a scene and layer
        var scene = new Scene()
          , layer = new PhysicsDemo(scene)

        // Add our layer to the scene
        scene.addChild(layer)

        // Run the scene
        director.replaceScene(scene)
    })

    // Preload our assets
    director.runPreloadScene()
}


exports.main = main
