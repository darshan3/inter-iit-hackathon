define(["ui", "Human", "board", "config", "jquery", "rules"],
function(ui,   Human,    board,   config,   $,        rules){
    "use strict";

    var rounds = 0;
    var players = [
        new Human(0, config.names[0]),
        new Human(1, config.names[0]),
        new Human(2, config.names[0]),
        new Human(3, config.names[0]),
    ];

    var status = "prepare",
        currentPlay = 0,
        played = 0;

    var heartBroken = true;//changed here

    var nextTimer = 0;

    var waitDefer = function(time){
        var d = $.Deferred();
        setTimeout(function(){
            d.resolve();
        }, time);
        return d;
    };

    var informCardOut = function(player, card){
        if(card.suit === 1){
            heartBroken = true;
        }
        players.forEach(function(p){
            p.watch({
                type: "out",
                player: player,
                card: card,
                curSuit: board.desk.cards[0].suit
            });
        });
    };

    var adds = [1, 3, 2];
    var getPlayerForTransfer = function(id){
        return (id + adds[rounds % 3]) % 4;
    };


    var temp_suits = ['spades', 'hearts', 'clubs', 'diamonds'];
    var updateStatus = function(){
            var payload = {
                "status": status,
                "currentPlay": currentPlay,
                "currentValidCards": rules.getValidCards(players[currentPlay].row.cards,
                                            board.desk.cards[0] ? board.desk.cards[0].suit : -1,
                                            heartBroken).map(function(c){
                                                return {
                                                    "id": c.id,
                                                    "num": c.num,
                                                    "suit": temp_suits[c.suit]
                                                };
                                            }),
                // "players": players
                "players" : [players[0].row.cards.map(function(c){
                                                return {
                                                    "id": c.id,
                                                    "num": c.num,
                                                    "suit": temp_suits[c.suit]
                                                };
                                            }),
                            players[1].row.cards.map(function(c){
                                                return {
                                                    "id": c.id,
                                                    "num": c.num,
                                                    "suit": temp_suits[c.suit]
                                                };
                                            }),
                            players[2].row.cards.map(function(c){
                                                return {
                                                    "id": c.id,
                                                    "num": c.num,
                                                    "suit": temp_suits[c.suit]
                                                };
                                            }),
                            players[3].row.cards.map(function(c){
                                                return {
                                                    "id": c.id,
                                                    "num": c.num,
                                                    "suit": temp_suits[c.suit]
                                                };
                                            })]
            };

            // $.post("http://192.168.0.109:6969/api/internalPost", JSON.stringify(payload)).done(function(data){
            // });
            console.log(JSON.stringify(payload));
            $.ajax({
                  contentType: "application/json",
                  type: "POST",
                  url: "http://10.196.3.196:6970/api/internalPost",
                  data: JSON.stringify(payload),
                  dataType: "json",
                  success: function(data){
                    console.log(data);
                  }
            });
    };

    var ensureAllReady = async function() {
        return new Promise(function (resolve, reject) {
            (function waitForAllReady(){
                $.get( "http://10.196.3.196:6970/api/internalGet", function( data ) {
                    console.log(data);
                    players.forEach(function(p) => {
                        p.display = domBinding.createPlayerDisplay(p.id, data.playerNames[p.id]);
                    });
                    config.names = data.playerNames;
                    if (data.allReady == true) return resolve();
                    setTimeout(waitForAllReady, 1000);
                });
            })();
        });
    };

    return {
        adjustLayout: function(){
            players.forEach(function(r){
                r.adjustPos();
            });
            board.desk.adjustPos();
        },
        newGame: function(){
            clearTimeout(nextTimer);
            ui.hideWin();
            players.forEach(function(p, i){
                p.clearScore();
                p.setActive(false);
                p.setName(config.names[i])
            });
            rounds = 0;
            ui.clearEvents();
            status = 'prepare';
            this.proceed();
        },
        next: function(){

            console.log("hi");
            console.log(status, "next");

            if (status == 'start'){
                currentPlay = board.cards[26].parent.playedBy.id;
                played = 0;
                $.get( "http://10.196.3.196:6970/api/internalGet", function( data ) {
                        console.log(data);
                        players.forEach(function(p) => {
                            p.display = domBinding.createPlayerDisplay(p.id, data.playerNames[p.id]);
                        });
                        if (data.allReady == true) status = 'playing';
                });
                // setTimeout(function(){},500)
            } else if (status == 'playing'){
                currentPlay = (currentPlay + 1) % 4;
                played++;
            }
            if(played == 4){
                status = 'endRound';
                played = 0;
            } else if (status == 'endRound' && players[0].row.cards.length === 0){
                status = 'end';
            } else {
                status = ({
                    'prepare': 'distribute',
                    'distribute': 'start',
                    'start': 'start',
                    'passing': 'confirming',
                    'confirming': 'playing',
                    'playing': 'playing',
                    'endRound': 'playing',
                    'end': 'prepare'
                })[status];
            }
            var waitTime = {
                'playing': 100,
                'endRound': 900,
                'distribute': 300,
                'end': 900
            };
            var wait = waitTime[status] || 0;
            nextTimer = setTimeout(this.proceed.bind(this), wait);
        },
        proceed: function(){

            console.log(status);
            ({
                'prepare': function(){
                    ui.hideMessage();
                    ui.hideButton();
                    players.forEach(function(p){
                        p.initForNewRound();
                    });
                    board.init();
                    heartBroken = true; //changed here
                    board.shuffleDeck();
                    updateStatus();
                    this.next();
                    // initBrains().done(this.next.bind(this));
                },
                'distribute': function(){
                    var self = this;
                    board.distribute(players).done(function(){
                        players.forEach(function(p){
                            p.row.sort();
                        });rounds++;
                        updateStatus();
                        self.next();
                    });
                },
                'start': function(){
                    updateStatus();
                    this.next();
                    // $.when.apply($, players.map(function(p){
                    //     return p.prepareTransfer(rounds % 3);
                    // })).done(this.next.bind(this));
                },
                'passing': function(){
                    for(var i = 0; i < 4; i++){
                        players[i].transferTo(players[getPlayerForTransfer(i)]);
                    }
                    updateStatus();
                    this.next();
                },
                'confirming': function(){
                    players.forEach(function(r){
                        r.row.sort();
                    });
                    $.when.apply($, players.map(function(p){
                        return p.confirmTransfer();
                    })).done(function(){
                        updateStatus();
                        this.next.bind(this)
                    });
                },
                'playing': function(){

                    updateStatus();
                    players[currentPlay].setActive(true);
                    $.when(players[currentPlay].decide(
                        rules.getValidCards(players[currentPlay].row.cards,
                                            board.desk.cards[0] ? board.desk.cards[0].suit : -1,
                                            heartBroken)), waitDefer(200))
                    .done(function(card){
                        players[currentPlay].setActive(false);
                        card.parent.out(card);
                        board.desk.addCard(card, players[currentPlay]);
                        card.adjustPos();
                        informCardOut(players[currentPlay], card);
                        updateStatus();
                        this.next();
                    }.bind(this));
                },
                'endRound': function(){
                    var info = board.desk.score();
                    currentPlay = info[0].id;
                    info[0].waste.addCards(info[1]);
                    updateStatus();
                    this.next();
                },
                'end': function(){
                    // if(players.some(function(p){
                    //     return p.getScore() === 26;
                    // })){
                    //     players.forEach(function(p){
                    //         if(p.getScore() !== 26){
                    //             p.setScore(26);
                    //         }else{
                    //             p.setScore(0);
                    //         }
                    //     });
                    // }
                    players.forEach(function(p){
                        p.finalizeScore();
                    });
                    var rank = players.map(function(c){
                        return c;
                    });
                    rank.sort(function(a,b){
                        return b._oldScore - a._oldScore;
                    });
                    rank.forEach(function(r,ind){
                        r.display.rank = ind;
                    });
                    players.forEach(function(p){
                        p.adjustPos();
                    });
                    if(players.some(function(p){
                        return p._oldScore >= 100;
                    })){
                        players.forEach(function(p){
                            p.display.moveUp = true;
                            p.display.adjustPos();
                        });
                        ui.showWin(players[0] === rank[0]);
                        ui.showButton("Restart");
                        ui.buttonClickOnce(this.newGame.bind(this));
                    } else {
                        ui.showButton("Continue");
                        ui.buttonClickOnce(this.next.bind(this));
                    }
                }
            })[status].bind(this)();

        }
    };
});