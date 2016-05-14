//Yang Li Project2

"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), 	looking = false, prev_time = 0, animate = false, animation_time = 0;
		var gouraud = false, color_normals = false, solid = false;
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( vec4( .8,.3,.8,1 ), .5, 1, 1, 40, "" ) ); }


// *******************************************************
// IMPORTANT -- In the line below, add the filenames of any new images you want to include for textures!

var texture_filenames_to_load = [ "stars.png", "text.png", "earth.gif", "bird body.jpg", "bird body1.jpg", "bricks.jpg", "gray.jpg" ,"gray1.jpg","ugly.jpg", "desert.jpg"];
var body_tex = new Material( vec4( 0.5,0.5,0.5,1 ), 0.5, 0.2, 0, 100, "bird body.jpg" );
var body_tex1 = new Material( vec4( 0.5,0.5,0.5,1 ), 0.5, 0.2, 0, 100, "bird body1.jpg" );
var earth = new Material( vec4( .5,.5,.5,1 ), .5, 1, .5, 40, "earth.gif" );
var bricks = new Material( vec4( 0.5,0.5,0.5,1 ), 0.5, 0.2, 0, 100, "bricks.jpg" );
var gray = new Material( vec4( 0.5,0.5,0.5,1 ), 0.5, 0.2, 0, 100, "gray.jpg" );
var gray1 = new Material( vec4( 0.5,0.5,0.5,1 ), 0.5, 0.2, 0, 100, "gray1.jpg" );
var ugly = new Material( vec4( 0.5,0.5,0.5,1 ), 0.5, 0.2, 0, 100, "ugly.jpg" );
var desert = new Material( vec4( 0.5,0.5,0.5,1 ), 0.5, 0.5, 0.5, 100, "desert.jpg" );
// *******************************************************	
// When the web page's window loads it creates an "Animation" object.  It registers itself as a displayable object to our other class "GL_Context" -- which OpenGL is told to call upon every time a
// draw / keyboard / mouse event happens.

window.onload = function init() {	var anim = new Animation();	}
function Animation()
{
	( function init (self) 
	{
		self.context = new GL_Context( "gl-canvas" );
		self.context.register_display_object( self );
		
		//gl.clearColor(255,255,255,1);			// Background color
		gl.clearColor(0,0,0,1);	

		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], false );
		
		self.m_cube = new cube();
		self.m_obj = new shape_from_file( "teapot.obj" )
		self.m_axis = new axis();
		self.m_sphere = new sphere( mat4(), 4 );	
		self.m_fan = new triangle_fan_full( 10, mat4() );
		self.m_strip = new rectangular_strip( 1, mat4() );
		self.m_cylinder = new cylindrical_strip( 10, mat4() );
		self.m_text = new text_line(30);
		

		self.m_pyramid = new pyramid(mat4());
		
		// 1st parameter is camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		self.graphicsState = new GraphicsState( translation(0, 0,-40), perspective(45, canvas.width/canvas.height, .1, 1000), 0 );

		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);		gl.uniform1i( g_addrs.SOLID_loc, solid);
		
		self.context.render();	
	} ) ( this );	
	
	canvas.addEventListener('mousemove', function(e)	{		e = e || window.event;		movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0);	});
}

// *******************************************************	
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
	shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "f",     function() { looking = !looking; } );
	shortcut.add( ",",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;
	shortcut.add( ".",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;


	shortcut.add( "r",     ( function(self) { return function() { self.graphicsState.camera_transform = mat4(); }; } ) (this) );
	shortcut.add( "ALT+s", function() { solid = !solid;					gl.uniform1i( g_addrs.SOLID_loc, solid);	
																		gl.uniform4fv( g_addrs.SOLID_COLOR_loc, vec4(Math.random(), Math.random(), Math.random(), 1) );	 } );
	shortcut.add( "ALT+g", function() { gouraud = !gouraud;				gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);	} );
	shortcut.add( "ALT+n", function() { color_normals = !color_normals;	gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);	} );
	shortcut.add( "ALT+a", function() { animate = !animate; } );
	
	shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );
	shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );	
}

function update_camera( self, animation_delta_time )
	{
		var leeway = 70, border = 50;
		var degrees_per_frame = .0002 * animation_delta_time;
		var meters_per_frame  = .01 * animation_delta_time;
																					// Determine camera rotation movement first
		var movement_plus  = [ movement[0] + leeway, movement[1] + leeway ];		// movement[] is mouse position relative to canvas center; leeway is a tolerance from the center.
		var movement_minus = [ movement[0] - leeway, movement[1] - leeway ];
		var outside_border = false;
		
		for( var i = 0; i < 2; i++ )
			if ( Math.abs( movement[i] ) > canvas_size[i]/2 - border )	outside_border = true;		// Stop steering if we're on the outer edge of the canvas.

		for( var i = 0; looking && outside_border == false && i < 2; i++ )			// Steer according to "movement" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

// *******************************************************	
// display(): called once per frame, whenever OpenGL decides it's time to redraw.

function degree_to_radian(angle) 
{
	return angle * Math.PI / 180;
}

//Pat's global constants


//Pat's angle variables declaration and initialization
	var leg_angle = 30;
	var wing_angle = 15;
	//var wing_angle = 30+ 45 * Math.sin(degree_to_radian (this.graphicsState.animation_time/50));
	//Scope problem!!! this.graphicsState.animation_time can only be used inside Animation.prototype functions.
	var trunk_angle = 5;
	var bee_rotation = 0;
	var bee_up_down = 0;
	var temp_bird;
//Pat's materials
		var bee_tail_mat = new Material( vec4( 1,1,0,1 ),1, 1, 1, 40); //yellowPlastic
		var bee_head_mat = new Material( vec4( 0.541, 0.169, 0.886,1 ),1, 1, 1, 40); //violet purple
		var g_mat = new Material( vec4( 0.4,0.4,0.4,1 ), 1, 0.5, 0.5, 40 ); // dark Grey
		var bee_legs_mat = new Material( vec4( 0.15,0.15,0.15,1 ), 1, 0.5, 0.5, 40 ); // dark Grey
		var bee_body_mat = new Material( vec4( 0.2,0.2,0.2,1 ), 1, 1.5, 1.5, 40 ); // dark Grey
		var bee_wings_mat = new Material( vec4( 0.753, 0.753, 0.753, 1 ), 1, 1, 1, 40 ); // Light grey
		var tree_trunk_mat = new Material( vec4( 0.545, 0.271, 0.075, 1 ), 1, 1, 1, 40 ); // Brown
		var tree_leaf_mat = new Material( vec4( 1,0,0,1 ), 1, 1, 1, 40 ); //red
		var ground_mat = new Material( vec4( 0, 0.502, 0, 1 ), 1, 1, 1, 40 ); 

//Pat's helper functions
Animation.prototype.draw_bee_head = function(model_transform) 
{
	model_transform = mult (model_transform, scale(0.5, 0.5, 0.5));
	this.m_sphere.draw( this.graphicsState, model_transform, bee_head_mat);
	return model_transform;
}

Animation.prototype.draw_bee_body = function(model_transform) 
{
	model_transform = mult (model_transform, scale(2, 1, 1));
	this.m_cube.draw(this.graphicsState, model_transform, bee_body_mat);
	return model_transform;
}

Animation.prototype.draw_bee_tail = function(model_transform) //draw a oval sphere with of (2, 0.8, 0.8)
{
	model_transform = mult(model_transform, scale( 2, 0.8, 0.8));
	this.m_sphere.draw(this.graphicsState, model_transform, bee_tail_mat);
	return model_transform;
}


Animation.prototype.draw_bee_leg = function(model_transform) //draw a SINGLE leg of the bee
{
	leg_angle = 30 + 45 * Math.sin(degree_to_radian (this.graphicsState.animation_time/10));

	

	model_transform = mult(model_transform, rotation(-leg_angle, 1, 0, 0));
	model_transform = mult(model_transform, translation(0, -0.5, 0));
	var temp_model1 = model_transform;
	model_transform = mult(model_transform, scale(0.2, 1, 0.2));
	this.m_cube.draw(this.graphicsState, model_transform, bee_legs_mat);

	model_transform = temp_model1;
	model_transform = mult(model_transform, translation(0, -0.5, 0));
	model_transform = mult(model_transform, rotation(leg_angle + 15, 1, 0, 0));

	model_transform = mult(model_transform, translation(0, -0.5, 0));
	model_transform = mult(model_transform, scale(0.2, 1, 0.2));
	this.m_cube.draw(this.graphicsState, model_transform, bee_legs_mat);

	return model_transform;
}

Animation.prototype.draw_bee_wing = function(model_transform) //draw a SINGLE wing of the bee
{
	wing_angle = 30 + 45 * Math.sin(degree_to_radian (this.graphicsState.animation_time/10));

	model_transform = mult(model_transform, rotation(-wing_angle, 1, 0, 0));
	model_transform = mult(model_transform, translation (0, 0, 2));

	model_transform = mult(model_transform, scale(1, 0.2, 4));
	this.m_cube.draw(this.graphicsState, model_transform, bee_wings_mat);	

	return model_transform;
}


Animation.prototype.draw_bee_whole = function(model_transform) 
{
		
		this.draw_bee_head(model_transform); //draw head

		model_transform = mult( model_transform, translation( 1.5, 0, 0) );	//draw body
		this.draw_bee_body(model_transform);

		var temp_model2 = model_transform; //memorize the center of the body

		model_transform = mult( model_transform, translation( 3, 0, 0) ); //draw tail
		this.draw_bee_tail(model_transform);

		model_transform = temp_model2;

		model_transform = mult( model_transform, translation(-0.5, -0.5, 0.5) ); // draw left front leg
		this.draw_bee_leg(model_transform);	

		model_transform = mult( model_transform, translation( 0.5, 0, 0) );	// draw left middle leg
		this.draw_bee_leg(model_transform);	
		
		model_transform = mult( model_transform, translation( 0.5, 0, 0) );	// draw left rear leg
		this.draw_bee_leg(model_transform);	

		model_transform = mult( model_transform, rotation(180, 0, 1, 0) ); // Rotate to the other side
		//Perspective changed after rotation!!!

		model_transform = mult( model_transform, translation( 0, 0, 0.5) ); // Move to the edge of the other side 
		this.draw_bee_leg(model_transform);	//draw right rear leg
		

		model_transform = mult( model_transform, translation( 0.5, 0, 0) );	// draw right middle leg
		this.draw_bee_leg(model_transform);	

		model_transform = mult( model_transform, translation( 0.5, 0, 0) );	// draw right front leg
		this.draw_bee_leg(model_transform);	

		model_transform = temp_model2;//go back to the center of the body

		model_transform = mult( model_transform, translation(0, 0.5, 0.5) ); //Move to the upper left edge of body
		this.draw_bee_wing (model_transform); //draw left wing

		model_transform = temp_model2;

		model_transform = mult( model_transform, translation(0, 0.5, -0.5) ); //Move to the upper right edge of body
		model_transform = mult( model_transform, rotation(180, 0, 1, 0) ); // Rotate to the other side
		this.draw_bee_wing (model_transform); //draw right wing

}


Animation.prototype.draw_ground = function(model_transform) 
{
	model_transform = mult(model_transform, scale(1000, 0.3, 1000));
	model_transform = mult( model_transform, rotation(90, 0,0,1 ) );
	this.m_strip.draw(this.graphicsState, model_transform, desert);
	return model_transform;
}


Animation.prototype.draw_tree = function(model_transform) 
{
	//draw trunk, trunk consists of 8 cubes

	trunk_angle =  4 * Math.sin(degree_to_radian (this.graphicsState.animation_time/30));
	var angle_around_bottomcenter = this.graphicsState.animation_time/60;
	model_transform = mult(model_transform, rotation(angle_around_bottomcenter, 0, 1, 0));

	for (var i = 0; i < 8; i++) {
			model_transform = mult(model_transform, rotation(trunk_angle, 0, 0, 1));
			model_transform = mult(model_transform, translation(0, 1, 0));
			var temp = model_transform;
			model_transform = mult(model_transform, scale(0.5, 2, 0.5));
			this.m_cube.draw(this.graphicsState, model_transform, tree_trunk_mat);
			model_transform = temp; 
			model_transform = mult(model_transform, translation(0, 1, 0));
	}
	//finished draw trunk

	model_transform = mult(model_transform, scale(2, 2, 2)); // scale for leaf
	//this.m_sphere.draw(this.graphicsState, model_transform, tree_leaf_mat); //draw leaf
	this.m_pyramid.draw(this.graphicsState, model_transform, bee_legs_mat); 
	return model_transform;

}


Animation.prototype.draw_bird_body = function(model_transform) 
{
	var stack3 = new Array;
	stack3.push(model_transform);
	stack3.push(model_transform);
	stack3.push(model_transform);
	model_transform = mult(model_transform, scale( 6, 3, 3));
	this.m_sphere.draw(this.graphicsState, model_transform, body_tex);

	 model_transform = stack3.pop();
	 model_transform = mult( model_transform, translation( 10, 0, 0 ));
	 stack3.push(model_transform);
	 model_transform = mult(model_transform, scale( 12, 1, 1));
	 this.m_cube.draw(this.graphicsState, model_transform, body_tex1);

	 model_transform = stack3.pop();
	 model_transform = mult( model_transform, translation( 6.745, 0.92, 0 ));
	 model_transform = mult(model_transform, rotation(45, 0, 0, 1));
	 model_transform = mult(model_transform, scale( 3, 1, 1));
	 this.m_cube.draw(this.graphicsState, model_transform, body_tex1);

	 model_transform = stack3.pop();


	return model_transform;
}

Animation.prototype.draw_bird_leg = function(model_transform) 
{
	var stack4 = new Array();
	stack4.push(model_transform);
	stack4.push(model_transform);
	model_transform = mult (model_transform, scale(8, 0.2, 0.5));
	this.m_cube.draw(this.graphicsState, model_transform, bee_body_mat);

	model_transform = stack4.pop();
	model_transform = mult (model_transform, translation(-2, 0.65, 0));
	model_transform = mult(model_transform, rotation(90, 1, 0, 0));
	model_transform = mult (model_transform, scale(0.15, 0.15, 1.5));
	this.m_cylinder.draw(this.graphicsState, model_transform, bee_body_mat);
	model_transform = mult (model_transform, translation(26.67, 0, 0));
	this.m_cylinder.draw(this.graphicsState, model_transform, bee_body_mat);

}

Animation.prototype.draw_body_screw = function(model_transform) 
{
	
	model_transform = mult(model_transform, rotation(this.graphicsState.animation_time/3, 0, 1, 0));
	
	var stack1 = new Array();
	stack1.push(model_transform);
	stack1.push(model_transform);
	model_transform = mult (model_transform, scale(0.5, 1, 0.5));
	model_transform = mult(model_transform, rotation(90, 1, 0, 0));
	this.m_cylinder.draw(this.graphicsState, model_transform, bee_body_mat); //central axis of rotation of screws

	
	model_transform = stack1.pop();
	model_transform = mult (model_transform, translation(0, 0.3, 0));
	model_transform = mult (model_transform, scale(18, 0.2, 1.5));
	this.m_cube.draw(this.graphicsState, model_transform, bee_body_mat);

	 model_transform = stack1.pop();
	 model_transform = mult (model_transform, translation(0, 0.3, 0));
	 model_transform = mult(model_transform, rotation(90, 0, 1, 0));
	 model_transform = mult (model_transform, scale(18, 0.2, 1.5));
	 this.m_cube.draw(this.graphicsState, model_transform, bee_body_mat);
	return model_transform;
}

Animation.prototype.draw_tail_screw = function(model_transform) 
{
	model_transform = mult(model_transform, rotation(this.graphicsState.animation_time/3, 0, 1, 0));

	var stack1 = new Array();
	stack1.push(model_transform);
	stack1.push(model_transform);
	model_transform = mult (model_transform, scale(0.5, 1.8, 0.5));
	model_transform = mult(model_transform, rotation(90, 1, 0, 0));
	this.m_cylinder.draw(this.graphicsState, model_transform, bee_legs_mat); //central axis of rotation of screws

	
	model_transform = stack1.pop();
	model_transform = mult (model_transform, translation(0, 0.5, 0));
	model_transform = mult (model_transform, scale(18, 0.2, 2));
	this.m_cube.draw(this.graphicsState, model_transform, bee_legs_mat);

	 model_transform = stack1.pop();
	 model_transform = mult (model_transform, translation(0, 0.5, 0));
	 model_transform = mult(model_transform, rotation(90, 0, 1, 0));
	 model_transform = mult (model_transform, scale(18, 0.2, 2));
	 this.m_cube.draw(this.graphicsState, model_transform, bee_legs_mat);
	return model_transform;
}

Animation.prototype.draw_bird = function(model_transform) 
{
		var stack2 = new Array();
		stack2.push(model_transform);
		stack2.push(model_transform);
		this.draw_bird_body(model_transform);
		
		model_transform = mult( model_transform, translation( 0, 3.5, 0 ) );
		this.draw_body_screw(model_transform); // draw main screw
		
		model_transform = stack2.pop();
		model_transform = mult( model_transform, translation( 17.2, 1.5, 0.7 ) );
		model_transform = mult(model_transform, rotation(90, 1, 0, 0));
		model_transform = mult (model_transform, scale(0.3, 0.3, 0.3));
		this.draw_tail_screw(model_transform); // draw main screw

		model_transform = stack2.pop();
		model_transform = mult( model_transform, translation( 0, -4, 1 ) );
		this.draw_bird_leg(model_transform);
		model_transform = mult( model_transform, translation( 0, 0, -2 ) );
		this.draw_bird_leg(model_transform);
}

Animation.prototype.draw_tower = function(model_transform) 
{
		model_transform = mult (model_transform, scale(2, 2, 2));
		this.m_pyramid.draw(this.graphicsState, model_transform, bricks); 
		model_transform = mult( model_transform, translation( 0, -3, 0 ) );
		model_transform = mult(model_transform, rotation(90, 1, 0, 0));
		model_transform = mult (model_transform, scale(0.7, 0.7, 4))
		this.m_cylinder.draw(this.graphicsState, model_transform, gray1); 
}

Animation.prototype.draw_castle = function(model_transform) 
{
		
		var stack5 = new Array();
		stack5.push(model_transform);
		stack5.push(model_transform);
		stack5.push(model_transform);
		stack5.push(model_transform);
		stack5.push(model_transform);
		stack5.push(model_transform);

		model_transform = mult (model_transform, scale(3, 3, 3));
		this.m_cube.draw(this.graphicsState, model_transform, gray1);

		model_transform = mult( model_transform, translation( 0, 1.35, 0 ) );
		model_transform = mult (model_transform, scale(0.8, 1, 0.8));
		model_transform = mult(model_transform, rotation(-90, 1, 0, 0));
		this.m_fan.draw(this.graphicsState, model_transform, bricks); 

		model_transform = stack5.pop();
		model_transform = mult( model_transform, translation( 0, -1.5-2, 0 ) );
		model_transform = mult (model_transform, scale(6, 4, 6));
		this.m_cube.draw(this.graphicsState, model_transform, gray1);

		model_transform = stack5.pop();
		model_transform = mult( model_transform, translation( 0, -1.5-2-5, 0 ) );
		model_transform = mult (model_transform, scale(12, 6, 12));
		this.m_cube.draw(this.graphicsState, model_transform, gray);

		model_transform = stack5.pop();
		model_transform = mult( model_transform, translation( 0, -1.5-2-5-7.05, 0 ) );
		model_transform = mult (model_transform, scale(20, 8, 20));
		this.m_cube.draw(this.graphicsState, model_transform, gray);

		model_transform = stack5.pop();
		model_transform = mult( model_transform, translation( 0, -1.5-2-5-7.05-4.32, 0 ) );
		model_transform = mult (model_transform, scale(40, 0.5, 40));
		this.m_cube.draw(this.graphicsState, model_transform, g_mat);

		 model_transform = stack5.pop();
		 model_transform = mult( model_transform, translation( -11, -1.5-2-3, 11 ) );
		model_transform = mult (model_transform, scale(1.3, 1.3, 1.3));
		 this.draw_tower( model_transform);

		 model_transform = mult( model_transform, translation( 16.9, 0, 0 ) );
		 this.draw_tower( model_transform);

		  model_transform = mult( model_transform, translation( 0, 0, -16.9 ) );
		 this.draw_tower( model_transform);

		  model_transform = mult( model_transform, translation( -16.9, 0, 0 ) );
		 this.draw_tower( model_transform);

		


}

Animation.prototype.display = function(time)
	{
		if(!time) time = 0;
		this.animation_delta_time = time - prev_time;
		if(animate) this.graphicsState.animation_time += this.animation_delta_time;
		prev_time = time;
		
		update_camera( this, this.animation_delta_time );
			
		this.basis_id = 0;
		
		var model_transform = mat4(); // center of the universe

////My codeing starts here
		
		this.m_text.set_string( "Controls:" );
		model_transform = mult( model_transform, translation( 0, 5, 0) );
		model_transform = mult(model_transform, rotation(bee_rotation, 0, 1, 0));
		model_transform = mult (model_transform, scale(10, 10, 10));
		this.m_text.draw( this.graphicsState, model_transform, true, vec4(0,0,0,1) );

		model_transform = mat4(); 
		model_transform = mult( model_transform, translation( 0, -30, 0 ) );	
		this.draw_ground(model_transform);

		
		model_transform = mat4(); //go back to center of the universe
		model_transform = mult( model_transform, translation( 0, -3, 0) );
		//model_transform = mult (model_transform, scale(0.3, 0.3, 0.3));
		//this.draw_tree(model_transform);
		//this.draw_tower(model_transform);
		this.draw_castle(model_transform);


		
		var model_transform = mat4(); //go back to center of the universe
		model_transform = mult( model_transform, translation( 0, 0, 0 ) );
		
		bee_up_down = 3 * Math.sin(this.graphicsState.animation_time/600);
		model_transform = mult(model_transform, translation(0, bee_up_down , 0));

		bee_rotation = -(0 + this.graphicsState.animation_time/43.5);
		model_transform = mult(model_transform, rotation(bee_rotation, 0, 1, 0));
		 temp_bird = model_transform;
		model_transform = mult(model_transform, translation(35, 0, 0)); //radius
		model_transform = mult(model_transform, rotation(90, 0, 1, 0));

		

		//this.draw_bee_whole(model_transform);	

		//model_transform = mat4(); //go back to center of the universe
		//model_transform = mult( model_transform, translation( 10, -2, 0 ) );
		model_transform = mult (model_transform, scale(0.6, 0.6, 0.6));
		this.draw_bird(model_transform);


		
		this.graphicsState.camera_transform = lookAt( vec3(Math.cos(16000 * .0004) * 80, 15, Math.sin(16000 * .0004) * 80), vec3(0,0,0), vec3(0,1,0) );

		if( animate)
		{
			if (this.graphicsState.animation_time < 16000)

				this.graphicsState.camera_transform = lookAt( vec3(Math.cos(16000 * .0004) * 80, 15, Math.sin(16000 * .0004) * 80), vec3(0,0,0), vec3(0,1,0) );

		 //this.graphicsState.camera_transform = lookAt( vec3(0,15,80), vec3(0,0,0), vec3(0,1,0) );
		//this.graphicsState.camera_transform = lookAt( vec3(temp_bird[0]+200,temp_bird[1]+200,temp_bird[2]+200), vec3(0,0,0), vec3(0,1,0) );
		
		//this.graphicsState.camera_transform = lookAt(vec3(this.graphicsState.animation_time/40+50, 30, this.graphicsState.animation_time/40+50), vec3(0,0,0), vec3(0,1,0) ); 
		
		else if (this.graphicsState.animation_time < 32000)
			//this.graphicsState.camera_transform = lookAt( vec3(80,15,20), vec3(0,0,0), vec3(0,1,0) );
		this.graphicsState.camera_transform = lookAt(vec3(Math.cos(this.graphicsState.animation_time * .0004) * 80, 15, Math.sin(this.graphicsState.animation_time * .0004) * 80), vec3(0,0,0), vec3(0,1,0) ); 
		
		else if (this.graphicsState.animation_time < 40000)
			this.graphicsState.camera_transform = lookAt(vec3(Math.cos(this.graphicsState.animation_time * .0004-3.14159/2) * 80, 10, Math.sin(this.graphicsState.animation_time * .0004 -3.14159/2) * 80), vec3(0,0,0), vec3(0,1,0) );

		else
			this.graphicsState.camera_transform = lookAt(vec3(0,5,0), vec3(Math.cos(this.graphicsState.animation_time * .0004) * 80, 5, Math.sin(this.graphicsState.animation_time * .0004 ) * 80), vec3(0,1,0) );
		}
	}	



Animation.prototype.update_strings = function( debug_screen_strings )		// Strings this particular class contributes to the UI
{
	debug_screen_strings.string_map["thrust"] = " ";
	debug_screen_strings.string_map["time"] = "Animation Time: " + this.graphicsState.animation_time/1000 + "s";
	debug_screen_strings.string_map["basis"] = "Frame rate: " + (1/(this.animation_delta_time/1000)).toFixed(1) ;
	debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	
	//debug_screen_strings.string_map["frame_rate"] = "Frame rate: " + 1/(this.animation_delta_time/1000)/ + "ms";
}