/**
@memberof NEngine.GLNSLCompiler
@class Variable
@desc Represents a variable in a scope

opts:
  sentence
  sentence_place:
  scope
  type : prim or function, etc
  qualifiers: storage, precission, return value, etc
  value:
  name: variable name

@prop {Sentence} sentence - The sentence containing var declaration
@prop {Integer} sentence_place - Place in the declaration sentence
@prop {Scope} scope - Container Scope

@prop {String} type - "primitive" or "function"
@prop {Object} type_data: object with more specific datatype data
  for primitives
  parsed type data from qualifiers, like length
@prop {Array} qualifiers - array with datatype dependant data
  primitives: variable declaration qualifiers
  function: return and parameters variables

@prop {String} value - Given value, if this is a literal
  variable (value variable)
@prop {String} name - Variable name



@param {Object} opts - The options object
  @param {Sentence} opts.sentence - The sentence containing var declaration
  @param {Integer} opts.sentence_place -
  @param {Scope} opts.scope -

  @param {String} opts.type - "primitive" or "function"
  @param {Array} opts.qualifiers - storage, precission, return value, etc

  @param {String} opts.value -
  @param {String} opts.name -
*/
function Variable(opts) {
  this.sentence = opts.sentence || null;
  this.sentence_place = opts.sentence_place || 0;
  this.scope = opts.scope || null;

  //typological data
  this.type = opts.type || null;
  this.qualifiers = opts.qualifiers || nul
  this.type_data = null;

  //variable specific
  this.value = opts.value || null;
  this.name = opts.name || '';

  if(qualifiers)
    this.declare();
}
Variable.prototype = {
  operation: function operation() {

  },
  /**
  @memberof NEngine.GLNSLCompiler.Variable
  @desc registers to variable dict. in scope, fills type_data,
  @throws Error if its identifier was  already declared
  */
  declare: function() {
    if(this.scope.variables[this.name])
      throw "variable "+this.name+" already declared";

    //fill type_data
    if(this.type == 'primitive') {
      if(this.qualifiers[3].match('vec')) {//vec
        this.type_data = {
            length: Number( (/\d+$/).exec(this.qualifiers[3]) )
        }
        this.qualifiers[3] = 'vec';
      }
      if(this.qualifiers[3].match('mat')) {//mat
        this.type_data = {
          x: Number( (/\d+/).exec(this.qualifiers[3]) ),
          y: Number( (/\d+$/).exec(this.qualifiers[3]) )
        }
        this.qualifiers[3] = 'mat';
      }
    }

    //register to variable scope
    this.scope.variables[this.name] = this;
  }
}
