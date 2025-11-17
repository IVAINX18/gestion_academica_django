from django.db import models

class Docente(models.Model):
    id_docente = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, null=True, blank=True)
    correo = models.CharField(max_length=100, null=True, blank=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    
    class Meta:
        db_table = 'docentes'
        managed = False
        verbose_name = 'Docente'
        verbose_name_plural = 'Docentes'
    
    def __str__(self):
        return self.nombre or f"Docente {self.id_docente}"


class Curso(models.Model):
    ESTADO_CHOICES = [
        ('Activo', 'Activo'),
        ('Pendiente', 'Pendiente'),
    ]
    
    id_curso = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, null=True, blank=True)
    codigo = models.CharField(max_length=20, null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    estado = models.CharField(max_length=9, choices=ESTADO_CHOICES, null=True, blank=True)
    id_docente = models.ForeignKey(
        Docente, 
        on_delete=models.DO_NOTHING, 
        db_column='id_docente',
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'cursos'
        managed = False
        verbose_name = 'Curso'
        verbose_name_plural = 'Cursos'
    
    def __str__(self):
        return f"{self.nombre} ({self.codigo})" if self.nombre and self.codigo else f"Curso {self.id_curso}"


class Estudiante(models.Model):
    id_estudiante = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, null=True, blank=True)
    id_curso = models.ForeignKey(
        Curso, 
        on_delete=models.DO_NOTHING, 
        db_column='id_curso',
        null=True,
        blank=True
    )
    nota_final = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    
    class Meta:
        db_table = 'estudiantes'
        managed = False
        verbose_name = 'Estudiante'
        verbose_name_plural = 'Estudiantes'
    
    def __str__(self):
        return self.nombre or f"Estudiante {self.id_estudiante}"
    
    @property
    def estado(self):
        """Calcula el estado basado en la nota final"""
        if self.nota_final is None:
            return 'Sin Calificar'
        return 'Aprobado' if self.nota_final >= 3.0 else 'Reprobado'


class Actividad(models.Model):
    TIPO_CHOICES = [
        ('Tarea', 'Tarea'),
        ('Taller', 'Taller'),
        ('Examen', 'Examen'),
        ('Trabajo', 'Trabajo'),
        ('Quiz', 'Quiz'),
    ]
    
    ESTADO_CHOICES = [
        ('Activo', 'Activo'),
        ('Pendiente', 'Pendiente'),
    ]
    
    id_actividad = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, null=True, blank=True)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES, null=True, blank=True)
    fecha_entrega = models.DateField(null=True, blank=True)
    porcentaje = models.IntegerField(null=True, blank=True)
    estado = models.CharField(max_length=9, choices=ESTADO_CHOICES, null=True, blank=True)
    id_curso = models.ForeignKey(
        Curso, 
        on_delete=models.DO_NOTHING, 
        db_column='id_curso',
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'actividades'
        managed = False
        verbose_name = 'Actividad'
        verbose_name_plural = 'Actividades'
    
    def __str__(self):
        return f"{self.nombre} - {self.tipo}" if self.nombre and self.tipo else f"Actividad {self.id_actividad}"