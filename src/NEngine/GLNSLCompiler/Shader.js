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

Shader.prototype = {
	/**
	executes the src str adding code_tree.shader.js_variables to its context
	TODO currently only one line expression evaluation functions allowed
	TODO develop arbitrarily complex js (possible using function expression)
	*/
	js_execute: function js_execute(src, opts) {
		var f, args, keys , body, res, vars

		res = {}

		vars = this.js_variables
		keys = Object.keys(vars)

		//TODO(maybeready) sending js_variables by parameters allows updating
		//results withouth recompiling function
		args = keys.join(',')
		body = 'var '+
			keys.map(function(e){
				e+'='+e+'||'+vars[e]
			}).join(',') + ';'+
			'return '+src

		try {
			res.f = f = Function(args, body)
			try {
				res.res = f()
			}
			catch(e) {
				res.err = 'Exception executing js function: \n\n'+src+
					'\n\nException: '+e
			}
		}
		catch(e) {
			res.err = 'Exception compiling shader function: \n\n'+src+
				'\n\nException: '+e
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
}
return Shader
})()
