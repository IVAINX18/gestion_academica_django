from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('historial/', views.historial, name='historial'),
]
