/*
	Supersized - Fullscreen Slideshow jQuery Plugin
	Picasa Edition Version 1.0.3
	By Benoit De Boeck (www.worldinmyeyes.be), adapted from the Flickr Edition v.1.1.2 of Supersized
	
	www.buildinternet.com/project/supersized
	By Sam Dunn / One Mighty Roar (www.onemightyroar.com)
	Released under MIT License / GPL License
*/

(function($){

	//Add in Supersized elements
	$(document).ready(function() {
		$('body').prepend('<div id="supersized-loader"></div>').prepend('<div id="supersized"></div>');
	});
	
	//Resize image on ready or resize
	$.supersized = function( options ) {
		
		//Default settings
		var settings = {
			
			//Functionality
			slideshow               :   1,		//Slideshow on/off
			autoplay				:	1,		//Slideshow starts playing automatically
			start_slide             :   1,		//Start slide (0 is random)
			random					: 	0,		//Randomize slide order (Ignores start slide)
			slide_interval          :   5000,	//Length between transitions
			transition              :   1, 		//0-None, 1-Fade, 2-Slide Top, 3-Slide Right, 4-Slide Bottom, 5-Slide Left, 6-Carousel Right, 7-Carousel Left
			transition_speed		:	750,	//Speed of transition
			new_window				:	1,		//Image links open in new window/tab
			pause_hover             :   0,		//Pause slideshow on hover
			keyboard_nav            :   1,		//Keyboard navigation on/off
			performance				:	1,		//0-Normal, 1-Hybrid speed/quality, 2-Optimizes image quality, 3-Optimizes transition speed // (Only works for Firefox/IE, not Webkit)
			image_protect			:	1,		//Disables image dragging and right click with Javascript
			image_path				:	'img/', //Default image path
			
			//Size & Position
			min_width		        :   0,		//Min width allowed (in pixels)
			min_height		        :   0,		//Min height allowed (in pixels)
			vertical_center         :   1,		//Vertically center background
			horizontal_center       :   1,		//Horizontally center background
                        fit_always		:   0,		// Image will never exceed browser width or height (Ignores min. dimensions)
			fit_portrait         	:   0,		//Portrait images will not exceed browser height
			fit_landscape			:   0,		//Landscape images will not exceed browser width  
			
			//Components
			navigation              :   1,		//Slideshow controls on/off
			thumbnail_navigation    :   0,		//Thumbnail navigation
			slide_counter           :   1,		//Display slide numbers
			slide_captions          :   1,		//Slide caption (Pull from "title" in slides array)
			
			//Picasa
			source					:	1,		//1-Album, 2-User, 3-Tags
			album                   :   '', 	//Picasa Album name (found in URL)
			user					:	'',	//Picasa user name (will get the last total_slides images from that user)
			tags					: 	'',    //List of tags (comma- or +-separated = AND, |-separated = OR)
			total_slides			:	100,	//How many pictures to pull (Between 1-500)
			image_size              :   1280,	//Picasa image Size - 94, 110, 128, 200, 220, 288, 320, 400, 512, 576, 640, 720, 800, 912, 1024, 1152, 1280, 1440, 1600, d (original image size)) - Picasa API will return the largest size available if image_size is larger than original
			slides 					: 	[{}],	//Initiate slides array
			sort_by					:    1,		//0-None, 1-Date published, 2-Date updated
			sort_direction			:    0,		//0-descending, 1-ascending
 			auth_key				:	''		//Picasa Author Key (found in URL)
			
    	};
		
		//Default elements
		var element = $('#supersized');		//Supersized container
		var pauseplay = '#pauseplay';		//Pause/Play
		
		//Combine options with default settings
		if (options) {
			var options = $.extend(settings, options);	//Pull from both defaults and supplied options
		}else{
			var options = $.extend(settings);			//Only pull from default settings		
		}
		
		//General slideshow variables
		var inAnimation = false;	//Prevents animations from stacking
		var isPaused = false;	//Tracks paused on/off
		var image_path = options.image_path;		//Default image path for navigation control buttons
                var animate_translate3d = false; // Animate option for Apple devices
		
                // Enhances the animate() function of jquery to get better results on Apple devices (iPad, iPhone)
		if(isAppleDevice()) {
		animate_translate3d = 'true';
		}
		else {
		animate_translate3d = 'false';		
		}
		
		//Determine starting slide (random or defined)
		if (options.start_slide){
			var currentSlide = options.start_slide - 1;	//Default to defined start slide
		}else{
			var currentSlide = Math.floor(Math.random()*options.total_slides);	//Generate random slide number based on total slides defined
		}
		
		//If links should open in new window
		var linkTarget = options.new_window ? ' target="_blank"' : '';
		
		//Set slideshow quality (Supported only in FF and IE, no Webkit)
		if (options.performance == 3){
			element.addClass('speed'); 		//Faster transitions
		} else if ((options.performance == 1) || (options.performance == 2)){
			element.addClass('quality');	//Higher image quality
		}    	
    	

	var sort_by = '';
	switch(options.sort_by){
		case 1:
			sort_by = 'published.$t';
			break;
		case 2:
			sort_by = 'updated.$t';
			break;
		default:
			sort_by = 'published.$t';
			break;
	}

    	//Determine where to pull images from
			var authkey = '';
            if (options.auth_key){
               authkey = '&authkey=' + options.auth_key;
            }

    	switch(options.source){
		    		
	    	case 1:		//From an Album
	    		var picasaURL = 'http://picasaweb.google.com/data/feed/api/user/' + options.user + '/album/' + options.album + '?kind=photo&access=visible' + authkey + '&alt=json-in-script&max-results=' + options.total_slides + '&thumbsize=150c&imgmax=' + options.image_size + '&type=image/jpeg&fields=entry(published,updated,content(@src),media:group(media:thumbnail(@url)),media:group(media:description),link[@rel=%27http%3A%2F%2Fschemas%2Egoogle%2Ecom%2Fphotos%2F2007%23canonical%27](@href))&callback=?';
	    		break;
	    	case 2:		//From a User
	    		var picasaURL = 'http://picasaweb.google.com/data/feed/api/user/' + options.user + '?kind=photo&access=visible' + authkey + '&alt=json-in-script&max-results=' + options.total_slides + '&thumbsize=150c&imgmax=' + options.image_size + '&type=image/jpeg&fields=entry(published,updated,content(@src),media:group(media:thumbnail(@url)),media:group(media:description),link[@rel=%27http%3A%2F%2Fschemas%2Egoogle%2Ecom%2Fphotos%2F2007%23canonical%27](@href))&callback=?';
	    		break;
			case 3:		//From a Tag
	    		var picasaURL = 'http://picasaweb.google.com/data/feed/api/all?tag=' + options.tags + '&alt=json&max-results=' + options.total_slides + '&thumbsize=150c&imgmax=' + options.image_size +  '&type=image/jpeg&fields=entry(published,updated,content(@src),media:group(media:thumbnail(@url)),media:group(media:description),link[@rel=%27http%3A%2F%2Fschemas%2Egoogle%2Ecom%2Fphotos%2F2007%23canonical%27](@href))&callback=?';
	    		break;
	    }


		var picasaLoaded = false;
		$.getJSON(picasaURL, picasa);

		function picasa(data){
				
				//Check if images are from a album
				var picasaResults = data.feed.entry;
			console.log("options.sort_by = " + options.sort_by);	
			console.log("options.sort_direction = " + options.sort_direction);	
				if(options.sort_by) {
					switch(options.sort_direction){ //sorts the JSON object
						case 0: //sort descending
							sortJsonArrayByProp(picasaResults, sort_by);
							picasaResults.reverse();
							break;
						case 1: //sort ascending
							sortJsonArrayByProp(picasaResults, sort_by);
							break;
						default:
							sortJsonArrayByProp(picasaResults, sort_by);
							picasaResults.reverse();
							break;
					}
				}
    			//Build slides array from picasa request
    			$.each(picasaResults, function(i,item){
    			
    			    //create image urls
    			    var photoURL = item.content.src;
    			    var thumbURL = item.media$group.media$thumbnail[0].url;
					var photoTitle = item.media$group.media$description.$t;
    			   	var	photoLink = item.link[0].href;
    			   	
    			    if (i == 0){
    			    	options.slides.splice(0,1,{ image : photoURL, thumb : thumbURL, title : photoTitle , url : photoLink });
    			    }else{
    			    	options.slides.push({ image : photoURL, thumb : thumbURL, title : photoTitle , url : photoLink });
    			    } 
    			 });
    			
    			//Shuffle slide order if needed		
				if (options.random){
					arr = options.slides;
					for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);	//Fisher-Yates shuffle algorithm (jsfromhell.com/array/shuffle)
				    options.slides = arr;
				}
    			
				
    			/***Load initial set of images***/
    			
				if (options.slides.length > 1){
					//Set previous image
					currentSlide - 1 < 0  ? loadPrev = options.slides.length - 1 : loadPrev = currentSlide - 1;	//If slide is 1, load last slide as previous
					var imageLink = (options.slides[loadPrev].url) ? "href='" + options.slides[loadPrev].url + "'" : "";
					$("<img/>").attr("src", options.slides[loadPrev].image).appendTo(element).wrap('<a ' + imageLink + linkTarget + '></a>');
				}
				
				//Set current image
				imageLink = (options.slides[currentSlide].url) ? "href='" + options.slides[currentSlide].url + "'" : "";
				$("<img/>").attr("src", options.slides[currentSlide].image).appendTo(element).wrap('<a class="activeslide" ' + imageLink + linkTarget + '></a>');
			
				if (options.slides.length > 1){
					//Set next image
					currentSlide == options.slides.length - 1 ? loadNext = 0 : loadNext = currentSlide + 1;	//If slide is last, load first slide as next
					imageLink = (options.slides[loadNext].url) ? "href='" + options.slides[loadNext].url + "'" : "";
					$("<img/>").attr("src", options.slides[loadNext].image).appendTo(element).wrap('<a ' + imageLink + linkTarget + '></a>');
				}
				
				/***End load initial images***/
				picasaLoaded = true;
    		}
			
			/**
			* Sorts an array of json objects by some common property, or sub-property.
			* @param {array} objArray
			* @param {array|string} prop Dot-delimited string or array of (sub)properties
			*/
			function sortJsonArrayByProp(objArray, prop){
				if (arguments.length<2){
					throw new Error("sortJsonArrayByProp requires 2 arguments");
				}
				if (objArray && objArray.constructor===Array){
					var propPath = (prop.constructor===Array) ? prop : prop.split(".");
					objArray.sort(function(a,b){
						for (var p in propPath){
							if (a[propPath[p]] && b[propPath[p]]){
								a = a[propPath[p]];
								b = b[propPath[p]];
							}
						}
						// convert numeric strings to integers
//						a = a.match(/^\d+$/) ? +a : a;
//						b = b.match(/^\d+$/) ? +b : b;
						return ( (a < b) ? -1 : ((a > b) ? 1 : 0) );
					});
				}
			}

			
		element.hide();					//Hide image to be faded in
		$('#controls-wrapper').hide();	//Hide controls to be displayed
		
		//Account for loading in IE
		$(document).ready(function() {
			resizenow();
		});
		
		$(window).load(function() {
			ready();
		});
		
		var ready = function(){
			if(picasaLoaded) {
				loadFunc();
			} else {
				setTimeout(ready, 100);
			}
		};
		
		var loadFunc = function(){
			
			$('#supersized-loader').hide();		//Hide loading animation
			element.fadeIn('fast');				//Fade in background
			$('#controls-wrapper').show();		//Display controls
			
			//Display thumbnails
			if (options.thumbnail_navigation == 1){
			
				//Load previous thumbnail
				currentSlide - 1 < 0  ? prevThumb = options.slides.length - 1 : prevThumb = currentSlide - 1;
				$('#prevthumb').show().html($("<img/>").attr("src", options.slides[prevThumb].thumb));
				
				//Load next thumbnail
				currentSlide == options.slides.length - 1 ? nextThumb = 0 : nextThumb = currentSlide + 1;
				$('#nextthumb').show().html($("<img/>").attr("src", options.slides[nextThumb].thumb));
		
			}
			
			resizenow();	//Resize background image
			
			if (options.slide_captions) {
				var slidecaptionWidth = $("body").width() - 500; 
				$('#slidecaption').css("width", slidecaptionWidth); //Adjust width of slidecaption to avoid it pushing the controls out of the visible area
				$('#slidecaption').html(options.slides[currentSlide].title);		//Pull caption from array
			}
			if (!(options.navigation)) $('#navigation').hide();	//Display navigation
			
			
			//Start slideshow if enabled
			if (options.slideshow){
			
				if (options.slide_counter){	//Initiate slide counter if active
					
					$('#slidecounter .slidenumber').html(currentSlide + 1);		//Pull initial slide number from options		
	    			$('#slidecounter .totalslides').html(options.slides.length);	//Pull total from length of array
	    		
	    		}
	    		
	    		slideshow_interval = setInterval(nextslide, options.slide_interval);	//Initiate slide interval
				
				//Prevent slideshow if autoplay disabled
	    		if (!(options.autoplay)){
					
					clearInterval(slideshow_interval);	//Stop slideshow
					isPaused = true;	//Mark as paused
					
					if ($(pauseplay).attr('src')) $(pauseplay).attr("src", image_path + "play_dull.png");	//If pause play button is image, swap src
    				
				}
				
				//Thumbnail Navigation
				if (options.thumbnail_navigation){
					
					//Next thumbnail clicked
					$('#nextthumb').click(function() {
					
				    	if(inAnimation) return false;		//Abort if currently animating
				    	
					    clearInterval(slideshow_interval);	//Stop slideshow
					    nextslide(element, options);		//Go to next slide
					    if(!(isPaused)) slideshow_interval = setInterval(nextslide, options.slide_interval);	//If not paused, resume slideshow
					    
					    return false;
					    
				    });
				    
				    //Previous thumbnail clicked
				    $('#prevthumb').click(function() {
				    
				    	if(inAnimation) return false;		//Abort if currently animating
				    	
					    clearInterval(slideshow_interval);	//Stop slideshow
					    prevslide(element, options);		//Go to previous slide
					    if(!(isPaused)) slideshow_interval = setInterval(nextslide, options.slide_interval);	//If not paused, resume slideshow
					    
					    return false;
					    
				    });
				    
				}
				
				//Navigation controls
				if (options.navigation){
				
					$('#navigation a').click(function(){  
   						$(this).blur();  
   						return false;  
   					});
					
					//Next button clicked
				    $('#nextslide').click(function() {
				    
				    	if(inAnimation) return false;		//Abort if currently animating
				    	
					    clearInterval(slideshow_interval);	//Stop slideshow
					    nextslide(element, options);		//Go to next slide
					    if(!(isPaused)) slideshow_interval = setInterval(nextslide, options.slide_interval);	//If not paused, resume slideshow
					    
					    return false;
					    
				    });
				    
				    //If next slide button is image
				    if ($('#nextslide').attr('src')){
				    	
					    $('#nextslide').mousedown(function() {
						   	$(this).attr("src", image_path + "forward.png");
						});
						$('#nextslide').mouseup(function() {
						    $(this).attr("src", image_path + "forward_dull.png");
						});
						$('#nextslide').mouseout(function() {
						    $(this).attr("src", image_path + "forward_dull.png");
						});
				    
				    }
				    
				    //Previous button clicked
				    $('#prevslide').click(function() {
				    
				    	if(inAnimation) return false;		//Abort if currently animating
				    	
					    clearInterval(slideshow_interval);	//Stop slideshow
					    prevslide(element, options);		//Go to previous slide
					    if(!(isPaused)) slideshow_interval = setInterval(nextslide, options.slide_interval);	//If not paused, resume slideshow
					    
					    return false;
					    
				    });
					
					//If previous slide button is image
					if ($('#prevslide').attr('src')){
										
						$('#prevslide').mousedown(function() {
						    $(this).attr("src", image_path + "back.png");
						});
						$('#prevslide').mouseup(function() {
						    $(this).attr("src", image_path + "back_dull.png");
						});
						$('#prevslide').mouseout(function() {
						    $(this).attr("src", image_path + "back_dull.png");
						});
					
					}
					
				    //Pause/play element clicked
				    $(pauseplay).click(function() {
						
						if(inAnimation) return false;		//Abort if currently animating
						
						if (isPaused){
							
							if ($(pauseplay).attr('src')) $(pauseplay).attr("src", image_path + "pause_dull.png");	//If image, swap to pause
							
							//Resume slideshow
							isPaused = false;
				        	slideshow_interval = setInterval(nextslide, options.slide_interval);
				        	  
			        	}else{
			        		
			        		if ($(pauseplay).attr('src')) $(pauseplay).attr("src", image_path + "play_dull.png");	//If image, swap to play
			        		
			        		//Stop slideshow
			        		clearInterval(slideshow_interval);	
			        		isPaused = true;
			       		
			       		}
					    
					    return false;
					    
				    });
				    
				}	//End navigation controls
				
			}	//End slideshow options
			
		};		//End window load
				
		//Keyboard Navigation
		if (options.keyboard_nav){
		
			$(document.documentElement).keydown(function (event) {
				
				if ((event.keyCode == 37) || (event.keyCode == 40)) { //Left Arrow or Down Arrow
					
					if ($('#prevslide').attr('src')) $('#prevslide').attr("src", image_path + "back.png");		//If image, change back button to active
				
				} else if ((event.keyCode == 39) || (event.keyCode == 38)) { //Right Arrow or Up Arrow
				
					if ($('#nextslide').attr('src')) $('#nextslide').attr("src", image_path + "forward.png");	//If image, change next button to active
				
				}
				
			});
			
			$(document.documentElement).keyup(function (event) {
			
				clearInterval(slideshow_interval);	//Stop slideshow, prevent buildup
				
				if ((event.keyCode == 37) || (event.keyCode == 40)) { //Left Arrow or Down Arrow
					
					if ($('#prevslide').attr('src')) $('#prevslide').attr("src", image_path + "back_dull.png");	//If image, change back button to normal
					
					if(inAnimation) return false;		//Abort if currently animating
					    	
					clearInterval(slideshow_interval);	//Stop slideshow
					prevslide();		//Go to previous slide
					
					if(!(isPaused)) slideshow_interval = setInterval(nextslide, options.slide_interval);	//If not paused, resume slideshow
					
					return false;
				
				} else if ((event.keyCode == 39) || (event.keyCode == 38)) { //Right Arrow or Up Arrow
					
					if ($('#nextslide').attr('src')) $('#nextslide').attr("src", image_path + "forward_dull.png");	//If image, change next button to normal
					
					if(inAnimation) return false;		//Abort if currently animating
					    	
					clearInterval(slideshow_interval);	//Stop slideshow
				    nextslide();		//Go to next slide
				    
				    if(!(isPaused)) slideshow_interval = setInterval(nextslide, options.slide_interval);	//If not paused, resume slideshow
				   
				    return false;
				
				} else if (event.keyCode == 32) { //Spacebar
					
					if(inAnimation) return false;		//Abort if currently animating
					
					if (isPaused){
					
						if ($(pauseplay).attr('src')) $(pauseplay).attr("src", image_path + "pause_dull.png");	//If image, swap to pause
						
						//Resume slideshow
						isPaused = false;
			        	slideshow_interval = setInterval(nextslide, options.slide_interval);
			        	  
		        	}else{
		        		
		        		if ($(pauseplay).attr('src')) $(pauseplay).attr("src", image_path + "play_dull.png");	//If image, swap to play
		        		
		        		//Mark as paused
		        		isPaused = true;
		       		
		       		}
				    
				    return false;
				}
			
			});
		}
		
		
		//Pause when hover on image
		if (options.slideshow && options.pause_hover){
			$(element).hover(function() {
			
				if(inAnimation) return false;		//Abort if currently animating
		   			
		   			if(!(isPaused) && options.navigation){
		   				
		   				if ($(pauseplay).attr('src')) $(pauseplay).attr("src", image_path + "pause.png"); 	//If image, swap to pause
		   				clearInterval(slideshow_interval);
		   				
		   			}
		   		
		   	}, function() {
					
				if(!(isPaused) && options.navigation){
				
					if ($(pauseplay).attr('src')) $(pauseplay).attr("src", image_path + "pause_dull.png");	//If image, swap to active
					slideshow_interval = setInterval(nextslide, options.slide_interval);
				
				}
				
		   	});
		}
		
				
		//Adjust image when browser is resized
		$(window).resize(function(){
    		resizenow();
		});
		
		
		//Adjust image size
		function resizenow() {
			return element.each(function() {
		  	
		  		var t = $('img', element);
		  		
		  		//Resize each image seperately
		  		$(t).each(function(){
		  		
					var ratio = ($(this).height()/$(this).width()).toFixed(2);	//Define image ratio
					thisSlide = $(this);
					
					//Gather browser size
					var browserwidth = $(window).width();
					var browserheight = $(window).height();
					var offset;
					
					/**Resize image to proper ratio**/
                                        if (options.fit_always){	// Fit always is enabled
						if ((browserheight/browserwidth) > ratio){
							resizeWidth();
						} else {
							resizeHeight();
						}
					}else{	// Normal Resize

					if ((browserheight <= options.min_height) && (browserwidth <= options.min_width)){	//If window smaller than minimum width and height
					
						if ((browserheight/browserwidth) > ratio){
							options.fit_landscape && ratio <= 1 ? resizeWidth(true) : resizeHeight(true);	//If landscapes are set to fit
						} else {
							options.fit_portrait && ratio > 1 ? resizeHeight(true) : resizeWidth(true);		//If portraits are set to fit
						}
					
					} else if (browserwidth <= options.min_width){		//If window only smaller than minimum width
					
						if ((browserheight/browserwidth) > ratio){
							options.fit_landscape && ratio <= 1 ? resizeWidth(true) : resizeHeight();	//If landscapes are set to fit
						} else {
							options.fit_portrait && ratio > 1 ? resizeHeight() : resizeWidth(true);		//If portraits are set to fit
						}
						
					} else if (browserheight <= options.min_height){	//If window only smaller than minimum height
					
						if ((browserheight/browserwidth) > ratio){
							options.fit_landscape && ratio <= 1 ? resizeWidth() : resizeHeight(true);	//If landscapes are set to fit
						} else {
							options.fit_portrait && ratio > 1 ? resizeHeight(true) : resizeWidth();		//If portraits are set to fit
						}
					
					} else {	//If larger than minimums
						
						if ((browserheight/browserwidth) > ratio){
							options.fit_landscape && ratio <= 1 ? resizeWidth() : resizeHeight();	//If landscapes are set to fit
						} else {
							options.fit_portrait && ratio >= 1 ? resizeHeight() : resizeWidth();		//If portraits are set to fit
						}
						
					}
                                        }
					/**End Image Resize**/
					
					
					/**Resize Functions**/
					
					function resizeWidth(minimum){
						if (minimum){	//If minimum height needs to be considered
							if(thisSlide.width() < browserwidth || thisSlide.width() < options.min_width ){
								if (thisSlide.width() * ratio >= options.min_height){
									thisSlide.width(options.min_width);
						    		thisSlide.height(thisSlide.width() * ratio);
						    	}else{
						    		resizeHeight();
						    	}
						    }
						}else{
							if (options.min_height >= browserheight && !options.fit_landscape){	//If minimum height needs to be considered
								if (browserwidth * ratio >= options.min_height || (browserwidth * ratio >= options.min_height && ratio <= 1)){	//If resizing would push below minimum height or image is a landscape
									thisSlide.width(browserwidth);
									thisSlide.height(browserwidth * ratio);
								} else if (ratio > 1){		//Else the image is portrait
									thisSlide.height(options.min_height);
									thisSlide.width(thisSlide.height() / ratio);
								} else if (thisSlide.width() < browserwidth) {
									thisSlide.width(browserwidth);
						    		thisSlide.height(thisSlide.width() * ratio);
								}
							}else{	//Otherwise, resize as normal
								thisSlide.width(browserwidth);
								thisSlide.height(browserwidth * ratio);
							}
						}
					};
					
					function resizeHeight(minimum){
						if (minimum){	//If minimum height needs to be considered
							if(thisSlide.height() < browserheight){
								if (thisSlide.height() / ratio >= options.min_width){
									thisSlide.height(options.min_height);
									thisSlide.width(thisSlide.height() / ratio);
								}else{
									resizeWidth(true);
								}
							}
						}else{	//Otherwise, resized as normal
							if (options.min_width >= browserwidth){	//If minimum width needs to be considered
								if (browserheight / ratio >= options.min_width || ratio > 1){	//If resizing would push below minimum width or image is a portrait
									thisSlide.height(browserheight);
									thisSlide.width(browserheight / ratio);
								} else if (ratio <= 1){		//Else the image is landscape
									thisSlide.width(options.min_width);
						    		thisSlide.height(thisSlide.width() * ratio);
								}
							}else{	//Otherwise, resize as normal
								thisSlide.height(browserheight);
								thisSlide.width(browserheight / ratio);
							}
						}
					};
					
					/**End Resize Functions**/
					
					
					//Horizontally Center
					if (options.horizontal_center){
						$(this).css('left', (browserwidth - $(this).width())/2);
					}
					
					//Vertically Center
					if (options.vertical_center){
						$(this).css('top', (browserheight - $(this).height())/2);
					}
					
				});
				
				//Basic image drag and right click protection
				if (options.image_protect){
					
					$('img', element).bind("contextmenu",function(){
						return false;
					});
					$('img', element).bind("mousedown",function(){
						return false;
					});
				
				}
				
				return false;
				
			});
		};
	
		
		//Next slide
		function nextslide() {
			
			if(inAnimation) return false;		//Abort if currently animating
				else inAnimation = true;		//Otherwise set animation marker
		    
		    var slides = options.slides;	//Pull in slides array
			
			var currentslide = element.find('.activeslide');		//Find active slide
			currentslide.removeClass('activeslide');				//Remove active class
			
		    if ( currentslide.length == 0 ) currentslide = element.find('a:last');	//If end of set, note this is last slide
		    var nextslide = currentslide.next().length ? currentslide.next() : element.find('a:first');
			var prevslide = nextslide.prev().length ? nextslide.prev() : element.find('a:last');
			
			//Update previous slide
			$('.prevslide').removeClass('prevslide');
			prevslide.addClass('prevslide');
			
			//Get the slide number of new slide
			currentSlide + 1 == slides.length ? currentSlide = 0 : currentSlide++;
			
			//If hybrid mode is on drop quality for transition
			if (options.performance == 1) element.removeClass('quality').addClass('speed');	
			
			/**** Image Loading ****/
			
			//Load next image
			loadSlide = false;
			
			currentSlide == slides.length - 1 ? loadSlide = 0 : loadSlide = currentSlide + 1;	//Determine next slide
			imageLink = (options.slides[loadSlide].url) ? "href='" + options.slides[loadSlide].url + "'" : "";	//If link exists, build it
			$("<img/>").attr("src", options.slides[loadSlide].image).appendTo(element).wrap("<a " + imageLink + linkTarget + "></a>");	//Append new image
			
			//Update thumbnails (if enabled)
			if (options.thumbnail_navigation == 1){
			
				//Load previous thumbnail
				currentSlide - 1 < 0  ? prevThumb = slides.length - 1 : prevThumb = currentSlide - 1;
				$('#prevthumb').html($("<img/>").attr("src", options.slides[prevThumb].thumb));
			
				//Load next thumbnail
				nextThumb = loadSlide;
				$('#nextthumb').html($("<img/>").attr("src", options.slides[nextThumb].thumb));
				
			}
			
			currentslide.prev().remove(); //Remove Old Image
			
			/**** End Image Loading ****/
			
			
			//Update slide number
			if (options.slide_counter){
			    $('#slidecounter .slidenumber').html(currentSlide + 1);
			}
			
			//Update captions
		    if (options.slide_captions){
		    	(options.slides[currentSlide].title) ? $('#slidecaption').html(options.slides[currentSlide].title) : $('#slidecaption').html('');
		    }
		    
		    nextslide.hide().addClass('activeslide');	//Update active slide
		    
	    	switch(options.transition){
	    		
	    		case 0:    //No transition
	    		    nextslide.show(); inAnimation = false;
	    		    break;
	    		case 1:    //Fade
	    		    nextslide.fadeTo(options.transition_speed, 1, function(){ afterAnimation(); });
	    		    break;
	    		case 2:    //Slide Top
	    		    nextslide.animate({top : -$(window).height(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ top:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
	    		    break;
	    		case 3:    //Slide Right
	    			nextslide.animate({left : $(window).width(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ left:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
	    			break;
	    		case 4:    //Slide Bottom
	    			nextslide.animate({top : $(window).height(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ top:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
	    			break;
	    		case 5:    //Slide Left
	    			nextslide.animate({left : -$(window).width(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ left:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
	    			break;
	    		case 6:    //Carousel Right
	    			nextslide.animate({left : $(window).width(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ left:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
					currentslide.animate({ left: -$(window).width() , useTranslate3d: animate_translate3d}, options.transition_speed );
	    			break;
	    		case 7:    //Carousel Left
	    			nextslide.animate({left : -$(window).width(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ left:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
					currentslide.animate({ left: $(window).width() , useTranslate3d: animate_translate3d}, options.transition_speed );
	    			break;
	    	
	    	};

		    
		}
		
		
		//Previous Slide
		function prevslide() {
		
			if(inAnimation) return false;		//Abort if currently animating
				else inAnimation = true;		//Otherwise set animation marker
	
			var slides = options.slides;	//Pull in slides array
	
			var currentslide = element.find('.activeslide');		//Find active slide
			currentslide.removeClass('activeslide');				//Remove active class
			
		    if ( currentslide.length == 0 ) currentslide = $(element).find('a:first');	//If end of set, note this is first slide
		    var nextslide =  currentslide.prev().length ? currentslide.prev() : $(element).find('a:last');
			var prevslide =  nextslide.next().length ? nextslide.next() : $(element).find('a:first');
			
			//Update previous slide
			$('.prevslide').removeClass('prevslide');
			prevslide.addClass('prevslide');
					
			//Get current slide number
			currentSlide == 0 ?  currentSlide = slides.length - 1 : currentSlide-- ;
			
			//If hybrid mode is on drop quality for transition
			if (options.performance == 1) element.removeClass('quality').addClass('speed');	
					
			/**** Image Loading ****/
			
			//Load next image
			loadSlide = false;
			
			currentSlide - 1 < 0  ? loadSlide = slides.length - 1 : loadSlide = currentSlide - 1;	//Determine next slide
			imageLink = (options.slides[loadSlide].url) ? "href='" + options.slides[loadSlide].url + "'" : "";	//If link exists, build it
			$("<img/>").attr("src", options.slides[loadSlide].image).prependTo(element).wrap("<a " + imageLink + linkTarget + "></a>");	//Append new image
			
			//Update thumbnails (if enabled)
			if (options.thumbnail_navigation == 1){
			
				//Load previous thumbnail
				prevThumb = loadSlide;
				$('#prevthumb').html($("<img/>").attr("src", options.slides[prevThumb].thumb));
				
				//Load next thumbnail
				currentSlide == slides.length - 1 ? nextThumb = 0 : nextThumb = currentSlide + 1;
				$('#nextthumb').html($("<img/>").attr("src", options.slides[nextThumb].thumb));
			}
			
			currentslide.next().remove(); //Remove Old Image
			
			/**** End Image Loading ****/
			
			
			//Update slide counter
			if (options.slide_counter){
			    $('#slidecounter .slidenumber').html(currentSlide + 1);
			}
			
			//Update captions
		    if (options.slide_captions){
		    	(options.slides[currentSlide].title) ? $('#slidecaption').html(options.slides[currentSlide].title) : $('#slidecaption').html('');
		    }
			
		    nextslide.hide().addClass('activeslide');	//Update active slide
		    
		    switch(options.transition){
		    		
	    		case 0:    //No transition
	    		    nextslide.show(); inAnimation = false;
	    		    break;
	    		case 1:    //Fade
	    		    nextslide.fadeTo(options.transition_speed, 1, function(){ afterAnimation(); });
	    		    break;
	    		case 2:    //Slide Top (reverse)
	    		    nextslide.animate({top : $(window).height(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ top:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
	    		    break;
	    		case 3:    //Slide Right (reverse)
	    			nextslide.animate({left : -$(window).width(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ left:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
	    			break;
	    		case 4:    //Slide Bottom (reverse)
	    			nextslide.animate({top : -$(window).height(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ top:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
	    			break;
	    		case 5:    //Slide Left (reverse)
	    			nextslide.animate({left : $(window).width(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ left:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
	    			break;
	    		case 6:    //Carousel Right (reverse)
	    			nextslide.animate({left : -$(window).width(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ left:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
					currentslide.animate({ left: $(window).width() , useTranslate3d: animate_translate3d}, options.transition_speed );
	    			break;
	    		case 7:    //Carousel Left (reverse)
	    			nextslide.animate({left : $(window).width(), useTranslate3d: animate_translate3d}, 0 ).show().animate({ left:0 , useTranslate3d: animate_translate3d}, options.transition_speed, function(){ afterAnimation(); });
					currentslide.animate({ left: -$(window).width() , useTranslate3d: animate_translate3d}, options.transition_speed );
	    			break;	
	    	
	    	};
		    	
		}
		
		//After slide animation
		function afterAnimation() {
		
			inAnimation = false; 
			
			//If hybrid mode is on swap back to higher image quality
			if (options.performance == 1){
		    	element.removeClass('speed').addClass('quality');
			}
			
			resizenow();
			
		}
		
                //Detection of Apple devices
		function isAppleDevice(){
		return (
        (navigator.userAgent.toLowerCase().indexOf("ipad") > -1) ||
        (navigator.userAgent.toLowerCase().indexOf("iphone") > -1) ||
        (navigator.userAgent.toLowerCase().indexOf("ipod") > -1)
			);
		};		
	};
		
})(jQuery);
