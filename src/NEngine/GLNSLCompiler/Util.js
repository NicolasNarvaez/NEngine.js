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
@desc strips the content of the delimited areas, balancing delimiters
@param {String} str - the tring to strip
@param {Object} opts - the option object
@param {String|String[]} [opts.delimiter='('] - the delimiter to
	search, if its an array, be it like [delimiter_left, delimiter_right]
@param {Boolean} [opts.exclude=false] - if to exclude the delimiters in the strip
*/
function strip_balanced(str,opts) {	opts = opts || {}
	var regexp, res,
		res_list = [],
		delimiter = opts.delimiter,
		exclude = opts.exclude,
		map = str,
		nest_depth,
		nest_a, nest_b, i, l, char

	delimiter = delimiter || SymbolTree.prototype.delimiter_default

	if(delimiter instanceof String || typeof delimiter == 'string')
		delimiter = SymbolTree.prototype.delimiter_pairs_unscaped[delimiter] || delimiter

	//if the right delimiter is the same as the left, do a non-greedy match
	if(delimiter[1] == delimiter[0]) {
		delimiter = SymbolTree.prototype.delimiter_pairs[delimiter[0]]
		//generates list of match results, then foreach replaces with
		//placeholder and adds index entry
		regexp = delimiter[0]+'(.*?)'+delimiter[1]
		regexp = new RegExp(regexp, 'gim')

		while(res = regexp.exec(map))	{
			res.symval = (exclude)? res[1]: res[0]
			res_list.push(res)
		}

	} else	//do a balanced match
		for(nest_depth = 0, i=0, l=map.length; i<l; i++) {
			char = map[i]

			if(char == delimiter[0]) {
				nest_a = i
				nest_depth++
			}
			if(char == delimiter[1])	{
				nest_b = i
				nest_depth--
				if(!nest_depth && (nest_a || nest_a === 0) )
					res_list.push({
						symval: (exclude)?
							map.substr(nest_a +1, nest_b -nest_a ) :
							map.substr(nest_a, nest_b -nest_a +1)
					})
			}
		}
	// console.log('balanced strip', opts, res_list, delimiter)
	return res_list
}

/**
@memberof NEngine.GLNSLCompiler.Util
@class SymbolTree
@desc This was created in a moment of despair ... mmmm, maybe is just a
	middle-level tool
	<br/>
	Helps handling source mapping, stripping, scaping, etc. Provides
	functions to translate on its context (subsections of it, etc) like
	interpolate. </br> </br>
	the level of source mapping it makes is low, doesnt create recursive
	SymbolTree trees, but does create symbols trees (an internal shepherd would
	allow it, by indexing-trees, avoiding collisions on different
	symbol-tree tags)

@prop {String} src - Initial src of the tree
@prop {String} prefix - The prefix of the tree symbols in the parsed text,
	defaults to ''+this.shepherd_length when created
@prop {Object<Symbol_key, str>} symbols - Maps mapped source symbols into
  the src, each symbol contains the mapping into src from mapped
@prop {Integer} symbols_count - The number of symbols in the dictionary

@param {String} src -
*/
function SymbolTree(src) {
	if(!(this instanceof SymbolTree)) return new SymbolTree(src)

	this.prefix = '' + this.shepherd_length++

	this.src = src
	this.symbol_table = {root: src}
	this.symbol_table_count = 0
}
SymbolTree.prototype = {
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc The symbol of the root node, defaults to 'root'
	@member {String}
	*/
	root_symbol: 'root',
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc The number of symbol trees currently existing
	@member {Integer}
	*/
	shepherd_length: 0,
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc The pair of delimiters to use for symbols, defaults to
		['"', '"']
	@member {String[]}
	*/
	symbol_delimiter_pairs : ['"','"'],
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc A dict of <left-delimiter, [left-delimiter, right-delimiter]> ,
		for example: delimiter_pairs['{'] -> ['{', '}']
	@member {Object<String,String[]>}
	*/
	delimiter_pairs: {
		'(': ['\\(','\\)'],
		'{': ['\\{','\\}'],
		'[': ['\\[','\\]'],
	},
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc the unscaped version of delimiter_pairs
	@member {Object<String,String[]>}
	*/
	delimiter_pairs_unscaped: {
		'(': ['(',')'],
		'{': ['{','}'],
		'[': ['[',']'],
	},
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc default delimiter to use when none is given, commonly '('
	@member {String}
	*/
	delimiter_default : '(',

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc root string, from root tree symbol
	@return {String} root - the root string
	*/
	root: function root(value) {
		if(value != undefined)
			return this.symbol_table[this.root_symbol] = value

		return this.symbol_table[this.root_symbol]
	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc Adds a symbol to the map, in the node "symbol_to", scaping the
		content defined by "target", wich can be an index pair [a,b] or
		the content itslef. Returns the symbol key of the generated symbol.
	@return {String} symbol - the key of the generated symbol
	*/
	addSymbol: function addSymbol(symbol_to, target) {
		var str = this.symbol_table[symbol_to],
			mapped, symbol_value,
			symbol_key = this.prefix+'_'+this.symbol_table_count,
			symbol_delimiter = this.symbol_delimiter,
			symbol_key_placeholder = symbol_delimiter[0]+
				symbol_key+
				symbol_delimiter[1]

		if(target && str) {

			if(target instanceof String || typeof target == 'string' &&
				str.match(target)) {

				mapped = str.replace(target, symbol_key_placeholder)

				symbol_value = target
			}

			if(mapped) {
				this.symbol_table[symbol_to] = mapped
				this.symbol_table[symbol_key] = symbol_value
			}

		}

	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc returns symbols found in str as an array of the regexp exec results,
		witch each result now having properties symbol = symbol name and
		symbol_value = symbol value.
	@param {String} str - the string to search for symbols
	@return {Array<RegExp_result>}
	*/
	symbols: function symbols(str) {
		var syms = [], sym,
			reg = RegExp(/\"(.*?)\"/gi),
			res

		while(res = reg.exec(str))
			if(sym = this.symbol_table[res[1]]) {
				res.symbol = res[1]
				res.symbol_value = sym

				syms.push(res)
			}

		return syms
	},

	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@desc interpolates all the symbols in the str
	@param {String} str - string to inteprolate
	@param {Integer} [depth=-1] - Number of times to interpolate string,
		values none == -1 : interpolates until no more variables are found
	@return {String}
	*/
	interpolate: function interpolate(str, depth) {
		var syms = this.symbol_table,
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
	@param {String} str - the tring to strip
	@param {Object} opts - the option object
	@param {String|String[]} [opts.delimiter='('] - the delimiter to
		search, if its an array, be it like [delimiter_left, delimiter_right]
	@param {Boolean} [opts.exclude=false] - if to exclude the delimiters in the strip

	@return {SymbolTree} this
	*/
	strip: function strip(opts) { opts = opts || {}
		var res_list=[],
			map = this.root(),
			symkey, symval, sym, self = this

		res_list = strip_balanced(map, opts)

		if(res_list && res_list.length) {
			res_list.forEach(function(e) {
				symkey = self.prefix+'_'+self.symbols_count
				sym = self.symbol_delimiter_pairs[0] +
					symkey +
					self.symbol_delimiter_pairs[1]

				symval = e.symval

				map = map.replace( symval, sym)
				self.symbol_table[symkey] = symval

				self.symbol_table_count++
			})

			this.symbol_table['root'] = map
		}

		return this
	},
	/**
	@callback SourceTreeMapFunc
	@param {String} acumulator - the string being mapped
	@param {String}
	@return {String} acumulator - you have to return it
	*/
	/**
	@memberof NEngine.GLNSLCompiler.Util.SymbolTree.prototype
	@param {Function} func -
	@return {String|undefined} Mapped src, undefined if no function or str
	*/
	map: function map(func, str) {
		str = str||this.root()
		if(!str || !f) return undefined

		this.symbol_table(str).map(function(e){
			return e.symval
		}).reduce(function() {

		})
	}
}



return {
	serialize : serialize,
	is_scaped : is_scaped,
	SymbolTree : SymbolTree,
	Grammar : Grammar,
}
})()
