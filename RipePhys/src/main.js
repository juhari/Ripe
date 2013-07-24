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


function PhysicsDemo () {
    PhysicsDemo.superclass.constructor.call(this)

    this.isMouseEnabled = true


    this.bodies = []


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

    update: function (dt) {
        var world = this.world,
            mouseJoint = this.mouseJoint

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
        for (var i = 0; i < 15; ++i) {
            var sprite
            bodyDef.position.x = Math.random() * 15
            bodyDef.position.y = Math.random() * 15
            var scale = (Math.random() + 0.5),
                width = scale * 32
            if (Math.random() > 0.5) {
                fixDef.shape = new box2d.b2PolygonShape
                fixDef.shape.SetAsBox(width/30, width/30)
                sprite = this.createCrate(new geo.Point(bodyDef.position.x * 30, bodyDef.position.y * 30), scale)
            } else {
                fixDef.shape = new box2d.b2CircleShape(width/30)
                sprite = this.createBall(new geo.Point(bodyDef.position.x * 30, bodyDef.position.y * 30), scale)
            }

            var bdy = world.CreateBody(bodyDef)
            bdy.sprite = sprite
            this.bodies.push(bdy)
            bdy.CreateFixture(fixDef)
        }



        /*
        //setup debug draw
        var debugDraw = new box2d.b2DebugDraw()
            debugDraw.SetSprite(document.getElementById('debug-canvas').getContext("2d"))
            debugDraw.SetDrawScale(30.0)
            debugDraw.SetFillAlpha(0.5)
            debugDraw.SetLineThickness(1.0)
            debugDraw.SetFlags(box2d.b2DebugDraw.e_shapeBit | box2d.b2DebugDraw.e_jointBit)
            world.SetDebugDraw(debugDraw)
        */
    }, 

    getBodyAtPoint: function (point) {
        point = new geo.Point(point.x /30, point.y /30)
        var world = this.world
        var mousePVec = new box2d.b2Vec2(point.x, point.y)
        var aabb = new box2d.b2AABB()
        aabb.lowerBound.Set(point.x - 0.001, point.y - 0.001)
        aabb.upperBound.Set(point.x + 0.001, point.y + 0.001)


        var self = this
        function getBodyCB(fixture) {
            if(fixture.GetBody().GetType() != box2d.b2Body.b2_staticBody) {
                if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
                    self.selectedBody = fixture.GetBody()

                    return false
                }
            }
            return true
        }


        // Query the world for overlapping shapes.

        this.selectedBody = null

        world.QueryAABB(getBodyCB, aabb)
        return this.selectedBody
    },

    mouseDown: function (evt) {
        var point = evt.locationInCanvas,
        world = this.world,
            mouseJoint = this.mouseJoint

        if (!mouseJoint) {
            var body = this.getBodyAtPoint(point)
            if(body) {
                var md = new box2d.b2MouseJointDef()
                md.bodyA = world.GetGroundBody()
                md.bodyB = body
                md.target.Set(point.x /30, point.y /30)
                md.collideConnected = true
                md.maxForce = 300.0 * body.GetMass()
                mouseJoint = world.CreateJoint(md)
                body.SetAwake(true)
                this.mouseJoint = mouseJoint

            }
        }
    },

    mouseDragged: function (evt) {
        var point = evt.locationInCanvas,
        world = this.world,
            mouseJoint = this.mouseJoint

        if (mouseJoint) {
            mouseJoint.SetTarget(new box2d.b2Vec2(point.x /30, point.y /30))
        }
    },

    mouseUp: function (evt) {
        var mouseJoint = this.mouseJoint,
            world = this.world

        if (mouseJoint) {
            world.DestroyJoint(mouseJoint)
            this.mouseJoint = null

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
