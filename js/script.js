document.addEventListener('DOMContentLoaded', function() {
    // Verificar si es móvil
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        document.querySelector('.mobile-warning').style.display = 'flex';
    }

    // Navegación del menú
    const menuLinks = document.querySelectorAll('.neon-link');
    const sections = document.querySelectorAll('section');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('section-active');
                section.classList.add('hidden');
            });
            
            const target = this.getAttribute('href');
            document.querySelector(target).classList.remove('hidden');
            document.querySelector(target).classList.add('section-active');
        });
    });

    // Duplicación de sitios
    const duplicateBtn = document.getElementById('duplicate-btn');
    const urlInput = document.getElementById('url-input');
    const resultSection = document.getElementById('result-section');
    const fileList = document.getElementById('file-list');
    const downloadBtn = document.getElementById('download-btn');
    
    // Lista de dominios restringidos
    const restrictedDomains = [
        'google.com',
        'facebook.com',
        'twitter.com',
        'instagram.com',
        'linkedin.com',
        'github.com',
        'youtube.com',
        'twentyfox.lat',
        'novablaze.shop',
        'ratalittleyt.github.io',
        'whatsapp.com'
    ];
    
    let siteContent = {};
    let domain = '';
    
    duplicateBtn.addEventListener('click', async function() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Por favor ingresa una URL');
            return;
        }
        
        try {
            // Extraer dominio
            let parsedUrl;
            try {
                parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
                domain = parsedUrl.hostname.replace('www.', '');
            } catch (e) {
                showError('URL no válida');
                return;
            }
            
            // Verificar si el dominio está restringido
            if (restrictedDomains.some(d => domain.includes(d))) {
                showError(`No se puede duplicar ${domain} por restricciones`);
                return;
            }
            
            // Mostrar carga
            duplicateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            duplicateBtn.disabled = true;
            
            // Usar proxy CORS para desarrollo (solo para pruebas)
            // NOTA: Esto puede fallar, en producción necesitas tu propio backend
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const targetUrl = encodeURIComponent(parsedUrl.href);
            
            // Obtener el HTML principal
            const response = await fetch(proxyUrl + targetUrl);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const html = await response.text();
            
            // Almacenar contenido
            siteContent = {
                'index.html': html
            };
            
            // Mostrar resultados
            showResults(domain);
            
        } catch (error) {
            showError(`Error al duplicar el sitio: ${error.message}`);
            console.error('Error completo:', error);
        } finally {
            duplicateBtn.innerHTML = '<i class="fas fa-copy"></i> Duplicate';
            duplicateBtn.disabled = false;
        }
    });
    
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.color = '#ff3366';
        errorDiv.style.marginTop = '10px';
        
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        urlInput.insertAdjacentElement('afterend', errorDiv);
        
        urlInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            urlInput.style.animation = '';
        }, 500);
    }
    
    function showResults(domain) {
        fileList.innerHTML = '';
        
        // Mostrar archivo principal
        const mainFile = document.createElement('div');
        mainFile.innerHTML = `<i class="fas fa-file-code"></i> index.html (${formatBytes(siteContent['index.html'].length)})`;
        fileList.appendChild(mainFile);
        
        resultSection.classList.remove('hidden');
        resultSection.classList.add('section-active');
        
        downloadBtn.onclick = function() {
            downloadZip(domain);
        };
    }
    
    async function downloadZip(domain) {
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparando descarga...';
        downloadBtn.disabled = true;
        
        try {
            // Cargar JSZip dinámicamente
            const JSZip = await loadJSZip();
            const zip = new JSZip();
            
            // Agregar HTML principal
            zip.file('index.html', siteContent['index.html']);
            
            // Generar ZIP
            const zipContent = await zip.generateAsync({ type: 'blob' });
            
            // Crear enlace de descarga
            const zipName = `${domain}-ByNovaBlaze.zip`;
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(zipContent);
            downloadLink.download = zipName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
        } catch (error) {
            showError(`Error al generar ZIP: ${error.message}`);
            console.error('Error al generar ZIP:', error);
        } finally {
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Descargar ZIP';
            downloadBtn.disabled = false;
        }
    }
    
    function loadJSZip() {
        return new Promise((resolve, reject) => {
            if (window.JSZip) {
                resolve(window.JSZip);
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => resolve(window.JSZip);
            script.onerror = () => reject(new Error('Error al cargar JSZip'));
            document.head.appendChild(script);
        });
    }
    
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Animación de partículas
    createParticles();
});

function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        const hue = Math.floor(Math.random() * 20 + 330);
        const color = `hsla(${hue}, 100%, 70%, ${Math.random() * 0.5 + 0.1})`;
        
        particle.style.cssText = `
            position: absolute;
            top: ${posY}%;
            left: ${posX}%;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            pointer-events: none;
            animation: float-particle ${duration}s linear ${delay}s infinite;
        `;
        
        particlesContainer.appendChild(particle);
    }
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float-particle {
            0% {
                transform: translateY(0) translateX(0);
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
            100% {
                transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '-' : ''}${Math.random() * 100}px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}