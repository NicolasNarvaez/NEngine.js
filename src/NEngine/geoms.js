/**
@memberof NEngine.geometry
@function grid{n}

@param {Object} options - cfg object
@param {Integer} options.size - the subdivisions of the grid for each axis
@param {Integer} options.size_{component} you can target specific components
(x, y, z, w) to override options.size on it
@param {Float} options.length - the length of the grid on all axis
@param {Float} options.length_{component} you can target specific components
(x, y, z, w) to override options.length on it
@param {Boolean} options.wire - if generate wire or face data on data buffers

@param {Function} options.iteration - function to execute on each vertex.
  Receives vertex position according to parametters and the options object
  itself with extra fields for locating the iteration function in the fractal.
  <br/><br/>
  iteration : function(p, options) {} <br/>
  p: the position of the current vertex according to initial parametters
  (size, length) <br/>
  options: options + {recursion_i, recursion_is, recursion_p, recursion_ps} <br/>
  recursion_i is the index of the current vertex in integer, internall format,
  recursion_p is the scaled to world coordinates format. </br>
  options.recursion_is, recursion_ps to get the index of the vertex in the
  fractal grid in the format [ p1 = [p1x, p1y, ..], p2, .. ] for each format.
@param {Integer} options.recursion_depth - To execute recursively, indicating
  height (0 is normal).
@param {Boolean} options.functional - True if to only execute vertex iteration
  and exit avoiding geometry computation.

@desc creates a grid geometry, a grid is understod as a 2 dimensional net, this
time we extend it to n dimensions. Each axis repeats the grid onto it,
perpendicular to all the others. You specify de dimension choosing the n
letter: (grid3, grid4)
<br/><br/>
TODO: extend to N
@return {Geom} grid finished geometry
*/
function grid4(ops) {
  if(!ops) ops = {};

  var
    size_x = ops.size_x || ops.size || 2,
    size_y = ops.size_y || ops.size || size_x,
    size_z = ops.size_z || ops.size || size_y,
    size_w = ops.size_w || ops.size || size_z,

    length_x = ops.length_x || ops.length || 1,
    length_y = ops.length_y || ops.length || length_x,
    length_z = ops.length_z || ops.length || length_y,
    length_w = ops.length_w || ops.length || length_z,

    //this transforms from vertex coordinate to array coordinate
    size_step_x = 4,
    size_step_y = size_x*size_step_x,
    size_step_z = size_y*size_step_y,
    size_step_w = size_z*size_step_z,

    //separation between vertex acording to given size
    length_step_y = length_y/(size_y-1),
    length_step_z = length_z/(size_z-1),
    length_step_x = length_x/(size_x-1),
    length_step_w = length_w/(size_w-1),

    //used as cache for in-loop position assignment
    length_y_m = length_y/2,
    length_z_m = length_z/2,
    length_x_m = length_x/2,
    length_w_m = length_w/2,

    //loop iterators
    i_w, i_z, i_y, i_x, i_dir, i_dir2,

    g;

  //just a recursion, calm down guys
  if(ops.iteration || ops.recursion_depth) {
    var p = NMath.vec4.create(),
      recursion_i = Array(4);


    //first execution
    if(!ops.recursion_depth_total) {
      ops.recursion_depth_total = ops.recursion_depth;
      ops.recursion_depth_current = 0;
    }

    // console.log('ops.recursion_is');
    if(!ops.recursion_is)
      ops.recursion_is = [recursion_i];
    else
    ops.recursion_is.push(recursion_i);

    // console.log('ops.recursion_is', ops.recursion_is);


    if(!ops.recursion_ps)
      ops.recursion_ps = [p];
    else
      ops.recursion_ps.push(p);

    for(recursion_i[3] = size_w; recursion_i[3]--;)
      for(recursion_i[2] = size_z; recursion_i[2]--;)
        for(recursion_i[1] = size_y; recursion_i[1]--;)
          for(recursion_i[0] = size_x; recursion_i[0]--;) {

            p[0] =  recursion_i[0]*length_step_x - length_x_m;
            p[1] =  recursion_i[1]*length_step_y - length_y_m;
            p[2] =  recursion_i[2]*length_step_z - length_z_m;
            p[3] =  recursion_i[3]*length_step_w - length_w_m;

            ops.recursion_i = recursion_i;
            if(ops.iteration)
              ops.iteration(p, ops);

            if(ops.recursion_continue === false)
              continue
            if(ops.recursion_depth) {
              // console.log('starting new grid', ops.recursion_depth)
              ops.recursion_depth--;
              ops.recursion_depth_current++;
              grid4(ops);
              ops.recursion_depth++;
              ops.recursion_depth_current--;
            }
          }
    ops.recursion_ps.pop();
    ops.recursion_is.pop();
      if(ops.functional)
        return
  }

  var position = new GLMAT_ARRAY_TYPE(size_w*size_z*size_y*size_x*4),
    color = new GLCOLOR_ARRAY_TYPE(size_w*size_z*size_y*size_x*4),
    indices = (ops.wire)? new GLINDEX_ARRAY_TYPE(2*(
      size_w*size_z*size_y*(size_x-1) +
      size_w*size_z*(size_y-1)*size_x +
      size_w*(size_z-1)*size_y*size_x +
      (size_w-1)*size_z*size_y*size_x
    )) : new GLINDEX_ARRAY_TYPE(

    );

  if(ops.wire){
    //fill vertex position data
    for(i_w = size_w; i_w--;)
      for(i_z = size_z; i_z--;)
        for(i_y = size_y; i_y--;)
          for(i_x = size_x; i_x--;) {
            i_dir =
              i_w*size_step_w +
              i_z*size_step_z +
              i_y*size_step_y +
              i_x*size_step_x;

            position[ i_dir ] =  i_x*length_step_x - length_x_m;
            position[i_dir+1] =  i_y*length_step_y - length_y_m;
            position[i_dir+2] =  i_z*length_step_z - length_z_m;
            position[i_dir+3] =  i_w*length_step_w - length_w_m;

            color[ i_dir ] = 0.7+ ((i_x-size_x/2)/size_x) + (i_w/size_w)/6;
            color[i_dir+1] = 0.7+ ((i_y-size_y/2)/size_y) + (i_w/size_w)/6;
            color[i_dir+2] = 0.7+ ((i_z-size_z/2)/size_z) + (i_w/size_w)/6;
            color[i_dir+3] = 1;
          }

    //will create all the indices of lines that point in the final axis
    // parameter data direcction
    function createLinesOnAxis(offset,
        size_w, size_z, size_y, size_x,
        size_step_w, size_step_z, size_step_y, size_step_x, db) {

      var indices_size_step_x = 2,
        indices_size_step_y = indices_size_step_x*(size_x-1),
        indices_size_step_z = indices_size_step_y*size_y,
        indices_size_step_w = indices_size_step_z*size_z;

      //para cada elemento en el mapa de lineas
      for(i_w = size_w; i_w--;)
        for(i_z = size_z; i_z--;)
          for(i_y = size_y; i_y--;)
            for(i_x = size_x; --i_x;) {

              //line dir
              i_dir = offset +
                i_w*indices_size_step_w + i_z*indices_size_step_z +
                i_y*indices_size_step_y + (i_x-1)*indices_size_step_x;

              i_dir2 =  (i_w*size_step_w + i_z*size_step_z +
                i_y*size_step_y + i_x*size_step_x)/4;

              indices[i_dir] = i_dir2;
              indices[i_dir+1] = (i_dir2 - size_step_x/4);
            }
    }
    //use for every axis, calculating offset accordingly
    createLinesOnAxis(
      0, size_w, size_z, size_y, size_x,
      size_step_w, size_step_z, size_step_y, size_step_x);
    createLinesOnAxis(
      2*size_w*size_z*size_y*(size_x-1),
      size_w, size_z, size_x, size_y,
      size_step_w, size_step_z, size_step_x, size_step_y);
    createLinesOnAxis(
      2*size_w*size_z*
      (size_y*(size_x-1) + (size_y-1)*size_x),
      size_w, size_x, size_y, size_z,
      size_step_w, size_step_x, size_step_y, size_step_z);
    createLinesOnAxis(
      2*size_w*
        (size_z* (size_y*(size_x-1) + (size_y-1)*size_x) +
        (size_z-1)*size_y*size_x),
      size_x, size_z, size_y, size_w,
      size_step_x, size_step_z, size_step_y, size_step_w);
    }
    else {

    }


    g = Geom.apply({
      length_x : length_x,
      length_y : length_y,
      length_z : length_z,
      length_w : length_w,

      size_x : size_x,
      size_y : size_y,
      size_z : size_z,
      size_w : size_w,
    })
    g.dim = 4


    g.data = {}
    g.data.vertex = position
    if(ops.wire)  g.data.edges = indices
    else  g.data.faces = indices

    g.data.color = color

    return twglize(g)
}
grid4.prototype = Geom.prototype;

grid4.it = function(ops) {
  if(ops.iteration || ops.recursion_depth) {
    var p = NMath.vec4.create(),
      recursion_i = Array(4);


    //first execution
    if(!ops.recursion_depth_total) {
      ops.recursion_depth_total = ops.recursion_depth;
      ops.recursion_depth_current = 0;
    }

    // console.log('ops.recursion_is');
    if(!ops.recursion_is)
      ops.recursion_is = [recursion_i];
    else
    ops.recursion_is.push(recursion_i);

    // console.log('ops.recursion_is', ops.recursion_is);


    if(!ops.recursion_ps)
      ops.recursion_ps = [p];
    else
      ops.recursion_ps.push(p);

    for(recursion_i[3] = size_w; recursion_i[3]--;)
      for(recursion_i[2] = size_z; recursion_i[2]--;)
        for(recursion_i[1] = size_y; recursion_i[1]--;)
          for(recursion_i[0] = size_x; recursion_i[0]--;) {

            p[0] =  recursion_i[0]*length_step_x - length_x_m;
            p[1] =  recursion_i[1]*length_step_y - length_y_m;
            p[2] =  recursion_i[2]*length_step_z - length_z_m;
            p[3] =  recursion_i[3]*length_step_w - length_w_m;

            ops.recursion_i = recursion_i;
            if(ops.iteration)
              ops.iteration(p, ops);

            if(ops.recursion_continue === false)
              continue
            if(ops.recursion_depth) {
              // console.log('starting new grid', ops.recursion_depth)
              ops.recursion_depth--;
              ops.recursion_depth_current++;
              grid4(ops);
              ops.recursion_depth++;
              ops.recursion_depth_current--;
            }
          }
    ops.recursion_ps.pop();
    ops.recursion_is.pop();
      if(ops.functional)
        return
  }
}

function RecursiveIterator(ops) {
  this.geom = ops.g;

}
RecursiveIterator.prototype = {
  next: function next() {
    
  }
}

// grid4.it =

/**
@memberof NEngine.geometry
@function simplex{n}

@param {Object} options cfg object
@param {Integer} options.size the size (length) of the simplex
@param {Boolean} options.wire if generate wire or face data on data buffers

@desc creates a simplex, a simplex is the simplest regular polyhedra on a given
dimension, resembles the triangle but in the given dimension. For n-d a simplex
has n-1 vertex and many faces has (n-1)-d subsimplex (subcollections) that
tesellate it (dont collide when filling it)  <br/><br/>
You specify de dimension choosing the n letter: (simplex3, simplex4)
<br/><br/>
TODO: extend to N
@return {Geom} simplex finished geometry
*/
function simplex4(ops) {
  var g, size = ops.size, type = ops.enemy,
   p = new GLMAT_ARRAY_TYPE([
      -0.5, -0.28867512941360474, -0.2041241452319315, -0.15811388194561005,
      0.5, -0.28867512941360474, -0.2041241452319315, -0.15811388194561005,
      0, 0.5773502743708339, -0.2041241452319315, -0.15811388194561005,
      0, 0, 0.6123724431685174, -0.15811388194561005,
      0, 0, 0, 0.6324555330964848
    ]),
    c = (type)? new GLCOLOR_ARRAY_TYPE([
      1, 0, 0, 1,
      1, 0, 0, 1,
      0, 1, 0, 1,
      0, 1, 0, 1,
      1, 1, 0, 1,
    ]) : new GLCOLOR_ARRAY_TYPE([
      1, 0, 1, 1,
      0, 1, 1, 1,
      1, 1, 1, 1,
      1, 1, 0, 1,
      0, 0, 0, 1,
    ]),
    i = (ops.wire)?new GLINDEX_ARRAY_TYPE([ //if a wire
      0, 1,
      0, 2,
      0, 3,
      0, 4,
      1,2,
      1,3,
      1,4,
      2,3,
      2,4,
      3,4,
    ]):

    new GLINDEX_ARRAY_TYPE([  //if 3D face (4D sub-filling)
      0,1,2,
      0,1,3,
      0,1,4,
      0,2,3,
      0,2,4,
      0,3,4,
      1,2,3,
      1,2,4,
      1,3,4,
      2,3,4,
    ])

    /*
    v_tmp[0] = 1.0 + 0.5*3;
    v_tmp[1] = 0.8660254037844386 + 0.28867513459481287*2;
    v_tmp[2] = 0.816496580927726 + 0.2041241452319315;
    v_tmp[3] = 0.7905694150420949;
    */
  g = Geom.apply({
    })

  g.dim = 4;

  g.data = {}
  g.data.vertex = p;
  if(ops.wire)  g.data.edges = i;
  else  g.data.faces = i;
  g.data.color = c;

  return twglize(g);
}

/**
@memberof NEngine.geometry
@function octahedron{n}

@param {Object} options cfg object
@param {Float} size its length, size

@desc just the n-dimensional extension of the octahedron
<br/><br/>
You specify de dimension choosing the n letter: (octahedron3, octahedron4)
<br/><br/>
TODO: extend to N
@return {Geom} octahedron finished geometry
*/

function octahedron4(ops) {
  var g, size = ops.size,
    p = new GLMAT_ARRAY_TYPE([
    size, 0, 0, 0,
    -size, 0, 0, 0,
    0, size, 0, 0,
    0, -size, 0, 0,
    0, 0, size, 0,
    0, 0, -size, 0,
    0, 0, 0, size,
    0, 0, 0, -size,
  ]),
  c = new GLCOLOR_ARRAY_TYPE([
    0, 1, 1, 1,
    0, 1, 1, 1,

    1, 0, 0, 1,
    1, 0, 0, 1,

    0, 0, 1, 1,
    0, 0, 1, 1,

    1, 1, 0, 1,
    1, 1, 1, 1
  ]),
  i = (ops.wire)? new GLINDEX_ARRAY_TYPE([
    0, 2,
    1, 2,
    0, 3,
    1, 3,
    0, 4,
    1, 4,
    0, 5,
    1, 5,
    0, 6,
    1, 6,
    0, 7,
    1, 7,

    2, 4,
    3, 4,
    2, 5,
    3, 5,
    2, 6,
    3, 6,
    2, 7,
    3, 7,

    4, 6,
    5, 6,
    4, 7,
    5, 7,
  ]): new GLINDEX_ARRAY_TYPE([
    0,2,3,
    0,2,4,
    0,2,5,
    0,2,6,
    0,2,7,

    0,3,4,
    0,3,5,
    0,3,6,
    0,3,7,

    0,4,5,
    0,4,6,
    0,4,7,

    0,5,6,
    0,5,7,
    0,6,7,

    1,2,3,
    1,2,4,
    1,2,5,
    1,2,6,
    1,2,7,

    1,3,4,
    1,3,5,
    1,3,6,
    1,3,7,

    1,4,5,
    1,4,6,
    1,4,7,

    1,5,6,
    1,5,7,
    1,6,7,

    2,4,5,
    2,4,6,
    2,4,7,
    2,5,6,
    2,5,7,
    2,6,7,

    3,4,5,
    3,4,6,
    3,4,7,
    3,5,6,
    3,5,7,
    3,6,7,

    4,6,7,
    5,6,7,
  ]);

  g = Geom.apply({
    boundingSphereRadius: size,
    boundingBoxMax: size,
    boundingBoxMin: size,
    })
  g.dim = 4;

  g.data = {}
  g.data.vertex = p;
  if(ops.wire)  g.data.edges = i;
  else  g.data.faces = i;
  g.data.color = c;

  return twglize(g);
}

/**
@memberof NEngine.geometry
@function axis{n}

@param {Object} ops - cfg object

@desc an axis in n-d is just n orthogonal lines that intersec in the origin
this one has a different colour for each line so you can use it as a guide
<br/><br/>
You specify de dimension choosing the n letter: (axis3, axis4)
<br/><br/>
TODO: extend to N
@return {Geom} axis finished geometry
*/

function axis4(ops){
  var s = ops.size,p = new GLMAT_ARRAY_TYPE([
    0, 0, 0, 0,
    s, 0, 0, 0,
    0, s, 0, 0,
    0, 0, s, 0,
    0, 0, 0, s,
  ]),
  c = new GLCOLOR_ARRAY_TYPE([
    1, 1, 1, 1,

    1, 0, 0, 1,
    1, 1, 0, 1,
    0, 1, 0, 1,
    0, 1, 1, 1,
  ]),
  i = new GLINDEX_ARRAY_TYPE([
    0, 1,
    0, 2,
    0, 3,
    0, 4,
  ]);

  g = new Geom()
  g.dim = 4

  g.data = {
    vertex : p,
    edges : i,
    color : c,
  }

  return twglize(g)
}

function tree4(ops) {

}
