
var game;
var img;


//Global Game Settings
var gameOptions = {
    platformStartSpeed: 1100,
    spawnRange: [300, 350],
    platformSizeRange: [400,800],
    playerGravity: 2900,
    jumpForce: 1100,
    playerStartPosition: 400,
    jumps: 2
}

var globalVariables = {
    platforms : [],
    obstacles: [],
    platformCount: 0,
    score: 0,
    counter : 0,
    highscore : 0
}

window.onload = function(){
    var config = {
        type : Phaser.AUTO,
        width: 1280,
        height: 720,
        scene: apoRunner,
       // scale : {
        //    scale : Phaser.Scale.RESIZE,  
         //   autoCenter : Phaser.Scale.CENTER_HORIZONTALLY 
        //},
        backgroundColor: 0x000000,
        // physics settings
        physics: {
            default: "arcade",
            arcade : {
                debug: false
            }
        }
    }
    game = new Phaser.Game(config);

    WebFont.load({
        google: {
          families: ['Droid Sans', 'Droid Serif','Luckiest Guy']
        }
      });
   
}

class apoRunner extends Phaser.Scene{

    constructor(){
        super('ApoRunner');
    }

    preload(){
        this.load.image('sky','assets/sprites/backgrounds/1/sky.jpg');
        this.load.image('mountains','assets/sprites/backgrounds/1/mountains.png');
        this.load.image('foreground','assets/sprites/backgrounds/1/foreground.png');
        this.load.image('clouds1','assets/sprites/backgrounds/1/clouds1.png');
        this.load.image('clouds2','assets/sprites/backgrounds/1/clouds2.png');
        this.load.image('clouds3','assets/sprites/backgrounds/1/clouds3.png');
        this.load.image('platform3','assets/sprites/props/platform3.png');
        this.load.image('platform4','assets/sprites/props/platform4.png');
        this.load.image('platform5','assets/sprites/props/platform5.png');
        this.load.image('bridge','assets/sprites/props/bridge.png');
        this.load.image('snow','assets/sprites/props/snow.png');


        //Additional
        this.load.image('audio2','assets/sprites/ui/audio2.png');
        this.load.image('audiooff','assets/sprites/ui/audiooff.png');
        this.load.image('fullscreen','assets/sprites/ui/fullscreen.png');

        this.load.image('title','assets/sprites/ui/title.png');


        //Load Audio
        this.load.audio('jump','assets/audio/jump.ogg');
        this.load.audio('dead','assets/audio/dead.ogg');
        this.load.audio('omg','assets/audio/omg.ogg');
        this.load.audio('birds','assets/audio/birds.ogg');
        this.load.audio('cyclone','assets/audio/cyclone.ogg');
        this.load.audio('drill','assets/audio/drill.ogg');
        this.load.audio('soundtrack','assets/audio/soundtrack.ogg');

        //Load Player Sprite Sheets
        this.load.spritesheet('player', 'assets/sprites/character/girl.png',{ 
            frameWidth: 80, 
            frameHeight: 100,
            endframe: 12
        }
        ); 

        //Load the Zombie Sprites
        this.load.spritesheet('tornado', 'assets/sprites/tornado2.png',{ 
            frameWidth: 849, 
            frameHeight: 499,
            endframe: 3
        }
        ); 

         //Load Player Sprite Sheets
         this.load.spritesheet('birds', 'assets/sprites/props/birds.png',{ 
            frameWidth: 300, 
            frameHeight: 338,
            endframe: 2
        }
        );

        this.load.spritesheet('obstacle', 'assets/sprites/props/obstacle5.png',{ 
            frameWidth: 300, 
            frameHeight: 300,
            endframe: 3
        }
        );
     
    }

    create(){
        this.initSprites();
        //********* Initialize Audio and Input Components */
        this.initAudio();
        this.initInput();
         //Initialize UI
         this.initUI();

         this.initParticleEmitter();
    }

    initUI(){

        this.title = this.add.image(game.config.width/2, game.config.height/2 - 200,'title');

        this.playButton = this.add.text(game.config.width + 100 ,game.config.height/2 + 200,"Play",{ fontFamily: '"Luckiest Guy' ,fontSize: 60}).setOrigin(0.5,0.5);
        this.playButton.tint = 0x121212;
        
        var tween = this.tweens.add({
            targets: this.playButton,
            x: game.config.width/2,               // '+=100'
            y: game.config.height/2 +200,                   // '+=100'
            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 250,
            repeat: 0,            // -1: infinity
            yoyo: false
        });
        this.playButton.setInteractive()
        .on('pointerover', () =>{
            this.playButton.tint = 0xFF1760;
            var tween = this.tweens.add({
                targets: this.playButton,
                scaleX: 1.1,               // '+=100'
                scaleY: 1.1,                   // '+=100'
                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 50,
                repeat: 0,            // -1: infinity
                yoyo: false
            });   
        })
        .on('pointerout', () =>{
            this.playButton.tint = 0x121212;
            var tween = this.tweens.add({
                targets: this.playButton,
                scaleX: 1,               // '+=100'
                scaleY: 1,                   // '+=100'
                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 50,
                repeat: 0,            // -1: infinity
                yoyo: false
            });   

        })
        .on('pointerdown', () =>  {
            this.startGame();
        } );
        this.playButton.tint = 0x000000;

        

        this.distanceRun = this.add.text(game.config.width + 150 ,50,"Distance : 0m ",{ fontFamily: '"Luckiest Guy' ,fontSize: 25}).setOrigin(0.5,0.5);
        this.distanceRun.tint = 0xFF1760;
        this.distanceRun.depth = 100;

        this.bestDistance = this.add.text(-100 ,50,"Best : 0m ",{ fontFamily: '"Luckiest Guy' ,fontSize: 35}).setOrigin(0.5,0.5);
        this.bestDistance.tint = 0xFF1760;

        this.highscore = localStorage.getItem('highscore');
        if(this.highscore == null){
            this.highscore = 0;
        }
        this.bestDistance.text =   this.highscore + "m";


        var bestDistanceTween = this.tweens.add({
            targets: this.bestDistance,
            x:  100,               // '+=100'
            y: 50,                   // '+=100'
            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 200,
            repeat: 0,            // -1: infinity
            yoyo: false
        });   
        this.bestDistance.depth = 100;

       
        //Bottom text 
        this.bottomText = this.add.text(game.config.width/2 ,game.config.height + 100,"Deadbyte Game Studios",{ fontFamily: '"Luckiest Guy' ,fontSize: 28}).setOrigin(0.5,0.5);
        this.bottomText.tint = 0xFF1760;

        var bottomTextTween = this.tweens.add({
            targets: this.bottomText,
            x:  game.config.width/2,               // '+=100'
            y: game.config.height - 25,                   // '+=100'
            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 200,
            repeat: 0,            // -1: infinity
            yoyo: false
        });   

        this.toggleAudio = this.add.image(game.config.width - 100 ,50,'audio2').setOrigin(0.5,0.5);
        this.toggleAudio.setScale(0.5);
        this.toggleAudio.depth = 100;
        this.toggleAudio.setInteractive()
        .on('pointerover', () =>{
            this.toggleAudio.tint = 0xFF1760;
            var tween = this.tweens.add({
                targets: this.toggleAudio,
                scaleX: 0.55,               // '+=100'
                scaleY: 0.55,                   // '+=100'
                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 50,
                repeat: 0,            // -1: infinity
                yoyo: false
            });   
        })
        .on('pointerout', () =>{
            this.toggleAudio.tint = 0xffffff;
            var tween = this.tweens.add({
                targets: this.toggleAudio,
                scaleX: 0.5,               // '+=100'
                scaleY: 0.5,                   // '+=100'
                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 50,
                repeat: 0,            // -1: infinity
                yoyo: false
            });   

        })
        .on('pointerdown', () =>  {
            if(!this.sound.mute){
                this.sound.setMute(true);
                this.toggleAudio.setTexture('audiooff');
            }
            else{
                this.sound.setMute(false);
                this.toggleAudio.setTexture('audio2');
                console.log('sound unmuted');
            }

        } );


        this.fullscreenButton = this.add.image(game.config.width -50 ,50,'fullscreen').setOrigin(0.5,0.5);
        this.fullscreenButton.setScale(0.5);
        this.fullscreenButton.depth = 100;
        this.fullscreenButton.setInteractive()
        .on('pointerover', () =>{
            this.fullscreenButton.tint = 0xFF1760;
            var tween = this.tweens.add({
                targets: this.fullscreenButton,
                scaleX: 0.55,               // '+=100'
                scaleY: 0.55,                   // '+=100'
                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 50,
                repeat: 0,            // -1: infinity
                yoyo: false
            });   
        })
        .on('pointerout', () =>{
            this.fullscreenButton.tint = 0xffffff;
            var tween = this.tweens.add({
                targets: this.fullscreenButton,
                scaleX: 0.5,               // '+=100'
                scaleY: 0.5,                   // '+=100'
                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 50,
                repeat: 0,            // -1: infinity
                yoyo: false
            });   

        })
        .on('pointerdown', () =>  {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                // On stop fulll screen
            } else {
                this.scale.startFullscreen();
                // On start fulll screen
            }
        } );
    }

    startGame(){
        var tween = this.tweens.add({
            targets: this.title,
            x: game.config.width/2,               // '+=100'
            y: 25,                   // '+=100'
            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 100,
            scaleX : 0.4,
            scaleY : 0.4,
            repeat: 0,            // -1: infinity
            yoyo: false
        });
        var tweenBottom = this.tweens.add({
            targets : this.bottomText,
            x: game.config.width/2,               // '+=100'
            y: game.config.height + 100,                   // '+=100'
            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 200,
            repeat: 0,            // -1: infinity
            yoyo: false
        });

        var tweenPlayButton = this.tweens.add({
            targets : this.playButton,
            x: -200,               // '+=100'
            y: game.config.height/2 - 100,                   // '+=100'
            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 200,
            repeat: 0,            // -1: infinity
            yoyo: false
        });

        var bestTween = this.tweens.add({
            targets : this.bestDistance,
            x: -100,               // '+=100'
            y: 50,                   // '+=100'
            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 200,
            repeat: 0,            // -1: infinity
            yoyo: false
        });

        var tweenPlayButton = this.tweens.add({
            targets : [this.toggleAudio,this.fullscreenButton],
            x: game.config.width + 100,               // '+=100'
            y: 50,                   // '+=100'
            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 200,
            repeat: 0,            // -1: infinity
            yoyo: false
        });

        
        this.timedEvent = this.time.addEvent({    delay: 1000, callback: () => {this.player.scaleX = -this.player.scaleX; 
           
        },repeat: 1,  callbackScope: this,  });


        this.timedEvent = this.time.addEvent({    delay: 1000, callback: () => {
            var birdsFlyingTween = this.tweens.add({
                targets : [this.birds,this.birds1],
                x: game.config.width + 200,               // '+=100'
                y: game.config.height/2 - 200,                   // '+=100'
                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 1000,
                repeat: 0,            // -1: infinity
                yoyo: false
            });
            //Play birds sound
            this.birdsAudio.play();
           
        },repeat: 0,  callbackScope: this,  });
        this.timedEvent = this.time.addEvent({    delay: 1500, callback: () => {
            var tweenBottom = this.tweens.add({
                targets : this.tornadoSprite,
                x: -500,               // '+=100'
                y: -125,                   // '+=100'
                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 800,
                repeat: 0,            // -1: infinity
                yoyo: false
            });
            this.cycloneAudio.play();
         },repeat: 1,  callbackScope: this,  });
        this.timedEvent = this.time.addEvent({    delay: 2000, callback: () => {   
                var tweenPlayButton = this.tweens.add({
                targets : this.distanceRun,
                x: game.config.width - 100,               // '+=100'
                y: 50,                   // '+=100'
                ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                duration: 200,
                repeat: 0,            // -1: infinity
                yoyo: false
            }); 
            this.gameStarted = true;
            this.player.anims.play('run');
            for(var i = 0 ; i < globalVariables.platforms.length ; i++){
                globalVariables.platforms[i].body.setVelocityX(gameOptions.platformStartSpeed * -1);
            }
        },
            callbackScope: this,  
        });
    }

    initParticleEmitter(){

        //Particle Emitter for Snow

        var particles = this.add.particles('snow');
        var rect = new Phaser.Geom.Rectangle(0, game.config.height/2, game.config.width, game.config.height/2 );
        var emitter = particles.createEmitter({
            lifespan: 15000,
            accelerationY : 3,
            gravityY : 100,
            scale: {min : 0.01, max : 0.025},
            alpha : [0.1,0.3],
            quantity: 1,
            _frequency: 200,
            blendMode: 'ADD',
            emitZone: { source: new Phaser.Geom.Line(0, 0, game.config.width, 0 )},
            deathZone: { source: rect , type: 'onEnter'}
        });
        console.log('added the death zone');
        emitter.depth = -5;

    }

    initSprites(){
        this.add.image(game.config.width / 2,game.config.height  / 2,'sky'); 
        this.mountains = this.add.tileSprite(0,0,game.config.width,game.config.height,'mountains').setOrigin(0,0);
        this.clouds1 = this.add.tileSprite(0,0,game.config.width,game.config.height,'clouds1').setOrigin(0,0);
        this.clouds2 = this.add.tileSprite(0,0,game.config.width,game.config.height,'clouds2').setOrigin(0,0);
        this.clouds3 = this.add.tileSprite(0,0,game.config.width,game.config.height,'clouds3').setOrigin(0,0);
        this.foreground = this.add.tileSprite(0,0,game.config.width,game.config.height,'foreground').setOrigin(0,0);

          
        
        this.anims.create({
            key: 'rotate',
            frames: this.anims.generateFrameNumbers('obstacle', { start: 0, end: 2 }),
            frameRate: 80,
            repeat: -1
           });


            this.tornadoSprite = this.add.sprite(-1500,-250, "tornado").setOrigin(0,0);
            
 
            this.anims.create({
             key: 'torn',
             frames: this.anims.generateFrameNumbers('tornado', { start: 0, end: 2 }),
             frameRate: 12,
             repeat: -1
            });
            this.tornadoSprite.depth = 30;
            this.tornadoSprite.setScale(1.75);
            this.tornadoSprite.displayWidth = this.tornadoSprite.displayWidth - 300;
           // this.tornadoSprite.displayWidth = this.tornadoSprite.displayWidth + 100; 
            //this.tornadoSprite.displayHeight = game.config.height + 100;
            

             this.tornadoSprite.anims.play('torn');

            //this.zombie.anims.play('zombierun');

           // adding the player;
          
           this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height / 2, "player").setOrigin(0,0);
           this.player.setGravityY(gameOptions.playerGravity);
           this.player.setScale(1);
           this.player.body.setSize(45,90,100,100);
           this.player.body.onCollide = true;
           //this.player.body.collideWorldBounds = true;
           //Put the player in front of the platforms
           this.player.depth = 40;
            
   
           this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });

        this.birds1 = this.add.sprite(-250,game.config.height/2 - 200,'birds');
        this.birds = this.add.sprite(-200,game.config.height/2 - 100,'birds');
        this.birds.setScale(0.25);
        this.birds1.setScale(0.25);
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('birds', { start: 0, end: 1 }),
            frameRate: 6,
            repeat: -1
        });

        this.birds.anims.play('fly');
        this.birds1.anims.play('fly');

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player', { start: 10, end: 11 }),
            frameRate: 2.5,
            repeat: 0
        });

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 9 }),
            frameRate: 15,
            repeat: -1
        });
        
        this.player.anims.play('idle');

        //Add the first platform for the player to stand on!!!!!
        this.firstPlatformLower = this.add.tileSprite(0,game.config.height,game.config.width * 3,game.config.height/2 - 150,'platform4').setOrigin(0,1);
        this.firstPlatformUpper = this.add.tileSprite(0,this.firstPlatformLower.y - game.config.height/2 + 150 ,game.config.width * 3,50,'platform3').setOrigin(0,1);
        this.physics.add.existing(this.firstPlatformLower);
        this.physics.add.existing(this.firstPlatformUpper);
        this.firstPlatformUpper.body.setSize(this.firstPlatformUpper.width + 25,this.firstPlatformUpper.height,0,0);
        this.firstPlatformLower.body.setImmovable(true);
        this.firstPlatformUpper.body.setImmovable(true);
        //this.firstPlatformLower.body.allowGravity = false;
        //this.firstPlatformUpper.body.allowGravity = false;
        this.physics.add.collider(this.player, this.firstPlatformUpper);
        globalVariables.platforms.push(this.firstPlatformLower);
        globalVariables.platforms.push(this.firstPlatformUpper);
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
    }


    initAudio(){
        this.deadAudio = this.sound.add('dead');
        this.deadAudio.volume = .5;
        this.jumpAudio = this.sound.add('jump');
        this.jumpAudio.volume = .5;
        this.birdsAudio = this.sound.add('birds');
        this.birdsAudio.volume = .25;
        this.omgAudio = this.sound.add('omg');
        this.omgAudio.volume = .4;

        this.cycloneAudio = this.sound.add('cyclone');
        this.cycloneAudio.volume = 0.25;
        this.cycloneAudio.loop = true;
        this.drillAudio = this.sound.add('drill');
        this.drillAudio.volume = .45;

        this.soundtrackAudio = this.sound.add('soundtrack');
        this.soundtrackAudio.volume = .15;
        this.soundtrackAudio.play();
        this.soundtrackAudio.loop = true;

    }


    initInput(){
        // checking for input
        this.input.on("pointerdown", this.jump, this);
       // this.cursorKeys = this.input.keyboard.createCursorKeys();
        
       var spaceInput = this.input.keyboard.addKey('SPACE');
       spaceInput.on('down',this.jump,this);

    }

       // the core of the script: platform are added from the pool or created on the fly
    addPlatform(platformWidth, posX){
        let random = Phaser.Math.Between(0,100);
        //80% chance that the platform is a running platform
        if(random <= 90){
            let height = Phaser.Math.Between(150,350);
            height = height +  (50  - (height % 50));
            platformWidth = (platformWidth - (platformWidth % 50));
            this.platformLower = this.add.tileSprite(posX,game.config.height,platformWidth,height - 50,'platform4').setOrigin(0,1);
            this.platformUpper = this.add.tileSprite(posX,this.platformLower.y - height + 50 ,platformWidth,50,'platform3').setOrigin(0,1);
            this.physics.add.existing(this.platformLower);
            this.physics.add.existing(this.platformUpper);
            //this.platformLower.ground.body.allowGravity = false;
            //this.platformUpper.ground.body.allowGravity = false;
            this.platformUpper.body.setImmovable(true);
            this.platformLower.body.setImmovable(true);
            globalVariables.platforms.push(this.platformLower);
            globalVariables.platforms.push(this.platformUpper);
           // console.log(this.platformLower.width);
            //this.physics.add.collider(this.player, this.platformLower);
            this.physics.add.collider(this.player, this.platformUpper);

            for(var i = 0 ; i < globalVariables.platforms.length ; i++){
                globalVariables.platforms[i].body.setVelocityX(gameOptions.platformStartSpeed * -1);
            }
        }
        else{
            platformWidth = Phaser.Math.Between(platformWidth * 2, platformWidth * 4);
            platformWidth = platformWidth -  (platformWidth % 284);
            //console.log(platformWidth);
            this.previousPlatformWidth = platformWidth;
            this.bridge = this.add.tileSprite(posX,game.config.height/2 + 150,platformWidth,233,'bridge').setOrigin(0,0);
            this.physics.add.existing(this.bridge);
            
            this.bridge.body.setImmovable(true);
            globalVariables.platforms.push(this.bridge);

            this.physics.add.collider(this.player, this.bridge);
           
            //console.log(this.bridge.width);
            for(var i = 0 ; i < globalVariables.platforms.length ; i++){ 
                 globalVariables.platforms[i].body.setVelocityX(gameOptions.platformStartSpeed * -1);
            }
            
        }
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
      
    }

    addBigPlatform(platformWidth, posX){
        let height = Phaser.Math.Between(150,350);
        height = height +  (50  - (height % 50));
        platformWidth = (platformWidth - (platformWidth % 50));
        this.platformLower = this.add.tileSprite(posX,game.config.height,platformWidth,height - 50,'platform5').setOrigin(0,1);
        this.platformUpper = this.add.tileSprite(posX,this.platformLower.y - height + 50 ,platformWidth,50,'platform3').setOrigin(0,1);
        this.obstacle = this.physics.add.sprite(platformWidth/2,this.platformUpper.y - 50,'obstacle').setOrigin(.5,.5);
        this.platformLower.depth = 6;
        this.platformUpper.depth = 6;
        this.obstacle.depth = 5;
        this.obstacle.anims.play('rotate');
        this.obstacle.setScale(.75);
        this.obstacle.name = "drill";
        this.playDrillAudio = false;


        //this.platformUpper.addChild(this.obstacle);
        this.obstacle.body.setImmovable(true);
        this.physics.add.collider(this.player, this.obstacle,this.playerDeath,null,this);
        this.obstacle.body.setVelocityX(gameOptions.platformStartSpeed * -1);


        this.physics.add.existing(this.platformLower);
        this.physics.add.existing(this.platformUpper);
        //this.platformLower.ground.body.allowGravity = false;
        //this.platformUpper.ground.body.allowGravity = false;
        this.platformUpper.body.setImmovable(true);
        this.platformLower.body.setImmovable(true);
        globalVariables.platforms.push(this.platformLower);
        globalVariables.platforms.push(this.platformUpper);
        globalVariables.platforms.push(this.obstacle);
       // console.log(this.platformLower.width);
        this.physics.add.collider(this.player, this.platformLower);
        this.physics.add.collider(this.player, this.platformUpper);

        for(var i = 0 ; i < globalVariables.platforms.length ; i++){
            globalVariables.platforms[i].body.setVelocityX(gameOptions.platformStartSpeed * -1);
        }
    }


        // the player jumps when on the ground, or once in the air as long as there are jumps left and the first jump was on the ground
     jump(){
         if(this.gameStarted){
            if(this.player.body.touching.down || (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps)){
                if(this.player.body.touching.down){
                    this.playerJumps = 0;
                }
                this.player.setVelocityY(gameOptions.jumpForce * -1);
                //console.log('Jump!!');
                this.player.anims.play('jump').on('animationcomplete', () => {
                    
                    this.player.anims.play('run',true)
                });
                this.jumpAudio.play();
                this.playerJumps ++;
            }
         }
     }

    update(){
        
        //Player position is constant, the platforms/obstacles come closer to the player
        this.player.x = gameOptions.playerStartPosition;

        

        //console.log(globalVariables.platforms.length);

        //console.log('Platforms Array Length : ' + globalVariables.platforms.length);
        if(this.gameStarted){
            this.parallaxBackground(); 
            
            let minDistance = game.config.width;
        
        for(var i = 0 ; i < globalVariables.platforms.length ; i ++){

            let platformDistance = game.config.width - globalVariables.platforms[i].x - globalVariables.platforms[i].displayWidth;
            minDistance = Math.min(minDistance,platformDistance);
            
            if(globalVariables.platforms[i].name == 'drill'){
              //  console.log(globalVariables.platforms[i].x);
            }

            if(globalVariables.platforms[i].name == 'drill'){
                if(globalVariables.platforms[i].x < (game.config.width)  && !this.playDrillAudio){
                    //console.log('should play the audio now');
                  this.drillAudio.play();
                    this.playDrillAudio = true;
                }
            }

            //Delete the platforms that have moved to the left of the screen!!!
            if(globalVariables.platforms[i].x < (globalVariables.platforms[i].width * -1)){
                if(globalVariables.platforms[i].name == "drill"){
                    this.drillAudio.stop();
                    this.playDrillAudio = false;
                }
                globalVariables.platforms.shift();
            }
        }

        //Adding new platforms
           // adding new platforms
        if(minDistance > this.nextPlatformDistance){
           
            globalVariables.platformCount++;
            var bigPlatformSpawner = Phaser.Math.Between(4,7);
            if(globalVariables.platformCount == bigPlatformSpawner){
                var nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0] * 6, gameOptions.platformSizeRange[1] * 15);
                this.addBigPlatform(nextPlatformWidth, game.config.width);
                for(var i = 0 ; i < globalVariables.platforms.length ; i++){
                  //  console.log(i + " - " + globalVariables.platforms[i].x);
                }
                console.log('make big platform');
            }
            else{
                var nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
                this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth/2);
                for(var i = 0 ; i < globalVariables.platforms.length ; i++){
                  //  console.log(i + " - " + globalVariables.platforms[i].x);
                }
            }
            console.log("Platform Count: " + globalVariables.platformCount + " Random: " + bigPlatformSpawner);
    
            if(globalVariables.platformCount >= 7){
                globalVariables.platformCount = 0;
            }
        }
            
            //Start Score
            globalVariables.counter++;
            if(globalVariables.counter % 4 == 0){
                globalVariables.score++;
                this.distanceRun.text = "Distance: "  + globalVariables.score.toString() + "m";
            }

            
            if(this.player.y > game.config.height && !this.hasPlayerDied){
                this.playerDeath();
            }
           
        }

        if(this.moveBackground){
            this.parallaxBackground();
        }

    }

    playerDeath(){
        console.log('Player Death');
        this.cameras.main.shake(250);
        var particles = this.add.particles('snow');
        var emitter = particles.createEmitter({
            x: this.player.x,
            y: this.player.y,
            speed: { min: -800, max: 800 },
            angle: { min: 0, max: 360 },
            scale: {start : 0.2, end : 0.01},
            lifespan: 600,
            blendMode: 'NORMAL',
            tint: 0xFF1760,
        });
        emitter.explode(100,this.player.x,this.player.y);
        emitter.depth = 100;
        
        this.deadAudio.play();
        this.player.disableBody();
        this.player.setVisible(false);
        
        //Instantiate ParticleEffect
     

        //  Create an emitter by passing in a config object directly to the Particle Manager

    



        for(var i = 0 ; i < globalVariables.platforms.length ; i++){
            globalVariables.platforms[i].body.setVelocityX(0);
        }
        this.gameStarted = false;
        this.cycloneAudio.stop();


        if(globalVariables.score > this.highscore){ 
            localStorage.setItem('highscore',globalVariables.score);
        }    

        this.showDeadUI();
        this.hasPlayerDied = true;
    }

    showDeadUI(){

        this.timedEvent = this.time.addEvent({    
            delay: 1000, 
            callback: () =>{
                //Tornado sprite move
                    var tweenBottom = this.tweens.add({
                        targets : this.tornadoSprite,
                        x: -1500,               // '+=100'
                        y: -250,                   // '+=100'
                        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 800,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });

                    for(var i = 0 ; i < globalVariables.platforms.length ; i ++){
                        globalVariables.platforms[i].setVisible(false);
                    }


                    this.totalDistance = this.add.text(game.config.width /2,game.config.height/2 - 25,"0m",{ fontFamily: '"Luckiest Guy' ,fontSize: 50}).setOrigin(0.5,0.5);
                    this.totalDistance.text = globalVariables.score + "m";
                    this.totalDistance.tint = 0xFF1760;
                    this.best = this.add.text(game.config.width /2,game.config.height/2 + 50,"0m",{ fontFamily: '"Luckiest Guy' ,fontSize: 40}).setOrigin(0.5,0.5);
                    this.best.text = "Best: " + localStorage.getItem('highscore') + "m";
                    this.best.tint = 0x000000;


                    globalVariables.platforms = [];
                    globalVariables.score = 0 ;
                    globalVariables.counter = 0;
                    globalVariables.platformCount = 0;


                    //Toggle Audio Tween
                    var tween = this.tweens.add({
                        targets: this.toggleAudio,
                        x: game.config.width - 100,               // '+=100'
                        y: 50,                   // '+=100'
                        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 50,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });   
                    //Toggle fullScreen Tween
                    var tween = this.tweens.add({
                        targets: this.fullscreenButton,
                        x: game.config.width - 50,               // '+=100'
                        y: 50,                   // '+=100'
                        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 50,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });   
                    //Bottom Text Tween
                    var tween = this.tweens.add({
                        targets: this.bottomText,
                        x: game.config.width/2,               // '+=100'
                        y: game.config.height - 25,                   // '+=100'
                        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 50,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    }); 

                    //Main Title Tween
                    var tween = this.tweens.add({
                        targets: this.title,
                        x: game.config.width/2,               // '+=100'
                        y: game.config.height/2 - 200,   
                        scaleX : 1,
                        scaleY : 1,                // '+=100'
                        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 250,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });

                    //Distance Run Tween
                    var tween = this.tweens.add({
                        targets: this.distanceRun,
                        x: game.config.width + 100,               // '+=100'
                        y: 50,             // '+=100'
                        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 250,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });

                  


                    var plYButtonTween = this.tweens.add({
                        targets: this.title,
                        x: game.config.width/2,               // '+=100'
                        y: game.config.height/2 - 200,                   // '+=100'
                        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 100,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });




                    //Retry button
                    this.retryButton = this.add.text(game.config.width + 100 ,game.config.height/2 + 200,"Retry",{ fontFamily: '"Luckiest Guy' ,fontSize: 60}).setOrigin(0.5,0.5);
                    this.retryButton.tint = 0x121212;
                    
                    var tween = this.tweens.add({
                        targets: this.retryButton,
                        x: game.config.width/2,               // '+=100'
                        y: game.config.height/2 +200,                   // '+=100'
                        ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                        duration: 250,
                        repeat: 0,            // -1: infinity
                        yoyo: false
                    });
                    this.retryButton.setInteractive()
                    .on('pointerover', () =>{
                        this.retryButton.tint = 0xFF1760;
                        var tween = this.tweens.add({
                            targets: this.retryButton,
                            scaleX: 1.1,               // '+=100'
                            scaleY: 1.1,                   // '+=100'
                            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                            duration: 50,
                            repeat: 0,            // -1: infinity
                            yoyo: false
                        });   
                    })
                    .on('pointerout', () =>{
                        this.retryButton.tint = 0x121212;
                        var tween = this.tweens.add({
                            targets: this.retryButton,
                            scaleX: 1,               // '+=100'
                            scaleY: 1,                   // '+=100'
                            ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
                            duration: 50,
                            repeat: 0,            // -1: infinity
                            yoyo: false
                        });   
            
                    })
                    .on('pointerdown', () =>  {
                        this.scene.restart();
                        this.hasPlayerDied = false;
                    } );
            },
            repeat: 0,  
            callbackScope: this, 
         });
        
    }

    parallaxBackground(){
        //Move the background
        this.mountains.tilePositionX += 0.7;
        this.clouds1.tilePositionX += 0.3;
        this.clouds2.tilePositionX += 0.2;
        this.clouds3.tilePositionX += 0.3;
        this.foreground.tilePositionX += 0.9;
    }
};




