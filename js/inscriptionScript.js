document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('inscriptionForm');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    // Verifica que los elementos existen antes de usarlos
    if (sidebarToggle && sidebar) {
        // Toggle sidebar en móviles
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    if (form) {
        // Envío del formulario
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Obtener elementos de las fotos
            const studentPhoto = form.elements['student_photo'];
            const repPhoto = form.elements['representative_photo'];

            // Validar tamaño de las fotos
            if (studentPhoto.files.length > 0 && studentPhoto.files[0].size > 2 * 1024 * 1024) {
                alert('La foto del estudiante excede el tamaño máximo de 2MB');
                return;
            }

            if (repPhoto.files.length > 0 && repPhoto.files[0].size > 2 * 1024 * 1024) {
                alert('La foto del representante excede el tamaño máximo de 2MB');
                return;
            }

            // Crear FormData para enviar archivos
            const formData = new FormData(form);

            try {
                // IMPORTANTE: No establecer Content-Type manualmente
                const response = await fetch('http://localhost:3000/inscripcion', {
                    method: 'POST',
                    body: formData // El navegador establecerá automáticamente el Content-Type con el boundary
                });

                if (response.ok) {
                    const result = await response.json();
                    alert(result.message || '¡Inscripción guardada exitosamente!');
                    form.reset();
                    
                    // Restaurar vistas previas si las hubiera
                    if (studentPhotoPreview) studentPhotoPreview.style.display = 'none';
                    if (repPhotoPreview) repPhotoPreview.style.display = 'none';
                } else {
                    const errorData = await response.json();
                    alert('Error al guardar la inscripción: ' + (errorData.message || response.statusText));
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                alert('Ocurrió un error al enviar los datos: ' + error.message);
            }
        });
    }
});