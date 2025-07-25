document.addEventListener('DOMContentLoaded', function() {
    // Inicialización de KeyAuth
    const keyauth = new KeyAuth(
        "RatBoxXD",       // Nombre de tu aplicación en KeyAuth
        "zAkYjehudN",     // Owner ID de tu panel
        "1.0",             // Versión
        "63365d97ef9b38dfa6c51492b25cbd51ee415a9275239f06bc10175001906a36" // Secret (desde el dashboard)
    );

    // Configuración de particles.js
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ff2a6d"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 2,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ff2a6d",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 1,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 0.5
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });

    // DOM elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectFilesBtn = document.getElementById('selectFiles');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadLoader = document.getElementById('uploadLoader');
    const fileInfo = document.getElementById('fileInfo');
    const resultContainer = document.getElementById('resultContainer');
    const resultFileName = document.getElementById('resultFileName');
    const resultFileSize = document.getElementById('resultFileSize');
    const fileLink = document.getElementById('fileLink');
    const copyBtn = document.getElementById('copyBtn');
    const newUploadBtn = document.getElementById('newUploadBtn');
    
    let selectedFile = null;

    // Inicializar KeyAuth
    async function initializeApp() {
        try {
            await keyauth.init();
            if (!keyauth.session) {
                window.location.href = "login.html";
            }
        } catch (error) {
            showError("Error de autenticación: " + error.message);
        }
    }

    // Event listeners
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    uploadBtn.addEventListener('click', handleUpload);
    copyBtn.addEventListener('click', copyToClipboard);
    newUploadBtn.addEventListener('click', resetUploader);

    // Inicializar la aplicación
    initializeApp();

    // Functions
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('active');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }

    function processFile(file) {
        if (file.size > 10 * 1024 * 1024) { // Límite de 10MB de KeyAuth
            showError('El archivo excede el límite de 10MB');
            return;
        }

        const forbiddenTypes = ['exe', 'scr', 'jar', 'bat', 'cmd', 'msi', 'dll', 'ps1'];
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (forbiddenTypes.includes(fileExt)) {
            showError('Tipo de archivo no permitido');
            return;
        }

        selectedFile = file;
        
        fileInfo.innerHTML = `
            <p><strong>${file.name}</strong></p>
            <p>${formatFileSize(file.size)}</p>
        `;
        fileInfo.classList.add('show');
        uploadBtn.disabled = false;
    }

    function showError(message) {
        fileInfo.innerHTML = `<p style="color: var(--neon-pink)">${message}</p>`;
        fileInfo.classList.add('show');
        setTimeout(() => {
            fileInfo.classList.remove('show');
            setTimeout(() => fileInfo.innerHTML = '', 500);
        }, 3000);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function handleUpload() {
        if (!selectedFile) return;
        
        uploadBtn.disabled = true;
        
        try {
            // Verificar licencia primero
            const licenseValid = await keyauth.license();
            if (!licenseValid) {
                throw new Error('Licencia no válida o expirada');
            }

            // Subir a KeyAuth
            const fileBase64 = await fileToBase64(selectedFile);
            const uploadResult = await keyauth.fileUpload(
                generateFileId(selectedFile.name),
                fileBase64.split(',')[1]
            );

            if (uploadResult.success) {
                const fileUrl = `https://keyauth.com/api/1.2/file/?fileid=${uploadResult.fileid}&ownerid=TU_OWNER_ID`;
                
                resultFileName.textContent = selectedFile.name;
                resultFileSize.textContent = formatFileSize(selectedFile.size);
                fileLink.value = fileUrl;
                
                createDownloadButton(fileUrl, selectedFile.name);
                
                document.querySelector('.upload-container').style.display = 'none';
                resultContainer.style.display = 'block';
            } else {
                throw new Error(uploadResult.message || 'Error al subir');
            }
        } catch (error) {
            showError(`Error: ${error.message}`);
            uploadBtn.disabled = false;
        }
    }

    function createDownloadButton(url, filename) {
        const oldBtn = document.getElementById('dynamicDownloadBtn');
        if (oldBtn) oldBtn.remove();
        
        const downloadBtn = document.createElement('a');
        downloadBtn.id = 'dynamicDownloadBtn';
        downloadBtn.href = url;
        downloadBtn.download = filename;
        downloadBtn.className = 'btn-download';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Descargar Ahora';
        downloadBtn.style.display = 'block';
        downloadBtn.style.marginTop = '15px';
        downloadBtn.style.background = 'linear-gradient(45deg, #05d9e8, #d300c5)';
        downloadBtn.style.color = 'white';
        downloadBtn.style.padding = '12px 20px';
        downloadBtn.style.borderRadius = '5px';
        downloadBtn.style.textDecoration = 'none';
        downloadBtn.style.fontWeight = '600';
        downloadBtn.style.transition = 'all 0.3s ease';
        downloadBtn.style.boxShadow = '0 0 15px rgba(5, 217, 232, 0.5)';
        
        fileLink.parentNode.insertBefore(downloadBtn, fileLink.nextSibling);
    }

    async function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    function generateFileId(filename) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        result += `-${Math.floor(Math.random() * 9) + 1}`;
        
        const ext = filename.split('.').pop();
        return `${result}.${ext}`;
    }

    function copyToClipboard() {
        fileLink.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }

    function resetUploader() {
        selectedFile = null;
        fileInput.value = '';
        fileInfo.innerHTML = '';
        fileInfo.classList.remove('show');
        uploadBtn.disabled = true;
        
        const downloadBtn = document.getElementById('dynamicDownloadBtn');
        if (downloadBtn) downloadBtn.remove();
        
        document.querySelector('.upload-container').style.display = 'block';
        resultContainer.style.display = 'none';
    }
});