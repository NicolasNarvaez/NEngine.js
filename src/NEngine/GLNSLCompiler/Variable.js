var Variable = (function VariableLoader() {


/**
@memberof NEngine.GLNSLCompiler
@class Variable
@desc Represents a variable in a scope

@prop {Sentence} sentence - The sentence containing var declaration
@prop {Integer} sentence_place - Place in the declaration sentence
@prop {Scope} scope - Container Scope

@prop {String} type - "primitive" or "function"
@prop {Object} type_data: object with more specific datatype data
  for primitives is on the format provided by Vartypes.types
@prop {Array} qualifiers - array with datatype dependant data <br/>
  primitives: variable declaration qualifiers <br/>
      format: [invariant, storage, precision, typeCodeName] <br/>
  function: return and parameters variables <br/>
      format: [return, params [..]]

@prop {String} value - Given value, if this is a literal
  variable (value variable)
@prop {String} name - Variable name

@param {Object} opts - The options object
  @param {Sentence} opts.sentence - The sentence containing var declaration
  @param {Integer} opts.sentence_place -
  @param {Scope} opts.scope -

  @param {Stxring} opts.type - "primitive" or "function"
  @param {Array} opts.qualifiers - storage, precission, return value, etc

  @param {String} opts.value -
  @param {String} opts.name -
*/
function Variable(opts) {
  this.sentence = opts.sentence || null
  this.sentence_place = opts.sentence_place || 0
  this.scope = opts.scope || opts.sentence.scope || null

  //typological data
  this.type = opts.type || null
  this.qualifiers = opts.qualifiers || null
  this.type_data = null

  //variable specific
  this.value = opts.value || null
  this.name = opts.name || ''

  if(this.qualifiers && this.type) {
    this.config()

    if(this.name)	this.declare()
  }
}
Variable.prototype = {
  /**
  @memberof NEngine.GLNSLCompiler.Variable
  @desc Sets it type_data
  */
  config: function config() {
    if(!(this.type == 'primitive')) return

    var datatype, types = VarTypes.types,
      type, prim_qualifier = this.qualifiers[3],
      reg_res

    for(datatype in types) {
      type = types[datatype]
      reg_res = RegExp(type.exp).exec(prim_qualifier)
      if(reg_res)
        this.type_data = type.constructor( this.qualifiers, reg_res )

      break;
    }

    this.type_data
  },
  /**
  @memberof NEngine.GLNSLCompiler.Variable
  @desc registers to the variable dictionary in the scope
  @throws Error if its identifier was already declared
  */
  declare: function() {
    if(!this.scope || !this.name) return

    if(this.scope.variables[this.name])
      throw "variable "+this.name+" already declared";


    //register to variable scope
    this.scope.variables[this.name] = this;
  }
}

return Variable

})()
