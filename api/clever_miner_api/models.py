from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class DataSet(models.Model):
    name = models.CharField(max_length=32)
    s3_key = models.CharField(max_length=256)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.s3_key