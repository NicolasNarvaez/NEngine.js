//NEngine
if(glMatrix && twgl)  //requires
(function() {

  var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array,
    GLCOLOR_ARRAY_TYPE = (typeof Uint8Array !== 'undefined') ? Float32Array : Array;

  //we need a mat5 extension to glMatrix, to projection, and translation matrixes
  this.mat5 = (function() {

    function identity(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;

      out[5] = 0;
      out[6] = 1;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;

      out[10] = 0;
      out[11] = 0;
      out[12] = 1;
      out[13] = 0;
      out[14] = 0;

      out[15] = 0;
      out[16] = 0;
      out[17] = 0;
      out[18] = 1;
      out[19] = 0;

      out[20] = 0;
      out[21] = 0;
      out[22] = 0;
      out[23] = 0;
      out[24] = 1;
    }

    function create() {
      var out = new GLMAT_ARRAY_TYPE(25);

      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;

      out[5] = 0;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;

      out[10] = 0;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;

      out[15] = 0;
      out[16] = 0;
      out[17] = 0;
      out[18] = 0;
      out[19] = 0;

      out[20] = 0;
      out[21] = 0;
      out[22] = 0;
      out[23] = 0;
      out[24] = 0;
      return out;
    }

    function createIdentity() {
      var out = new GLMAT_ARRAY_TYPE(25);

      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;

      out[5] = 0;
      out[6] = 1;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;

      out[10] = 0;
      out[11] = 0;
      out[12] = 1;
      out[13] = 0;
      out[14] = 0;

      out[15] = 0;
      out[16] = 0;
      out[17] = 0;
      out[18] = 1;
      out[19] = 0;

      out[20] = 0;
      out[21] = 0;
      out[22] = 0;
      out[23] = 0;
      out[24] = 1;
      return out;
    }

    /**
    * @param {vec4} p - vector de traslación
    */
    function translate(out, m, p) {
      out[20] = m[20]+p[0];
      out[21] = m[21]+p[1];
      out[22] = m[22]+p[2];
      out[23] = m[23]+p[3];
    }

    function scale(out, m, vec) {
      out[0] = m[0]*vec[0];
      out[1] = m[1]*vec[0];
      out[2] = m[2]*vec[0];
      out[3] = m[3]*vec[0];

      out[5] = m[5]*vec[1];
      out[6] = m[6]*vec[1];
      out[7] = m[7]*vec[1];
      out[8] = m[8]*vec[1];

      out[10] = m[10]*vec[2];
      out[11] = m[11]*vec[2];
      out[12] = m[12]*vec[2];
      out[13] = m[13]*vec[2];

      out[15] = m[15]*vec[3];
      out[16] = m[16]*vec[3];
      out[17] = m[17]*vec[3];
      out[18] = m[18]*vec[3];
    }

    /**
    * @param {}
    */
    function rotationVecs(out, vx,vy,vz,vw) {
      out[0] = vx[0];
      out[1] = vx[1];
      out[2] = vx[2];
      out[3] = vx[3];
      out[4] = 0;

      out[5] = vy[0];
      out[6] = vy[1];
      out[7] = vy[2];
      out[8] = vy[3];
      out[9] = 0;

      out[10] = vz[0];
      out[11] = vz[1];
      out[12] = vz[2];
      out[13] = vz[3];
      out[14] = 0;

      out[15] = vw[0];
      out[16] = vw[1];
      out[17] = vw[2];
      out[18] = vw[3];
      out[19] = 0;

      out[20] = 0;
      out[21] = 0;
      out[22] = 0;
      out[23] = 0;
      out[24] = 1;
    }

    function projectionLen(out, alfa, beta, gamma, near, far) {
      var x = near/Math.tan(alfa),
        y = near/Math.tan(beta),
        z = near/Math.tan(gamma);
      projection(out, -x, x, -y, y, -z, z, near, far);
    }

    function projection(out, left, right, back, front, bottom, top, near, far) {
      out[0] = 2*near/(right-left);
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;

      out[5] = 0;
      out[6] = 2*near/(front-back);
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;

      out[10] = 0;
      out[11] = 0;
      out[12] = 2*near/(top-bottom);
      out[13] = 0;
      out[14] = 0;

      out[15] = (-(right+left))/(right-left);
      out[16] = (-(front+back))/(front-back);
      out[17] = (-(top+bottom))/(top-bottom);
      out[18] = (-(near+far))/(far-near);
      out[19] = 1;

      out[20] = 0;
      out[21] = 0;
      out[22] = 0;
      out[23] = 2*far*near/(far-near);
      out[24] = 0;
    }

    function multiply(out, a, b) {
      out[24] = a[24]*b[24] + a[19]*b[23] + a[14]*b[22] + a[9]*b[21] + a[4]*b[20];
      out[23] = a[23]*b[24] + a[18]*b[23] + a[13]*b[22] + a[8]*b[21] + a[3]*b[20];
      out[22] = a[22]*b[24] + a[17]*b[23] + a[12]*b[22] + a[7]*b[21] + a[2]*b[20];
      out[21] = a[21]*b[24] + a[16]*b[23] + a[11]*b[22] + a[6]*b[21] + a[1]*b[20];
      out[20] = a[20]*b[24] + a[15]*b[23] + a[10]*b[22] + a[5]*b[21] + a[0]*b[20];
      out[19] = a[24]*b[19] + a[19]*b[18] + a[14]*b[17] + a[9]*b[16] + a[4]*b[15];
      out[18] = a[23]*b[19] + a[18]*b[18] + a[13]*b[17] + a[8]*b[16] + a[3]*b[15];
      out[17] = a[22]*b[19] + a[17]*b[18] + a[12]*b[17] + a[7]*b[16] + a[2]*b[15];
      out[16] = a[21]*b[19] + a[16]*b[18] + a[11]*b[17] + a[6]*b[16] + a[1]*b[15];
      out[15] = a[20]*b[19] + a[15]*b[18] + a[10]*b[17] + a[5]*b[16] + a[0]*b[15];
      out[14] = a[24]*b[14] + a[19]*b[13] + a[14]*b[12] + a[9]*b[11] + a[4]*b[10];
      out[13] = a[23]*b[14] + a[18]*b[13] + a[13]*b[12] + a[8]*b[11] + a[3]*b[10];
      out[12] = a[22]*b[14] + a[17]*b[13] + a[12]*b[12] + a[7]*b[11] + a[2]*b[10];
      out[11] = a[21]*b[14] + a[16]*b[13] + a[11]*b[12] + a[6]*b[11] + a[1]*b[10];
      out[10] = a[20]*b[14] + a[15]*b[13] + a[10]*b[12] + a[5]*b[11] + a[0]*b[10];
      out[9] = a[24]*b[9] + a[19]*b[8] + a[14]*b[7] + a[9]*b[6] + a[4]*b[5];
      out[8] = a[23]*b[9] + a[18]*b[8] + a[13]*b[7] + a[8]*b[6] + a[3]*b[5];
      out[7] = a[22]*b[9] + a[17]*b[8] + a[12]*b[7] + a[7]*b[6] + a[2]*b[5];
      out[6] = a[21]*b[9] + a[16]*b[8] + a[11]*b[7] + a[6]*b[6] + a[1]*b[5];
      out[5] = a[20]*b[9] + a[15]*b[8] + a[10]*b[7] + a[5]*b[6] + a[0]*b[5];
      out[4] = a[24]*b[4] + a[19]*b[3] + a[14]*b[2] + a[9]*b[1] + a[4]*b[0];
      out[3] = a[23]*b[4] + a[18]*b[3] + a[13]*b[2] + a[8]*b[1] + a[3]*b[0];
      out[2] = a[22]*b[4] + a[17]*b[3] + a[12]*b[2] + a[7]*b[1] + a[2]*b[0];
      out[1] = a[21]*b[4] + a[16]*b[3] + a[11]*b[2] + a[6]*b[1] + a[1]*b[0];
      out[0] = a[20]*b[4] + a[15]*b[3] + a[10]*b[2] + a[5]*b[1] + a[0]*b[0];
    }

    return {
      create: create,
      createIdentity: createIdentity,
      identity: identity,

      multiply: multiply,
      mul: multiply,

      translate: translate,
      scale: scale,
      rotationVecs: rotationVecs,

      projectionLen: projectionLen,
      projection: projection
    }
  })();

  this.NEngine = (function() {

    var math, Obj, renderer, geometry;

    var GLMAT_ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;

    math = (function() {
      //front-vector : va
      //rotation-vector: vb
      //all ortogonal
      function rotateNormalized(va, vb, theta) {
        var tmp = vec4.clone(va);

        vec4.scaleAndAdd(va, va, Math.cos(theta)-1);
        vec4.scaleAndAdd(va, vb, Math.sin(theta));

        vec4.scaleAndAdd(vb, vb, Math.cos(theta)-1);
        vec4.scaleAndAdd(vb, tmp, -Math.sin(theta));
      }

      //gets projection of va over vb
      function projection(out,va,vb) {
        vec4.scale(out, vb, vec4.dot(va,vb)/vec4.length(va));
      }

      //will reorthogonalize vectors
      function repair(vx, vy, vz, vw) {
        var length,
          projection = new vec4.create();

        //repair vx
        projection(projection, vx, vy);
        vec4.sub(vx,vx, projection);
        projection(projection, vx, vz);
        vec4.sub(vx,vx, projection);
        projection(projection, vx, vw);
        vec4.sub(vx,vx, projection);

        vec4.normalize(vx, vx);

        projection(projection, vy, vz);
        vec4.sub(vy,vy, projection);
        projection(projection, vy, vw);
        vec4.sub(vy,vy, projection);

        vec4.normalize(vy,vy);

        projection(projection, vz, vw);
        vec4.sub(vz,vz, projection);

        vec4.normalize(vz,vz);
        vec4.normalize(vw,vw);
      }

      return {
        rotateNormalized: rotateNormalized,
        ortogonalize: ortogonalize,
        projection: projection,
        repair: repair,
        rotationMat: rotationMat,
        projectionData: projectionData
      };
    })();

    Obj = (function(){

      function Obj() {
        //position vectors
        this.p = new vec4.create();
        //derivative
        this.dp = new vec4.create();

        //rotation vectors
        this.rx = new vec4.create();
        this.ry = new vec4.create();
        this.rz = new vec4.create();
        this.rw = new vec4.create();
        this.rx[0] = 1.0;
        this.ry[1] = 1.0;
        this.rz[2] = 1.0;
        this.rw[3] = 1.0;
        //derivative
        /*  more complex than i need right now my friend ...
        this.drx = new vec4();
        this.dry = new vec4();
        this.drz = new vec4();
        this.drw = new vec4();
        */
        //better this relative-axis relative rotation angles for usage with math.rotateNormalized
        this.drx = 0.0;
        this.dry = 0.0;
        this.drz = 0.0;
        this.drw = 0.0;

        this.geom = null;
      };

      return Obj;
    })();


    geometry = (function() {

      function grid3(x,y,z, options) {
        if(!options) options = {};
        if(!options.size_z) options.size_z = (!options.size)?100.0:options.size;
        if(!options.size_y) options.size_y = (!options.size)?100.0:options.size;
        if(!options.size_x) options.size_x = (!options.size)?100.0:options.size;

        var position = new GLMAT_ARRAY_TYPE(z*y*x*4),
          indices,
          step_x = 4,
          step_y = x*step_x,
          step_z = y*step_y,
          step_length_z = options.size_z/(z-1),
          step_length_y = options.size_y/(y-1),
          step_length_x = options.size_x/(x-1),
          i_z, i_y, i_x, i_dir;


        //fill vertex position data
        for(i_z = z; i_z--;)
          for(i_y = y; i_y--;)
            for(i_x = x; i_x--;) {
              i_dir = i_w*step_w + i_z*step_z + i_y*step_y + i_x*step_x;

              positions[ i_dir ] =  i_x*step_length_x;
              positions[i_dir+1] =  i_y*step_length_y;
              positions[i_dir+2] =  i_z*step_length_z;
              positions[i_dir+3] =  i_w*step_length_w;
            }

        //create indices
        if(!options.linestrip) {
          indices = new GLMAT_ARRAY_TYPE(2*(
            z*y*(x-1) + z*(y-1)*x + (z-1)*y*x
          )); //wow ...

            //will create all the indices of lines that point in the final axis parameter
            // direcction
            //
            //with this we can maintain code extensibility and editability, and
            //readability ;) .. well, it maybe should be the defacto way of editing the
            //grid, fuck!
          function createLinesOnAxis(offset,
              axis_a_step, axis_b_step, axis_c_step) {
            var i_dir2;

            var step_x = 2, //svs transformators (matrix elements)
              step_y = y*step_x,
              step_z = z*step_y;

            for(i_z = z; i_z--;)
              for(i_y = y; i_y--;)
                for(i_x = x-1; i_x--;) {

                  i_dir = offset + i_z*step_z + i_y*step_y + i_x*step_x;
                  i_dir2 =  i_z*axis_a_step + i_y*axis_b_step + i_x*axis_c_step;

                  indices[i_dir] = i_dir2;
                  indices[i_dir+1] = i_dir2 + axis_c_step;
                }
          }

          //fill with data
          //think of it like a svs (lines svs) maped
          //throught 4 transformation onto the same svs (points svs)
          //and the steps are the matrix transform from R4 to R1
          createLinesOnAxis(0, step_z, step_y, step_x);
          createLinesOnAxis( 2*z*y*(x-1), step_z, step_x, step_y);

          createLinesOnAxis( 2*z(y*(x-1) + (y-1)*x), step_y, step_x, step_z);
        }

        return {
          length_x:x,
          length_y:y,
          length_z:z,

          size_x: options.size_x,
          size_y: options.size_y,
          size_z: options.size_z,

          buffers: {
            position: position,
            indices: indices
          }
          };
      }

      function grid4(x,y,z,w, options) {
        if(!options) options = {};
        if(!options.size_w) options.size_w = (!options.size)?100.0:options.size;
        if(!options.size_z) options.size_z = (!options.size)?100.0:options.size;
        if(!options.size_y) options.size_y = (!options.size)?100.0:options.size;
        if(!options.size_x) options.size_x = (!options.size)?100.0:options.size;

        var position = new GLMAT_ARRAY_TYPE(w*z*y*x*4),
          color = new GLCOLOR_ARRAY_TYPE(w*z*y*x*4),
          indices,
          step_x = 4,
          step_y = x*step_x,
          step_z = y*step_y,
          step_w = z*step_z,
          step_length_w = options.size_w/(w-1),
          step_length_z = options.size_z/(z-1),
          step_length_y = options.size_y/(y-1),
          step_length_x = options.size_x/(x-1),
          i_w, i_z, i_y, i_x, i_dir;

        //fill vertex position data
        for(i_w = w; i_w--;)
          for(i_z = z; i_z--;)
            for(i_y = y; i_y--;)
              for(i_x = x; i_x--;) {
                i_dir = i_w*step_w + i_z*step_z + i_y*step_y + i_x*step_x;

                positions[ i_dir ] =  i_x*step_length_x;
                positions[i_dir+1] =  i_y*step_length_y;
                positions[i_dir+2] =  i_z*step_length_z;
                positions[i_dir+3] =  i_w*step_length_w;

                color[i_dir] = 127;
                color[i_dir+1] = 127;
                color[i_dir+2] = 127;
                color[i_dir+3] = 255;
              }

        //create indices
        if(!options.linestrip) {
          indices = new GLMAT_ARRAY_TYPE(2*(
            w*z*y*(x-1) + w*z*(y-1)*x + w*(z-1)*y*x + (w-1)*z*y*x
          )); //wow ...

            //will create all the indices of lines that point in the final axis parameter
            // direcction
            //
            //with this we can maintain code extensibility and editability, and
            //readability ;) .. well, it maybe should be the defacto way of editing the grid, fuck!
          function createLinesOnAxis(offset,
              axis_a_step, axis_b_step, axis_c_step, axis_d_step) {
            var i_dir2;

            var step_x = 2, //svs transformators
              step_y = y*step_x,
              step_z = z*step_y,
              step_w = w*step_z;

            for(i_w = w; i_w--;)
              for(i_z = z; i_z--;)
                for(i_y = y; i_y--;)
                  for(i_x = x-1; i_x--;) {

                    i_dir = offset + i_w*step_w + i_z*step_z + i_y*step_y + i_x*step_x;
                    i_dir2 =  i_w*axis_a_step + i_z*axis_b_step +
                              i_y*axis_c_step + i_x*axis_d_step;

                    indices[i_dir] = i_dir2;
                    indices[i_dir+1] = i_dir2 + axis_d_step;
                  }
          }

          //fill with data
          //think of it like a svs (lines svs) maped
          //throught 4 transformation onto the same svs (points svs)
          //and the steps are the matrix transform from R4 to R1
          createLinesOnAxis(0, step_w, step_z, step_y, step_x);
          createLinesOnAxis( 2*w*z*y*(x-1), step_w, step_z, step_x, step_y);

          createLinesOnAxis( 2*w*z(y*(x-1) + (y-1)*x), step_w, step_y, step_x, step_z);

          createLinesOnAxis( 2*w(z*(y*(x-1) + (y-1)*x) + (z-1)*y*x),
            step_z, step_y, step_x, step_w);
        }

        return {
          length_x:x,
          length_y:y,
          length_z:z,
          length_w:w,

          size_x: options.size_x,
          size_y: options.size_y,
          size_z: options.size_z,
          size_w: options.size_w,

          buffers: {
            position: {numComponents: 4, data: position},
            indices: {numComponents: 4, data: indices},
            color: {numComponents 4, data: color, type: Uint8Array}
          }
          };
      }

      return {
        grid4: grid4,
        grid3: grid3
      };
    })();

    renderer = (function() {
      var obj_list = [],
        context = null,
        programInfo,
        camera = ;

      function init(container) {
        context = twgl.getWebGLContext(container);
        programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
      }

      function objAdd(obj) {
        obj_list.push(obj);
      }

      function objRm(obj) {
        if(obj_list[obj_list.length-1] === obj) { obj_list.pop(); return; }
        obj_list[ obj_list.indexOf(obj) ] = obj_list.pop();
      }

      function render() {
        twgl.resizeCanvasToDisplaySize();
      }

      return {
        objAdd: objAdd,
        objRm: objRm
      };
    })();

    return {

    };
  })();
})();
/*
//math-compiler:
//matrix multiplication
var str='', operands=[], length=5;
for(i_y = length; i_y--;)
for(i_x = length; i_x--;){
str += 'out['+((i_y*length)+i_x)+'] = ';
operands=[];
for(i_z = length; i_z--;)
 operands.push('a['+(i_z*length+i_x)+']*b['+(i_y*length+i_z)+']');
str += operands.join(' + ');
str += ';\n'
}
*/
