var expect = chai.expect,
	compiler_examples = {
		basic_small: 'lowp vec5 terrain = vec5(0.0, 0.0, 0.0, 0.0, 0.0);',
		basic: `highp vec9 vec_map  = vec9( 0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0) + vec9(3.0)/10.0 ,
		terrain = vec9(0.0, 0.0, 0.0,
					0.0, 0.0);
	uniform highp mat4_n uPMVMatrix;`,
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
