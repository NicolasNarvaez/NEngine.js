/**
@namespace Vartypes
@memberof NEngine.GLNSLCompiler
@desc Contains all operation-resolving code, dependand on the specific
  variable type
*/
var VarTypes = (function() {
/**
@memberof NEngine.GLNSLCompiler.Vartypes
@class VarType
@desc Its prototype depends on the specific vartype
@prop {Object} operations - Operation handler functions
@prop {String} codename - A unique identifier for the vartype, calculated has
precision + prim_type
@prop {RegExp} type - The regexp that matches the type.

*/
var type, types = {
		/**
		They fill the type_data of variables, help sharing
		code among different configurations of primitives for the same
		primitive datatypes <br/>

		*/
		vecn: {
		  exp: /vec(\d+)/gi,
		  /**
		  * creates type info from variable declaration information
		  */
		  constructor : function (qualifiers) {

		  },
		  /**
		  translate this variable
		  */
		  translate: function translate() {

		  },
		  /**
		  returns array containing each variable component
		  */
		  variable_variables: function variable_variables() {

		  },
		  operations: [
				{
					ops: ['[+-]'],
					replicates: function() {

					},
					/**
					* expresion operator is an expression!!, not a variable!!
					* expresions only contain datatype info and expresion identifier
					* wich can be a variable identifier or a transparent temporary
					* identifier for temporal operantions cache
					*
					* into_variable can be a variable name or false,indicating to
					* return an array of the sentences without asignment instead
					*/
					translate: function (operation, operator_b_translation, operator_a) {

					}
				}
			]
		},
		matn_m: {
			exp: /mat(\d+)(_(\d+))*/gi,
			/**
			Sets codename from variable
			*/
			constructor: function(qualifiers) {
				//if(reg_res[])
			},
			operations: {
				'\*': function multiply(operation, expresion_operator, into_variable) {
				}
			},
			valueAt: function nmat_at(i,j,n) {
				var p = j*n+i,
					mat = Math.floor( p/16 ); //matrix holding position

				p = mat*16 - p;
				j = Math.floor( p/4 );
				i = p - j*4;

				return ''+mat+'['+i+']['+j+']';
			}
		},
		scalar: {
			exp: /(bool|int|float)/gi,
			constructor: function(qualifiers) {

			}
		},
	},
	prototype = {
		/**
		@memberof NEngine.GLNSLCompiler.Vartypes.VarType.prototype
		@desc Returns the codename asociated to the qualifiers or the
			vartype
		@param {String[]} qualifiers - ['invariant', 'storage', 'precision', 'datatype']
		@return {String} codename - undefined otherwise
		*/
		codename: function codename(qualifiers) {
			if(!qualifiers) 	qualifiers = this.qualifiers

			if(!qualifiers) return undefined
			return (qualifiers[2] || '')+'_'+ qualifiers[3]
		},
		/**
		@memberof NEngine.GLNSLCompiler.Vartypes.VarType.prototype
		@desc Translates the datatype of the vartype if needed. If datatype is
			given, translates it and returns it, here you check the datatypes are
			.
		@param {String} [datatype]
		@return {Vartype|String} This, or the translated datatype
		*/
		translateType: function translateType(datatype) {
			var type = datatype
			if(!type)
				type = this.qualifiers[3]

			//TODO translateType

			if(datatype) return type

			this.qualifiers[3] = type
			return this
		}
	}

/**
Append to each type constructor, the type name to the resulting type object
*/
for(type in types)
	types[type].constructor = (function() {
		var type_name = type,
			type_obj = types[type],
			type_constructor = type_obj.constructor,
			//same as type_obj but with prototype = prototype
			final_type_obj = Object.create(prototype)

		Object.keys(type_obj).forEach(function(k) {
			final_type_obj[k] = type_obj[k]
		})

		function VarType(qualifiers, scope) {
			if( !(this instanceof VarType) )	return new VarType(qualifiers)

			type_constructor.call(this, qualifiers)

			this.qualifiers = qualifiers.slice()
			this.type = type_name
			this.translateType()

			this.scope = scope
		}
		VarType.prototype = final_type_obj

		return VarType
	})()

/**
@memberof NEngine.GLNSLCompiler.Vartypes
@desc Gets type associated to qualifiers
@param {String[]} [qualifiers] - ['invariant', 'storage', 'precision', 'datatype']
@return {VarType|undefined} type
*/
function get_type(qualifiers) {
	if(!qualifiers) return undefined

	var datatype,
		type, prim_qualifier = qualifiers[3],
		reg_res

	console.log('get type: ', prim_qualifier)

	for(datatype in types) {
		type = types[datatype]

		type.exp.lastIndex = 0
		reg_res = type.exp.exec(prim_qualifier)
		console.log(reg_res, type.exp, prim_qualifier)

		if(reg_res)
			return type.constructor( qualifiers )
	}
}

return {
	types: types,
	type: get_type,
	translateType: prototype.translateType,
	codename: prototype.codename,
	prototype: prototype
}
})()
