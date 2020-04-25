/**
  @namespace Physics
  @memberof NEngine
  @desc All physics related stuff, structures to index and optimize n-dimensional
  spaces with lots or hundreds of entities like space-trees and boxes. It also
  holds the PhysicsModules which define diferent kinds of physics processors
  and types, and defines the SpaceGraph for easy space handling (lots of
  TODO here). <br/><br/>
  
  [SpaceGraph]{@link NEngine.Physics.SpaceGraph} implements a multi-topology
  space "network", nodes are [Space]{@link NEngine.Physics.Space}
  trees (or other types) that hold
  Entity core data which gets proyected onto other Space's throught
  [Transforms]{@link NEngine.Physics.Transform} (the graph arcs). <br/><br/>
  
  [Space]{@link NEngine.Physics.Space} and
  [SpaceNode]{@link NEngine.Physics.SpaceNode} implement a clean tree topology
  capable of optimizing objects for collisions and interspace
  intersections (different SpaceGraph nodes), providing basic
  functions to iterate the tree topology or modify nodes. <br/><br/>
  
  [Space]{@link NEngine.Physics.Space} is the
  space tree root container, and holds
  global properties for every SpaceNode. <br/>
  [SpaceNode]{@link NEngine.Physics.SpaceNode} is a recursive generalized
  tree, currently limited to
  "Hexadeca"trees (4D) or octrees in 3D, in other words a 2^n
  generalized n-[t]et tree (you can get a normal binary partition tree by
  setting the size to 2). Its designed to be lazy evaluated and includes
  plumbing functions to iterate and modify subnodes.
  SpaceNode tries to keep the tree references
  coherent so it can be slow, try deactivating stuff (help here). <br/><br/>
*/
Physics = (function() {

  var SpaceGraph,
    Space,
    SpaceNode,
    Transform,
    PhysicsModules;

  SpaceGraph = (function() {
    
    /**
     * @memberof NEngine.Physics
     * @class SpaceGraph
     * @desc SpaceGraph is a graph where nodes are Spaces and arcs are Transforms
     */
    function SpaceGraph() {
      this.spaces = {}
      this.transforms = []
    }

    Object.assign(SpaceGraph.prototype, {
      
    })

    return SpaceGraph;
  })()


  Space = (function() {

    /**
    * @memberof NEngine.Physics
    * @class Space
    * @desc SpaceNode graph container, holds global SpaceNode properties.
    *
    * @prop {String} type - kind of space graph that holds // add opts new types or separate them??

    * @prop {Integer} dim - dims of SpaceNode graph
    * @prop {Integer} size - number of subnodes along an axis
    * @prop {Number} length - length of the subnode on depth 0, to generate
    space coordinates

    * @prop {SpaceNode} root - the root node of the SpaceNodes graph,
    root.parent equals null
    * @prop {Integer} level - the number of levels deper the graph is

    * @prop {Object} lib_vec - corresponding vectorial lib (example: NMath.vec5)
    * @prop {Object} lib_mat - corresponding matrix lib (same as lib_vec)
    *
    * @param {Integer} dim -
    *
    * @param {Integer} size -
    * @param {Number} length -
    * @param {Integer} level -  0 is for bottom, give the level for root, huper node
    *
    * @param {Boolean} fill - if fill Space graph on creation
    */
    function Space(opts) {
      this.type = 'euclidean';

      this.dim = opts.dim;
      this.size = opts.size;
      this.length = opts.length;
      this.level = opts.level;

      //cache dimensional libs
      this.lib_vec = NMath['vec'+this.dim];
      this.lib_mat = NMath['mat'+this.dim];

      this.p = opts.p || this.lib_vec.create();
      this.r = opts.r || this.lib_mat.create();

      //store default node creation parameters for this system
      this.nodesOpts = {
        space: this,
        level: this.level,
        fill: false,

        dim: this.dim,
        size: this.size,
        p: this.lib_vec.create(),
      };
      this.root = new SpaceNode(this.nodesOpts);

      if(opts.fill)
        this.root.fill();

      this.nodesOpts.fill = undefined;
    }

    Space.prototype = {
      /**
      * @memberof NEngine.Physics.Space.prototype
      * @method enlarge
      * @desc add hupper levels to the space system
      * @param {Integer} repeat - Number of levels to generate
      */
      enlarge: function(repeat) {
        //create new root node
        var root, old_root_index, i, opts;
        opts.level = ++this.level;
        opts.p = null;
        opts.parent = undefined;
        root = new SpaceNode( opts );

        //determine root index inside of the new root
        //set it on the center
        if(this.size%2)
          old_root_index = Math.floor(root.childs.length/2);
        //alternate on non-centers to ensure
        //radial node distribution, avoid eternal extends, etc
        else {
          old_root_index = Math.pow(this.size,this.dim)/2;
          //add or sustract the alf of every subdimension
          for(i=dim-1; i>0; i--)
            old_root_index += ((this.level%2)?-1:1)*Math.pow(this.size, i)/2;
        }

        //relink
        this.root.parent = root;
        this.root.index = old_root_index;
        root.childs[ old_root_index ] = this.root;
        this.root = root;

        //calculate new root system relative position
        this.root.setPChild( root.childs[old_root_index] );

        if(repeat)
          this.enlarge(--repeat);
      },
      /**
      * @memberof NEngine.Physics.Space.prototype
      * @method remEnt
      * @param {Entity} Entity
      * @desc removes an entity from the space system
      */
      remEnt: function(ent) {
        if(!ent.container) return;

        var objects = ent.container.objects,
          i = 0; l = objects.length;
        for(;i<l;)
          if(objects[i] && objects[i].indexOf(ent) != -1)
            objects[i].splice( objects[i].indexOf(ent), 1 );

        ent.container = null;
      },
      /**
      * @memberof NEngine.Physics.Space.prototype
      * @method addEnt
      * @param {Entity} Entity
      * @desc adds an entity to the space system
      * checks that the systems has instantiated the corresponding space
      * node and then adds it to the objects array[0] (entity) (checking
      * coherent instantiation of it)
      */
      addEnt: function(ent) {
        var node, array;
        node = this.root.include(ent.p);
        array = node.objects[0];

        if(ent.container)
          this.remEnt(ent);

        if(!array)
          array = node.objects[0] = Array();
        if(array.indexOf(ent) != -1)
          return;

        array.push(ent);
        ent.container = node;
        return node;
      }
    }

    return Space;
  })();

  SpaceNode = (function() {

    /**
    * @memberof NEngine.Physics
    * @class SpaceNode
    * @desc Represents single space net unit, if its a bottom SpaceNode
    * it will contain lists for objects inside their respective physics    * processor type (for example, Entities in Dynamic array)
    *
    * @prop {Space} space - Space containing general configs
    * @prop {Integer} level - Space Index depnes, 0 equals bottom
    * @prop {Integer[]} p - system relative position, integer nd vector,
    *
    * @prop {SpaceNode} parent - Spatially containing node
    * @prop {SpaceNode[]} siblings - Siblings linear Array
    * @prop {Boolean} capsuled - indicates whether all siblings are occupied
    *
    * @prop {Integer} last_visited - last time it was processed by physicsprocessor
    * @prop {Boolean} active - If registered for physics processing
    * @prop {Integer} index - index for fast translation into parent relative
    *   position the mapping is from a n-d vector such as <br/>
    *         p[0] + p[1]*size + p[2]*size**2 [..]
    *
    * childs - Child Spaces linear Array
    * objects - Dictionary containing the objects inside the SpaceNode
    *       separated in arrays, each for each corresponding processor type
    *
    * constructor: fill isnt an automatic option because is rarely needed and
    * extremply complicates code simplicity and opts caching
    +
    * @param {Space} space -
    * @param {Space} parent -
    * @param {Integer} level -
    *
    * @param {Integer} dim -
    * @param {Integer} size -
    *
    * @param {Integer} index -
    * p - requires
    *          undefined = calculate with setP, index and parent required
    *          null = leave empty
    */
    function SpaceNode(opts) {

      this.space = opts.space;
      this.level = opts.level;
      this.length = Math.pow(this.space.length, this.level+1);

      this.parent = opts.parent;
      this.siblings = new Array( opts.dim*2 );
      this.capsuled = false;

      //set index and parent connection
      this.index = opts.index;
      if(!this.parent)
        this.index = -1;
      if(this.index >= 0)
        this.parent.childs[this.index] = this;

      this.p = opts.p;
      if(this.index >= 0 && opts.p === undefined)
        this.setP();
      this.childs = new Array( Math.pow(opts.size,opts.dim) );

      this.last_visited = -1;
      this.active = false;

      if( this.level == 0 )
        this.objects = []
      else
        this.objects = [];

    }

    /**
    * for dynamic space generation
    */
    SpaceNode.prototype = {
      /**
      * @memberof NEngine.Physics.SpaceNode.prototype
      * @desc  calculates the position traslation from parent p vector
      * to child p given the index and child level
      * @param {Integer|Integer[]} child_index - Index relative to parent, can
      *  be the computed index or a positional index
      * @param {Integer} child_level - childNode.level
      * @param {NVector} [p=NVector0] - vector to store data
      * @return {NVector} p - result container
      */
      parentPSeparation: function(child_index, child_level, p) {
        if(!p)  p = this.space.vec_lib.create()

        if(child_index instanceof Number || child_index)
          child_index = this.indextop(index)

        var index_p_middle = this.space.size/2, dim, dims,
          length_transform = Math.pow(this.space.length, child_level)

        for(dim = 0; dim < dims; dim++)
          p[dim] = (child_index[dim]+0.5 - index_p_middle)*length_transform

        return p;
        },
      /**
      * @memberof NEngine.Physics.SpaceNode.prototype
      * @desc configures p according to parent data
      */
      setP: function(p) {
        var vel_lib = this.space.vec_lib
        if(!p) p = (this.p)? this.p : vec_lib.create()

        this.parentPSeparation(this.index, this.level, p)
        this.space.vec_lib.add(p, p, this.parent.p)

        this.p = p
      },
      /**
      * configures p using specific child data
      */
      setPChild: function(child, p) {
        if(!p) p = this.space.vec_lib.create();

        this.parentPSeparation(child.index, child.level, p);
        this.space.vec_lib.sub(p, child.p, p);

        this.p = p;
      },
      /**
      * returns a parent and enlarges the space if necesary
      */
      parentEnsured: function() {
        var parent = this.parent;

        if(!parent) {
          this.space.enlarge();
          parent = this.parent;
        }

        return parent;
      },
      /**
      * converts coord to a index vector
      * doesnt check if coord is inside this node
      */
      coordtoindexp: function(coord, p) {
        if(!p) p = this.space.vec_lib.create();
        var dim = 0, dims = this.space.dim,
          p_this = this.p,
          length = this.length,
          length_mid = length/2,
          unit_size = length/this.space.size;

        for(;dim<dims;)
          p[dim] = Math.floor(coord[dim] - p_this[dim] + length_mid)/unit_size;

        return p;
      },
      /**
      * converts coord to a index integer
      * doesnt check if coord is inside this node
      */
      coordtoindex: function(coord) {
        var dim = 0, dims = this.space.dim,
          size = this.space.size,
          p_this = this.p,
          length = this.length,
          length_mid = length/2,
          unit_size = length/this.space.size,
          index=0;

        for(;dim<dims;)
          index += Math.floor(coord[dim] - p_this[dim] + length_mid)/unit_size*
            Math.pow(size, dim);

        return p;
      },
      /**
      * informs whether coord is inside this node
      */
      isInside: function(coord) {
        var i=0, dim = this.space.dim,
          p_this = this.p,
          limit = this.length/2;

        for(;i<dim;)
          if( Math.abs(coord[i] - p_this[i]) > limit)
            return false;

        return true;
      },
      /**
      * ensures that a given location is internalized
      */
      include: function(coord) {
        //if coord doesnt fit this node search on parent
        if(!this.isInside(coord)) {
          this.parentEnsured().include(coord);
          return;
        }

        var index, opts, child;
        //already reached bottom node
        if(!this.level) return this;

        index = this.coordtoindex(coord);
        child = this.childs[index];

        if(!child) {
          opts = this.space.nodesOpts;

          opts.parent = this;
          opts.level = this.level-1;

          opts.index = index;
          opts.p = undefined;

          child = new SpaceNode(opts);
        }

        return child.include(coord);
      },
      /**
      * creates sibling on given direction
      * doesnt check tree consistency
      */
      extend: function(direction, length) {
        if(this.siblings[direction])
          return;

        var orientation = (direction%2)? 1:-1,
          dim = Math.floor(direction/2),
          size = this.space.size;
          index_max = this.childs.length,

          parent = this.parentEnsured(),
          node,  node_index,
          opts = this.space.nodesOpts,

        opts.p = undefined;
        opts.level = this.level;

        ///////////////////configure opts

        //get index
        node_index = this.index + orientation*Math.pow(size, dim);
        //get parent
        //gets outside of parent, need to find a parent
        if(node_index >= index_max || node_index < 0) {
          //parent needed doesnt exists => extend parent into sibling
          if(!parent.siblings[i])
            parent.extend(direction, length);

          opts.parent = parent.siblings[i];
          node_index = this.index - orientation*(size-1)*Math.pow(size,dim);
        }
        else
          opts.parent = parent;
        opts.index = node_index;

        /////////////////////create-link node
        node = new SpaceNode(opts);
        this.siblings[direction] = node;
        node.siblings[direction - orientation] = this;

        return node;
      },
      /**
      * ensures that siblings of node are instantiated
      * doesnt check tree conectivity
      */
      capsule: function(depth) {
        var direction=0, directions = this.space.dim*2;
        for(;direction < directions;) {
          this.extend(direction);
          if(depth)
            this.sibling[direction].capsule(depth-1);
        }
        return this;
      },
      /*+
      fills the childs array with childs
      opts are the options passed to childs

      travels to each child using a position vector and sets its index
      for each child, the process repeats recursively if fill == true
      */
      fill: function(opts) {
        //first creates childs, then executes connect_childs
        var  index = 0, dim, child, sibling,
          space = this.space,
          dim_top_index = space.dim-1,
          size = space.size,

          pos = space.lib_vec.create(),
          opts;

        opts = {
          parent: this,
          space: space,
          level: this.level-1,

          p: undefined,
          dim: dim_top_index+1,
          size: size,
        };

        //iterate until every position is checked
        for(; pos[dim_top_index] != size;) {

          //create child only if it not exists
          if(!this.childs[index]) {
            opts.index = index;
            child = new SpaceNode(opts);

            if(opts.fill)
              child.fill(opts);
          }

          pos[0]++;
          index++;
          // renormalize position vector
          for(dim = 0; dim < dim_top_index; dim++)
            if(pos[dim] == opts.size) {
              pos[dim] = 0;
              pos[dim+1]++;
            }
        }

        this.connect_childs();

        return this;
      },
      /**
      * connects childs of node
      * to their siblings, posibly in a recursive manner
      */
      connect_childs: function() {
        var parent = this.parent,
          dim, dims = this.space.dim, directions = dims*2, i, d,
          dim_top_index = dims-1,
          size = this.space.size,
          pos = this.space.vec_lib.create(),
          sibling,
          index = 0,
          childs = this.childs,
          child, siblings, sibling;

        //iterate each child
        for(; pos[dim_top_index] != size;) {
          child = childs[index];
          if(!child) continue;

          child_siblings = child.siblings;

          ////start connecting unconnected siblings
          //for each direction
          for(dim=0; dim < directions;) if(!child_siblings[dim]) {
            i = ( dim%2 )? -1 : 1 ;//orientation
            d = Math.floor(dim/2);  //current dimension

            //its a limit node
            if( pos[d] == ( (i==-1)?0:(size-1) ) ) {

              /**if parent brother exists, check if sibling on that brother
              * exists
              */
              if( this.siblings[dim] )
                //get posibly existing child in sibling
                sibling = this.siblings[dim].
                  childs[ child.index - i*(size-1)*Math.pow(size, d) ];
              else
                sibling = null;

            } else //not a limit node
                sibling = this.childs[ child.index + i*Math.pow(size, d ) ];

            if(sibling) {
              //double link:
              //invert direction
              child_siblings[dim] = sibling;
              sibling.siblings[ dim-i ] = child;
            }

          } //siblings ready

          child.connect_childs();

          ////common iteration code
          pos[0]++;
          index++;
          for(dim=0; dim < dim_top_index; dim++) {
            if(pos[dim] == size) {
              pos[dim] = 0;
              pos[dim+1]++;
            }
          }

        }

      },
      /**
      * check sibblings of itself using
      * parent space data
      */
      connect: function() {
        var dim, i, d,
          directions = this.space.dim*2,
          size = this.space.size,
          siblings = this.siblings,
          parent = this.parent,
          pos = this.indextop(this.index);

        for(dim = 0; dim < directions;) if(!siblings[dim]) {
          i = ( dim%2 )? -1 : 1;
          d = Math.floor(dim/2);

          //its a limit conection
          if( pos[d] == (i==-1)?0:(size-1) ) {

            /**if parent brother exists, check if sibling on that brother
            * exists
            */
            if( parent.siblings[dim] )
              //check if searched child brother exists
              sibling = parent.siblings[dim].
                childs[ this.index - i*(size-1)*Math.pow(size, d) ];
            else
              sibling = null;

          } else  //not a limit node
            sibling = parent.childs[ this.index + i*Math.pow(size, d ) ]

          if( sibling ) {
            //double link:
            //invert direction
            siblings[dim] = sibling;
            sibling.siblings[ dim-i ] = this;
          }

        }

      },
      sibling: function(axis, positive) {
        return this.siblings[ axis*2 + ((positive)?1:0) ];
      },
      /**
      * converts p to its corresponding integer index
      */
      ptoindex: function(p) {
        var i,
          l = p.length, index = 0, size = this.space.size;


        for(i=0; i<l; i++)
          index += p[i]*Math.pow(size, i);

        return index;
      },
      /**
      * @memberof NEngine.Physics.SpaceNode.prototype
      * @desc converts index to its corresponding n-d position
      * @param {Integer} index - index for parent.childs array child
      * @param {} p -
      */
      indextop: function(index, p) {
        
        if(!p) p = this.space.lib_vec.create();
        var i, offset,
          size = this.space.size;

        for(i = p.length-1; i >= 0; i--) { //for each dim
          offset = Math.pow(size, i)

          while(index >= 0) {
            index -= offset;

            if(index >= 0)
              p[i]++;
          }
          index += offset;

        }


        return p;
      },
      iterate_bottom: function(f) {
        var i=0, childs=this.childs, l = childs.length, child;
        for(;i<l;) {

          child = childs[i];
          if(child && child.active) {
            if(!child.level)
              f(child);
            else
              child.iterate_bottom(f);
          }

        }
      },
      iterate: function() {

      }
    }

    return SpaceNode;
  })();

  /**
   * @memberof NEngine.Physics
   * @class Transform
   * @desc General relation between SpaceNodes
   * @param {object} template - Overwrites default transforms properties
   * @prop {Shader} template.fs_shader - the fragment shader transform part
   * @constructor
   */
  Transform = (function Transform(template) {
    Object.assign(this, template)
  });
  PhysicsModulesEnum = [];

  /**
  interface PhysicsModule
  */
  PhysicsModules = {
    /**
    * placeholder for normal entity instance
    */
    Entity: (function() {
      function convert() {

      }

      function apply() {

      }

      return {
        convert: convert,
        apply: apply,
      }
    })(),
    /**
    * Represents a basic kinetic object
    */
    Kinetic: (function() {
      var mod;
      function convert(opts) {
        if(!this.dp)
          this.dp = NMath['vec'+this.p.length];
        if(!this.dr)
          this.dr = NMath['mat'+this.p.length];
      }

      function apply(node, dt) {
        var i = 0; childs = node.objects[mod.i]; l = childs.length, child,
          vec_lib = node.space.vec_lib, mat_lib = node.space.mat_lib;

        for(;i<l;) {
          child = childs[i];
          vec_lib.scaleAndAdd(child.p, child.p, child.dp, dt);
          mat_lib.scaleAndAdd(child.r, child.r, child.dr, dt);
        }
      }

      return mod = {
        convert: convert,
        apply: apply,
      }
    })(),

    /**
    * Represents physical object
    */
    Dynamic : (function(){
      var prot, ent_prot;

      function convert(opts) {

        this.type = opts.type;
        switch(this.type) {

          case 'solid':

            this.shape = opts.shape;
            this.mass = opts.mass;
            this.dumpness = opts.dumpness;
            this.friction = opts.friction;

            this.equilibrium = false;
            break;

          default:
        }

      }

      function apply(node) {

      }

      return {
        convert: convert,
        apply: apply,
      }

    })(),
    register: function phy_module_reg(module) {

    },
  };
  
  PhysicsModulesEnum.push(PhysicsModules.Entity);
  PhysicsModules.Entity.i = 0;

  var i=1;
  for(module in PhysicsModules) {
    if(module === PhysicsModules.Entity) continue;

    module.i = i++;
    PhysicsModulesEnum.push(module);
  }
  
  return {
    SpaceGraph: SpaceGraph,
    Space: Space,
    SpaceNode: SpaceNode,
    Transform: Transform,
    PhysicsModules: PhysicsModules,
  }
})()
