
describe('Util module', () => {
	var nsl = NEngine.GLNSLCompiler,
		Util = nsl.Util

	describe('strip_balanced()', () => {
		var res

		it('Detects matches correctly (length)', (d) => {
			res = Util.strip_balanced('1(3)5(7)9')
			expect(res.length).to.equal(2)

			res = Util.strip_balanced('1(3)5(79)asd(34)asd')
			expect(res.length).to.equal(3)

			res = Util.strip_balanced('1(3)5(7)asda[23]ssd9', {delimiter:'[]'})
			expect(res.length).to.equal(1)

			d()
		})

		it('Adds extra fields: value', (d) => {
			res = Util.strip_balanced('1(3)5(7)9')
			expect( res[0].value ).to.equal('(3)')
			expect( res[1].value ).to.equal('(7)')

			res = Util.strip_balanced('1(3)5(7)asda[23]ssd9', {delimiter:'['})
			expect(res[0].value).to.equal('[23]')

			res = Util.strip_balanced('1{1}asda{ase3}ssd9', {delimiter:'{', exclude:true})
			expect(res[0].value).to.equal('1')
			expect(res[1].value).to.equal('ase3')

			d();
		})

		it('Adds extra fields: index, range', (d) => {
			var rg

			res = Util.strip_balanced('1(3)5(7)9')
			expect( res[1].index ).to.equal(5)
			expect( res[1].range ).to.deep.equal([5,8])

			res = Util.strip_balanced('1(3)5(7)asda[23]ssd9', {delimiter:'[]'})
			expect( res[0].index ).to.equal(12)
			expect(res[0].range).to.deep.equal([12, 16])

			res = Util.strip_balanced('1(3)5(7)as{23]ss}d9', {delimiter:'{}'})
			expect( res[0].index ).to.equal(10)
			expect(res[0].range).to.deep.equal([10, 17])

			d()
		})

	})

	describe('SymbolTree', () => {
		var SymbolTree = Util.SymbolTree

		it('root()', (done) => {
			var tree = new SymbolTree( 'asd he' )
			expect(tree.root()).to.equal('asd he')

			done()
		})

		it('strip()', (done) => {
			var tree = new SymbolTree( compiler_examples.basic_small )
			tree.strip()

			expect(tree.root()).to.equal('terrain = vec5"0_0";')

			done()
		})

	})

})
