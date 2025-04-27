from django import forms
from .models import Element, Section, Page

class ElementForm(forms.ModelForm):
    class Meta:
        model = Element
        fields = ['title', 'description', 'json_content', 'src', 'order']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 5}),
            'json_content': forms.Textarea(attrs={'rows': 10, 'class': 'json-editor'}),
        }

class SectionForm(forms.ModelForm):
    class Meta:
        model = Section
        fields = ['name', 'type', 'order']

class PageForm(forms.ModelForm):
    class Meta:
        model = Page
        fields = ['name', 'type', 'slug']
