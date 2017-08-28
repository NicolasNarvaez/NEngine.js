# NEngine.js
A n-dimensional, full featured graphical-physical engine for the web.

## Features:

### N-dimensional geometry library and N-dimensional physical library:
It contains basic n-dimensional polyhedrals and a basic geometry collision library to use in the physical system.

### Extended shader language:
To create the n-dimensional shaders, it features an extended version of the Opengl Shading language called OpenGl N Shading Language or NSL using a small transcompiler that extends OGSL datatypes like matrices and vectors into N.

### Easy design and shader creation with Space Hierarchies:
To manipulate multiple data spaces, and allow the existence of 3d spaces interacting with 5d spaces and handle simultaneously the two types of physics to later connect them into the same space, and to also simplify the shader organization and creation in the rendering, organizes its data into a Space Hierarchy that represents in a graph like manner, the spaces involved and the transformations in between them.

### Impossible universes:
Space Hierarchies allows to represent non-linear transformations like Bézier curves or fractal mappings from, for example object space into world space that modify the rendering and the physics for the interacting objects in those spaces. Thats right!, you can now create 3D hipersphere curved spaces inside 4D universes and simulate outer space accelerated expansion, or put many of those 4D universes inside six dimension spaces, curved like 4D hiperplanes, to construct complex space systems on which lot of different and interesting things can happen. You imagine literally seeing your galactic army crossing the universe bending into another reality?, now you can.

### Fast:
For all of its capabilities it has a good performance, that can work very good also in a smartphone, thanks to NMath optimization system on which it compiles extremely optimized hardcoded math operations in the given dimension in real time. Anyway, i need support improving the data structures in physic system and overall engine design because i´m not an expert.

## How it works:

It builds its optimized mathematical functions from NMath, and directly projects dimension 'n' into dimension 'm' (commonly m = 3)  inside the vertex shader, using webgl. A port to other platforms, with other rendering power would be interesting, but always maintaining its web approach so currently i´m more interested in translate parts of it into something easy to translate into asm, like c.

Currently uses a little bit of twgl to work.

## Testing:
Uses Mocha + Chai + Karma, curently all src/**/*.test.js files are added automatically in the tests, after the test/config.js is included, so put all global-variable definitions there. The testing files are preprocessed on babel whit latest features by default

## Usage:

See the /docs or http://ngrid.cl/doc
