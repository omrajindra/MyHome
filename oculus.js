AFRAME.registerComponent("oculus", {
  schema: {
    acceleration: { default: 45 },
    rigSelector: { default: "#rig" },
    fly: { default: false },
    controllerOriented: { default: false },
    adEnabled: { default: true },
    wsEnabled: { default: true },
    enabled: { default: true },
  },
  init: function () {
    this.easing = 1.1;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.tsData = new THREE.Vector2(0, 0);

    this.thumbstickMoved = this.thumbstickMoved.bind(this);
    this.el.addEventListener("thumbstickmoved", this.thumbstickMoved);
  },
  update: function () {
    this.rigElement = document.querySelector(this.data.rigSelector);
  },
  tick: function (time, delta) {
    if (!this.el.sceneEl.is("vr-mode")) return;
    var data = this.data;
    var el = this.rigElement;
    var velocity = this.velocity;
    if (
      !velocity.x &&
      !velocity.z &&
      !this.tsData.length()
    ) {
      return;
    }

    // Update velocity.
    delta = delta / 1000;
    this.updateVelocity(delta);

    if (!velocity.x && !velocity.z) {
      return;
    }

    // Get movement vector and translate position.
    el.object3D.position.add(this.getMovementVector(delta));
  },
  updateVelocity: function (delta) {
    var acceleration;
    var velocity = this.velocity;
    const CLAMP_VELOCITY = 0.00001;

    // If FPS too low, reset velocity.
    if (delta > 0.2) {
      velocity.x = 0;
      velocity.z = 0;
      return;
    }

    // https://gamedev.stackexchange.com/questions/151383/frame-rate-independant-movement-with-acceleration
    var scaledEasing = Math.pow(1 / this.easing, delta * 60);
    // Velocity Easing.
    if (velocity.x !== 0) {
      velocity.x = velocity.x * scaledEasing;
    }
    if (velocity.z !== 0) {
      velocity.z = velocity.z * scaledEasing;
    }

    // Clamp velocity easing.
    if (Math.abs(velocity.x) < CLAMP_VELOCITY) {
      velocity.x = 0;
    }
    if (Math.abs(velocity.z) < CLAMP_VELOCITY) {
      velocity.z = 0;
    }

    if (!this.data.enabled) {
      return;
    }

    // Update velocity using keys pressed.
    acceleration = this.data.acceleration;
    if (this.data.adEnabled) {
      if (Keyboard.isDown(Keyboard.A)) {
        velocity.x -= Math.cos(Math.PI / 4) * acceleration * delta;
        velocity.z += Math.sin(Math.PI / 4) * acceleration * delta;
      } else if (Keyboard.isDown(Keyboard.D)) {
        velocity.x += Math.cos(Math.PI / 4) * acceleration * delta;
        velocity.z -= Math.sin(Math.PI / 4) * acceleration * delta;
      }
    }

    if (this.data.wsEnabled) {
      if (Keyboard.isDown(Keyboard.W)) {
        velocity.y += acceleration * delta;
      } else if (Keyboard.isDown(Keyboard.W)){
        velocity.y -= acceleration * delta;
      }
    }
  },
  getMovementVector: (function () {
    updateRotation: function (delta) {
        var el = this.rigElement;
        var rotationSpeed = 2 * Math.PI / 60; // 2π radians per second
        var rotation = el.object3D.rotation;
        if (this.keys.a) {
          rotation.y += rotationSpeed * delta;
        }
        if (this.keys.d) {
          rotation.y -= rotationSpeed * delta;
        }
      }
      
      updatePosition: function (delta) {
        var el = this.rigElement;
        var position = el.object3D.position;
        var speed = 2; // meters per second
        if (this.keys.w) {
          position.y += speed * delta;
        }
        if (this.keys.s) {
          position.y -= speed * delta;
        }
      
}})(),
thumbstickMoved: function (evt) {
    this.tsData.set(evt.detail.x, evt.detail.y);
},
remove: function () {
    this.el.removeEventListener('thumbstickmoved', this.thumbstickMoved);
}
});

