from django.db import models
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils.text import slugify

class Page(models.Model):
    TYPE_CHOICES = (
        ('base', 'Base Page'),
        ('theme', 'Theme Page'),
    )
    
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        if self.slug == 'index':
            return reverse('home')
        return reverse('page_detail', kwargs={'slug': self.slug})
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Section(models.Model):
    SECTION_TYPES = (
        ('image', 'Image'),
        ('video', 'Video'),
        ('json', 'JSON'),
        ('text', 'Text'),
        ('form', 'Form'),
    )
    
    page = models.ForeignKey(Page, related_name='sections', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=SECTION_TYPES)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.page.name} - {self.name}"

class Element(models.Model):
    section = models.ForeignKey(Section, related_name='elements', on_delete=models.CASCADE)
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    json_content = models.TextField(null=True, blank=True)
    src = models.CharField(max_length=255, null=True, blank=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.section.name} - {self.title or 'Element ' + str(self.id)}"

class EditHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    element = models.ForeignKey(Element, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    previous_value = models.TextField(null=True, blank=True)
    new_value = models.TextField()
    field_name = models.CharField(max_length=50)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Edit histories'
    
    def __str__(self):
        return f"{self.user.username} edited {self.element} on {self.timestamp}"
