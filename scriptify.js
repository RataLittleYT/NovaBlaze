document.addEventListener('DOMContentLoaded', function() {
    // Configuración de GitHub (DEBES MODIFICAR ESTOS VALORES)
    const GITHUB_CONFIG = {
        USERNAME: 'RataLittleYT',      // Tu nombre de usuario de GitHub
        REPO: 'NovaBlaze',            // Nombre del repositorio donde se guardarán los archivos
        TOKEN: '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',  // Token de acceso personal de GitHub
        BRANCH: 'main'             // Rama del repositorio (normalmente 'main' o 'master')
    };

    // Initialize particles.js (igual que antes)
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

    // DOM elements (igual que antes)
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

    // Event listeners (igual que antes)
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    uploadBtn.addEventListener('click', handleUpload);
    copyBtn.addEventListener('click', copyToClipboard);
    newUploadBtn.addEventListener('click', resetUploader);

    // Functions (las funciones anteriores permanecen iguales hasta handleUpload)
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
        // Check file size (max 100MB para GitHub, no 200MB)
        if (file.size > 100 * 1024 * 1024) {
            showError('File size exceeds 100MB limit (GitHub restriction)');
            return;
        }

        // Check file type
        const forbiddenTypes = ['exe', 'scr', 'jar', 'bat', 'cmd', 'msi', 'dll', 'ps1'];
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (forbiddenTypes.includes(fileExt)) {
            showError('This file type is not allowed for security reasons');
            return;
        }

        selectedFile = file;
        
        // Display file info
        fileInfo.innerHTML = `
            <p><strong>${file.name}</strong></p>
            <p>${formatFileSize(file.size)}</p>
        `;
        fileInfo.classList.add('show');
        
        // Enable upload button
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

    // FUNCIÓN MODIFICADA PARA USAR GITHUB API
    async function handleUpload() {
        if (!selectedFile) return;
        
        // Show loading state
        uploadBtn.disabled = true;
        
        try {
            // Subir el archivo a GitHub
            const uploadResult = await uploadToGitHub(selectedFile);
            
            if (uploadResult.content) {
                // Construir la URL de descarga directa
                const fileUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.USERNAME}/${GITHUB_CONFIG.REPO}/${GITHUB_CONFIG.BRANCH}/${uploadResult.content.path}`;
                
                // Mostrar resultados
                resultFileName.textContent = selectedFile.name;
                resultFileSize.textContent = formatFileSize(selectedFile.size);
                fileLink.value = fileUrl;
                
                // Ocultar cargador, mostrar resultados
                document.querySelector('.upload-container').style.display = 'none';
                resultContainer.style.display = 'block';
            } else {
                throw new Error(uploadResult.message || 'Error al subir el archivo');
            }
        } catch (error) {
            showError(`Error: ${error.message}`);
            uploadBtn.disabled = false;
        }
    }

    // NUEVA FUNCIÓN PARA SUBIR A GITHUB
    async function uploadToGitHub(file) {
        // Generar un nombre de archivo único con el formato que pediste
        const uniqueFilename = generateFileId(file.name);
        
        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.USERNAME}/${GITHUB_CONFIG.REPO}/contents/${uniqueFilename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Upload ${uniqueFilename} via NovaBlaze Ratbox`,
                content: await fileToBase64(file),
                branch: GITHUB_CONFIG.BRANCH
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload file');
        }
        
        return await response.json();
    }

    // NUEVA FUNCIÓN PARA CONVERTIR FILE A BASE64
    async function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    function generateFileId(filename) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        // Generate random ID part (8 characters)
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Add dash and random number (1-9)
        result += `-${Math.floor(Math.random() * 9) + 1}`;
        
        // Add file extension
        const ext = filename.split('.').pop();
        return `${result}.${ext}`;
    }

    function copyToClipboard() {
        fileLink.select();
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }

    function resetUploader() {
        // Reset file selection
        selectedFile = null;
        fileInput.value = '';
        fileInfo.innerHTML = '';
        fileInfo.classList.remove('show');
        uploadBtn.disabled = true;
        
        // Show uploader, hide result
        document.querySelector('.upload-container').style.display = 'block';
        resultContainer.style.display = 'none';
    }
});