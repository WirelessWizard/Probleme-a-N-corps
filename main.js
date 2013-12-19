function autoModeEnabled()
{
    var str = window.location.href;
    re = /\?/;
    test_mode = str.search(re);
    if (test_mode != -1)
    {
		return true;
    }
    else return false;
}

function alertSize()
{ /* black style */
	var myWidth = 0, myHeight = 0;
	
	if ( typeof( window.innerWidth ) == 'number' )
	{
		//Non-IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
	}
	
	else if ( document.documentElement &&
	         ( document.documentElement.clientWidth ||	
	           document.documentElement.clientHeight ) )
	{
		//IE 6+ in 'standards compliant mode'
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
	}
	
	else if ( document.body &&
	         ( document.body.clientWidth ||
	           document.body.clientHeight ) )
	{
		//IE 4 compatible
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
	}
	
	return new Array(myWidth, myHeight);
}

function resize_canvas()
{
	canvas = document.getElementById("output");
	canvas.width = canvas.height = minimum(alertSize()[0], alertSize()[1]);
}

function getRadioGroupValue(radioGroupObj)
{
	for (var i = 0; i < radioGroupObj.length; i ++)
	{
		if (radioGroupObj[i].checked) return radioGroupObj[i].value;
	}
	
	return null;
}

//~ ===========================================================================================================
//~ GLOBAL VARS
var auto_mode_enabled = false;
var global_time;
var ui_period = 1000; //ms
//!var veiw_destroyer;
//var model_destroyer;
var clock_destroyer;
var scale_destroyer;
var model_engine;

// INPUT DEVICES
var input_dev;
var hand_control;
var real_time_input_dev;
var preset_input_dev;

var start_btn;
var stop_btn;
var digit_inp;


// INPUT PARAMS
var gamma;
var forbidden_radius;
var time_increment;
var object_number;
//var average_temp;
var average_mass;
var mass_disposal;
var mass_deviation;
var time_step_rate;
var draw_rate;
var coord_scale_coeff;


// FLAGS
var flag_collection;

// INDICATORS
var activity_monitor;
var timer_lbl;
var fps_lbl;
var time_lag_lbl;
var status_lbl;

var scale_value;

// ENUMERATORS & FLAG SYSTEM
var FLAG_REGISTER = 0; // flag container

__flag =
{
	DISPLAY_OBJ_ID : 10,
	DRAW_ARROWS : 100,
	ENABLE_AUTO_SCALE : 1000,
	ENABLE_DRAW_TRACK : 10000
};

function check_flag_state(flag)
{
	if (FLAG_REGISTER % (10 * flag) >= flag)
	{
		return true;
	}
	
	return false;
}

function switch_flag(flag)
{
	switch (check_flag_state(flag))
	{
	case true:
		FLAG_REGISTER -= flag;
		auto_scale_flag.checked = false;
	return;
	
	case false:
		FLAG_REGISTER += flag;
		auto_scale_flag.checked = true;
	return;	
	}
}

function switch_arrows_draw()
{
	switch (check_flag_state(__flag.DRAW_ARROWS))
	{
	case true:
		FLAG_REGISTER -= __flag.DRAW_ARROWS;
		draw_arrows_flag.checked = false;
	return;
	
	case false:
		FLAG_REGISTER += __flag.DRAW_ARROWS;
		draw_arrows_flag.checked = true;
	return;	
	}
}

function switch_auto_scale()
{
	switch (check_flag_state(__flag.ENABLE_AUTO_SCALE))
	{
	case true:
		FLAG_REGISTER -= __flag.ENABLE_AUTO_SCALE;
		auto_scale_flag.checked = false;
	return;
	
	case false:
		FLAG_REGISTER += __flag.ENABLE_AUTO_SCALE;
		auto_scale_flag.checked = true;
	return;	
	}
}

function off_auto_scale()
{
	if ( check_flag_state(__flag.ENABLE_AUTO_SCALE) )
	{
		FLAG_REGISTER -= __flag.ENABLE_AUTO_SCALE;
		auto_scale_flag.checked = false;
	}
}



function startup()
{
	resize_canvas();

	input_dev = document.getElementsByTagName("input");
	hand_control = document.getElementsByClassName("hand_control");
	real_time_input_dev = document.getElementsByClassName("real_time");
	preset_input_dev = document.getElementsByClassName("preset");
	stop_btn = document.getElementById("stop_btn");
	display_id_flag = document.getElementById("display_id_flag");
	draw_arrows_flag = document.getElementById("draw_arrows_flag");
	auto_scale_flag = document.getElementById("auto_scale_flag");
	timer_lbl = document.getElementById("timer");
	status_lbl = document.getElementById("status");
	fps_lbl = document.getElementById("fps");
	time_lag_lbl = document.getElementById("time_lag");
	activity_monitor = document.getElementById("activity_monitor");
	scale_value = document.getElementById("scale_value");
	
	if (autoModeEnabled())
	{
		for (var i = 0; i < input_dev.length; i ++) input_dev[i].disabled = true;
		for (var i = 0; i < hand_control.length; i ++) hand_control[i].style.display = "none";
		document.getElementById("header").textContent = 'Auto Mode';
		auto_mode_enabled = true;
		return _start();
	}
	
	for (var i = 0; i < input_dev.length; i ++) input_dev[i].disabled = false;
	stop_btn.disabled = true;
	
	activity_monitor.style.display = "none";
}

function _start()
{
	//~ ===========================================================================================================
	//~ Init global objs
	global_time = 0;
	model_engine = new Worker("worker.js");

	//~ ===========================================================================================================	
	//~ Clear labels
	timer_lbl.textContent = "";
	fps_lbl.textContent = "";
	time_lag_lbl.textContent = "";
	status_lbl.textContent = "";
	
	//~ ===========================================================================================================	
	//~ Create local objs
	var mass_center = new _vector(0, 0, 0, 0);
	var fps_counter = 0;
	var time_lag = 0;
	var coord = new Array;
	
	if (auto_mode_enabled)
	{
		document.getElementById("gamma"            ).value = gamma             = AUTO_INPUT.gamma            ;
		document.getElementById("forbidden_radius" ).value = forbidden_radius  = AUTO_INPUT.forbidden_radius ;
		document.getElementById("time_increment"   ).value = time_increment    = AUTO_INPUT.time_increment   ;
		document.getElementById("object_number"    ).value = object_number     = AUTO_INPUT.object_number    ;
	//  document.getElementById("average_temp"     ).value = var average_temp  = AUTO_INPUT.average_temp     ;
		document.getElementById("average_mass"     ).value = average_mass      = AUTO_INPUT.average_mass     ;
		document.getElementById("mass_disposal"    ).value = mass_disposal     = AUTO_INPUT.mass_disposal    ;
		document.getElementById("mass_deviation"   ).value = mass_deviation    = AUTO_INPUT.mass_deviation   ;
		document.getElementById("time_step_rate"   ).value = time_step_rate    = AUTO_INPUT.time_step_rate   ;	
		document.getElementById("draw_rate"        ).value = draw_rate         = AUTO_INPUT.draw_rate        ;		
		document.getElementById("coord_scale_coeff").value = coord_scale_coeff = AUTO_INPUT.coord_scale_coeff;
		
		var distribution_policy = "solar";
		
		//FLAG_REGISTER += __flag.DISPLAY_OBJ_ID;
		FLAG_REGISTER += __flag.DRAW_ARROWS;
		FLAG_REGISTER += __flag.ENABLE_AUTO_SCALE;
		FLAG_REGISTER += __flag.ENABLE_DRAW_TRACK;
	}

	else
	{
		//~ Parse current inputs
		gamma            = document.getElementById("gamma"           ).value;
		forbidden_radius = document.getElementById("forbidden_radius").value;
		time_increment   = document.getElementById("time_increment"  ).value;
		object_number    = document.getElementById("object_number"   ).value;
		//var average_temp   = document.getElementById("average_temp"    ).value;
		average_mass     = document.getElementById("average_mass"    ).value;
		mass_disposal    = document.getElementById("mass_disposal"   ).value;
		mass_deviation   = document.getElementById("mass_deviation"  ).value;
		time_step_rate   = document.getElementById("time_step_rate"  ).value;	
		draw_rate        = document.getElementById("draw_rate"       ).value;
		coord_scale_coeff = document.getElementById("coord_scale_coeff").value;
		
		
		if (gamma            != parseFloat(gamma            )){ alert("Not valid gamma member."       ); return }
		if (forbidden_radius != parseFloat(forbidden_radius )){ alert("Not valid forbidden radius."   ); return }
		if (time_increment   != parseFloat(time_increment   )){ alert("Not valid time increment."     ); return }
		if (object_number    != parseInt  (object_number    )){ alert("Not valid object number."      ); return }
		//if (average_temp   != parseInt  (average_temp     )){ alert("Not valid average temperature."); return }
		if (average_mass     != parseFloat(average_mass     )){ alert("Not valid average mass."       ); return }
		if (mass_disposal    != parseInt  (mass_disposal    )){ alert("Not valid mass disposal."      ); return }
		if (mass_deviation   != parseFloat(mass_deviation   )){ alert("Not valid mass deviation."     ); return }
		if (time_step_rate   != parseInt  (time_step_rate   )){ alert("Not valid time step rate."     ); return }
		if (draw_rate        != parseInt  (draw_rate        )){ alert("Not valid drawing interval."   ); return }
		if (coord_scale_coeff!= parseFloat(coord_scale_coeff)){ alert("Not valid initial scale."      ); return }
		
		var distribution_policy = getRadioGroupValue(document.main.distr);
		
		//if (display_id_flag.checked) FLAG_REGISTER += __flag.DISPLAY_OBJ_ID;
		if (draw_arrows_flag.checked) FLAG_REGISTER += __flag.DRAW_ARROWS;
		if (auto_scale_flag.checked) FLAG_REGISTER += __flag.ENABLE_AUTO_SCALE;
		FLAG_REGISTER += __flag.ENABLE_DRAW_TRACK;
	}
	

	//~ ===========================================================================================================
	//~ Init the WebWorker	
	model_engine.postMessage({'cmd': 'init', 'init_data':
	{
		'gamma': gamma,
		'forbidden_radius': forbidden_radius,
		'time_increment': parseFloat(time_increment),
		'time_step_rate': time_step_rate,
		'draw_rate': draw_rate,
		'object_number': object_number,
		'average_mass': average_mass,
		'mass_disposal': mass_disposal,
		'mass_deviation': mass_deviation,
		'distribution_policy': distribution_policy,
		'coord_scale_coeff': coord_scale_coeff
	}});

	model_engine.postMessage({'cmd': 'start'});

	//~ ===========================================================================================================
	//~ Seeking for WebWorker's report
	model_engine.addEventListener('message', function(e)
	{
		if (e.data.coord)
		{
			coord = e.data.coord;
			fps_counter ++;
			Draw(canvas, mass_center, coord, FLAG_REGISTER);
		}
		if (e.data.sysinfo) status_lbl.textContent = e.data.sysinfo.alive_object_number;
	}, false);
	
	clock_destroyer = setInterval
	(
		function() 
		{
			timer_lbl.textContent = (parseInt(global_time ++)) + 's';
			fps_lbl.textContent = fps_counter + 'fps';
			//time_lag += (ui_period / (time_step_rate * draw_rate)) / fps_counter;
			time_lag += (1 / fps_counter) - time_step_rate / ui_period;
			time_lag_lbl.textContent = parseInt(time_lag) + 's';
			fps_counter = 0;
			
			if (auto_mode_enabled && global_time >= AUTO_INPUT.TEST_TIME)
			{
				_terminate();
				return getData(time_lag);
			}
		}, ui_period // 1000 ms
	);
	
	scale_destroyer = setInterval(function(){Scale()}, ui_period / 4);

	//~ ===========================================================================================================
	//~ Enpowering the interface

	if (!auto_mode_enabled)
	{
		for (var i = 0; i < preset_input_dev.length; i ++) preset_input_dev[i].disabled = true;
		stop_btn.disabled = false;
		//start_btn.disabled = true;
	}
		
	activity_monitor.style.display = "block";
}

function _terminate()
{
	startup();
	model_engine.terminate();
	clock_destroyer = window.clearInterval(clock_destroyer);	
	scale_destroyer = window.clearInterval(scale_destroyer);
	//model_engine.postMessage({'cmd': 'stop'});
	//activity_monitor.style.display = "none";
}

function _in_scale()
{
	off_auto_scale();
	canvas_scale_coeff += canvas_scale_step * canvas_scale_coeff;
}

function _out_scale()
{
	off_auto_scale();
	canvas_scale_coeff -= canvas_scale_step * canvas_scale_coeff;
}

function _fit_scale()
{
	off_auto_scale();
}

function _normal_scale()
{
	off_auto_scale();
	canvas_scale_coeff = 1;
}

function _go_up()
{
	center_vec.coord_increase_me('y', +0.1 / canvas_scale_coeff);
}

function _go_right()
{
	center_vec.coord_increase_me('x', -0.1 / canvas_scale_coeff);
}

function _go_down()
{
	center_vec.coord_increase_me('y', -0.1 / canvas_scale_coeff);
}

function _go_left()
{
	center_vec.coord_increase_me('x', +0.1 / canvas_scale_coeff);
}

document.onkeydown = function(event) 
{
	events = event || window.event;
	switch (events.keyCode)
	{
	case 37: _go_left(); break; //<
	case 38: _go_up(); break; //^
	case 39: _go_right(); break; //>
	case 40: _go_down(); break; //v
	case 187:
	case 61: _in_scale(); break; //+
	case 189:
	case 109: _out_scale(); break; //-
	case 9: switch_flag(__flag.ENABLE_AUTO_SCALE); break; //tab
	case 27:
	case 8: _terminate(); break; //delete (mac)
	case 13: if(stop_btn.disabled) _start(); break; //enter
	case 84: switch_flag(__flag.ENABLE_DRAW_TRACK); break; // 'T'
	}
}
