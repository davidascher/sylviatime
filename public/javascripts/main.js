// only one gets persisted
// HTTP call on each keystroke in new scenario


var google_ad_client = "ca-pub-1528287161481073";
var google_ad_slot = "7644765582";
var google_ad_width = 728;
var google_ad_height = 90;

var deadline, deadlines, colorpicker;
var now = new Date(Date.now());
var tomorrow_string = new Date(now.getTime() + (24 * 60 * 60 * 1000)).toLocaleDateString();
var currentDeadline = null;


/* BrowserId/Auth Stuff */
function setSessions(val) {
  if (navigator.id) {
    navigator.id.sessions = val ? val : [ ];
  }
};

function browserIdCheck() {
  $.get('/api/whoami', function (res) {
    if (res === null) loggedOut();
    else loggedIn(res, true);
  }, 'json');
};

function loggedOut() {
  $(".row").hide();
  $("#loginInfo").show();
  $('.intro').fadeIn(300);
  $("#loginInfo .picture").empty();
  var l = $("#loginInfo .login").removeClass('clickable');
  l.html('<img id="signinButton" src="images/sign_in_blue.png" alt="Sign in">')
    .show().click(function() {
      $("#loginInfo .login").css('opacity', '0.5');
      navigator.id.getVerifiedEmail(gotVerifiedEmail);
    }).addClass("clickable").css('opacity','1.0');
};

// when the user is found to be logged in we'll update the UI, fetch and
// display the user's favorite beer from the server, and set up handlers to
// wait for user input (specifying their favorite beer).
function loggedIn(email, immediate) {
  setSessions([ { email: email } ]);

  var unlogged = $("#unlogged").hide();
  var loggedin = $("#loggedin").show();
  $("#new").show();
  // set the user visible display
  var l = $("#you").removeClass('clickable');;
  l.empty();
  l.css('opacity', '1');
  l.append($("<span>").text("Yo, "))
    .append($("<span>").text(email).addClass("username"))
    .append($("<span>!</span>"));
  l.append($('<a id="logout" href="#" >(logout)</a>'));
  l.unbind('click');

  $("#logout").bind('click', logout);

  if (immediate) {
    $("#content .intro").hide();
    $("#content .business").fadeIn(300);
  }
  else {
    $("#content .intro").fadeOut(700, function() {
      $("#content .business").fadeIn(300);
    });
  }

  // get a gravatar cause it's pretty
  var iurl = 'http://www.gravatar.com/avatar/' +
    Crypto.MD5($.trim(email).toLowerCase()) +
    "?s=16";
  $("<img>").attr('src', iurl).appendTo($("#picture"));

  tellbrowser({email: email, avatar: iurl});

  setupDeadlines();
}


function tellbrowser(data) {
  try {
    var customEvent = document.createEvent('Event');
    customEvent.initEvent('loggedinEvent', true, true);
   hiddenDiv = document.getElementById('deadlines');
   // hiddenDiv.innerText = JSON.stringify(data);
   hiddenDiv.dispatchEvent(customEvent);
  } catch (e) {
    console.log(e);
  }
}


// when the user clicks logout, we'll make a call to the server to clear
// our current session.
function logout(event) {
  event.preventDefault();
  $.ajax({
    type: 'POST',
    url: '/api/logout',
    success: function() {
      // and then redraw the UI.
      loggedOut();
    }
  });
}

// a handler that is passed an assertion after the user logs in via the
// browserid dialog
function gotVerifiedEmail(assertion) {
  // got an assertion, now send it up to the server for verification
  if (assertion !== null) {
    $.ajax({
      type: 'POST',
      url: '/api/login',
      data: { assertion: assertion },
      success: function(res, status, xhr) {
        if (res === null) loggedOut();
        else loggedIn(res);
      },
      error: function(res, status, xhr) {
        alert("login failure" + res);
      }
    });
  }
  else {
    loggedOut();
  }
}

// For some reason, login/logout do not respond when bound using jQuery
if (document.addEventListener) {
  document.addEventListener("login", function(event) {
    $("header .login").css('opacity', '0.5');
    navigator.id.getVerifiedEmail(gotVerifiedEmail);
  }, false);

  document.addEventListener("logout", logout, false);
}


/* Font Stuff */

WebFontConfig = {
    google: { 
      families: [ 'Lemon::latin', 
                  'Unlock::latin', 
                  'Mr+De+Haviland::latin', 
                  'Aladin::latin', 
                  'Miss+Fajardose::latin', 
                  'Bubblegum+Sans::latin', 
                  'Piedra::latin', 
                  'Spirax::latin', 
                  'Ribeye+Marrow::latin', 
                  'Ribeye::latin', 
                  'Signika+Negative::latin'
                  ]
            }
                };

function loadFonts() {
  var wf = document.createElement('script');
  wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
    '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
  wf.type = 'text/javascript';
  wf.async = 'true';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(wf, s);
};

FontFamilies = WebFontConfig['google']['families'];

/* Random UI stuff */


/*
*  Converts RGB to HEX
*    http://stackoverflow.com/questions/638948/background-color-hex-to-javascript-variable-jquery
*
*/
function rgb2hex(rgbString) {
  var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  if (!parts) { return; }

  delete (parts[0]);
  
  for (var i = 1; i <= 3; ++i) {
      parts[i] = parseInt(parts[i]).toString(16);
      if (parts[i].length == 1) parts[i] = '0' + parts[i];
  }
  return '#'+parts.join('');

}

function rgbobj2hex(rgbobj) {
  return '#'+parseInt(rgbobj.r).toString(16) + parseInt(rgbobj.g).toString(16) + parseInt(rgbobj.b).toString(16);
}
/*
* Converts an RGB color to HSL
* Parameters
*     rgbArr : 3-element array containing the RGB values
*
* Result : 3-element array containing the HSL values
*
*/
function rgb2hsl(rgbArr){
    var r1 = rgbArr[0] / 255;
    var g1 = rgbArr[1] / 255;
    var b1 = rgbArr[2] / 255;

    var maxColor = Math.max(r1,g1,b1);
    var minColor = Math.min(r1,g1,b1);
    //Calculate L:
    var L = (maxColor + minColor) / 2 ;
    var S = 0;
    var H = 0;
    if(maxColor != minColor){
        //Calculate S:
        if(L < 0.5){
            S = (maxColor - minColor) / (maxColor + minColor);
        }else{
            S = (maxColor - minColor) / (2.0 - maxColor - minColor);
        }
        //Calculate H:
        if(r1 == maxColor){
            H = (g1-b1) / (maxColor - minColor);
        }else if(g1 == maxColor){
            H = 2.0 + (b1 - r1) / (maxColor - minColor);
        }else{
            H = 4.0 + (r1 - g1) / (maxColor - minColor);
        }
    }

    L = L * 100;
    S = S * 100;
    H = H * 60;
    if(H<0){
        H += 360;
    }
    var result = [H, S, L]; 
    return result;
}

function idealTextColor(bgColor) {
  if (!bgColor) { return; }
  var hsl = rgb2hsl(hex2rgb(bgColor));
  if (hsl[2] > 50) 
    return "#333";
  return "#eee";
}

function hex2rgb(color) {       
    var r = color.substring(1, 3);
    var g = color.substring(3, 5);
    var b = color.substring(5, 7);
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
}

function hsl2rgb(hue,saturation,lightness){
   var h = hue, s = saturation, l = lightness;

   if (s == 0){
      /*  achromatic case  */
      hue        = l;
      lightness  = l;
      saturation = l;
   }else{
      var m1, m2;

      if (l < 128){
         m2 = (l * (255 + s)) / 65025.0;
      }else{
         m2 = (l + s - (l * s) / 255.0) / 255.0;
      }
      m1 = (l / 127.5) - m2;

      /*  chromatic case  */
      hue        = hslValue (m1, m2, h + 85);
      saturation = hslValue (m1, m2, h);
      lightness  = hslValue (m1, m2, h - 85);
   }
   return {r:hue,g:saturation,b:lightness};
};

 function hslValue(n1,n2,hue){
   var value;

   if (hue > 255){ hue -= 255; }
   else if (hue < 0) { hue += 255; }

   if (hue < 42.5){
      value = n1 + (n2 - n1) * (hue / 42.5);
   }else if (hue < 127.5){
      value = n2;
   }else if (hue < 170){
      value = n1 + (n2 - n1) * ((170 - hue) / 42.5);
   }else{
      value = n1;
   }
   return Math.round(value * 255.0);
};

function randomHexColor() {
  return rgbobj2hex(hsl2rgb(Math.random()*256, 200, 100));
}

// this is a fix for the jQuery slide effects
function slideToggle(el, bShow){
  var $el = $(el), height = $el.data("originalHeight"), visible = $el.is(":visible");
  
  // if the bShow isn't present, get the current visibility and reverse it
  if( arguments.length == 1 ) bShow = !visible;
  
  // if the current visiblilty is the same as the requested state, cancel
  if( bShow == visible ) return false;
  
  // get the original height
  if( !height ){
    // get original height
    height = $el.show().height();
    // update the height
    $el.data("originalHeight", height);
    // if the element was hidden, hide it again
    if( !visible ) $el.hide().css({height: 0});
  }

  // expand the knowledge (instead of slideDown/Up, use custom animation which applies fix)
  if( bShow ){
    $el.show().animate({height: height}, {duration: 250});
  } else {
    $el.animate({height: 0}, {duration: 250, complete:function (){
        $el.hide();
      }
    });
  }
}

$('body').keypress(function (e) {
  var fi = currentDeadline.model.get('fontIndex');
  if (e.charCode == 93) {
    fi++;
    if (fi >= FontFamilies.length) fi = 0;
    currentDeadline.model.set({'fontIndex': fi})
    currentDeadline.save();
  } else if (e.charCode == 91) {
    fi--;
    if (fi < 0) fi = FontFamilies.length-1;
  } else {
    return;
  }
  currentDeadline.model.set({'fontIndex': fi})
  currentDeadline.save();
});


function setupDeadlines() {
  // deadline is a global XXX rename to look like a type.
  deadline = $$({
    model: {
      what: '',
      when: tomorrow_string,
      text: '',
      numDays: 0,
      ready: false,
      dateText: '',
      color: '#34a044',
      fontIndex: 0
    },
    view: { 
      format:
        '<div class="countdown-container">\
          <div class="row countdown" id="countdown">\
              <div class="clearfix">\
                <div class="hero-unit">\
                  <h1 class="counter" data-bind="text"/>\
                  <a class="edit">tweak</a>\
                  <a class="delete"><img src="/images/trash.png"/></a>\
                </div>\
            </div>\
          </div>\
          <div class="controls hidden row"> \
            <div class="clearfix" id="first">\
              <label class="xlarge">What are you waiting for?</label>\
              <div class="input">\
                <input id="what" class="what" data-bind="what" name="what" size="30" type="text"/>\
                when?\
                <input class="large datepicker" data-bind="when" name="when" size="30" type="text"/>\
                <button id="create" class="create btn">create countdown!</button>\
              </div>\
            </div>\
          </div>\
        </div>'
    },
    controller: {
      'mouseenter &': function() {
        var self = this;
        currentDeadline = self;
      },
      'click .create': function() {
        this.model.set({ready:true, color: randomHexColor()});
        this.save();
        $("#colorpicker-container").hide();
        this.view.$(".countdown").show();
        this.updateText();
      },
      'click .colorclose': function() {
        $("#colorpicker-container").hide();
      },
      'click .edit': function() {
        var self = this;
        if (this.view.$(".edit").text() == 'done') {
          this.view.$(".edit").text('tweak').removeClass('opaque');
          this.model.set({ready:true});
          this.updateText();
          $("#colorpicker-container").hide();
          this.save();
          return;
        }
        currentDeadline = self;
        this.view.$("#create").hide();
        this.model.set({ready: false});
        var coord = self.view.$().offset();
        var cp = $("#colorpicker-container");
        colorpicker.setColor(self.model.get('color'));
        cp.appendTo(self.view.$()[0])
        cp.css({'position': 'absolute'});
        cp.fadeIn();
        this.view.$(".edit").text('done').addClass('opaque');
      },

      'click .delete': function() {
        if (confirm('really delete this deadline?')) {
          this.erase();
          this.destroy();
        }
      },
      'change:ready': function() {
        if (this.model.get('ready')) {
          this.view.$(".controls").slideUp();
          this.view.$(".countdown").fadeIn();

        } else {
          slideToggle(this.view.$(".controls"));
          this.view.$(".controls").slideDown();
        }
      },
      update: function() {
        this.computeDelta(this.model.get('when'));
        this.updateText();
      },
      'change:what': function() {
        this.updateText();
        if (this.model.get('ready'))
          this.save();
      },
      'change:fontIndex': function() {
       this.updateFont();
      },
      'change:when': function() {
        this.computeDelta(this.model.get('when'));
        this.updateText();
      },
      'change:color': function() {
        this.updateColor();
      },
      create: function() {
        var self = this;
        self.view.$(".hero-unit").css('backgroundColor', self.model.get('color'));
        self.view.$( ".datepicker" ).datepicker();
        console.log('ready is', this.model.get('ready'))
        if (this.model.get('ready')) {
          this.view.$(".controls").slideUp();
          this.view.$(".countdown").show();
          this.view.$(".countdown").removeClass('hidden');
        } else {
          this.view.$(".controls").slideDown();
          this.view.$(".controls").removeClass('hidden');
          this.view.$(".countdown").hide();
        }

        this.updateColor();
        this.updateFont();
      }
    },
    updateColor: function() {
      var deadline = this.view.$(".hero-unit");
      var color = this.model.get('color');
      deadline.css('backgroundColor', color);
      var textcolor = idealTextColor(color);
      this.view.$(".counter").css('color',textcolor);
      this.view.$(".edit").css('color',textcolor);
    },
    updateFont: function() {
      var index = this.model.get('fontIndex');
      var font = FontFamilies[index];
      var counter = this.view.$(".counter");
      for (var i =0; i<FontFamilies.length;i++) {
        counter.removeClass('font-'+String(Number(i)+1));
      }
      counter.addClass('font-'+String(Number(index)+1));
    },

    computeDelta: function(dateText) {
      var then = new Date(dateText);
      var now = new Date(Date.now());
      var one_day = 1000*60*60*24;
      var delta, numDays;
      delta = then.getTime() - now.getTime();
      numDays = Math.ceil(delta / one_day);
      this.model.set({'numDays': numDays});
    },

    updateText: function() {
      try {
        var txt;
        var what = this.model.get('what');
        var numDays = this.model.get('numDays');
        if (what){
          if (numDays == 1) 
            txt = what + " is tomorrow!";
          else if (numDays > 1)
            txt = "Only " + numDays + " days to go before " + what;
          else if (numDays == 0)
            txt = what + " is today!";
          else if (numDays == -1) 
            txt = what + " was yesterday!";
          else 
            txt = what + " was " + (-1 * numDays) + " days ago!";
          this.model.set({'text':txt});
        }
        // if (this.model.get('ready')) {
        //   this.view.$("#countdown").show();
        // } else {
        //   this.view.$("#countdown").hide();
        // }
      } catch (e) {
        console.log(e);
      }
    }
  }).persist($$.adapter.restful, {collection:'deadlines'});

  try {
    deadlines.gather(deadline, 'append', 'ul');
  } catch (e) {
    console.log(e);
  }
}


// XXX fix comments
// at startup let's check to see whether we're authenticated
//(have existing cookie), and update the UI accordingly
$(function() {
  try {

    loadFonts(); // XXX should figure out what to do for mobile where fonts might be too expensive.

    var app = $$({
      view: {format: '<div id="loginInfo">\
            <div id="picture"></div>\
            <div id="you" class="login"></div>\
          </div>\
          <div id="colorpicker-container" class="hidden"><div id="colorpicker-placeholder"></div><span class="colorclose">X</span></div>\
          <div class="container" id="everything"><div id="main"></div><button class="btn primary new">new deadline</button></div>'},
      controller: {
        'click .colorclose': function() {
          $("#colorpicker-container").hide();
        },
        'click .new': function() {
          var newdeadline = $$(deadline);
          deadlines.append(newdeadline, "ul")
        },
      }
    });
    $$.document.append(app);

    colorpicker = $.farbtastic("#colorpicker-placeholder", function(color) {
      if (currentDeadline) {
        currentDeadline.model.set({'color': color});
      }
    })
    deadlines = $$(
      {
        view: {
          format: '<div id="deadlines"><ul/></div>'
        },
        controller: {
          'persist:gather:success': function() {
            this.each(function(a){
              this.controller.update();
            });
          },
        }
      }
    ).persist($$.adapter.restful, {collection:'deadlines'});
    app.append(deadlines, '#main');
    browserIdCheck();
  } catch (e) {
    console.log(e);
  }
});
