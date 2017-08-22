var expect = chai.expect,
	compiler_examples = {
		basic_small: 'lowp vec5 terrain = vec5(0.0, 0.0, 0.0, 0.0, 0.0);',
		basic: `highp vec9 vec_map  = vec9( 0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0) + vec9(3.0)/10.0 ,
		terrain = vec9(0.0, 0.0, 0.0,
					0.0, 0.0);
	uniform highp mat4_n uPMVMatrix;`,
		declaration: {
			datatypes: `
			highp vecn vec_n = vecn(0.0) + 1.0;
			lowp mat_n_n mat_n1;
			lowp mat_n_2 mat_n2;
			lowp mat_6_n mat_n3;
			`
		},
	}

describe('meta', () => {

	describe('basic operations', () => {

		it('equals correctly', (done) => {
			expect('asd').to.equal('asd')
			done()
		})

		it('detects unequal correctly', (done) => {
			expect('asd').to.not.equal('add')
			done()
		})

	})
})
