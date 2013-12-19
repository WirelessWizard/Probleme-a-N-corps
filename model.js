/* MODEL */

function exponent_part(x, base)
{
	var degree = 0;
	while ( x >= base ) { degree ++; x /= base; };
	return degree; 
}

function make_color(mass)
{
	var color;
	switch (exponent_part(mass * 10000, 10))
	{
	case 0: color = "red"; break;
	case 1: color = "orange"; break;
	case 2: color = "yellow"; break;
	case 3:	color = "blue"; break;
	default: color = "white"; break;
	}
	return color;
}

function _object(id_code)
{
	this.id_code = id_code;
	this.coord = new _vector(0, 0, 0, 0); // vector r
	this.velosity = new _vector(0, 0, 0, 0);  // vector v
	this.acceleration = new _vector(0, 0, 0, 0); // vector w
	this.mass = 1; // m
	//this.mass_rate_of_change = 0; // dm/dt
	this.radius = 0.001; // r
	this.color = "white";
	
	this.is_dead = false;
}

_object.prototype.id = function() { return this.id_code }

_object.prototype.get_r_vec = function() { return this.coord }
_object.prototype.get_v_vec = function() { return this.velosity }
_object.prototype.get_w_vec = function() { return this.acceleration }

_object.prototype.set_r_vec = function(new_r_vec) { return this.coord.init(new_r_vec) }
_object.prototype.set_v_vec = function(new_v_vec) { return this.velosity = new_v_vec }
_object.prototype.set_w_vec = function(new_w_vec) { return this.acceleration = new_w_vec }

_object.prototype.get_mass = function() { return this.mass }
_object.prototype.set_mass = function(new_mass) { return this.mass  = new_mass }
_object.prototype.inc_mass = function(inc_mass) { return this.mass += inc_mass }

_object.prototype.get_temp = function() { return this.temperature }
_object.prototype.set_temp = function(new_temp) { return this.temperature = new_temp }

_object.prototype.get_radius = function() { return this.radius }
_object.prototype.set_radius = function(new_radius) { return this.radius = new_radius }

_object.prototype.get_color = function() { return this.color }
_object.prototype.set_color = function(new_color) { return this.color = new_color }

_object.prototype.alive = function() { return !this.is_dead }
_object.prototype.kill = function() { this.is_dead = true; delete this }

_object.prototype.impulse = function() { return this.velosity.multiply(this.mass) }

_object.prototype.generateStartingCoord = function(init_data)
{	
	this.get_r_vec().set_coords
	(
		0,//0, 0.4, 0.3, 0
		(0.5 - Math.random()) * init_data.coord_scale_coeff, 
		(0.5 - Math.random()) * init_data.coord_scale_coeff,
		0//Math.random()
	);
	
	var spin = function()
	{
		var spin = -1;
		var i = parseInt(Math.random() * 10);
		while (i)
		{
			spin *= -1;
			-- i;	
		}
		return spin;
	};
	
	var s = spin();
	
	var coord_module = this.get_r_vec().module();
	var coord_sq_rev = 1 / (coord_module * ( 1 + coord_module) ); // ref
	
	this.get_v_vec().set_coords
	(
		0,//0, 0.4, 0.3, 0
		 1 * s * this.get_r_vec().get_coord('y') * coord_sq_rev,
		-1 * s * this.get_r_vec().get_coord('x') * coord_sq_rev,
		0//Math.random()
	);
	
	this.mass = init_data.average_mass * (1 - 0.99 * Math.random())
	+
	Math.pow( (Math.random()), 1 - init_data.mass_deviation ) * init_data.average_mass * init_data.mass_disposal / 100;//%
	
	this.color = make_color(this.mass);
	
	this.radius = 0.01;
}

function System(object_number)
{
	this.object_number = object_number;
	this.alive_object_number = object_number;
	this.n_killed = 0;
	this.object_ = new Array(object_number);
	this.mass_center = new _vector;
	this.total_mass = 0;
	this.motion_buffer = new Array(object_number);
	this.time = 0;
	this.gamma = 1;
	this.forbidden_radius = 1;
	
	for (var i = 0; i < object_number; i ++)
	{
		this.object_[i] = new _object(i);
	}
}

//System.prototype.get_object_number = function(){ return this.object_number }
System.prototype.get_object = function(i) { return this.object_[i] }

System.prototype.how_much_alive_objects = function() { return this.alive_object_number }

System.prototype.get_mass_center = function() { return this.mass_center }

System.prototype.ObjectInit = function(init_data)
{
	this.gamma = init_data.gamma;
	this.forbidden_radius = init_data.forbidden_radius;
	
	switch (init_data.distribution_policy)
	{
		case 'random':
		for (var i = 0; i < this.object_number; i ++)
		{
			this.object_[i].generateStartingCoord(init_data);
			this.total_mass += this.object_[i].get_mass();
			this.motion_buffer[i] = new _vector(0, 0, 0, 0);
		}
		break;
		
		case 'circle':
		var obj_pointer = new _vector(0, 0.45, 0, 0);
		var rot_angle = 2 * Math.PI / this.object_number;
		for (var i = 0; i < this.object_number; i ++)
		{
			this.object_[i].set_r_vec(obj_pointer.z_rotate(i * rot_angle));
			//obj_pointer.z_rotate_me(rot_angle);
			this.object_[i].color = make_color(this.mass);
			
			
			this.total_mass += this.object_[i].get_mass();
			this.motion_buffer[i] = new _vector(0, 0, 0, 0);
		}		
		break;
		
		case 'solar':
		var NUMBER_OF_SYSTEMS = 5;
		for (var j = 0; j < NUMBER_OF_SYSTEMS; j ++)
		{
			var sys_pointer = new _vector(0, 0, 100, 0);
			sys_pointer.z_rotate_me(j * 2 * Math.PI / NUMBER_OF_SYSTEMS);
			var sys_v_pointer = new _vector(0, 0, 0, 0).init(sys_pointer.multiply(-1));
			//sys.increase_me(sys_pointer.multiply(-1));
			
			var number_of_objs_per_sys = this.object_number / NUMBER_OF_SYSTEMS;
			var obj_pointer = new _vector(0, 1 * init_data.coord_scale_coeff / number_of_objs_per_sys, 0, 0);
			var rot_angle = 2 * Math.PI / number_of_objs_per_sys;
			for (var i = 0; i < number_of_objs_per_sys; i ++)
			{
				var k = j * number_of_objs_per_sys + i;
				this.object_[k].set_r_vec(obj_pointer.multiply(i * 0.3 + 2*i).z_rotate(i * rot_angle * 2).increase(sys_pointer));
				if (i != 0)
				this.object_[k].set_v_vec(new _vector
				(
					0,//0, 0.4, 0.3, 0
					 10 * Math.sqrt(Math.sqrt(i)) * this.object_[k].get_r_vec().get_coord('y') / (Math.sqrt(init_data.coord_scale_coeff) * this.object_[k].get_r_vec().module()),// + (0.5 / (i*i)),
					-10 * Math.sqrt(Math.sqrt(i)) * this.object_[k].get_r_vec().get_coord('x') / (Math.sqrt(init_data.coord_scale_coeff) * this.object_[k].get_r_vec().module()),// + (0.5 / (i*i)),
					0//Math.random()
				));
				this.object_[k].get_v_vec().increase_me(sys_v_pointer);
				if (i == 0) this.object_[k].set_mass(5);
				else        this.object_[k].set_mass(0.01);
				//this.object_[i].set_mass(0.316/(i + 0.1));
				this.object_[k].color = make_color(this.mass);
				if (i == 0) this.object_[k].color = "white";
				this.total_mass += this.object_[k].get_mass();
				this.motion_buffer[k] = new _vector(0, 0, 0, 0);
			}
		}
		break;
	}
}

System.prototype.Collision = function(i, j)
{
	if (this.object_[i].get_mass() < this.object_[j].get_mass()) return this.Collision(j, i);
	
	//this.object_[j].set_color("transparent");
	this.object_[j].kill();
	this.alive_object_number --;
	this.n_killed ++;
	this.object_[i].set_color(make_color(this.object_[i].get_mass()));
	this.object_[i].get_v_vec().init
	(
		this.object_[i].impulse().increase( this.object_[j].impulse() ).multiply
		( 1 / (this.object_[i].get_mass() + this.object_[j].get_mass()) )
	);
	this.object_[i].inc_mass(this.object_[j].get_mass());
	this.object_[j].set_mass(0);
}

System.prototype.Motion = function(dt)
{
	//if (dt < 0) { this.ObjectInit(); return; }
	this.mass_center = new _vector(0, 0, 0, 0);
	this.time += dt;
	
	var r_buf = new _vector;
	var v_buf = new _vector;
	var w_buf = new _vector;
		
	for (var i = 0; i < this.object_number; i ++)
	if (this.object_[i].alive())
	{	
		for (var j = i + 1; j < this.object_number; j ++)
		if (this.object_[j].alive())
		{
			var delta_r_vec = this.object_[j].get_r_vec().decrease(this.object_[i].get_r_vec());
			var delta_v_vec = this.object_[j].get_v_vec().decrease(this.object_[i].get_v_vec());
			
			if (delta_r_vec.scalar_product(delta_r_vec) * this.forbidden_radius
			  + delta_v_vec.scalar_product(delta_r_vec) * dt < 0 /*&& this.object_[j].alive()*/)
			{
				this.Collision(i, j);
				continue;
			}
						
			var force_buffer = this.object_[j].get_r_vec().decrease(this.object_[i].get_r_vec()).multiply
			(
				this.gamma / Math.pow(this.object_[i].get_r_vec().decrease(this.object_[j].get_r_vec()).module(), 3)
			);
			
			this.motion_buffer[i].increase_me( force_buffer.multiply(this.object_[j].get_mass()) );
			this.motion_buffer[j].decrease_me( force_buffer.multiply(this.object_[i].get_mass()) );
		}
		
		this.mass_center.increase( this.object_[i].get_r_vec().multiply(this.object_[i].get_mass()) );
	}
	
	this.mass_center.multiply_me(1 / this.total_mass);
	
	for (var i = 0; i < this.object_number; i ++)
	{
		w_buf = this.motion_buffer[i];
		v_buf = this.object_[i].get_v_vec().increase(w_buf.multiply(dt));
		r_buf = this.object_[i].get_r_vec().increase(v_buf.multiply(dt));
		
		//r_buf.decrease_me();
		
		this.object_[i].get_w_vec().init(w_buf);
		this.object_[i].get_v_vec().init(v_buf);
		this.object_[i].get_r_vec().init(r_buf);
		
		this.motion_buffer[i] = new _vector(0, 0, 0, 0);
	}

	return true;
}
