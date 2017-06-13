
describe('GLNSLCompiler', () => {
	var nsl = NEngine.GLNSLCompiler

	describe('General working', () => {

		it('Compiles compiler_examples.basic', (done) => {
			console.log(nsl, nsl.compile(compiler_examples.basic))

			done()
		})

	})

})
