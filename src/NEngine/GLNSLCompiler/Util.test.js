
describe('Util module', () => {
	var Util = NEngine.GLNSLCompiler.Util

	describe('SourceTree', () => {
		var SymbolTree = Util.SymbolTree

		it('strip()', (d) => {
			var tree = new SymbolTree( compiler_examples.basic_small )
			tree.strip()

			expect(tree.root()).to.equal('terrain = vec5"0_0";')

			d()
		})

	})

})
