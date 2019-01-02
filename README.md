# Code-Piece

Code-Piece is modular HTML5 framework for card games with a central server acting as the table and the [Android app](https://github.com/unstablebrainiac/CourtPiece) acting as the individual controllers for all players. This is modular in the sense that with little modification to the `js/rules.js` file, anyone can make their own choice of game with their own rules and winning criteria. 

This was built as a submission for the Inter - IIT Tech Hackathon 2018 sponsored by JIO.

## Getting Started

The code has been split into two parts 
* `js/` : This contains the working logic of the game which is fetched by the client side when running the game.
* `api/` : This contains the description of the api endpoints used to synchronize state between the client and the players.

### Prerequisites

Execute the following code to install all the requisite packages.
```
cd api/
node install
```
### Deployment

After installing the packages, run the following to setup and start the api server, which will be the central server.
```
cd api/
node app.js
```

Then go to `http://localhost:7000` and you should see what is above referred as the client.

![Client](/docs/images/client_landing_page.png "Client")

* Controller 

![controller](/docs/images/controller.png "Android app")

### Acknowledgement

Thanks to the HTML5 game made by [Yao Yujian](https://github.com/yyjhao/html5-hearts), we were able to complete this in the given 1 day time.




