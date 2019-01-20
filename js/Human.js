define(["Player", "jquery", "ui"],
function(Player,  $,         ui){
    "use strict";

    var Human = function(id, name){
        Player.call(this, id, name);
        this.row.flipped = true;
        this.display.setHuman(true);
        this.row.maxShift = 1;
    };

    Human.prototype = Object.create(Player.prototype);

    Human.prototype.takeIn = function(cards){
        Player.prototype.takeIn.call(this,cards);
        this.row.setSelected(cards);
    };

    Human.prototype.decide = function(validCards){
        validCards.forEach(function(c){
            c.display.setSelectable(true);
        });
        if(validCards.length === 1 && validCards[0].id === 26){
            ui.showMessage('Please start with 2 of Clubs.');
        }

        // setInterval(function() {
        //     $.get( "ajax/test.html", function( data ) {
        //         console.log(data);
        //     });
        // }, 1000 * X);
        

        var d = $.Deferred();
        var row = this.row;

        const waitForEvent = setInterval(() => {
            $.get('http://10.196.3.196:6969/api/internalGet', (data) => {
                while(data.events.length > 0) {
                    clearInterval(waitForEvent);
                    let selectedCard = row.cards.find((crd) => {
                        return crd.id === data.events[0].card.id;
                    });
                    data.events.shift();
                    d.resolve(selectedCard);
                }
            })
        },1000);
        // ui.buttonClickOnce(function(){
        //     ui.hideMessage();
        //     ui.hideButton();
        //     validCards.forEach(function(c){
        //         c.display.setSelectable(false);
        //     });
        //     d.resolve(row.getSelected()[0]);
        // });
        return d;
    };

    Human.prototype.confirmTransfer = function(){
        ui.showButton("Confirm");
        ui.hideArrow();
        ui.hideMessage();
        var d = $.Deferred();
        ui.buttonClickOnce(function(){
            this.doneTransfer();
            d.resolve();
        }.bind(this));
        return d;
    };

    Human.prototype.doneTransfer = function(){
        this.row.curShifted = [];
        this.row.adjustPos();
        ui.hideButton();
    };

    Human.prototype.initForNewRound = function(){
        Player.prototype.initForNewRound.call(this);
        this.row.curShifted = [];
    };

    Human.prototype.prepareTransfer = function(dir){
        ui.showPassingScreen(dir);
        this.row.cards.forEach(function(c){
            c.display.setSelectable(true);
        });
        this.row.maxShift = 3;
        var d = $.Deferred();
        var row = this.row;
        ui.arrowClickOnce(function(){
            this.selected = row.getSelected();
            this.row.maxShift = 1;
            this.row.cards.forEach(function(c){
                c.display.setSelectable(false);
            });
            d.resolve();
        }.bind(this));

        return d;
    };

    Human.prototype.rowSelected = function(){
        // if(this.row.maxShift === 3){
        //     ui.showArrow();
        // } else {
        //     ui.showButton("Go!");
        // }
        console.log("clicked button");
        ui.showButton("Go!");
    };

    Human.prototype.rowDeselected = function(){
        // if(this.row.maxShift === 3){
        //     ui.hideArrow();
        // } else {
        //     ui.hideButton();
        // }
        ui.hideButton();
    };

    return Human;
});