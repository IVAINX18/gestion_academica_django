from rest_framework import serializers
from .models import Docente, Curso, Estudiante, Actividad
from django.db.models import Count, Avg

class DocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Docente
        fields = '__all__'


class CursoSerializer(serializers.ModelSerializer):
    docente_nombre = serializers.SerializerMethodField()
    num_estudiantes = serializers.SerializerMethodField()
    num_actividades = serializers.SerializerMethodField()
    promedio = serializers.SerializerMethodField()
    
    class Meta:
        model = Curso
        fields = '__all__'
    
    def get_docente_nombre(self, obj):
        return obj.id_docente.nombre if obj.id_docente else None
    
    def get_num_estudiantes(self, obj):
        return Estudiante.objects.filter(id_curso=obj.id_curso).count()
    
    def get_num_actividades(self, obj):
        return Actividad.objects.filter(id_curso=obj.id_curso).count()
    
    def get_promedio(self, obj):
        estudiantes = Estudiante.objects.filter(id_curso=obj.id_curso, nota_final__isnull=False)
        if estudiantes.exists():
            promedio = estudiantes.aggregate(Avg('nota_final'))['nota_final__avg']
            return round(float(promedio), 2) if promedio else None
        return None


class EstudianteSerializer(serializers.ModelSerializer):
    curso_nombre = serializers.SerializerMethodField()
    curso_codigo = serializers.SerializerMethodField()
    estado = serializers.CharField(read_only=True)
    
    class Meta:
        model = Estudiante
        fields = '__all__'
    
    def get_curso_nombre(self, obj):
        return obj.id_curso.nombre if obj.id_curso else None
    
    def get_curso_codigo(self, obj):
        return obj.id_curso.codigo if obj.id_curso else None


class ActividadSerializer(serializers.ModelSerializer):
    curso_nombre = serializers.SerializerMethodField()
    curso_codigo = serializers.SerializerMethodField()
    
    class Meta:
        model = Actividad
        fields = '__all__'
    
    def get_curso_nombre(self, obj):
        return obj.id_curso.nombre if obj.id_curso else None
    
    def get_curso_codigo(self, obj):
        return obj.id_curso.codigo if obj.id_curso else None