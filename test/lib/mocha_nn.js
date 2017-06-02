////////////////////////////////////////////////////////////////////////
/*
	Utils
*/
////////////////////////////////////////////////////////////////////////

/**
@function DI
@desc Es un wrapper para los done callback de mocha. Permite controlar más la
información de error cuando un test falla
*/

/**
@function prop
@desc Es para simplificar la introspección de objetos en los expect, puedes
verificar que se cumplan condiciones en sus propiedades o propiedades de sus
subobjetos usando una sintaxis muy acotada.
Toma como  objeto a introspectar el objeto body que viene en el restorno
de un request de supertest y es pasado a los callbacks en expect( callback )
Ejemplo de uso:
expect(prop( "a{b:6}.t:5" ))

La sintaxis especifica que condiciones deben cumplirse para que el expect
sea correcto.
Por ejemplo: prop("data.id:56") será correcto si data.id es 56
y prop('data.mensages[]{mensage:asdf}.titulo:wy') sera correcto solo si
el objeto data.mensages es un array y uno de sus elementos tiene las propiedades
mensage = "asdf" y titulo="wy" simultaneamente.
Además prop('data.mensages[]{mensage:asdf, titulo:wy}') es equivalente
al ejemplo anterior.
*/

/**
@function gprop
@desc gprop viene de "get_prop". Permite usar la misma sintaxis de prop() para
seleccionar la primera propiedad que satisfaga todas las condiciones. <br/>
En el caso de prop('data.mensages[]{mensage:asdf}.titulo')
	retornaría el valor de titulo del primer elemento de data.mesages que
	compla con mensage == "asdf"
Y en el caso de prop('data.mensages[]{mensage:asdf, titulo:wy}')
	retornaría el primer elemento de data.mesages que tenga message y titulo
	como están indicados
@param {String} prop - Una cadena de selección de propiedad, la misma que
	prop() recibe como parámetro
@param {Object} obj - Un objeto sobre el cual evaluar "prop"
@return {Mixed} match - La propiedad que evaluo como correcta
*/

/**
	Las funciones prop_resolve y prop_tree están documentadas en sus codigos
*/

/*
	Eases error debugging by wrapping the done callback
*/
function DI(d) {
	if(!(this instanceof DI)) return new DI(d)

	return function(err, res) {
		var map = {}

		if(err && DI.res_dump) {
			map = res.error
			delete map.text
			map.url = res.request.url

			//console.dir(res.request.req,{depth:1})

			err = {
				err: err,
				info: map,
				body: res.res.body,
			}
		}

		if(DI.res_console && err) console.log(err)

		d(err, res)
	}
}
DI.res_dump = false	//handle response
DI.res_console = false	//show response also in console

function match_balanced(str, delimiter) {
	var delimiter_pairs = match_balanced.delimiter_pairs,
		delimiter_a = delimiter,
		delimiter_b = delimiter_pairs[delimiter],
		a, c,
		depth, i, l

	for(i=0, l=str.length, depth=0; i<l; i++) {
		c = str[i]

		if(c == delimiter_a) {
			if(!depth) a = i
			depth++
		}

		if(c == delimiter_b) {
			depth--
			if(!depth)
				return [a, i]
		}
	}

	return null
}
match_balanced.delimiter_pairs = {
	'(': ')',
	'[': ']',
	'{': '}',
}

/**
	property-selection/condition tree
	prop = contenido de condicional

	syms -> para resolver strings, etc
*/
function prop_tree(prop, syms) {
	var res,
		interpreted = prop,
		conds = [], symbol_cond = '*', range

	//replace each conditional object by a symbol
	while (range = match_balanced(interpreted, '{')) {
		interpreted = interpreted.replace(	//the old brakets by a reference
			interpreted.substr(range[0], range[1]-range[0]+1),	//old brackets
			symbol_cond+(conds.push(	//reference
					interpreted.substr(range[0]+1, range[1]-range[0]-1)	//store old content in dict
				)-1)
		)
	}

	//transform conditions into objects
	conds = conds.map(function(e){
		return prop_tree(e)
	})

	// generate each condition chain data
	/**
	condition; {
		prop,
		value
	}
	*/
	res = interpreted.split(',').map(function(e){
		var res = {},
			split = e.split(':')

		/**
		generate each prop object por condition chain
		common syntax: propa.propb.propc[].propd{propa:v1}.prope[]{..}..
		final structure is.
		 prop: Array [ {
			selected: boolean	//if this obj was selected for retireval on match
			conds: conditions // for the current object
				//elConds: conditions // conds for the current object elements (arrays)
			name: str
				//prop name
				//if == [] selects the array elements (num props)
				//	of last pointed property

	 	}]
		*/
		res.prop = split[0].split('.').map(function(e) {
			var res = {},
				prop_conds, elConds


			//put trnslated conditional tree
			prop_conds = e.split(symbol_cond)

			//get property name, undefined if it is the array element
			//selector itself (the element)
			res.name = prop_conds[0]

			res.scopesArray = res.name.match(/\[.*\]/)

			//verify if this value/object was selected
			if(res.name.match(/\!/)) {
				res.selected = true
				res.name = res.replace(/\!/,'')
			}

			/*
			//get conditions for array elements
			if( prop_conds[1] && prop_conds[1].match(/\[$/) ) {
				elConds = prop_conds[1].replace(/\]$/,'')
				res.elConds = conds[elConds]

				prop_conds[1] = prop_conds[2]
				prop_conds.pop()
			}
			*/

			//get conditions for object itself
			if( prop_conds[1] )
				res.conds = conds[prop_conds.pop()]

			return res
		})

		split.shift()
		res.value = split.join(':')
		return res
	})

	return res
}

/**
resolves using a prop_tree, the selected property from the object
*/
function prop_resolve(p_tree, obj) {
	var i, l, match,
		get_element_on_conditions, //sets e_ret to the resolved element (the "selected" flag is checked after)
		p_obj,
		p_obj_sub,
		e_ret, //the element to return
		p

	p = p_tree[0]

	//checks if the conditions are meet along with the child
	get_element_on_conditions = function(e, i, a) {
		if(e_ret || !e) return

		var conds_true = true, //becomes false only if a false cond is found
			conds

		//check conditions
		if(conds = p.conds)
			conds.forEach(function(condition){
				var prop = prop_resolve(condition.prop, e)

				if(
					!prop ||
					(condition.value && prop != condition.value)
					)
						conds_true = false

			})

		//this is the selected element
		if(conds_true) {
			p_obj = e

			//set match
			//there is a pending child, get it, otherwise, this is the element
			if( p_tree.length > 1 ) {
					p_obj_sub = prop_resolve(p_tree.slice(1), p_obj)
					if(p_obj_sub)
						e_ret = p_obj_sub
				}
			else
				e_ret = p_obj
		}
	}
	//if its and array selector, execute for every element on ascending order,
	//otherwise just the prop name
	if(p.name == '[]') {
		if(!(obj instanceof Array))
			return null
		obj.forEach(get_element_on_conditions)
	}
	else if(p.name && (match = p.name.match(/\[(\d+)\]/)) )
		get_element_on_conditions( obj[match[1]] )
	else
		get_element_on_conditions(obj[p.name])

	//there is a match, check for "selected" flag on current element
	if(e_ret && p_obj_sub)
		e_ret = (p.selected)? p_obj : p_obj_sub

	return e_ret
}

/**
@desc this is a promise for except calls, recieves condition "prop:val"
if no condition is present, evaluates !!prop
*/
function prop(prop,flags) {
	var cond, flags = flags || ''
	//resolve string prop into object
	if(prop instanceof String || typeof prop == 'string')
		cond = prop_tree(prop)[0]

	//execute on promise
	return function(res) {
		if(!res) return

		var obj = res.body,
			prop_resolved = prop_resolve(cond.prop,obj)

		if(flags.match('p')) console.log(obj)

		if(cond.value)
			chai.expect(''+prop_resolved).equals(cond.value)
		else
			chai.expect(!!prop_resolved).equals(true)
	}
}


function gprop(obj, prop) {
	return prop_resolve(prop_tree(prop)[0].prop, obj)
}
