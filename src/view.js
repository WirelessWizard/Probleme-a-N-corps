function KelvinToXYZ(T)
{
	var X, Y, Z;
	var t = 1000.0 / T;
	if (T < 4000.0)
	{
		X = ((-0.2661239*t - 0.2343580)*t + 0.8776956)*t + 0.17991;
		if (T < 2222.0) Y = ((-1.1063814*X - 1.34811020)*X + 2.18555832)*X - 0.20219683;
		else Y = ((-0.9549476*X - 1.37418593)*X + 2.09137015)*X - 0.16748867;
	}
	else
	{
		X = ((-3.0258469*t + 2.1070379)*t + 0.2226347)*t + 0.24039;
		Y =  ((3.0817580*X - 5.8733867)*X + 3.75112997)*X - 0.37001483;
	};
	Z = 1.0 - X - Y;
	return new Array(X, Y, Z);
};

function XYZtoRGB(X, Y, Z)
{
	var rgb = new _vector(0, 0, 0, 0);
	var xyz = new _vector(0, X, Y, Z);
	var a = new _vector(0,  3.2406, -1.5372, -0.4986);
	var b = new _vector(0, -0.9689,  1.8758,  0.0415);
	var c = new _vector(0,  0.0557, -0.2040,  1.0570);
	rgb.set_coords( xyz.scalear_product(a),
	                xyz.scalear_product(b),
                    xyz.scalear_product(c) );
	return rgb.get_coords();
}

function KelvinToRGB(T)
{
	var xyz = KelvinToXYZ(T);
	var rgb = XYZtoRGB(xyz[0], xyz[1], xyz[2]);
	return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
	return 'rgb(' + parseInt(255*(1-xyz[0])) + ', ' + parseInt(10*(1-xyz[1])) + ', ' + parseInt(50*(1-xyz[2])) + ')';
}


var center_vec = new _vector(0, 0, 0, 0);

var basic_radius = 1;
var canvas_scale_coeff = 1;
var canvas_scale_step = 0.25;
var out_view_frame_halfsize = 0.48;
var in_view_frame_halfsize = 0.24;

/*
var SCALE_DELAY = 100; // don't slace for 10 frames if scale_vector is changed
var scal_delay_counter = 0;
var scale_vector = 0; // > 0 ~ need_out_scale; < 0 ~ need_in_scale
*/
var need_out_scale = false;
var need_in_scale = false;

function Scale()
{	
	if (need_out_scale)
	{
		canvas_scale_coeff -= canvas_scale_step * canvas_scale_coeff;
	}
	
	if (need_in_scale)
	{
		canvas_scale_coeff += canvas_scale_step * canvas_scale_coeff;
	}
}

function Draw(canvas, mass_center, coord, arg)
{	
	var ctx = canvas.getContext("2d");
	var canvas_liner_size = minimum(canvas.width, canvas.height);
	basic_radius = 0.009 * canvas_liner_size * Math.log(1 + canvas_scale_coeff);
	var x = 0;
	var y = 0;
	need_out_scale = false;
	need_in_scale = false
	
	scale_value.textContent = ("1:" + 1 / canvas_scale_coeff).substr(0, 8);
	
	if (canvas.getContext)
	{
		if ( check_flag_state(__flag.ENABLE_DRAW_TRACK) )
		{
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
				
		for (var i = 0; i < coord.length; i ++)
		{	
			x = (coord[i][0] + center_vec.get_coord('x')) * canvas_scale_coeff;
			y = (coord[i][1] + center_vec.get_coord('y')) * canvas_scale_coeff;
			
			if ( check_flag_state(__flag.ENABLE_AUTO_SCALE))
			{			
				if (absolute(x) > out_view_frame_halfsize
				||  absolute(y) > out_view_frame_halfsize)
				{
					need_out_scale = true;
				}
				
				need_in_scale = true;
				
				if (absolute(x) > in_view_frame_halfsize
				||  absolute(y) > in_view_frame_halfsize)
				{
					need_in_scale = false;
				}
				
				canvas_scale_step = maximum
				(
				canvas_scale_step,
				Math.sqrt(coord[i][0]*coord[i][0] + (coord[i][1]*coord[i][1])) * time_increment /* ui_period / draw_rate*/
				);
			}
						
			x = (0.5 + x) * canvas.width;
			y = (0.5 + y) * canvas.height;

			ctx.fillStyle = coord[i][2];//(KelvinToRGB(coord[i][2]));
			ctx.beginPath();
			ctx.arc(x, y, basic_radius, 0, Math.PI * 2, false);
			ctx.closePath();
			ctx.fill();
			
			if ( check_flag_state(__flag.DISPLAY_OBJ_ID))
			{
				var id_block = document.createElement("div");
				id_block.setAttribute("class", "object_id_block");
				document.body.appendChild(id_block);
				id_block.textContent = i+'';
				id_block.style.right  = (canvas.width  - x)+'pt';
				id_block.style.bottom = (canvas.height - y)+'pt';
				id_block.style.color = coord[i][2];
			}			

			if ( check_flag_state(__flag.DRAW_ARROWS))
			{				
			    var arlen = 6;
			    var psi = Math.PI / 16;
   			    var OA = new _vector(0, x, y, 0);
			    var AB = new _vector(0, coord[i][3], coord[i][4], 0);
			    AB.multiply_me(arlen * basic_radius);
			    var OB = (new _vector).init( OA.increase(AB) );
			    var BC = (new _vector).init( AB.z_rotate( Math.PI - psi).normalize().multiply(arlen) );
			    var BD = (new _vector).init( AB.z_rotate( Math.PI + psi).normalize().multiply(arlen) );
			    var OC = (new _vector).init( OB.increase(BC) );
			    var OD = (new _vector).init( OB.increase(BD) );

 /* ============================================================= *\ 
|				Fig. 1. The Arrow                   				|
|				                                  B 				|
|				                                 /| 				|
|				                               ///| 				|
|				                             / // | 				|
|				       *                 C /  //  | 				|
|				     "O"                     //   D 				|
|				                            //      				|
|				1) ^CBA = ^ABD = psi;      //						|
|				2) |BC| = |BD| = arlen.    A        				|
 \* ============================================================= */ 
 
			    ctx.strokeStyle = coord[i][2];
			    			    
			    ctx.moveTo(OA.get_coord('x'), OA.get_coord('y'));
			    ctx.lineTo(OB.get_coord('x'), OB.get_coord('y'));
			    ctx.lineTo(OC.get_coord('x'), OC.get_coord('y'));
			    ctx.moveTo(OB.get_coord('x'), OB.get_coord('y'));
			    ctx.lineTo(OD.get_coord('x'), OD.get_coord('y'));
			    ctx.closePath();
			    ctx.stroke();
			}
		}
	}
}
