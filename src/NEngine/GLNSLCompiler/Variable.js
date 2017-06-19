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
  function: return and parameters variables qualifiers <br/>
      format: [return_qlfs, params__qlfs [..]]
@prop {String} value - Given value, if this is a literal
  variable (value variable)
@prop {String} name - Variable name

	@param {Object} opts - The options object
	@param {Sentence} opts.sentence - The sentence containing var declaration
	@param {Integer} opts.sentence_place -
	@param {Scope} opts.scope -

	@param {String} opts.type - "primitive" or "function"
	@param {String[]} opts.qualifiers - ['invariant', 'storage', 'precision', 'datatype']
	@param {Function} opts.translate - for dynamic functions

	@param {String} opts.value -
	@param {String} opts.name -
*/
function Variable(opts) {
	this.sentence = opts.sentence || null
	this.sentence_place = opts.sentence_place || 0
	this.scope = opts.scope || (opts.sentence)? opts.sentence.scope : null

	//typological data
	this.type = opts.type || null
	if(opts.translate)	//respect prototype defined
		this.translate = opts.translate
	this.qualifiers = opts.qualifiers || null
	this.type_data = null
	this.built_in = opts.built_in || false	//if it is already built_in in glsl

	//variable specific
	this.value = opts.value || null
	if(this.qualifiers && this.qualifiers.length) {
		console.log('name from qualifiers')
		this.name = this.qualifiers[4]
	}
	else
		this.name = opts.name || ''

	if(this.qualifiers && this.type) {
		this.config()

		if(this.name)	this.declare()
	}
}
Variable.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.Variable.prototype
	@desc returns the identifiers token associated to this var
	TODO: add function token id (handles operator overloading)
	*/
	identifierToken: function identifierToken(qualifiers) {
		qualifiers = qualifiers || this.qualifiers
		return this.name
	},
	/**
	@memberof NEngine.GLNSLCompiler.Variable.prototype
	@desc Sets it type_data getting a VarType
	*/
	config: function config() {
		if( !(this.type == 'primitive') ) return

		this.type_data = VarTypes.type(this.qualifiers)
	},
	/**
	@memberof NEngine.GLNSLCompiler.Variable.prototype
	@desc registers to the variable dictionary in the scope
	@throws Error if its identifier was already declared
	*/
	declare: function() {
		if(!this.scope || !this.name) return

		if(this.scope.variables[this.name])
			throw 'variable '+this.name+' already declared'


		//register to variable scope
		this.scope.variables[this.name] = this
	},
	/**
	@method translate
	@memberof NEngine.GLNSLCompiler.Variable.prototype
	@desc For dynamic functions, translates function
	@param {Expression[]} params - the parametters as expression trees
	*/
	translate: function translate() {
		return this.type_data.translate()
	},
	/**
	@memberof NEngine.GLNSLCompiler.Variable.prototype
	@return {Boolean} translatable - if it needs/is translatable
	*/
	translatable: function tanslatable() {
		//TODO qualifiers -> then translatable
		// return this.type_data.translatable()
	}
}

return Variable

})()
