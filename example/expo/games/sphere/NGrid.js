
/*
haxx0r
var sc = NZVisualyser.audioSources._sourceSoundcloud,
  a = 'https://soundcloud.com/agile-recordings/agile-recordings-podcast-0',
  i = 40, i_max = 50;

sc.loadUrlCallSuc = function() {
  console.log(sc.streamURL);
  i++;
  if(i <= i_max)
    sc.loadUrl(a+i);
}
sc.loadUrl( a+i );
*/
// 2015 Nicolás Narváez
//MIT License
try {
  if(NEngine)
(function() {
  var global = this;

	this.NGrid = (function() {
    var  debugging = true,
      sk = io(),
      loop_on = true,
      MusicPorts,
      renderer = NEngine.renderer,
      canvas,
      Obj = NEngine.Obj,
      camera,
      camera3,
      proportion,
      grid,
      player,
      controls,
      vec4=NMath.vec4,
      vec5=NMath.vec5,
      mat4=NMath.mat4,
      mat5=NMath.mat5,
      tmp_v1 = new vec4.create(),
      tmp_v2 = new vec4.create(),
      tmp_m1 = new mat4.create(),
      tmp_m2 = new mat4.create(),
      tmp_m3 = new mat4.create(),
      last_time,
      last_time_key,
      mat5 = NMath.mat5,
      vec5 = NMath.vec5,
      mat = null,
      vec = null,
      pressed = Input.Keyboard.pressed,
      dt,
      dt_phy,
      dt_phy_last,
      dt_phy_planck = 50,
      length=2, grid_size=2, size=1,
      world_grid_geom, world_grid = [], world_grid_size = 0, world_grid_length = 300,
      world_grid_unit_length = 2, world_grid_unit_size = 2,
      i_w, i_z, i_y, i_x, obj,
      axis_geom = NEngine.geometry.axis4({
        size:size
      }),
      pointer_geom = new NEngine.geometry.grid4({
        size:2, length:size*0.5, wire:true
      }),
      bullet = NEngine.geometry.simplex4({
        size:size/2,enemy:false,wire:true
      }),
      enemy_octahedron0 = NEngine.geometry.octahedron4({
        size: size/4, wire:true
      }),
      enemy_simplex0 = NEngine.geometry.simplex4({
        size:size/3,enemy:true, wire:true
      }),
      enemy_geom_generator = enemy_octahedron0,
      enemy_geom_child = enemy_simplex0,
      //console
      config = {
        mouse_rotation : Math.PI/200,
        speed : 1/100,
        camera_rotation: 'absolute',
        camera_rotation_y: 'normal',
        camera_rotation_absolute_y_amplitud: Math.PI/2,
        //mouse position transformation
        mouse_y_trans_x: 0,
        mouse_y_trans_y: 1,
        mouse_x_trans_x: 1,
        mouse_x_trans_y: 0,
        controls: {
          //camera-mouse rotation asociation
          camera_y : 'ry',
          camera_x : 'rx',
          camera_y_altern : 'ry',
          camera_x_altern : 'rz'
        }
      },
      mouse = {
        x : null,
        y : null,
        pressed_left_click: 1,
        pressed_right_click : 2,
        pressed_wheel: 4,
        pressed_browser_back: 8,
        pressed_browser_forward: 16
      },
      ui = {
        info_basic_panel_en : document.getElementById('info-basic-en'),
        info_basic_panel_es : document.getElementById('info-basic-es'),
        info_basic_buttons : document.getElementById('info-basic-buttons')
      },
      pointer,
      game_active;

    function init(options) {
      if(!options) options = {};
      if(!options.container)
        options.container = document.body;

      //set renderer
      var renderer_default = {
        stereo_dim: 4,
		    stereo_crossed: true,

        projection_type: 'direct',  //1 proj mat
        projection_near: 0.1,
        projection_far: 1000,
        projection_angle: Math.PI/1.4,
        projection_3: 'ortogonal',
        projection_3_near: 1,
        projection_3_far: 200,
        projection_3_perspective_angle: Math.PI/1.8,

        camera_disposition_3: 'hexagon',
      };
      renderer.init(renderer_default);

      canvas = renderer.canvas;

      vec = NEngine.renderer.math.vec;
      mat = NEngine.renderer.math.mat;

      camera3 = renderer.camera3;
      camera = renderer.camera;
      //camera.p[1] = 0.5;

      camera.rrx = vec.create();
      camera.rrx[0] = 1.0;
      camera.rry = vec.create();
      camera.rry[1] = 1.0;
      camera.rrz = vec.create();
      camera.rrz[2] = 1.0;
      camera.rrw = vec.create();
      camera.rrw[3] = 1.0;

      camera.rwz = 0.0;
      camera.rwy = 0.0;
      camera.rwx = 0.0;
      camera.rzy = 0.0;
      camera.rzx = 0.0;
      camera.ryx = 0.0;

  	  // camera.p[3] = -15
      ///////////////////////////###examples start here:

  	  var g = new NEngine.geometry.grid4({
          size: 2,
          length: 2,
          wire:true
        }), g2 = new NEngine.geometry.grid4({
          size:3,
          length: 3,
          wire:true
        }), g_joined = new NEngine.geometry.Geom(),

         world_geom = new NEngine.geometry.grid4({
          size: 2,
          length: 200,
          wire:true
        }), e = new NEngine.Entity(),

        world = new NEngine.Entity();
        world.geom = world_geom;

	      e.geom = g;

      function gridSphere(options) {
        var size = options.size || 8,
          radius = options.radius || 10

        var sphere_vertex = new NEngine.Entity()
        sphere_vertex.geom = options.vertex_geom

        var sphere_geom = new NEngine.geometry.Geom()
        var coord_indexes = [0,0,0]
        var coords = [0,0,0]

        while(coord_indexes.ended !== true) {
          for(let j = 2; j >= 0; j--) {
            // Linear indexes
            if(coord_indexes[j] == size-1) {
              if(j == 0) {
                coord_indexes.ended = true
                continue
              }

              coord_indexes[j-1]++
              coord_indexes[j] = 0
            }
            else if(j == 2){
              coord_indexes[j]++
            }

          }

          var r = coord_indexes.map( v => Math.PI*2*v/size )

          var sen_0 = Math.sin(r[0])
          var cos_0 = Math.cos(r[0])

          var sen_1 = cos_0*Math.sin(r[1])
          var cos_1 = cos_0*Math.cos(r[1])

          var sen_2 = cos_1*Math.sin(r[2])
          var cos_2 = cos_1*Math.cos(r[2])

          sphere_vertex.p = [sen_0, sen_1, sen_2, cos_2].map( c => c*radius )

          NEngine.geometry.concat(sphere_geom, sphere_vertex, true);
        }

        return NEngine.geometry.twglize(sphere_geom);
      }

      var sphere_vertex_geom = new NEngine.geometry.grid4({
          size: 2,
          length: 1.5,
          wire: true
        })

      sphere = new NEngine.Entity()
      sphere.geom = new gridSphere({
        size: 14,
        radius: 30,
        vertex_geom: sphere_vertex_geom,
      })
      // sphere.p[0] =10;
      renderer.objAdd(sphere)

      // enemy_geom_child = new gridSphere({
      //   size: 6,
      //   radius: 1,
      //   vertex_geom: new NEngine.geometry.grid4({
      //       size: 2,
      //       length: 0.1,
      //       wire: true
      //     }),
      // })
      // Enemy generators generator

      new  NEngine.geometry.grid4({
        size: 2,
        length: 4,
        iteration: function(p, options) {
          //create object
          //grid = new Obj();
          grid = new NEngine.Entity();
          grid.geom = enemy_geom_generator;
          if(grid_size != 1)
            NMath.vec4.copy(grid.p,p);

          grid.sp = 1;
          enemigos.add(grid);
          generators.add(grid);
          randoms.add(grid);
          renderer.objAdd(grid);

        },functional: true
      })

      window.game = {
        pointer: pointer,
        enemigos: enemigos,
        grid : grid,
        renderer: renderer
      }

      controls.generate();
      set({ mouse_axisRotation:0 });
      set({ config: { camera_disposition_3 : renderer_default.camera_disposition_3 } })
      Input.connectAll();

      // var ev = new Event('keydown');
      // ev.keyCode = 72;
      // window.dispatchEvent(ev)
    }

    function set(options) {
      var config_field;
      for(config_field in options.config)
        config[config_field] = options.config[config_field];

      //deprecated, to NEngine camera config
      if(options.mouse_axisRotation) {
        config.mouse_y_trans_y = Math.cos(options.mouse_axisRotation);
        config.mouse_y_trans_x = -Math.sin(options.mouse_axisRotation);

        config.mouse_x_trans_x = config.mouse_y_trans_y;
        config.mouse_x_trans_y = -config.mouse_y_trans_x;
      }
    }

    var iterators = [],
      generators = new NEngine.obj.iterator(),
      enemigos = new NEngine.obj.iterator(),
      balas = new NEngine.obj.iterator(),
      physical = new NEngine.obj.iterator(),
      randoms = new NEngine.obj.iterator();

    iterators.push(enemigos);
    iterators.push(balas);
    iterators.push(physical);
    iterators.push(randoms);

    generators.add_pass(function(obj, tmp_v1, tmp_v2, tmp_m1, tmp_m2) {
      var child;
      if(Date.now() > timer_5000) {
        timer_5000 = Date.now() + 5000;

        for(i=0,length = generators.list.length; i<length;i++)
          {
          child = new NEngine.Entity();
          vec4.copy(child.p, generators.list[i].p);
          mat4.copy(child.r, generators.list[i].r);

          child.geom = enemy_geom_child;
          child.sp = 0.5;

          randoms.add(child);
          renderer.objAdd(child);
        }

      }
    });

    enemigos.add_pass(function(obj, tmp_v1, tmp_v2, tmp_m1, tmp_m2) {
      //console.log(tmp_v1, tmp_v2, tmp_m1, tmp_m2);
      //console.log(camera.p, pointer.p);
      var vecs, ang, dot;
      tmp_v1[0] = 0;
      tmp_v1[1] = 0;
      tmp_v1[2] = 0;
      tmp_v1[3] = 0.001*dt*obj.sp;

      mat4.multiplyVec(tmp_v2, obj.r, tmp_v1);
      vec4.add(obj.p, obj.p, tmp_v2);

      vec4.copy(tmp_v1, [0,0,0,1])
      mat4.multiplyVec(tmp_v2, obj.r, tmp_v1)
      vec4.sub(tmp_v1, camera.p, obj.p);
      dot = vec4.angleDot(tmp_v2, tmp_v1);
      if(dot > Math.PI/1000) {
        vec4.plane(tmp_v2, tmp_v1);
        ang = dt*Math.PI/(10000);
        if(ang > dot)
          ang = dot;

        mat4.rotationPlane(tmp_m2, tmp_v2, tmp_v1, ang);
        mat4.multiply(obj.r, tmp_m2, obj.r);
      }
    });
    randoms.add_pass(function(obj, tmp_v1, tmp_v2, tmp_m1, tmp_m2) {
        //console.log(tmp_v1, tmp_v2, tmp_m1, tmp_m2);
        //console.log(camera.p, pointer.p);
        var vecs, ang, dot, rand_dir, sp;
        sp = obj.sp;

        //move forward
        tmp_v1[0] = 0;
        tmp_v1[1] = 0;
        tmp_v1[2] = 0;
        tmp_v1[3] = 0.001*dt*sp;  //amount to move forward

        mat4.multiplyVec(tmp_v2, obj.r, tmp_v1);
        vec4.add(obj.p, obj.p, tmp_v2); //move object forward


        //ensure main rand_dir vector
        if(!obj.rand_dir) {
          rand_dir = obj.rand_dir = vec4.create()
          vec4.copy(rand_dir, [
            Math.random()-0.5,
            Math.random()-0.5,
            Math.random()-0.5,
            0,
          ])
          vec4.normalizeI(rand_dir)
          //console.log(rand_dir)
        }
        rand_dir = obj.rand_dir

        //randomize randir
        vec4.copy(tmp_v1, [
          Math.random()-0.5,
          Math.random()-0.5,
          Math.random()-0.5,
          0,
        ])
        vec4.normalizeI(tmp_v1)
        vec4.scaleAndAdd(rand_dir, rand_dir, tmp_v1, 0.01*dt*sp)
        vec4.normalizeI(rand_dir)

        //console.log(rand_dir, vec4.length(rand_dir))
        //apply acumulated rand_dir rotation
        //get frontal vector
        vec4.copy(tmp_v1, [0,0,0,1])
        mat4.multiplyVec(tmp_v2, obj.r, tmp_v1)
        mat4.multiplyVec(tmp_v1, obj.r, rand_dir);
        //get rotation angle
        dot = vec4.angleDot(tmp_v2, tmp_v1);
        //console.log(rand_dir)
        if(dot > Math.PI/1000) {
          vec4.plane(tmp_v2, tmp_v1);
          ang = dt*Math.PI/(10000);
          if(ang > dot)
            ang = dot;

          //console.log(rand_dir, ang)
          //apply rotation
          mat4.rotationPlane(tmp_m2, tmp_v2, tmp_v1, ang);
          mat4.multiply(obj.r, tmp_m2, obj.r);
          mat4.orthogonalizeI(obj.r)
        }
        /*
        vec4.copy(tmp_v1, [0,0,0,1])
        mat4.multiplyVec(tmp_v2, obj.r, tmp_v1)
        vec4.sub(tmp_v1, camera.p, obj.p);
        dot = vec4.angleDot(tmp_v2, tmp_v1);
        if(dot > Math.PI/1000) {
          vec4.plane(tmp_v2, tmp_v1);
          ang = dt*Math.PI/(10000);
          if(ang > dot)
            ang = dot;

          mat4.rotationPlane(tmp_m2, tmp_v2, tmp_v1, ang);
          mat4.multiply(obj.r, tmp_m2, obj.r);
        }
        */
    });

    physical.add_pass(function(obj, tmp_v1, tmp_v2, tmp_m1, tmp_m2) {
      //console.log(tmp_v1, tmp_v2, tmp_m1, tmp_m2);
      //console.log(camera.p, pointer.p);
      var vecs, ang, dot;
      tmp_v1[0] = 0;
      tmp_v1[1] = 0;
      tmp_v1[2] = 0;
      tmp_v1[3] = 0.001*dt*obj.sp;

      mat4.multiplyVec(tmp_v2, obj.r, tmp_v1);
      vec4.add(obj.p, obj.p, tmp_v2);

      vec4.copy(tmp_v1, [0,0,0,1])
      mat4.multiplyVec(tmp_v2, obj.r, tmp_v1)
      vec4.sub(tmp_v1, camera.p, obj.p);
      dot = vec4.angleDot(tmp_v2, tmp_v1);
      if(dot > Math.PI/1000) {
        vec4.plane(tmp_v2, tmp_v1);
        ang = dt*Math.PI/(10000);
        if(ang > dot)
          ang = dot;

        mat4.rotationPlane(tmp_m2, tmp_v2, tmp_v1, ang);
        mat4.multiply(obj.r, tmp_m2, obj.r);
      }
    });

    //wordl related updates -> most to iterators
    var timer_5000 = Date.now() + 5000,
      timer_seg = Date.now() + 1000;
    function update(dt) {
      var i, tmp_v2 = vec4.create(), grid,j, m,m_rot,m_mult,vecs;

      if(Input.Mouse.pressed('left')) {
        grid = new NEngine.Entity();
        grid.geom = bullet;

        NMath.vec4.copy(grid.p, camera.p);
        NMath.vec4.add(grid.p, grid.p, camera.rw)
        //NMath.mat4.copy(grid.r, camera.r);

        balas.add(grid);
        renderer.objAdd(grid)
      }

      tmp_v1 = vec4.create();

      tmp_v2 = vec4.create();
      tmp_v1 = vec4.create();
      ///////////////////////////////////////////////////////////////////camara
      //check inputs
      if(pressed(87)) //w
        tmp_v1[3] += 1.0;
      if(pressed(83)) //s
        tmp_v1[3] += -1.0;

      if(pressed(69)) { //e
        tmp_v1[0] += 1.0;
        tmp_v1[2] += 1.0;
      }
      if(pressed(65)) { //a
        tmp_v1[0] += -1.0;
        tmp_v1[2] += -1.0;
      }

      if(pressed(81)) { //q
        tmp_v1[0] += -1.0;
        tmp_v1[2] += 1.0;
      }
      if(pressed(68)) { //d
        tmp_v1[0] += 1.0;
        tmp_v1[2] += -1.0;
      }
      if(vec4.length(tmp_v1)) {
        vec4.normalize(tmp_v2, tmp_v1);
        NEngine.obj.camera.walk(camera, tmp_v2, config.speed*dt);
      }
      //console.log(dt)
      ///////////////////////////////////////////////////////////////////
      generators.pass(tmp_v1, tmp_v2, tmp_m1, tmp_m2);
      enemigos.pass(tmp_v1, tmp_v2, tmp_m1, tmp_m2);
      physical.pass(tmp_v1, tmp_v2, tmp_m1, tmp_m2);
      randoms.pass(tmp_v1, tmp_v2, tmp_m1, tmp_m2);
    }

    //loop instantiation
    //discrete-known type loops
    function loop() {
      physicsLoop();
      animLoop();
    }
    dt_phy_planck = 10;
    //ch
    function physicsLoop() {
      if(dt_phy_last === undefined)
      dt_phy_last = Date.now();

      dt_phy = Date.now() - dt_phy_last;

      if(dt_phy > dt_phy_planck) {

        update(dt_phy);
        dt_phy_last = Date.now();
        setTimeout(physicsLoop, 0);
      }
    }

    function animLoop() {
      if(last_time === undefined)
        last_time = Date.now();

      dt = Date.now() - last_time;
      // document.getElementById('game_data').innerHTML='FPS '+(1000/dt)+'<br>'+
      // 'enemigos: '+enemigos.list.length;
      document.getElementById('game_data').innerHTML='FPS '+(1000/dt);

      renderer.render();
      if(loop_on) {
        requestAnimationFrame(loop);
        last_time = last_time + dt;
      }
      else
        last_time = undefined;
    }

    controls = (function() {
      var control = config.controls;

      function generate() {

        global.addEventListener('mousemove', function(e) {
          if(!e.movementX && !e.webkitMovementX && !e.mozMovementX) {
            e.movementY = e.detail.movementY,
            e.mozMovementY = e.detail.mozMovementY,
            e.webkitMovementY = e.detail.webkitMovementY,
            e.movementX = e.detail.movementX ,
            e.mozMovementX = e.detail.mozMovementX,
            e.webkitMovementX = e.detail.webkitMovementX
          }
          send_event(e)
          var dsx, dsy, dx,  dy,
            relative_rotators = [camera.rrx, camera.rry, camera.rrz,camera.rrw];
          //use mouse movement when available
          if(e.movementX !== undefined ||
            e.mozMovementX !== undefined ||
            e.webkitMovementX !== undefined) {

            dsx = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            dsy = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
          }
          else {
            if(!mouse.x) {
              mouse.x = e.screenX;
              mouse.y = e.screenY;
            }
            dsx = e.screenX - mouse.x;
            dsy = e.screenY - mouse.y;

            mouse.x = e.screenX;
            mouse.y = e.screenY;
          }

          dx = dsx*config.mouse_x_trans_x + dsy*config.mouse_x_trans_y;
          dy = dsy*config.mouse_y_trans_y + dsx*config.mouse_y_trans_x;
          //make rotations according to internal configuration
          if(dy) {
            if(config.camera_rotation === 'relative')
              vec.rotateNormalizedRelative(camera, camera.rrw,camera.rry,
                -dy*config.mouse_rotation);

            else if(config.camera_rotation === 'absolute') {
              if(e.buttons & 2) {

                camera.rwy += (
                  (camera.rwy < config.camera_rotation_absolute_y_amplitud && dy < 0) ||
                  (camera.rwy > -config.camera_rotation_absolute_y_amplitud && dy > 0))?
                -dy*config.mouse_rotation : 0;
              }
              else {

                if(config.camera_rotation_y === 'absolute') {
                  camera.rwz += ((camera.rwz < config.camera_rotation_absolute_y_amplitud && dy > 0) ||
                  (camera.rwz > -config.camera_rotation_absolute_y_amplitud && dy < 0))?
                -dy*config.mouse_rotation:0;
                }
                else {
                  vec.rotateNormalizedRelative(
                    relative_rotators,
                    3,2,
                    -dy*config.mouse_rotation);
                }

              }
            }
          }

          if(dx) {
            if(config.camera_rotation === 'relative') {
              if(e.button === 2)
                vec.rotateNormalizedRelative(camera, camera.rrw, camera.rrz,
                  -dx*config.mouse_rotation);
              else
                vec.rotateNormalizedRelative(camera, camera.rrw,camera.rrx,
                  dx*config.mouse_rotation);
            }

            else if(config.camera_rotation === 'absolute') {
              if(e.buttons & 2) {
                /*
                camera.rwy += (
                  (camera.rwy < config.camera_rotation_absolute_y_amplitud && dy > 0) ||
                  (camera.rwy > -config.camera_rotation_absolute_y_amplitud && dy < 0))?
                dx*config.mouse_rotation : 0;
                */
                //camera.rwx -= (e.screenX - mouse.x)*config.mouse_rotation;
              }
              else {
                /*
                camera.rwz += ((camera.rwz < config.camera_rotation_absolute_y_amplitud && dx > 0) ||
                (camera.rwz > -config.camera_rotation_absolute_y_amplitud && dx < 0))?
              dx*config.mouse_rotation:0;
                */
                vec.rotateNormalizedRelative(
                  relative_rotators,
                  3,0,
                  dx*config.mouse_rotation);

              }
            }
          }

          if(camera.rwy > config.camera_rotation_absolute_y_amplitud)
            camera.rwy = config.camera_rotation_absolute_y_amplitud;
          if(camera.rwy < -config.camera_rotation_absolute_y_amplitud)
            camera.rwy = -config.camera_rotation_absolute_y_amplitud;

          vec.rotateAbsolute(camera);
        }, false);

        renderer.canvas.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          return false;
        }, true);
        renderer.canvas.addEventListener('contextmenu', function(e) {
          e.stopPropagation();
          e.preventDefault();
          return false;
        }, true);

        global.addEventListener('keyup', function(e) {
        //   console.log('key_up', e)
          if(!e.keyCode) {
            e.isTrusted = e.detail.isTrusted,
            e.keyCode = e.detail.keyCode,
            e.timeStamp = e.detail.timeStamp,
            e.type = e.detail.type
          }
          send_event(e)
        })
        global.addEventListener('keydown', function(e) {
        //   console.log('key_press', e)
          if(!e.keyCode) {
            e.isTrusted = e.detail.isTrusted,
            e.keyCode = e.detail.keyCode,
            e.timeStamp = e.detail.timeStamp,
            e.type = e.detail.type
          }
          send_event(e)
          var dt = Date.now() - last_time_key, tmp_v = vec4.create();
          //console.log(e.keyCode);
          switch(e.keyCode) {
            case 77: // m
              renderer.pointerLockAlternate();
              break;
            case 73: // i
              ui.info_basic_panel_es.classList.toggle('hide');
              ui.info_basic_panel_en.classList.toggle('hide');
              break;
            case 72: // h
              ui.info_basic_buttons.classList.toggle('hide');
              break;
            case 75: // k
              renderer.set({
                stereo_dim: renderer.config.stereo_dim? null:4
              })
              break;
      			case 76: // l
      			  renderer.config.stereo_crossed = !renderer.config.stereo_crossed
      			  // console.log(renderer.config.stereo_crossed)
      			  break;
          }
          last_time_key = Date.now();
          //e.preventDefault();
          e.stopPropagation();
        });
      }
      return {
        generate: generate
      };
    })();

    MusicPorts = (function() {

      SC = (function() {

        return {
          available: true
        }
      })();

      return {
        SC: SC
      };
    })();

    function send_event(e) {
      var sk_key = {
        isTrusted: e.isTrusted,
        keyCode: e.keyCode,
        timeStamp: e.timeStamp,
        type: e.type,
        sk_id: sk.id,
        movementY: e.movementY,
        mozMovementY: e.mozMovementY,
        webkitMovementY: e.webkitMovementY,
        movementX: e.movementX,
        mozMovementX: e.mozMovementX,
        webkitMovementX: e.webkitMovementX
      }
      // console.log('emiting event',
      //   sk.emit('key', sk_key)
      // )
    }

    window.emit_log = function() {
      sk.emit('log',arguments)
    }

    sk.on('key_press', function(key) {
      // console.log(key.sk_id, sk.id)
      if(key.sk_id == sk.id) return
      // console.log('received key_press', key)
      var event = new CustomEvent(key.type, {detail: key})
      // console.log('generated event', event)
      window.dispatchEvent(event)
      global.dispatchEvent(event)
    })

    emit_log('tesintg', {a:5})

    return {
      MusicPorts: MusicPorts,
      init: init,
      loop: loop,
      loop_on: loop_on,
      enemigos: enemigos,
      renderer: renderer
    };
	})();
})();
}
catch(e) {
  console.log('You dont have a NGrind requeriment, NGrid not loaded');
  console.log(e);
}
