var expect = chai.expect,
	compiler_examples = {
		basic_small: `terrain = vec5(0.0, 0.0, 0.0,
					0.0, 0.0);`,
		basic: `highp float vec_map  = vec9( 0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  0.0, 0.0, 0.0) + vec9(3.0)/10.0 ,
		terrain = vec5(0.0, 0.0, 0.0,
					0.0, 0.0);
	highp uniform mat4_n uPMVMatrix;`,
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
