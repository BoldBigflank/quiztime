var socket = io.connect('http://qtserver.herokuapp.com');

(function($, undefined){
  $(document).ready(function(){

    var users = new Users();
    var leaderboard = new Leaderboard();
    var answers = new Answers();
    var user_info = new UserInfo();

    socket.on('game', function (data) {
      console.log('game', data);
      if(typeof data.count !== 'undefined'){
        answers.generate(data.count);
      }
      if(typeof data.players !== 'undefined'){
        //username = data.players[uuid].name;
        users.createUsers(data.players);
        leaderboard.generate(users);
      }
    });

    socket.emit('join', function(playerObj){
      user_info.id = playerObj.id;
      user_info.update(playerObj.name, playerObj.score, users);
      console.log(user_info);
    });

    socket.on('error', function (data) {
      console.log('error', data);
    });

    //Answer submit
    $('#answer-btn').click(function(){
      socket.emit('answer', $('#answer-input').val(), function(err, res){
        console.log(res);
      });
    });

    //Username update
    $('#update-btn').click(function(){
      socket.emit('name', $('#username-input').val(), function(err, res){
        //console.log(res);
      });
    });

    socket.on('game', function (data) {
      console.log('game', data);
      if(typeof data.count !== 'undefined'){
        answers.generate(data.count);
      }
      if(typeof data.players !== 'undefined'){
        users.createUsers(data.players);
        leaderboard.generate(users);

        if(user_info.id !== null){
          user_info.update(
            data.players[user_info.id - 1].name,
            data.players[user_info.id - 1].score,
            users
          );
        }

      }
    });

  });

var UserInfo = function(){
  this.id = null;
  this.name = null;
  this.score = null;
  this.position = null;

  this.update = function(name, score, users){
    this.name = name;
    this.score = score;
    this.position = users.user_array[this.id-1].answers.length;

    this.update_page();
  };

  this.update_page = function(){
    $('#user_container .username_value').html(this.name);
    $('#user_container .rank_value').html(this.position);
    $('#username-input').attr('placeholder', this.name);
  }

};
var Answers = function(){
  this.element = $('ul.tiles');

  this.generate = function(count){
    
    this.element.html('');

    for(var i = 0; i < count; i++){
      this.element.append($('<li>', {'class': 'tile'}));
    }
  };

  this.update_tile = function(i, text){
    this.element.eq(i).html(text);
  }
};
var Leaderboard = function(){

  this.element = $('table.leaders tbody');

  this.generate = function(users){
    this.element.html('');
    //var changed_elements = [];
    //users.user_array = users.user_array.sort(function(a,b){return b.score - a.score});
    //console.log(users.user_array.sort());
    var max = users.user_array.length < 10 ? users.user_array.length : 10;
    for(var i = 0; i < max; i++){
      this.element.append(
        $('<tr>').append(
          $('<td>').html(i + 1),
          $('<td>').html(users.user_array[i].name),
          $('<td>').append( $('<span>', {'class': 'badge ' + this.get_badge_class(i)}).append(users.user_array[i].score) )
        )
      );
    }
  };

  this.update = function(){

  };

  this.field_change = function(i, users){
    this.element.find('tr').eq(i).animate({
      'opacity': 0,
    }, 300, function(){
      var rows = $(this).find('td');
      rows.eq(1).html(users.user_array[i].name);
      rows.eq(2).find('span').html(users.user_array[i].score);
    }).animate({
      'opacity': 1
    }, 300);
  };

  this.get_badge_class = function(i){
    switch(i){
      case 0:
        return 'badge-success';
      break;
      case 1:
        return 'badge-warning';
      break;
      case 2:
        return 'badge-important';
      break;
    }
  };
};

var Users = function(){
  this.user_array = [];

  this.createUsers = function(users){
    this.user_array = [];
    for(var i = 0; i < users.length; i++){
      this.createUser(users[i].id, users[i].name, users[i].answers, users[i].score);
    }
  }
  this.createUser = function(id, name, answers, score){
    var user = {
      id: id,
      name: name,
      answers: answers,
      score: score
    }
    this.user_array.push(user);
  };
};
})(jQuery);