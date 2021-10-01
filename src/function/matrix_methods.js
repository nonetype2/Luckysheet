let matrix = ({});

let init = function init(matrix){
    let sylvester_matrix = function() {};
    let M

    sylvester_matrix.precision = 1e-6;

    sylvester_matrix.create = function(elements) {
        M = new sylvester_matrix();
        return M.setElements(elements);
    };
    let $M = sylvester_matrix.create;

    sylvester_matrix.I = function(n) {
        let els = [], i = n, j;
        while (i--) { j = n;
            els[i] = [];
            while (j--) {
                els[i][j] = (i === j) ? 1 : 0;
            }
        }
        return sylvester_matrix.create(els);
    };

    sylvester_matrix.prototype = {
        e: function(i,j) {
            if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
            return this.elements[i-1][j-1];
        },
        dimensions: function() {
            let cols = (this.elements.length === 0) ? 0 : this.elements[0].length;
            return {rows: this.elements.length, cols: cols};
        },
        rows: function() {
            return this.elements.length;
        },
        cols: function() {
            if (this.elements.length === 0) { return 0; }
            return this.elements[0].length;
        },
        eql: function(matrix) {
            let M = matrix.elements || matrix;
            if (!M[0] || typeof(M[0][0]) === 'undefined') { M = sylvester_matrix.create(M).elements; }
            if (this.elements.length === 0 || M.length === 0) {
                return this.elements.length === M.length;
            }
            if (this.elements.length !== M.length) { return false; }
            if (this.elements[0].length !== M[0].length) { return false; }
            let i = this.elements.length, nj = this.elements[0].length, j;
            while (i--) { j = nj;
                while (j--) {
                    if (Math.abs(this.elements[i][j] - M[i][j]) > sylvester_matrix.precision) { return false; }
                }
            }
            return true;
        },
        dup: function() {
            return sylvester_matrix.create(this.elements);
        },
        map: function(fn, context) {
            if (this.elements.length === 0) {
                return sylvester_matrix.create([]);
            }
            let els = [], i = this.elements.length, nj = this.elements[0].length, j;
            while (i--) {
                j = nj;
                els[i] = [];
                while (j--) {
                    els[i][j] = fn.call(context, this.elements[i][j], i + 1, j + 1);
                }
            }
            return sylvester_matrix.create(els);
        },
        isSameSizeAs: function(matrix) {
            let M = matrix.elements || matrix;
            if (typeof(M[0][0]) === 'undefined') {
                M = sylvester_matrix.create(M).elements;
            }
            if (this.elements.length === 0) {
                return M.length === 0;
            }
            return (this.elements.length === M.length && this.elements[0].length === M[0].length);
        },
        add: function(matrix) {
            if (this.elements.length === 0) return this.map(function(x) { return x });
            let M = matrix.elements || matrix;
            if (typeof(M[0][0]) === 'undefined') { M = sylvester_matrix.create(M).elements; }
            if (!this.isSameSizeAs(M)) { return null; }
            return this.map(function(x, i, j) { return x + M[i-1][j-1]; });
        },
        subtract: function(matrix) {
            if (this.elements.length === 0) return this.map(function(x) { return x });
            let M = matrix.elements || matrix;
            if (typeof(M[0][0]) === 'undefined') { M = sylvester_matrix.create(M).elements; }
            if (!this.isSameSizeAs(M)) { return null; }
            return this.map(function(x, i, j) { return x - M[i-1][j-1]; });
        },
        canMultiplyFromLeft: function(matrix) {
            if (this.elements.length === 0) { return false; }
            let M = matrix.elements || matrix;
            if (typeof(M[0][0]) === 'undefined') { M = sylvester_matrix.create(M).elements; }
            // this.columns should equal matrix.rows
            return (this.elements[0].length === M.length);
        },
        multiply: function(matrix) {
            if (this.elements.length === 0) { return null; }
            if (!matrix.elements) {
                return this.map(function(x) { return x * matrix; });
            }
            let returnVector = matrix.modulus ? true : false;
            let M = matrix.elements || matrix;
            if (typeof(M[0][0]) === 'undefined') { M = sylvester_matrix.create(M).elements; }
            if (!this.canMultiplyFromLeft(M)) { return null; }
            let i = this.elements.length, nj = M[0].length, j;
            let cols = this.elements[0].length, c, elements = [], sum;
            while (i--) { j = nj;
                elements[i] = [];
                while (j--) { c = cols;
                    sum = 0;
                    while (c--) {
                        sum += this.elements[i][c] * M[c][j];
                    }
                    elements[i][j] = sum;
                }
            }
            M = sylvester_matrix.create(elements);
            return returnVector ? M.col(1) : M;
        },
        minor: function(a, b, c, d) {
            if (this.elements.length === 0) { return null; }
            let elements = [], ni = c, i, nj, j;
            let rows = this.elements.length, cols = this.elements[0].length;
            while (ni--) { i = c - ni - 1;
                elements[i] = [];
                nj = d;
                while (nj--) { j = d - nj - 1;
                    elements[i][j] = this.elements[(a+i-1)%rows][(b+j-1)%cols];
                }
            }
            return sylvester_matrix.create(elements);
        },
        transpose: function() {
            if (this.elements.length === 0) return sylvester_matrix.create([]);
            let rows = this.elements.length, i, cols = this.elements[0].length, j, elements = []; i = cols;
            while (i--) { j = rows;
                elements[i] = [];
                while (j--) {
                    elements[i][j] = this.elements[j][i];
                }
            }
            return sylvester_matrix.create(elements);
        },
        isSquare: function() {
            let cols = (this.elements.length === 0) ? 0 : this.elements[0].length;
            return (this.elements.length === cols);
        },
        max: function() {
            if (this.elements.length === 0) { return null; }
            let m = 0, i = this.elements.length, nj = this.elements[0].length, j;
            while (i--) { j = nj;
                while (j--) {
                    if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
                }
            }
            return m;
        },
        indexOf: function(x) {
            if (this.elements.length === 0) { return null; }
            let index = null, ni = this.elements.length, i, nj = this.elements[0].length, j;
            for (i = 0; i < ni; i++) {
                for (j = 0; j < nj; j++) {
                    if (this.elements[i][j] === x) { return {i: i+1, j: j+1}; }
                }
            }
            return null;
        },
        diagonal: function() {
            if (!this.isSquare) { return null; }
            let els = [], n = this.elements.length;
            for (let i = 0; i < n; i++) {
                els.push(this.elements[i][i]);
            }
            return sylvester_matrix.create(els);
        },
        toRightTriangular: function() {
            if (this.elements.length === 0) return sylvester_matrix.create([]);
            let M = this.dup(), els;
            let n = this.elements.length, i, j, np = this.elements[0].length, p;
            for (i = 0; i < n; i++) {
                if (M.elements[i][i] === 0) {
                    for (j = i + 1; j < n; j++) {
                        if (M.elements[j][i] !== 0) {
                            els = [];
                            for (p = 0; p < np; p++) {
                                els.push(M.elements[i][p] + M.elements[j][p]);
                            }
                            M.elements[i] = els;
                            break;
                        }
                    }
                }
                if (M.elements[i][i] !== 0) {
                    for (j = i + 1; j < n; j++) {
                        let multiplier = M.elements[j][i] / M.elements[i][i];
                        els = [];
                        for (p = 0; p < np; p++) {
                            // Elements with column numbers up to an including the number of the
                            // row that we're subtracting can safely be set straight to zero,
                            // since that's the point of this routine and it avoids having to
                            // loop over and correct rounding errors later
                            els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
                        }
                        M.elements[j] = els;
                    }
                }
            }
            return M;
        },
        determinant: function() {
            if (this.elements.length === 0) { return 1; }
            if (!this.isSquare()) { return null; }
            let M = this.toRightTriangular();
            let det = M.elements[0][0], n = M.elements.length;
            for (let i = 1; i < n; i++) {
                det = det * M.elements[i][i];
            }
            return det;
        },
        isSingular: function() {
            return (this.isSquare() && this.determinant() === 0);
        },
        trace: function() {
            if (this.elements.length === 0) { return 0; }
            if (!this.isSquare()) { return null; }
            let tr = this.elements[0][0], n = this.elements.length;
            for (let i = 1; i < n; i++) {
                tr += this.elements[i][i];
            }
            return tr;
        },
        rank: function() {
            if (this.elements.length === 0) { return 0; }
            let M = this.toRightTriangular(), rank = 0;
            let i = this.elements.length, nj = this.elements[0].length, j;
            while (i--) { j = nj;
                while (j--) {
                    if (Math.abs(M.elements[i][j]) > sylvester_matrix.precision) { rank++; break; }
                }
            }
            return rank;
        },
        augment: function(matrix) {
            if (this.elements.length === 0) { return this.dup(); }
            let M = matrix.elements || matrix;
            if (typeof(M[0][0]) === 'undefined') { M = sylvester_matrix.create(M).elements; }
            let T = this.dup(), cols = T.elements[0].length;
            let i = T.elements.length, nj = M[0].length, j;
            if (i !== M.length) { return null; }
            while (i--) {
                j = nj;
                while (j--) {
                    T.elements[i][cols + j] = M[i][j];
                }
            }
            return T;
        },
        inverse: function() {
            if (this.elements.length === 0) { return null; }
            if (!this.isSquare() || this.isSingular()) { return null; }
            let n = this.elements.length, i= n, j;
            let M = this.augment(sylvester_matrix.I(n)).toRightTriangular();
            let np = M.elements[0].length, p, els, divisor;
            let inverse_elements = [], new_element;
            // Sylvester.Matrix is non-singular so there will be no zeros on the
            // diagonal. Cycle through rows from last to first.
            while (i--) {
                // First, normalise diagonal elements to 1
                els = [];
                inverse_elements[i] = [];
                divisor = M.elements[i][i];
                for (p = 0; p < np; p++) {
                    new_element = M.elements[i][p] / divisor;
                    els.push(new_element);
                    // Shuffle off the current row of the right hand side into the results
                    // array as it will not be modified by later runs through this loop
                    if (p >= n) { inverse_elements[i].push(new_element); }
                }
                M.elements[i] = els;
                // Then, subtract this row from those above it to give the identity matrix
                // on the left hand side
                j = i;
                while (j--) {
                    els = [];
                    for (p = 0; p < np; p++) {
                        els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
                    }
                    M.elements[j] = els;
                }
            }
            return sylvester_matrix.create(inverse_elements);
        },
        round: function() {
            return this.map(function(x) { return Math.round(x); });
        },
        snapTo: function(x) {
            return this.map(function(p) {
                return (Math.abs(p - x) <= sylvester_matrix.precision) ? x : p;
            });
        },
        setElements: function(els) {
            let i, j, elements = els.elements || els;
            if (elements[0] && typeof(elements[0][0]) !== 'undefined') {
                i = elements.length;
                this.elements = [];
                while (i--) { j = elements[i].length;
                    this.elements[i] = [];
                    while (j--) {
                        this.elements[i][j] = elements[i][j];
                    }
                }
                return this;
            }
            let n = elements.length;
            this.elements = [];
            for (i = 0; i < n; i++) {
                this.elements.push([elements[i]]);
            }
            return this;
        }
    };

    matrix.sylvester_matrix = sylvester_matrix;
}
init(matrix);

export function inverse(els){
    let M = matrix.sylvester_matrix.create(els);
    return M.inverse().elements;
}