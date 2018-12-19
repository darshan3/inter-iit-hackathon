require({
    baseUrl: 'js',
    paths: {
        jquery: 'lib/jquery-2.0.3.min'
    }
},
        ["game", "jquery", "domBinding", "layout", "config"],
function(game,    $,        domBinding,   layout,   config){
    "use strict";

    layout.region = $('#game-region')[0];
    layout.adjust();

    domBinding.fragmentToDom($('#game-region')[0]);
    game.adjustLayout();

    $(window).resize(function(){
        layout.adjust();
        game.adjustLayout();
    });

    $('.newgame-but').on("click", function(){
        if(confirm("This will end the current game. Are you sure?")){
            game.newGame();
        }
    });

    console.log("Lets start");
    game.newGame();
});