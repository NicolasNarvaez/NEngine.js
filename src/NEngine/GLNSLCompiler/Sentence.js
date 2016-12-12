var Sentence = (function SentenceLoader() {


/**
@memberof NEngine.GLNSLCompiler
@class Sentence
@desc represents a single glsl sentence has inf. about variables,
  post-translation, and source location every range is in global (rootScope)
  coordinates

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
  @param {Scope} opts.scope
  @param {Integer[]} opts.range
  @param {Integer} opts.number
  @param {String} opts.type
  @param {Scope} opts.thisScope
  @param {Expression|Expression[]} opts.components
*/
function Sentence(opts) {
  this.src = opts.src;
  this.scope = opts.scope || null;
  this.range = opts.range || null;
  this.number = opts.number || -1;

  this.type = opts.type || null;
  //only scope containing sentences (ifs, fors, etc)
  this.thisScope = opts.thisScope || null;

  this.components = opts.components || [];
  this.variables = [];
  this.strings = opts.strings || []

  //result sentence
  this.out = null;


  if(this.src && this.scope && this.number) {
    this.scope.addSentence(this);
    this.interpret();
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
			lists = Util.Grammar.grammar_lists, variable, expression;

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
				"\\s*(invariant)*\\s*("+lists.storage_qualifiers.join('|')+")*\\s*"+
				"("+lists.precision_qualifiers.join('|')+")*\\s*"+
				"("+lists.datatypes.join('|')+")*\\s*([^]*)", 'gi'
			).exec(src) ) {
			console.log(res)

			this.type = 'declaration'

			//verify sentence
			// format: invariant, storage, precision, name
			res.shift();
			res[0] = res[0] || null;
			res[1] = res[1] || 'none';
			if(!res[3]) throw "no datatype on variable declaration";

			//variable constructor data
			opts = {
				sentence: this,
				type: 'primitive',
				qualifiers: res,
			}

			//interpolate dynamic variables
			str_map = Util.SymbolTree(res[4])
			str_map.strip('(')
			str = str_map.root()

			re = /([^,]+)/g;
			this.variables = [];

			while(res = re.exec(str)) {
				console.log('variable declared:',res)
				opts.sentence_place = this.variables.length;
				opts.name = (/\w+/g).exec(res)[0];

				console.log('variable opts: ',opts)
				variable = new Variable(opts);
				this.variables.push(variable);

				if( res[0].match('=') ) {
					expression = new Expression({
						sentence: this,
						src: str_map.interpolate(res[0]),
					})
				}
				else expression = null
				console.log('variable expression: ',expression)
				this.components.push(expression);
			}
		}
		else if( src.match(/^\s*\w+\s*/gi) ) { //expression
			this.type = "expression"

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
		var needs = false;
		if(this.type == 'declaration' || this.type == 'expression') {
			this.variables.forEach(function(e){
				if(e.translatable) needs = true
			})
		}

		return needs
	},
	/**
	@memberof NEngine.GLNSLCompiler.Sentence
	@desc generates a valid GLSL sentence (or group of sentences) that mimics the
	functionality on this sentence and stores it in this.out as a str it works
	differently on each sentence type
	@return {String} translated
	*/
	translate: function() {

	}
}
return Sentence
})()
