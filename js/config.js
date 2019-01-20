define(function(){
    "use strict";

    var names = ["Gryffindor", "Slytherin", "Hufflepuff", "Ravenclaw"],
        levels = [-1, -1, -1, -1];

    // try{
    //     var loadedNames = JSON.parse(localStorage.getItem("names"));
    //     if(loadedNames) names = loadedNames;
    // } catch(e){}

    // try{
    //     var loadedLevels = JSON.parse(localStorage.getItem("levels"));
    //     if(loadedLevels) levels = loadedLevels;
    // } catch(e){}

    return {
        names: names,
        levels: levels,
        sync: function(){
            localStorage.setItem("names", JSON.stringify(names));
            localStorage.setItem("levels", JSON.stringify(levels));
        }
    };
});