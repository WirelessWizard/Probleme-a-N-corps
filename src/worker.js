importScripts("vector.js", "model.js");

/*
			The Web Worker's Part
*/

var time_increment;
var time_step_rate;
var draw_rate;
var sysinfosend_rate = 1000;
var object_number;
var alive_object_number;
var sys;
var coord;
var system_iterator_destroyer;
var sendcoords_iterator_destroyer;
var sendsysinfo_iterator_destroyer;

self.addEventListener('message', function(e)
{
	var data = e.data;
	
	switch (data.cmd)
	{
	case 'init':
		time_increment = data.init_data.time_increment;
		time_step_rate = data.init_data.time_step_rate;
		draw_rate = data.init_data.draw_rate;
		object_number = data.init_data.object_number;
		sys = new System(object_number);
		sys.ObjectInit(data.init_data);
	break;
	
	case 'start':
		system_iterator_destroyer = setInterval
		(
			function()
			{
				sys.Motion(time_increment);
			}, time_step_rate
		);
		
		sendcoords_iterator_destroyer = setInterval
		(
			function()
			{
				coord = new Array(object_number);
				
				var j = 0;
				for (var i = 0, j = 0; i < object_number; i ++)
				if (sys.object_[i].alive())
				{//!!! need to optimize
					coord[j] = new Array;
					coord[j][0] = sys.object_[i].get_r_vec().get_coord('x');
					coord[j][1] = sys.object_[i].get_r_vec().get_coord('y');
					coord[j][2] = sys.object_[i].get_color();
					coord[j][3] = sys.object_[i].get_v_vec().get_coord('x');
					coord[j][4] = sys.object_[i].get_v_vec().get_coord('y');
					coord[j][5] = sys.object_[i].get_radius();
					j ++;
				}
				
				self.postMessage({'coord': coord});
			}, time_step_rate * draw_rate
		);
		
		sendsysinfo_iterator_destroyer = setInterval
		(
			function()
			{
				self.postMessage
				({
					'sysinfo':
					{
						'alive_object_number': sys.alive_object_number,
						'killed_object_number': sys.n_killed
					}
				});
			}, sysinfosend_rate
		);
	break;
			
	case 'change_time_step':
		time_step_rate = data.time_step_rate;
	break;
		
	case 'stop':
		self.close(); // Terminates the worker
	break;
		
	default:
		self.postMessage({'report': 'Unknown command: ' + data.msg});
	};
	
}, false);
