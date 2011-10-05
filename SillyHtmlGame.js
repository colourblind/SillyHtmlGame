var SillyHtmlGame = {
    canvas : null,
    context : null,
    balls : [],
    offsetPosition : { x : 0, y : 0 },
    mousePosition : { x : 0, y : 0 },
    screenCentre : { x : 0, y : 0 },
    maxDimension : 200,
    rotation : 0,
    radius : 50,
    lives : 0,
    score : 0,
    high_score : 0,
    ballSpeed : 1,
    gapWidth : 1,
    paused : true,
    timeToNextSpawn : 3000,
    spawnSpeed : 8000,
    message : 'Click to start',
    init : function(canvasId)
    {
        this.canvas = document.getElementById(canvasId);
        if (this.canvas.getContext)
        {
            this.context = this.canvas.getContext('2d');
            this.offsetPosition = getElementPosition(canvasId);
            this.screenCentre = { x : this.canvas.width / 2, y : this.canvas.height / 2 }

            this.maxDimension = Math.max(this.canvas.width, this.canvas.height);
        }
        else
        {
            return;
        }
        
        this.canvas.onmousemove = function(event) { SillyHtmlGame.mousePosition.x = event.clientX - SillyHtmlGame.offsetPosition.x + document.documentElement.scrollLeft; SillyHtmlGame.mousePosition.y = event.clientY - SillyHtmlGame.offsetPosition.y + document.documentElement.scrollTop; }
        this.canvas.onmouseup = function(event) { SillyHtmlGame.paused = !SillyHtmlGame.paused; SillyHtmlGame.message = 'Click to continue'; }
        
        setInterval(function() { SillyHtmlGame.update(); }, 40);
        
        this.reset();
    },
    reset : function()
    {
		this.spawnSpeed = 8000;
        this.score = 0;
        this.lives = 5;
	this.ballSpeed = 1;
	this.timeToNextSpawn = 3000;
	this.spawnSpeed = 8000;
    },
    update : function()
    {
        if (!this.paused)
        {
            this.timeToNextSpawn -= 40;
            if (this.timeToNextSpawn < 0)
                this.fire();
        
			// Calculate rotation angle
            this.rotation = normaliseAngle(Math.atan2(this.mousePosition.y - this.screenCentre.y, this.mousePosition.x - this.screenCentre.x));
            this.radius = Math.sqrt(Math.pow(this.mousePosition.x - this.screenCentre.y, 2) + Math.pow(this.mousePosition.y - this.screenCentre.y, 2));
            this.radius = Math.max(Math.abs(this.radius), 20);
            this.radius = Math.min(this.radius, this.maxDimension / 2 - 20);
        
            // Update and draw balls
            for (var i = 0; i < this.balls.length; i ++)
                this.balls[i].distance += this.ballSpeed;
            
            // Collisions and game logic
            for (var i = 0; i < this.balls.length; i ++)
            {
                // If a ball reaches the edge delete it and increment the score
                if (this.balls[i].distance > this.maxDimension / 2)
                {
                    this.score ++;
		    if (this.score > this.high_score)
		      {this.high_score++;}
                    this.balls.splice(i, 1); // remove from list
                    i --;
                    if (this.spawnSpeed > 1000) // speed up spawns
                        this.spawnSpeed -= 300;
                    continue;
                }
                
                // Check for collisions with the rings and handle accordingly
                if (this.collide(this.balls[i]))
                {
                    this.lives --;
                    this.balls.splice(i, 1);    // remove the ball that was hit
                    i --;                       // and tweak the iterator    
                    continue;
                }
            }
            
            if (this.lives <= 0)
            {
                this.balls.splice(0, this.balls.length);
                this.reset();
                this.paused = true;
                this.message = 'You dead, foo\'!\nClick to try again';
            }
        }
        
        this.draw();
    },
    draw : function()
    {
        this.context.fillStyle = '#f0f0f0';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);        

        for (var i = 0; i < this.balls.length; i ++)
        {
            var x = Math.cos(this.balls[i].direction) * this.balls[i].distance + this.screenCentre.x;
            var y = Math.sin(this.balls[i].direction) * this.balls[i].distance + this.screenCentre.y;            

            this.context.fillStyle = this.balls[i].colour;
            this.context.beginPath();
            this.context.arc(x, y, 5, 0, Math.PI * 2, false);
            this.context.closePath();
            this.context.fill();
        }

        // Draw rings
        this.context.lineWidth = 15;

        this.context.strokeStyle = '#ff8000';
        this.context.beginPath();
        this.context.arc(this.screenCentre.x, this.screenCentre.y, this.radius, this.rotation + this.gapWidth / 2, this.rotation + (Math.PI * 2 - this.gapWidth / 2), false);
        this.context.stroke();
        
        this.context.strokeStyle = '#707070';
        this.context.beginPath();
        this.context.arc(this.screenCentre.x, this.screenCentre.y, this.maxDimension / 2 - this.radius, this.rotation + this.gapWidth / 2 - Math.PI, this.rotation - Math.PI + (Math.PI * 2 - this.gapWidth / 2), false);
        this.context.stroke();
        
        // Draw UI
        this.context.fillStyle = '#707070';
        this.context.textAlign = 'center';
        this.context.font = '30px Arial bold';
        this.context.fillText(this.lives.toString(), 30, this.canvas.height - 20);
        this.context.fillText(this.score.toString(), this.canvas.width - 30, this.canvas.height - 20);
	this.context.fillText(this.high_score.toString(), this.canvas.width - 30, this.canvas.height - 360);
        
        // Prompt
        if (this.paused)
        {
            this.context.fillStyle = 'rgba(240, 240, 240, 0.8)';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);        
            this.context.fillStyle = '#707070';
            var messageLines = this.message.split('\n');
            for (var i = 0; i < messageLines.length; i ++)
                this.context.fillText(messageLines[i], this.canvas.width / 2, this.canvas.height / 2 - (messageLines.length - 1) / 2 * 35 + i * 35);
        }
    },
    fire : function()
    {
        var ball = new Object();
        ball.distance = 0;
        ball.direction = Math.random() * Math.PI * 2;
        ball.colour = '#000';
        this.balls.push(ball);
        this.timeToNextSpawn = this.spawnSpeed;
    },
    collide : function(ball)
    {
        var hitRingOne = ball.distance >= this.radius - 8 - 5
            && ball.distance <= this.radius + 7
            && !(Math.abs(ball.direction - this.rotation) < this.gapWidth / 2
            || Math.abs(ball.direction - this.rotation + Math.PI * 2) < this.gapWidth / 2
            || Math.abs(ball.direction - this.rotation - Math.PI * 2) < this.gapWidth / 2);
        
        var radius2 = this.maxDimension / 2 - this.radius;
        var rotation2 = normaliseAngle(this.rotation - Math.PI);
        var hitRingTwo = ball.distance >= radius2 - 8 - 5
            && ball.distance <= radius2 + 7
            && (Math.abs(ball.direction - rotation2) > this.gapWidth / 2
            || Math.abs(ball.direction - rotation2 + Math.PI * 2) < this.gapWidth / 2
            || Math.abs(ball.direction - rotation2 - Math.PI * 2) < this.gapWidth / 2);
            
        return hitRingOne || hitRingTwo;
    },
    collisionTest : function(resultElementId)
    {
        var ball = new Object();
        ball.distance = 150;
        ball.direction = 0;
    
        this.radius = 150;
        var data = '<table cellspacing="0"><tr>\n';
        for (var i = 0; i < Math.PI * 2; i += Math.PI / 16)
        {
            data += '<td><table cellspacing="0">\n';
            ball.direction = i;
            for (var j = 0; j < Math.PI * 2; j += Math.PI / 16)
            {
                this.rotation = j;
                var collide = this.collide(ball);
                data += '  <tr style="background-color: ' + (collide ? '#ff8080' : '#80ff80') + ';">\n';
                data += '  <td>' + this.rotation + '</td>\n';
                data += '  <td>' + ball.direction + '</td>\n';
                data += '  <td>' + collide + '</td>\n';
                data += '  </tr>\n';
            }
            data += '</table></td>';
        }
        data += '</tr></table>\n';
        
        var resultTarget = document.getElementById(resultElementId);
        resultTarget.innerHTML = data;
    }
}

function getElementPosition(elementId)
{
    var result = { x: 0, y: 0 }
    var element = document.getElementById(elementId)
    while (element != null)
    {
        result.x += element.offsetLeft;
        result.y += element.offsetTop;
        element = element.offsetParent;
    }
    return result;
}

function normaliseAngle(radians)
{
    // TODO: Handle Math.PI * 6, etc.
    if (radians >= Math.PI * 2)
        radians -= Math.PI * 2;
    else if (radians < 0)
        radians += Math.PI * 2;
    return radians;
}
