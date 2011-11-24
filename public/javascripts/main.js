google_ad_client = "ca-pub-1528287161481073";
/* leaderboard */
google_ad_slot = "7644765582";
google_ad_width = 728;
google_ad_height = 90;
//-->



function createNewCounter() {
  var name = $("#what").text;
  var due = $("#when").text;



}



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
  l.append($("<span>").text(email).addClass("username"));
  l.append($('<a id="logout" href="#" >(logout)</a>'));
  //l.unbind('click');
  
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

  // enter causes us to save the value and do a little animation
  $('input').keypress(function(e){
    if(e.which == 13) {
      $.ajax({
        type: 'POST',
        url: '/api/set',
        data: { beer: $("input").val() },
        success: function(res, status, xhr) {
          // noop
        }
      });
      $("#content input").fadeOut(200).fadeIn(400);
      e.preventDefault();
    }
  });

  $.ajax({
    type: 'GET',
    url: '/api/get',
    success: function(res, status, xhr) {
      $("input").val(res);
    }
  });

  // get a gravatar cause it's pretty
  var iurl = 'http://www.gravatar.com/avatar/' +
    Crypto.MD5($.trim(email).toLowerCase()) +
    "?s=16";
  $("<img>").attr('src', iurl).appendTo($("header .picture"));

  tellbrowser({email: email, avatar: iurl});
}


function tellbrowser(data) {
  console.log("in tellbrowser, data =" + JSON.stringify(data));
  try {
    var customEvent = document.createEvent('Event');
    customEvent.initEvent('loggedinEvent', true, true);
    hiddenDiv = document.getElementById('loggedinDiv');
    hiddenDiv.innerText = JSON.stringify(data);
    console.log("dispatching event!");
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
  console.log('in loggedOut');
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

function computeDelta(dateText) {
  var then = new Date(dateText);
  var now = new Date(Date.now());
  var one_day=1000*60*60*24;
  var delta, numDays;
  delta = then.getTime() - now.getTime();
  numDays = Math.ceil(delta / one_day);
  state.numDays = numDays;
  state.dateText = dateText;
  updateState();
  return 
}

var State = function() {
  
};

state = new State();

function updateState() {
  var txt;
  var what = $("#what").val();
  if (state.dateText && what){
    if (state.numDays == 1) 
      txt = what + " is tomorrow!";
    else if (state.numDays > 1)
      txt = state.numDays + " days to go before " + what;
    else if (state.numDays == 0)
      txt = what + " is today!";
    else if (state.numDays == -1) 
      txt = what + " was yesterday!";
    else 
      txt = what + " was " + (-1 * state.numDays) + " days ago!";
    countdown.show(txt)
  } else {
    countdown.hide();
    }
}

var datePicker, countdown;

// at startup let's check to see whether we're authenticated to
// myfavoritebeer (have existing cookie), and update the UI accordingly
$(function() {
  try {

    var app = $$({}, '<div class="container"> </div>');
    $$.document.append(app);

    var form = $$({
      model: {
        what: 'xmas',
        when: '12/25/2011'
      },
      view: { 
        format: '<div class="row"> \
                  <form class="form-stacked">\
                    <div class="span8">\
                      <fieldset>\
                        <div class="clearfix" id="first">\
                          <label for="xlInput">What are you waiting for?</label>\
                          <div class="input"><input class="xlarge" id="what" name="what" size="30" type="text"/>\
                        </div>\
                      </fieldset>\
                    </div>\
                    <div class="span8">\
                      <fieldset>\
                        <div class="clearfix" id="second">\
                          <label for="xlInput">When is it?</label>\
                          <div class="input"><input class="xlarge" id="datepicker" name="when" size="30" type="text"/>\
                        </div>\
                      </fieldset>\
                    </form>\
                    <button class="btn hidden">create countdown!</button>\
                  </div>\
                </div>',
        style: '',
      },
      controller: {
        
      }
    });
    app.append(form);

    countdown = $$({
      model: {
        text: 'something',
      },
      view: {
        format: '<div class="row hidden" id="countdown">\
                  <div id="tweak">\
                    <div class="clearfix">\
                      <div class="hero-unit">\
                        <h1 id="counter" data-bind="text"/>\
                      </div>\
                    </div>\
                  </div>\
                </div>'
      },
      controller: {},
      show: function(s){
        this.model.set({text:s});
        this.view.$().slideDown(200);
      },
      hide: function(){ this.view.$().slideUp(100); }
    });
    app.append(countdown);


    $( "#datepicker" ).datepicker(
    {
        onClose: function(dateText, inst) {computeDelta(dateText, inst)}
    });
    $("#what").change(function() {
      console.log($("#what").val());
      updateState();
    })
    $("#what").keyup(function() {
      console.log($("#what").val());
      updateState();
    })
    $.get('/api/whoami', function (res) {
      if (res === null) loggedOut();
      else loggedIn(res, true);
    }, 'json');
  } catch (e) {
    console.log(e);
  }
});
