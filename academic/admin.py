from django.contrib import admin
from .models import Docente, Curso, Estudiante, Actividad

@admin.register(Docente)
class DocenteAdmin(admin.ModelAdmin):
    list_display = ['id_docente', 'nombre', 'correo', 'telefono']
    search_fields = ['nombre', 'correo']
    list_per_page = 20


@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ['id_curso', 'nombre', 'codigo', 'estado', 'id_docente']
    list_filter = ['estado']
    search_fields = ['nombre', 'codigo']
    list_per_page = 20


@admin.register(Estudiante)
class EstudianteAdmin(admin.ModelAdmin):
    list_display = ['id_estudiante', 'nombre', 'id_curso', 'nota_final', 'get_estado']
    list_filter = ['id_curso']
    search_fields = ['nombre']
    list_per_page = 20
    
    def get_estado(self, obj):
        return obj.estado
    get_estado.short_description = 'Estado'


@admin.register(Actividad)
class ActividadAdmin(admin.ModelAdmin):
    list_display = ['id_actividad', 'nombre', 'tipo', 'id_curso', 'fecha_entrega', 'porcentaje', 'estado']
    list_filter = ['tipo', 'estado', 'id_curso']
    search_fields = ['nombre']
    date_hierarchy = 'fecha_entrega'
    list_per_page = 20