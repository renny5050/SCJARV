        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('inscriptionForm');
            const sidebarToggle = document.getElementById('sidebarToggle');
            const sidebar = document.getElementById('sidebar');
            
            // Toggle sidebar en móviles
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('active');
            });
            
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
                    const response = await fetch('https://tu-endpoint.com/api/inscripcion', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        alert('¡Inscripción guardada exitosamente!');
                        form.reset();
                    } else {
                        alert('Error al guardar la inscripción.');
                    }
                } catch (error) {
                    alert('Ocurrió un error al enviar los datos.');
                    console.error(error);
                }
            });
        });
