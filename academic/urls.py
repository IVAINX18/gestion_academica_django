from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para ViewSets (genera rutas automáticas)
router = DefaultRouter()
router.register(r'cursos', views.CursoViewSet, basename='curso')
router.register(r'estudiantes', views.EstudianteViewSet, basename='estudiante')
router.register(r'actividades', views.ActividadViewSet, basename='actividad')

urlpatterns = [
    # API REST Framework
    path('api/', include(router.urls)),
    
    # Endpoints personalizados
    path('api/reportes/', views.reportes, name='reportes'),
    path('api/exportar/', views.exportar_excel, name='exportar'),
]