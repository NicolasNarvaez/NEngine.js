/**
@namespace Util
@memberof NEngine.GLNSLCompiler
@desc General utilities, that could be rehusable outside this application,
	like glsl grammar dictionaries, or more atomic and agnostic
	transcompiling utils.
*/
var Util = (function UtilLoader() {
/**
@namespace Grammar
@memberof NEngine.GLNSLCompiler.Util
@desc Contains glsl grammar definition, useful grammar lists. TODO: make it
	to at least reflect real GLSL
*/
var Grammar = (function(){
	var grammar_lists, grammar_

	grammar_ = {
		identifier: '[_a-zA-Z][_\\w]*'
	}

	grammar_lists = {
		datatypes: [
			'void',
			'bool',
			'int',
			'float',
			'sampler2D',
			'samplerCube',
			'vec.*\\s',
			'bvec.*\\s',
			'ivec.*\\s',
			'mat.*\\s',
			'mat.*\\s',//n*m matrix
			'[\\w\\s]+["\']', //dynamic type
		],
		storage_qualifiers: [
			'const',
			'attribute',
			'uniform',
			'varying',
		],
		precision_qualifiers: [
			'highp',
			'mediump',
			'lowp',
		]
	}

	return {
		grammar_lists: grammar_lists,
		grammar_: grammar_,
	}
})()

/**
@memberof NEngine.GLNSLCompiler.Util
@desc removes extra spaces and line feeds
*/
function serialize(str) {
	var i, l, post = ''

	str = str.replace(/\n/ig, ' ')

	for(i = 0, l = str.length; i < l; i++) {
		if(!(str[i] == ' ' && post[post.length-1] == ' '))
			post += str[i]
	}

	return post
}
/**
@memberof NEngine.GLNSLCompiler.Util
@desc returns if given char is scaped or not
*/
function is_scaped(src, i) {
	var scape = 0
	while(src[i-scape-1] == '\\') scape++
	return scape%2 != 0
}

/**
@memberof NEngine.GLNSLCompiler.Util
@class SymbolTree
@desc This was created in a moment of despair. Now i cant find a use to it...
	mmmm, maybe just a middle-level tool
	<br/>
	Helps handling source mapping, stripping, scaping, etc. Provides
	functions to translate on its context (subsections of it, etc) like
	interpolate. </br> </br>
	the level of source mapping it makes is low, doesnt create recursive
	SymbolTree trees, but does create symbols trees (an internal shepherd would
	allow it, by indexing-trees, avoiding collisions on different
	symbol-tree tags)

@prop {String} prefix - The prefix of the tree symbols in the parsed text
@prop {String} src - Initial src of the tree
@prop {Object<Symbol_key, str>} symbols - Maps mapped source symbols into
  the src, each symbol contains the mapping into src from mapped
@prop {Integer} symbols_count - The number of symbols in the dictionary

@param {String} src -
@param {String} prefix -
*/
function SymbolTree(src) {
	if(!(this instanceof SymbolTree)) return new SymbolTree(src)

	this.prefix = '' + this.shepherd_length++

	this.src = src
	this.symbols = {root: src}
	this.symbols_count = 0
}
SymbolTree.prototype = {
	shepherd_length: 0,
	symbol_delimiter_pairs : ['"','"'],
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc A dict of <left-delimiter, [left-delimiter, right-delimiter]> ,
		for example: delimiter_pairs['{'] -> ['{', '}']
	*/
	delimiter_pairs: {
		'(': ['\\(','\\)'],
		'{': ['\\{','\\}'],
		'[': ['\\[','\\]'],
	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc root tree symbol
	*/
	root: function root() {
		return this.symbols['root']
	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc returns symbols found in str as an array of the regexp exec results
	@return {Array<RegExp_result>
	*/
	symbols: function symbols(str) {
		var syms = [], sym,
			reg = RegExp(/\"(.*?)\"/gi),
			res

		while(res = reg.exec(str))
			if(sym = this.symbols[res[1]]) syms.push(sym)

		return syms
	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc interpolates all the symbols in the str
	@param {String} str - string to inteprolate
	@param {Integer} depth - Number of times to interpolate string,
		values none == -1 : interpolates until no more variables are found
	@return {String}
	*/
	interpolate: function interpolate(str, depth) {
		var syms = this.symbols,
			res, regexp = RegExp(''+
				this.symbol_delimiter_pairs[0] +
				'('+this.prefix+'_.*?)'+
				this.symbol_delimiter_pairs[1]
				, 'gi')

		depth = depth || -1

		while( (res = regexp.exec(str)) && ((depth == -1)? 1: depth--) )
			str = str.replace(res[0], syms[res[1]])

		return str
	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc Takes the strings delimited by the delimiter off, into a mapping
	avoids scaped delimiters and transparently resolves nested expressions
	including them in each strip ( 'aaa(asd(ss)asd)l' => 'aaa"symbolkey"l' ),
	stripts every encounter
	@param {String|Array}
		delimiter - if string, checks that delimiter on delimiter_pairs
	@param {Boolean} exclude - exclude parenthesys into symbol value or
		exclude
	*/
	strip: function strip(delimiter, exclude) {
		var regexp, res, res_list=[],
			map = this.root(),
			symkey, symval, sym, self = this

		if(delimiter instanceof String || typeof delimiter == 'string')
			delimiter = this.delimiter_pairs[delimiter] || delimiter


		if(delimiter instanceof Array) {
			//generates list of match results, then foreach replaces with
			//placeholder and adds index entry
			regexp = delimiter[0]+'(.*?)'+delimiter[1]
			regexp = new RegExp(regexp, 'gim')

			while(res = regexp.exec(map))	res_list.push(res)

			res_list.forEach(function(e) {
				symkey = self.prefix+'_'+self.symbols_count
				sym = self.symbol_delimiter_pairs[0] +
					symkey +
					self.symbol_delimiter_pairs[1]

				symval = (exclude)? e[1]: e[0]

				map = map.replace( symval, sym)
				self.symbols[symkey] = symval

				self.symbols_count++
			})

		}
		this.symbols['root'] = map
		return this
	},
}

return {
	serialize : serialize,
	is_scaped : is_scaped,
	SymbolTree : SymbolTree,
	Grammar : Grammar,
}
})()
