from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


# Create your models here.

class StorageFile(models.Model):
    """
    Represents a file stored either in local storage or S3.
    Used by Dataset and FourFtResult models to track their associated files.
    """
    LOCAL = 'local'
    S3 = 's3'
    
    STORAGE_TYPE_CHOICES = [
        (LOCAL, 'Local Storage'),
        (S3, 'S3 Storage'),
    ]
    
    file_path = models.CharField(max_length=512)
    storage_type = models.CharField(max_length=10, choices=STORAGE_TYPE_CHOICES, default=S3)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.storage_type}:{self.file_path}"


class Dataset(models.Model):
    name = models.CharField(max_length=32)
    delimiter = models.CharField(max_length=16, default=',')
    storage_file = models.OneToOneField(
        StorageFile, 
        on_delete=models.CASCADE, 
        null=False,
        blank=False, 
        related_name='dataset'
    )
    rows_count = models.IntegerField(default=0)
    columns_count = models.IntegerField(default=0)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='datasets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.s3_key

class Cedent(models.Model):
    ANTECEDENT = 'antecedent'
    SUCCEDENT = 'succedent'
    CONDITION = 'condition'

    ROLE_CHOICES = [
        (ANTECEDENT, 'Antecedent'),
        (SUCCEDENT, 'Succedent'),
        (CONDITION, 'Condition'),
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
    name = models.CharField(max_length=128, null=False, blank=False)
    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='four_ft_results'
    )
    dataset_name = models.CharField(max_length=256, null=False, blank=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='four_ft_results')
    storage_file = models.OneToOneField(
        StorageFile, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='four_ft_result'
    )
    rules_count = models.IntegerField(null=False)
    # parameters
    base = models.IntegerField(blank=True, null=True)
    confidence = models.FloatField(blank=True, null=True)
    rel_base = models.FloatField(blank=True, null=True)
    aad = models.FloatField(blank=True, null=True)
    ante_min_len = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(128)])
    ante_max_len = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(128)])
    succe_min_len = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(128)])
    succe_max_len = models.IntegerField(null=False, validators=[MinValueValidator(1), MaxValueValidator(128)])
    con_dis_antecedent_type = models.CharField(max_length=256)
    con_dis_succedent_type = models.CharField(max_length=256)
    con_dis_condition_type = models.CharField(max_length=256, null=True, blank=True)
    # Condition length parameters
    cond_min_len = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(128)])
    cond_max_len = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(128)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
