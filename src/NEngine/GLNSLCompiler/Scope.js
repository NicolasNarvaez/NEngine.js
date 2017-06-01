var Scope = (function ScopeLoader() {

/**
@memberof NEngine.GLNSLCompiler
@class Scope
@desc Represents a recursive Scope tree. <br/> <br/>
The rootScope contains the cache of the temp variables
used in intermediate operations (on translated code). This cache
gets added to the begining during translation. It also holds functions
and code automatically generated at the beginning (precode).

@prop {CodeTree} code_tree - On rootScope, points to container CodeTree
@prop {Scope} rootScope - Root Scope of the tree
@prop {String} src - Contained code, currently only root-scope has

@prop {Scope} parent - Parent Scope
@prop {Scope[]} childs - Child Scopes

@prop {Integer[]} range - Start and end index of code in rootScope.src
@prop {Object.<String, Variable>} variables - Dictionary object for scope variables
@prop {Object.<String, Variable>} variables - scope variables generated on ask
	constructor functions, dim-dependant functions, etc
@prop {Sentence[]} sentences - Holds scope sentences
@prop {String[]} sentences_precode - The precode strings (TODO: change to
	'Sentences') precode is code that exists previously to the content and,
	doesnt get affected by reordering of its sentences.

@prop {Object.<TypeCodeName, CacheData>} cacheVariables -  contains
current new temp_variables for extended datatypes
@prop {Object} cacheVariables.typeCodeName - A specific datatype cache
@prop {Variable[]} cacheVariables.typeCodeName.vars - The cache variables
@prop {Variable[]} cacheVariables.typeCodeName.history - The cachevariables
arranged by last used
*/
function Scope(opts) {
	this.code_tree = null

	this.rootScope = null
	this.src = null

	this.parent = null
	this.childs = []

	this.range = null
	this.variables = {}
	this.dynamic_variables = {}
	this.sentences = []
	this.sentences_precode = []

	this.cacheVariables = {}

	/**
	built-in variables-functions (given by standard)

	buit-in functions translate function:
		translates into expression translation object
	recieves expressions list
	*/
	this.built_in = {
		variables: {},
		dynamic_variables: {},
	}
}
Scope.prototype = {
/**
@memberof NEngine.GLNSLCompiler.Scope
@desc Correctly sets the parentScope
*/
setParent: function(parent) {
	this.unsetParent()
	this.parent = parent
	parent.childs.push(this)

	this.rootScope = parent.rootScope || parent
},
/**
@memberof NEngine.GLNSLCompiler.Scope
@desc Correctly unsets the parentScope
*/
unsetParent: function() {
	if(!this.parent) return;

	this.parent.childs.splice(this.parent.childs.indexOf(this),1);
	this.parent = null;
},
/**
@memberof NEngine.GLNSLCompiler.Scope
@desc Recursively in the scope tree searches the variable, takes built-in
into account.
@param {String} varname - Target variable name
@return {Variable} Return null if it cant be find
*/
getVariable: function(varname) {
	var scope = this, variable;

	while(scope) {
	  if(variable = scope.variables[varname]) break

	  scope = scope.parent;
	}

	if(!variable)
		return this.getVariableBuiltin(varname)

	return variable
},
/**
@memberof NEngine.GLNSLCompiler.Scope
@desc Get the variable from the builtin, or dynamic generated builtin
@param {String} varname - Target variable name
@return {Variable} Return null if it cant be find
*/
getVariableBuiltin: function(varname) {

},
/**
@memberof NEngine.GLNSLCompiler.Scope
@desc Generate a dynamic variable if it matches a dynamic variable type, and
adds it to the builtin variables, returning it
@param {String} varname - Target variable name
@return {Variable} Return null if it cant be find
*/
ensureVariableDynamic: function(varname, opts) {
	opts = opts || {}

	var dyn = this.getVariableDynamic(varname), generated

	if(!dyn)	{
		console.log('variable missed on ensureVariableDynamic', varname, dyn)
		return undefined
	}

	console.log('generating variable', varname, dyn)
	generated = dyn.generator.gen(dyn.reg_res);

	if(generated.include_code && !opts.ignore_includes)
		generated.include();

	this.built_in.variables[generated.identifierToken()] = generated
},
/**
@memberof NEngine.GLNSLCompiler.Scope
@desc Gets a dynamic_variable matching a variable name or general qualificated
name.:
@param {String} varname - Target variable name
@return {Variable} Return null if it cant be find
*/
getVariableDynamic: function(varname) {
	//todo: implement different varname formats (qualifiers)
	var dyns = this.built_in.dynamic_variables, dyn,
		res;

	for(dyn in dyns) {
		dyn = dyns[dyn]
		res = dyn.regexp.exec(varname)
		if( res )
			return {generator:dyn, reg_res:res}
	}
},
/**
@memberof NEngine.GLNSLCompiler.Scope
@desc If this scope is the scopeRoot or not
@return {Boolean} isScopeRoot
*/
isRoot: function() {
	return !this.rootScope || (this.rootScope == this)
},
/**
@memberof NEngine.GLNSLCompiler.Scope
@desc Ensures that a given type has its cache variables instantiated for
operations upon it, this is useful only during translation and final
code writting, indexes them by codename. <br/>
Adds them to variables array (avoid colisions) and cacheVariables
(inform cache creation) sentence array. This affects only rootScope
(only a single copy of each typecache is necessary) <br/> <br/>
cache variable names: ___GLNSL_cache_(typeCodeName)_(cacheindex)
@param {Variable} variable - The variable to ensure cache, needs to
have its qualifiers, and type_data set
*/
ensureTypeCache: function ensureTypeCache(variable) {
	if( !this.isRoot() )
		return this.rootScope.ensureTypeCache(variable)

	var cache, i, l, type=variable.data_type,
		codename = type.codename

	if(cache = this.cacheVariables[codename]) return

	cache = this.cacheVariables[codename] = {
		vars: [],
		history: []
		}

	//create cache
	for(i=0,l=3; i<l; i++) {
		cache.vars.push(
		  Variable({
		    scope: this,
		    type: 'primitive',
		    qualifiers: [null, 'none',  //those arent relevant to cache scoping
				variable.qualifiers[2],
				variable.qualifiers[3]],
		    name: "___GLNSL_cache_"+ codename +'_'+i
		  })
		)
		cache.history[i] = cache.vars[i]
		}

},
/**
@memberof NEngine.GLNSLCompiler.Scope
@desc Iterates over the cached variables to avoid dataloss on
two-handed cache operations (they require 3 cache vars)
@param {Variable} variable - Contains datatype description
(precision+datatype)
@return {Variable} variable - The cache variable you needed
*/
getTypeCache: function getTypeCache(variable) {
	this.ensureTypeCache(variable)
	var codename = variable.data_type.codename,
		cache = this.cacheVariables[codename],
		res = cache.history.shift()

	cache.history.push(res)

	return res
},
/**
@memberof NEngine.GLNSLCompiler.Scope
@method precode
@desc updates precode_, returns pre-code sentences in translated text
	format, using sentences_precode
@return translated pre-code sentences
*/
precode: function (cached) {
	if( !this.isRoot() )
		this.rootScope.precode(cached)

	if(cached) return this.precode_
	return this.precode_ = this.sentences_precode.join(' \n')
},
/**
@memberof NEngine.GLNSLCompiler.Scope
@method addPrecode
@desc adds a sentence to the rootScope.sentences_precode array
*/
addPrecode: function(code) {
	if( !this.isRoot() )
		this.rootScope.addPrecode.apply(this, arguments)

	if(!(code instanceof String || typeof code == 'string'))
		throw 'no-string type in addPrecode'

	this.sentences_precode.push(code)
},
/**
@memberof NEngine.GLNSLCompiler.Scope
@method addSentence
@desc adds a sentence to the current scope.sentences array
*/
addSentence: function(sentence) {
	sentence.number = this.sentences.push[sentence];
},
/**
@memberof NEngine.GLNSLCompiler.Scope
@method addBuiltinGLSL
@desc generates the built-in variables of the scope. Those objects arent
 	a singleton in case of multiple codes on different versions of GLSL, like
	keep generating those maps dynamically.
*/
addBuiltinGLSL: function() {
	var variables = {
			/**
				THose variables get translated directly
			*/
			'gl_Position': new Variable({
				type: 'primitive',
				qualifiers: []
			}),
			//TODO: change this into a function initiating first non-dynamic
			//built in functiomns from dyn-built-in defined ones
			// 'length' new Variable({
			// 	type: 'function'
			// })
		},
		/**
	  	  dictioary of built-in variables that are generated on request

	  	  each one has:
	  	  	matching regexp
	  		generator functiom
	  			generator functions have to be called from a scope
	  	  */
		dyn_variables = {
			/**
			N-Vector constructor function
			translates into a n-dim vector constructor function
			*/
			'vecn': {
				regexp: /vec(\d+)/gi,
				//generator function: scopevarinit is the tag
				//to recognize those generator functions
				gen: function vecn_constructor_scopevarinit(reg_res, opts) {
					var r =  new Variable({
						type: 'function',
						name: reg_res[0]
						})

					r.function_inline = {
						type: 'fallback_parametrization',
						fallback: 'vec'
					}
					console.log('builded built-in vector constructor', reg_res,
						r)
					return r
				}
			},
		},
		//dynamically defined already built-in variables
		already_built_in = [],
		variable, dyn_variable,
		this_variables = this.built_in.variables,
		this_dyn_variables = this.built_in.dynamic_variables,
		self = this;

	//ad basic variables
	for(variable in variables)
		this_variables[variable] = variables[variable]

	for(dyn_variable in dyn_variables)
		this_dyn_variables[dyn_variable] = dyn_variables[dyn_variable];

	//add already built-in dynamically defined variables
	(['mat', 'vec', 'ivec', 'bvec']).forEach(function(prefix){
		already_built_in = already_built_in.concat([2,3,4].
			map(function(e){return prefix+e}))
	})

	console.log('right here', already_built_in)

	//for each identifier of the already built in variables defined in dyn-vars
	already_built_in.forEach(function( built_in ) {
		self.ensureVariableDynamic( built_in,
			{ ignore_includes: true })
	})

	console.log('added built-in', this.built_in)
	},
}

return Scope
})()
