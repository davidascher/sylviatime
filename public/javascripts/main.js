google_ad_client = "ca-pub-1528287161481073";
/* leaderboard */
google_ad_slot = "7644765582";
google_ad_width = 728;
google_ad_height = 90;
//-->

var deadline;
var now = new Date(Date.now());
var tomorrow_string = new Date(now.getTime() + (24 * 60 * 60 * 1000)).toLocaleDateString();

function setSessions(val) {
  if (navigator.id) {
    navigator.id.sessions = val ? val : [ ];
  }
} 

// when the user is found to be logged in we'll update the UI, fetch and
// display the user's favorite beer from the server, and set up handlers to
// wait for user input (specifying their favorite beer).
function loggedIn(email, immediate) {
  setSessions([ { email: email } ]);


  var unlogged = $("#unlogged").hide();
  var loggedin = $("#loggedin").show();
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

  deadline = $$({
    model: {
      what: '',
      when: tomorrow_string,
      text: '',
      numDays: 0,
      ready: false,
      dateText: ''
    },
    view: { 
      format:
        '<div class="controls row"> \
            <div class="clearfix" id="first">\
              <label class="xlarge">What are you waiting for?</label>\
              <div class="input">\
                <input id="what" class="what" data-bind="what" name="what" size="30" type="text"/>\
                when?\
                <input class="large datepicker" data-bind="when" name="when" size="30" type="text"/>\
                <button id="create" class="create btn hidden">create countdown!</button>\
              </div>\
            </div>\
        </div>\
        <div class="row" id="countdown">\
          <div class="tweak">\
            <div class="clearfix">\
              <div class="hero-unit">\
                <h1 class="counter" data-bind="text"/>\
                <a class="edit">tweak</a>\
              </div>\
            </div>\
          </div>\
        </div>'
    },
    controller: {
      'click .create': function() {
        this.model.set({ready:true});
        console.log(this.model);
        this.save();
      },
      'click .edit': function() {
        this.view.$("#create").text('save');
        this.model.set({ready: false});
      },
      'change:ready': function() {
        if (this.model.get('ready')) {
          this.view.$("#first").hide();
        } else {
          this.view.$("#first").show();
        }
      },
      update: function() {
        this.computeDelta(this.model.get('when'));

        // feels hackish, should figure out how to set visibility based on ready value at load time
        //this.model.set({ready:this.model.get('ready')}); 

        this.updateState();
        console.log(this.model);
      },
      'change:what': function() {
        this.updateState();
      },
      'keyup #what': function() {
        this.updateState();
      },
      create: function() {
        var self = this;
        self.view.$( ".datepicker" ).datepicker();
        if (this.model.get('ready')) {
          this.view.$("#first").hide();
          this.view.$("#countdown").show();
        } else {
          this.view.$("#first").show();
          this.view.$("#countdown").hide();
        }
      }
    },

    computeDelta: function(dateText) {
      console.log("in computeDelta, dateText is", dateText)
      var then = new Date(dateText);
      var now = new Date(Date.now());
      var one_day = 1000*60*60*24;
      var delta, numDays;
      delta = then.getTime() - now.getTime();
      numDays = Math.ceil(delta / one_day);
      this.model.set({'when':dateText, 'numDays': numDays});
      console.log({'when':dateText, 'numDays': numDays})
    },

    updateState: function() {
      try {
        var txt;
        var what = this.model.get('what');
        var numDays = this.model.get('numDays');
        console.log("in updateState, what=", what, "numDays", numDays);
        if (numDays && what){
          if (numDays == 1) 
            txt = what + " is tomorrow!";
          else if (numDays > 1)
            txt = numDays + " days to go before " + what;
          else if (numDays == 0)
            txt = what + " is today!";
          else if (numDays == -1) 
            txt = what + " was yesterday!";
          else 
            txt = what + " was " + (-1 * numDays) + " days ago!";
          console.log("WHAT", what, "TXT", txt);
          this.model.set({'text':txt});
        }
        if (this.model.get('ready')) {
          this.view.$("#countdown").show();
        } else {
          this.view.$("#countdown").hide();
        }
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

  // get a gravatar cause it's pretty
  var iurl = 'http://www.gravatar.com/avatar/' +
    Crypto.MD5($.trim(email).toLowerCase()) +
    "?s=16";
  $("<img>").attr('src', iurl).appendTo($("#picture"));

  tellbrowser({email: email, avatar: iurl});
}


function tellbrowser(data) {
  console.log("in tellbrowser, data =" + JSON.stringify(data));
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

// when no user is logged in, we'll display a "sign-in" button
// which will call into browserid when clicked.
function loggedOut() {
  setSessions();
  var unlogged = $("#unlogged").show();
  var loggedin = $("#loggedin").hide();

  var l = $("#login").removeClass('clickable');
  l.html('<img src="images/sign_in_blue.png" alt="Sign in">')
    .show().click(function() {
      $("header .login").css('opacity', '0.5');
      navigator.id.getVerifiedEmail(gotVerifiedEmail);
    }).addClass("clickable").css('opacity','1.0');
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


function loggedOut() {
  console.log("in loggedout");
  $(".row").hide();
  $("#loginInfo").show();
  $('.intro').fadeIn(300);
  $("#loginInfo .picture").empty();
  var l = $("#loginInfo .login").removeClass('clickable');
  l.html('<img src="images/sign_in_blue.png" alt="Sign in">')
    .show().click(function() {
      $("#loginInfo .login").css('opacity', '0.5');
      navigator.id.getVerifiedEmail(gotVerifiedEmail);
    }).addClass("clickable").css('opacity','1.0');

}
var datePicker, countdown, app, deadlines;

// at startup let's check to see whether we're authenticated to
// myfavoritebeer (have existing cookie), and update the UI accordingly
$(function() {
  try {

    app = $$({
      view: {format: '<div class="container" id="everything"><div id="main"></div><a class="new">new deadline</a></div>'},
      controller: {
        'click .new': function() {
          var newdeadline = $$(deadline);
          deadlines.append(newdeadline, "ul")
        },
      }
    });
    $$.document.append(app);

    var signin = $$({}, '<div id="loginInfo">\
            <div id="picture"></div>\
            <div id="you" class="login"></div>\
          </div>');
    app.append(signin);

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


    $.get('/api/whoami', function (res) {
      if (res === null) loggedOut();
      else loggedIn(res, true);
    }, 'json');
  } catch (e) {
    console.log(e);
  }
});
