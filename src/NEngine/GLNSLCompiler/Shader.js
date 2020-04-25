var Shader = (function ShaderLoader() {

/**
@class Shader
@memberof NEngine.GLNSLCompiler

@prop {Object<varname, value>} js_variables - A dictionary indicating the
    js variable values in glnsl js interpolation, they represent a state
    machine for computing the final shader projection
*/
function Shader(opts) {
	if(!(this instanceof Shader)) return new Shader(opts)

	this.src = opts.src || ''
	this.code_tree = null
	this.out = null

	this.js_variables = opts.js_variables || {n:3}
	this.uniforms = opts.uniforms || {}
	this.attributes = opts.attributes || {}

	//OpenGL Shader Program
	this.program = null
}

Object.assign(Shader.prototype, {
	/**
	 * Compiles a js function declaring this.js_variables in its context
	 * appending it in the form 'entry_key = fn_argument || entry_value'.
	 * Added keys can be added as arguments or will fallback to the given
	 * default values. </br></br>
	 * @param  {string} src  - js src code to compile
	 * @param  {object} vars - key-default_value vars definition
	 * @return {Function}      - compiled js function
	 */
	// TODO generalize to WASM
	js_compile: function js_compile(src, vars = this.js_variables) {
		
		var keys = Object.keys(vars)
		var args = keys.join(',')
		var body = keys.map(function(e) {
				e + '=' + e + '||' + JSON.stringify(vars[e]) + ';\n'
			}).join() + '\n'+
			'return ' + src
			
		var res_fn
		try {
			res_fn = Function(args, body)
		}
		catch(error) {
			console.error('Error compiling fn in shader: ')
			console.log(src)
			throw error
		}
		
		return res_fn
	},
	/**
	 * @memberof NEngine.GLNSLCompiler.Shader
	 * @method js_execute
	 * @desc gets the executed source over the given args. </br></br>
	 * TODO currently only one line expression evaluation functions
	 * allowed. </br>
	 * TODO develop arbitrarily complex js (possible using function
	 * expression). </br>
	 * @arg {string} source - The source code to parse
	 * @
	 */
	js_execute: function js_execute(src, args) {
		var n = this.js_compile(src)
		var res
		
		try {
			res = fn.apply(null, args)
		}
		catch(error) {
			console.error('Exception executing js function: ')
			console.log(src, args)
			throw error
		}
		
		return res
	},
	/**
	Shortcut
	*/
	compile: function Shader_compile() {
		this.code_tree = new CodeTree(this.src, this.js_variables)
		return code_tree.translate()
	}
})
return Shader
})()
