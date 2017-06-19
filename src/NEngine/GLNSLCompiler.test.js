
describe('GLNSLCompiler', () => {
	var nsl = NEngine.GLNSLCompiler

	describe('General working', () => {

		it('Compiles compiler_examples.basic', (d) => {
			let compiled = nsl.compile(compiler_examples.basic)

			console.log("compiled: "+compiled)
			expect(compiled).to.not.equal(undefined)

			// compiled = nsl.compile(compiler_examples.basic_small)
			// `terrain = vec5(0.0, 0.0, 0.0, 0.0, 0.0);`
			// expect(compiled).equal(``)

			d()
		})

	})

})
