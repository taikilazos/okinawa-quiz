class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Player
        this.player = {
            x: this.width / 2,
            y: this.height - 100,
            size: 20,
            speed: 3
        };
        
        // Interactive locations
        this.interactions = {
            center: {
                x: this.width / 2,
                y: this.height / 2,
                size: 40,
                name: '答',
                photos: [
                    '../imgs/math_main.png',
                    '../imgs/crossword_main.png',
                    '../imgs/geo_main.png'
                ]
            },
            left: {
                x: 150,
                y: this.height / 2,
                size: 30,
                name: '壱',
                photos: [
                    '../imgs/math_1.png',
                    '../imgs/math_2.png',
                    '../imgs/math_3.png',
                    '../imgs/math_4.png',
                    '../imgs/math_5.png'
                ]
            },
            top: {
                x: this.width / 2,
                y: 150,
                size: 30,
                name: '弐',
                photos: [
                    '../imgs/crossword.png'
                ]
            },
            right: {
                x: this.width - 150,
                y: this.height / 2,
                size: 30,
                name: '参',
                photos: [
                    '../imgs/geo_1.png',
                    '../imgs/geo_2.png',
                    '../imgs/geo_3.png',
                    '../imgs/geo_4.png',
                    '../imgs/geo_5.png'
                ]
            }
        };
        
        // Room boundaries
        this.roomBounds = {
            left: 50,
            right: this.width - 50,
            top: 50,
            bottom: this.height - 50
        };
        
        this.currentPhotoIndex = 0;
        this.keys = {};
        this.nearInteraction = null;
        this.shisaImage = null;
        this.currentInteraction = null;
        
        this.loadShisaImage();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    loadShisaImage() {
        this.shisaImage = new Image();
        this.shisaImage.onload = () => {
            console.log('Shisa image loaded successfully');
        };
        this.shisaImage.onerror = () => {
            console.log('Failed to load Shisa image');
            this.shisaImage = null;
        };
        this.shisaImage.src = '../imgs/shisa.png';
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Interaction with any panel
            if (e.key.toLowerCase() === 'f' && this.nearInteraction) {
                this.showPhoto(this.nearInteraction);
            }
            
            // Close photo with ESC
            if (e.key === 'Escape') {
                this.hidePhoto();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Close modal with X button
        document.getElementById('closeModal').addEventListener('click', (e) => {
            e.preventDefault();
            this.hidePhoto();
        });
        
        // Navigation arrows
        document.getElementById('prevPhoto').addEventListener('click', () => {
            this.showPreviousPhoto();
        });
        
        document.getElementById('nextPhoto').addEventListener('click', () => {
            this.showNextPhoto();
        });
    }
    
    update() {
        // Player movement
        if (this.keys['w'] || this.keys['arrowup']) {
            this.player.y = Math.max(this.roomBounds.top, this.player.y - this.player.speed);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.player.y = Math.min(this.roomBounds.bottom, this.player.y + this.player.speed);
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.x = Math.max(this.roomBounds.left, this.player.x - this.player.speed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.player.x = Math.min(this.roomBounds.right, this.player.x + this.player.speed);
        }
        
        // Check if player is near any interaction
        this.nearInteraction = null;
        for (const [key, interaction] of Object.entries(this.interactions)) {
            const distance = Math.sqrt(
                Math.pow(this.player.x - interaction.x, 2) + 
                Math.pow(this.player.y - interaction.y, 2)
            );
            
            if (distance < 60) {
                this.nearInteraction = interaction;
                break;
            }
        }
        

    }
    
    render() {
        this.drawBackground();
        this.drawInteractivePanels();
        this.drawPlayer();
    }
    
    drawBackground() {
        // Fill everything with sand background
        this.ctx.fillStyle = '#FEF9E7';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw sand texture across the entire canvas
        this.drawSandTexture();
    }
    
    drawSandTexture() {
        this.ctx.strokeStyle = '#F7DC6F';
        this.ctx.lineWidth = 1;
        
        // Draw sand texture across the entire canvas
        for (let i = 0; i < 12; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * 50);
            
            for (let x = 0; x < this.width; x += 25) {
                this.ctx.lineTo(x, i * 50 + Math.sin(x * 0.02) * 6);
            }
            this.ctx.stroke();
        }
    }
    
    drawInteractivePanels() {
        for (const [key, interaction] of Object.entries(this.interactions)) {
            this.drawPanel(interaction, key);
        }
    }
    
    drawPanel(interaction, key) {
        const isNear = this.nearInteraction === interaction;
        const x = interaction.x;
        const y = interaction.y;
        const size = interaction.size;
        
        // Draw Shisa image if loaded, otherwise fallback to simple rectangle
        if (this.shisaImage) {
            // Calculate image dimensions to fit nicely within the interaction area
            const imageSize = size * 1.2; // Make it bigger and more visible
            const imageX = x - imageSize/2;
            const imageY = y - imageSize/2;
            
            // Add glow effect when near
            if (isNear) {
                this.ctx.shadowColor = '#FF8E53';
                this.ctx.shadowBlur = 15;
            }
            
            // Draw the Shisa image
            this.ctx.drawImage(this.shisaImage, imageX, imageY, imageSize, imageSize);
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        } else {
            // Fallback: simple colored rectangle
            this.ctx.fillStyle = isNear ? '#FF8E53' : '#C0C0C0';
            this.ctx.fillRect(x - size/2, y - size/2, size, size);
        }
        
        // Panel label below the Shisa
        this.ctx.fillStyle = '#8B4513';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(interaction.name, x, y + size/2 + 15);
        
        // Interaction indicator
        if (isNear) {
            this.ctx.fillStyle = '#FF8E53';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press F to interact', x, y - size/2 - 10);
        }
    }
    
    drawPlayer() {
        const playerX = this.player.x;
        const playerY = this.player.y;
        const size = this.player.size;
        
        // Body
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(
            playerX - size/3, 
            playerY - size/3, 
            size * 2/3, 
            size * 2/3
        );
        
        // Head
        this.ctx.fillStyle = '#fdbcb4';
        this.ctx.beginPath();
        this.ctx.arc(playerX, playerY - size/2, size/3, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Hair
        this.ctx.fillStyle = '#8b4513';
        this.ctx.beginPath();
        this.ctx.arc(playerX, playerY - size/2 - 2, size/3, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.fillStyle = '#fdbcb4';
        this.ctx.beginPath();
        this.ctx.arc(playerX, playerY - size/2, size/3 - 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Arms
        this.ctx.fillStyle = '#fdbcb4';
        this.ctx.fillRect(
            playerX - size/2, 
            playerY - size/4, 
            size/4, 
            size/2
        );
        this.ctx.fillRect(
            playerX + size/4, 
            playerY - size/4, 
            size/4, 
            size/2
        );
        
        // Legs
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(
            playerX - size/4, 
            playerY + size/3, 
            size/6, 
            size/3
        );
        this.ctx.fillRect(
            playerX + size/6, 
            playerY + size/3, 
            size/6, 
            size/3
        );
        
        // Shoes
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(
            playerX - size/4, 
            playerY + size/2, 
            size/6, 
            size/6
        );
        this.ctx.fillRect(
            playerX + size/6, 
            playerY + size/2, 
            size/6, 
            size/6
        );
    }
    
    showPhoto(interaction) {
        const modal = document.getElementById('photoModal');
        const photoImg = document.getElementById('currentPhoto');
        
        // Store current interaction and reset photo index
        this.currentInteraction = interaction;
        this.currentPhotoIndex = 0;
        
        // Show first photo from the interaction
        photoImg.src = interaction.photos[this.currentPhotoIndex];
        modal.style.display = 'flex';
    }
    
    showPreviousPhoto() {
        if (!this.currentInteraction) return;
        
        // Go to previous photo, but don't loop around
        if (this.currentPhotoIndex > 0) {
            this.currentPhotoIndex--;
            const photoImg = document.getElementById('currentPhoto');
            photoImg.src = this.currentInteraction.photos[this.currentPhotoIndex];
        }
    }
    
    showNextPhoto() {
        if (!this.currentInteraction) return;
        
        // Go to next photo, but don't loop around
        if (this.currentPhotoIndex < this.currentInteraction.photos.length - 1) {
            this.currentPhotoIndex++;
            const photoImg = document.getElementById('currentPhoto');
            photoImg.src = this.currentInteraction.photos[this.currentPhotoIndex];
        }
    }
    
    hidePhoto() {
        document.getElementById('photoModal').style.display = 'none';
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});
