from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.auth.models import User


# Create your models here.

class Dataset(models.Model):
    name = models.CharField(max_length=32)
    delimiter = models.CharField(max_length=16, default=',')
    s3_key = models.CharField(max_length=256)
    rows_count = models.IntegerField(default=0)
    columns_count = models.IntegerField(default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.s3_key

class Cedent(models.Model):
    ANTECEDENT = 'antecedent'
    SUCCEDENT = 'succedent'

    ROLE_CHOICES = [
        (ANTECEDENT, 'Antecedent'),
        (SUCCEDENT, 'Succedent'),
    ]

    name = models.CharField(max_length=256)
    type = models.CharField(max_length=256)
    min_len = models.IntegerField(validators=[MinValueValidator(1)])
    max_len = models.IntegerField(validators=[MinValueValidator(1)])
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    four_ft_result = models.ForeignKey(
        'FourFtResult',
        on_delete=models.CASCADE,
        related_name='cedents'
    )

class FourFtResult(models.Model):
    name = models.CharField(max_length=128)
    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='four_ft_results'
    )
    base = models.IntegerField(blank=True, null=True)
    confidence = models.FloatField(blank=True, null=True)
    relbase = models.FloatField(blank=True, null=True)
    aad = models.FloatField(blank=True, null=True)
    ante_min_len = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(128)])
    ante_max_len = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(128)])
    succe_min_len = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(128)])
    succe_max_len = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(128)])
    con_dis_antecedent_type = models.CharField(max_length=256)
    con_dis_succedent_type = models.CharField(max_length=256)
