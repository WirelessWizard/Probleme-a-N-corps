function minimum(a, b)
{
	return a > b ? b : a;	
}

function maximum(a, b)
{
	return a < b ? b : a;	
}

function absolute(x)
{
	return x < 0 ? -x : x;	
}

function between(a, x, b)
{
	if (x >= a && x <= b) return true;
	return false;
}

function strict_between(a, x, b)
{
	if (x > a && x < b) return true;
	return false;
}

function is_number(n)
{
    return typeof n == "number";
}

function is_string(s)
{
	return typeof s == "string";
}

function is_scalar(x)
{
	return is_number(x) || is_string(x);
}

function is_array(a)
{
    return (typeof a == "object") && (a instanceof Array);
}

function _vector(t, x, y, z)
{
	// if (!(t && x && y && z)) return this; // [Analizing argument errors]	
	
	this.coord = {0: t, 1: x, 2: y, 3: z};
	this.enume = {'t': 0, 'x': 1, 'y': 2, 'z': 3};
}

_vector.prototype.N_COORDS = 4;
_vector.prototype.FIRST_GEOMETRICAL_COORD = 1;
_vector.prototype.ERROR_INVAL_ARG = "Error: invalid argument in function: ";

function is_vector(v)
{
    return (typeof v == "object") && (v instanceof _vector);
}

_vector.prototype.get_coord = function(i)
{
	if (!is_scalar(i)) return this.ERROR_INVAL_ARG + "_vector.get_coord(i)";

	if (!isNaN(i)) return this.coord[i];
	else return this.coord[this.enume[i]];
}

_vector.prototype.get_coords = function()
{
	var coords = new Array(this.N_COORDS);
	for (var i = 0; i < this.N_COORDS; i ++) coords[i] = this.get_coord(i);
	return coords;
}

_vector.prototype.set_coord = function(i, value)
{
	if (!is_scalar(i)
	||  !is_number(value)) return this.ERROR_INVAL_ARG + "_vector.set_coord(i, value)";

	if (!isNaN(i)) this.coord[i] = value;
	else this.coord[this.enume[i]] = value;
	return this;
}

_vector.prototype.set_coords = function(t, x, y, z)
{
	if (!is_number(t)
	||  !is_number(x)
	||  !is_number(y)
	||  !is_number(z)) return this.ERROR_INVAL_ARG + "_vector.set_coord(t, x, y, z)";

	this.set_coord('t', t);
	this.set_coord('x', x);
	this.set_coord('y', y);
	this.set_coord('z', z);
	
	return this; // Looked up for this string for an hour...
} // WTF with the overload paradigm in js??!

_vector.prototype.init = function(init_vec)
{
	if (!is_vector(init_vec)) return this.ERROR_INVAL_ARG + "_vector.init(init_vec)";
	
	for (var i = 0; i < this.N_COORDS; i ++)
	{
		this.set_coord(i, init_vec.get_coord(i));
	}
	return this;
}

// Use sintax: var my_vector = (new _vector).coord_init(667, 558, 449, -336);
/*_vector.prototype.coord_init = function(t, x, y, z)
{ [Doesn't work yet]
	if (!is_number(t)
	||  !is_number(x)
	||  !is_number(y)
	||  !is_number(z)) return this.ERROR_INVAL_ARG + "_vector.coord_init(t, x, y, z)";

	return new _vector(t, x, y, z);
}*/

_vector.prototype.copy = function()
{// create a copy of an existing _vector (pseudo constructor)
	var new_vector = new _vector(0, 0, 0, 0);
	for (var i = 0; i < this.N_COORDS; i ++)
	{
		new_vector.set_coord(i, this.get_coord(i));
	}
	return new_vector;
}

/* [Doesn't work yet]
// Use Syntax: var my_vector = (new _vector).create(this.default);
_vector.prototype.default_vec = (new _vector).copy(0, 0, 0, 0);

// Use Syntax: var my_vector = (new _vector).default_init
_vector.prototype.default_init = function()
{
	return this.init(this.default_vec.copy(1, 0, 0, 0));
}
*/

_vector.prototype.module = function()
{
	var module_sq = 0;
	for (var i = this.FIRST_GEOMETRICAL_COORD; i < this.N_COORDS; i ++)
	{
		module_sq += Math.pow(this.get_coord(i), 2);
	}	
	return Math.pow(module_sq, 0.5);
}

_vector.prototype.anti_parallel = function()
{
	var anti_parallel = new _vector(0, 0, 0, 0);
	for (var i = this.FIRST_GEOMETRICAL_COORD; i < this.N_COORDS; i ++)
	{
		anti_parallel.set_coord(i, -1 * this.get_coord(i));
	}
	return anti_parallel;
}

// Use syntax: my_first_vector = my_const_vector.increase(increment_vector);
// Equal to [operator +]
_vector.prototype.increase = function(increment)
{
	if (!is_vector(increment)) return this.ERROR_INVAL_ARG + "_vector.increase(increment)";
	
	var resultant = new _vector(0, 0, 0, 0);
	for (var i = 0; i < this.N_COORDS; i ++)
	{
		resultant.set_coord(i, this.get_coord(i) + increment.get_coord(i));
	}
	return resultant;
}

// Use syntax: my_first_vector.increase_me(increment_vector);
// Equal to [operator +=]
_vector.prototype.increase_me = function(increment)
{
	if (!is_vector(increment)) return this.ERROR_INVAL_ARG + "_vector.increase_me(increment)";
	
	for (var i = 0; i < this.N_COORDS; i ++)
	{
		this.set_coord(i, this.get_coord(i) + increment.get_coord(i));
	}
	return this;
}

_vector.prototype.coord_increase = function(i, coord_increment)
{
	if (!is_number(coord_increment)) return this.ERROR_INVAL_ARG + "_vector.coord_increase(coord_increment)";
	
	var resultant = (new _vector).init(this);
	return resultant.set_coord(i, this.get_coord(i) + coord_increment);
}

_vector.prototype.coord_increase_me = function(i, coord_increment)
{
	if (!is_number(coord_increment)) return this.ERROR_INVAL_ARG + "_vector.coord_increase_me(coord_increment)";
	
	return this.set_coord(i, this.get_coord(i) + coord_increment);
}

// Use syntax: my_first_vectormy_const_vector.decrease(decrement_vector);
// Equal to [operator -]
_vector.prototype.decrease = function(decrement)
{
	if (!is_vector(decrement)) return this.ERROR_INVAL_ARG + "_vector.decrease(decrement)";
	
	return this.increase(decrement.anti_parallel());
}

// Use syntax: my_first_vector.decrease(decrement_vector);
// Equal to [operator -=]
_vector.prototype.decrease_me = function(decrement)
{
	if (!is_vector(decrement)) return this.ERROR_INVAL_ARG + "_vector.decrease_me(decrement)";
	
	for (var i = 0; i < this.N_COORDS; i ++)
	{
		this.set_coord(i, this.get_coord(i) - decrement.get_coord(i));
	}
	return this;
}

_vector.prototype.multiply = function(alpha)
{
	if (!is_number(alpha)) return this.ERROR_INVAL_ARG + "_vector.multiply(alpha)";
	
	var new_vector = new _vector(0, 0, 0, 0);
	new_vector.set_coord('t', this.get_coord('t'));
	for (var i = this.FIRST_GEOMETRICAL_COORD; i < this.N_COORDS; i ++)
	{
		new_vector.set_coord(i, alpha * this.get_coord(i));
	}
	return new_vector;
}

_vector.prototype.multiply_me = function(alpha)
{
	if (!is_number(alpha)) return this.ERROR_INVAL_ARG + "_vector.multiply_me(alpha)";
	
	for (var i = this.FIRST_GEOMETRICAL_COORD; i < this.N_COORDS; i ++)
	{
		this.set_coord(i, alpha * this.get_coord(i));
	}
	return this;
}

_vector.prototype.normalize = function()
{
	return this.multiply(1 / this.module());
}

_vector.prototype.normalize_me = function()
{
	return this.multiply_me(1 / this.module());
}

_vector.prototype.scalar_product = function(operand2_vec)
{
	if (!is_vector(operand2_vec)) return this.ERROR_INVAL_ARG + "_vector.scalar_product(operand2_vec)";
	
	var scalar_product = 0;
	for (var i = this.FIRST_GEOMETRICAL_COORD; i < this.N_COORDS; i ++)
	{
		scalar_product += this.get_coord(i) * operand2_vec.get_coord(i);
	}
	return scalar_product;
}

_vector.prototype.vector_product = function(operand2_vec)
{
	if (!is_vector(operand2_vec)) return this.ERROR_INVAL_ARG + "_vector.vector_product(operand2_vec)";
	
	return new _vector
	  ( this.get_coord('t'),
		this.get_coord('y') * operand2_vec.get_coord('z') - this.get_coord('z') * operand2_vec.get_coord('y'),
		this.get_coord('x') * operand2_vec.get_coord('z') - this.get_coord('z') * operand2_vec.get_coord('x'),
		this.get_coord('x') * operand2_vec.get_coord('y') - this.get_coord('y') * operand2_vec.get_coord('x')
	  );
}

_vector.prototype.project = function(direction_vec)
{
	if (!is_vector(direction_vec)) return this.ERROR_INVAL_ARG + "_vector.project(direction_vec)";
	if (!direction_vec.module()) return "Error in function _vector.project(direction_vec): the argument's module is too small.";
	
	var projected_vec = (new _vector).init(this);
	return direction_vec.normalize().multiply( projected_vec.scalar_product(direction_vec) );
}

_vector.prototype.project_me = function(direction_vec)
{
	if (!is_vector(direction_vec)) return this.ERROR_INVAL_ARG + "_vector.project_me(direction_vec)";
	if (!direction_vec.module()) return "Error in function _vector.project(direction_vec): the argument's module is too small.";
	
	return direction_vec.normalize().multiply( this.scalar_product(direction_vec) );
}

_vector.prototype.scalar_project = function(direction_vec)
{
	if (!is_vector(direction_vec)) return this.ERROR_INVAL_ARG + "_vector.scalar_project(direction_vec)";
	
	return this.project(direction_vec).module();
}

_vector.prototype.z_rotate = function(angle)
{
	if (!is_number(angle)) return this.ERROR_INVAL_ARG + "_vector.z_rotate(angle)";
	
	return new _vector
	  ( this.get_coord('t'),
		this.get_coord('x') * Math.cos(angle) - this.get_coord('y') * Math.sin(angle),
		this.get_coord('x') * Math.sin(angle) + this.get_coord('y') * Math.cos(angle),
		this.get_coord('z')
	  );
}

_vector.prototype.z_rotate_me = function(angle)
{
	if (!is_number(angle)) return this.ERROR_INVAL_ARG + "_vector.z_rotate(angle)";
		
	return this.init(this.z_rotate(angle));
}

_vector.prototype.velosity = function(new_vec)
{
	if (!new_vec) return this; // [Analizing argument errors]	
	
	var velosity = new _vector(0, 0, 0, 0);
	velosity.set_coord('t', new_vec.get_coord('t'));
	for (var i = this.FIRST_GEOMETRICAL_COORD; i < this.N_COORDS; i ++) 
	{
		velosity.set_coord( i, (new_vec.get_coord(i) - this.get_coord(i)) / (new_vec.get_coord('t') - this.get_coord('t')) );
	}
	return velosity;
}


/*
function _freevector(start_vec, pointer_vec)
{
	if (typeof start_vec   != '_vector'
	||  typeof pointer_vec != '_vector') return 
}

_freevector.prototype.N_COORDS = 4;
_freevector.prototype.FIRST_GEOMETRICAL_COORD = 1;
_freevector.prototype.ERROR_INVAL_ARG = "Error: invalid argument in function: ";
*/

function _vector_system(n_vectors)
{
	this.enume = {'center': n_vectors};
	this.n_vectors = n_vectors + 1;
	this.n_real_vectors = n_vectors;
	this.vector = new Array(this.n_vectors);
	for (var i = 0; i < this.n_vectors; i ++)
	{
		this.vector[i] = new _vector(0, 0, 0, 0);	
	}
	//this.vector[this.vector.length] = new _vector;
}

_vector_system.prototype.set_center = function(new_center_vec)
{
	this.vector[this.enume.center] = new_center_vec;
}

_vector_system.prototype.set_vector = function(i, new_vec)
{
	this.vector[i] = new_vec;
}

_vector_system.prototype.move_me = function(pointer_vec)
{
	for (var i = 0; i < this.n_vectors; i ++)
	{
		this.vector[i].increase_me(pointer_vec);	
	}
	return this;
}

_vector_system.prototype.z_rotate_me = function(rotate_angle)
{
	for (var i = 0; i < this.n_vectors; i ++)
	{
		this.vector[i].z_rotate_me(rotate_angle);	
	}
	return this;
}

_vector_system.prototype.z_self_rotate_me = function(rotate_angle)
{
	for (var i = 0; i < this.n_vectors; i ++)
	{
		this.vector[i].decrease_me(this.vector[this.enume.center]).z_rotate_me(rotate_angle).increase_me(this.vector[this.enume.center]);	
	}
	return this;
}

_vector_system.prototype.get_coords = function()
{
	var coords = [];
	for (var i = 0; i < this.n_real_vectors; i ++)
	{
		coords[i] = this.vector[i].get_coords();
	}
	return coords;
}

function main()
{ // Just for testing
	//var x_vec = new _vector(4, 5, 6, 5);
	//var dx_vec = new _vector(1, 1, 1, 1);
	//x_vec.increase_me(dx_vec);
	//x_vec.decrease(dx_vec);
	//x_vec.multiply_me(99);
	//var x_vec = new _vector(100, 50, 40, 1900);		
	//x_vec.z_rotate_me(Math.PI/2)
	
	var sys = new _vector_system(3);
	sys.set_vector(0, new _vector(0, 1, 0, 0));
	sys.set_vector(1, new _vector(0, 0, 1, 0));
	sys.set_vector(2, new _vector(0, 0, 0, 1));
	
	//sys.move_me(new _vector(777, 1, 1, 1));
	//sys.set_center(new _vector(0, 100, 0, 0));
	
	//sys.z_self_rotate_me(Math.PI/6);
	sys.z_self_rotate_me(-Math.PI/6);
	
	alert( sys.get_coords() );
}
