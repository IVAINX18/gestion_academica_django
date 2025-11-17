from django.db import models

class Prediccion(models.Model):
    nombre = models.CharField(max_length=100)
    resultado = models.FloatField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} - {self.resultado:.2f}"
