var Sentence = (function SentenceLoader() {


/**
@memberof NEngine.GLNSLCompiler
@class Sentence
@desc represents a single glsl sentence has inf. about variables,
  post-translation, and source location every range is in global (rootScope)
  coordinates, also represents a scope in the scope chain, so it handles
  its translation

@prop {String} src - Sentence code excluding semicolon
@prop {Scope} scope - containing scope
@prop {Integer[]} range - the indexes that limit this.src inside source code
@prop {Integer} number - the index of this sentence in the scope sentence list;

@prop {String} type - declaration, expression (this has subtypes: f.call,
  operation, etc), null, etc <br/>
    null represents an instruction that doesnt needs translation or that does
    nothing at all
@prop {Scope} thisScope - filled only on sentence-block containing sentences
@prop {Expression|Expression[]} components - expressions in variables
	declaration, sentences in flow modifiers
@prop {Variable[]} variables - The variables declarated

	@param {Object} opts - The options object
	@param {String} opts.src
	@param {Scope} opts.scope - only scope containing sentences (ifs, fors, etc)
	@param {Integer[]} opts.range
	@param {Integer} opts.number
	@param {String} opts.type
	@param {Scope} opts.thisScope
	@param {Expression|Expression[]} opts.components
*/
function Sentence(opts) {
	this.src = opts.src
	this.scope = opts.scope || null
	this.range = opts.range || null
	this.number = opts.number || -1

	this.type = opts.type || null
	this.thisScope = opts.thisScope || null

	this.components = opts.components || []
	this.variables = []
	this.strings = opts.strings || []

	//result sentence
	this.out = null


	if(this.src && this.scope && this.number) {
		this.scope.addSentence(this)
		this.interpret()
	}
}
Sentence.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.Sentence
	@desc fills the sentence information interpreting the sentence str components
	list, its type and type related cfg, recognizes the sentence type and
	configures it accordingly currently only types declaration, expression and
	null are implemented, expression sentences include assignation
	*/
	interpret: function interpret() {
		var src = this.src, re, str, str_map, res, i, opts, srcmap,
			lists = Util.Grammar.grammar_lists,
			variable, variables = this.variables, expression;

		if ( src.match(/^\s*for/gi) ){ //for
			this.type = 'for'
		}
		else if ( src.match(/^\s*while/gi) ){ //while
			this.type = 'while'
		}
		else if ( src.match(/^\s*if/gi) ){ //if
			this.type = 'if'
		}
		else if ( src.match(/^\s*else/gi) ){ //else
			this.type = 'else'
		}
		else if ( src.match(/^\s*switch/gi) ){ //switch
			this.type = 'switch'
		}
		else if (this.thisScope) {
			//structs also are here
			this.type = 'function'
		}
		/*
		detects declaration
		initiates scope variables
		*/
		else if( res = RegExp(
				'\\s*(invariant)*\\s*('+lists.storage_qualifiers.join('|')+')*\\s*'+
				'('+lists.precision_qualifiers.join('|')+')*\\s*'+
				'('+lists.datatypes.join('|')+')*\\s*([^]*)', 'gi'
			).exec(src) ) {
			console.log(res)

			this.type = 'declaration'

			//verify sentence
			// format: invariant, storage, precision, datatype,
			// content (converted to name, before var const)
			res.shift()
			res[0] = res[0] || null
			res[1] = res[1] || 'none'
			if(!res[3]) throw 'no datatype on variable declaration'

			//variable constructor data
			opts = {
				sentence: this,
				type: 'primitive',
				qualifiers: res,
			}

			//scape parenthesis, dynamic data
			str_map = new Util.SymbolTree(res[4])
			str_map.strip('(')

			//split each variable (by ,) and work-out expressions for them.
			str = str_map.root()
			re = /([^,]+)/g

			while(res = re.exec(str)) {

				//construct variable (copy-in memory qualifiers)
				opts.sentence_place = variables.length
				opts.qualifiers = opts.qualifiers.concat([])
				opts.qualifiers[4] = (/\w+/g).exec(res[0])[0]
				variable = new Variable(opts)
				variables.push(variable)
				console.log('sentence: variable declared:',res, opts, variable, (/^\s*\w+/g).exec(res[0])[0])

				//construct associated expression
				expression = null
				if( res[0].match('=') ) {
					expression = new Expression({
						sentence: this,
						src: str_map.interpolate(res[0]),
					})
					console.log('sentence: expression: ', expression, str_map, res[0], str_map.interpolate(res[0]))
				}
				this.components.push(expression)
			}
		}
		else if( src.match(/^\s*\w+\s*/gi) ) { //expression
			this.type = 'expression'

		}
		else
			this.type = null
	},
	/**
	@memberof NEngine.GLNSLCompiler.Sentence
	@desc Tells you if this needs translation
	@return {Boolean}
	*/
	needsTranslation: function() {
		if(this.type == 'declaration' || this.type == 'expression') {
			this.variables.forEach(function(e){
				if(e.translatable) return true
			})
		}

		return false
	},
	/**
	@memberof NEngine.GLNSLCompiler.Sentence
	@desc generates a valid GLSL sentence (or group of sentences) that mimics the
	functionality on this sentence and stores it in this.out as a str. It works
	differently on each sentence type
	@return {String} translated
	*/
	translate: function() {

	}
}
return Sentence
})()
