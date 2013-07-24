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

function PhysicsDemo () {
    PhysicsDemo.superclass.constructor.call(this)

    this.isMouseEnabled = true
    this.isKeyboardEnabled = true


    this.bodies = []
    this.wheels = []
    this.control = ControlEnum.NEUTRAL

    // Get size of canvas
    var s = Director.sharedDirector.winSize

    this.demo()
    this.scheduleUpdate()
}

// Create a new layer
PhysicsDemo.inherit(Layer, {
    world: null,
    bodies: null,
    selectedBody: null,
    mouseJoint: null,
    wheels: null,
    control: null,
    rigthFlag: null,
    leftFlag: null,

    createCrate: function (point, scale) {
        scale = scale || 1
        var sprite = new nodes.Sprite({file: '/resources/crate.jpg'})
        sprite.position = point

        sprite.scale = scale /2

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
        /*if(rightFlag === 1) { 
            return -5
        }
        if(leftFlag === 1) { 
            return 5
        }*/

        var k = 1
        var b = 5
        var torque = 0

        if(omega < 0) {
            if(rightFlag === 1) { 
                torque = -(k*omega + b)
            }
            if(leftFlag === 1) { 
                torque = b 
            }

        }
        else {
            if(rightFlag === 1) { 
                torque = -b
            }
            if(leftFlag === 1) { 
                torque = k*(-1*omega) + b
            }
        }

        console.log("Torque: " + torque + " Omega: " + omega)
        return torque
    },

    update: function (dt) {
        var world = this.world,
            mouseJoint = this.mouseJoint

        var wheels = this.wheels
        for (var i = 0, len = wheels.length; i < len; i++) {
            console.log("Apply forces")
            var wheel = wheels[i]
            var torque = this.computeTorque(wheel.GetAngularVelocity(), this.rightFlag, this.leftFlag)
            wheel.ApplyTorque(torque)
        }

        world.Step(dt, 10, 10)
        world.ClearForces()

        var bodies = this.bodies
        for (var i = 0, len = bodies.length; i < len; i++) {
            var body = bodies[i],
            pos = body.GetPosition(),
            angle = geo.radiansToDegrees(-body.GetAngle())
            body.sprite.position = new geo.Point(pos.x * 30, pos.y * 30)
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
        fixDef.friction = 0.5
        fixDef.restitution = 0.2

        var bodyDef = new box2d.b2BodyDef

        //create ground
        bodyDef.type = box2d.b2Body.b2_staticBody
        fixDef.shape = new box2d.b2PolygonShape

        fixDef.shape.SetAsBox(20, 2)
        bodyDef.position.Set(10, 400 / 30 + 2)
        world.CreateBody(bodyDef).CreateFixture(fixDef)
        
        bodyDef.position.Set(10, -2)
        world.CreateBody(bodyDef).CreateFixture(fixDef)

        fixDef.shape.SetAsBox(2, 14)
        bodyDef.position.Set(-2, 13)
        world.CreateBody(bodyDef).CreateFixture(fixDef)
        
        bodyDef.position.Set(22, 13)
        world.CreateBody(bodyDef).CreateFixture(fixDef)


        //create some objects
        bodyDef.type = box2d.b2Body.b2_dynamicBody
        
        bodyDef.position.x = 0
        bodyDef.position.y = 5
        
        var scale = 0.5,
        width = scale * 32

        fixDef.shape = new box2d.b2CircleShape(width/30)
        var sprite = this.createBall(new geo.Point(bodyDef.position.x * 30, bodyDef.position.y * 30), scale)

        var bdy = world.CreateBody(bodyDef)
        bdy.sprite = sprite
        this.bodies.push(bdy)
        this.wheels.push(bdy)
        bdy.CreateFixture(fixDef)

        this.rightFlag = 0
        this.leftFlag = 0
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
          , layer = new PhysicsDemo()

        // Add our layer to the scene
        scene.addChild(layer)

        // Run the scene
        director.replaceScene(scene)
    })

    // Preload our assets
    director.runPreloadScene()
}


exports.main = main
