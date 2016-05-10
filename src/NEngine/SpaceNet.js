/*
The MIT License (MIT)

Copyright (c) 2015 Nicolás Narváez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
Descripcion:

SpaceNet es un modelo teorico en desarrollo para una realidad virtual
distribuida y estilo plug-and play de nodos (servidores), la idea es
crear un metaverso no controlado por una entidad privada o gubernamental
sino que se comporte como un estandar diseñado colectivamente.

Los computadores al conectarse a la spacenet estarian aceptando el estandar
y epezarian a procesar los datos de la red para mantenerla online

Tiene dificultades de implementacion referentes a la seguridad en la
transmision de datos y el reconocimiento de nodos corruptos que puedan
distorsionar datos de la red

Los errores en seguridad de transmision de dartos son producto de la
posible existencia de nodos corruptos en la red, por esto es necesario
tener una manera de detectar los distintos tipos de corrupcion de los nodos
y desconectarlos cuando ocurran, sin que se genere perdida de datos de la red
siendo esta quiza la unica manera de asegurar que sea viable. Tambien
es posible en caso que esto sea muy dificil acotar ciertas caracteristicas
en pos de aumentar la consistencia de la DB y mantenerlas en desarrollo
por ejemplo teniendo ademas del nodo DNS, nodos de vigilancia de alta latencia

Lo anterior se puede simplificar mucho si se encuentra una manera de hacer que
un nodo pueda computar datos externos sin que exista posibilidad de que
se haga una idea de lo que esta computando, asi el nodo DNS junto a los
vigilantes podrian comparar computacion en distintos nodos y cambiar el
enrutamiento de peticiones constantemente

La razon de tanto interes en la red es por la posibilidad de que sea una
tecnologia muy relevante cuando los dispositivos de realidad aumentada y
realidad virtual sean mas utilizados

Lo que contiene este fichero es principalmente un conjunto de estructuras de
datos utiles en implementar un universo infinito, que seria el estandar de
transmision de datos NSpace, pero debido a su complejidad es probablemente
mejor dejarlo para un proyecto aparte
*/
SubSpace = function SubSpace(cfg) {
  this.p = new NMath['vec'+cfg.dim].create();
  this.r = new NMath['mat'+cfg.dim].createIdentity();
};

Space = (function () {
})();

System = (function () {
})();

/**
* @module NPhysics
* contiene implementación, capas de soportar varias caracteristicas de
* primer estandar. Primera implementación:
*/
NPhysics = (function() {
  var simulate,
    simulation_types, SpaceNode, PhyNodem, UniversePhy;

  /**
  * @class UniversePhy
  * @desc: specific phy tree library describing fractal object data.
  * each tree is a free graph, a dictionary of fractal interrelated objects.
  * the two methods given allow easy managing of universes
  */
  UniversePhy = {
    /**
    * @method create
    * @desc copia un arbol descriptor de universo desde la
    * biblioteca de universos
    * @param uname universe tree name, defaults to 'real'
    */
    create: function(uname) {
      return UniversePhy.copy(UniversePhy.universes['real']);
    },

    copy: function(universe) {
      var universe_new,
        i,length, prop_value;

      for(prop in universe)
        if(prop != 'objects') {
          universe_new[prop] = universe[prop];
        }
        else {
          prop_value = universe[prop];
          for(i=0, length =prop_value.length; i<length; i++)
            universe_new.push(universe[i]);

        }
    },
    universes: [
      {
        name: 'real',
        objects: [
          {
            name: 'universe',
            //density cloud??
            //neural galactic system??
            //lets be clasic for now. A spherical matter distribution
            //a particle.
            phy_type: 'fluid',
            mass: 1,
            geom: function real_universe_geom() {

            }
          },
          {
            name: 'electron',
            //just a point
            phy_type: 'wave',
            geom: function electron_geom() {
              return {

              }
            },
            //electrons contains universe
            childs: [
              'universe'
            ]
          }
        ],
      }, {
        name: 'psychodelic',
        objects: [

        ]
      }
    ]
  }

  /**
  * phy objet descripcion:
  * es una descripción de universo recursiva, un arbol descriptor de
  * universo que se itera conforme se requiere informacion, puede ser
  * rizómico y por tanto soportar universos estructuralmente fractales
  *
  * Cada nodo es un objeto, cada objeto se compone de otros.
  * Y entre los objetos hay espacio (indexadores de espacio), tanto en la misma
  *  escala, como entre escalas
  *
  * Los objetos pueden cambiar de espacio contenedor (indexador) dependiendo de
  * cambios en su oposicion, configuracion, o propiedades como la cantidad
  * de energia que contienen, la razon de tenerlos constantemente indexadores
  * en los contenedores es para mantener la eficiencia lo mas alta posible
  * en calculos de colision y predictibilidad, aun falta hacer un estudio de
  * esto pero a grandez rasgos y con un estudio preliminar, es lo mejor
  * ademas permite tener la maleabilidad de crear spacios grid distribuidos
  * en multiples servidores
  *
  * campos:
  * -str name: nombre del tipo de objeto físico
  * -str geom: funcion generadora de geometria, vertices, triangulos, o modelo
  * -str phy_type: tipo de modelo fisico
  *   object: es un objeto discreto, masa puntual, mecánica clásica
  *   fluid: fluido, o agregado de partículas
  *   wave: es una onda, una vez existiendo, encontrarselo es probabilistico
  *
  * -float mass: masa proporcional a escala
  * -float speed_length
  * -string speed_deviation_type
  * -float speed_deviation
  * -[vector, string deviation, value] speed: velocidad
  * -float t_speed: velocidad proporcional a escala superior
  *
  * Propiedades de generación en medio contenedor:
  * [float, int exp] dist_parent_scale //determina escala en que se vuelve subobjeto de otro
  * -str dist_parent_type: //determina regiones de objetos que llenar con subobjetos
  *                      para cuando se encuentra en igual orden de magnitud
  *   uniform_space: llenar espacio uniformemente
  *   uniform_surface: llenar según área, densidad uniforme
  *   uniform_inner: llenar los triangulos de la geom con masa
  *   vertex: calcular subparticulas según vertex
  * -function dist_parent_f: una función que indica regiones de probabilidad
  *                          en ejes espaciales y escalares
  * -str dist_rot_parent_type: //análogo dos anteriores pero rotaciones
  * function child_generator(child, coords): configura propiedades especiales
  *                     de nodo hijo según coordenadas.
  *
  * recursion
  * array[PhyNode] childs:
  *
  *
  */

  PhyNode = function() {
    this.name;
    this.geom;

    this.mass;
    this.speed;
    this.scale;

    this.t_speed;

    this.dist_parent;
    this.dist_parent_type;
    this.dist_parent_f;

    this.child_generator;

    this.phy_type;
    this.childs=[];
   }

   PhyNode.prototype = {
   }

  /**
  * @class SpaceNode
  * @desc implementacion orientada a espacios basados en objetos
  * fractales (only object refractalization)
  *
  * el arbol fractal de espacios es una red que comunica objetos fractales,
  * los objetos fractales son uniones entre espacios, sistemas coordenados
  * distintos y que estan interrelacionados generativamente con un
  * conjunto de rizomias
  *
  * el campo phy es de la clase PhyNode
  */

  SpaceNode = (function() {
    function SpaceNode() {
      this.subunit_base = 4;
      this.phy_depth = 0;
      this.entity = new Entity();

      this.parent = null;
      this.childs = [];
      this.phytree = {};

    }
    SpaceNode.prototype = {
      copy: function() {

      }
    }
    return SpaceNode;
  })();



  simulation_types = {
    real: {
      //generates a virtual reality environment oriented to
      //universe and levels of organization
      create: function simulation_type_real (SpaceNode) {
        //SpaceNode.data = simulation_types.
      },
      defaults: {
        //node_cero: =
      }
    }
  }

  simulate = function(SpaceNode) {

    if(!SpaceNode.data)
      SpaceNode.data = simulation_types[SpaceNode.phy_type].create(SpaceNode);


  }

  return {
    simulate: simulate
  }
})();



/**
* @module: NSpace
* realidad virtual global
* es un interprete de datos externos para metaverso
* permite injeccion de servicios para configuracion de metaverso
* y sincronizacion con metaversos externos y ejecucion en múltiples
* protocolos distintos
* hasta que no sea necesario agregar compresion de datos o formatos
* alternos, no sera necesario crear estructura de interpretacion
* en el mejor de los casos, los datos siempre seran compartidos con este
* formato y no sera necesario implementar interpretacion a
* formatos ajenos a la descripcion js universal
*/
NSpace = (function () {
  var SpaceParser, SpaceNode, SpaceNodeService, SpaceNodeInjector, SpaceServices={};


  SpaceNodeInjector = (function() {
    function injectService(service) {
      SpaceSevices[service.name] = service.data;
    }
    return {
      injectService: injectService
    }
  })();

  SpaceServices.NNode = (function() {
    var parse, Node, random;

    /**
    * module:
    */

    Node = function() {
    }

    Node.defaults = {
      //space properties
      fractality : true,
      fractality_distribution_axis : 'spaceType', //dynamics| interleaved| mimics(spacetype)
      //subunit: cada voxel separado en n^3 subinidesdes (distribution multipier)
      fractality_distribution_depth_unit : 'subunit',
      //proporcion en la cual iniciar nuevo voxelamiento
      fractality_distribution_proportion: 0.0000001,  //flotante de reparación de errores, 7 digitos precision, mínimo (alguna forma de mantencion de coherencia)
      //elejido según dist hasta proxima aparicion de objetos en escala
      fractality_distribution_base: 4,
      fractality_horizontal_links : true,

      fractality_object_coord : true, //permite a los nodos objeto disparar nodos espacio
      fractality_object_coord_only : true,  //obliga a que todos los nodos espacios sean nodos objetos
      fractality_function : false,
      spaceType : 'Axial',
      spaceAxis : 'Euclid',
      spaceAxisNum : 4,
      //vert_density //obliga campos de conf. de distribution en cada nodo obj
      //phy_fractal: según información física de fractalización
      object_fractal_res : 'phy_fractal',
      phy_engine : 'nphysics',
      phy_type : 'real',  //on each scale, complex objects appears
      data: null,
      //space chunk properties
      depth : 'unlimited'
    }

    parse = function(SpaceNode) {
      var node = new Node();

      for(def in Node.defaults)
        node[def] = Node.defaults[def];

      for(def in SpaceNode.fields)
        node[def] = SpaceNode[def];

        //normalización valores


    }
    return {
      parse: parse
    }
  })();

  //unidad mínima de seguridad??? minimum security unit??
  SpaceNode=function SpaceNode(){
    this.arch='NNode';  //HSDL.js
  }
  SpaceNode.prototype = {

  }


  SpaceParser = (function(spaceNode){
    var parse;

    parse = function SpaceParser_parse(spaceNodeData) {
      var Space;

      try{
        Space = SpaceServices[spaceNodeData.arch].parse(spaceNodeData);
      }
      catch(e) {
        console.log(e)
        throw e;
      }

      return Space;
    }

    return {
      parse: parse
    }
  })();

  return {
    SpaceNodeInjector: SpaceNodeInjector,
    SpaceParser: SpaceParser,
    SpaceNode: SpaceNode
  }
})();
