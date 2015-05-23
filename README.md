# NEngine.js
A n-dimensional graphical-physical engine for the web

It builds its optimized mathematical functions from NMath, and uses a recursive proyection of data from dimension n to n-1 until n = 3 inside the vertex shader to generate the n-dimensional proyection in a 3-'space', using webgl. A port to other platforms, with other rendering power would be interesting.

Currently uses twgl and gl-matrix with some functions generated from NMath
